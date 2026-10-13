// LoginScreen.tsx
import { useState } from 'react'
import { useAuth } from '../AuthContext'
import '../css/WelcomeScreen.css'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { ForgotPassword } from './ForgotPassword'
import { ForgotSuccess } from './ForgotSuccess'
import { tAuth, type Lang } from '../authI18n'

type Screen = 'welcome' | 'signin' | 'signup' | 'forgot' | 'forgot-success'

interface Props {
  lang?: Lang
  onLangChange?: (lang: Lang) => void
}

export function LoginScreen({ lang = 'vi', onLangChange }: Props) {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [forgotEmail, setForgotEmail] = useState('')
  const { user } = useAuth()

  const t = (key: string) => tAuth(key, lang)

  // Nếu đã login → không hiển thị gì (App sẽ chuyển sang game)
  if (user) return null

  if (screen === 'signin') {
    return (
      <SignIn
        lang={lang}
        onBack={() => setScreen('welcome')}
        onRegister={() => setScreen('signup')}
        onForgot={() => setScreen('forgot')}
      />
    )
  }

  if (screen === 'signup') {
    return (
      <SignUp
        lang={lang}
        onBack={() => setScreen('welcome')}
        onSignIn={() => setScreen('signin')}
      />
    )
  }

  if (screen === 'forgot') {
    return (
      <ForgotPassword
        lang={lang}
        onBack={() => setScreen('signin')}
        onSent={(email) => {
          setForgotEmail(email)
          setScreen('forgot-success')
        }}
        onSignIn={() => setScreen('signin')}
      />
    )
  }

  if (screen === 'forgot-success') {
    return (
      <ForgotSuccess
        lang={lang}
        email={forgotEmail}
        onBack={() => setScreen('forgot')}
        onSignIn={() => setScreen('signin')}
      />
    )
  }

  // Welcome (mặc định)
  return (
    <div className="welcome-root">
      <div className="welcome-header">
        {/* Language toggle button */}
        <button
          onClick={() => onLangChange?.(lang === 'vi' ? 'en' : 'vi')}
          style={{
            position: 'absolute',
            top: 50,
            right: 16,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: 20,
            cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: 'white',
          }}
        >
          <span style={{ fontSize: 14 }}>{lang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
          <span>{lang === 'vi' ? 'VI' : 'EN'}</span>
        </button>

        <div className="welcome-logo-1">
          <div className="welcome-logo-1-1">
            <div className="welcome-logo-1-2">
              <div className="welcome-logo-1-3">文</div>
            </div>
          </div>
        </div>
        <h1 className="welcome-title">
          <span className="welcome-title-1">{t('welcome.title1')}</span>
          <span className="welcome-title-2">{t('welcome.title2')}</span>
        </h1>
        <p className="welcome-subtitle">{t('welcome.subtitle')}</p>
      </div>

      <div className="welcome-avatar-wrap">
        <div className="welcome-avatar-card">
          <img
            src="/0a7b7d3b62ac830ce25034244bcea8f67487e9a9.png"
            alt="Văn Đồng"
            style={{ width: '90%', height: '90%', objectFit: 'contain' }}
          />
        </div>
      </div>

      <div className="welcome-body">
        <h2 className="welcome-greeting">{t('welcome.greeting')}</h2>
        <p className="welcome-desc">{t('welcome.desc')}</p>

        <div className="welcome-actions">
          <button className="btn-primary" onClick={() => setScreen('signin')}>
            {t('welcome.login')}
          </button>
          <button className="btn-secondary" onClick={() => setScreen('signup')}>
            {t('welcome.register')}
          </button>
          <p className="welcome-footer">{t('welcome.terms')}</p>
          <p className="welcome-version">{t('welcome.version')}</p>
        </div>
      </div>
    </div>
  )
}