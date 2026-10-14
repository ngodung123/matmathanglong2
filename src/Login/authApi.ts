export type AuthRole = 'guest' | 'player' | 'admin'

export interface AuthUser {
  id: number
  username: string
  email: string
  displayName: string
  avatarUrl?: string | null
  role: AuthRole
  status: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string | null
  totalXP?: number
  checkpointsCompleted?: number
  collectiblesFound?: number
  cluesFound?: number
}

export interface LoginPayload {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  displayName?: string
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const ACCESS_TOKEN_KEY = 'mat_ma_thang_long_access_token'
const REFRESH_TOKEN_KEY = 'mat_ma_thang_long_refresh_token'

function readStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

function getAccessToken() {
  return readStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null
}

function setAccessToken(token: string | null) {
  const storage = readStorage()
  if (!storage) return
  if (token) storage.setItem(ACCESS_TOKEN_KEY, token)
  else storage.removeItem(ACCESS_TOKEN_KEY)
}

function getRefreshToken() {
  return readStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null
}

function setRefreshToken(token: string | null) {
  const storage = readStorage()
  if (!storage) return
  if (token) storage.setItem(REFRESH_TOKEN_KEY, token)
  else storage.removeItem(REFRESH_TOKEN_KEY)
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {})

  if (!(options.body instanceof FormData) && !headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || `Request failed (${response.status})`)
  }

  return payload as T
}

function persistTokens(accessToken: string | null, refreshToken: string | null) {
  if (accessToken) setAccessToken(accessToken)
  else setAccessToken(null)

  if (refreshToken) setRefreshToken(refreshToken)
  else setRefreshToken(null)
}

export const authApi = {
  async login(input: LoginPayload) {
    const data = await apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    persistTokens(data.accessToken, data.refreshToken)
    return data
  },

  async register(input: RegisterPayload) {
    const data = await apiRequest<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    return data
  },

  async logout() {
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
      }
    } finally {
      persistTokens(null, null)
    }
  },

  async me() {
    const data = await apiRequest<{ user: AuthUser }>('/api/auth/me')
    return data.user
  },

  async updateProfile(input: { displayName?: string; avatarUrl?: string }) {
    const data = await apiRequest<{ user: AuthUser }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })

    return data.user
  },

  async forgotPassword(email: string) {
    await apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    return true
  },

  async googleLogin(email: string, displayName?: string) {
    const data = await apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, displayName }),
    })

    persistTokens(data.accessToken, data.refreshToken)
    return data
  },

  async refreshSession() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available')

    const data = await apiRequest<{ accessToken: string }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })

    persistTokens(data.accessToken, refreshToken)
    return data.accessToken
  },
}
