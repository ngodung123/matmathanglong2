export type Rarity = 'common' | 'rare' | 'legendary'

export interface Option {
  id: string
  emoji: string
  label: string
  sub: string
  correct: boolean
}

export interface Mission {
  id: number
  observationTag: string
  vanDongDialogue: string
  observationInstruction: string
  putPhoneDown: string
  question: string
  options: Option[]
  hint: string
  collectibleEmoji: string
  collectibleName: string
  collectibleRarity: Rarity
  collectibleFlavour: string
  xp: number
  clueUnlocked: string
}

export interface CheckpointData {
  id: number
  name: string
  shortDescription: string
  stampName: string
  stampChar: string
  missions: Mission[]
}

export type CollectCategory = 'Linh vật' | 'Kiến trúc' | 'Biểu tượng' | 'Vật phẩm'
const CATEGORY_MAP: Record<string, CollectCategory> = {
  // EN → VI
  'Guardian': 'Linh vật',
  'Architecture': 'Kiến trúc',
  'Symbol': 'Biểu tượng',
  'Item': 'Vật phẩm',
  // VI → VI (identity, để an toàn)
  'Linh vật': 'Linh vật',
  'Kiến trúc': 'Kiến trúc',
  'Biểu tượng': 'Biểu tượng',
  'Vật phẩm': 'Vật phẩm',
}

export interface Collectible {
  id: string
  name: string
  emoji: string
  category: CollectCategory
  rarity: Rarity
  foundAt: string
  missionRef: string
  description: string
  collected: boolean
}

export interface Achievement {
  id: string
  emoji: string
  title: string
  desc: string
  bgFrom: string
  bgTo: string
  border: string
  check: (cps: Record<number, { missionsCompleted: number; xpEarned: number; cluesFound: number }>, collectCount: number) => boolean
}

export interface HelpSection {
  id: string
  icon: string
  title: string
  content: string
}

export let CHECKPOINTS: CheckpointData[] = []
export let COLLECTIBLES: Collectible[] = []
export let ACHIEVEMENTS: Achievement[] = []
export let HELP_SECTIONS: HelpSection[] = []

const achievementChecks: Record<string, Achievement['check']> = {
  'first-step': cps => Object.values(cps).some(p => p.missionsCompleted >= 5),
  'clue-hunter': cps => Object.values(cps).reduce((s, p) => s + p.cluesFound, 0) >= 5,
  decoder: cps => Object.values(cps).reduce((s, p) => s + p.missionsCompleted, 0) >= 10,
  master: cps => Object.values(cps).filter(p => p.missionsCompleted >= 5).length >= 7,
  collector: (_cps, count) => count >= 15,
  scholar: cps => Object.values(cps).filter(p => p.missionsCompleted >= 5).length >= 3,
  explorer: cps => Object.values(cps).filter(p => p.missionsCompleted >= 5).length >= 5,
  'xp-king': cps => Object.values(cps).reduce((s, p) => s + p.xpEarned, 0) >= 500,
  speed: cps => {
    let streak = 0
    let max = 0
    CHECKPOINTS.forEach(cp => {
      if ((cps[cp.id]?.missionsCompleted ?? 0) >= 5) {
        streak++
        max = Math.max(max, streak)
      } else streak = 0
    })
    return max >= 2
  },
  perfect: (_cps, count) => count >= 35,
}

const API_URL = (
  import.meta.env.VITE_GAME_API_URL ||
  import.meta.env.VITE_API_URL ||
  ''
).replace(/\/$/, '')

export async function loadAppData(language: 'vi' | 'en' = 'vi') {
  const response = await fetch(`${API_URL}/api/game-data?lang=${language}`)
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  const data = await response.json()

  CHECKPOINTS = data.checkpoints

  // ⭐ NORMALIZE category về VI
  COLLECTIBLES = data.collectibles.map((c: any) => ({
    ...c,
    category: CATEGORY_MAP[c.category] ?? 'Linh vật',
  }))

  ACHIEVEMENTS = data.achievements.map((a: Omit<Achievement, 'check'>) => ({
    ...a,
    check: achievementChecks[a.id] ?? (() => false),
  }))
  HELP_SECTIONS = data.helpSections

  return data
}

export function resetAppData() {
  CHECKPOINTS = []
  COLLECTIBLES = []
  ACHIEVEMENTS = []
  HELP_SECTIONS = []
}
