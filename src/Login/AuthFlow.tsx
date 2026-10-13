// AuthFlow.tsx
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { tAuth, type Lang } from './authI18n'
import { authApi } from './authApi'

// ─── Design tokens ────────────────────────────────────────
const T = {
  bg: '#FBF3E4',
  card: '#FFFBF0',
  red: '#C1272D', redDark: '#8B0000',
  redBtn: '#B71C1C',
  green: '#3D8A5E', greenDark: '#2D6B48',
  plum: '#4A1040', plumDark: '#3A0830',
  gold: '#D4A017', yellow: '#F5C842',
  ink: '#2D1B14', muted: '#EEE0C4', mutedFg: '#7A5C4A', border: '#E5D5B8',
  D: "'Baloo 2', system-ui, sans-serif",
  UI: "'Be Vietnam Pro', system-ui, sans-serif",
}

type Screen =
  | 'welcome' | 'login' | 'register' | 'forgot' | 'forgot-ok'
  | 'language' | 'adventure' | 'team'

interface Props {
  lang: Lang
  onLangChange: (l: Lang) => void
  onComplete: () => void
}

export function AuthFlow({ lang, onLangChange, onComplete }: Props) {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [pendingEmail, setPendingEmail] = useState('')

  const t = (k: string) => tAuth(k, lang)

  return (
    <div className="flex justify-center items-start min-h-screen py-10" style={{ background: '#E8DCC8' }}>
      <div className="relative overflow-hidden flex flex-col" style={{
        width: 430, height: 932, background: T.bg, borderRadius: 40,
        boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
      }}>
        <div key={screen} className="flex-1 overflow-hidden flex flex-col" style={{ animation: 'fadeSlide 0.3s ease' }}>
          {screen === 'welcome' && (
            <WelcomeScreen t={t} onLogin={() => setScreen('login')} onRegister={() => setScreen('register')} />
          )}
          {screen === 'login' && (
            <LoginScreen t={t} onBack={() => setScreen('welcome')}
              onRegister={() => setScreen('register')}
              onForgot={() => setScreen('forgot')}
              onSuccess={onComplete} />
          )}
          {screen === 'register' && (
            <RegisterScreen t={t} onBack={() => setScreen('welcome')}
              onLogin={() => setScreen('login')}
              onSuccess={() => setScreen('language')} />
          )}
          {screen === 'forgot' && (
            <ForgotScreen t={t} onBack={() => setScreen('login')}
              onSent={(email) => { setPendingEmail(email); setScreen('forgot-ok') }} />
          )}
          {screen === 'forgot-ok' && (
            <ForgotOkScreen t={t} email={pendingEmail} onBack={() => setScreen('login')} />
          )}
          {screen === 'language' && (
            <LanguageScreen t={t} current={lang} onConfirm={(l) => { onLangChange(l); setScreen('adventure') }} />
          )}
          {screen === 'adventure' && (
            <AdventureScreen t={t} onStart={() => setScreen('team')} />
          )}
          {screen === 'team' && (
            <TeamScreen t={t} onNext={onComplete} />
          )}
        </div>
        <style>{`
          @keyframes fadeSlide { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
        `}</style>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// Shared: StatusBar + VanDong + BackButton
// ═════════════════════════════════════════════════════════

function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? '#fff' : T.ink
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 36 }}>
      <span style={{ fontFamily: T.UI, fontSize: 13, fontWeight: 700, color: c }}>9:41</span>
      <div className="flex items-center gap-1">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="4" width="3" height="8" rx="1" fill={c} opacity="0.5" />
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill={c} opacity="0.7" />
          <rect x="9" y="1" width="3" height="11" rx="1" fill={c} opacity="0.85" />
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill={c} />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={c} strokeOpacity="0.4" />
          <rect x="2" y="2" width="17" height="8" rx="2" fill={c} opacity="0.85" />
          <path d="M23 4.5v3a1.5 1.5 0 000-3z" fill={c} opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

function BackBtn({ onClick, light = false }: { onClick: () => void; light?: boolean }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
      style={{ width: 36, height: 36, background: light ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)', border: `1.5px solid ${light ? 'rgba(255,255,255,0.3)' : T.border}`, cursor: 'pointer' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke={light ? 'white' : T.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function VanDongAvatar({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 120 132" fill="none">
      {/* Body — red robe with gold trim */}
      <path d="M28 88 Q28 130 60 130 Q92 130 92 88 L82 68 Q60 78 38 68 Z" fill="#C1272D" />
      {/* Robe gold trim */}
      <path d="M50 74 Q60 84 70 74" stroke={T.gold} strokeWidth="2" fill="none" />
      <line x1="60" y1="84" x2="60" y2="120" stroke={T.gold} strokeWidth="1.5" opacity="0.7" />
      <rect x="42" y="100" width="36" height="6" rx="3" fill={T.yellow} />
      {/* Sleeves */}
      <path d="M40 70 Q18 80 16 98 Q22 102 32 90 Q36 82 40 78 Z" fill="#C1272D" />
      <path d="M80 70 Q102 80 104 98 Q98 102 88 90 Q84 82 80 78 Z" fill="#C1272D" />
      {/* Hands */}
      <ellipse cx="20" cy="98" rx="7" ry="5" fill="#E5B887" transform="rotate(-20 20 98)" />
      <ellipse cx="100" cy="98" rx="7" ry="5" fill="#E5B887" transform="rotate(20 100 98)" />
      {/* Belt */}
      <rect x="30" y="86" width="60" height="12" rx="3" fill="#FFF2C8" stroke={T.gold} strokeWidth="1.5" />
      {/* Collar */}
      <ellipse cx="30" cy="92" rx="4" ry="6" fill={T.yellow} stroke={T.gold} strokeWidth="1" />
      <ellipse cx="90" cy="92" rx="4" ry="6" fill={T.yellow} stroke={T.gold} strokeWidth="1" />
      {/* Neck */}
      <rect x="52" y="56" width="16" height="16" rx="8" fill="#E5B887" />
      {/* Head */}
      <ellipse cx="60" cy="46" rx="22" ry="20" fill="#E5B887" />
      {/* Hair */}
      <path d="M38 42 Q38 26 60 26 Q82 26 82 42" fill="#2D1B14" />
      {/* Conical hat */}
      <path d="M28 42 Q60 4 92 42" fill="#F5DEB3" stroke={T.gold} strokeWidth="1.5" />
      <path d="M26 42 Q60 38 94 42" stroke={T.gold} strokeWidth="2" fill="none" />
      <circle cx="60" cy="14" r="2" fill={T.gold} />
      {/* Eyes */}
      <ellipse cx="52" cy="47" rx="4" ry="3.5" fill="white" />
      <ellipse cx="68" cy="47" rx="4" ry="3.5" fill="white" />
      <circle cx="52" cy="48" r="2.2" fill="#2D1B14" />
      <circle cx="68" cy="48" r="2.2" fill="#2D1B14" />
      <circle cx="52.6" cy="47.2" r="0.8" fill="white" />
      <circle cx="68.6" cy="47.2" r="0.8" fill="white" />
      {/* Mouth */}
      <path d="M56 56 Q60 60 64 56" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="46" cy="53" rx="4" ry="2.5" fill="#FF9B8B" opacity="0.5" />
      <ellipse cx="74" cy="53" rx="4" ry="2.5" fill="#FF9B8B" opacity="0.5" />
      {/* Eyebrows */}
      <path d="M48 42 Q52 40 55 42" stroke="#2D1B14" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M65 42 Q68 40 72 42" stroke="#2D1B14" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ═════════════════════════════════════════════════════════
// 1. WELCOME SCREEN
// ═════════════════════════════════════════════════════════

function WelcomeScreen({ t, onLogin, onRegister }: { t: (k: string) => string; onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header band */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ background: T.plum, paddingTop: 40, paddingBottom: 90 }}>
        {/* Radial rays */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 430 300" preserveAspectRatio="none">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
            const r = a * Math.PI / 180
            return <line key={a} x1={215} y1={150} x2={215 + 400 * Math.cos(r)} y2={150 + 400 * Math.sin(r)} stroke="rgba(245,200,66,0.08)" strokeWidth="1" />
          })}
          {[80, 140, 200].map(r => <circle key={r} cx={215} cy={150} r={r} fill="none" stroke="rgba(245,200,66,0.1)" strokeWidth="1" />)}
        </svg>

        <StatusBar light />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center mt-3">
          <div className="rounded-3xl flex items-center justify-center mb-3"
            style={{ width: 76, height: 76, background: 'rgba(74,16,64,0.6)', border: '2px solid rgba(245,200,66,0.6)' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="14" stroke={T.yellow} strokeWidth="2" />
              <path d="M20 8v3M20 29v3M8 20h3M29 20h3M11.5 11.5l2 2M26.5 26.5l2 2M11.5 28.5l2-2M26.5 13.5l2-2" stroke={T.yellow} strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="4" fill={T.yellow} />
            </svg>
          </div>
          <h1 style={{ fontFamily: T.D, fontSize: 30, fontWeight: 800, color: 'white', lineHeight: 1, textAlign: 'center', letterSpacing: '0.02em' }}>
            {t('welcome.title1')}
          </h1>
          <h1 style={{ fontFamily: T.D, fontSize: 30, fontWeight: 800, color: T.yellow, lineHeight: 1, textAlign: 'center', letterSpacing: '0.02em' }}>
            {t('welcome.title2')}
          </h1>
          <p style={{ fontFamily: T.UI, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 8, textAlign: 'center' }}>
            {t('welcome.subtitle')}
          </p>
        </div>
      </div>

      {/* Van Dong avatar — overlapping */}
      <div className="flex justify-center -mt-16 relative z-10">
        <div className="rounded-3xl flex items-center justify-center"
          style={{ width: 120, height: 120, background: T.card, border: `3px solid ${T.gold}`, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <VanDongAvatar size={100} />
        </div>
      </div>

      {/* Greeting */}
      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-6">
        <h2 style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: T.red, textAlign: 'center', marginBottom: 8 }}>
          {t('welcome.greeting')}
        </h2>
        <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, textAlign: 'center', lineHeight: 1.6, maxWidth: 320 }}>
          {t('welcome.desc')}
        </p>

        <div className="flex-1" />

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button onClick={onLogin} className="w-full rounded-2xl active:translate-y-0.5 transition-all"
            style={{ height: 54, background: `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: 'white', fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 4px 0 ${T.redDark}, 0 8px 20px rgba(183,28,28,0.3)`, cursor: 'pointer' }}>
            {t('welcome.login')}
          </button>
          <button onClick={onRegister} className="w-full rounded-2xl active:translate-y-0.5 transition-all"
            style={{ height: 54, background: T.card, color: T.ink, fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid ${T.border}`, cursor: 'pointer' }}>
            {t('welcome.register')}
          </button>

          <p style={{ fontFamily: T.UI, fontSize: 10.5, color: T.mutedFg, textAlign: 'center', lineHeight: 1.5, marginTop: 8 }}>
            {t('welcome.terms')}
          </p>
          <p style={{ fontFamily: T.UI, fontSize: 9.5, color: T.border, textAlign: 'center', marginTop: 4, letterSpacing: '0.04em' }}>
            {t('welcome.version')}
          </p>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// 2. LOGIN SCREEN
// ═════════════════════════════════════════════════════════

function LoginScreen({ t, onBack, onRegister, onForgot, onSuccess }: {
  t: (k: string) => string; onBack: () => void; onRegister: () => void; onForgot: () => void; onSuccess: () => void
}) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !pw) return setError(t('err.required'))
    setLoading(true)
    try { await login(email, pw, true); onSuccess() }
    catch (err: any) { setError(err.message || t('err.generic')) }
    finally { setLoading(false) }
  }

  async function handleGoogle() {
    // Mock Google
    setError(null)
    setLoading(true)
    try {
      const { user } = await authApi.googleLogin('google.user@gmail.com', 'Google User')
      // Reload context
      window.location.reload()
    } catch (err: any) { setError(err.message || t('err.generic')) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header */}
      <div style={{ background: T.plum, paddingBottom: 20 }}>
        <StatusBar light />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackBtn onClick={onBack} light />
          <h1 style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: 'white' }}>{t('login.title')}</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col">
        {/* Greeting card */}
        <div className="flex items-start gap-3 rounded-3xl p-3.5 mb-5"
          style={{ background: T.card, border: `1.5px solid ${T.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: 52, height: 52, flexShrink: 0 }}>
            <VanDongAvatar size={52} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: T.D, fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 3 }}>
              {t('login.welcome')}
            </p>
            <p style={{ fontFamily: T.UI, fontSize: 11.5, color: T.mutedFg, lineHeight: 1.4 }}>
              {t('login.welcomeSub')}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: '#FFF0F0', border: `1.5px solid ${T.red}` }}>
            <p style={{ fontFamily: T.UI, fontSize: 12.5, color: T.red }}>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={t('login.email')} value={email} onChange={setEmail} placeholder={t('login.emailPh')} type="email" />
          <div>
            <Field label={t('login.password')} value={pw} onChange={setPw} placeholder={t('login.passwordPh')}
              type={showPw ? 'text' : 'password'}
              trailing={
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 4, display: 'flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {showPw ? (
                      <>
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={T.mutedFg} strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="3" stroke={T.mutedFg} strokeWidth="1.8" />
                      </>
                    ) : (
                      <>
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={T.mutedFg} strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="3" fill={T.mutedFg} />
                        <line x1="3" y1="3" x2="21" y2="21" stroke={T.mutedFg} strokeWidth="1.8" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                </button>
              } />
            <div className="text-right mt-1.5">
              <button type="button" onClick={onForgot}
                style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: T.UI, fontSize: 12.5, fontWeight: 700, color: T.red }}>
                {t('login.forgot')}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl active:translate-y-0.5 transition-all"
            style={{ height: 54, background: loading ? T.muted : `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: loading ? T.mutedFg : 'white', fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid ${loading ? T.border : T.redDark}`, boxShadow: loading ? 'none' : `0 4px 0 ${T.redDark}, 0 8px 20px rgba(183,28,28,0.3)`, cursor: loading ? 'wait' : 'pointer', marginTop: 8 }}>
            {loading ? '⏳' : t('login.submit')}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, fontWeight: 600 }}>{t('login.or')}</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* Google */}
        <button type="button" onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-2.5 rounded-2xl active:translate-y-0.5 transition-all"
          style={{ height: 54, background: T.card, color: T.ink, fontFamily: T.UI, fontSize: 14, fontWeight: 700, border: `1.5px solid ${T.border}`, cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C41.4 34.6 44 30 44 24c0-1.3-.1-2.3-.4-3.5z" />
          </svg>
          {t('login.google')}
        </button>

        {/* Register link */}
        <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, textAlign: 'center', marginTop: 24 }}>
          {t('login.noAccount')}{' '}
          <button onClick={onRegister} style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: T.UI, fontSize: 13, fontWeight: 800, color: T.red }}>
            {t('login.registerLink')}
          </button>
        </p>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// 3. REGISTER SCREEN
// ═════════════════════════════════════════════════════════

function RegisterScreen({ t, onBack, onLogin, onSuccess }: {
  t: (k: string) => string; onBack: () => void; onLogin: () => void; onSuccess: () => void
}) {
  const { register } = useAuth()
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [agree, setAgree] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!f.name || !f.email || !f.password || !f.confirm) return setError(t('err.required'))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setError(t('err.email'))
    if (f.password.length < 8) return setError(t('err.pwShort'))
    if (f.password !== f.confirm) return setError(t('err.pwMismatch'))
    if (!agree) return setError(t('err.terms'))

    setLoading(true)
    try {
      // Username = email prefix + random
      const username = f.email.split('@')[0].replace(/[^a-z0-9_]/gi, '') + '_' + Math.random().toString(36).slice(-4)
      await register({ username, email: f.email, password: f.password, displayName: f.name })
      onSuccess()
    } catch (err: any) { setError(err.message || t('err.generic')) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header */}
      <div style={{ background: T.plum }}>
        <StatusBar light />
        <div className="flex items-start gap-3 px-4 pb-4">
          <BackBtn onClick={onBack} light />
          <div className="flex-1 pt-1">
            <h1 style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{t('reg.title')}</h1>
            <p style={{ fontFamily: T.UI, fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{t('reg.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {error && (
          <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: '#FFF0F0', border: `1.5px solid ${T.red}` }}>
            <p style={{ fontFamily: T.UI, fontSize: 12.5, color: T.red }}>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={t('reg.name')} value={f.name} onChange={v => setF(p => ({ ...p, name: v }))} placeholder={t('reg.namePh')} />
          <Field label={t('reg.email')} value={f.email} onChange={v => setF(p => ({ ...p, email: v }))} placeholder={t('reg.emailPh')} type="email" />
          <Field label={t('reg.password')} value={f.password} onChange={v => setF(p => ({ ...p, password: v }))} placeholder={t('reg.passwordPh')}
            type={showPw ? 'text' : 'password'}
            trailing={<PwToggle show={showPw} toggle={() => setShowPw(s => !s)} />} />
          <Field label={t('reg.confirm')} value={f.confirm} onChange={v => setF(p => ({ ...p, confirm: v }))} placeholder={t('reg.confirmPh')}
            type={showPw ? 'text' : 'password'}
            trailing={<PwToggle show={showPw} toggle={() => setShowPw(s => !s)} />} />

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer mt-1">
            <div className="flex-shrink-0 flex items-center justify-center"
              style={{ width: 22, height: 22, background: agree ? T.red : 'transparent', border: `2px solid ${agree ? T.red : T.border}`, borderRadius: 6, marginTop: 1, cursor: 'pointer' }}
              onClick={(e) => { e.preventDefault(); setAgree(a => !a) }}>
              {agree && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontFamily: T.UI, fontSize: 12.5, color: T.ink, lineHeight: 1.5 }}>
              {t('reg.agree')} <span style={{ color: T.red, fontWeight: 700 }}>{t('reg.terms')}</span> {t('reg.and')} <span style={{ color: T.red, fontWeight: 700 }}>{t('reg.privacy')}</span>
            </span>
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-2xl active:translate-y-0.5 transition-all mt-2"
            style={{ height: 54, background: loading ? T.muted : `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: loading ? T.mutedFg : 'white', fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid ${loading ? T.border : T.redDark}`, boxShadow: loading ? 'none' : `0 4px 0 ${T.redDark}, 0 8px 20px rgba(183,28,28,0.3)`, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? '⏳' : t('reg.submit')}
          </button>

          <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, textAlign: 'center', marginTop: 12 }}>
            {t('reg.hasAccount')}{' '}
            <button type="button" onClick={onLogin} style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: T.UI, fontSize: 13, fontWeight: 800, color: T.red }}>
              {t('reg.loginLink')}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// 4. FORGOT PASSWORD
// ═════════════════════════════════════════════════════════

function ForgotScreen({ t, onBack, onSent }: { t: (k: string) => string; onBack: () => void; onSent: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email) return setError(t('err.required'))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('err.email'))

    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      onSent(email)
    } catch (err: any) { setError(err.message || t('err.generic')) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div style={{ background: T.plum }}>
        <StatusBar light />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackBtn onClick={onBack} light />
          <h1 style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: 'white' }}>{t('forgot.title')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center">
        <div className="rounded-3xl flex items-center justify-center mb-5"
          style={{ width: 100, height: 100, background: T.card, border: `2.5px solid ${T.gold}`, boxShadow: '0 6px 20px rgba(212,160,23,0.2)' }}>
          <VanDongAvatar size={80} />
        </div>

        <h2 style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: T.ink, textAlign: 'center', marginBottom: 10 }}>
          {t('forgot.subtitle')}
        </h2>
        <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, textAlign: 'center', lineHeight: 1.65, maxWidth: 320, marginBottom: 24 }}>
          {t('forgot.desc')}
        </p>

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-4 w-full" style={{ background: '#FFF0F0', border: `1.5px solid ${T.red}` }}>
            <p style={{ fontFamily: T.UI, fontSize: 12.5, color: T.red, textAlign: 'center' }}>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Field label={t('forgot.email')} value={email} onChange={setEmail} placeholder={t('forgot.emailPh')} type="email" />

          <button type="submit" disabled={loading} className="w-full rounded-2xl active:translate-y-0.5 transition-all"
            style={{ height: 54, background: loading ? T.muted : `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: loading ? T.mutedFg : 'white', fontFamily: T.D, fontSize: 17, fontWeight: 700, border: `2px solid ${loading ? T.border : T.redDark}`, boxShadow: loading ? 'none' : `0 4px 0 ${T.redDark}, 0 8px 20px rgba(183,28,28,0.3)`, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? '⏳' : t('forgot.submit')}
          </button>

          <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5"
            style={{ background: 'rgba(245,200,66,0.15)', border: `1.5px dashed ${T.gold}` }}>
            <span style={{ fontSize: 14 }}>💡</span>
            <p style={{ fontFamily: T.UI, fontSize: 11.5, color: '#7A5010', lineHeight: 1.5, flex: 1 }}>
              {t('forgot.note')}
            </p>
          </div>
        </form>

        <div className="flex-1" />

        <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, textAlign: 'center', marginTop: 20 }}>
          {t('forgot.back')}{' '}
          <button onClick={onBack} style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: T.UI, fontSize: 13, fontWeight: 800, color: T.red }}>
            {t('forgot.backLink')}
          </button>
        </p>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// 5. FORGOT SUCCESS
// ═════════════════════════════════════════════════════════

function ForgotOkScreen({ t, email, onBack }: { t: (k: string) => string; email: string; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div style={{ background: T.plum, paddingTop: 40 }}>
        <StatusBar light />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center">
        {/* Check circle */}
        <div className="rounded-full flex items-center justify-center mb-5"
          style={{ width: 90, height: 90, background: '#EFF8F3', border: `3px solid ${T.green}`, boxShadow: '0 6px 20px rgba(61,138,94,0.2)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 style={{ fontFamily: T.D, fontSize: 24, fontWeight: 800, color: T.ink, textAlign: 'center', marginBottom: 8 }}>
          {t('forgot.okTitle')}
        </h2>
        <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, textAlign: 'center', lineHeight: 1.6, maxWidth: 300 }}>
          {t('forgot.okDesc')}
        </p>
        <p style={{ fontFamily: T.D, fontSize: 14, fontWeight: 700, color: T.red, marginTop: 4 }}>
          {email}
        </p>

        {/* Steps */}
        <div className="w-full mt-7 flex flex-col gap-3">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: T.card, border: `1.5px solid ${T.border}` }}>
              <div className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: 26, height: 26, background: T.plum }}>
                <span style={{ fontFamily: T.D, fontSize: 13, fontWeight: 800, color: 'white' }}>{n}</span>
              </div>
              <span style={{ fontFamily: T.UI, fontSize: 13, color: T.ink, lineHeight: 1.4 }}>
                {t(`forgot.step${n}`)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <button onClick={() => window.open('mailto:', '_blank')} className="w-full rounded-2xl active:translate-y-0.5 transition-all mt-6"
          style={{ height: 54, background: `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: 'white', fontFamily: T.D, fontSize: 17, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 4px 0 ${T.redDark}, 0 8px 20px rgba(183,28,28,0.3)`, cursor: 'pointer' }}>
          📧 {t('forgot.openMail')}
        </button>

        <p style={{ fontFamily: T.UI, fontSize: 12.5, color: T.mutedFg, textAlign: 'center', marginTop: 16 }}>
          {t('forgot.notReceived')}{' '}
          <button onClick={onBack} style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: T.UI, fontSize: 12.5, fontWeight: 800, color: T.red }}>
            {t('forgot.resend')}
          </button>
        </p>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// 6. LANGUAGE SCREEN
// ═════════════════════════════════════════════════════════

function LanguageScreen({ t, current, onConfirm }: { t: (k: string) => string; current: Lang; onConfirm: (l: Lang) => void }) {
  const [sel, setSel] = useState<Lang>(current)

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div style={{ background: T.plum }}>
        <StatusBar light />
        <div className="flex flex-col items-center px-5 pb-6 pt-2">
          <h1 style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: 'white', textAlign: 'center' }}>{t('lang.title')}</h1>
          <p style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3, textAlign: 'center' }}>{t('lang.subtitle')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center">
        <div className="mb-6"><VanDongAvatar size={120} /></div>

        <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, textAlign: 'center', lineHeight: 1.65, maxWidth: 320, marginBottom: 24 }}>
          {t('lang.desc')}
        </p>

        <div className="w-full flex flex-col gap-3">
          {(['vi', 'en'] as Lang[]).map(l => {
            const isSel = sel === l
            const flag = l === 'vi' ? '🇻🇳' : '🇬🇧'
            return (
              <button key={l} onClick={() => setSel(l)} className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 active:scale-98 transition-all"
                style={{
                  background: T.card,
                  border: `2px solid ${isSel ? T.red : T.border}`,
                  boxShadow: isSel ? `0 0 0 3px rgba(193,39,45,0.1)` : '0 2px 6px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}>
                <div className="rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ width: 44, height: 32, background: 'white', border: `1px solid ${T.border}`, fontSize: 22 }}>
                  {flag}
                </div>
                <div className="flex-1 text-left">
                  <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: T.ink, lineHeight: 1.1 }}>{t(`lang.${l}`)}</p>
                  <p style={{ fontFamily: T.UI, fontSize: 11.5, color: T.mutedFg, marginTop: 2 }}>{t(`lang.${l}Sub`)}</p>
                </div>
                <div className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ width: 24, height: 24, background: isSel ? T.red : 'transparent', border: `2px solid ${isSel ? T.red : T.border}` }}>
                  {isSel && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex-1" />

        <button onClick={() => onConfirm(sel)} className="w-full rounded-2xl active:translate-y-0.5 transition-all mt-8"
          style={{ height: 54, background: `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: 'white', fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 4px 0 ${T.redDark}, 0 8px 20px rgba(183,28,28,0.3)`, cursor: 'pointer' }}>
          {t('lang.confirm')}
        </button>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// 7. ADVENTURE INTRO
// ═════════════════════════════════════════════════════════

function AdventureScreen({ t, onStart }: { t: (k: string) => string; onStart: () => void }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { setTimeout(() => setVis(true), 100) }, [])

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header with sparkle */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ background: T.plum, paddingTop: 40, paddingBottom: 40, minHeight: 220 }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 430 220" preserveAspectRatio="none">
          {Array.from({ length: 30 }).map((_, i) => {
            const x = (i * 73) % 430, y = (i * 47) % 220
            return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1} fill="white" opacity={0.2 + (i % 5) * 0.1} />
          })}
          {[[60, 50], [370, 70], [130, 150], [320, 170]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <path d="M0-6 L1.5-1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5-1.5 Z" fill={T.yellow} opacity="0.6" />
            </g>
          ))}
        </svg>

        <StatusBar light />

        <div className="relative z-10 flex flex-col items-center mt-6">
          <div className="rounded-3xl flex items-center justify-center mb-4"
            style={{ width: 80, height: 80, background: 'rgba(74,16,64,0.5)', border: '2px solid rgba(245,200,66,0.6)' }}>
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="16" stroke={T.yellow} strokeWidth="2" />
              <path d="M24 8v3M24 37v3M8 24h3M37 24h3M13 13l2 2M33 33l2 2M13 35l2-2M33 15l2-2" stroke={T.yellow} strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="24" cy="24" r="6" fill={T.yellow} />
              <circle cx="24" cy="24" r="3" fill={T.plum} />
            </svg>
          </div>
          <p style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.yellow, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            {t('adv.badge')}
          </p>
          <h1 style={{ fontFamily: T.D, fontSize: 28, fontWeight: 800, color: 'white', textAlign: 'center', letterSpacing: '0.02em' }}>
            {t('adv.title')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.4s ease 0.1s' }}>
        {/* Van Dong greeting */}
        <div className="flex items-start gap-3 mb-4">
          <div style={{ width: 68, height: 76, flexShrink: 0 }}>
            <VanDongAvatar size={68} />
          </div>
          <div className="flex-1 rounded-3xl rounded-tl-sm p-3.5"
            style={{ background: '#FFF2C8', border: `1.5px solid ${T.gold}`, position: 'relative' }}>
            <div style={{ position: 'absolute', left: -8, top: 16, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `8px solid ${T.gold}` }} />
            <p style={{ fontFamily: T.D, fontSize: 14, fontWeight: 800, color: T.plum, marginBottom: 4 }}>{t('adv.vanDong')}</p>
            <p style={{ fontFamily: T.UI, fontSize: 12.5, color: '#4A3020', lineHeight: 1.55 }}>{t('adv.vanDongMsg')}</p>
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(n => {
            const icons = ['🏛️', '📚', '🗺️']
            return (
              <div key={n} className="rounded-2xl p-3.5 flex items-start gap-3"
                style={{ background: T.card, border: `1.5px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ width: 42, height: 42, background: '#FFF2C8', border: `1.5px solid ${T.gold}`, fontSize: 20 }}>
                  {icons[n - 1]}
                </div>
                <div className="flex-1">
                  <p style={{ fontFamily: T.D, fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.15, marginBottom: 3 }}>
                    {t(`adv.card${n}.title`)}
                  </p>
                  <p style={{ fontFamily: T.UI, fontSize: 11.5, color: T.mutedFg, lineHeight: 1.5 }}>
                    {t(`adv.card${n}.desc`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Start button */}
        <button onClick={onStart} className="w-full rounded-2xl active:translate-y-0.5 transition-all mt-5"
          style={{ height: 56, background: `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: 'white', fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 4px 0 ${T.redDark}, 0 10px 24px rgba(183,28,28,0.35)`, cursor: 'pointer' }}>
          {t('adv.start')}
        </button>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// 8. TEAM SETUP
// ═════════════════════════════════════════════════════════

interface Member { id: string; name: string; initial: string; role?: string; isLeader?: boolean; color: string }

function TeamScreen({ t, onNext }: { t: (k: string) => string; onNext: () => void }) {
  const [teamName, setTeamName] = useState('Đội Thám Tử')
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Lan Anh', initial: 'L', role: 'Sử gia · Đội trưởng', isLeader: true, color: '#4A1040' },
    { id: '2', name: 'Minh Khôi', initial: 'M', role: 'Sĩ tử', color: '#C1272D' },
    { id: '3', name: 'Phúc Huy', initial: 'P', role: 'Sĩ tử', color: '#2563EB' },
  ])
  const [avatar, setAvatar] = useState(0)

  const avatars = ['🎓', '😊', '🌿', '📜', '🎯']

  function addMember() {
    if (members.length >= 4) return
    const names = ['Hồng Nhung', 'Tuấn Anh', 'Mai Linh', 'Đức Minh']
    const colors = ['#3D8A5E', '#7C3AED', '#F59E0B', '#0891B2']
    const idx = members.length - 1
    setMembers(m => [...m, {
      id: String(Date.now()),
      name: names[idx] || `Thành viên ${m.length + 1}`,
      initial: (names[idx] || 'T')[0],
      role: 'Sĩ tử',
      color: colors[idx % colors.length],
    }])
  }

  function removeMember(id: string) {
    setMembers(m => m.filter(x => x.id !== id))
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div style={{ background: T.plum }}>
        <StatusBar light />
        <div className="flex items-start gap-3 px-4 pb-4">
          <div className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 pt-1">
            <h1 style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{t('team.title')}</h1>
            <p style={{ fontFamily: T.UI, fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{t('team.step')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Team name */}
        <div className="mb-4">
          <p style={{ fontFamily: T.UI, fontSize: 10.5, fontWeight: 800, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {t('team.name')}
          </p>
          <div className="flex items-center gap-2 rounded-2xl px-4"
            style={{ height: 54, background: T.card, border: `2px solid ${T.border}` }}>
            <span style={{ fontSize: 18 }}>🏴</span>
            <input value={teamName} onChange={e => setTeamName(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', fontFamily: T.D, fontSize: 16, fontWeight: 700, color: T.ink }} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={T.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Members */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontFamily: T.UI, fontSize: 10.5, fontWeight: 800, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('team.members').replace('3', String(members.length))}
            </p>
            {members.length < 4 && (
              <button onClick={addMember} className="rounded-full px-3 py-1 active:scale-95"
                style={{ background: T.red, color: 'white', fontFamily: T.UI, fontSize: 11, fontWeight: 700, border: 0, cursor: 'pointer' }}>
                {t('team.add')}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: T.card, border: `1.5px solid ${T.border}` }}>
                <div className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ width: 40, height: 40, background: m.color }}>
                  <span style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: 'white' }}>{m.initial}</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontFamily: T.D, fontSize: 15, fontWeight: 800, color: T.ink, lineHeight: 1.1 }}>{m.name}</p>
                  <p style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, marginTop: 2 }}>{m.role}</p>
                </div>
                {m.isLeader ? (
                  <div className="rounded-full px-2.5 py-1 flex-shrink-0"
                    style={{ background: '#FFF2C8', border: `1px solid ${T.gold}` }}>
                    <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 800, color: '#7A5010' }}>
                      👑 {t('team.leader')}
                    </span>
                  </div>
                ) : (
                  <button onClick={() => removeMember(m.id)} className="rounded-full flex items-center justify-center active:scale-90"
                    style={{ width: 24, height: 24, background: 'transparent', border: 0, cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke={T.mutedFg} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div className="mb-5">
          <p style={{ fontFamily: T.UI, fontSize: 10.5, fontWeight: 800, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {t('team.avatar')}
          </p>
          <div className="flex gap-2.5">
            {avatars.map((a, i) => (
              <button key={i} onClick={() => setAvatar(i)} className="rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                style={{
                  width: 56, height: 56, fontSize: 26,
                  background: avatar === i ? '#FFF2C8' : T.card,
                  border: `2px solid ${avatar === i ? T.red : T.border}`,
                  boxShadow: avatar === i ? '0 0 0 3px rgba(193,39,45,0.15)' : 'none',
                  cursor: 'pointer',
                }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Next */}
        <button onClick={onNext} className="w-full rounded-2xl active:translate-y-0.5 transition-all"
          style={{ height: 54, background: `linear-gradient(135deg, ${T.redBtn}, #D32F2F)`, color: 'white', fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 4px 0 ${T.redDark}, 0 8px 20px rgba(183,28,28,0.3)`, cursor: 'pointer' }}>
          {t('team.next')}
        </button>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// Shared Field + PwToggle
// ═════════════════════════════════════════════════════════

function Field({ label, value, onChange, placeholder, type = 'text', trailing }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; trailing?: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 800, color: T.ink, letterSpacing: '0.02em' }}>
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-2xl px-4"
        style={{ height: 52, background: T.card, border: `1.5px solid ${T.border}` }}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', fontFamily: T.UI, fontSize: 14, color: T.ink }} />
        {trailing}
      </div>
    </label>
  )
}

function PwToggle({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 4, display: 'flex' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {show ? (
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={T.mutedFg} strokeWidth="1.8" />
            <circle cx="12" cy="12" r="3" stroke={T.mutedFg} strokeWidth="1.8" />
          </>
        ) : (
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={T.mutedFg} strokeWidth="1.8" />
            <circle cx="12" cy="12" r="3" fill={T.mutedFg} />
            <line x1="3" y1="3" x2="21" y2="21" stroke={T.mutedFg} strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  )
}