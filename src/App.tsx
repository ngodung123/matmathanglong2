import { useState, useEffect, useRef } from 'react'
import { setCurrentLanguage, translateDom, type Language } from './i18n'
import {
  CHECKPOINTS,
  COLLECTIBLES,
  ACHIEVEMENTS,
  HELP_SECTIONS,
  loadAppData,
  type CheckpointData,
  type Mission,
  type Collectible,
  type CollectCategory,
} from './dataStore'
import { translateText } from './i18n'
type CollectRarity = 'common' | 'rare' | 'legendary'
import { useAuth } from './Login/AuthContext'
import { LoginScreen } from './Login/view/LoginScreen'
const CAT_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  'Linh vật': { bg: '#FFF0F0', text: '#C1272D', border: '#F0C0C0' },
  'Kiến trúc': { bg: '#F0F4FF', text: '#3355CC', border: '#C0CCF0' },
  'Biểu tượng': { bg: '#FFFBEA', text: '#8B6010', border: '#EDD88A' },
  'Vật phẩm': { bg: '#F0FAF4', text: '#3D8A5E', border: '#AADFBE' },
  // // EN equivalents (API trả về khi lang=en)
  // 'Guardian': { bg: '#FFF0F0', text: '#C1272D', border: '#F0C0C0' },
  // 'Architecture': { bg: '#F0F4FF', text: '#3355CC', border: '#C0CCF0' },
  // 'Symbol': { bg: '#FFFBEA', text: '#8B6010', border: '#EDD88A' },
  // 'Item': { bg: '#F0FAF4', text: '#3D8A5E', border: '#AADFBE' },
}

const FALLBACK_CC = { bg: '#F5F0E6', text: '#2D1B14', border: '#D8CDB8' }

function getCatColor(cat: string) {
  return CAT_COLOR[cat] ?? FALLBACK_CC
}

const RARITY_STARS: Record<CollectRarity, number> = { common: 2, rare: 3, legendary: 5 }

// ─── Tokens ────────────────────────────────────────────────────────────────
const T = {
  bg: '#FDF6E8', card: '#FFFBF0',
  red: '#C1272D', redDark: '#8B0000',
  yellow: '#F5C842', yellowDark: '#C4941A',
  green: '#3D8A5E', greenDark: '#2D6B48',
  plum: '#4A1040', gold: '#D4A017',
  ink: '#2D1B14', muted: '#EEE0C4', mutedFg: '#7A5C4A', border: '#DDD0B4',
  D: "'Baloo 2', system-ui, sans-serif",
  UI: "'Be Vietnam Pro', system-ui, sans-serif",
}

// ─── Game state ────────────────────────────────────────────────────────────
interface CPProgress { missionsCompleted: number; xpEarned: number; cluesFound: number }
interface GameState {
  screen: 'home' | 'map' | 'cp-intro' | 'mission' | 'puzzle' | 'correct' | 'wrong' | 'cp-complete' | 'collection' | 'collectible-detail' | 'profile' | 'passport' | 'final-cp-complete' | 'journey-complete' | 'certificate' | 'help'
  prevScreen: GameState['screen']
  cpIdx: number
  missionIdx: number
  cpProgress: Record<number, CPProgress>
  showHint: boolean
  selectedCollectibleId: string | null
}

function initialState(): GameState {
  return {
    screen: 'home',
    prevScreen: 'home',
    cpIdx: 0,
    missionIdx: 0,
    selectedCollectibleId: null,
    cpProgress: {},
    showHint: false,
  }
}

function loadSavedProgress(userId: number): Record<number, CPProgress> {
  const serialized = window.localStorage.getItem(`mmtl-game-progress:${userId}`)
  if (!serialized) return {}

  const saved: unknown = JSON.parse(serialized)
  if (typeof saved !== 'object' || saved === null || !('cpProgress' in saved)) {
    throw new Error('Dữ liệu tiến trình đã lưu không hợp lệ.')
  }

  const progress = saved.cpProgress
  if (typeof progress !== 'object' || progress === null || Array.isArray(progress)) {
    throw new Error('Dữ liệu tiến trình đã lưu không hợp lệ.')
  }

  const restored: Record<number, CPProgress> = {}
  for (const [checkpointId, value] of Object.entries(progress)) {
    if (
      !/^\d+$/.test(checkpointId) ||
      typeof value !== 'object' ||
      value === null ||
      !('missionsCompleted' in value) ||
      !('xpEarned' in value) ||
      !('cluesFound' in value) ||
      typeof value.missionsCompleted !== 'number' ||
      typeof value.xpEarned !== 'number' ||
      typeof value.cluesFound !== 'number'
    ) {
      throw new Error('Dữ liệu tiến trình đã lưu không hợp lệ.')
    }
    restored[Number(checkpointId)] = {
      missionsCompleted: value.missionsCompleted,
      xpEarned: value.xpEarned,
      cluesFound: value.cluesFound,
    }
  }
  return restored
}

function getCPProgress(state: GameState, cpId: number): CPProgress {
  return state.cpProgress[cpId] ?? { missionsCompleted: 0, xpEarned: 0, cluesFound: 0 }
}

function cpState(state: GameState, cpId: number): 'completed' | 'current' | 'locked' {
  const prog = getCPProgress(state, cpId)
  if (prog.missionsCompleted >= 5) return 'completed'
  const firstIncompleteCpId = CHECKPOINTS.find(cp => getCPProgress(state, cp.id).missionsCompleted < 5)?.id
  if (cpId === firstIncompleteCpId) return 'current'
  return prog.missionsCompleted > 0 ? 'current' : 'locked'
}

// ─── Shared UI ─────────────────────────────────────────────────────────────

function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? 'rgba(255,255,255,0.9)' : T.ink
  return (
    <div className="flex items-center justify-between px-6 flex-shrink-0" style={{ height: 40 }}>
      <span style={{ fontFamily: T.UI, fontSize: 13, fontWeight: 700, color: c }}>9:41</span>
      <div className="flex items-center gap-1.5">
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

function BackButton({ onBack, light = false }: { onBack: () => void; light?: boolean }) {
  return (
    <button onClick={onBack} className="flex items-center justify-center rounded-2xl active:scale-95 transition-transform"
      style={{ width: 40, height: 40, background: light ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', border: `1.5px solid ${light ? 'rgba(255,255,255,0.35)' : T.border}`, backdropFilter: 'blur(8px)', cursor: 'pointer' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke={light ? 'white' : T.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function ProgressDots({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all" style={{ width: i < done ? 24 : 10, height: 10, background: i < done ? T.green : i === done ? T.yellow : T.muted, border: `2px solid ${i < done ? T.greenDark : i === done ? T.yellowDark : T.border}`, boxShadow: i === done ? `0 0 8px rgba(245,200,66,0.6)` : 'none' }} />
      ))}
    </div>
  )
}

// ─── Văn Đồng ─────────────────────────────────────────────────────────────

function VanDong({ size = 80, mood = 'happy' }: { size?: number; mood?: 'happy' | 'thinking' | 'sad' }) {
  const faceY = mood === 'sad' ? 57 : 55
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 120 140" fill="none">
      <path d="M30 90 Q30 130 60 130 Q90 130 90 90 L80 70 Q60 80 40 70 Z" fill="#4A1040" />
      <path d="M50 75 Q60 85 70 75" stroke={T.gold} strokeWidth="1.5" fill="none" />
      <line x1="60" y1="85" x2="60" y2="120" stroke={T.gold} strokeWidth="1" opacity="0.6" />
      <rect x="42" y="100" width="36" height="6" rx="3" fill={T.red} />
      <path d="M40 70 Q20 80 18 95 Q24 98 32 88 Q36 80 40 78 Z" fill="#4A1040" />
      <path d="M80 70 Q100 80 102 95 Q96 98 88 88 Q84 80 80 78 Z" fill="#4A1040" />
      <ellipse cx="22" cy="95" rx="7" ry="5" fill="#C8A882" transform="rotate(-20 22 95)" />
      <ellipse cx="98" cy="95" rx="7" ry="5" fill="#C8A882" transform="rotate(20 98 95)" />
      <rect x="30" y="88" width="60" height="12" rx="3" fill="#FDF0C8" stroke={T.gold} strokeWidth="1" />
      <ellipse cx="30" cy="94" rx="4" ry="6" fill={T.yellow} stroke={T.gold} strokeWidth="1" />
      <ellipse cx="90" cy="94" rx="4" ry="6" fill={T.yellow} stroke={T.gold} strokeWidth="1" />
      <rect x="52" y="58" width="16" height="16" rx="8" fill="#C8A882" />
      <ellipse cx="60" cy="48" rx="22" ry="20" fill="#C8A882" />
      <path d="M38 44 Q38 28 60 28 Q82 28 82 44" fill="#2D1B14" />
      <path d="M32 44 Q60 6 88 44" fill="#D4A017" stroke={T.gold} strokeWidth="1" />
      <ellipse cx="60" cy="44" rx="28" ry="5" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      <path d="M44 46 Q50 56 52 58" stroke={T.gold} strokeWidth="1" />
      <path d="M76 46 Q70 56 68 58" stroke={T.gold} strokeWidth="1" />
      <ellipse cx="52" cy="48" rx="4" ry="3.5" fill="white" />
      <ellipse cx="68" cy="48" rx="4" ry="3.5" fill="white" />
      {mood === 'sad' ? (
        <>
          <path d="M49 48 Q52 44 55 47" stroke="#2D1B14" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M65 47 Q68 44 71 48" stroke="#2D1B14" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="52" cy="50" r="2" fill="#2D1B14" /><circle cx="68" cy="50" r="2" fill="#2D1B14" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <circle cx="53" cy="49" r="2.5" fill="#2D1B14" /><circle cx="69" cy="49" r="2.5" fill="#2D1B14" />
          <circle cx="54" cy="48" r="1" fill="white" /><circle cx="70" cy="48" r="1" fill="white" />
          <circle cx="78" cy="36" r="2" fill="#C8A882" /><circle cx="83" cy="30" r="2.5" fill="#C8A882" /><circle cx="89" cy="22" r="3" fill="#C8A882" />
        </>
      ) : (
        <>
          <circle cx="53" cy="49" r="2.5" fill="#2D1B14" /><circle cx="69" cy="49" r="2.5" fill="#2D1B14" />
          <circle cx="54" cy="48" r="1" fill="white" /><circle cx="70" cy="48" r="1" fill="white" />
        </>
      )}
      <path d={mood === 'sad' ? "M54 57 Q60 54 66 57" : "M54 55 Q60 60 66 55"} stroke="#A06040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="46" cy="54" rx="4" ry="2.5" fill="#E8806080" />
      <ellipse cx="74" cy="54" rx="4" ry="2.5" fill="#E8806080" />
      <path d="M49 44 Q52 42 55 44" stroke="#2D1B14" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M65 44 Q68 42 71 44" stroke="#2D1B14" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="48" cy="130" rx="8" ry="4" fill="#3A0C32" />
      <ellipse cx="72" cy="130" rx="8" ry="4" fill="#3A0C32" />
    </svg>
  )
}

// ─── Collectible Illustrations (one per checkpoint) ────────────────────────

function CollectibleIllus({ cpId, size = 160 }: { cpId: number; size?: number }) {
  const s = size

  // ── CP1: NGHÊ — Vietnamese guardian dog-beast at Văn Miếu Môn ──────────────
  if (cpId === 1) return (
    <svg width={s} height={s} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="70" fill="#EBE5D3" />
      <image href="/nghe.png" x="15" y="15" width="130" height="130" preserveAspectRatio="xMidYMid meet" />
      {/* Badge */}
      <rect x="94" y="32" width="38" height="22" rx="6" fill="#A41A20" transform="rotate(8 113 43)" />
      <text x="113" y="47" textAnchor="middle" fontSize="10" fill="white" fontFamily="'Be Vietnam Pro',sans-serif" fontWeight="700" transform="rotate(8 113 47)">Nghê</text>
    </svg>
  )

  // ── CP2: RỒNG — Vietnamese serpentine dragon, lưỡng long chầu nguyệt ────────
  if (cpId === 2) return (
    <svg width={s} height={s} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="70" fill="rgba(74,16,64,0.12)" />
      {/* Central luminous pearl/moon */}
      <circle cx="80" cy="80" r="20" fill="rgba(245,200,66,0.25)" stroke={T.gold} strokeWidth="1" />
      <circle cx="80" cy="80" r="14" fill={T.yellow} opacity="0.75" />
      <circle cx="80" cy="80" r="8" fill="#FFE870" />
      <circle cx="76" cy="77" r="3.5" fill="rgba(255,255,255,0.45)" />
      {/* LEFT DRAGON — serpentine body in S-curve, no wings */}
      {/* Serpentine body */}
      <path d="M28 98 Q32 120 50 122 Q64 124 62 108 Q60 94 70 88" stroke="#C1272D" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 98 Q32 120 50 122 Q64 124 62 108 Q60 94 70 88" stroke="#E03030" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Scale marks */}
      {([[34, 106], [44, 118], [54, 118], [62, 108]] as [number, number][]).map(([bx, by], i) => (
        <path key={i} d={`M${bx - 5} ${by} Q${bx} ${by - 6} ${bx + 5} ${by}`} stroke={T.gold} strokeWidth="1.2" fill="none" opacity="0.6" />
      ))}
      {/* Left dragon head */}
      <ellipse cx="44" cy="58" rx="18" ry="13" fill="#C1272D" stroke="#8B0000" strokeWidth="1.5" />
      {/* Snout */}
      <path d="M28 60 Q30 52 44 52 Q56 52 60 60" fill="#A02020" stroke="#8B0000" strokeWidth="1" />
      {/* Nostrils */}
      <circle cx="36" cy="57" r="2.5" fill="#801010" />
      {/* Eye */}
      <ellipse cx="50" cy="52" rx="6" ry="5.5" fill="white" stroke="#8B0000" strokeWidth="1" />
      <circle cx="51" cy="53" r="3.5" fill="#1A0804" />
      <circle cx="52" cy="52" r="1.2" fill="white" />
      {/* Open jaw with teeth */}
      <path d="M28 64 Q36 72 50 68 Q56 66 60 64" fill="#A02020" />
      {[32, 37, 42, 47, 52, 57].map(tx => (
        <path key={tx} d={`M${tx} 64 L${tx + 1.5} 70 L${tx + 3} 64`} fill="white" opacity="0.8" />
      ))}
      {/* DEER ANTLERS — key Vietnamese dragon feature */}
      <path d="M54 48 Q58 36 66 28" stroke={T.gold} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M58 42 Q64 36 70 38" stroke={T.gold} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M60 38 Q64 28 62 22" stroke={T.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Front claw reaching toward pearl */}
      <path d="M70 88 Q76 82 78 86" stroke="#C1272D" strokeWidth="4" fill="none" strokeLinecap="round" />
      {([-2, 1, 4] as number[]).map(dy => <line key={dy} x1="75" y1={84 + dy} x2="69" y2={80 + dy} stroke="#A02020" strokeWidth="1.2" strokeLinecap="round" />)}

      {/* RIGHT DRAGON — mirror */}
      <path d="M132 98 Q128 120 110 122 Q96 124 98 108 Q100 94 90 88" stroke="#C1272D" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M132 98 Q128 120 110 122 Q96 124 98 108 Q100 94 90 88" stroke="#E03030" strokeWidth="5" fill="none" strokeLinecap="round" />
      {([[126, 106], [116, 118], [106, 118], [98, 108]] as [number, number][]).map(([bx, by], i) => (
        <path key={i} d={`M${bx - 5} ${by} Q${bx} ${by - 6} ${bx + 5} ${by}`} stroke={T.gold} strokeWidth="1.2" fill="none" opacity="0.6" />
      ))}
      <ellipse cx="116" cy="58" rx="18" ry="13" fill="#C1272D" stroke="#8B0000" strokeWidth="1.5" />
      <path d="M100 60 Q102 52 116 52 Q128 52 132 60" fill="#A02020" stroke="#8B0000" strokeWidth="1" />
      <circle cx="124" cy="57" r="2.5" fill="#801010" />
      <ellipse cx="110" cy="52" rx="6" ry="5.5" fill="white" stroke="#8B0000" strokeWidth="1" />
      <circle cx="109" cy="53" r="3.5" fill="#1A0804" />
      <circle cx="108" cy="52" r="1.2" fill="white" />
      <path d="M100 64 Q108 72 110 68 Q120 66 132 64" fill="#A02020" />
      {[103, 108, 113, 118, 123, 128].map(tx => (
        <path key={tx} d={`M${tx} 64 L${tx + 1.5} 70 L${tx + 3} 64`} fill="white" opacity="0.8" />
      ))}
      <path d="M106 48 Q102 36 94 28" stroke={T.gold} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M102 42 Q96 36 90 38" stroke={T.gold} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M100 38 Q96 28 98 22" stroke={T.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M90 88 Q84 82 82 86" stroke="#C1272D" strokeWidth="4" fill="none" strokeLinecap="round" />
      {([-2, 1, 4] as number[]).map(dy => <line key={dy} x1="85" y1={84 + dy} x2="91" y2={80 + dy} stroke="#A02020" strokeWidth="1.2" strokeLinecap="round" />)}

      {/* Flame wisps around pearl */}
      {([0, 72, 144, 216, 288] as number[]).map(a => {
        const r = a * Math.PI / 180
        return <path key={a} d={`M${80 + 20 * Math.cos(r)} ${80 + 20 * Math.sin(r)} Q${80 + 28 * Math.cos(r + 0.4)} ${80 + 28 * Math.sin(r + 0.4)} ${80 + 24 * Math.cos(r)} ${80 + 24 * Math.sin(r)}`} stroke={T.yellow} strokeWidth="1.5" fill="none" opacity="0.7" />
      })}
    </svg>
  )

  // ── CP3: KHUÊ VĂN CÁC — octagonal pavilion, Hà Nội cultural icon ──────────
  if (cpId === 3) return (
    <svg width={s} height={s} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="70" fill="rgba(212,160,23,0.1)" />
      {/* Sao Khuê rays (12 rays for the star it's named after) */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
        const r = a * Math.PI / 180
        return <line key={a} x1={80 + 54 * Math.cos(r)} y1={80 + 54 * Math.sin(r)} x2={80 + 68 * Math.cos(r)} y2={80 + 68 * Math.sin(r)} stroke={T.gold} strokeWidth="1.2" opacity="0.38" strokeLinecap="round" />
      })}
      {/* Stone staircase (3 steps) */}
      <rect x="26" y="132" width="108" height="10" rx="2" fill="#C0B090" stroke={T.gold} strokeWidth="1" />
      <rect x="32" y="124" width="96" height="10" rx="2" fill="#C8B898" stroke={T.gold} strokeWidth="1" />
      {/* Platform base */}
      <rect x="40" y="114" width="80" height="12" rx="2" fill="#D0C0A0" stroke={T.gold} strokeWidth="1.5" />
      {/* Four columns */}
      {([52, 98] as number[]).map(px => [
        <rect key={px + 'a'} x={px} y="76" width="10" height="40" rx="3" fill="#B8A878" stroke="#9A8060" strokeWidth="1.2" />,
        <rect key={px + 'b'} x={px + 2} y="78" width="6" height="36" rx="2" fill="#D4C8A0" opacity="0.55" />
      ])}
      {/* Octagonal body (characteristic shape) */}
      <polygon points="62,114 98,114 108,98 108,80 98,66 62,66 52,80 52,98" fill="#E8D8A0" stroke={T.gold} strokeWidth="1.8" />
      <polygon points="64,112 96,112 106,96 106,82 96,68 64,68 54,82 54,96" fill="#EEE0A8" />
      {/* ROUND WINDOW — most iconic feature of Khuê Văn Các */}
      {/* Outer ring */}
      <circle cx="80" cy="90" r="20" fill="#78C4E4" stroke={T.gold} strokeWidth="2.5" />
      {/* Inner sky */}
      <circle cx="80" cy="90" r="16" fill="#9AD4F0" />
      <circle cx="80" cy="90" r="10" fill="rgba(140,210,250,0.4)" />
      {/* Window cross-frame detail (thiên-địa philosophy) */}
      <line x1="80" y1="70" x2="80" y2="110" stroke={T.gold} strokeWidth="1.2" opacity="0.5" />
      <line x1="60" y1="90" x2="100" y2="90" stroke={T.gold} strokeWidth="1.2" opacity="0.5" />
      {/* Moon reflection */}
      <circle cx="77" cy="87" r="5" fill="rgba(255,248,200,0.55)" />
      {/* Pointed roof */}
      <polygon points="80,34 46,66 114,66" fill={T.red} stroke="#8B0000" strokeWidth="1.8" />
      <polygon points="80,38 50,66 110,66" fill="#E03030" opacity="0.25" />
      {/* Eave curl tips */}
      <path d="M42 66 Q46 60 46 66" fill={T.red} />
      <path d="M114 66 Q118 60 118 66" fill={T.red} />
      {/* Gold eave tip ornaments */}
      <circle cx="46" cy="66" r="3.5" fill={T.gold} stroke="#A07010" strokeWidth="1" />
      <circle cx="114" cy="66" r="3.5" fill={T.gold} stroke="#A07010" strokeWidth="1" />
      {/* Roof ridge top ornament */}
      <circle cx="80" cy="34" r="6" fill={T.gold} stroke="#A07010" strokeWidth="1.5" />
      <circle cx="80" cy="34" r="3" fill={T.red} />
      {/* Sao Khuê star at top */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const r = a * Math.PI / 180
        return <line key={a} x1={80} y1={34} x2={80 + 7 * Math.cos(r)} y2={34 + 7 * Math.sin(r)} stroke={T.yellow} strokeWidth="1.5" opacity="0.9" />
      })}
    </svg>
  )

  // ── CP4: RÙA ĐÁ + BIA TIẾN SĨ — stone turtle carrying the scholar stele ───
  if (cpId === 4) return (
    <svg width={s} height={s} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="70" fill="rgba(45,27,20,0.07)" />
      {/* The bia đá (stone stele) — tall rectangular stone tablet */}
      {/* Stele body */}
      <rect x="60" y="28" width="40" height="62" rx="3" fill="#C8C0A4" stroke="#9A9080" strokeWidth="1.8" />
      <rect x="64" y="34" width="32" height="52" rx="2" fill="#D8D0B4" />
      {/* Stele arched top (architectural detail) */}
      <path d="M60 40 Q80 24 100 40 L100 28 Q80 16 60 28 Z" fill="#C8C0A4" stroke="#9A9080" strokeWidth="1.5" />
      <path d="M63 38 Q80 26 97 38" stroke="rgba(150,140,120,0.5)" strokeWidth="1" fill="none" />
      {/* Inscription lines (imitating carved text) */}
      {[46, 54, 62, 70, 78].map(y => <line key={y} x1="68" y1={y} x2="92" y2={y} stroke="#8A8070" strokeWidth="0.85" opacity="0.55" />)}
      {/* Red official stamp / seal on stele */}
      <rect x="66" y="72" width="16" height="16" rx="2" fill={T.red} opacity="0.88" transform="rotate(5 74 80)" />
      <rect x="68" y="74" width="12" height="12" rx="1" fill="none" stroke="rgba(255,230,200,0.5)" strokeWidth="0.8" transform="rotate(5 74 80)" />
      <text x="74" y="84" textAnchor="middle" fontSize="8" fill="white" fontFamily="serif" fontWeight="bold" transform="rotate(5 74 84)">進士</text>
      {/* STONE TURTLE (rùa đá) — solid stone appearance */}
      {/* Main shell */}
      <ellipse cx="80" cy="114" rx="50" ry="22" fill="#B8B0A0" stroke="#9A9280" strokeWidth="2" />
      {/* Shell dome (upper curved surface) */}
      <ellipse cx="80" cy="108" rx="42" ry="17" fill="#C8C0B0" stroke="#9A9280" strokeWidth="1.5" />
      {/* Stone shell hexagonal pattern */}
      {([[80, 100], [64, 108], [96, 108], [72, 116], [88, 116], [80, 122]] as [number, number][]).map(([sx, sy], i) => (
        <ellipse key={i} cx={sx} cy={sy} rx={10} ry={6.5} fill="none" stroke="#8A8272" strokeWidth={1.2} opacity={0.45} />
      ))}
      {/* Stone texture marks */}
      {([[56, 104], [72, 98], [90, 98], [106, 104]] as [number, number][]).map(([sx, sy], i) => (
        <path key={i} d={`M${sx - 4} ${sy} Q${sx} ${sy - 4} ${sx + 4} ${sy}`} stroke="#8A8272" strokeWidth="0.7" fill="none" opacity="0.4" />
      ))}
      {/* Turtle head (stone, protruding forward) */}
      <ellipse cx="118" cy="112" rx="14" ry="10" fill="#C0B8A8" stroke="#9A9280" strokeWidth="1.5" />
      <circle cx="124" cy="109" r="3.5" fill="#8A8272" />
      <circle cx="124" cy="109" r="1.8" fill="#2D2820" />
      {/* Neck */}
      <path d="M106 110 Q112 108 116 111" fill="#B8B0A0" stroke="#9A9280" strokeWidth="1" />
      {/* Flippers (flat stone) */}
      <ellipse cx="46" cy="122" rx="16" ry="6" fill="#B8B0A0" stroke="#9A9280" strokeWidth="1.2" transform="rotate(-28 46 122)" />
      <ellipse cx="114" cy="122" rx="16" ry="6" fill="#B8B0A0" stroke="#9A9280" strokeWidth="1.2" transform="rotate(28 114 122)" />
      {/* Tail */}
      <path d="M38 114 Q28 110 32 122" fill="#B8B0A0" stroke="#9A9280" strokeWidth="1" />
    </svg>
  )

  // ── CP5: CUỐN THƯ — Confucian scholar's scroll with classical text ─────────
  if (cpId === 5) return (
    <svg width={s} height={s} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="70" fill="rgba(193,39,45,0.09)" />
      {/* Horizontal scroll rods (end caps) */}
      <ellipse cx="35" cy="80" rx="7" ry="36" fill={T.red} stroke="#8B0000" strokeWidth="1.5" />
      <ellipse cx="125" cy="80" rx="7" ry="36" fill={T.red} stroke="#8B0000" strokeWidth="1.5" />
      {/* Scroll rod top/bottom caps (gold) */}
      <ellipse cx="35" cy="44" rx="7" ry="4" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      <ellipse cx="35" cy="116" rx="7" ry="4" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      <ellipse cx="125" cy="44" rx="7" ry="4" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      <ellipse cx="125" cy="116" rx="7" ry="4" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      {/* Parchment (giấy dó) */}
      <rect x="35" y="44" width="90" height="72" rx="2" fill="#FDF0C8" stroke={T.gold} strokeWidth="1.5" />
      {/* Scroll top and bottom fold */}
      <ellipse cx="80" cy="44" rx="45" ry="5" fill="#F5E8B8" stroke={T.gold} strokeWidth="1.5" />
      <ellipse cx="80" cy="116" rx="45" ry="5" fill="#F5E8B8" stroke={T.gold} strokeWidth="1.5" />
      {/* Border decorative line */}
      <rect x="39" y="48" width="82" height="64" rx="1" fill="none" stroke={T.gold} strokeWidth="0.8" opacity="0.5" />
      {/* Title: 論語 (Analects of Confucius) */}
      <text x="80" y="70" textAnchor="middle" fontSize="16" fill={T.red} fontFamily="serif" fontWeight="bold">論語</text>
      {/* Classical quote: 學而時習之 / 不亦說乎 */}
      <text x="80" y="87" textAnchor="middle" fontSize="9.5" fill={T.mutedFg} fontFamily="serif">學而時習之</text>
      <text x="80" y="100" textAnchor="middle" fontSize="9.5" fill={T.mutedFg} fontFamily="serif">不亦說乎</text>
      {/* Official red stamp seal (ấn son) */}
      <rect x="99" y="98" width="20" height="20" rx="2.5" fill={T.red} opacity="0.88" transform="rotate(8 109 108)" />
      <rect x="101" y="100" width="16" height="16" rx="1.5" fill="none" stroke="rgba(255,230,200,0.55)" strokeWidth="0.9" transform="rotate(8 109 108)" />
      <text x="109" y="112" textAnchor="middle" fontSize="9" fill="white" fontFamily="serif" fontWeight="bold" transform="rotate(8 109 112)">孔</text>
      {/* Decorative brush-stroke lines */}
      <path d="M42 55 Q55 52 42 59" stroke={T.gold} strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M118 55 Q105 52 118 59" stroke={T.gold} strokeWidth="0.8" fill="none" opacity="0.4" />
    </svg>
  )

  // ── CP6: CHUÔNG ĐỒNG — Vietnamese bronze temple bell ─────────────────────
  if (cpId === 6) return (
    <svg width={s} height={s} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="70" fill="rgba(74,16,64,0.09)" />
      {/* Wooden beam the bell hangs from */}
      <rect x="20" y="22" width="120" height="14" rx="5" fill="#7A5030" stroke="#5A3818" strokeWidth="1.5" />
      {/* Hanging chain/rope */}
      <line x1="80" y1="36" x2="80" y2="45" stroke="#9A7840" strokeWidth="3" strokeLinecap="round" />
      {/* Crown / suspension loop (vòng treo) — double dragon head style */}
      <path d="M70 45 Q80 38 90 45 Q88 50 80 52 Q72 50 70 45 Z" fill="#A86820" stroke="#7A5010" strokeWidth="1.2" />
      {/* Bell body (chuông đồng) — barrel shape wider at mouth */}
      <path d="M80 52 Q50 56 44 80 Q40 100 44 116 Q48 130 80 134 Q112 130 116 116 Q120 100 116 80 Q110 56 80 52 Z" fill="#B87828" stroke="#8A5810" strokeWidth="2" />
      {/* Bell body inner tone — bronze patina */}
      <path d="M80 54 Q52 58 47 81 Q43 101 47 116 Q51 128 80 132 Q109 128 113 116 Q117 101 113 81 Q108 58 80 54 Z" fill="#C88A30" />
      {/* Decorative band 1 (top) — lotus pattern suggestion */}
      <path d="M47 70 Q80 64 113 70" stroke="#9A6818" strokeWidth="5" fill="none" />
      <path d="M47 70 Q80 64 113 70" stroke="#E0A840" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Lotus flowers in band 1 */}
      {[58, 80, 102].map(lx => (
        <g key={lx}>
          <path d={`M${lx} 67 Q${lx} 60 ${lx + 4} 63 Q${lx} 58 ${lx} 65`} fill="#E8B040" opacity="0.6" />
          <path d={`M${lx} 67 Q${lx} 60 ${lx - 4} 63 Q${lx} 58 ${lx} 65`} fill="#E8B040" opacity="0.6" />
          <circle cx={lx} cy="67" r="2.5" fill="#FFD050" />
        </g>
      ))}
      {/* Decorative band 2 (middle) */}
      <path d="M45 95 Q80 89 115 95" stroke="#9A6818" strokeWidth="4" fill="none" />
      <path d="M45 95 Q80 89 115 95" stroke="#E0A840" strokeWidth="1.5" fill="none" opacity="0.45" />
      {/* Vertical grooves (nhũ đinh — nipple decorations typical of Vietnamese bells) */}
      {[56, 64, 72, 80, 88, 96, 104].map(vx => (
        <circle key={vx} cx={vx} cy={82} r={3} fill="#9A6818" stroke="#7A4808" strokeWidth="0.8" />
      ))}
      {/* Decorative band 3 (lower) */}
      <path d="M47 112 Q80 106 113 112" stroke="#9A6818" strokeWidth="4" fill="none" />
      <path d="M47 112 Q80 106 113 112" stroke="#E0A840" strokeWidth="1.5" fill="none" opacity="0.45" />
      {/* Bell mouth / rim */}
      <path d="M44 116 Q56 128 80 132 Q104 128 116 116" stroke="#8A5810" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Wooden striker (dùi đánh chuông) hanging beside */}
      <rect x="118" y="78" width="6" height="46" rx="3" fill="#8A6030" stroke="#6A4018" strokeWidth="1" />
      <ellipse cx="121" cy="78" rx="8" ry="7" fill="#A87840" stroke="#7A5828" strokeWidth="1.2" />
      {/* Patina highlights */}
      <path d="M56 62 Q54 80 52 98 Q50 110 54 120" stroke="rgba(200,160,80,0.35)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  )

  // ── CP7: TRỐNG ĐỒNG — Đông Sơn bronze drum, symbol of Vietnamese civilization
  return (
    <svg width={s} height={s} viewBox="0 0 160 160" fill="none">
      <defs>
        <radialGradient id="drumGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#D4A017" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="70" fill="url(#drumGlow)" />
      {/* Drum cylinder body */}
      <path d="M18 58 L18 122 Q18 128 80 130 Q142 128 142 122 L142 58" fill="#9A6018" />
      {/* Body decorative zone bands */}
      <path d="M18 68 Q80 74 142 68" stroke="#C88028" strokeWidth="6" fill="none" opacity="0.55" />
      <path d="M18 80 Q80 85 142 80" stroke="#B07020" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M18 110 Q80 114 142 110" stroke="#C88028" strokeWidth="6" fill="none" opacity="0.55" />
      <path d="M18 120 Q80 124 142 120" stroke="#B07020" strokeWidth="3" fill="none" opacity="0.4" />
      {/* Geometric band pattern on drum body */}
      {Array.from({ length: 8 }).map((_, i) => {
        const bx = 22 + i * 15
        return <path key={i} d={`M${bx} 88 Q${bx + 7} 83 ${bx + 14} 88 Q${bx + 7} 93 ${bx} 88`} stroke="#B87020" strokeWidth="1" fill="none" opacity="0.5" />
      })}
      {/* Drum handles (quai) — two symmetrical handles */}
      <path d="M18 80 Q6 86 6 96 Q6 106 18 106" stroke="#C88028" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M142 80 Q154 86 154 96 Q154 106 142 106" stroke="#C88028" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* DRUM FACE (mặt trống) — the most iconic decorative element */}
      {/* Outer rim */}
      <ellipse cx="80" cy="58" rx="62" ry="21" fill="#B87020" stroke="#8A5010" strokeWidth="2" />
      {/* Bird zone (ring 4 — outer) — flying herons/cranes going counterclockwise */}
      <ellipse cx="80" cy="58" rx="54" ry="18" fill="#C88028" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => {
        const r = angle * Math.PI / 180
        const bx = 80 + 48 * Math.cos(r), by = 58 + 16 * Math.sin(r)
        const ra = (angle + 100) * Math.PI / 180
        return (
          <g key={i} transform={`translate(${bx},${by}) rotate(${angle + 90})`}>
            <ellipse cx={0} cy={0} rx={5.5} ry={2} fill="#7A5018" />
            <path d="M-4 0 Q-8 -4 -3 -3" fill="#7A5018" />
            <line x1="5" y1="0" x2="9" y2="-1.5" stroke="#7A5018" strokeWidth="0.9" />
          </g>
        )
      })}
      {/* Geometric ring 3 */}
      <ellipse cx="80" cy="58" rx="42" ry="14" fill="#B87020" stroke="#8A5010" strokeWidth="1.2" />
      {/* Zigzag pattern in ring 3 */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a1 = (i / 14) * Math.PI * 2, a2 = ((i + 0.5) / 14) * Math.PI * 2
        return <line key={i} x1={80 + 38 * Math.cos(a1)} y1={58 + 12.8 * Math.sin(a1)} x2={80 + 42 * Math.cos(a2)} y2={58 + 14 * Math.sin(a2)} stroke="#6A4010" strokeWidth="1.2" opacity="0.6" />
      })}
      {/* Ring 2 inner zone */}
      <ellipse cx="80" cy="58" rx="32" ry="10.5" fill="#C88028" stroke="#8A5010" strokeWidth="1" />
      <ellipse cx="80" cy="58" rx="22" ry="7.5" fill="#B87020" stroke="#8A5010" strokeWidth="1" />
      {/* Central STAR / SUN pattern (ngôi sao trung tâm) — 12 rays + intermediate dots */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
        const r = a * Math.PI / 180, long = a % 60 === 0
        return <line key={a} x1={80} y1={58} x2={80 + (long ? 18 : 12) * Math.cos(r)} y2={58 + (long ? 6 : 4) * Math.sin(r)} stroke={long ? '#FFD848' : '#F0B830'} strokeWidth={long ? 2.8 : 1.8} strokeLinecap="round" />
      })}
      {[15, 75, 135, 195, 255, 315].map(a => {
        const r = a * Math.PI / 180
        return <circle key={a} cx={80 + 20 * Math.cos(r)} cy={58 + 6.5 * Math.sin(r)} r={2.2} fill={T.gold} />
      })}
      {/* Center circle */}
      <circle cx="80" cy="58" r="7" fill={T.yellow} stroke={T.gold} strokeWidth="1.5" />
      <circle cx="80" cy="58" r="4" fill="#FFE050" />
      {/* Bottom drum rim */}
      <ellipse cx="80" cy="128" rx="62" ry="8" fill="#8A5018" stroke="#6A3808" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Traditional Seal SVG for CheckpointComplete ───────────────────────────

function TraditionalSeal({ char, name }: { char: string; name: string }) {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
      <defs>
        <radialGradient id="sealGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#C1272D" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C1272D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="90" cy="90" r="88" fill="url(#sealGlow)" />
      <rect x="14" y="14" width="152" height="152" rx="16" fill="#C1272D" />
      <rect x="10" y="10" width="160" height="160" rx="18" fill="none" stroke="#8B0000" strokeWidth="4" />
      <rect x="20" y="20" width="140" height="140" rx="12" fill="none" stroke="rgba(255,220,180,0.5)" strokeWidth="2" />
      <rect x="28" y="28" width="124" height="124" rx="8" fill="none" stroke="rgba(255,220,180,0.3)" strokeWidth="1" />
      {/* Corner ornaments */}
      {[[24, 24], [156, 24], [24, 156], [156, 156]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="5" fill="rgba(255,220,180,0.6)" />)}
      {/* Main character */}
      <text x="90" y="108" textAnchor="middle" fontSize="68" fill="rgba(255,245,220,0.95)" fontFamily="serif" fontWeight="bold">{char}</text>
      {/* Name banner */}
      <rect x="30" y="138" width="120" height="22" rx="4" fill="rgba(0,0,0,0.2)" />
      <text x="90" y="153" textAnchor="middle" fontSize="11" fill="rgba(255,245,220,0.85)" fontFamily="'Be Vietnam Pro', sans-serif" fontWeight="700">{name}</text>
    </svg>
  )
}

// ─── Mission header (shared) ───────────────────────────────────────────────

function MissionHeader({ cp, missionIdx, onBack, onHint }: {
  cp: CheckpointData; missionIdx: number; onBack: () => void; onHint: () => void
}) {
  return (
    <div style={{ background: T.card, borderBottom: `2px solid ${T.border}`, flexShrink: 0 }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pb-3">
        <BackButton onBack={onBack} />
        <div className="flex-1">
          <p style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {translateText('trạm')} {String(cp.id).padStart(2, '0')} · {cp.name}
          </p>
          <p style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: T.ink }}>
            {translateText('Câu hỏi')} {missionIdx + 1} / 5
          </p>
        </div>
        <button onClick={onHint} className="flex items-center gap-1.5 rounded-2xl px-3 py-2 active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #FFF8E0, #FFEFC0)', border: `1.5px solid ${T.gold}`, boxShadow: `0 2px 8px rgba(212,160,23,0.2)`, cursor: 'pointer' }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <span style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: '#8B6010' }}>Gợi ý</span>
        </button>
      </div>
      <div className="px-5 pb-4">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-full flex-1 transition-all" style={{ height: 7, background: i < missionIdx ? T.green : i === missionIdx ? T.red : T.muted, border: `1.5px solid ${i < missionIdx ? T.greenDark : i === missionIdx ? T.redDark : T.border}`, boxShadow: i === missionIdx ? `0 0 6px rgba(193,39,45,0.35)` : 'none' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Checkpoint Intro ─────────────────────────────────────────────

function ScreenCPIntro({ cp, progress, onStart, onBack }: {
  cp: CheckpointData; progress: CPProgress; onStart: () => void; onBack: () => void
}) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [cp.id])

  const cpColors: Record<number, string> = { 1: '#FFE8C0', 2: '#EEF7F2', 3: '#FFF8E0', 4: '#F5EED8', 5: '#FFF0F0', 6: '#F0EAF8', 7: '#FFF8E0' }
  const bgColor = cpColors[cp.id] ?? T.bg

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Illustration area */}
      <div className="relative flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ height: 280, background: `linear-gradient(180deg, ${bgColor} 0%, #FDF6E8 100%)` }}>
        <div className="absolute top-12 left-4 z-10"><BackButton onBack={onBack} /></div>
        <div className="absolute top-12 right-4 z-10 flex flex-col items-center justify-center rounded-2xl"
          style={{ width: 58, height: 58, background: T.red, border: `3px solid ${T.redDark}`, boxShadow: `0 3px 0 ${T.redDark}, 0 6px 16px rgba(193,39,45,0.35)`, transform: 'rotate(4deg)' }}>
          <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em' }}>{translateText('trạm')}</span>
          <span style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1 }}>{String(cp.id).padStart(2, '0')}</span>
        </div>
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'scale(1)' : 'scale(0.92)', transition: 'all 0.5s cubic-bezier(0.34,1.2,0.64,1)' }}>
          <CollectibleIllus cpId={cp.id} size={220} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #FDF6E8)' }} />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8" style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.4s ease 0.15s' }}>
        <StatusBar />
        <div className="flex items-center gap-2 mt-2 mb-3">
          <div className="rounded-full px-3 py-1" style={{ background: 'rgba(193,39,45,0.1)', border: `1px solid rgba(193,39,45,0.25)` }}>
            <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: '0.06em' }}>
              {translateText('trạm')} {String(cp.id).padStart(2, '0')} / 07
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <div className="rounded-full px-2 py-0.5" style={{ background: T.muted, border: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 600, color: T.mutedFg }}>{progress.missionsCompleted}/5 ✦</span>
          </div>
        </div>

        <h1 style={{ fontFamily: T.D, fontSize: 32, fontWeight: 800, color: T.ink, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 6 }}>{cp.name}</h1>
        <p style={{ fontFamily: T.UI, fontSize: 15, color: '#5A3E2E', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 20 }}>"{cp.shortDescription}"</p>

        {/* Challenge progress */}
        <div className="rounded-3xl p-4 mb-4" style={{ background: T.card, border: `2px solid ${T.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{translateText('thử thách')}</span>
            <div className="rounded-full px-3 py-0.5" style={{ background: '#FFF5F5', border: `1.5px solid ${T.red}` }}>
              <span style={{ fontFamily: T.D, fontSize: 15, fontWeight: 700, color: T.red }}>{progress.missionsCompleted} / 5</span>
            </div>
          </div>
          <ProgressDots total={5} done={progress.missionsCompleted} />
          <div className="mt-3 rounded-full overflow-hidden" style={{ height: 8, background: T.muted, border: `1px solid ${T.border}` }}>
            <div style={{ width: `${(progress.missionsCompleted / 5) * 100}%`, height: '100%', borderRadius: 9999, background: `linear-gradient(90deg, ${T.red}, #E03030)`, transition: 'width 0.4s ease' }} />
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 16 }}>🎁</span>
            <span style={{ fontFamily: T.UI, fontSize: 12, color: T.mutedFg, flex: 1 }}>{translateText('Phần thưởng hoàn thành')}</span>
            <span style={{ fontFamily: T.D, fontSize: 15, fontWeight: 700, color: T.gold }}>+{cp.missions.reduce((s, m) => s + m.xp, 0)} XP</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-5">
          {[
            { icon: '🔍', label: '5 thử thách', sub: 'Quan sát & giải đố' },
            {
              icon: '🎴',
              label: `${cp.missions.length} ${translateText('di vật')}`,
              sub: translateText('Vật phẩm sưu tập')
            },
            { icon: '⭐', label: `${cp.missions.reduce((s, m) => s + m.xp, 0)} XP`, sub: 'Tổng điểm thưởng' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: '#FFF8E8', border: `1.5px solid ${T.border}` }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontFamily: T.D, fontSize: 13, fontWeight: 700, color: T.ink }}>{label}</span>
              <span style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg, textAlign: 'center', lineHeight: 1.3, paddingInline: 4 }}>{sub}</span>
            </div>
          ))}
        </div>

        <button onClick={onStart} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
          style={{ height: 58, background: `linear-gradient(135deg, ${T.red} 0%, #E03030 100%)`, color: 'white', fontFamily: T.D, fontSize: 20, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 5px 0 ${T.redDark}, 0 10px 24px rgba(193,39,45,0.35)`, cursor: 'pointer' }}>
          ⚔️ {translateText('Nhận nhiệm vụ')}💡
        </button>
      </div>
    </div>
  )
}

// ─── Screen: Mission / Observation ────────────────────────────────────────

function ScreenMission({ cp, mission, missionIdx, onReady, onBack }: {
  cp: CheckpointData; mission: Mission; missionIdx: number; onReady: () => void; onBack: () => void
}) {
  const [dialogStep, setDialogStep] = useState(0)
  const [vis, setVis] = useState(false)
  useEffect(() => { setDialogStep(0); const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [mission.id])

  const lines = [
    mission.vanDongDialogue,
    `${translateText('Nhiệm vụ')}: ${mission.observationInstruction}`
  ];
  const isLast = dialogStep === lines.length - 1

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div style={{ background: T.card, borderBottom: `2px solid ${T.border}`, flexShrink: 0 }}>
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-3">
          <BackButton onBack={onBack} />
          <div className="flex-1">
            <p style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{translateText('trạm')} {String(cp.id).padStart(2, '0')} · {translateText('QUAN SÁT')} {missionIdx + 1}/5</p>
            <p style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: T.ink }}>{cp.name}</p>
          </div>
          <div className="rounded-2xl flex items-center justify-center" style={{ width: 44, height: 44, background: '#FFF5F5', border: `2px solid ${T.red}` }}>
            <span style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: T.red }}>{missionIdx + 1}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
        {/* Văn Đồng dialogue */}
        <div className="rounded-3xl mb-4 overflow-hidden" style={{ background: 'linear-gradient(160deg, #F5EDD0 0%, #EDE0C0 100%)', border: `2px solid ${T.gold}`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.4s ease' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${T.gold}, #FFD060, ${T.gold})` }} />
          <div className="flex items-start gap-3 p-4 pb-2">
            <div className="flex-shrink-0 relative">
              <div className="rounded-3xl overflow-hidden flex items-end justify-center" style={{ width: 64, height: 74, background: 'linear-gradient(160deg,#FFF0D0,#FFE0A0)', border: `2px solid ${T.gold}` }}>
                <VanDong size={58} mood={dialogStep === 1 ? 'thinking' : 'happy'} />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full px-2 py-0.5" style={{ background: T.plum, border: '2px solid white' }}>
                <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: 'white' }}>Văn Đồng</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="rounded-2xl rounded-tl-sm p-3 relative" style={{ background: 'white', border: `1.5px solid ${T.border}` }}>
                <div style={{ position: 'absolute', left: -10, top: 14, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `10px solid ${T.border}` }} />
                <div style={{ position: 'absolute', left: -8, top: 15, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: '9px solid white' }} />
                <p key={dialogStep} style={{ fontFamily: T.UI, fontSize: 14, color: '#4A3020', lineHeight: 1.65, fontStyle: 'italic', animation: 'fadeIn 0.3s ease' }}>"{lines[dialogStep]}"</p>
              </div>
              <div className="flex justify-end gap-1.5 mt-2 pr-1">
                {lines.map((_, i) => <div key={i} onClick={() => setDialogStep(i)} className="rounded-full cursor-pointer" style={{ width: i === dialogStep ? 18 : 7, height: 7, background: i === dialogStep ? T.gold : T.muted, border: `1.5px solid ${i === dialogStep ? T.yellowDark : T.border}`, transition: 'all 0.2s' }} />)}
              </div>
            </div>
          </div>
          {!isLast && (
            <button onClick={() => setDialogStep(s => s + 1)} className="w-full flex items-center justify-center gap-1 py-2.5 active:opacity-70" style={{ background: 'none', border: 'none', borderTop: `1px solid ${T.border}`, cursor: 'pointer' }}>
              <span style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 600, color: T.mutedFg }}>Tiếp →</span>
            </button>
          )}
        </div>

        {/* Mission card */}
        <div className="rounded-3xl overflow-hidden mb-4" style={{ background: T.card, border: `2px solid ${T.red}`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.45s ease 0.12s' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${T.red}, #E85C30, ${T.red})` }} />
          <div className="flex items-center gap-3 px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, background: '#FFF5F5', border: `2px solid ${T.red}` }}>
              <span style={{ fontSize: 22 }}>{mission.observationTag === 'QUAN SÁT' ? '🔭' : mission.observationTag === 'KIẾN THỨC' ? '📖' : '🧭'}</span>
            </div>
            <div>
              <p style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.red, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{mission.observationTag}</p>
              <p style={{ fontFamily: T.D, fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>{mission.observationInstruction}</p>
            </div>
          </div>
          {/* Hint */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-start gap-2 rounded-2xl p-3" style={{ background: 'rgba(245,200,66,0.12)', border: `1.5px solid rgba(212,160,23,0.35)` }}>
              <span style={{ fontSize: 16, lineHeight: 1.4 }}>👁️</span>
              <p style={{ fontFamily: T.UI, fontSize: 13, color: '#5A3E2E', lineHeight: 1.55 }}>{mission.putPhoneDown}</p>
            </div>
          </div>
          {/* Phone down nudge */}
          <div className="mx-4 mb-4 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: '#F0FAF4', border: `1.5px solid #BDD9CB` }}>
            <span style={{ fontSize: 20 }}>📵</span>
            <p style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 600, color: T.greenDark, lineHeight: 1.5 }}>{translateText('Đặt điện thoại xuống và quan sát thực tế xung quanh bạn!')}</p>
          </div>
        </div>

        {/* CTA */}
        <button onClick={onReady} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
          style={{ height: 56, background: `linear-gradient(135deg, ${T.green} 0%, #4AAA70 100%)`, color: 'white', fontFamily: T.D, fontSize: 19, fontWeight: 700, border: `2px solid ${T.greenDark}`, boxShadow: `0 4px 0 ${T.greenDark}, 0 8px 20px rgba(61,138,94,0.3)`, cursor: 'pointer', opacity: vis ? 1 : 0, transition: 'opacity 0.4s ease 0.3s' }}>
          ✅ {translateText('Tôi đã tìm thấy!')}
        </button>
      </div>
    </div>
  )
}

// ─── Screen: Puzzle ────────────────────────────────────────────────────────

function ScreenPuzzle({ cp, mission, missionIdx, onCorrect, onWrong, onBack, onHint }: {
  cp: CheckpointData; mission: Mission; missionIdx: number
  onCorrect: () => void; onWrong: () => void; onBack: () => void; onHint: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => { setSelected(null); setSubmitted(false) }, [mission.id])

  const chosen = mission.options.find(o => o.id === selected)

  const handleConfirm = () => {
    if (!selected || submitted) return
    setSubmitted(true)
    if (chosen?.correct) { setTimeout(onCorrect, 600) }
    else { setShake(true); setTimeout(() => setShake(false), 600); setTimeout(onWrong, 700) }
  }

  const cardStyle = (opt: typeof mission.options[0]) => {
    const sel = selected === opt.id, cRev = submitted && opt.correct, wRev = submitted && sel && !opt.correct
    if (cRev) return { bg: '#EFF8F3', border: `2.5px solid ${T.green}`, shadow: `0 0 0 3px rgba(61,138,94,0.15)` }
    if (wRev) return { bg: '#FFF5F5', border: `2.5px solid ${T.red}`, shadow: `0 0 0 3px rgba(193,39,45,0.15)` }
    if (sel) return { bg: '#FFF5F5', border: `2.5px solid ${T.red}`, shadow: `0 0 0 3px rgba(193,39,45,0.12), 0 4px 16px rgba(193,39,45,0.1)` }
    return { bg: T.card, border: `2px solid ${T.border}`, shadow: '0 2px 8px rgba(0,0,0,0.04)' }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <MissionHeader cp={cp} missionIdx={missionIdx} onBack={onBack} onHint={onHint} />

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {/* Question card */}
        <div className="rounded-3xl p-5" style={{ background: `linear-gradient(135deg, #4A1040 0%, #6A1858 100%)`, border: `2px solid #3A0830`, boxShadow: `0 4px 20px rgba(74,16,64,0.3)` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full px-2.5 py-0.5" style={{ background: 'rgba(245,200,66,0.25)', border: '1px solid rgba(245,200,66,0.4)' }}>
              <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.yellow, letterSpacing: '0.08em' }}>{mission.observationTag}</span>
            </div>
            <span style={{ fontFamily: T.UI, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>1 {translateText('đáp án đúng')}</span>
          </div>
          <p style={{ fontFamily: T.D, fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.4 }}>{mission.question}</p>
        </div>

        {/* Options 2×2 */}
        <div className="grid grid-cols-2 gap-3" style={{ animation: shake ? 'shake 0.5s ease' : 'none' }}>
          {mission.options.map(opt => {
            const sel = selected === opt.id, cRev = submitted && opt.correct, wRev = submitted && sel && !opt.correct
            const s = cardStyle(opt)
            return (
              <button key={opt.id} onClick={() => { if (!submitted) setSelected(opt.id) }}
                className="rounded-3xl p-4 flex flex-col items-center gap-2 transition-all active:scale-97 relative"
                style={{ background: s.bg, border: s.border, boxShadow: s.shadow, cursor: submitted ? 'default' : 'pointer', minHeight: 130 }}>
                {/* Emoji icon */}
                <div className="rounded-2xl flex items-center justify-center" style={{ width: 64, height: 64, background: cRev ? 'rgba(61,138,94,0.12)' : wRev ? 'rgba(193,39,45,0.08)' : sel ? 'rgba(193,39,45,0.07)' : '#F5EDD8', border: `1.5px solid ${cRev ? T.green : wRev || sel ? T.red : T.border}` }}>
                  <span style={{ fontSize: 32 }}>{opt.emoji}</span>
                </div>
                <div className="text-center">
                  <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: cRev ? T.green : wRev ? T.red : sel ? T.red : T.ink, lineHeight: 1.1 }}>{opt.label}</p>
                  <p style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg, marginTop: 2, lineHeight: 1.3 }}>{opt.sub}</p>
                </div>
                {cRev && <div className="absolute top-2 right-2 rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: T.green }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
                {wRev && <div className="absolute top-2 right-2 rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: T.red }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg></div>}
                {sel && !submitted && <div className="absolute top-2 right-2 rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: T.red, border: '2px solid white' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} /></div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 px-5 pt-3 pb-8" style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
        <button onClick={handleConfirm} disabled={!selected || submitted} className="w-full flex items-center justify-center gap-2 rounded-2xl transition-all active:translate-y-0.5"
          style={{ height: 56, background: selected && !submitted ? `linear-gradient(135deg, ${T.red} 0%, #E03030 100%)` : T.muted, color: selected && !submitted ? 'white' : T.mutedFg, fontFamily: T.D, fontSize: 19, fontWeight: 700, border: `2px solid ${selected && !submitted ? T.redDark : T.border}`, boxShadow: selected && !submitted ? `0 4px 0 ${T.redDark}, 0 8px 20px rgba(193,39,45,0.3)` : 'none', cursor: selected && !submitted ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease' }}>
          {submitted ? '⏳ Đang kiểm tra…' : '✅ Xác nhận'}
        </button>
      </div>
    </div>
  )
}

// ─── Hint Sheet ────────────────────────────────────────────────────────────

function HintSheet({ mission, onClose }: { mission: Mission; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(45,27,20,0.5)', backdropFilter: 'blur(3px)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full rounded-t-[32px]" style={{ background: T.bg, boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', animation: 'sheetUp 0.3s cubic-bezier(0.34,1.4,0.64,1)' }}>
        <div className="flex justify-center pt-3"><div className="rounded-full" style={{ width: 40, height: 4, background: T.border }} /></div>
        <div className="mx-4 mt-4 mb-3 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #F5EDD0 0%, #EDE0C0 100%)', border: `2px solid ${T.gold}`, boxShadow: `0 4px 16px rgba(212,160,23,0.2)` }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${T.gold}, #FFD060, ${T.gold})` }} />
          <div className="flex items-start gap-4 p-4">
            <div className="flex-shrink-0 relative">
              <div className="rounded-3xl overflow-hidden flex items-end justify-center" style={{ width: 64, height: 74, background: 'linear-gradient(160deg,#FFF0D0,#FFE0A0)', border: `2px solid ${T.gold}` }}>
                <VanDong size={58} mood="thinking" />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full px-2 py-0.5" style={{ background: T.plum, border: '2px solid white' }}>
                <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: 'white' }}>Gợi ý</span>
              </div>
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: T.D, fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 6 }}>{translateText('Gợi ý từ Văn Đồng')}</p>
              <div className="rounded-2xl p-3" style={{ background: 'white', border: `1.5px solid ${T.border}` }}>
                <p style={{ fontFamily: T.UI, fontSize: 14, color: '#4A3020', lineHeight: 1.65, fontStyle: 'italic' }}>"{mission.hint}"</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 pb-10">
          <button onClick={onClose} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
            style={{ height: 52, background: `linear-gradient(135deg, ${T.plum} 0%, #6A1858 100%)`, color: 'white', fontFamily: T.D, fontSize: 17, fontWeight: 700, border: `2px solid #3A0830`, boxShadow: `0 3px 0 #3A0830, 0 6px 16px rgba(74,16,64,0.3)`, cursor: 'pointer' }}>
            {translateText('Quay lại câu đố')} ←
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Correct ──────────────────────────────────────────────────────

function ScreenCorrect({ cp, mission, missionIdx, onNext }: {
  cp: CheckpointData; mission: Mission; missionIdx: number
  onNext: () => void
}) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 650)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [mission.id])

  const rarityConfig = { common: { bg: '#3D8A5E', label: 'Phổ thông', stars: 2 }, rare: { bg: '#C1272D', label: 'Hiếm', stars: 3 }, legendary: { bg: T.plum, label: 'Huyền thoại', stars: 5 } }
  const rc = rarityConfig[mission.collectibleRarity]

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'linear-gradient(160deg, #1A4A30 0%, #0E3020 40%, #1A1030 100%)' }}>
      {/* Sparkles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 430 932" fill="none">
        {[[40, 80, T.yellow], [380, 60, T.red], [60, 200, T.green], [360, 180, T.gold], [200, 40, 'white'], [120, 300, T.yellow], [310, 280, T.red]].map(([x, y, c], i) => (
          <g key={i} transform={`translate(${x},${y})`} style={{ animation: `sparkle ${0.8 + i * 0.12}s ease-out` }}>
            <path d="M0-6 L1.5-1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5-1.5 Z" fill={String(c)} opacity="0.7" />
          </g>
        ))}
      </svg>

      <div className="relative z-10 flex flex-col items-center px-5 pt-8 pb-10">
        {/* Correct badge */}
        <div style={{ opacity: phase > 0 ? 1 : 0, transform: phase > 0 ? 'scale(1)' : 'scale(0.5)', transition: 'all 0.4s cubic-bezier(0.34,1.6,0.64,1)', marginBottom: 10 }}>
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2" style={{ background: T.green, border: `2px solid ${T.greenDark}`, boxShadow: `0 4px 0 ${T.greenDark}, 0 8px 24px rgba(61,138,94,0.5)` }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>{translateText('CHÍNH XÁC!')}</span>
          </div>
        </div>

        {/* Collectible card */}
        <div style={{ opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'scale(1)' : 'scale(0.85)', transition: 'all 0.45s cubic-bezier(0.34,1.4,0.64,1) 0.1s', width: '100%' }}>
          <div className="rounded-[32px] overflow-hidden" style={{ background: 'linear-gradient(160deg, #1E6040 0%, #153A28 100%)', border: `3px solid ${T.green}`, boxShadow: `0 0 0 6px rgba(61,138,94,0.2), 0 12px 48px rgba(0,0,0,0.4)` }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(245,200,66,0.2)', border: '1px solid rgba(245,200,66,0.4)' }}>
                <span style={{ fontSize: 12 }}>⭐</span>
                <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.yellow, letterSpacing: '0.06em' }}>{rc.label}</span>
              </div>
              <div className="rounded-full px-3 py-1" style={{ background: 'rgba(193,39,45,0.3)', border: '1px solid rgba(193,39,45,0.5)' }}>
                <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: '#FF8888', letterSpacing: '0.04em' }}>🆕 {translateText('Vật phẩm mới')}</span>
              </div>
            </div>

            {/* Collectible illustration */}
            <div className="flex justify-center py-3">
              <div className="rounded-[28px] flex items-center justify-center" style={{ width: 200, height: 200, background: 'radial-gradient(ellipse at 50% 40%, rgba(61,138,94,0.3) 0%, rgba(13,40,26,0.6) 100%)', border: '2px solid rgba(61,138,94,0.4)' }}>
                <div style={{ fontSize: 60, textAlign: 'center' }}>
                  {cp.id === 1 && missionIdx === 0
                    ? <CollectibleIllus cpId={1} size={180} />
                    : <span style={{ fontSize: 72, display: 'block', lineHeight: 1 }}>{mission.collectibleEmoji}</span>
                  }
                </div>
              </div>
            </div>

            <div className="text-center px-4 pb-2">
              <h2 style={{ fontFamily: T.D, fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.01em' }}>{mission.collectibleName}</h2>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" fill={i < rc.stars ? T.yellow : 'none'} stroke={T.gold} strokeWidth="1.5" strokeLinejoin="round" /></svg>)}
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-3 mx-4 mb-4 rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex-1 flex items-center gap-2">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: 'rgba(245,200,66,0.2)' }}><span style={{ fontSize: 18 }}>⭐</span></div>
                <div><p style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: T.yellow, lineHeight: 1 }}>+{mission.xp}</p><p style={{ fontFamily: T.UI, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>điểm</p></div>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
              <div className="flex-1 flex items-center gap-2">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: 'rgba(193,39,45,0.25)' }}><span style={{ fontSize: 18 }}>🔑</span></div>
                <div><p style={{ fontFamily: T.D, fontSize: 13, fontWeight: 800, color: '#FF9090', lineHeight: 1.1 }}>Manh mối</p><p style={{ fontFamily: T.UI, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{translateText('mới mở khóa!')}</p></div>
              </div>
            </div>

            {/* Clue */}
            <div className="mx-4 mb-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>{translateText('Manh mối')}:</p>
              <p style={{ fontFamily: T.UI, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontStyle: 'italic' }}>"{mission.clueUnlocked}"</p>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 px-4 pb-5">
              <button onClick={onNext} className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl active:translate-y-0.5 transition-all"
                style={{ height: 52, background: `linear-gradient(135deg, ${T.yellow}, #FFD060)`, color: T.ink, fontFamily: T.D, fontSize: 16, fontWeight: 800, border: `2px solid ${T.yellowDark}`, boxShadow: `0 3px 0 ${T.yellowDark}, 0 6px 16px rgba(212,160,23,0.35)`, cursor: 'pointer' }}>
                🎴 {translateText('thu thập')}
              </button>
              <button onClick={onNext} className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl active:translate-y-0.5 transition-all"
                style={{ height: 52, background: `linear-gradient(135deg, ${T.green}, #4AAA70)`, color: 'white', fontFamily: T.D, fontSize: 16, fontWeight: 800, border: `2px solid ${T.greenDark}`, boxShadow: `0 3px 0 ${T.greenDark}, 0 6px 16px rgba(61,138,94,0.35)`, cursor: 'pointer' }}>
                Câu tiếp →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Wrong ─────────────────────────────────────────────────────────

function ScreenWrong({ onRetry, onHint }: { onRetry: () => void; onHint: () => void }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [])
  return (
    <div className="flex flex-col items-center justify-center h-full px-5" style={{ background: 'linear-gradient(160deg, #4A1010 0%, #300808 40%, #1E0C20 100%)' }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 430 932" fill="none">
        <circle cx="215" cy="466" r="300" stroke={T.red} strokeWidth="2" /><circle cx="215" cy="466" r="200" stroke={T.red} strokeWidth="1.5" /><circle cx="215" cy="466" r="100" stroke={T.red} strokeWidth="1" />
      </svg>
      <div className="relative z-10 flex flex-col items-center w-full" style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.45s ease' }}>
        <div className="flex items-center justify-center rounded-full mb-6" style={{ width: 100, height: 100, background: T.red, border: `5px solid ${T.redDark}`, boxShadow: `0 6px 0 ${T.redDark}, 0 12px 32px rgba(193,39,45,0.5)`, animation: 'wrongShake 0.5s ease 0.1s' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>
        </div>
        <p style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Chưa chính xác</p>
        <h1 style={{ fontFamily: T.D, fontSize: 34, fontWeight: 800, color: 'white', lineHeight: 1.05, textAlign: 'center', marginBottom: 14 }}>Thử lại thôi!</h1>
        <div className="w-full rounded-3xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl overflow-hidden flex items-end justify-center flex-shrink-0" style={{ width: 58, height: 66, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
              <VanDong size={54} mood="sad" />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Văn Đồng nhắn:</p>
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p style={{ fontFamily: T.UI, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontStyle: 'italic' }}>{translateText('\"Hãy quan sát thêm một lần nữa — câu trả lời đang đứng ngay trước mắt đệ!\"')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
            style={{
              height: 56,
              background: `linear-gradient(135deg, ${T.red}, #E03030)`,
              color: 'white',
              fontFamily: T.D,
              fontSize: 19,
              fontWeight: 700,
              border: `2px solid ${T.redDark}`,
              boxShadow: `0 4px 0 ${T.redDark}, 0 8px 20px rgba(193,39,45,0.35)`,
              cursor: 'pointer'
            }}
          >
            🔄 {translateText('Thử lại')}
          </button>

          <button
            onClick={onHint}
            className="w-full flex items-center justify-center gap-2 rounded-2xl active:scale-98 transition-all"
            style={{
              height: 48,
              background: 'transparent',
              color: T.yellow,
              fontFamily: T.D,
              fontSize: 16,
              fontWeight: 700,
              border: `2px solid rgba(245,200,66,0.4)`,
              cursor: 'pointer'
            }}
          >
            💡 {translateText('Xem gợi ý')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Checkpoint Complete ──────────────────────────────────────────

function ScreenCPComplete({ cp, progress, onContinue }: {
  cp: CheckpointData; progress: CPProgress; onContinue: () => void
}) {
  const [phase, setPhase] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // XP count-up
  useEffect(() => {
    if (phase < 2) return
    let frame = 0; const total = progress.xpEarned; const dur = 60
    const tick = () => { frame++; setCount(Math.min(Math.round((frame / dur) * total), total)); if (frame < dur) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }, [phase, progress.xpEarned])

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: `linear-gradient(160deg, #4A1040 0%, #2A0828 50%, #1A0818 100%)` }}>
      {/* Stars background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 430 932" fill="none">
        {Array.from({ length: 24 }).map((_, i) => {
          const x = 20 + ((i * 179) % 390), y = 20 + ((i * 137) % 500); const r = i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5
          return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={(0.2 + i * 0.03) % 0.7} />
        })}
        {[[40, 90, T.yellow], [390, 70, T.red], [80, 200, T.gold], [350, 180, T.yellow], [200, 50, 'white']].map(([x, y, c], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <path d="M0-8 L2-2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2-2 Z" fill={String(c)} opacity="0.6" />
          </g>
        ))}
      </svg>

      <div className="relative z-10 flex flex-col items-center px-5 pt-10 pb-10">
        {/* HOÀN THÀNH pill */}
        <div style={{ opacity: phase > 0 ? 1 : 0, transform: phase > 0 ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.4s ease', marginBottom: 12 }}>
          <div className="rounded-full px-5 py-2 flex items-center gap-2" style={{ background: 'rgba(245,200,66,0.2)', border: `1.5px solid rgba(245,200,66,0.5)` }}>
            <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.yellow, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{translateText('trạm')} {String(cp.id).padStart(2, '0')} / 07</span>
          </div>
        </div>

        {/* Seal animation */}
        <div style={{ opacity: phase > 0 ? 1 : 0, transform: phase > 0 ? 'scale(1) rotate(0deg)' : 'scale(1.8) rotate(-15deg)', transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s', marginBottom: 16, filter: phase > 0 ? `drop-shadow(0 0 24px rgba(193,39,45,0.6))` : 'none' }}>
          <TraditionalSeal char={cp.stampChar} name={cp.stampName} />
        </div>

        {/* Title */}
        <div style={{ opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.4s ease 0.2s', textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontFamily: T.D, fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.05, marginBottom: 4 }}>{translateText('HOÀN THÀNH TRẠM')}</h1>
          <h2 style={{ fontFamily: T.D, fontSize: 22, fontWeight: 700, color: T.yellow, lineHeight: 1.2 }}>{cp.name}</h2>
        </div>

        {/* Stats card */}
        <div style={{ opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.45s ease 0.35s', width: '100%', marginBottom: 16 }}>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            {[
              { icon: '⭐', label: 'Điểm tích lũy', value: `+${count}`, sub: 'XP' },
              { icon: '🔑', label: 'Manh mối khám phá', value: `${progress.cluesFound}`, sub: `/ ${cp.missions.length}` },
              { icon: '🎴', label: 'Di vật thu thập', value: `${progress.cluesFound}`, sub: translateText('Vật phẩm') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{item.label}</p>
                </div>
                <div className="text-right">
                  <span style={{ fontFamily: T.D, fontSize: 24, fontWeight: 800, color: 'white' }}>{item.value}</span>
                  <span style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New stamp collected */}
        <div style={{ opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.45s ease 0.5s', width: '100%', marginBottom: 24 }}>
          <div className="flex items-center gap-3 rounded-3xl p-4" style={{ background: `linear-gradient(135deg, rgba(193,39,45,0.3) 0%, rgba(74,16,64,0.3) 100%)`, border: '1.5px solid rgba(193,39,45,0.4)' }}>
            <div className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 56, height: 56, background: 'rgba(193,39,45,0.2)' }}>
              <span style={{ fontSize: 32 }}>📮</span>
            </div>
            <div>
              <p style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{translateText('Dấu son mới thu thập')}!</p>
              <p style={{ fontFamily: T.D, fontSize: 18, fontWeight: 700, color: 'white' }}>{cp.stampName}</p>
              <p style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{translateText('Thêm vào bộ sưu tập dấu son!')}</p>
            </div>
            <div className="ml-auto flex-shrink-0" style={{ opacity: 0.9 }}>
              <TraditionalSeal char={cp.stampChar} name="" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ opacity: phase > 1 ? 1 : 0, transition: 'opacity 0.4s ease 0.65s', width: '100%' }}>
          <button onClick={onContinue} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
            style={{ height: 60, background: `linear-gradient(135deg, ${T.red} 0%, #E03030 100%)`, color: 'white', fontFamily: T.D, fontSize: 20, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 5px 0 ${T.redDark}, 0 10px 28px rgba(193,39,45,0.4)`, cursor: 'pointer' }}>
            🗺️ {translateText('Tiếp tục hành trình')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Collection sticker ───────────────────────────────────────────────────

function StickerCard({ item, onTap }: { item: Collectible; onTap: () => void }) {
  const cc = CAT_COLOR[item.category]
  const stars = RARITY_STARS[item.rarity]

  if (!item.collected) {
    return (
      <button onClick={onTap} className="flex flex-col items-center justify-center rounded-3xl transition-transform active:scale-95"
        style={{ aspectRatio: '1', background: 'rgba(238,224,196,0.4)', border: `2px dashed ${T.border}`, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
        <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: T.muted, border: `2px solid ${T.border}` }}>
          <span style={{ fontFamily: T.D, fontSize: 26, fontWeight: 800, color: T.border }}>?</span>
        </div>
        <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 600, color: T.border, marginTop: 6, letterSpacing: '0.04em' }}>Chưa mở</span>
      </button>
    )
  }

  return (
    <button onClick={onTap} className="flex flex-col items-center justify-center rounded-3xl transition-transform active:scale-95 relative"
      style={{ aspectRatio: '1', background: `linear-gradient(145deg, white 0%, ${cc.bg} 100%)`, border: `2.5px solid ${cc.border}`, boxShadow: `0 4px 14px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)`, cursor: 'pointer', overflow: 'hidden' }}>
      {/* Holographic sheen */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)', borderRadius: 'inherit' }} />
      {/* Rarity indicator */}
      <div className="absolute top-1.5 right-2 flex gap-0.5">
        {Array.from({ length: Math.min(stars, 3) }).map((_, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: item.rarity === 'legendary' ? T.gold : item.rarity === 'rare' ? T.red : T.mutedFg, opacity: 0.8 }} />)}
      </div>
      {/* Emoji */}
      <div className="flex items-center justify-center" style={{ width: 52, height: 52, fontSize: 34, lineHeight: 1 }}>{item.emoji}</div>
      <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: cc.text, marginTop: 4, letterSpacing: '0.02em', textAlign: 'center', paddingInline: 4, lineHeight: 1.2 }}>{item.name}</span>
    </button>
  )
}

// ─── Screen: Collection ────────────────────────────────────────────────────

type FilterTab = 'Tất cả' | CollectCategory
const FILTER_TABS: FilterTab[] = ['Tất cả', 'Linh vật', 'Kiến trúc', 'Biểu tượng', 'Vật phẩm']

function ScreenCollection({ onSelectItem, onBack, onGoMap, onGoProfile }: {
  onSelectItem: (id: string) => void; onBack: () => void; onGoMap: () => void; onGoProfile: () => void
}) {
  const [filter, setFilter] = useState<FilterTab>('Tất cả')
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const filtered = filter === 'Tất cả' ? COLLECTIBLES : COLLECTIBLES.filter(c => c.category === filter)
  const total = COLLECTIBLES.length
  const collected = COLLECTIBLES.filter(c => c.collected).length
  const pct = Math.round((collected / total) * 100)

  const catIcons: Record<FilterTab, string> = {
    'Tất cả': '✦',
    'Linh vật': '🦁',
    'Kiến trúc': '🏛️',
    'Biểu tượng': '⭐',
    'Vật phẩm': '🏺',
    // EN equivalents
    // 'Guardian': '🦁',
    // 'Architecture': '🏛️',
    // 'Symbol': '⭐',
    // 'Item': '🏺',
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>

      {/* Header */}
      <div className="flex-shrink-0" style={{ background: T.card, borderBottom: `2px solid ${T.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-2">
          <BackButton onBack={onBack} />
          <div className="flex-1">
            <h1 style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: T.ink, lineHeight: 1.1 }}>Bộ sưu tập</h1>
            <p style={{ fontFamily: T.UI, fontSize: 12, color: T.mutedFg }}>{collected}/{total} {translateText('Manh mối')} · {pct}% {translateText('Hoàn thành')}</p>
          </div>
          <div className="rounded-2xl flex items-center justify-center" style={{ width: 44, height: 44, background: '#FFF5F5', border: `2px solid ${T.red}` }}>
            <span style={{ fontSize: 22 }}>🎴</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-3">
          <div className="rounded-full overflow-hidden" style={{ height: 8, background: T.muted, border: `1px solid ${T.border}` }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: `linear-gradient(90deg, ${T.red}, #E03030)`, transition: 'width 0.5s ease' }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg, fontWeight: 600 }}>📦{translateText('Album thám tử')}</span>
            <span style={{ fontFamily: T.UI, fontSize: 10, color: T.red, fontWeight: 700 }}>{collected} / {total} {translateText('Vật phẩm')}</span>
          </div>
        </div>

        {/* Category stats row */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {(['Linh vật', 'Kiến trúc', 'Biểu tượng', 'Vật phẩm'] as CollectCategory[]).map(cat => {
            const catItems = COLLECTIBLES.filter(c => c.category === cat)
            const catDone = catItems.filter(c => c.collected).length
            const cc = CAT_COLOR[cat]
            return (
              <div key={cat} className="flex-shrink-0 rounded-2xl px-3 py-1.5 flex items-center gap-1.5" style={{ background: cc.bg, border: `1.5px solid ${cc.border}` }}>
                <span style={{ fontSize: 12 }}>{catIcons[cat]}</span>
                <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: cc.text }}>{catDone}/{catItems.length}</span>
              </div>
            )
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-5 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {FILTER_TABS.map(tab => {
            const active = tab === filter
            return (
              <button key={tab} onClick={() => setFilter(tab)} className="flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 transition-all active:scale-95"
                style={{ fontFamily: T.UI, fontSize: 12, fontWeight: active ? 700 : 500, background: active ? T.red : 'transparent', color: active ? 'white' : T.mutedFg, border: `1.5px solid ${active ? T.red : T.border}`, cursor: 'pointer', boxShadow: active ? `0 2px 8px rgba(193,39,45,0.25)` : 'none', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 11 }}>{catIcons[tab]}</span> {translateText(tab)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-3" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <span style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {filter === 'Tất cả'
              ? `${translateText('Toàn bộ')} (${filtered.length})`
              : `${translateText(filter)} (${filtered.length})`}
          </span>
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <span style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg }}>{filtered.filter(c => c.collected).length} {translateText('thu thập')}</span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {filtered.map((item, i) => (
            <div key={item.id} style={{ opacity: vis ? 1 : 0, transform: vis ? 'scale(1)' : 'scale(0.88)', transition: `opacity 0.3s ease ${i * 18}ms, transform 0.3s cubic-bezier(0.34,1.4,0.64,1) ${i * 18}ms` }}>
              <StickerCard item={item} onTap={() => onSelectItem(item.id)} />
            </div>
          ))}
        </div>

        {/* Locked hint */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(238,224,196,0.4)', border: `1px dashed ${T.border}` }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <p style={{ fontFamily: T.UI, fontSize: 12, color: T.mutedFg, lineHeight: 1.5 }}>{translateText('Hoàn thành các nhiệm vụ trong bản đồ để mở khóa thêm vật phẩm!')}</p>
        </div>
      </div>

      <BottomNav active="collection" onHome={onBack} onMap={onGoMap} onCollection={() => { }} onProfile={onGoProfile} />
    </div>
  )
}

// ─── Screen: Collectible Detail ────────────────────────────────────────────

function ScreenCollectibleDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const item = COLLECTIBLES.find(c => c.id === id)!
  const cc = CAT_COLOR[item.category]
  const stars = RARITY_STARS[item.rarity]
  const rarityLabel = { common: 'Phổ thông', rare: 'Hiếm', legendary: 'Huyền thoại' }[item.rarity]
  const rarityColor = { common: T.green, rare: T.red, legendary: T.plum }[item.rarity]

  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: T.bg }}>

      {/* Hero area */}
      <div className="relative flex-shrink-0 flex flex-col items-center justify-end" style={{ background: `linear-gradient(160deg, ${cc.bg} 0%, #FDF6E8 100%)`, minHeight: 300, paddingBottom: 24 }}>
        {/* Back */}
        <div className="absolute top-12 left-4 z-10"><BackButton onBack={onBack} /></div>

        {/* Rarity ribbon */}
        <div className="absolute top-12 right-4 rounded-2xl px-3 py-1.5 flex items-center gap-1.5" style={{ background: rarityColor, border: `2px solid rgba(0,0,0,0.15)`, boxShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
          <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>{rarityLabel}</span>
        </div>

        <StatusBar />

        {/* Large sticker */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'scale(1)' : 'scale(0.7)', transition: 'all 0.55s cubic-bezier(0.34,1.5,0.64,1) 0.05s', marginTop: 16 }}>
          {item.collected ? (
            <div className="rounded-[36px] flex flex-col items-center justify-center" style={{ width: 200, height: 200, background: `linear-gradient(145deg, white 0%, ${cc.bg} 100%)`, border: `4px solid ${cc.border}`, boxShadow: `0 12px 40px rgba(0,0,0,0.14), 0 0 0 8px ${cc.bg}, 0 0 0 10px ${cc.border}`, position: 'relative', overflow: 'hidden' }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, transparent 60%)', borderRadius: 'inherit' }} />
              <span style={{ fontSize: 84, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>{item.emoji}</span>
            </div>
          ) : (
            <div className="rounded-[36px] flex flex-col items-center justify-center" style={{ width: 200, height: 200, background: `rgba(238,224,196,0.5)`, border: `4px dashed ${T.border}` }}>
              <span style={{ fontFamily: T.D, fontSize: 72, fontWeight: 800, color: T.border }}>?</span>
            </div>
          )}
        </div>

        {/* Star rating */}
        <div className="flex gap-1 mt-4" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease 0.25s' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
                fill={i < stars ? T.gold : 'none'} stroke={i < stars ? T.yellowDark : T.border} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #FDF6E8)' }} />
      </div>

      {/* Content */}
      <div className="px-5 pt-2 pb-10 flex flex-col gap-4" style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(18px)', transition: 'all 0.4s ease 0.15s' }}>

        {/* Name + category */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="rounded-full px-3 py-1 flex items-center gap-1.5" style={{ background: cc.bg, border: `1.5px solid ${cc.border}` }}>
              <span style={{ fontSize: 12 }}>{{ Linh_vat: '🦁', Kien_truc: '🏛️', Bieu_tuong: '⭐', Vat_pham: '🏺' }[item.category.replace(/ /g, '_')] ?? '✦'}</span>
              <span style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: cc.text }}>{item.category}</span>
            </div>
            {!item.collected && (
              <div className="rounded-full px-3 py-1" style={{ background: T.muted, border: `1.5px solid ${T.border}` }}>
                <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 600, color: T.mutedFg }}>🔒{translateText('Chưa mở khóa')}</span>
              </div>
            )}
          </div>
          <h1 style={{ fontFamily: T.D, fontSize: 36, fontWeight: 800, color: T.ink, lineHeight: 1.05, letterSpacing: '-0.01em' }}>{item.name}</h1>
        </div>

        {/* Info cards */}
        <div className="flex gap-2.5">
          <div className="flex-1 rounded-2xl p-3.5" style={{ background: T.card, border: `1.5px solid ${T.border}` }}>
            <p style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Tìm thấy tại</p>
            <p style={{ fontFamily: T.D, fontSize: 15, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>📍 {item.foundAt}</p>
          </div>
          <div className="flex-1 rounded-2xl p-3.5" style={{ background: T.card, border: `1.5px solid ${T.border}` }}>
            <p style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Nhiệm vụ</p>
            <p style={{ fontFamily: T.D, fontSize: 15, fontWeight: 700, color: T.red, lineHeight: 1.2 }}>⚔️ {item.missionRef}</p>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-3xl p-4" style={{ background: T.card, border: `2px solid ${T.border}` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: T.border }} />
            <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mô tả văn hoá</span>
            <div className="h-px flex-1" style={{ background: T.border }} />
          </div>
          <p style={{ fontFamily: T.UI, fontSize: 14, color: '#4A3020', lineHeight: 1.75 }}>{item.description}</p>
        </div>

        {/* How to unlock (if locked) */}
        {!item.collected && (
          <div className="rounded-3xl p-4 flex items-start gap-3" style={{ background: 'linear-gradient(135deg, #FFF5F5, #FFF0F0)', border: `2px solid #F0C0C0` }}>
            <span style={{ fontSize: 24 }}>🔒</span>
            <div>
              <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 700, color: T.red, marginBottom: 3 }}>Chưa mở khóa</p>
              <p style={{ fontFamily: T.UI, fontSize: 13, color: '#7A3030', lineHeight: 1.55 }}>{translateText('Hoàn thành')} <strong>{item.missionRef}</strong> {translateText('tại')} <strong>{item.foundAt}</strong> {translateText('để thu thập vật phẩm này.')}</p>
            </div>
          </div>
        )}

        {/* Collected badge */}
        {item.collected && (
          <div className="rounded-3xl p-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #EFF8F3, #E4F4EC)', border: `2px solid #AADFBE` }}>
            <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, background: T.green }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 700, color: T.green, marginBottom: 2 }}>Đã thu thập!</p>
              <p style={{ fontFamily: T.UI, fontSize: 12, color: T.greenDark, lineHeight: 1.45 }}>{translateText('Vật phẩm này đã được thêm vào bộ sưu tập của bạn.')}</p>
            </div>
          </div>
        )}

        {/* Back CTA */}
        <button onClick={onBack} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
          style={{ height: 56, background: `linear-gradient(135deg, ${T.plum}, #6A1858)`, color: 'white', fontFamily: T.D, fontSize: 18, fontWeight: 700, border: `2px solid #3A0830`, boxShadow: `0 4px 0 #3A0830, 0 8px 20px rgba(74,16,64,0.3)`, cursor: 'pointer' }}>
          ← {translateText('Quay lại bộ sưu tập')}
        </button>
      </div>
    </div>
  )
}

// ─── Achievements data ────────────────────────────────────────────────────

interface Achievement {
  id: string
  emoji: string
  title: string
  desc: string
  /** returns true if unlocked given progress snapshot */
  check: (cps: Record<number, CPProgress>, collectCount: number) => boolean
  bgFrom: string
  bgTo: string
  border: string
}
// ─── Screen: Profile hub ───────────────────────────────────────────────────
const TEAM_MEMBERS = ['Minh', 'Linh', 'Hùng']

function ScreenProfile({ gameState, displayName, onBack, onGoPassport, onGoHelp, onGoCertificate, onGoHome, onGoMap, onGoCollection, onLogout, language, onToggleLanguage }: {
  gameState: GameState
  displayName: string
  onBack: () => void
  onGoPassport: () => void
  onGoHelp: () => void
  onGoCertificate: () => void
  onGoHome: () => void
  onGoMap: () => void
  onGoCollection: () => void
  onLogout: () => Promise<void>
  language: Language
  onToggleLanguage: () => void
}) {
  const totalXP = Object.values(gameState.cpProgress).reduce((s, p) => s + p.xpEarned, 0)
  const completedCount = CHECKPOINTS.filter(cp => (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) >= 5).length
  const cluesCount = Object.values(gameState.cpProgress).reduce((s, p) => s + p.cluesFound, 0)
  const collectCount = COLLECTIBLES.filter(c => c.collected).length
  const achCount = ACHIEVEMENTS.filter(a => a.check(gameState.cpProgress, collectCount)).length
  const missionsDone = Object.values(gameState.cpProgress).reduce((s, p) => s + p.missionsCompleted, 0)

  const level = totalXP < 100 ? 1 : totalXP < 300 ? 2 : totalXP < 600 ? 3 : totalXP < 1000 ? 4 : 5
  const levelNames = ['', 'Học Sinh', 'Tú Tài', 'Cử Nhân', 'Tiến Sĩ', 'Trạng Nguyên']
  const levelNextXP = [0, 100, 300, 600, 1000, 9999]
  const xpProgress = level < 5 ? ((totalXP - levelNextXP[level - 1]) / (levelNextXP[level] - levelNextXP[level - 1])) * 100 : 100

  const [vis, setVis] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t) }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setLoggingOut(false)
    }
  }

  type MenuItem = {
    icon: string
    label: string
    sub: string
    action?: () => void
    accent: string
  }

  const menuSections: MenuItem[] = [
    { icon: '🗺️', label: 'Hành trình của tôi', sub: `${completedCount}/7 trạm · ${missionsDone} nhiệm vụ`, action: onGoPassport, accent: T.green },
    { icon: '🏅', label: translateText('Thành tựu'), sub: `${achCount}/${ACHIEVEMENTS.length} ${translateText('đã mở khóa')}`, action: onGoPassport, accent: T.red },
    { icon: '📜', label: 'Chứng nhận', sub: completedCount >= 7 ? 'Sẵn sàng nhận chứng nhận' : `Hoàn thành ${completedCount}/7 trạm`, action: onGoCertificate, accent: T.gold },
    { icon: '🌐', label: 'Ngôn ngữ', sub: language === 'vi' ? 'Tiếng Việt → English' : 'English → Tiếng Việt', action: onToggleLanguage, accent: T.plum },
    { icon: '❓', label: 'Trợ giúp', sub: 'Hướng dẫn · FAQ · Liên hệ', action: onGoHelp, accent: '#2563EB' },
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Scrollable content above nav */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 74 }}>
        {/* Header band */}
        <div className="flex-shrink-0" style={{ background: `linear-gradient(160deg, ${T.plum} 0%, #6A1858 100%)` }}>
          <StatusBar light />
          <div className="flex items-center gap-3 px-5 pb-5">
            <BackButton onBack={onBack} light />
            <p style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: 'white' }}>Hồ sơ</p>
          </div>
        </div>

        {/* Team card — overlaps header */}
        <div className="px-5 -mt-3 relative z-10" style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.4s cubic-bezier(0.34,1.2,0.64,1)' }}>
          <div className="rounded-3xl overflow-hidden" style={{ background: T.card, border: `2px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {/* Gold top accent */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${T.gold}, #FFD060, ${T.gold})` }} />

            <div className="flex items-center gap-4 px-5 pt-4 pb-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="rounded-3xl overflow-hidden flex items-center justify-center" style={{ width: 72, height: 72, background: `linear-gradient(145deg, #FFF0D0, #FFE0A0)`, border: `3px solid ${T.gold}`, boxShadow: `0 3px 0 ${T.yellowDark}` }}>
                  <TeamAvatar size={66} />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 rounded-full flex items-center justify-center" style={{ width: 24, height: 24, background: T.red, border: '2.5px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <span style={{ fontFamily: T.D, fontSize: 11, fontWeight: 800, color: 'white' }}>{level}</span>
                </div>
              </div>

              {/* Name + level */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mb-1" style={{ background: 'rgba(193,39,45,0.1)', border: `1px solid rgba(193,39,45,0.25)` }}>
                  <span style={{ fontSize: 11 }}>🎓</span>
                  <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.red, letterSpacing: '0.05em' }}>{translateText('Cấp')} {level} · {levelNames[level]}</span>
                </div>
                <p style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: T.ink, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
                {/* Member chips */}
                <div className="flex gap-1.5 mt-1.5">
                  {TEAM_MEMBERS.map(m => (
                    <div key={m} className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: T.muted, border: `1px solid ${T.border}` }}>
                      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 14, height: 14, background: T.plum }}>
                        <span style={{ fontFamily: T.D, fontSize: 8, fontWeight: 800, color: 'white' }}>{m[0]}</span>
                      </div>
                      <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 600, color: T.mutedFg }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* XP display */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-3 py-2.5" style={{ background: '#FFF5F5', border: `2px solid ${T.red}` }}>
                <span style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: T.red, lineHeight: 1 }}>{totalXP}</span>
                <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.06em', marginTop: 1 }}>{translateText('Điểm')}</span>
              </div>
            </div>

            {/* XP progress bar */}
            {level < 5 && (
              <div className="px-5 pb-4">
                <div className="flex justify-between mb-1.5">
                  <span style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg, fontWeight: 600 }}>{translateText('Cấp')}  {level} → {translateText('Cấp')}  {level + 1} ({levelNames[level + 1]})</span>
                  <span style={{ fontFamily: T.UI, fontSize: 10, color: T.red, fontWeight: 700 }}>{totalXP} / {levelNextXP[level]} XP</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 8, background: T.muted, border: `1px solid ${T.border}` }}>
                  <div style={{ width: `${xpProgress}%`, height: '100%', borderRadius: 9999, background: `linear-gradient(90deg, ${T.red}, #E03030)`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2.5 px-5 mt-4" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease 0.1s' }}>
          {[
            { icon: '📮', val: `${completedCount}/7`, label: 'Con dấu' },
            { icon: '🔑', val: `${cluesCount}`, label: 'Manh mối' },
            { icon: '🎴', val: `${collectCount}/35`, label: 'Vật phẩm' },
            { icon: '🏅', val: `${achCount}`, label: 'Thành tựu' },
          ].map(s => (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5 rounded-2xl py-3" style={{ background: T.card, border: `1.5px solid ${T.border}` }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{s.val}</span>
              <span style={{ fontFamily: T.UI, fontSize: 9, color: T.mutedFg, fontWeight: 600, textAlign: 'center' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Checkpoint progress bar */}
        <div className="mx-5 mt-4 rounded-2xl px-4 py-3" style={{ background: T.card, border: `1.5px solid ${T.border}`, opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease 0.15s' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tiến trình 7 trạm</span>
            <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.green }}>{Math.round((completedCount / 7) * 100)}%</span>
          </div>
          <div className="flex gap-1.5">
            {CHECKPOINTS.map(cp => {
              const done = (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) >= 5
              const cur = !done && CHECKPOINTS.find(c => (gameState.cpProgress[c.id]?.missionsCompleted ?? 0) < 5)?.id === cp.id
              return (
                <div key={cp.id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="rounded-full" style={{ height: 8, width: '100%', background: done ? T.green : cur ? T.red : T.muted, border: `1.5px solid ${done ? T.greenDark : cur ? T.redDark : T.border}`, boxShadow: cur ? `0 0 6px rgba(193,39,45,0.4)` : 'none' }} />
                  <span style={{ fontFamily: T.D, fontSize: 8, fontWeight: 700, color: done ? T.green : cur ? T.red : T.border }}>{cp.id}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Menu sections */}
        <div className="px-5 mt-5 pb-10 flex flex-col gap-2" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease 0.2s' }}>
          {menuSections.map((item, i) => (
            <button key={i} onClick={item.action} disabled={!item.action} className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 w-full text-left transition-all active:scale-98"
              style={{ background: T.card, border: `1.5px solid ${T.border}`, cursor: item.action ? 'pointer' : 'default', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: `${item.accent}18`, border: `1.5px solid ${item.accent}30` }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: T.UI, fontSize: 14, fontWeight: 700, color: T.ink, lineHeight: 1.1 }}>{item.label}</p>
                <p style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, marginTop: 1 }}>{item.sub}</p>
              </div>
              {item.action && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke={T.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {!item.action && <span style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg }}>VI</span>}
            </button>
          ))}

          {/* App version */}
          <p style={{ fontFamily: T.UI, fontSize: 11, color: T.border, textAlign: 'center', marginTop: 8 }}>Mật Mã Thăng Long · v1.0.0</p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 rounded-2xl w-full active:scale-[0.98] transition-transform"
            style={{ minHeight: 52, marginTop: 12, background: '#FFF0F0', border: `1.5px solid ${T.red}`, color: T.red, fontFamily: T.UI, fontSize: 14, fontWeight: 700, cursor: loggingOut ? 'wait' : 'pointer', opacity: loggingOut ? 0.65 : 1 }}
          >
            <span aria-hidden="true">↪</span>
          {loggingOut ? translateText('Đang đăng xuất...') : translateText('Đăng xuất')}
          </button>
        </div>
      </div>{/* end scrollable */}
      <BottomNav active="profile" onHome={onGoHome} onMap={onGoMap} onCollection={onGoCollection} onProfile={() => { }} />
    </div>
  )
}

// ─── Screen: Help ──────────────────────────────────────────────────────────

interface HelpSection {
  id: string
  icon: string
  title: string
  content: string
}

function ScreenHelp({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<string | null>('how-to-play')
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t) }, [])

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header */}
      <div className="flex-shrink-0" style={{ background: T.card, borderBottom: `2px solid ${T.border}` }}>
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-3">
          <BackButton onBack={onBack} />
          <div className="flex-1">
            <h1 style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: T.ink }}>Trợ giúp</h1>
          </div>
          <div className="rounded-2xl overflow-hidden flex items-end justify-center" style={{ width: 44, height: 50, background: 'linear-gradient(160deg,#FFF0D0,#FFE0A0)', border: `2px solid ${T.gold}` }}>
            <VanDong size={40} mood="happy" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10">
        {/* Văn Đồng intro bubble */}
        <div className="flex items-start gap-3 mb-5 rounded-3xl p-4" style={{ background: 'linear-gradient(160deg,#F5EDD0,#EDE0C0)', border: `2px solid ${T.gold}`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.35s ease' }}>
          <div style={{ height: 3, display: 'none' }} />
          <div className="rounded-2xl overflow-hidden flex items-end justify-center flex-shrink-0" style={{ width: 52, height: 60, background: 'linear-gradient(160deg,#FFF0D0,#FFE0A0)', border: `1.5px solid ${T.gold}` }}>
            <VanDong size={46} mood="happy" />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: T.D, fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{translateText('Văn Đồng hướng dẫn')}</p>
            <p style={{ fontFamily: T.UI, fontSize: 13, color: '#4A3020', lineHeight: 1.6, fontStyle: 'italic' }}>
              {translateText('\"Chào đệ! Ta ở đây để giúp đệ chinh phục Văn Miếu. Hỏi bất cứ điều gì — ta biết tất cả bí mật nơi này!\"')}
            </p>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="flex flex-col gap-2">
          {HELP_SECTIONS.map((sec, i) => {
            const isOpen = open === sec.id
            return (
              <div key={sec.id} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(10px)', transition: `all 0.3s ease ${i * 50 + 100}ms` }}>
                <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border: `1.5px solid ${isOpen ? T.red : T.border}`, boxShadow: isOpen ? `0 0 0 3px rgba(193,39,45,0.08)` : 'none', transition: 'all 0.2s ease' }}>
                  {/* Section header — tap to toggle */}
                  <button onClick={() => setOpen(isOpen ? null : sec.id)} className="flex items-center gap-3 px-4 py-3.5 w-full text-left"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: isOpen ? 'rgba(193,39,45,0.1)' : T.muted, border: `1.5px solid ${isOpen ? 'rgba(193,39,45,0.25)' : T.border}`, transition: 'all 0.2s' }}>
                      <span style={{ fontSize: 18 }}>{sec.icon}</span>
                    </div>
                    <p style={{ flex: 1, fontFamily: T.UI, fontSize: 14, fontWeight: 700, color: isOpen ? T.red : T.ink, transition: 'color 0.2s' }}>{sec.title}</p>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}>
                      <path d="M6 9l6 6 6-6" stroke={isOpen ? T.red : T.mutedFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 16px 16px' }}>
                      {sec.content.split('\n').map((line, j) => (
                        line === '' ? <div key={j} style={{ height: 6 }} /> :
                          <p key={j} style={{ fontFamily: T.UI, fontSize: 13, color: line.startsWith('•') || /^\d+\./.test(line) ? '#4A3020' : T.mutedFg, lineHeight: 1.7, marginBottom: 1, paddingLeft: line.startsWith('  ') ? 12 : 0, fontWeight: line.startsWith('•') || /^\d+\./.test(line) ? 500 : 400 }}>
                            {line.replace(/^\s+/, '')}
                          </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(238,224,196,0.4)', border: `1px dashed ${T.border}` }}>
          <span style={{ fontSize: 18 }}>🏛️</span>
          <p style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, lineHeight: 1.55 }}>
            {translateText('Văn Miếu – Quốc Tử Giám mở cửa từ')} <strong>7:30 – 17:30</strong> {translateText('hàng ngày. Hành trình kéo dài khoảng')} <strong>90 {translateText('phút')}</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Shared BottomNav ─────────────────────────────────────────────────────

type NavTab = 'home' | 'map' | 'collection' | 'profile'

function BottomNav({ active, onHome, onMap, onCollection, onProfile }: {
  active: NavTab
  onHome: () => void
  onMap: () => void
  onCollection: () => void
  onProfile: () => void
}) {
  const tabs = [
    { id: 'home' as NavTab, icon: '🏠', label: 'Trang chủ', action: onHome },
    { id: 'map' as NavTab, icon: '🗺️', label: 'Bản đồ', action: onMap },
    { id: 'collection' as NavTab, icon: '🎴', label: 'Bộ sưu tập', action: onCollection },
    { id: 'profile' as NavTab, icon: '🎓', label: 'Hồ sơ', action: onProfile },
  ]
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="flex items-center" style={{ height: 74, background: T.card, borderTop: `2px solid ${T.border}`, paddingBottom: 10 }}>
        {tabs.map(tab => {
          const isActive = tab.id === active
          return (
            <button key={tab.id} onClick={tab.action} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="rounded-2xl flex items-center justify-center" style={{ width: 44, height: 34, background: isActive ? 'rgba(193,39,45,0.1)' : 'transparent' }}>
                <span style={{ fontSize: 22, filter: isActive ? 'none' : 'grayscale(40%) opacity(0.65)' }}>{tab.icon}</span>
              </div>
              <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? T.red : T.mutedFg }}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Screen: Home dashboard ────────────────────────────────────────────────

function TeamAvatar({ size = 80 }: { size?: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 96 96" fill="none">
      <circle cx="48" cy="48" r="46" fill="linear-gradient(135deg,#FFF0D0,#FFE0A0)" />
      <circle cx="48" cy="48" r="46" fill="#FFF0D0" />
      <circle cx="48" cy="48" r="44" fill="none" stroke={T.gold} strokeWidth="3" />
      {/* Center scholar */}
      <ellipse cx="48" cy="62" rx="14" ry="18" fill={T.plum} />
      <circle cx="48" cy="44" rx="11" ry="11" fill="#C8A882" />
      {/* Hat */}
      <ellipse cx="48" cy="34" rx="14" ry="4" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      <rect x="43" y="28" width="10" height="8" rx="2" fill={T.red} />
      <circle cx="48" cy="28" r="3" fill={T.gold} />
      {/* Left scholar */}
      <ellipse cx="24" cy="66" rx="11" ry="15" fill="#3D8A5E" />
      <circle cx="24" cy="50" r="9" fill="#C8A882" />
      <ellipse cx="24" cy="42" rx="10" ry="3" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      <rect x="20" y="37" width="8" height="6" rx="1.5" fill="#C1272D" />
      {/* Right scholar */}
      <ellipse cx="72" cy="66" rx="11" ry="15" fill="#4A1040" />
      <circle cx="72" cy="50" r="9" fill="#C8A882" />
      <ellipse cx="72" cy="42" rx="10" ry="3" fill={T.gold} stroke={T.yellowDark} strokeWidth="1" />
      <rect x="68" y="37" width="8" height="6" rx="1.5" fill={T.red} />
      {/* Bottom arc */}
      <path d="M18 80 Q48 92 78 80" stroke={T.gold} strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  )
}


function ScreenHome({ gameState, displayName, onGoCheckpoint, onGoMap, onGoCollection, onGoProfile, onGoPassport }: {
  gameState: GameState
  displayName: string
  onGoCheckpoint: (cpIdx: number) => void
  onGoMap: () => void
  onGoCollection: () => void
  onGoProfile: () => void
  onGoPassport: () => void
}) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t) }, [])

  const totalXP = Object.values(gameState.cpProgress).reduce((s, p) => s + p.xpEarned, 0)
  const completedCount = CHECKPOINTS.filter(cp => (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) >= 5).length
  const cluesCount = Object.values(gameState.cpProgress).reduce((s, p) => s + p.cluesFound, 0)
  const collectCount = COLLECTIBLES.filter(c => c.collected).length
  const achCount = ACHIEVEMENTS.filter(a => a.check(gameState.cpProgress, collectCount)).length

  const level = totalXP < 100 ? 1 : totalXP < 300 ? 2 : totalXP < 600 ? 3 : totalXP < 1000 ? 4 : 5
  const levelNames = ['', 'Học Sinh', 'Tú Tài', 'Cử Nhân', 'Tiến Sĩ', 'Trạng Nguyên']

  // Next incomplete checkpoint
  const nextCPIdx = CHECKPOINTS.findIndex(cp => (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) < 5)
  const nextCP = CHECKPOINTS[nextCPIdx >= 0 ? nextCPIdx : 6]
  const nextCPDone = gameState.cpProgress[nextCP.id]?.missionsCompleted ?? 0

  // Recently collected — last 3 collected items
  const recentCollected = COLLECTIBLES.filter(c => c.collected).slice(-3).reverse()

  // Latest achievement
  const latestAch = ACHIEVEMENTS.filter(a => a.check(gameState.cpProgress, collectCount)).slice(-1)[0]

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 74 }}>

        {/* ── Top greeting ── */}
        <div style={{ background: `linear-gradient(160deg, ${T.plum} 0%, #6A1858 100%)` }}>
          <StatusBar light />
          <div className="flex items-start justify-between px-5 pt-1 pb-5">
            <div>
              <p style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Chào mừng trở lại,</p>
              <h1 style={{ fontFamily: T.D, fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1.05 }}>{displayName}! 🎓</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="rounded-full flex items-center justify-center" style={{ width: 20, height: 20, background: T.red, border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  <span style={{ fontFamily: T.D, fontSize: 10, fontWeight: 800, color: 'white' }}>{level}</span>
                </div>
                <span style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{translateText('Đội Thám Tử')} · {levelNames[level]}</span>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden flex items-end justify-center flex-shrink-0" style={{ width: 56, height: 62, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              <TeamAvatar size={52} />
            </div>
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3">

          {/* ── Journey progress ── */}
          <div className="rounded-3xl px-4 py-3.5" style={{ background: T.card, border: `1.5px solid ${T.border}`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.35s ease 0.05s' }}>
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.05em', textTransform: 'uppercase' }}> {translateText('Tiến độ hành trình')} </p>
              <span style={{ fontFamily: T.D, fontSize: 15, fontWeight: 800, color: T.red }}>{completedCount}/7 trạm</span>
            </div>
            {/* 7 checkpoint dots */}
            <div className="flex gap-1.5 mb-2.5">
              {CHECKPOINTS.map(cp => {
                const done = (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) >= 5
                const cur = !done && nextCP.id === cp.id
                return (
                  <div key={cp.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="rounded-full w-full" style={{ height: 8, background: done ? T.green : cur ? T.red : T.muted, border: `1.5px solid ${done ? T.greenDark : cur ? T.redDark : T.border}`, boxShadow: cur ? `0 0 6px rgba(193,39,45,0.4)` : 'none', transition: 'all 0.3s' }} />
                    <span style={{ fontFamily: T.D, fontSize: 7, fontWeight: 700, color: done ? T.green : cur ? T.red : T.border }}>{cp.id}</span>
                  </div>
                )
              })}
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 6, background: T.muted, border: `1px solid ${T.border}` }}>
              <div style={{ width: `${(completedCount / 7) * 100}%`, height: '100%', borderRadius: 9999, background: `linear-gradient(90deg, ${T.green}, #4AAA70)`, transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* ── Next checkpoint card ── */}
          <div className="rounded-3xl overflow-hidden" style={{ border: `2.5px solid ${T.red}`, boxShadow: `0 4px 20px rgba(193,39,45,0.15)`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.35s ease 0.1s' }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${T.red}, #E85C30, ${T.red})` }} />
            <div style={{ background: T.card }}>
              <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="rounded-full px-2.5 py-0.5" style={{ background: 'rgba(193,39,45,0.1)', border: `1px solid rgba(193,39,45,0.25)` }}>
                      <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.red, letterSpacing: '0.06em' }}>
                        {translateText('TRẠM TIẾP THEO')} · {String(nextCP.id).padStart(2, '0')}/07
                      </span>
                    </div>
                    <div className="rounded-full px-2 py-0.5" style={{ background: T.muted, border: `1px solid ${T.border}` }}>
                      <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 600, color: T.mutedFg }}>{nextCPDone}/5 ✦</span>
                    </div>
                  </div>
                  <h2 style={{ fontFamily: T.D, fontSize: 24, fontWeight: 800, color: T.ink, lineHeight: 1.05, marginBottom: 4 }}>{nextCP.name}</h2>
                  <p style={{ fontFamily: T.UI, fontSize: 13, color: T.mutedFg, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 12 }}>"{nextCP.shortDescription}"</p>

                  {/* Mini progress */}
                  <div className="flex gap-1 mb-3">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="rounded-full flex-1" style={{ height: 6, background: i < nextCPDone ? T.green : i === nextCPDone ? T.red : T.muted, border: `1px solid ${i < nextCPDone ? T.greenDark : i === nextCPDone ? T.redDark : T.border}` }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, marginBottom: 14 }}>
                    {nextCPDone === 0 ? 'Chưa bắt đầu · 5 thử thách đang chờ' : `${nextCPDone}/5 thử thách · Còn ${5 - nextCPDone} câu đố`}
                  </p>

                  <button onClick={() => onGoCheckpoint(nextCPIdx >= 0 ? nextCPIdx : 6)} className="flex items-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
                    style={{ height: 48, paddingInline: 20, background: `linear-gradient(135deg, ${T.red}, #E03030)`, color: 'white', fontFamily: T.D, fontSize: 17, fontWeight: 700, border: `2px solid ${T.redDark}`, boxShadow: `0 4px 0 ${T.redDark}, 0 8px 18px rgba(193,39,45,0.3)`, cursor: 'pointer' }}>
                    ⚔️ {translateText('Tiếp tục hành trình')}
                  </button>
                </div>
                <div className="flex-shrink-0 -mt-1">
                  <CollectibleIllus cpId={nextCP.id} size={100} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="flex gap-2.5" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease 0.15s' }}>
            {[
              { icon: '⭐', val: totalXP.toLocaleString(), label: 'điểm', color: T.yellow, bg: '#FFFBE0', border: '#EDD88A' },
              { icon: '🔑', val: String(cluesCount), label: 'Manh mối', color: T.green, bg: '#EFF8F3', border: '#AADFBE' },
              { icon: '📮', val: `${completedCount}`, label: 'con dấu', color: T.red, bg: '#FFF5F5', border: '#F0C0C0' },
            ].map(s => (
              <div key={s.label} className="flex-1 rounded-2xl py-3 flex flex-col items-center gap-0.5" style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg, fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Recent collection ── */}
          <div className="rounded-3xl overflow-hidden" style={{ background: T.card, border: `1.5px solid ${T.border}`, opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease 0.2s' }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: T.ink }}>{translateText('Manh mối vừa khám phá')}</p>
              <button onClick={onGoCollection} style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: T.red, background: 'none', border: 'none', cursor: 'pointer' }}>Xem tất cả →</button>
            </div>
            <div className="flex gap-2 px-4 py-3">
              {recentCollected.length > 0 ? recentCollected.map(item => {
                const cc = getCatColor(item.category) ?? {
                  bg: '#F5F0E6',
                  border: '#D8CDB8',
                  text: T.ink,
                }

                return (
                  <div
                    key={item.id}
                    className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 relative"
                    style={{
                      background: `linear-gradient(145deg, white, ${cc.bg})`,
                      border: `2px solid ${cc.border}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, transparent 60%)',
                        borderRadius: 'inherit',
                      }}
                    />

                    <span style={{ fontSize: 28 }}>
                      {item.emoji}
                    </span>

                    <span
                      style={{
                        fontFamily: T.UI,
                        fontSize: 9,
                        fontWeight: 700,
                        color: cc.text,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        paddingInline: 4,
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                )
              }) : (
                <p style={{ fontFamily: T.UI, fontSize: 12, color: T.mutedFg, padding: '8px 0', fontStyle: 'italic' }}>Chưa có manh mối nào. Hãy bắt đầu hành trình!</p>
              )}
            </div>
            <div className="px-4 pb-4">
              <button onClick={onGoCollection} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
                style={{ height: 42, background: 'transparent', color: T.red, fontFamily: T.UI, fontSize: 13, fontWeight: 700, border: `1.5px solid rgba(193,39,45,0.3)`, cursor: 'pointer' }}>
                🎴{translateText('Xem bộ sưu tập')}
              </button>
            </div>
          </div>

          {/* ── Passport mini + Achievement row ── */}
          <div className="flex gap-2.5" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.3s ease 0.25s' }}>
            {/* Passport card */}
            <button onClick={onGoPassport} className="flex-1 rounded-3xl overflow-hidden active:scale-98 transition-transform text-left"
              style={{ background: `linear-gradient(135deg, ${T.plum}, #6A1858)`, border: `2px solid #3A0830`, boxShadow: `0 3px 0 #3A0830`, cursor: 'pointer' }}>
              <div className="p-3.5">
                <p style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>Hành trình sĩ tử</p>
                <div className="flex gap-1 mb-2">
                  {CHECKPOINTS.slice(0, 4).map(cp => {
                    const done = (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) >= 5
                    return (
                      <svg key={cp.id} width="22" height="22" viewBox="0 0 180 180" fill="none">
                        <rect x="4" y="4" width="172" height="172" rx="14" fill={done ? '#C1272D' : 'rgba(255,255,255,0.1)'} />
                        <rect x="0" y="0" width="180" height="180" rx="18" fill="none" stroke={done ? '#8B0000' : 'rgba(255,255,255,0.15)'} strokeWidth="4" />
                        {done ? <text x="90" y="115" textAnchor="middle" fontSize="82" fill="rgba(255,245,220,0.9)" fontFamily="serif" fontWeight="bold">{cp.stampChar}</text>
                          : <text x="90" y="120" textAnchor="middle" fontSize="80" fill="rgba(255,255,255,0.15)" fontFamily="serif">?</text>}
                      </svg>
                    )
                  })}
                  <div className="rounded flex items-center justify-center" style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.08)' }}>
                    <span style={{ fontFamily: T.D, fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>+3</span>
                  </div>
                </div>
                <p style={{ fontFamily: T.D, fontSize: 15, fontWeight: 800, color: 'white', lineHeight: 1 }}>{completedCount}/7 {translateText('con dấu')}</p>
                <p style={{ fontFamily: T.UI, fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Xem hành trình →</p>
              </div>
            </button>

            {/* Latest achievement */}
            {latestAch ? (
              <button onClick={onGoProfile} className="flex-1 rounded-3xl overflow-hidden active:scale-98 transition-transform text-left"
                style={{ background: `linear-gradient(135deg, ${latestAch.bgFrom}, ${latestAch.bgTo})`, border: `2px solid ${latestAch.border}`, boxShadow: `0 3px 0 ${latestAch.border}`, cursor: 'pointer' }}>
                <div className="p-3.5">
                  <p
                    style={{
                      fontFamily: T.UI,
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.mutedFg,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom: 5
                    }}
                  >
                    {translateText('Thành tựu mới')}
                  </p>

                  <div
                    className="rounded-2xl flex items-center justify-center mb-2.5"
                    style={{
                      width: 44,
                      height: 44,
                      background: 'rgba(255,255,255,0.6)',
                      border: `1.5px solid ${latestAch.border}`
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{latestAch.emoji}</span>
                  </div>

                  <p
                    style={{
                      fontFamily: T.D,
                      fontSize: 13,
                      fontWeight: 800,
                      color: T.ink,
                      lineHeight: 1.2,
                      marginBottom: 2
                    }}
                  >
                    {latestAch.title}
                  </p>

                  <p
                    style={{
                      fontFamily: T.UI,
                      fontSize: 10,
                      color: T.mutedFg,
                      lineHeight: 1.3
                    }}
                  >
                    {latestAch.desc}
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex-1 rounded-3xl p-3.5 flex flex-col items-center justify-center gap-2"
                style={{ background: 'rgba(238,224,196,0.35)', border: `1.5px dashed ${T.border}` }}>
                <span style={{ fontSize: 28, opacity: 0.4 }}>🏅</span>
                <p style={{ fontFamily: T.UI, fontSize: 11, color: T.border, textAlign: 'center', lineHeight: 1.4 }}>Hoàn thành thử thách để mở khóa thành tựu!</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <BottomNav active="home" onHome={() => { }} onMap={onGoMap} onCollection={onGoCollection} onProfile={onGoProfile} />
    </div>
  )
}

// ─── Map Screen — Illustrated Site Map ─────────────────────────────────────

const SITE_H = 1660

// Spatial positions of each checkpoint on the illustrated Văn Miếu site map
// Journey flows south→north: CP1 at BOTTOM (entrance, y large) → CP7 at TOP (destination, y small)
// This matches the map's compass (B/North at top) and banners (Lối vào at bottom, Nhà Thái Học at top)
const SITE_POS = [
  { x: 215, y: 1478 }, // CP1 Văn Miếu Môn  — south entrance gate (bottom)
  { x: 215, y: 1262 }, // CP2 Đại Trung Môn  — second gate
  { x: 215, y: 1065 }, // CP3 Khuê Văn Các   — star-gazing pavilion
  { x: 215, y: 720 }, // CP4 Giếng & Bia    — at north edge of Thiên Quang pond (not inside water)
  { x: 215, y: 568 }, // CP5 Đại Thành Môn  — inner sanctum gate
  { x: 215, y: 390 }, // CP6 Điện Đại Thành — main worship hall
  { x: 215, y: 182 }, // CP7 Nhà Thái Học   — north destination (top)
]

// Landmark illustration for each checkpoint, centered at (0,0)
function CpLandmark({ cpId, state }: { cpId: number; state: 'completed' | 'current' | 'locked' }) {
  const lk = state === 'locked'
  const rc = lk ? '#C0A880' : '#C1272D'
  const rd = lk ? '#A08860' : '#8B0000'
  const wc = lk ? '#C8B888' : '#DDD0A4'
  const wk = lk ? '#A89870' : '#9A8060'
  const gc = lk ? '#C8B888' : '#D4A017'

  switch (cpId) {
    case 1: return ( // Văn Miếu Môn — triple gate
      <g>
        <rect x={-50} y={4} width={100} height={26} rx={2} fill={wc} stroke={wk} strokeWidth={1.5} />
        {([-28, 0, 28] as number[]).map(gx => (
          <path key={gx} d={`M${gx - 10} 30 L${gx - 10} 14 Q${gx} 4 ${gx + 10} 14 L${gx + 10} 30`} fill={lk ? '#9A8060' : '#3A2008'} opacity={lk ? 0.3 : 0.5} />
        ))}
        {([-48, -20, 8, 36] as number[]).map(px => (
          <rect key={px} x={px} y={4} width={8} height={26} fill={wk} opacity={0.45} />
        ))}
        <path d="M-56 4 Q0 -10 56 4 L52 9 Q0 -5 -52 9 Z" fill={rc} stroke={rd} strokeWidth={1.3} />
        <path d="M-26 0 Q0 -20 26 0 L23 4 Q0 -16 -23 4 Z" fill={rc} stroke={rd} strokeWidth={1.3} />
        <circle cx={0} cy={-20} r={5} fill={gc} /><circle cx={-56} cy={4} r={2.5} fill={gc} opacity={0.8} /><circle cx={56} cy={4} r={2.5} fill={gc} opacity={0.8} />
      </g>
    )
    case 2: return ( // Đại Trung Môn — two-tier gate
      <g>
        <rect x={-40} y={4} width={80} height={26} rx={2} fill={wc} stroke={wk} strokeWidth={1.5} />
        <path d="M-22 30 L-22 14 Q0 2 22 14 L22 30" fill={lk ? '#9A8060' : '#3A2008'} opacity={lk ? 0.3 : 0.48} />
        <rect x={-40} y={4} width={14} height={26} fill={wk} opacity={0.45} /><rect x={26} y={4} width={14} height={26} fill={wk} opacity={0.45} />
        <path d="M-46 4 Q0 -12 46 4 L42 9 Q0 -7 -42 9 Z" fill={rc} stroke={rd} strokeWidth={1.3} />
        <path d="M-22 -4 Q0 -22 22 -4 L19 0 Q0 -18 -19 0 Z" fill={rc} stroke={rd} strokeWidth={1.3} />
        <circle cx={0} cy={-22} r={4} fill={gc} /><circle cx={-46} cy={4} r={2} fill={gc} opacity={0.7} /><circle cx={46} cy={4} r={2} fill={gc} opacity={0.7} />
      </g>
    )
    case 3: return ( // Khuê Văn Các — octagonal pavilion with round window
      <g>
        <rect x={-30} y={18} width={60} height={14} rx={2} fill={lk ? '#B8A880' : '#C8B890'} stroke={wk} strokeWidth={1.3} />
        <rect x={-24} y={13} width={48} height={5} fill={lk ? '#C0B090' : '#D4C4A0'} stroke={wk} strokeWidth={0.8} />
        {([-18, 18] as number[]).map(cx => <rect key={cx} x={cx - 3.5} y={-12} width={7} height={30} fill={wk} opacity={0.62} rx={1} />)}
        <polygon points="-22,-12 22,-12 26,0 22,12 -22,12 -26,0" fill={wc} stroke={wk} strokeWidth={1.5} />
        <circle cx={0} cy={0} r={10} fill={lk ? '#A8C0D0' : '#80CCE8'} stroke={lk ? '#8090A0' : '#3A8AB8'} strokeWidth={1.8} />
        <circle cx={0} cy={0} r={6} fill={lk ? 'rgba(140,180,200,0.25)' : 'rgba(80,190,240,0.25)'} />
        <polygon points="0,-32 -26,-12 26,-12" fill={rc} stroke={rd} strokeWidth={1.3} />
        <circle cx={0} cy={-32} r={4.5} fill={gc} /><circle cx={-26} cy={-12} r={2.5} fill={gc} opacity={0.75} /><circle cx={26} cy={-12} r={2.5} fill={gc} opacity={0.75} />
      </g>
    )
    case 4: return ( // Giếng & Bia — stone stele on turtle
      <g>
        <ellipse cx={0} cy={22} rx={24} ry={12} fill={lk ? '#B8A880' : '#C8B890'} stroke={wk} strokeWidth={1.5} />
        <ellipse cx={0} cy={22} rx={17} ry={8} fill="none" stroke={wk} strokeWidth={0.9} opacity={0.55} />
        {([[-8, 20], [8, 20], [0, 27]] as [number, number][]).map(([tx, ty]) => <circle key={`${tx}${ty}`} cx={tx} cy={ty} r={3.5} fill="none" stroke={wk} strokeWidth={0.8} opacity={0.45} />)}
        <ellipse cx={22} cy={23} rx={6} ry={5} fill={lk ? '#C0B090' : '#CCB890'} stroke={wk} strokeWidth={1} />
        <rect x={-9} y={-22} width={18} height={40} rx={2} fill={lk ? '#D0C0A0' : '#F0E8D0'} stroke={wk} strokeWidth={1.5} />
        {([-14, -7, 0, 7, 14] as number[]).map(sy => <line key={sy} x1={-6} y1={sy} x2={6} y2={sy} stroke={wk} strokeWidth={0.7} opacity={0.45} />)}
        <path d="M-9 -22 Q0 -30 9 -22" fill={lk ? '#D0C0A0' : '#F0E8D0'} stroke={wk} strokeWidth={1.5} />
        <circle cx={0} cy={-28} r={2.5} fill={gc} opacity={0.85} />
      </g>
    )
    case 5: return ( // Đại Thành Môn — gate with red doors
      <g>
        <rect x={-40} y={4} width={80} height={26} rx={2} fill={wc} stroke={wk} strokeWidth={1.5} />
        <rect x={-18} y={8} width={15} height={20} rx={1.5} fill={lk ? '#A08888' : '#C1272D'} opacity={0.9} stroke={rd} strokeWidth={1} />
        <rect x={3} y={8} width={15} height={20} rx={1.5} fill={lk ? '#A08888' : '#C1272D'} opacity={0.9} stroke={rd} strokeWidth={1} />
        <circle cx={-5} cy={18} r={2.5} fill={gc} /><circle cx={5} cy={18} r={2.5} fill={gc} />
        <rect x={-40} y={4} width={18} height={26} fill={wk} opacity={0.4} /><rect x={22} y={4} width={18} height={26} fill={wk} opacity={0.4} />
        <path d="M-46 4 Q0 -10 46 4 L42 9 Q0 -5 -42 9 Z" fill={rc} stroke={rd} strokeWidth={1.3} />
        <path d="M-24 -2 Q0 -18 24 -2 L21 2 Q0 -14 -21 2 Z" fill={rc} stroke={rd} strokeWidth={1.3} />
        <circle cx={0} cy={-18} r={4} fill={gc} />
      </g>
    )
    case 6: return ( // Điện Đại Thành — wide double-roofed hall
      <g>
        <rect x={-56} y={16} width={112} height={12} rx={2} fill={lk ? '#B0A080' : '#C0B080'} stroke={wk} strokeWidth={1.3} />
        <rect x={-50} y={11} width={100} height={5} fill={lk ? '#B8A888' : '#CCBA90'} stroke={wk} strokeWidth={0.8} />
        <rect x={-48} y={-8} width={96} height={24} fill={wc} stroke={wk} strokeWidth={1.5} />
        {([-34, -17, 0, 17, 34] as number[]).map(cx => <rect key={cx} x={cx - 3} y={-8} width={6} height={24} fill={wk} opacity={0.48} rx={1} />)}
        {([-25, 0, 25] as number[]).map(wx => <rect key={wx} x={wx - 7} y={-3} width={14} height={10} rx={1} fill={lk ? '#A0B8C0' : '#80C8E8'} opacity={0.5} stroke={wk} strokeWidth={0.7} />)}
        <path d="M-60 -8 Q0 -22 60 -8 L56 -3 Q0 -17 -56 -3 Z" fill={rc} stroke={rd} strokeWidth={1.4} />
        <path d="M-34 -8 Q0 -30 34 -8 L30 -4 Q0 -26 -30 -4 Z" fill={rc} stroke={rd} strokeWidth={1.4} />
        <circle cx={0} cy={-30} r={5} fill={gc} stroke={lk ? '#A08840' : '#906010'} strokeWidth={1} />
        <circle cx={-60} cy={-8} r={3} fill={gc} opacity={0.8} /><circle cx={60} cy={-8} r={3} fill={gc} opacity={0.8} />
      </g>
    )
    case 7: return ( // Nhà Thái Học — long study hall
      <g>
        <rect x={-56} y={18} width={112} height={10} rx={2} fill={lk ? '#B0A080' : '#C0B080'} stroke={wk} strokeWidth={1.3} />
        <rect x={-52} y={-4} width={104} height={22} fill={wc} stroke={wk} strokeWidth={1.5} />
        {([-37, -18, 0, 18, 37] as number[]).map(cx => <rect key={cx} x={cx - 2.5} y={-4} width={5} height={22} fill={wk} opacity={0.42} rx={1} />)}
        {([-43, -25, -7, 11, 29, 47] as number[]).map(wx => <rect key={wx} x={wx - 5} y={1} width={10} height={8} rx={1} fill={lk ? '#A0B8C0' : '#88CCE0'} opacity={0.5} stroke={wk} strokeWidth={0.7} />)}
        <path d="M-60 -4 Q0 -22 60 -4 L56 0 Q0 -18 -56 0 Z" fill={rc} stroke={rd} strokeWidth={1.4} />
        <circle cx={0} cy={-22} r={4.5} fill={gc} /><circle cx={-60} cy={-4} r={2.5} fill={gc} opacity={0.7} /><circle cx={60} cy={-4} r={2.5} fill={gc} opacity={0.7} />
      </g>
    )
    default: return <circle cx={0} cy={0} r={22} fill={wc} stroke={wk} strokeWidth={2} />
  }
}

// Map tree cluster
function MapLantern({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Post */}
      <rect x={x - 1.5} y={y - 26} width={3} height={20} fill="#B0A070" />
      {/* Lantern head */}
      <rect x={x - 7} y={y - 28} width={14} height={13} rx={2.5} fill="#C8B880" stroke="#9A8060" strokeWidth={0.9} />
      {/* Warm glow inside */}
      <rect x={x - 5} y={y - 26} width={10} height={9} rx={1.5} fill="rgba(255,200,60,0.3)" />
      {/* Cap */}
      <polygon points={`${x},${y - 32} ${x - 7},${y - 28} ${x + 7},${y - 28}`} fill="#9A8060" />
      {/* Base ring */}
      <ellipse cx={x} cy={y - 8} rx={6} ry={2.2} fill="#B8A870" opacity={0.6} />
      <rect x={x - 2} y={y - 8} width={4} height={6} rx={1} fill="#B0A070" />
    </g>
  )
}

function MapTree({ x, y, r = 13 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#4A6A30" stroke="#3A5225" strokeWidth={1.2} />
      <circle cx={x - r * 0.28} cy={y - r * 0.22} r={r * 0.52} fill="#6A8A44" opacity={0.8} />
      <circle cx={x + r * 0.18} cy={y - r * 0.38} r={r * 0.36} fill="#7A9A50" opacity={0.62} />
    </g>
  )
}

// Checkpoint bottom sheet
function CheckpointSheet({ cp, cpIdx, state, progress, onClose, onStart }: {
  cp: CheckpointData; cpIdx: number; state: 'completed' | 'current' | 'locked'
  progress: CPProgress; onClose: () => void; onStart: () => void
}) {
  const isLocked = state === 'locked'
  const isDone = state === 'completed'
  const totalXP = cp.missions.reduce((s, m) => s + m.xp, 0)
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(45,27,20,0.52)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-t-[32px] overflow-hidden"
        style={{ background: T.bg, boxShadow: '0 -12px 48px rgba(0,0,0,0.22)', animation: 'sheetUp 0.35s cubic-bezier(0.34,1.4,0.64,1)' }}>
        <div className="flex justify-center pt-3 pb-2">
          <div className="rounded-full" style={{ width: 40, height: 4, background: T.border }} />
        </div>
        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ width: 88, height: 88, background: T.card, border: `2px solid ${T.border}`, opacity: isLocked ? 0.5 : 1 }}>
              <CollectibleIllus cpId={cp.id} size={88} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <div className="rounded-full px-2.5 py-0.5" style={{ background: 'rgba(193,39,45,0.1)', border: '1px solid rgba(193,39,45,0.28)' }}>
                  <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.red }}>{translateText('trạm')} {String(cp.id).padStart(2, '0')}</span>
                </div>
                {isDone && <div className="rounded-full px-2 py-0.5 flex items-center gap-1" style={{ background: 'rgba(61,138,94,0.12)', border: `1px solid ${T.green}` }}><span style={{ fontSize: 9 }}>✅</span><span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: T.green }}>Đã hoàn thành</span></div>}
                {isLocked && <div className="rounded-full px-2 py-0.5" style={{ background: 'rgba(122,92,74,0.1)', border: `1px solid ${T.border}` }}><span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: T.mutedFg }}>🔒 {translateText('Chưa mở khóa')}</span></div>}
              </div>
              <h2 style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: T.ink, lineHeight: 1.15 }}>{cp.name}</h2>
              <p style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, fontStyle: 'italic', marginTop: 3, lineHeight: 1.4 }}>"{cp.shortDescription}"</p>
            </div>
          </div>
          {/* Progress */}
          <div className="rounded-2xl p-3.5 mb-4" style={{ background: T.card, border: `1.5px solid ${T.border}` }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 600, color: T.mutedFg }}>Tiến trình thử thách</span>
              <span style={{ fontFamily: T.D, fontSize: 14, fontWeight: 800, color: isDone ? T.green : isLocked ? T.mutedFg : T.red }}>{progress.missionsCompleted}/5</span>
            </div>
            <div className="flex gap-1.5">
              {([0, 1, 2, 3, 4] as number[]).map(i => (
                <div key={i} className="flex-1 rounded-full" style={{ height: 8, background: i < progress.missionsCompleted ? T.green : (i === progress.missionsCompleted && !isDone) ? T.red : T.muted, border: `1.5px solid ${i < progress.missionsCompleted ? T.greenDark : (i === progress.missionsCompleted && !isDone) ? T.redDark : T.border}`, boxShadow: i < progress.missionsCompleted ? '0 0 5px rgba(61,138,94,0.4)' : 'none' }} />
              ))}
            </div>
          </div>
          {/* Rewards */}
          <div className="flex items-center gap-2 mb-5">
            <span style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, flexShrink: 0 }}>Phần thưởng:</span>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: '#FFFBE4', border: `1.5px solid ${T.gold}` }}>
              <span style={{ fontSize: 13 }}>⭐</span>
              <span style={{ fontFamily: T.D, fontSize: 14, fontWeight: 800, color: '#7A5010' }}>+{totalXP} XP</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: '#EFF8F4', border: `1.5px solid ${T.green}` }}>
              <span style={{ fontSize: 13 }}>🎴</span>
              <span style={{ fontFamily: T.D, fontSize: 13, fontWeight: 700, color: T.green }}>5 {translateText('Vật phẩm')}</span>
            </div>
          </div>
          {/* CTA */}
          <button onClick={isLocked ? undefined : onStart} disabled={isLocked}
            className="w-full flex items-center justify-center gap-2 rounded-2xl"
            style={{ height: 54, background: isLocked ? T.muted : isDone ? `linear-gradient(135deg, ${T.green}, #4AAA70)` : `linear-gradient(135deg, ${T.red}, #E83838)`, color: isLocked ? T.mutedFg : 'white', fontFamily: T.D, fontSize: 19, fontWeight: 800, border: `2.5px solid ${isLocked ? T.border : isDone ? T.greenDark : T.redDark}`, boxShadow: isLocked ? 'none' : `0 5px 0 ${isDone ? T.greenDark : T.redDark}, 0 10px 24px rgba(193,39,45,0.25)`, cursor: isLocked ? 'not-allowed' : 'pointer', letterSpacing: '0.02em' }}>
            {isLocked
              ? `🔒 ${translateText('Chưa mở khóa')}`
              : isDone
                ? `✅ ${translateText('Khám phá lại')}`
                : progress.missionsCompleted > 0
                  ? `⚔️ ${translateText('Tiếp tục')} (${progress.missionsCompleted}/5)`
                  : `⚔️ ${translateText('Bắt đầu khám phá')}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function MapScreen({ gameState, onSelectCP, onOpenCollection, onOpenProfile, onOpenHome }:
  { gameState: GameState; onSelectCP: (cpIdx: number) => void; onOpenCollection: () => void; onOpenProfile: () => void; onOpenHome: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sheetId, setSheetId] = useState<number | null>(null)
  const completedCount = CHECKPOINTS.filter(cp => getCPProgress(gameState, cp.id).missionsCompleted >= 5).length
  const totalXP = Object.values(gameState.cpProgress).reduce((s, p) => s + p.xpEarned, 0)

  useEffect(() => {
    const firstIncompleteIdx = CHECKPOINTS.findIndex(cp => getCPProgress(gameState, cp.id).missionsCompleted < 5)
    const targetIdx = firstIncompleteIdx >= 0 ? firstIncompleteIdx : 6
    if (scrollRef.current) {
      const targetY = SITE_POS[targetIdx].y
      setTimeout(() => scrollRef.current?.scrollTo({ top: Math.max(0, targetY - 320), behavior: 'smooth' }), 450)
    }
  }, [])

  const sheetCP = sheetId != null ? CHECKPOINTS.find(c => c.id === sheetId) ?? null : null
  const sheetIdx = sheetId != null ? CHECKPOINTS.findIndex(c => c.id === sheetId) : -1

  const currentCPIdx = CHECKPOINTS.findIndex(cp => cpState(gameState, cp.id) === 'current')
  const currentCP = currentCPIdx >= 0 ? CHECKPOINTS[currentCPIdx] : null
  const currentPos = currentCPIdx >= 0 ? SITE_POS[currentCPIdx] : null
  const currentProg = currentCP ? getCPProgress(gameState, currentCP.id) : null

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 relative z-20" style={{ background: T.card, borderBottom: `2px solid ${T.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-2.5">
          <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${T.red}, #E03030)`, border: `2px solid ${T.redDark}` }}>
            <span style={{ fontSize: 20 }}>🗺️</span>
          </div>
          <div className="flex-1">
            <h1 style={{ fontFamily: T.D, fontSize: 21, fontWeight: 800, color: T.ink, lineHeight: 1.1 }}>Bản đồ hành trình</h1>
            <p style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg }}>Văn Miếu – Quốc Tử Giám, Hà Nội</p>
          </div>
          <div className="flex items-center gap-1 rounded-2xl px-3 py-1.5" style={{ background: '#FFF5F5', border: `1.5px solid ${T.red}` }}>
            <span style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: T.red }}>{completedCount}/7</span>
            <span style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg }}>{translateText('trạm')}</span>
          </div>
        </div>
        <div className="px-5 pb-2.5">
          <div className="flex justify-between mb-1">
            <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 600, color: T.mutedFg }}>{completedCount === 0 ? 'Bắt đầu hành trình khám phá!' : `${completedCount} trạm đã khám phá`}</span>
            <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.green }}>{Math.round((completedCount / 7) * 100)}% · {totalXP} XP</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 6, background: T.muted, border: `1px solid ${T.border}` }}>
            <div style={{ width: `${(completedCount / 7) * 100}%`, height: '100%', borderRadius: 9999, background: `linear-gradient(90deg, ${T.green}, #50B878)`, transition: 'width 0.5s ease' }} />
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 px-5 pb-3">
          {([{ color: T.green, label: 'Đã khám phá' }, { color: T.red, label: 'Hiện tại' }, { color: T.muted, label: 'Chưa mở khóa', border: T.border }] as { color: string; label: string; border?: string }[]).map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="rounded-full" style={{ width: 9, height: 9, background: item.color, border: item.border ? `1.5px solid ${item.border}` : 'none' }} />
              <span style={{ fontFamily: T.UI, fontSize: 9.5, fontWeight: 600, color: T.mutedFg }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable illustrated map ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: 74 }}>
        <svg width="430" height={SITE_H} style={{ display: 'block' }} viewBox={`0 0 430 ${SITE_H}`}>

          {/* BACKGROUND — parchment */}
          <rect width="430" height={SITE_H} fill="#F2E8CC" />
          {Array.from({ length: 47 }).map((_, i) => (
            <line key={i} x1={0} y1={i * 36} x2={430} y2={i * 36} stroke="#C8B890" strokeWidth="0.4" opacity="0.32" />
          ))}

          {/* SOUTH APPROACH ROAD */}
          <rect x={0} y={1606} width={430} height={54} fill="#D8C890" />
          <line x1={172} y1={1606} x2={172} y2={1660} stroke="#B8A870" strokeWidth="1.5" strokeDasharray="14 10" opacity="0.5" />
          <line x1={258} y1={1606} x2={258} y2={1660} stroke="#B8A870" strokeWidth="1.5" strokeDasharray="14 10" opacity="0.5" />
          <rect x={152} y={1595} width={18} height={20} rx={2} fill="#C0B078" stroke="#9A8060" strokeWidth={1.5} />
          <rect x={260} y={1595} width={18} height={20} rx={2} fill="#C0B078" stroke="#9A8060" strokeWidth={1.5} />
          {/* NORTH EXIT ROAD */}
          <rect x={0} y={40} width={430} height={78} fill="#D8C890" />

          {/* OUTER COMPOUND WALLS */}
          <rect x={22} y={118} width={386} height={1488} fill="#E8D89A" stroke="#8A7050" strokeWidth={5} rx={4} />
          <rect x={28} y={124} width={374} height={1476} fill="#EEE0A6" stroke="#B09845" strokeWidth={1.5} rx={3} />
          {/* Battlements top */}
          {Array.from({ length: 13 }).map((_, i) => <rect key={i} x={28 + i * 29} y={118} width={16} height={9} rx={1} fill="#A89060" stroke="#7A6040" strokeWidth={1} />)}
          {/* Battlements bottom */}
          {Array.from({ length: 13 }).map((_, i) => <rect key={i} x={28 + i * 29} y={1597} width={16} height={9} rx={1} fill="#A89060" stroke="#7A6040" strokeWidth={1} />)}

          {/* CENTRAL NORTH-SOUTH WALKWAY */}
          <rect x={168} y={118} width={94} height={1488} fill="#D8C892" />
          <rect x={180} y={118} width={70} height={1488} fill="#E0D0A0" opacity="0.6" />
          {Array.from({ length: 41 }).map((_, i) => <rect key={i} x={212} y={120 + i * 37} width={6} height={20} rx={3} fill="#C0A878" opacity="0.3" />)}

          {/* INTERNAL PRECINCT WALLS */}
          {/* W1 — between P1 & P2, y=395 */}
          <rect x={22} y={388} width={386} height={18} fill="#9A8060" stroke="#7A6040" strokeWidth={1} />
          <rect x={168} y={388} width={94} height={18} fill="#D8C892" />
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w1w${i}`} x={28 + i * 19} y={380} width={11} height={8} rx={1} fill="#B0905A" />)}
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w1e${i}`} x={247 + i * 19} y={380} width={11} height={8} rx={1} fill="#B0905A" />)}
          {/* W2 — at Khuê Văn Các zone, y=610 */}
          <rect x={22} y={603} width={386} height={18} fill="#9A8060" stroke="#7A6040" strokeWidth={1} />
          <rect x={168} y={603} width={94} height={18} fill="#D8C892" />
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w2w${i}`} x={28 + i * 19} y={595} width={11} height={8} rx={1} fill="#B0905A" />)}
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w2e${i}`} x={247 + i * 19} y={595} width={11} height={8} rx={1} fill="#B0905A" />)}
          {/* W3 — inner sanctum gate, y=1003 */}
          <rect x={22} y={996} width={386} height={22} fill="#9A8060" stroke="#7A6040" strokeWidth={1} />
          <rect x={168} y={996} width={94} height={22} fill="#D8C892" />
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w3w${i}`} x={28 + i * 19} y={988} width={11} height={8} rx={1} fill="#B0905A" />)}
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w3e${i}`} x={247 + i * 19} y={988} width={11} height={8} rx={1} fill="#B0905A" />)}
          {/* W4 — second inner divider, y=1190 */}
          <rect x={22} y={1185} width={386} height={16} fill="#9A8060" stroke="#7A6040" strokeWidth={1} />
          <rect x={168} y={1185} width={94} height={16} fill="#D8C892" />
          {/* W5 — Thái Học precinct, y=1385 */}
          <rect x={22} y={1378} width={386} height={18} fill="#9A8060" stroke="#7A6040" strokeWidth={1} />
          <rect x={168} y={1378} width={94} height={18} fill="#D8C892" />
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w5w${i}`} x={28 + i * 19} y={1370} width={11} height={8} rx={1} fill="#B0905A" />)}
          {Array.from({ length: 7 }).map((_, i) => <rect key={`w5e${i}`} x={247 + i * 19} y={1370} width={11} height={8} rx={1} fill="#B0905A" />)}

          {/* PRECINCT GROUND FILLS */}
          <rect x={28} y={142} width={374} height={246} fill="#EAD89A" />
          <rect x={28} y={406} width={374} height={197} fill="#ECD89E" />
          <rect x={28} y={621} width={374} height={375} fill="#E8D49A" />
          <rect x={28} y={1018} width={374} height={167} fill="#ECD8A2" />
          <rect x={28} y={1201} width={374} height={177} fill="#EADCA0" />
          <rect x={28} y={1396} width={374} height={201} fill="#EAD89A" />

          {/* THIÊN QUANG TỈNH POND */}
          <rect x={110} y={742} width={210} height={204} rx={10} fill="#6AB8D4" stroke="#4888A4" strokeWidth={2.5} />
          <rect x={115} y={747} width={200} height={194} rx={8} fill="#80CCE4" />
          {([758, 792, 826, 860, 895, 926] as number[]).map(wy => (
            <path key={wy} d={`M118 ${wy} Q165 ${wy - 7} 215 ${wy} Q265 ${wy + 7} 312 ${wy}`} stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" fill="none" />
          ))}
          {([[155, 845], [215, 792], [282, 870], [188, 892]] as [number, number][]).map(([lx, ly]) => (
            <g key={`${lx}${ly}`}>
              <circle cx={lx} cy={ly} r={6} fill="#F080A0" />
              <circle cx={lx} cy={ly} r={3.5} fill="#F8B0C8" />
              <circle cx={lx} cy={ly} r={1.5} fill="#FFD8E4" />
            </g>
          ))}
          <text x={215} y={960} textAnchor="middle" fontSize="9" fontWeight="700" fill="#3A7090" fontFamily="'Be Vietnam Pro',sans-serif" opacity="0.75">Thiên Quang Tỉnh</text>

          {/* RÙA ĐÁ + BIA TIẾN SĨ — stone turtles carrying scholar steles, flanking the pond */}
          {([755, 797, 839, 881, 921] as number[]).map((sy, i) => (
            <g key={`ws${i}`}>
              {/* Turtle shell body */}
              <ellipse cx={74} cy={sy + 23} rx={13} ry={7} fill="#C0B49A" stroke="#9A8F7A" strokeWidth={0.9} />
              {/* Shell dome ridge */}
              <path d={`M63 ${sy + 21} Q74 ${sy + 16} 85 ${sy + 21}`} stroke="#A89878" strokeWidth="0.9" fill="none" opacity="0.6" />
              {/* Shell side segments */}
              <path d={`M65 ${sy + 22} Q69 ${sy + 19} 74 ${sy + 21}`} stroke="#9A8868" strokeWidth="0.6" fill="none" opacity="0.45" />
              <path d={`M74 ${sy + 21} Q79 ${sy + 19} 83 ${sy + 22}`} stroke="#9A8868" strokeWidth="0.6" fill="none" opacity="0.45" />
              {/* Turtle head (extending right) */}
              <ellipse cx={87} cy={sy + 22} rx={3.5} ry={2.5} fill="#B8A888" stroke="#9A8060" strokeWidth={0.7} />
              <circle cx={88} cy={sy + 21} r={0.8} fill="#5A3A28" />
              {/* Stele (bia đá) upright on turtle back */}
              <rect x={69} y={sy} width={10} height={21} rx={2} fill="#D8CCA8" stroke="#A89870" strokeWidth={1} />
              {/* Arched stele top */}
              <path d={`M69 ${sy + 4} Q74 ${sy} 79 ${sy + 4}`} fill="#D8CCA8" stroke="#A89870" strokeWidth={0.8} />
              {/* Inscription lines */}
              {[6, 11, 16].map(d => <line key={d} x1={71} y1={sy + d} x2={77} y2={sy + d} stroke="#9A8860" strokeWidth={0.6} opacity={0.5} />)}
            </g>
          ))}
          {([755, 797, 839, 881, 921] as number[]).map((sy, i) => (
            <g key={`es${i}`}>
              {/* Turtle shell body (mirrored, head extends left) */}
              <ellipse cx={356} cy={sy + 23} rx={13} ry={7} fill="#C0B49A" stroke="#9A8F7A" strokeWidth={0.9} />
              <path d={`M345 ${sy + 21} Q356 ${sy + 16} 367 ${sy + 21}`} stroke="#A89878" strokeWidth="0.9" fill="none" opacity="0.6" />
              <path d={`M347 ${sy + 22} Q351 ${sy + 19} 356 ${sy + 21}`} stroke="#9A8868" strokeWidth="0.6" fill="none" opacity="0.45" />
              <path d={`M356 ${sy + 21} Q361 ${sy + 19} 365 ${sy + 22}`} stroke="#9A8868" strokeWidth="0.6" fill="none" opacity="0.45" />
              {/* Turtle head (extending left) */}
              <ellipse cx={343} cy={sy + 22} rx={3.5} ry={2.5} fill="#B8A888" stroke="#9A8060" strokeWidth={0.7} />
              <circle cx={342} cy={sy + 21} r={0.8} fill="#5A3A28" />
              {/* Stele */}
              <rect x={351} y={sy} width={10} height={21} rx={2} fill="#D8CCA8" stroke="#A89870" strokeWidth={1} />
              <path d={`M351 ${sy + 4} Q356 ${sy} 361 ${sy + 4}`} fill="#D8CCA8" stroke="#A89870" strokeWidth={0.8} />
              {[6, 11, 16].map(d => <line key={d} x1={353} y1={sy + d} x2={359} y2={sy + d} stroke="#9A8860" strokeWidth={0.6} opacity={0.5} />)}
            </g>
          ))}
          {/* CP4 zone indicator — dashed border around the Giếng Thiên Quang area */}
          <rect x={106} y={736} width={218} height={218} rx={12} fill="none"
            stroke={T.gold} strokeWidth="1.8" strokeDasharray="6 5" opacity="0.45" />

          {/* FLANKING HALLS — inner sanctum */}
          <rect x={318} y={1025} width={68} height={138} rx={3} fill="#DDD0A0" stroke="#9A8060" strokeWidth={1.5} />
          {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={318} y={1025 + i * 35} width={68} height={3} fill="#9A8060" opacity={0.3} />)}
          <path d="M314 1025 Q352 1010 390 1025" fill="#C1272D" opacity="0.55" />
          <rect x={44} y={1025} width={68} height={138} rx={3} fill="#DDD0A0" stroke="#9A8060" strokeWidth={1.5} />
          {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={44} y={1025 + i * 35} width={68} height={3} fill="#9A8060" opacity={0.3} />)}
          <path d="M40 1025 Q78 1010 116 1025" fill="#C1272D" opacity="0.55" />

          {/* TREES */}
          {/* Precinct 1 */}
          <MapTree x={62} y={230} r={14} /><MapTree x={92} y={265} r={12} /><MapTree x={58} y={302} r={13} /><MapTree x={86} y={340} r={11} /><MapTree x={65} y={372} r={12} />
          <MapTree x={368} y={230} r={14} /><MapTree x={338} y={265} r={12} /><MapTree x={372} y={302} r={13} /><MapTree x={344} y={340} r={11} /><MapTree x={365} y={372} r={12} />
          {/* Precinct 2 */}
          <MapTree x={60} y={440} r={13} /><MapTree x={88} y={476} r={11} /><MapTree x={62} y={516} r={14} /><MapTree x={86} y={556} r={12} /><MapTree x={60} y={588} r={11} />
          <MapTree x={370} y={440} r={13} /><MapTree x={342} y={476} r={11} /><MapTree x={368} y={516} r={14} /><MapTree x={344} y={556} r={12} /><MapTree x={370} y={588} r={11} />
          {/* Precinct 3 — beside pond */}
          <MapTree x={60} y={660} r={13} /><MapTree x={86} y={698} r={11} /><MapTree x={56} y={738} r={12} />
          <MapTree x={370} y={660} r={13} /><MapTree x={344} y={698} r={11} /><MapTree x={374} y={738} r={12} />
          <MapTree x={62} y={960} r={12} /><MapTree x={88} y={990} r={10} />
          <MapTree x={368} y={960} r={12} /><MapTree x={342} y={990} r={10} />
          {/* Inner sanctum */}
          <MapTree x={152} y={1108} r={10} /><MapTree x={278} y={1108} r={10} />
          <MapTree x={148} y={1152} r={9} /><MapTree x={282} y={1152} r={9} />
          {/* Thái Học precinct */}
          <MapTree x={62} y={1438} r={13} /><MapTree x={92} y={1474} r={11} /><MapTree x={65} y={1516} r={12} /><MapTree x={88} y={1554} r={10} />
          <MapTree x={368} y={1438} r={13} /><MapTree x={338} y={1474} r={11} /><MapTree x={365} y={1516} r={12} /><MapTree x={342} y={1554} r={10} />
          {/* Approach trees */}
          <MapTree x={54} y={168} r={11} /><MapTree x={376} y={168} r={11} />
          <MapTree x={50} y={1636} r={10} /><MapTree x={380} y={1636} r={10} />

          {/* STONE LANTERNS at each gate — flanking the central walkway */}
          {([388, 603, 996, 1185, 1378] as number[]).map(wy => (
            <g key={wy}>
              <MapLantern x={162} y={wy} />
              <MapLantern x={268} y={wy} />
            </g>
          ))}
          {/* Extra tree clusters at sparse zones */}
          <MapTree x={120} y={480} r={9} /><MapTree x={130} y={520} r={8} />
          <MapTree x={300} y={480} r={9} /><MapTree x={310} y={520} r={8} />
          <MapTree x={105} y={880} r={9} /><MapTree x={325} y={880} r={9} />
          <MapTree x={108} y={1220} r={8} /><MapTree x={322} y={1220} r={8} />
          <MapTree x={106} y={1270} r={7} /><MapTree x={324} y={1270} r={7} />
          {/* Small lotus beds — corners of Thiên Quang pond zone */}
          {([[94, 760], [94, 920], [336, 760], [336, 920]] as [number, number][]).map(([bx, by]) => (
            <g key={`bed${bx}${by}`}>
              <circle cx={bx} cy={by} r={8} fill="#5A9A40" opacity="0.45" stroke="#3A7A28" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r={4} fill="#F090A8" opacity="0.8" />
              <circle cx={bx} cy={by} r={2} fill="#FFD0DC" opacity="0.9" />
            </g>
          ))}
          {/* Courtyard ornamental flower beds */}
          {([[76, 490], [354, 490], [76, 550], [354, 550]] as [number, number][]).map(([bx, by]) => (
            <g key={`fl${bx}${by}`}>
              <rect x={bx - 7} y={by - 5} width={14} height={10} rx={3} fill="#C4B880" opacity="0.45" stroke="#9A8860" strokeWidth="0.7" />
              <circle cx={bx} cy={by - 2} r={3} fill="#F090A8" opacity="0.65" />
            </g>
          ))}

          {/* COMPASS ROSE */}
          <g transform="translate(385, 92)">
            <circle cx={0} cy={0} r={18} fill="#F5EDD0" stroke="#9A8060" strokeWidth={1.5} />
            <circle cx={0} cy={0} r={4} fill="#C1272D" />
            <path d="M0 -16 L4 -4 L0 0 L-4 -4 Z" fill="#C1272D" />
            <path d="M0 16 L4 4 L0 0 L-4 4 Z" fill="#9A8060" opacity="0.55" />
            <path d="M-16 0 L-4 -4 L0 0 L-4 4 Z" fill="#9A8060" opacity="0.45" />
            <path d="M16 0 L4 -4 L0 0 L4 4 Z" fill="#9A8060" opacity="0.45" />
            <text x={0} y={-19} textAnchor="middle" fontSize="7" fontWeight="800" fill="#C1272D" fontFamily="'Be Vietnam Pro',sans-serif">B</text>
          </g>

          {/* ZONE LABELS */}
          <text x={215} y={388} textAnchor="middle" fontSize="8" fill="#8A7050" fontFamily="'Be Vietnam Pro',sans-serif" opacity="0.6">— Tiền Án —</text>
          <text x={215} y={603} textAnchor="middle" fontSize="8" fill="#8A7050" fontFamily="'Be Vietnam Pro',sans-serif" opacity="0.6">— Sân thứ hai —</text>
          <text x={215} y={996} textAnchor="middle" fontSize="8" fill="#8A7050" fontFamily="'Be Vietnam Pro',sans-serif" opacity="0.6">— Khu Nội Tự —</text>
          <text x={215} y={1378} textAnchor="middle" fontSize="8" fill="#8A7050" fontFamily="'Be Vietnam Pro',sans-serif" opacity="0.6">— Khu Thái Học —</text>
          <text x={215} y={1650} textAnchor="middle" fontSize="9" fontWeight="600" fill="#8A7050" fontFamily="'Be Vietnam Pro',sans-serif" opacity="0.65">Phố Quốc Tử Giám</text>

          {/* CURRENT OBJECTIVE CARD — floats left of the current CP */}
          {currentPos && currentCP && currentProg && (
            <g>
              {/* Connector line to current CP card */}
              <line
                x1={156} y1={currentPos.y - 62}
                x2={currentPos.x - 57} y2={currentPos.y}
                stroke={T.plum} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.45}
              />
              {/* Card */}
              <g transform={`translate(24, ${currentPos.y - 108})`}>
                <rect x={0} y={0} width={134} height={76} rx={10} fill={T.plum} stroke="#6A2060" strokeWidth={1.5} />
                <rect x={2} y={2} width={130} height={72} rx={9} fill="rgba(255,255,255,0.07)" />
                {/* Header row */}
                <rect x={8} y={8} width={6} height={6} rx={1.5} fill={T.yellow} opacity={0.9} />
                <text x={18} y={16} fontSize="8" fontWeight="700" fill={T.yellow} fontFamily="'Be Vietnam Pro',sans-serif">Nhiệm vụ hiện tại</text>
                {/* CP name */}
                <text x={8} y={33} fontSize="10" fontWeight="800" fill="white" fontFamily="'Baloo 2',sans-serif">
                  {currentCP.name.length > 17 ? currentCP.name.substring(0, 16) + '…' : currentCP.name}
                </text>
                {/* Challenge progress text */}
                <text x={8} y={48} fontSize="8.5" fontWeight="600" fill="rgba(255,255,255,0.72)" fontFamily="'Be Vietnam Pro',sans-serif">
                  {currentProg.missionsCompleted}/5 thử thách
                </text>
                {/* Progress bar */}
                <rect x={8} y={56} width={118} height={5} rx={2.5} fill="rgba(255,255,255,0.18)" />
                {currentProg.missionsCompleted > 0 && (
                  <rect x={8} y={56} width={Math.max(4, (currentProg.missionsCompleted / 5) * 118)} height={5} rx={2.5} fill={T.yellow} />
                )}
                {/* Arrow pointing toward CP */}
                <polygon points={`67,76 57,86 77,86`} fill={T.plum} stroke="#6A2060" strokeWidth={1} />
              </g>
            </g>
          )}

          {/* CHECKPOINT MARKERS */}
          {CHECKPOINTS.map((cp, idx) => {
            const pos = SITE_POS[idx]
            const st = cpState(gameState, cp.id)
            const isCurrent = st === 'current'
            const isDone = st === 'completed'
            const isLocked = st === 'locked'
            const scale = isCurrent ? 1.28 : 1.0
            const prog = getCPProgress(gameState, cp.id)

            return (
              <g key={cp.id}
                transform={`translate(${pos.x}, ${pos.y}) scale(${scale})`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSheetId(cp.id)}>
                {/* Hit target */}
                <rect x={-62} y={-42} width={124} height={112} fill="transparent" />
                {/* Pulsing glow rings — current CP only */}
                {isCurrent && <>
                  <circle cx={0} cy={0} r={62} fill="rgba(193,39,45,1)" className="map-pulse-outer" />
                  <circle cx={0} cy={0} r={48} fill="rgba(193,39,45,1)" className="map-pulse-inner" />
                </>}
                {/* Subtle completion glow */}
                {isDone && <circle cx={0} cy={0} r={40} fill="rgba(61,138,94,0.09)" />}
                {/* Card backing */}
                <rect x={-54} y={-36} width={108} height={72} rx={14}
                  fill={isCurrent ? '#FFFBF4' : isDone ? '#FBF9F2' : '#F0EBE0'}
                  stroke={isCurrent ? T.red : isDone ? T.gold : '#C0B090'}
                  strokeWidth={isCurrent ? 2.5 : isDone ? 2 : 1.5}
                  opacity={isLocked ? 0.55 : 1} />
                {/* Completed: subtle green inner border */}
                {isDone && <rect x={-50} y={-32} width={100} height={64} rx={11} fill="none" stroke={T.green} strokeWidth={1} opacity={0.4} />}
                {/* Landmark illustration */}
                <g opacity={isLocked ? 0.45 : 1}><CpLandmark cpId={cp.id} state={st} /></g>

                {/* ── STATUS BADGE top-right ── */}
                {/* Completed: red scholar seal with checkmark */}
                {isDone && (
                  <g transform="translate(42,-32)">
                    <circle r={11} fill={T.red} stroke="white" strokeWidth={2} />
                    <circle r={8.5} fill={T.redDark} opacity={0.3} />
                    {/* Check mark */}
                    <path d="M-5 0.5 L-1.5 4 L6 -4" stroke="white" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Seal ring detail */}
                    <circle r={11} fill="none" stroke={T.gold} strokeWidth={0.8} opacity={0.5} />
                  </g>
                )}
                {/* Current: exclamation in yellow, larger */}
                {isCurrent && (
                  <g transform="translate(42,-32)">
                    <circle r={11} fill={T.yellow} stroke={T.gold} strokeWidth={2} />
                    <rect x={-2} y={-5.5} width={4} height={7} rx={2} fill={T.ink} />
                    <circle cx={0} cy={5} r={2} fill={T.ink} />
                  </g>
                )}
                {/* Locked: small padlock */}
                {isLocked && (
                  <g transform="translate(42,-32)">
                    <circle r={10} fill="#B0A088" stroke="white" strokeWidth={2} />
                    <rect x={-3.5} y={-0.5} width={7} height={7.5} rx={2} fill="white" opacity={0.85} />
                    <path d="M-2.5 -0.5 A2.5 2.5 0 0 1 2.5 -0.5" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" />
                  </g>
                )}

                {/* ── CP NUMBER BADGE top-left ── */}
                <g transform="translate(-44,-32)">
                  <circle r={10} fill={isLocked ? '#B0A088' : isDone ? T.redDark : T.plum} stroke="white" strokeWidth={2} />
                  <text textAnchor="middle" dy="4" fontSize="9" fontWeight="800" fill="white" fontFamily="'Baloo 2',sans-serif">{cp.id}</text>
                </g>

                {/* ── NAME LABEL ── */}
                <text x={0} y={46} textAnchor="middle"
                  fontSize={isCurrent ? 10 : 9.5} fontWeight="700"
                  fill={isLocked ? '#9A8878' : T.ink}
                  fontFamily="'Be Vietnam Pro',sans-serif"
                  opacity={isLocked ? 0.55 : 1}>
                  {cp.name.length > 18 ? cp.name.substring(0, 17) + '…' : cp.name}
                </text>

                {/* ── REWARD CHIPS ── shown for non-locked checkpoints */}
                {!isLocked && (
                  <g>
                    {/* XP chip */}
                    <rect x={-52} y={52} width={46} height={14} rx={5} fill={T.red} opacity={0.82} />
                    <text x={-29} y={62.5} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="white" fontFamily="'Be Vietnam Pro',sans-serif">
                      {isDone ? `+${prog.xpEarned} XP` : '+XP'}
                    </text>
                    {/* Stamp chip */}
                    <rect x={6} y={52} width={46} height={14} rx={5} fill={T.plum} opacity={0.82} />
                    {/* Tiny seal mark inside chip */}
                    <circle cx={16} cy={59} r={4} fill={T.yellow} opacity={0.85} />
                    <circle cx={16} cy={59} r={2} fill={T.redDark} opacity={0.6} />
                    <text x={36} y={62.5} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={T.yellow} fontFamily="'Be Vietnam Pro',sans-serif">dấu ấn</text>
                  </g>
                )}
                {/* Locked: grayed chip placeholder */}
                {isLocked && (
                  <rect x={-28} y={52} width={56} height={14} rx={5} fill="#B0A088" opacity={0.35} />
                )}
              </g>
            )
          })}

          {/* "BẠN ĐANG Ở ĐÂY" PIN — rendered outside the scaled CP group */}
          {CHECKPOINTS.map((cp, idx) => {
            if (cpState(gameState, cp.id) !== 'current') return null
            const pos = SITE_POS[idx]
            return (
              <g key={`here-${cp.id}`} transform={`translate(${pos.x + 76}, ${pos.y - 22})`} style={{ pointerEvents: 'none' }}>
                {/* Animated ping ring */}
                <circle cx={0} cy={0} r={14} fill="rgba(193,39,45,0.2)" className="map-here-ping" />
                {/* Arrow pointing left to CP */}
                <polygon points="0,0 -9,-5 -9,5" fill={T.red} />
                {/* Label pill */}
                <rect x={0} y={-10} width={86} height={20} rx={6} fill={T.red} stroke="#8B0000" strokeWidth={1} />
                <text x={43} y={4} textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily="'Be Vietnam Pro',sans-serif">Bạn đang ở đây</text>
              </g>
            )
          })}

          {/* NORTH BANNER — top = north = destination CP7 */}
          <g transform={`translate(${215 - 82}, 52)`}>
            <rect width="164" height="30" rx="10" fill={T.plum} stroke="#6A2060" strokeWidth={1.5} />
            <text x="82" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill={T.yellow} fontFamily="'Baloo 2',sans-serif">🏛️ {translateText('Đích: Nhà Thái Học')}</text>
          </g>
          {/* SOUTH BANNER — bottom = south = start CP1 (↑ player scrolls up to progress) */}
          <g transform={`translate(${215 - 82}, ${SITE_H - 52})`}>
            <rect width="164" height="30" rx="10" fill={T.green} stroke={T.greenDark} strokeWidth={1.5} />
            <text x="82" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="white" fontFamily="'Baloo 2',sans-serif">🚩{translateText('Bắt đầu: Văn Miếu Môn')} </text>
          </g>

        </svg>
      </div>

      <BottomNav active="map" onHome={onOpenHome} onMap={() => { }} onCollection={onOpenCollection} onProfile={onOpenProfile} />

      {sheetCP && (
        <CheckpointSheet
          cp={sheetCP} cpIdx={sheetIdx}
          state={cpState(gameState, sheetCP.id)}
          progress={getCPProgress(gameState, sheetCP.id)}
          onClose={() => setSheetId(null)}
          onStart={() => { setSheetId(null); onSelectCP(sheetIdx) }}
        />
      )}
    </div>
  )
}
// ─── Passport stamp ────────────────────────────────────────────────────────

function StampSlot({ cp, state, isCurrent }: {
  cp: CheckpointData
  state: 'completed' | 'current' | 'locked'
  isCurrent: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {state === 'completed' ? (
        <div style={{ position: 'relative', filter: `drop-shadow(0 3px 8px rgba(193,39,45,0.3))` }}>
          <div style={{ transform: 'rotate(-3deg)', transformOrigin: 'center' }}>
            <TraditionalSeal char={cp.stampChar} name={cp.stampName} />
          </div>
        </div>
      ) : state === 'current' ? (
        <div className="flex flex-col items-center justify-center rounded-[20px]" style={{ width: 108, height: 108, background: 'rgba(193,39,45,0.06)', border: `2.5px dashed ${T.red}`, position: 'relative', boxShadow: `0 0 0 4px rgba(193,39,45,0.08), 0 0 16px rgba(193,39,45,0.12)` }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: `rgba(193,39,45,0.1)`, border: `2px solid rgba(193,39,45,0.3)` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={T.red} strokeWidth="2" /><path d="M12 8v4l3 3" stroke={T.red} strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: T.red, marginTop: 5, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.3 }}>Đang khám phá</span>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-[20px] pointer-events-none" style={{ border: `2px solid rgba(193,39,45,0.4)`, animation: 'passportPulse 2s ease-in-out infinite' }} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[20px]" style={{ width: 108, height: 108, background: 'rgba(220,208,180,0.25)', border: `2px dashed ${T.border}` }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: 38, height: 38, background: T.muted, border: `1.5px solid ${T.border}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke={T.mutedFg} strokeWidth="1.8" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={T.mutedFg} strokeWidth="1.8" strokeLinecap="round" /></svg>
          </div>
          <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 600, color: T.border, marginTop: 5, letterSpacing: '0.03em' }}>Chưa mở</span>
        </div>
      )}
      {/* Number badge + name */}
      <div className="flex items-center gap-1">
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 16, height: 16, background: state === 'completed' ? T.red : state === 'current' ? T.red : T.muted, opacity: state === 'locked' ? 0.5 : 1 }}>
          <span style={{ fontFamily: T.D, fontSize: 8, fontWeight: 800, color: state === 'locked' ? T.mutedFg : 'white' }}>{cp.id}</span>
        </div>
        <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: state === 'locked' ? 500 : 700, color: state === 'locked' ? T.border : T.ink, maxWidth: 80, textAlign: 'center', lineHeight: 1.2 }}>{cp.name.split(' – ')[0]}</span>
      </div>
    </div>
  )
}

// ─── Root orchestrator ─────────────────────────────────────────────────────

export default function App() {
  const { user, loading, logout } = useAuth()
  const [gs, setGS] = useState<GameState>(initialState)
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('mmtl-language') === 'en' ? 'en' : 'vi'))
  const [dataReady, setDataReady] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [activeProgressUserId, setActiveProgressUserId] = useState<number | null>(null)
  const [progressError, setProgressError] = useState<string | null>(null)
  const userId = user?.id ?? null
  const progressUserId = user && user.role !== 'guest' ? user.id : null

  setCurrentLanguage(language)

  useEffect(() => {
    localStorage.setItem('mmtl-language', language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (progressUserId === null) {
      setGS(initialState())
      setActiveProgressUserId(null)
      setProgressError(null)
      return
    }

    try {
      setGS({ ...initialState(), cpProgress: loadSavedProgress(progressUserId) })
      setProgressError(null)
    } catch (error) {
      console.error('Không thể tải tiến trình của tài khoản:', error)
      setGS(initialState())
      setProgressError('Không thể đọc tiến trình đã lưu của tài khoản này. Tiến trình mới sẽ được bắt đầu.')
    }
    setActiveProgressUserId(progressUserId)
  }, [progressUserId])

  useEffect(() => {
    if (progressUserId === null || activeProgressUserId !== progressUserId) return

    try {
      localStorage.setItem(
        `mmtl-game-progress:${progressUserId}`,
        JSON.stringify({ cpProgress: gs.cpProgress }),
      )
    } catch (error) {
      console.error('Không thể lưu tiến trình của tài khoản:', error)
      setProgressError('Không thể lưu tiến trình. Hãy kiểm tra dung lượng bộ nhớ trình duyệt.')
    }
  }, [progressUserId, activeProgressUserId, gs.cpProgress])

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      if (userId === null) return
      try {
        setDataError(null)
        setDataReady(false)
        await loadAppData(language)
        if (!cancelled) setDataReady(true)
      } catch (error) {
        console.error(language === 'en' ? 'Unable to load game data from API:' : 'Không thể tải dữ liệu game từ API:', error)
        if (!cancelled) setDataError(error instanceof Error ? error.message : (language === 'en' ? 'Unable to connect to the data server.' : 'Không thể kết nối tới server dữ liệu.'))
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [language, userId])

  useEffect(() => {
    if (!userId) return
    const root = document.querySelector('#root') as HTMLElement | null
    if (!root) return
    const run = () => { if (language === 'en') translateDom(root, 'en') }
    run()
    const observer = new MutationObserver(() => requestAnimationFrame(run))
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [language, dataReady, gs.screen, gs.cpIdx, gs.missionIdx, userId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: '#E8DCC8' }}>
        <div style={{ fontFamily: T.UI, color: T.mutedFg }}>Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-start min-h-screen py-10" style={{ background: '#E8DCC8' }}>
        <div className="relative overflow-hidden flex flex-col" style={{ width: 430, height: 932, background: T.bg, borderRadius: 40, boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}>
          <LoginScreen
            lang={language}
            onLangChange={(l) => setLanguage(l)}
          />
        </div>
      </div>
    )
  }

  function toggleLanguage() { setLanguage(current => current === 'vi' ? 'en' : 'vi') }

  if (progressUserId !== null && activeProgressUserId !== progressUserId) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: '#E8DCC8' }}>
        <div style={{ fontFamily: T.UI, color: T.mutedFg }}>Đang tải tiến trình tài khoản...</div>
      </div>
    )
  }

  const cp = CHECKPOINTS[gs.cpIdx]
  const mission = cp?.missions[gs.missionIdx]
  const cpProg = getCPProgress(gs, cp?.id)

  if (!dataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#E8DCC8', fontFamily: T.UI }}>
        <div className="rounded-3xl p-8 text-center" style={{ background: T.card }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Mật Mã Thăng Long</div>
          <div style={{ marginTop: 8, color: T.mutedFg }}>{dataError ?? 'Đang tải dữ liệu từ MySQL...'}</div>
          {dataError && (
            <button onClick={() => window.location.reload()} className="mt-5 px-5 py-3 rounded-2xl" style={{ background: T.red, color: 'white', border: 0, cursor: 'pointer' }}>
              Thử lại
            </button>
          )}
        </div>
      </div>
    )
  }

  function go(screen: GameState['screen'], extra: Partial<GameState> = {}) {
    setGS(s => ({ ...s, prevScreen: s.screen, screen, showHint: false, selectedCollectibleId: null, ...extra }))
  }

  function markMissionComplete() {
    const cpId = cp.id
    setGS(s => {
      const prev = getCPProgress(s, cpId)
      const newProg: CPProgress = {
        missionsCompleted: prev.missionsCompleted + 1,
        xpEarned: prev.xpEarned + mission.xp,
        cluesFound: prev.cluesFound + 1,
      }
      const isCheckpointComplete = newProg.missionsCompleted >= 5
      const isFinalCP = cpId === CHECKPOINTS[CHECKPOINTS.length - 1].id
      return {
        ...s,
        screen: isCheckpointComplete ? (isFinalCP ? 'final-cp-complete' : 'cp-complete') : 'correct',
        showHint: false,
        cpProgress: { ...s.cpProgress, [cpId]: newProg },
      }
    })
  }

  function goNextMission() {
    if (gs.missionIdx < 4) {
      go('mission', { missionIdx: gs.missionIdx + 1 })
    }
  }

  function goHome() { go('home') }
  function goMap() { go('map') }
  function goProfile() { go('profile') }

  // Convenience: open a checkpoint from home/map
  function goToCP(cpIdx: number) {
    go('cp-intro', { cpIdx, missionIdx: getCPProgress(gs, CHECKPOINTS[cpIdx].id).missionsCompleted })
  }
  // ─── Screen: Profile (Passport + Achievements tabs) ───────────────────────

  function ScreenPassportAchievements({ gameState, onBack }: { gameState: GameState; onBack: () => void }) {
    const [tab, setTab] = useState<'passport' | 'achievements'>('passport')
    const [vis, setVis] = useState(false)
    useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

    const totalXP = Object.values(gameState.cpProgress).reduce((s, p) => s + p.xpEarned, 0)
    const completedCount = CHECKPOINTS.filter(cp => (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) >= 5).length
    const stampsCount = completedCount
    const collectCount = COLLECTIBLES.filter(c => c.collected).length

    // Determine stamp state for each CP
    function stampState(cpId: number): 'completed' | 'current' | 'locked' {
      const prog = gameState.cpProgress[cpId]?.missionsCompleted ?? 0
      if (prog >= 5) return 'completed'
      const firstIncomplete = CHECKPOINTS.find(cp => (gameState.cpProgress[cp.id]?.missionsCompleted ?? 0) < 5)
      return firstIncomplete?.id === cpId ? 'current' : 'locked'
    }

    return (
      <div className="flex flex-col h-full" style={{ background: T.bg }}>
        {/* Header */}
        <div className="flex-shrink-0" style={{ background: `linear-gradient(160deg, #2A0828 0%, #4A1040 100%)`, paddingBottom: 0 }}>
          <StatusBar light />
          <div className="flex items-center gap-3 px-5 pt-1 pb-4">
            <BackButton onBack={onBack} light />
            <div className="flex-1">
              <p style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Hồ sơ</p>
              <h1 style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>Hành trình sĩ tử</h1>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl px-3 py-2" style={{ background: 'rgba(245,200,66,0.2)', border: '1.5px solid rgba(245,200,66,0.4)' }}>
              <span style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: T.yellow, lineHeight: 1 }}>{totalXP}</span>
              <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>{translateText('Điểm')}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2 px-5 pb-4">
            {[
              { icon: '📮', val: `${stampsCount}/7`, label: 'Con dấu' },
              { icon: '🎴', val: `${collectCount}/35`, label: 'Vật phẩm' },
              { icon: '⚔️', val: `${Object.values(gameState.cpProgress).reduce((s, p) => s + p.missionsCompleted, 0)}`, label: 'Nhiệm vụ' },
            ].map(s => (
              <div key={s.label} className="flex-1 rounded-2xl py-2.5 flex flex-col items-center gap-0.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontFamily: T.D, fontSize: 17, fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontFamily: T.UI, fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex mx-5 mb-0 rounded-t-2xl overflow-hidden" style={{ border: `1.5px solid rgba(255,255,255,0.15)`, borderBottom: 'none' }}>
            {[{ id: 'passport', icon: '📮', label: translateText('Hộ chiếu') }, { id: 'achievements', icon: '🏅', label: 'Thành tựu' }].map(t => {
              const active = tab === t.id
              return (
                <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className="flex-1 flex items-center justify-center gap-1.5 py-3 transition-colors"
                  style={{ background: active ? T.bg : 'transparent', border: 'none', cursor: 'pointer', borderRight: t.id === 'passport' ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                  <span style={{ fontSize: 15 }}>{t.icon}</span>
                  <span style={{ fontFamily: T.UI, fontSize: 13, fontWeight: active ? 700 : 500, color: active ? T.red : 'rgba(255,255,255,0.7)' }}>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto" key={tab} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.35s ease', paddingBottom: 32 }}>

          {/* ── PASSPORT TAB ── */}
          {tab === 'passport' && (
            <div className="px-5 pt-5">
              {/* Passport booklet */}
              <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #FFFBF0 0%, #FDF5E0 100%)', border: `2px solid ${T.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                {/* Passport cover strip */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ background: `linear-gradient(135deg, ${T.plum} 0%, #6A1858 100%)`, borderBottom: `2px solid ${T.redDark}` }}>
                  <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="8" fill="rgba(255,255,255,0.15)" />
                    <text x="24" y="32" textAnchor="middle" fontSize="24" fill={T.yellow} fontFamily="serif">越</text>
                  </svg>
                  <div className="flex-1">
                    <p style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{translateText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM')}</p>
                    <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{translateText('Hộ chiếu khám phá')}</p>
                  </div>
                  <div className="rounded-xl px-2.5 py-1.5" style={{ background: 'rgba(245,200,66,0.25)', border: '1px solid rgba(245,200,66,0.5)' }}>
                    <p style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: T.yellow, textAlign: 'center', letterSpacing: '0.04em' }}>{translateText('con dấu')}</p>
                    <p style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1, textAlign: 'center' }}>{stampsCount}/7</p>
                  </div>
                </div>

                {/* Parchment texture lines */}
                <div className="px-5 pt-3 pb-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1" style={{ background: `repeating-linear-gradient(90deg, ${T.border} 0, ${T.border} 6px, transparent 6px, transparent 12px)` }} />
                    <span style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stampsCount} {translateText('con dấu đã thu thập')}</span>
                    <div className="h-px flex-1" style={{ background: `repeating-linear-gradient(90deg, ${T.border} 0, ${T.border} 6px, transparent 6px, transparent 12px)` }} />
                  </div>

                  {/* Stamps grid 3 + 3 + 1 layout */}
                  <div className="flex flex-col gap-4 pb-4">
                    {/* Row 1: CP 1-3 */}
                    <div className="flex justify-around">
                      {CHECKPOINTS.slice(0, 3).map(cp => (
                        <StampSlot key={cp.id} cp={cp} state={stampState(cp.id)} isCurrent={stampState(cp.id) === 'current'} />
                      ))}
                    </div>

                    {/* Divider with rosette */}
                    <div className="flex items-center gap-3 px-4">
                      <div className="flex-1 h-px" style={{ background: T.border }} />
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
                          const r = a * Math.PI / 180
                          return <line key={a} x1={12 + 8 * Math.cos(r)} y1={12 + 8 * Math.sin(r)} x2={12 + 11 * Math.cos(r)} y2={12 + 11 * Math.sin(r)} stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" />
                        })}
                        <circle cx="12" cy="12" r="4" fill={T.yellow} stroke={T.gold} strokeWidth="1" />
                      </svg>
                      <div className="flex-1 h-px" style={{ background: T.border }} />
                    </div>

                    {/* Row 2: CP 4-6 */}
                    <div className="flex justify-around">
                      {CHECKPOINTS.slice(3, 6).map(cp => (
                        <StampSlot key={cp.id} cp={cp} state={stampState(cp.id)} isCurrent={stampState(cp.id) === 'current'} />
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 px-4">
                      <div className="flex-1 h-px" style={{ background: T.border }} />
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
                          const r = a * Math.PI / 180
                          return <line key={a} x1={12 + 8 * Math.cos(r)} y1={12 + 8 * Math.sin(r)} x2={12 + 11 * Math.cos(r)} y2={12 + 11 * Math.sin(r)} stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" />
                        })}
                        <circle cx="12" cy="12" r="4" fill={T.yellow} stroke={T.gold} strokeWidth="1" />
                      </svg>
                      <div className="flex-1 h-px" style={{ background: T.border }} />
                    </div>

                    {/* Row 3: CP 7 centered */}
                    <div className="flex justify-center">
                      <StampSlot key={CHECKPOINTS[6].id} cp={CHECKPOINTS[6]} state={stampState(CHECKPOINTS[6].id)} isCurrent={stampState(CHECKPOINTS[6].id) === 'current'} />
                    </div>
                  </div>

                  {/* Passport footer machine-readable zone */}
                  <div className="rounded-xl px-4 py-3 mt-2" style={{ background: T.muted, border: `1px solid ${T.border}` }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 9, color: T.mutedFg, letterSpacing: '0.12em', lineHeight: 1.8 }}>
                      P&lt;VNM MẬT-MÃ-THĂNG-LONG&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
                      VML{String(totalXP).padStart(7, '0')}VNM{stampsCount}0{completedCount}KHAMPHAVANMIEU&lt;
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey progress */}
              <div className="mt-4 rounded-3xl p-4" style={{ background: T.card, border: `2px solid ${T.border}` }}>
                <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 12 }}>{translateText('Hành trình của bạn')}</p>
                {CHECKPOINTS.map((cp, i) => {
                  const st = stampState(cp.id)
                  const prog = gameState.cpProgress[cp.id]
                  return (
                    <div key={cp.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < 6 ? `1px solid ${T.border}` : 'none' }}>
                      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, background: st === 'completed' ? T.green : st === 'current' ? T.red : T.muted, border: `2px solid ${st === 'completed' ? T.greenDark : st === 'current' ? T.redDark : T.border}` }}>
                        {st === 'completed' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          : st === 'current' ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                            : <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke={T.mutedFg} strokeWidth="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={T.mutedFg} strokeWidth="2" strokeLinecap="round" /></svg>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: T.UI, fontSize: 13, fontWeight: 700, color: st === 'locked' ? T.border : T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.name}</p>
                        <p style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg }}>
                          {st === 'completed'
                            ? `✅ ${translateText('Hoàn thành')} · ${prog?.xpEarned ?? 0} XP`
                            : st === 'current'
                              ? `⚔️ ${prog?.missionsCompleted ?? 0}/5 ${translateText('câu đố')}`
                              : `🔒 ${translateText('Chưa mở khóa')}`}
                        </p>
                      </div>
                      {st === 'completed' && <span style={{ fontSize: 22 }}>{cp.stampChar}</span>}
                      {st === 'current' && <div className="rounded-full px-2 py-0.5" style={{ background: '#FFF5F5', border: `1.5px solid ${T.red}` }}><span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.red }}>Hiện tại</span></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── ACHIEVEMENTS TAB ── */}
          {tab === 'achievements' && (
            <div className="px-5 pt-5">
              {/* Progress summary */}
              {(() => {
                const unlocked = ACHIEVEMENTS.filter(a => a.check(gameState.cpProgress, collectCount)).length
                return (
                  <div className="flex items-center gap-4 rounded-3xl p-4 mb-5" style={{ background: `linear-gradient(135deg, ${T.plum} 0%, #6A1858 100%)`, border: `2px solid #3A0830`, boxShadow: `0 4px 16px rgba(74,16,64,0.3)` }}>
                    <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ fontSize: 28 }}>🏅</span>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1 }}>{unlocked} / {ACHIEVEMENTS.length}</p>
                      <p style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{translateText('thành tựu đã mở khóa')}</p>
                      <div className="mt-2 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.15)' }}>
                        <div style={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%`, height: '100%', borderRadius: 9999, background: T.yellow }} />
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Achievement cards */}
              <div className="flex flex-col gap-3">
                {ACHIEVEMENTS.map((ach, i) => {
                  const unlocked = ach.check(gameState.cpProgress, collectCount)
                  return (
                    <div key={ach.id} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(16px)', transition: `all 0.35s ease ${i * 40}ms` }}>
                      <div className="rounded-3xl overflow-hidden" style={{ background: unlocked ? `linear-gradient(135deg, ${ach.bgFrom} 0%, ${ach.bgTo} 100%)` : 'rgba(238,224,196,0.35)', border: `2px solid ${unlocked ? ach.border : T.border}`, boxShadow: unlocked ? `0 3px 14px rgba(0,0,0,0.08)` : 'none', filter: unlocked ? 'none' : 'grayscale(60%) opacity(0.7)' }}>
                        <div className="flex items-center gap-4 px-4 py-3.5">
                          {/* Badge icon */}
                          <div className="rounded-2xl flex items-center justify-center flex-shrink-0 relative" style={{ width: 60, height: 60, background: unlocked ? `linear-gradient(145deg, white, ${ach.bgTo})` : 'rgba(220,208,180,0.4)', border: `2.5px solid ${unlocked ? ach.border : T.border}`, boxShadow: unlocked ? `0 3px 0 ${ach.border}` : ' 0 2px 0 rgba(0,0,0,0.08)' }}>
                            {unlocked && <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, transparent 55%)', borderRadius: 'inherit' }} />}
                            <span style={{ fontSize: 28, filter: unlocked ? 'none' : 'grayscale(100%) opacity(0.5)' }}>{ach.emoji}</span>
                            {unlocked && (
                              <div className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center" style={{ width: 18, height: 18, background: T.green, border: '2px solid white' }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </div>
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: unlocked ? T.ink : T.mutedFg, lineHeight: 1.1, marginBottom: 3 }}>{ach.title}</p>
                            <p style={{ fontFamily: T.UI, fontSize: 12, color: unlocked ? '#5A3E2E' : T.border, lineHeight: 1.5 }}>{ach.desc}</p>
                          </div>

                          {/* Status */}
                          <div className="flex-shrink-0">
                            {unlocked ? (
                              <div className="rounded-2xl px-2.5 py-1.5 flex items-center gap-1" style={{ background: 'rgba(61,138,94,0.15)', border: `1.5px solid rgba(61,138,94,0.35)` }}>
                                <span style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: T.green }}>Đạt!</span>
                              </div>
                            ) : (
                              <div className="rounded-2xl flex items-center justify-center" style={{ width: 32, height: 32, background: 'rgba(220,208,180,0.5)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke={T.mutedFg} strokeWidth="1.8" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={T.mutedFg} strokeWidth="1.8" strokeLinecap="round" /></svg>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Unlocked shimmer bar */}
                        {unlocked && <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${ach.border}, transparent)`, opacity: 0.7 }} />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Motivational footer */}
              <div className="mt-5 flex items-start gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(238,224,196,0.4)', border: `1px dashed ${T.border}` }}>
                <VanDong size={36} mood="happy" />
                <p style={{ fontFamily: T.UI, fontSize: 12, color: T.mutedFg, lineHeight: 1.6 }}>
                  {translateText('\"Học không biết chán, dạy không biết mỏi.\" — Tiếp tục hành trình để mở khóa thêm thành tựu!')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  // ─── Screen: Final Checkpoint Complete (CP7 only) ─────────────────────────

  function ScreenFinalCPComplete({ progress, onContinue }: {
    progress: CPProgress; onContinue: () => void
  }) {
    const cp = CHECKPOINTS[6] // Nhà Thái Học
    const [phase, setPhase] = useState(0)

    useEffect(() => {
      const t1 = setTimeout(() => setPhase(1), 200)
      const t2 = setTimeout(() => setPhase(2), 900)
      const t3 = setTimeout(() => setPhase(3), 1600)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [])

    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'linear-gradient(160deg, #1A0C18 0%, #2A0828 50%, #4A1040 100%)' }}>
        {/* Stars */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 430 932" fill="none">
          {Array.from({ length: 32 }).map((_, i) => {
            const x = 12 + ((i * 173) % 406), y = 12 + ((i * 131) % 900)
            const r = i % 3 === 0 ? 2.5 : i % 3 === 1 ? 1.8 : 1.2
            return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={0.15 + (i % 7) * 0.07} />
          })}
          {/* Large starburst rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
            const r = a * Math.PI / 180
            return <line key={a} x1={215 + 60 * Math.cos(r)} y1={300 + 60 * Math.sin(r)} x2={215 + 130 * Math.cos(r)} y2={300 + 130 * Math.sin(r)} stroke={T.gold} strokeWidth="1" opacity="0.12" />
          })}
        </svg>

        <div className="relative z-10 flex flex-col items-center px-5 pt-8 pb-10 gap-5">
          <StatusBar light />

          {/* HOÀN THÀNH badge */}
          <div style={{ opacity: phase > 0 ? 1 : 0, transform: phase > 0 ? 'translateY(0)' : 'translateY(-16px)', transition: 'all 0.45s ease' }}>
            <div className="rounded-full px-5 py-2 flex items-center gap-2" style={{ background: 'rgba(245,200,66,0.2)', border: '1.5px solid rgba(245,200,66,0.5)' }}>
              <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.yellow, letterSpacing: '0.1em' }}>✦ {translateText('TRẠM CUỐI CÙNG')} · 07/07 ✦</span>
            </div>
          </div>

          {/* Grand celebratory illustration */}
          <div style={{ opacity: phase > 0 ? 1 : 0, transform: phase > 0 ? 'scale(1)' : 'scale(0.75)', transition: 'all 0.6s cubic-bezier(0.34,1.5,0.64,1) 0.1s' }}>
            <svg width="280" height="240" viewBox="0 0 280 240" fill="none">
              {/* Radial glow */}
              <defs>
                <radialGradient id="finalGlow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor={T.gold} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={T.gold} stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="140" cy="140" rx="130" ry="110" fill="url(#finalGlow)" />

              {/* Temple structure */}
              <rect x="40" y="120" width="200" height="90" rx="4" fill="#C8B890" stroke={T.gold} strokeWidth="1.5" />
              <rect x="55" y="130" width="170" height="75" rx="2" fill="#D8C8A0" />
              {/* Columns */}
              {[70, 100, 130, 160, 190].map(x => (
                <rect key={x} x={x} y="132" width="12" height="73" rx="3" fill="#B0A070" stroke={T.gold} strokeWidth="0.8" />
              ))}
              {/* Roof layer 2 */}
              <path d="M30 122 L140 80 L250 122 Z" fill={T.red} stroke={T.redDark} strokeWidth="2" />
              <path d="M34 122 L140 84 L246 122" stroke={T.gold} strokeWidth="1" fill="none" />
              {/* Roof layer 1 */}
              <path d="M15 125 Q30 118 30 122 L250 122 Q250 118 265 125 Q250 132 140 136 Q30 132 15 125 Z" fill="#A83030" />
              {/* Ridge ornaments */}
              {[140, 35, 245].map((x, i) => (
                <g key={i} transform={`translate(${x - 6}, ${i === 0 ? 76 : 118})`}>
                  <rect width="12" height="12" rx="2" fill={T.yellow} stroke={T.gold} strokeWidth="1" transform="rotate(45 6 6)" />
                </g>
              ))}
              {/* Roof layer 0 (top) */}
              <path d="M60 82 L140 38 L220 82 Z" fill={T.red} stroke={T.redDark} strokeWidth="1.5" />
              <path d="M63 82 L140 42 L217 82" stroke={T.gold} strokeWidth="0.8" fill="none" />
              <path d="M55 85 Q60 80 60 82 L220 82 Q220 80 225 85 Q210 91 140 94 Q70 91 55 85 Z" fill="#A83030" />
              {/* Top ornament */}
              <rect x="132" y="30" width="16" height="16" rx="3" fill={T.yellow} stroke={T.gold} strokeWidth="1.5" transform="rotate(45 140 38)" />
              <circle cx="140" cy="38" r="5" fill={T.red} />

              {/* Door */}
              <rect x="118" y="155" width="44" height="55" rx="4" fill={T.red} stroke={T.redDark} strokeWidth="2" />
              <rect x="122" y="159" width="16" height="51" rx="2" fill="#C02020" />
              <rect x="142" y="159" width="16" height="51" rx="2" fill="#C02020" />
              <circle cx="136" cy="183" r="3" fill={T.gold} />
              <circle cx="144" cy="183" r="3" fill={T.gold} />

              {/* Windows */}
              {[75, 185].map(x => (
                <g key={x}>
                  <rect x={x} y="150" width="28" height="24" rx="3" fill="#E8D898" stroke={T.gold} strokeWidth="1" />
                  <line x1={x + 14} y1="150" x2={x + 14} y2="174" stroke={T.gold} strokeWidth="0.8" />
                  <line x1={x} y1="162" x2={x + 28} y2="162" stroke={T.gold} strokeWidth="0.8" />
                </g>
              ))}

              {/* Flying paper/scrolls */}
              {[[50, 60, -15], [220, 55, 20], [30, 100, -8], [248, 95, 12]].map(([x, y, rot], i) => (
                <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
                  <rect x="-10" y="-14" width="20" height="28" rx="2" fill="#FDF6E8" stroke={T.gold} strokeWidth="1" />
                  {[-6, -2, 2, 6].map(ly => <line key={ly} x1="-7" y1={ly} x2="7" y2={ly} stroke={T.red} strokeWidth="0.8" opacity="0.5" />)}
                </g>
              ))}

              {/* Floating coins */}
              {[[80, 40], [200, 35], [60, 150], [230, 145]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="8" fill={T.yellow} stroke={T.gold} strokeWidth="1.5" />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="8" fill={T.ink} fontFamily="serif">福</text>
                </g>
              ))}

              {/* Fireworks sparkles */}
              {[[50, 30, T.yellow], [230, 25, T.red], [140, 15, 'white'], [20, 80, T.gold], [265, 70, T.yellow]].map(([x, y, c], i) => (
                <g key={i} transform={`translate(${x},${y})`}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
                    const rad = a * Math.PI / 180, len = 8 + (i % 3) * 3
                    return <line key={a} x1={0} y1={0} x2={len * Math.cos(rad)} y2={len * Math.sin(rad)} stroke={String(c)} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  })}
                  <circle cx="0" cy="0" r="2.5" fill={String(c)} />
                </g>
              ))}
            </svg>
          </div>

          {/* Title */}
          <div className="text-center" style={{ opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.45s ease' }}>
            <p style={{ fontFamily: T.UI, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{translateText('HOÀN THÀNH TRẠM')} 07</p>
            <h1 style={{ fontFamily: T.D, fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.05, marginBottom: 6 }}>Nhà Thái Học</h1>
            <p style={{ fontFamily: T.UI, fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 300 }}>
              {translateText('Trường đại học đầu tiên của Việt Nam — nơi tri thức soi đường cho muôn đời sau.')}
            </p>
          </div>

          {/* Seal being "stamped" onto passport */}
          <div style={{ opacity: phase > 1 ? 1 : 0, transition: 'opacity 0.4s ease 0.1s', width: '100%' }}>
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 20 }}>📮</span>
                <p style={{ fontFamily: T.D, fontSize: 15, fontWeight: 700, color: 'white' }}>{translateText('Con dấu mới thêm vào hộ chiếu')}</p>
              </div>
              <div className="flex items-center gap-4 px-4 py-3">
                <div style={{ opacity: phase > 2 ? 1 : 0, transform: phase > 2 ? 'scale(1) rotate(0deg)' : 'scale(2.5) rotate(-20deg)', transition: 'all 0.6s cubic-bezier(0.34,1.6,0.64,1)', filter: `drop-shadow(0 0 16px rgba(193,39,45,0.7))` }}>
                  <TraditionalSeal char={cp.stampChar} name={cp.stampName} />
                </div>
                <div className="flex-1">
                  <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 700, color: T.yellow, marginBottom: 3 }}>{cp.stampName}</p>
                  <p style={{ fontFamily: T.UI, fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{translateText('Con dấu thứ 7 — bộ sưu tập hoàn chỉnh!')} </p>
                  <div className="flex gap-1 mt-2">
                    {CHECKPOINTS.map((_, i) => (
                      <div key={i} className="rounded-full flex-1" style={{ height: 6, background: phase > 2 ? T.green : i < 6 ? T.green : T.muted, transition: `background 0.15s ease ${i * 60}ms`, border: `1px solid ${i < 6 || phase > 2 ? T.greenDark : T.border}` }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: T.UI, fontSize: 11, color: T.green, marginTop: 4, fontWeight: 700 }}>7 / 7 {translateText('con dấu')} ✓</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 w-full" style={{ opacity: phase > 2 ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }}>
            {[
              {
                icon: '⭐',
                val: `+${progress.xpEarned}`,
                sub: translateText('XP trạm này')
              },
              {
                icon: '🔑',
                val: `${progress.cluesFound}`,
                sub: translateText('Manh mối')
              },
              {
                icon: '🎴',
                val: '5/5',
                sub: translateText('thử thách')
              }
            ].map(s => (
              <div key={s.sub} className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontFamily: T.D, fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontFamily: T.UI, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s.sub}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={onContinue} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
            style={{ height: 60, background: `linear-gradient(135deg, ${T.gold} 0%, #FFD060 100%)`, color: T.ink, fontFamily: T.D, fontSize: 20, fontWeight: 800, border: `2px solid ${T.yellowDark}`, boxShadow: `0 5px 0 ${T.yellowDark}, 0 10px 28px rgba(212,160,23,0.4)`, cursor: 'pointer', opacity: phase > 2 ? 1 : 0, transition: 'opacity 0.4s ease 0.4s' }}>
            🏆 {translateText('Hoàn thành hành trình')}
          </button>
        </div>
      </div>
    )
  }
  // ─── Screen: Journey Complete ──────────────────────────────────────────────

  function ScreenJourneyComplete({ gameState, onCertificate, onHome }: {
    gameState: GameState; onCertificate: () => void; onHome: () => void
  }) {
    const [phase, setPhase] = useState(0)
    const [xpCount, setXpCount] = useState(0)

    const totalXP = Object.values(gameState.cpProgress).reduce((s, p) => s + p.xpEarned, 0)
    const totalClues = Object.values(gameState.cpProgress).reduce((s, p) => s + p.cluesFound, 0)

    useEffect(() => {
      const t1 = setTimeout(() => setPhase(1), 150)
      const t2 = setTimeout(() => setPhase(2), 700)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    useEffect(() => {
      if (phase < 2) return
      let frame = 0; const dur = 80
      const tick = () => { frame++; setXpCount(Math.min(Math.round((frame / dur) * totalXP), totalXP)); if (frame < dur) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    }, [phase, totalXP])

    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'linear-gradient(170deg, #0E1A08 0%, #1A2C10 40%, #0A1808 100%)' }}>
        {/* Starfield */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 430 932" fill="none">
          {Array.from({ length: 42 }).map((_, i) => {
            const x = 6 + ((i * 167) % 418), y = 6 + ((i * 113) % 920)
            return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 2 : 1.2} fill="white" opacity={0.1 + (i % 8) * 0.06} />
          })}
          {/* Radial light beams from center */}
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map(a => {
            const r = a * Math.PI / 180
            return <line key={a} x1="215" y1="240" x2={215 + 280 * Math.cos(r)} y2={240 + 280 * Math.sin(r)} stroke={T.gold} strokeWidth="0.6" opacity="0.08" />
          })}
        </svg>

        <div className="relative z-10 flex flex-col items-center px-5 pt-8 pb-10 gap-5">
          <StatusBar light />

          {/* CHÚC MỪNG */}
          <div style={{ opacity: phase > 0 ? 1 : 0, transform: phase > 0 ? 'scale(1)' : 'scale(0.6)', transition: 'all 0.5s cubic-bezier(0.34,1.5,0.64,1)', textAlign: 'center' }}>
            <div className="rounded-full px-6 py-2 inline-flex items-center gap-2 mb-4" style={{ background: `linear-gradient(135deg, ${T.gold}, #FFD060)`, border: `2px solid ${T.yellowDark}`, boxShadow: `0 4px 0 ${T.yellowDark}, 0 8px 24px rgba(212,160,23,0.4)` }}>
              <span style={{ fontSize: 22 }}>🎊</span>
              <span style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: '0.04em' }}>CHÚC MỪNG!</span>
              <span style={{ fontSize: 22 }}>🎊</span>
            </div>
            <h1 style={{ fontFamily: T.D, fontSize: 34, fontWeight: 800, color: 'white', lineHeight: 1.05, marginBottom: 6 }}>CHÚC MỪNG, SĨ TỬ!</h1>
            <p style={{ fontFamily: T.UI, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: 320, margin: '0 auto' }}>
              {translateText('Bạn đã hoàn thành hành trình')}<br /><strong style={{ color: T.yellow }}>Mật Mã Thăng Long.</strong>
            </p>
          </div>

          {/* All 7 stamps */}
          <div style={{ opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.5s ease 0.1s', width: '100%' }}>
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <p style={{ fontFamily: T.D, fontSize: 15, fontWeight: 700, color: 'white' }}>{translateText('7 con dấu hoàn chỉnh')}</p>
                <div className="rounded-full px-3 py-0.5" style={{ background: `rgba(61,138,94,0.3)`, border: `1px solid rgba(61,138,94,0.5)` }}>
                  <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: '#88DDAA' }}>7/7 ✓</span>
                </div>
              </div>
              {/* Stamps row — scaled down */}
              <div className="flex justify-around px-2 pb-3 overflow-x-auto gap-1" style={{ scrollbarWidth: 'none' }}>
                {CHECKPOINTS.map((cp, i) => (
                  <div key={cp.id} style={{ flexShrink: 0, opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'scale(1)' : 'scale(0.5)', transition: `all 0.4s cubic-bezier(0.34,1.5,0.64,1) ${0.1 + i * 0.08}s` }}>
                    <svg width="48" height="48" viewBox="0 0 180 180" fill="none">
                      <rect x="4" y="4" width="172" height="172" rx="14" fill="#C1272D" />
                      <rect x="0" y="0" width="180" height="180" rx="18" fill="none" stroke="#8B0000" strokeWidth="4" />
                      <rect x="10" y="10" width="160" height="160" rx="10" fill="none" stroke="rgba(255,220,180,0.4)" strokeWidth="2" />
                      <text x="90" y="105" textAnchor="middle" fontSize="72" fill="rgba(255,245,220,0.9)" fontFamily="serif" fontWeight="bold">{cp.stampChar}</text>
                    </svg>
                    <p style={{ fontFamily: T.UI, fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 2, lineHeight: 1.2, maxWidth: 48 }}>{cp.stampName.replace('Trạm ', '').substring(0, 8)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 w-full" style={{ opacity: phase > 1 ? 1 : 0, transform: phase > 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.45s ease 0.25s' }}>
            {[
              { icon: '🗺️', label: translateText('Trạm hoàn thành'), val: '7/7', big: true, color: T.green },
              { icon: '⚔️', label: translateText('thử thách'), val: '35/35', big: true, color: T.red },
              { icon: '🔑', label: translateText('Manh mối'), val: `${totalClues}`, color: T.gold },
              { icon: '📮', label: translateText('Con dấu'), val: '7', color: T.plum },
              { icon: '⭐', label: translateText('Tổng điểm XP'), val: `${xpCount}`, color: T.yellow, span: true },
            ].filter(s => !s.span).map(s => (
              <div key={s.label} className="rounded-3xl p-4 flex flex-col items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.07)', border: `1.5px solid rgba(255,255,255,0.12)` }}>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <span style={{ fontFamily: T.D, fontSize: s.big ? 24 : 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontFamily: T.UI, fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>{s.label}</span>
              </div>
            ))}
            {/* XP spanning full width */}
            <div className="col-span-2 rounded-3xl px-5 py-4 flex items-center gap-4" style={{ background: `linear-gradient(135deg, rgba(212,160,23,0.25) 0%, rgba(212,160,23,0.1) 100%)`, border: `1.5px solid rgba(212,160,23,0.4)` }}>
              <span style={{ fontSize: 32 }}>⭐</span>
              <div>
                <span style={{ fontFamily: T.D, fontSize: 36, fontWeight: 800, color: T.yellow, lineHeight: 1 }}>{xpCount.toLocaleString()}</span>
                <span style={{ fontFamily: T.UI, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{translateText('XP tổng cộng')}</span>
              </div>
              <div className="ml-auto">
                <div className="rounded-2xl px-3 py-1.5" style={{ background: 'rgba(245,200,66,0.25)', border: '1px solid rgba(245,200,66,0.4)' }}>
                  <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.yellow }}>🏅 {translateText('Bậc thầy')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 w-full" style={{ opacity: phase > 1 ? 1 : 0, transition: 'opacity 0.4s ease 0.5s' }}>
            <button onClick={onCertificate} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
              style={{ height: 60, background: `linear-gradient(135deg, ${T.red} 0%, #E03030 100%)`, color: 'white', fontFamily: T.D, fontSize: 20, fontWeight: 800, border: `2px solid ${T.redDark}`, boxShadow: `0 5px 0 ${T.redDark}, 0 10px 28px rgba(193,39,45,0.4)`, cursor: 'pointer' }}>
              📜 {translateText('Nhận chứng nhận')}
            </button>
            <button onClick={onHome} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
              style={{ height: 48, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', fontFamily: T.UI, fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              🏠 {translateText('Về trang chủ')}
            </button>
          </div>
        </div>
      </div>
    )
  }
  // ─── Screen: Digital Certificate ──────────────────────────────────────────

  function ScreenCertificate({ gameState, onHome }: {
    gameState: GameState; onHome: () => void
  }) {
    const [vis, setVis] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')
    const [shareMsg, setShareMsg] = useState('')
    useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [])

    function handleSave() {
      setSaveMsg(`${translateText('Đã lưu')}! ✓`)
      setTimeout(() => setSaveMsg(''), 2200)
    }
    function handleShare() {
      if (navigator.share) {
        navigator.share({ title: 'Mật Mã Thăng Long', text: 'Tôi đã hoàn thành hành trình Văn Miếu – Quốc Tử Giám!' }).catch(() => { })
      } else {
        setShareMsg(`${translateText('Đã sao chép')}! ✓`)
        setTimeout(() => setShareMsg(''), 2200)
      }
    }

    const totalXP = Object.values(gameState.cpProgress).reduce((s, p) => s + p.xpEarned, 0)
    const today = new Date().toLocaleDateString(
      language === 'en' ? 'en-US' : 'vi-VN',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    )
    const teamName = 'Đội Thám Tử Văn Miếu'

    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: T.bg }}>
        <div className="relative z-10 flex flex-col items-center px-4 pt-2 pb-10">
          <StatusBar />

          {/* Certificate card */}
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)', transition: 'all 0.5s cubic-bezier(0.34,1.2,0.64,1)', width: '100%' }}>
            <div className="rounded-[28px] overflow-hidden" style={{ background: 'linear-gradient(160deg, #FFFDF0 0%, #FDF5D8 100%)', border: `3px solid ${T.gold}`, boxShadow: `0 8px 40px rgba(0,0,0,0.12), 0 0 0 6px rgba(212,160,23,0.12)` }}>

              {/* Top border ornament */}
              <div style={{ height: 8, background: `repeating-linear-gradient(90deg, ${T.red} 0, ${T.red} 14px, ${T.gold} 14px, ${T.gold} 20px, ${T.red} 20px)` }} />

              {/* Header */}
              <div className="flex flex-col items-center px-6 pt-6 pb-4" style={{ background: `linear-gradient(160deg, ${T.plum} 0%, #6A1858 100%)`, borderBottom: `2px solid ${T.gold}` }}>
                {/* Vietnam emblem area */}
                <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 64, height: 64, background: 'rgba(245,200,66,0.2)', border: `2.5px solid rgba(245,200,66,0.5)` }}>
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" fill="none" stroke={T.gold} strokeWidth="1.5" />
                    <text x="24" y="30" textAnchor="middle" fontSize="20" fill={T.yellow} fontFamily="serif" fontWeight="bold">學</text>
                    {[0, 60, 120, 180, 240, 300].map(a => {
                      const r = a * Math.PI / 180
                      return <circle key={a} cx={24 + 21 * Math.cos(r)} cy={24 + 21 * Math.sin(r)} r="2" fill={T.gold} opacity="0.6" />
                    })}
                  </svg>
                </div>
                <p style={{ fontFamily: T.UI, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 2 }}>{translateText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM')}</p>
                <p style={{ fontFamily: T.D, fontSize: 20, fontWeight: 800, color: T.yellow, letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.1 }}>{translateText('CHỨNG NHẬN HOÀN THÀNH')}</p>
                <p style={{ fontFamily: T.D, fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: 2, letterSpacing: '0.06em' }}>MẬT MÃ THĂNG LONG</p>
              </div>

              {/* Body */}
              <div className="px-6 py-5">

                {/* Decorative top corners */}
                <svg width="100%" height="28" viewBox="0 0 380 28" fill="none" style={{ display: 'block', marginBottom: 16 }}>
                  <path d="M0 14 Q95 0 190 14 Q285 28 380 14" stroke={T.gold} strokeWidth="1.5" fill="none" opacity="0.5" />
                  {[0, 60, 120, 180, 240, 300, 360].map(x => <circle key={x} cx={x / 360 * 380} cy={14 + 8 * Math.sin(x * Math.PI / 180)} r="2.5" fill={T.gold} opacity="0.4" />)}
                </svg>

                {/* This is to certify */}
                <p style={{ fontFamily: T.UI, fontSize: 12, color: T.mutedFg, textAlign: 'center', fontStyle: 'italic', marginBottom: 8, letterSpacing: '0.04em' }}>{translateText('Chứng nhận rằng')}</p>

                {/* Team name */}
                <div className="text-center mb-4">
                  <div className="inline-block rounded-2xl px-5 py-2.5" style={{ background: 'rgba(193,39,45,0.07)', border: `2px solid rgba(193,39,45,0.25)` }}>
                    <p style={{ fontFamily: T.D, fontSize: 22, fontWeight: 800, color: T.red, lineHeight: 1.1 }}>{teamName}</p>
                  </div>
                </div>

                <p style={{ fontFamily: T.UI, fontSize: 13, color: T.ink, textAlign: 'center', lineHeight: 1.7, marginBottom: 16 }}>
                  {translateText('đã hoàn thành toàn bộ hành trình khám phá')}<br />
                  <strong style={{ color: T.plum }}>Văn Miếu – Quốc Tử Giám</strong><br />
                  {translateText('với')} <strong>{totalXP} {translateText('điểm')} XP</strong> {translateText('và')} <strong>7 {translateText('con dấu')}</strong> {translateText('thu thập')}.
                </p>

                {/* 7 stamps mini-grid */}
                <div className="rounded-2xl p-3 mb-4" style={{ background: 'rgba(193,39,45,0.04)', border: `1.5px solid rgba(193,39,45,0.15)` }}>
                  <p style={{ fontFamily: T.UI, fontSize: 9, fontWeight: 700, color: T.mutedFg, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>{translateText('Dấu ấn')} 7 trạm</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {CHECKPOINTS.map(cp => (
                      <div key={cp.id} className="flex flex-col items-center gap-1">
                        <svg width="40" height="40" viewBox="0 0 180 180" fill="none">
                          <rect x="5" y="5" width="170" height="170" rx="13" fill="#C1272D" />
                          <rect x="1" y="1" width="178" height="178" rx="17" fill="none" stroke="#8B0000" strokeWidth="3" />
                          <rect x="11" y="11" width="158" height="158" rx="9" fill="none" stroke="rgba(255,220,180,0.4)" strokeWidth="1.5" />
                          <text x="90" y="107" textAnchor="middle" fontSize="72" fill="rgba(255,245,220,0.92)" fontFamily="serif" fontWeight="bold">{cp.stampChar}</text>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final achievement badge */}
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4" style={{ background: `linear-gradient(135deg, rgba(74,16,64,0.08), rgba(74,16,64,0.04))`, border: `1.5px solid rgba(74,16,64,0.2)` }}>
                  <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52, background: `linear-gradient(145deg, #FFF8E0, #FFE890)`, border: `2.5px solid ${T.gold}`, boxShadow: `0 3px 0 ${T.yellowDark}` }}>
                    <span style={{ fontSize: 28 }}>🏆</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: T.D, fontSize: 16, fontWeight: 800, color: T.plum, lineHeight: 1 }}>{translateText('Bậc thầy Thăng Long')}</p>
                    <p style={{ fontFamily: T.UI, fontSize: 11, color: T.mutedFg, marginTop: 3 }}>{translateText('Thành tựu tối cao')} · {translateText('Hoàn thành')} 7/7 trạm</p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <div className="rounded-2xl px-2.5 py-1.5" style={{ background: `rgba(61,138,94,0.15)`, border: `1.5px solid rgba(61,138,94,0.35)` }}>
                      <span style={{ fontFamily: T.UI, fontSize: 11, fontWeight: 700, color: T.green }}>Đạt!</span>
                    </div>
                  </div>
                </div>

                {/* Date and signature line */}
                <div className="flex items-end justify-between mt-2 mb-3">
                  <div>
                    <p style={{ fontFamily: T.UI, fontSize: 10, color: T.mutedFg, letterSpacing: '0.04em' }}>{translateText('Ngày hoàn thành')}</p>
                    <p style={{ fontFamily: T.D, fontSize: 13, fontWeight: 700, color: T.ink }}>{today}</p>
                  </div>
                  <div className="text-right">
                    <div className="rounded-xl px-3 py-2" style={{ background: T.muted, border: `1px solid ${T.border}` }}>
                      <p style={{ fontFamily: 'serif', fontSize: 16, fontStyle: 'italic', color: T.red, lineHeight: 1.1, fontWeight: 700 }}>Văn Miếu</p>
                      <p style={{ fontFamily: T.UI, fontSize: 8, color: T.mutedFg, letterSpacing: '0.04em' }}>Quốc Tử Giám</p>
                    </div>
                  </div>
                </div>

                {/* Wavy ornament bottom */}
                <svg width="100%" height="28" viewBox="0 0 380 28" fill="none" style={{ display: 'block' }}>
                  <path d="M0 14 Q95 28 190 14 Q285 0 380 14" stroke={T.gold} strokeWidth="1.5" fill="none" opacity="0.5" />
                  {[0, 60, 120, 180, 240, 300, 360].map(x => <circle key={x} cx={x / 360 * 380} cy={14 - 8 * Math.sin(x * Math.PI / 180)} r="2.5" fill={T.gold} opacity="0.4" />)}
                </svg>
              </div>

              {/* Bottom border ornament */}
              <div style={{ height: 8, background: `repeating-linear-gradient(90deg, ${T.gold} 0, ${T.gold} 14px, ${T.red} 14px, ${T.red} 20px, ${T.gold} 20px)` }} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full mt-5" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.4s ease 0.3s' }}>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
                style={{ height: 52, background: saveMsg ? `linear-gradient(135deg, ${T.greenDark}, ${T.green})` : `linear-gradient(135deg, ${T.green}, #4AAA70)`, color: 'white', fontFamily: T.D, fontSize: 15, fontWeight: 700, border: `2px solid ${T.greenDark}`, boxShadow: `0 3px 0 ${T.greenDark}, 0 6px 16px rgba(61,138,94,0.3)`, cursor: 'pointer', transition: 'background 0.3s' }}>
                {saveMsg || `💾 ${translateText('Lưu')}`}
              </button>
              <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
                style={{ height: 52, background: shareMsg ? `linear-gradient(135deg, #1D4ED8, #2563EB)` : `linear-gradient(135deg, #2563EB, #3B82F6)`, color: 'white', fontFamily: T.D, fontSize: 15, fontWeight: 700, border: '2px solid #1D4ED8', boxShadow: '0 3px 0 #1D4ED8, 0 6px 16px rgba(37,99,235,0.3)', cursor: 'pointer', transition: 'background 0.3s' }}>
                {shareMsg || `📤 ${translateText('Chia sẻ')}`}
              </button>
            </div>
            <button onClick={onHome} className="w-full flex items-center justify-center gap-2 rounded-2xl active:translate-y-0.5 transition-all"
              style={{ height: 52, background: T.card, color: T.ink, fontFamily: T.D, fontSize: 17, fontWeight: 700, border: `2px solid ${T.border}`, boxShadow: `0 3px 0 ${T.border}`, cursor: 'pointer' }}>
              🏠 {translateText('Về trang chủ')}
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-center items-start min-h-screen py-10" style={{ background: '#E8DCC8' }}>
      <div className="relative overflow-hidden flex flex-col" style={{ width: 430, height: 932, background: T.bg, borderRadius: 40, boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)' }}>

        {progressError && (
          <div role="alert" className="absolute top-2 left-3 right-3 z-50 rounded-xl px-3 py-2" style={{ background: '#FFF0F0', border: `1px solid ${T.red}`, color: T.red, fontFamily: T.UI, fontSize: 11 }}>
            {progressError}
          </div>
        )}

        <div key={`${gs.screen}-${gs.cpIdx}-${gs.missionIdx}`} className="flex-1 overflow-hidden" style={{ animation: 'screenIn 0.3s ease', minHeight: 0 }}>
          {/* ── Main nav destinations ── */}
          {gs.screen === 'home' && (
            <ScreenHome gameState={gs} displayName={user.displayName || user.username} onGoCheckpoint={goToCP} onGoMap={goMap} onGoCollection={() => go('collection')} onGoProfile={goProfile} onGoPassport={() => go('passport')} />
          )}
          {gs.screen === 'map' && (
            <MapScreen gameState={gs} onSelectCP={goToCP} onOpenCollection={() => go('collection')} onOpenProfile={goProfile} onOpenHome={goHome} />
          )}
          {gs.screen === 'collection' && (
            <ScreenCollection onSelectItem={id => go('collectible-detail', { selectedCollectibleId: id })} onBack={goHome} onGoMap={goMap} onGoProfile={goProfile} />
          )}
          {gs.screen === 'collectible-detail' && gs.selectedCollectibleId && (
            <ScreenCollectibleDetail id={gs.selectedCollectibleId} onBack={() => go('collection')} />
          )}
          {gs.screen === 'profile' && (
            <ScreenProfile gameState={gs} displayName={user.displayName || user.username} onBack={goHome} onGoPassport={() => go('passport')} onGoHelp={() => go('help')} onGoCertificate={() => go('certificate')} onGoHome={goHome} onGoMap={goMap} onGoCollection={() => go('collection')} onLogout={logout} language={language} onToggleLanguage={toggleLanguage} />
          )}
          {gs.screen === 'passport' && (
            <ScreenPassportAchievements gameState={gs} onBack={() => go(gs.prevScreen === 'home' ? 'home' : 'profile')} />
          )}
          {gs.screen === 'help' && (
            <ScreenHelp onBack={() => go('profile')} />
          )}
          {/* ── Gameplay flow ── */}
          {gs.screen === 'cp-intro' && (
            <ScreenCPIntro cp={cp} progress={cpProg} onStart={() => go('mission')} onBack={goMap} />
          )}
          {gs.screen === 'mission' && mission && (
            <ScreenMission cp={cp} mission={mission} missionIdx={gs.missionIdx} onReady={() => go('puzzle')} onBack={() => go('cp-intro')} />
          )}
          {gs.screen === 'puzzle' && mission && (
            <ScreenPuzzle cp={cp} mission={mission} missionIdx={gs.missionIdx} onCorrect={markMissionComplete} onWrong={() => go('wrong')} onBack={() => go('mission')} onHint={() => setGS(s => ({ ...s, showHint: true }))} />
          )}
          {gs.screen === 'correct' && mission && (
            <ScreenCorrect cp={cp} mission={mission} missionIdx={gs.missionIdx} onNext={goNextMission} />
          )}
          {gs.screen === 'wrong' && (
            <ScreenWrong onRetry={() => go('puzzle')} onHint={() => setGS(s => ({ ...s, screen: 'puzzle', showHint: true }))} />
          )}
          {gs.screen === 'cp-complete' && (
            <ScreenCPComplete cp={cp} progress={cpProg} onContinue={goMap} />
          )}
          {/* ── Endgame flow ── */}
          {gs.screen === 'final-cp-complete' && (
            <ScreenFinalCPComplete progress={getCPProgress(gs, CHECKPOINTS[6].id)} onContinue={() => go('journey-complete')} />
          )}
          {gs.screen === 'journey-complete' && (
            <ScreenJourneyComplete gameState={gs} onCertificate={() => go('certificate')} onHome={goHome} />
          )}
          {gs.screen === 'certificate' && (
            <ScreenCertificate gameState={gs} onHome={goHome} />
          )}
        </div>

        {/* Hint sheet */}
        {gs.showHint && mission && (
          <HintSheet mission={mission} onClose={() => setGS(s => ({ ...s, showHint: false }))} />
        )}
      </div>

      <style>{`
        @keyframes screenIn { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        @keyframes sheetUp  { from { transform:translateY(100%); opacity:0.7; } to { transform:translateY(0); opacity:1; } }
        @keyframes shake    { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-8px);} 40%{transform:translateX(8px);} 60%{transform:translateX(-5px);} 80%{transform:translateX(5px);} }
        @keyframes wrongShake { 0%,100%{transform:rotate(0deg) scale(1);} 25%{transform:rotate(-8deg) scale(1.05);} 75%{transform:rotate(8deg) scale(1.05);} }
        @keyframes sparkle  { from{opacity:0;transform:scale(0) rotate(0deg);} 50%{opacity:1;transform:scale(1.2) rotate(180deg);} to{opacity:0.6;transform:scale(1) rotate(360deg);} }
        @keyframes fadeIn        { from{opacity:0;} to{opacity:1;} }
        @keyframes passportPulse { 0%,100%{opacity:0.4;transform:scale(1);} 50%{opacity:0.9;transform:scale(1.04);} }
        @keyframes mapPulseOuter { 0%,100%{opacity:0.07;} 50%{opacity:0.22;} }
        @keyframes mapPulseInner { 0%,100%{opacity:0.12;} 50%{opacity:0.32;} }
        .map-pulse-outer { animation: mapPulseOuter 2s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
        .map-pulse-inner { animation: mapPulseInner 2s ease-in-out infinite 0.5s; transform-box:fill-box; transform-origin:center; }
        @keyframes herePing { 0%,100%{opacity:0;transform:scale(0.7);} 40%{opacity:1;transform:scale(1.1);} 70%{opacity:0.8;transform:scale(1);} }
        .map-here-ping { animation: herePing 2.4s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
      `}</style>
    </div>
  )
}
