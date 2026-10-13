// SignUp.tsx
import { useState, type FormEvent } from 'react'
import { useAuth } from '../AuthContext'
import { tAuth, type Lang } from '../authI18n'
import '../css/WelcomeScreen.css'

interface Props {
  lang?: Lang
  onBack: () => void
  onSignIn: () => void
}

export function SignUp({ lang = 'vi', onBack, onSignIn }: Props) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = (key: string) => tAuth(key, lang)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name || !email || !pw || !confirm) return setError(t('err.required'))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('err.email'))
    if (pw.length < 8) return setError(t('err.pwShort'))
    if (pw !== confirm) return setError(t('err.pwMismatch'))
    if (!agree) return setError(t('err.terms'))

    setLoading(true)
    try {
      const username = email.split('@')[0].replace(/[^a-z0-9_]/gi, '') + '_' + Math.random().toString(36).slice(-4)
      await register({ username, email, password: pw, displayName: name })
      // AuthContext.user update → App chuyển sang game
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
          <div className="login-header-block">
            <h1 className="login-header-title">{t('reg.title')}</h1>
            <p className="login-header-sub">{t('reg.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="login-body">
        {error && (
          <div className="login-error">
            <span style={{ fontSize: 15, lineHeight: 1.3 }}>⚠️</span>
            <p className="login-error-text">{error}</p>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="reg-name">{t('reg.name')}</label>
            <div className="login-input-wrap">
              <input
                id="reg-name"
                className="login-input"
                type="text"
                placeholder={t('reg.namePh')}
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="reg-email">{t('reg.email')}</label>
            <div className="login-input-wrap">
              <input
                id="reg-email"
                className="login-input"
                type="email"
                autoComplete="email"
                placeholder={t('reg.emailPh')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="reg-pw">{t('reg.password')}</label>
            <div className="login-input-wrap">
              <input
                id="reg-pw"
                className="login-input"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('reg.passwordPh')}
                value={pw}
                onChange={e => setPw(e.target.value)}
                disabled={loading}
              />
              <button type="button" className="login-input-toggle" onClick={() => setShowPw(s => !s)}>
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="reg-confirm">{t('reg.confirm')}</label>
            <div className="login-input-wrap">
              <input
                id="reg-confirm"
                className="login-input"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('reg.confirmPh')}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                disabled={loading}
              />
              <button type="button" className="login-input-toggle" onClick={() => setShowPw(s => !s)}>
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <label className="register-terms">
            <span
              className={`register-checkbox ${agree ? 'checked' : ''}`}
              onClick={e => { e.preventDefault(); setAgree(a => !a) }}
            >
              {agree && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="register-terms-text">
              {t('reg.agree')}{' '}
              <a href="#" className="register-terms-link" onClick={e => e.preventDefault()}>{t('reg.terms')}</a>
              {' '}{t('reg.and')}{' '}
              <a href="#" className="register-terms-link" onClick={e => e.preventDefault()}>{t('reg.privacy')}</a>
            </span>
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? t('reg.submitting') : t('reg.submit')}
          </button>
        </form>

        <p className="login-register-row">
          {t('reg.hasAccount')}{' '}
          <button type="button" className="login-register-btn" onClick={onSignIn}>
            {t('reg.loginLink')}
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