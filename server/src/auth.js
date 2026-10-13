import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { pool } from './db.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-access-secret-change-me'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me'
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_DAYS = 7
const BCRYPT_ROUNDS = 10

// ─── Helpers ─────────────────────────────────────────────

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function toAuthUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.display_name || row.username,
    avatarUrl: row.avatar_url || null,
    role: row.role,
    status: row.status,
    emailVerified: Boolean(row.email_verified),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    lastLoginAt: row.last_login_at
      ? (row.last_login_at instanceof Date ? row.last_login_at.toISOString() : row.last_login_at)
      : null,
  }
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  )
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` }
  )
}

async function saveRefreshToken(userId, refreshToken, req) {
  const tokenHash = sha256(refreshToken)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
  const deviceInfo = (req.headers['user-agent'] || '').slice(0, 255)
  const ipAddress = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '').slice(0, 45)

  await pool.query(
    `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, deviceInfo, ipAddress, expiresAt]
  )
}

async function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET)
    const tokenHash = sha256(token)
    const [rows] = await pool.query(
      `SELECT * FROM user_sessions
       WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    )
    if (!rows[0]) return null
    return { userId: payload.sub, sessionId: rows[0].id }
  } catch {
    return null
  }
}

async function revokeRefreshToken(token) {
  const tokenHash = sha256(token)
  await pool.query(
    `UPDATE user_sessions SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL`,
    [tokenHash]
  )
}

// ─── Middleware ──────────────────────────────────────────

export function authenticate(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing access token' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    req.username = payload.username
    req.role = payload.role
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' })
  }
}

// ─── Routes ──────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body || {}
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const [existing] = await pool.query(
      `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
      [username, email]
    )
    if (existing[0]) {
      return res.status(409).json({ error: 'Username or email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, role, status, email_verified)
       VALUES (?, ?, ?, ?, 'player', 'active', 0)`,
      [username, email, passwordHash, displayName || username]
    )

    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [result.insertId])
    res.status(201).json({ user: toAuthUser(rows[0]) })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' })
    }

    const [rows] = await pool.query(
      `SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1`,
      [username, username]
    )
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.status === 'banned') return res.status(403).json({ error: 'Account is banned' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id])

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)
    await saveRefreshToken(user.id, refreshToken, req)

    res.json({
      accessToken,
      refreshToken,
      user: toAuthUser({ ...user, last_login_at: new Date() }),
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {}
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' })

    const session = await verifyRefreshToken(refreshToken)
    if (!session) return res.status(401).json({ error: 'Invalid or expired refresh token' })

    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [session.userId])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'User not found' })

    const accessToken = signAccessToken(user)
    res.json({ accessToken })
  } catch (err) {
    console.error('[refresh]', err)
    res.status(500).json({ error: 'Refresh failed' })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || {}
    if (refreshToken) await revokeRefreshToken(refreshToken)
    res.json({ ok: true })
  } catch (err) {
    console.error('[logout]', err)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE id = ? LIMIT 1`,
      [req.userId]
    )
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: toAuthUser(user) })
  } catch (err) {
    console.error('[me]', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// PATCH /api/auth/profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body || {}
    const updates = []
    const values = []
    if (displayName !== undefined) { updates.push('display_name = ?'); values.push(displayName) }
    if (avatarUrl !== undefined) { updates.push('avatar_url = ?'); values.push(avatarUrl) }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' })

    values.push(req.userId)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [req.userId])
    res.json({ user: toAuthUser(rows[0]) })
  } catch (err) {
    console.error('[profile]', err)
    res.status(500).json({ error: 'Update failed' })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: 'email is required' })
    // TODO: gửi email reset password
    res.json({ ok: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    res.status(500).json({ error: 'Request failed' })
  }
})

// POST /api/auth/google (stub — dùng khi chưa tích hợp Google OAuth thật)
router.post('/google', async (req, res) => {
  try {
    const { email, displayName } = req.body || {}
    if (!email) return res.status(400).json({ error: 'email is required' })

    let [rows] = await pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email])
    let user = rows[0]

    if (!user) {
      const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000)
      const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), BCRYPT_ROUNDS)
      const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, display_name, role, status, email_verified)
         VALUES (?, ?, ?, ?, 'player', 'active', 1)`,
        [username, email, passwordHash, displayName || username]
      )
      const [newRows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [result.insertId])
      user = newRows[0]
    }

    await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id])

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)
    await saveRefreshToken(user.id, refreshToken, req)

    res.json({ accessToken, refreshToken, user: toAuthUser(user) })
  } catch (err) {
    console.error('[google]', err)
    res.status(500).json({ error: 'Google login failed' })
  }
})

export default router