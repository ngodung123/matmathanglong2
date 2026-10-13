// ForgotPassword.tsx
import { useState, type FormEvent } from 'react'
import { authApi } from '../authApi'
import { tAuth, type Lang } from '../authI18n'
import '../css/WelcomeScreen.css'

interface Props {
  lang?: Lang
  onBack: () => void
  onSent: (email: string) => void
  onSignIn: () => void
}

export function ForgotPassword({ lang = 'vi', onBack, onSent, onSignIn }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = (key: string) => tAuth(key, lang)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email) return setError(t('err.required'))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('err.email'))

    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      onSent(email)
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
        </div>
        <div className="login-header-row">
          <button className="login-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="login-header-title">{t('forgot.title')}</h1>
        </div>
      </div>

      <div className="login-body forgot-body">
        <div className="forgot-avatar-wrap">
          <div className="forgot-avatar-card">
            <img src="/0a7b7d3b62ac830ce25034244bcea8f67487e9a9.png" alt="Văn Đồng" />
          </div>
        </div>

        <h2 className="forgot-title">{t('forgot.subtitle')}</h2>
        <p className="forgot-desc">{t('forgot.desc')}</p>

        {error && (
          <div className="login-error" style={{ marginTop: 8, width: '100%' }}>
            <span style={{ fontSize: 15, lineHeight: 1.3 }}>⚠️</span>
            <p className="login-error-text">{error}</p>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} style={{ width: '100%', marginTop: 12 }}>
          <div className="login-field">
            <label className="login-label" htmlFor="forgot-email">{t('forgot.email')}</label>
            <div className="login-input-wrap">
              <input
                id="forgot-email"
                className="login-input"
                type="email"
                placeholder={t('forgot.emailPh')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? t('forgot.submitting') : t('forgot.submit')}
          </button>

          <div className="forgot-note">
            <span style={{ fontSize: 14, lineHeight: 1.4 }}>💡</span>
            <p className="forgot-note-text">{t('forgot.note')}</p>
          </div>
        </form>

        <div className="forgot-spacer" />

        <p className="login-register-row" style={{ marginTop: 20 }}>
          {t('forgot.back')}{' '}
          <button type="button" className="login-register-btn" onClick={onSignIn}>
            {t('forgot.backLink')}
          </button>
        </p>
      </div>
    </div>
  )
}