// server.ts
// npm i express cors bcryptjs jsonwebtoken mysql2 dotenv
// npm i -D @types/express @types/cors @types/bcryptjs @types/jsonwebtoken tsx
// chạy: npx tsx server.ts

import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// ─── Config ──────────────────────────────────────────────
const JWT_SECRET        = process.env.JWT_SECRET || 'thanglong-secret-change-me'
const ACCESS_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_D = 30
const BCRYPT_ROUNDS     = 10
const PORT              = Number(process.env.PORT) || 3001

// ─── DB (dùng chung mat_ma_thang_long) ───────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'Dungbk123@',
  database: process.env.DB_NAME     || 'mat_ma_thang_long',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
})

// ─── Helpers ─────────────────────────────────────────────
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')
const genToken = () => crypto.randomBytes(32).toString('hex')

const signAccess = (u: { id: number; username: string; role: string }) =>
  jwt.sign({ sub: u.id, username: u.username, role: u.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN })

const toUser = (r: any) => ({
  id: r.id,
  username: r.username,
  email: r.email,
  displayName: r.display_name,
  avatarUrl: r.avatar_url,
  role: r.role,
  status: r.status,
  emailVerified: !!r.email_verified,
  lastLoginAt: r.last_login_at,
  createdAt: r.created_at,
})

async function recordAttempt(identifier: string, success: boolean, ip?: string, ua?: string) {
  try {
    await pool.execute(
      `INSERT INTO login_attempts (identifier, success, ip_address, user_agent) VALUES (?,?,?,?)`,
      [identifier, success, ip ?? null, ua ?? null]
    )
  } catch {}
}

async function tooManyAttempts(identifier: string, ip?: string) {
  const [rows]: any = await pool.execute(
    `SELECT COUNT(*) cnt FROM login_attempts
     WHERE success=0 AND created_at > (NOW() - INTERVAL 15 MINUTE)
       AND (identifier=? OR ip_address=?)`,
    [identifier, ip ?? '']
  )
  return Number(rows[0].cnt) >= 8
}

// ─── Auth middleware ─────────────────────────────────────
interface AuthedReq extends express.Request {
  user?: { id: number; username: string; role: string }
}
function requireAuth(req: AuthedReq, res: express.Response, next: express.NextFunction) {
  const h = req.headers.authorization || ''
  const t = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!t) return res.status(401).json({ error: 'Missing token' })
  try {
    const p = jwt.verify(t, JWT_SECRET) as any
    req.user = { id: p.sub, username: p.username, role: p.role }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
const requireRole = (roles: string[]) =>
  (req: AuthedReq, res: express.Response, next: express.NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }

// ═════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═════════════════════════════════════════════════════════

// ─── POST /api/auth/register ─────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, displayName } = req.body ?? {}

  if (!username || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username))
    return res.status(400).json({ error: 'Tên đăng nhập không hợp lệ' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Email không hợp lệ' })
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Mật khẩu phải từ 6 ký tự' })

  try {
    const [dup]: any = await pool.execute(
      `SELECT id FROM users WHERE username=? OR email=? LIMIT 1`,
      [username, email]
    )
    if (dup.length) return res.status(409).json({ error: 'Tên đăng nhập hoặc email đã tồn tại' })

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const [ins]: any = await pool.execute(
      `INSERT INTO users (username,email,password_hash,display_name,role) VALUES (?,?,?,?,'player')`,
      [username, email, hash, displayName?.trim() || username]
    )
    await pool.execute(`INSERT INTO user_progress (user_id) VALUES (?)`, [ins.insertId])

    const [rows]: any = await pool.execute(`SELECT * FROM users WHERE id=?`, [ins.insertId])
    return res.status(201).json({ user: toUser(rows[0]) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Đăng ký thất bại' })
  }
})

// ─── POST /api/auth/login ────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password, rememberMe } = req.body ?? {}
  const ip = req.ip, ua = req.headers['user-agent']

  if (!username || !password) return res.status(400).json({ error: 'Thiếu thông tin' })

  if (await tooManyAttempts(username, ip))
    return res.status(429).json({ error: 'Quá nhiều lần thử, đợi 15 phút' })

  const [rows]: any = await pool.execute(
    `SELECT * FROM users WHERE username=? OR email=? LIMIT 1`,
    [username, username]
  )
  if (!rows.length) {
    await recordAttempt(username, false, ip, ua)
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' })
  }
  const user = rows[0]
  if (user.status === 'banned')
    return res.status(403).json({ error: 'Tài khoản đã bị khóa' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) {
    await recordAttempt(username, false, ip, ua)
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' })
  }

  await recordAttempt(username, true, ip, ua)
  await pool.execute(`UPDATE users SET last_login_at=NOW() WHERE id=?`, [user.id])

  const accessToken = signAccess({ id: user.id, username: user.username, role: user.role })
  const refreshRaw  = genToken()
  const refreshHash = sha256(refreshRaw)
  const days = rememberMe ? REFRESH_EXPIRES_D : 1
  await pool.execute(
    `INSERT INTO user_sessions (user_id,token_hash,device_info,ip_address,expires_at)
     VALUES (?,?,?,?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [user.id, refreshHash, ua ?? null, ip ?? null, days]
  )

  return res.json({ accessToken, refreshToken: refreshRaw, user: toUser(user) })
})

// ─── POST /api/auth/refresh ──────────────────────────────
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body ?? {}
  if (!refreshToken) return res.status(400).json({ error: 'Thiếu refresh token' })

  const hash = sha256(refreshToken)
  const [rows]: any = await pool.execute(
    `SELECT s.*, u.username, u.role, u.status
     FROM user_sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>NOW()
     LIMIT 1`,
    [hash]
  )
  if (!rows.length) return res.status(401).json({ error: 'Refresh token không hợp lệ' })
  const s = rows[0]
  if (s.status === 'banned') return res.status(403).json({ error: 'Tài khoản đã bị khóa' })

  return res.json({
    accessToken: signAccess({ id: s.user_id, username: s.username, role: s.role }),
  })
})

// ─── POST /api/auth/logout ───────────────────────────────
app.post('/api/auth/logout', async (req, res) => {
  const { refreshToken } = req.body ?? {}
  if (refreshToken) {
    await pool.execute(
      `UPDATE user_sessions SET revoked_at=NOW() WHERE token_hash=? AND revoked_at IS NULL`,
      [sha256(refreshToken)]
    )
  }
  res.json({ ok: true })
})

// ─── GET /api/auth/me ────────────────────────────────────
app.get('/api/auth/me', requireAuth, async (req: AuthedReq, res) => {
  const [rows]: any = await pool.execute(
    `SELECT u.*, p.total_xp, p.checkpoints_completed, p.collectibles_found, p.clues_found
     FROM users u LEFT JOIN user_progress p ON p.user_id=u.id
     WHERE u.id=?`,
    [req.user!.id]
  )
  if (!rows.length) return res.status(404).json({ error: 'User không tồn tại' })
  const u = rows[0]
  return res.json({
    user: {
      ...toUser(u),
      totalXP: u.total_xp ?? 0,
      checkpointsCompleted: u.checkpoints_completed ?? 0,
      collectiblesFound: u.collectibles_found ?? 0,
      cluesFound: u.clues_found ?? 0,
    },
  })
})

// ─── PATCH /api/auth/profile ─────────────────────────────
app.patch('/api/auth/profile', requireAuth, async (req: AuthedReq, res) => {
  const { displayName, avatarUrl } = req.body ?? {}
  const sets: string[] = [], vals: any[] = []
  if (typeof displayName === 'string' && displayName.trim()) { sets.push('display_name=?'); vals.push(displayName.trim()) }
  if (typeof avatarUrl === 'string') { sets.push('avatar_url=?'); vals.push(avatarUrl) }
  if (!sets.length) return res.status(400).json({ error: 'Không có gì để cập nhật' })

  vals.push(req.user!.id)
  await pool.execute(`UPDATE users SET ${sets.join(',')} WHERE id=?`, vals)
  const [rows]: any = await pool.execute(`SELECT * FROM users WHERE id=?`, [req.user!.id])
  return res.json({ user: toUser(rows[0]) })
})

// ─── POST /api/auth/forgot-password ──────────────────────
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body ?? {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Email không hợp lệ' })

  const [rows]: any = await pool.execute(`SELECT id FROM users WHERE email=? LIMIT 1`, [email])
  if (rows.length) {
    const raw = genToken()
    await pool.execute(
      `INSERT INTO password_resets (user_id,token_hash,expires_at)
       VALUES (?,?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))`,
      [rows[0].id, sha256(raw)]
    )
    console.log(`[RESET] ${email} → /reset-password?token=${raw}`)
  }
  // luôn ok để tránh enumerate user
  res.json({ ok: true })
})

// ─── POST /api/auth/reset-password ───────────────────────
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body ?? {}
  if (!token || !newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ' })

  const [rows]: any = await pool.execute(
    `SELECT * FROM password_resets
     WHERE token_hash=? AND used_at IS NULL AND expires_at>NOW() LIMIT 1`,
    [sha256(token)]
  )
  if (!rows.length) return res.status(400).json({ error: 'Token hết hạn hoặc không hợp lệ' })

  const r = rows[0]
  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  await pool.execute(`UPDATE users SET password_hash=? WHERE id=?`, [hash, r.user_id])
  await pool.execute(`UPDATE password_resets SET used_at=NOW() WHERE id=?`, [r.id])
  await pool.execute(
    `UPDATE user_sessions SET revoked_at=NOW() WHERE user_id=? AND revoked_at IS NULL`,
    [r.user_id]
  )
  res.json({ ok: true })
})

// ─── ADMIN: GET users ────────────────────────────────────
app.get('/api/admin/users', requireAuth, requireRole(['admin']), async (_req, res) => {
  const [rows]: any = await pool.execute(
    `SELECT u.id,u.username,u.email,u.display_name,u.role,u.status,u.created_at,u.last_login_at,
            p.total_xp,p.checkpoints_completed,p.collectibles_found
     FROM users u LEFT JOIN user_progress p ON p.user_id=u.id
     ORDER BY u.created_at DESC`
  )
  res.json({ users: rows })
})

// ─── ADMIN: PATCH user ───────────────────────────────────
app.patch('/api/admin/users/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id)
  const { role, status } = req.body ?? {}
  const sets: string[] = [], vals: any[] = []
  if (role && ['player','admin','guest'].includes(role)) { sets.push('role=?'); vals.push(role) }
  if (status && ['active','banned','pending'].includes(status)) { sets.push('status=?'); vals.push(status) }
  if (!sets.length) return res.status(400).json({ error: 'Không có gì để cập nhật' })

  vals.push(id)
  await pool.execute(`UPDATE users SET ${sets.join(',')} WHERE id=?`, vals)
  res.json({ ok: true })
})
// ─── POST /api/auth/google (mock OAuth) ──────────────────
app.post('/api/auth/google', async (req, res) => {
  const { email, displayName } = req.body ?? {}
  if (!email) return res.status(400).json({ error: 'Thiếu email' })

  try {
    // Check user tồn tại chưa
    let [rows]: any = await pool.execute(`SELECT * FROM users WHERE email=? LIMIT 1`, [email])
    let user

    if (rows.length === 0) {
      // Tạo mới
      const username = email.split('@')[0] + '_' + Date.now().toString(36).slice(-4)
      const hash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), BCRYPT_ROUNDS)
      const [ins]: any = await pool.execute(
        `INSERT INTO users (username,email,password_hash,display_name,role,email_verified)
         VALUES (?,?,?,?,'player',TRUE)`,
        [username, email, hash, displayName || username]
      )
      await pool.execute(`INSERT INTO user_progress (user_id) VALUES (?)`, [ins.insertId])
      const [r]: any = await pool.execute(`SELECT * FROM users WHERE id=?`, [ins.insertId])
      user = r[0]
    } else {
      user = rows[0]
    }

    if (user.status === 'banned')
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' })

    await pool.execute(`UPDATE users SET last_login_at=NOW() WHERE id=?`, [user.id])

    const accessToken = signAccess({ id: user.id, username: user.username, role: user.role })
    const refreshRaw = genToken()
    await pool.execute(
      `INSERT INTO user_sessions (user_id,token_hash,device_info,ip_address,expires_at)
       VALUES (?,?,?,?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [user.id, sha256(refreshRaw), req.headers['user-agent'] ?? null, req.ip ?? null, 30]
    )

    return res.json({ accessToken, refreshToken: refreshRaw, user: toUser(user) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Google login failed' })
  }
})
// ─── Health ──────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }) }
  catch { res.status(500).json({ ok: false }) }
})

app.listen(PORT, () => console.log(`🔐 API on http://localhost:${PORT}`))