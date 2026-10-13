// AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type AuthUser } from './authApi'

interface Ctx {
  user: AuthUser | null
  loading: boolean
  login: (u: string, p: string, remember?: boolean) => Promise<void>
  register: (d: { username: string; email: string; password: string; displayName?: string }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (d: { displayName?: string; avatarUrl?: string }) => Promise<void>
  enterAsGuest: () => void
  refreshUser: () => Promise<void>
}

const C = createContext<Ctx | null>(null)
const GUEST: AuthUser = {
  id: 0, username: 'guest', email: '', displayName: 'Khách',
  role: 'guest', status: 'active', emailVerified: false,
  createdAt: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        setUser(await authApi.me())
      } catch (error) {
        console.error('Không thể khôi phục phiên đăng nhập:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = async (username: string, password: string, remember = true) => {
    const { user } = await authApi.login({ username, password, rememberMe: remember })
    setUser(user)
  }
  const register = async (d: { username: string; email: string; password: string; displayName?: string }) => {
    await authApi.register(d)
    const { user } = await authApi.login({ username: d.username, password: d.password, rememberMe: true })
    setUser(user)
  }
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Không thể kết thúc phiên trên máy chủ; đã xóa phiên cục bộ:', error)
    } finally {
      setUser(null)
    }
  }
  const updateProfile = async (d: { displayName?: string; avatarUrl?: string }) => {
    const u = await authApi.updateProfile(d); setUser(u)
  }
  const enterAsGuest = () => setUser(GUEST)
  const refreshUser = async () => setUser(await authApi.me())

  return (
    <C.Provider value={{ user, loading, login, register, logout, updateProfile, enterAsGuest, refreshUser }}>
      {children}
    </C.Provider>
  )
}

export function useAuth() {
  const v = useContext(C)
  if (!v) throw new Error('useAuth must be inside AuthProvider')
  return v
}