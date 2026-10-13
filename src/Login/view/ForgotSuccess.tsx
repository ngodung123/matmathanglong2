// ForgotSuccess.tsx
import { tAuth, type Lang } from '../authI18n'
import '../css/WelcomeScreen.css'

interface Props {
  lang?: Lang
  email: string
  onBack: () => void
  onSignIn: () => void
}

export function ForgotSuccess({ lang = 'vi', email, onBack, onSignIn }: Props) {
  const t = (key: string) => tAuth(key, lang)

  return (
    <div className="login-root">
      <div className="login-header">
        <div className="status-bar">
          <span className="status-bar-time">9:41</span>
        </div>
      </div>

      <div className="login-body forgot-body">
        <div className="success-check">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="#3D8A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="success-title">{t('forgot.okTitle')}</h2>
        <p className="success-desc">{t('forgot.okDesc')}</p>
        <p className="success-email">{email || 'ten@email.com'}</p>

        <div className="success-steps">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="success-step">
              <div className="success-step-num">{n}</div>
              <p className="success-step-text">{t(`forgot.step${n}`)}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="login-submit"
          onClick={() => window.location.href = 'mailto:'}
          style={{ marginTop: 20 }}
        >
          {t('forgot.openMail')}
        </button>

        <p className="login-register-row" style={{ marginTop: 16 }}>
          {t('forgot.notReceived')}{' '}
          <button type="button" className="login-register-btn" onClick={onBack}>{t('forgot.resend')}</button>
        </p>
      </div>
    </div>
  )
}