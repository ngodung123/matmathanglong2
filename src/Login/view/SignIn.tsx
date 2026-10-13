// SignIn.tsx
import { useState, type FormEvent } from 'react'
import { useAuth } from '../AuthContext'
import { authApi } from '../authApi'
import { tAuth, type Lang } from '../authI18n'
import '../css/WelcomeScreen.css'

interface Props {
  lang?: Lang
  onBack: () => void
  onRegister: () => void
  onForgot: () => void
}

export function SignIn({ lang = 'vi', onBack, onRegister, onForgot }: Props) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = (key: string) => tAuth(key, lang)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !pw) return setError(t('err.required'))
    setLoading(true)
    try {
      await login(email, pw, true)
      // AuthContext.user update → App tự chuyển sang game
    } catch (err: any) {
      setError(err.message || t('err.generic'))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setLoading(true)
    try {
      await authApi.googleLogin('google.user@gmail.com', 'Google User')
      // AuthContext chưa tự update khi dùng googleLogin → cần reload hoặc gọi refreshUser
      window.location.reload()
    } catch (err: any) {
      setError(err.message || t('err.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-header">
        <div className="status-bar">
          <span className="status-bar-time">9:41</span>
          <div className="status-bar-icons">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="4" width="3" height="8" rx="1" fill="#fff" opacity="0.5" />
              <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill="#fff" opacity="0.7" />
              <rect x="9" y="1" width="3" height="11" rx="1" fill="#fff" opacity="0.85" />
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#fff" />
            </svg>
          </div>
        </div>
        <div className="login-header-row">
          <button className="login-back-btn" onClick={onBack} aria-label="Quay lại">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="login-header-title">{t('login.title')}</h1>
        </div>
      </div>

      <div className="login-body">
        <div className="login-welcome-card">
          <div className="login-welcome-avatar">
            <img src="/0a7b7d3b62ac830ce25034244bcea8f67487e9a9.png" alt="Văn Đồng" />
          </div>
          <div className="login-welcome-text">
            <p className="login-welcome-title">{t('login.welcome')}</p>
            <p className="login-welcome-sub">{t('login.welcomeSub')}</p>
          </div>
        </div>

        {error && (
          <div className="login-error">
            <span style={{ fontSize: 15, lineHeight: 1.3 }}>⚠️</span>
            <p className="login-error-text">{error}</p>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="signin-email">{t('login.email')}</label>
            <div className="login-input-wrap">
              <input
                id="signin-email"
                className="login-input"
                type="text"
                autoComplete="username"
                placeholder={t('login.emailPh')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="signin-pw">{t('login.password')}</label>
            <div className="login-input-wrap">
              <input
                id="signin-pw"
                className="login-input"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('login.passwordPh')}
                value={pw}
                onChange={e => setPw(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="login-input-toggle"
                onClick={() => setShowPw(s => !s)}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <div className="login-forgot-row">
            <button type="button" className="login-forgot-btn" onClick={onForgot}>
              {t('login.forgot')}
            </button>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">{t('login.or')}</span>
          <div className="login-divider-line" />
        </div>

        <button type="button" className="login-google" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          {t('login.google')}
        </button>

        <p className="login-register-row">
          {t('login.noAccount')}{' '}
          <button type="button" className="login-register-btn" onClick={onRegister}>
            {t('login.registerLink')}
          </button>
        </p>
      </div>
    </div>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="#7A5C4A" strokeWidth="1.8" />
      {open ? (
        <circle cx="12" cy="12" r="3" stroke="#7A5C4A" strokeWidth="1.8" />
      ) : (
        <>
          <circle cx="12" cy="12" r="3" fill="#7A5C4A" />
          <line x1="3" y1="3" x2="21" y2="21" stroke="#7A5C4A" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C41.4 34.6 44 30 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}