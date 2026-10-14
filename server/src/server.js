import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import authRouter from './auth.js'   // ⭐ THÊM

dotenv.config()

const app = express()


app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (origin.includes('localhost')) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'mat_ma_thang_long',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  ssl: process.env.MYSQL_HOST?.includes('aivencloud.com')
    ? { rejectUnauthorized: false }
    : undefined,
})


app.use('/api/auth', authRouter)

function pick(row, vi, en, lang) {
  if (lang === 'en' && row[en]) return row[en]
  return row[vi]
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: true })
  } catch (error) {
    res.status(500).json({ ok: false, database: false, message: error.message })
  }
})

app.get('/api/game-data', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en' : 'vi'

  try {
    const [checkpointRows] = await pool.query('SELECT * FROM checkpoints ORDER BY id')
    const [missionRows] = await pool.query('SELECT * FROM missions ORDER BY checkpoint_id, id')
    const [optionRows] = await pool.query('SELECT * FROM mission_options ORDER BY checkpoint_id, mission_id, option_id')
    const [collectibleRows] = await pool.query('SELECT * FROM collectibles ORDER BY id')
    const [achievementRows] = await pool.query('SELECT * FROM achievements')
    const [helpRows] = await pool.query('SELECT * FROM help_sections')
    const [positionRows] = await pool.query('SELECT * FROM site_positions ORDER BY checkpoint_id')

    const checkpoints = checkpointRows.map(cp => ({
      id: cp.id,
      name: pick(cp, 'name_vi', 'name_en', lang),
      shortDescription: pick(cp, 'short_description_vi', 'short_description_en', lang),
      stampName: pick(cp, 'stamp_name_vi', 'stamp_name_en', lang),
      stampChar: cp.stamp_char,
      missions: missionRows
        .filter(m => m.checkpoint_id === cp.id)
        .map(m => ({
          id: m.id,
          observationTag: pick(m, 'observation_tag_vi', 'observation_tag_en', lang),
          vanDongDialogue: pick(m, 'van_dong_dialogue_vi', 'van_dong_dialogue_en', lang),
          observationInstruction: pick(m, 'observation_instruction_vi', 'observation_instruction_en', lang),
          putPhoneDown: pick(m, 'put_phone_down_vi', 'put_phone_down_en', lang),
          question: pick(m, 'question_vi', 'question_en', lang),
          options: optionRows
            .filter(o => o.checkpoint_id === cp.id && o.mission_id === m.id)
            .map(o => ({
              id: o.option_id,
              emoji: o.emoji,
              label: pick(o, 'label_vi', 'label_en', lang),
              sub: pick(o, 'sub_vi', 'sub_en', lang),
              correct: Boolean(o.is_correct),
            })),
          hint: pick(m, 'hint_vi', 'hint_en', lang),
          collectibleEmoji: m.collectible_emoji,
          collectibleName: pick(m, 'collectible_name_vi', 'collectible_name_en', lang),
          collectibleRarity: m.collectible_rarity,
          collectibleFlavour: pick(m, 'collectible_flavour_vi', 'collectible_flavour_en', lang),
          xp: m.xp,
          clueUnlocked: pick(m, 'clue_unlocked_vi', 'clue_unlocked_en', lang),
        })),
    }))

    const collectibles = collectibleRows.map(c => ({
      id: c.id,
      name: pick(c, 'name_vi', 'name_en', lang),
      emoji: c.emoji,
      category: pick(c, 'category_vi', 'category_en', lang),
      rarity: c.rarity,
      foundAt: pick(c, 'found_at_vi', 'found_at_en', lang),
      missionRef: pick(c, 'mission_ref_vi', 'mission_ref_en', lang),
      description: pick(c, 'description_vi', 'description_en', lang),
      collected: Boolean(c.default_collected),
    }))

    const achievements = achievementRows.map(a => ({
      id: a.id,
      emoji: a.emoji,
      title: pick(a, 'title_vi', 'title_en', lang),
      desc: pick(a, 'description_vi', 'description_en', lang),
      bgFrom: a.bg_from,
      bgTo: a.bg_to,
      border: a.border_color,
    }))

    const helpSections = helpRows.map(h => ({
      id: h.id,
      icon: h.icon,
      title: pick(h, 'title_vi', 'title_en', lang),
      content: pick(h, 'content_vi', 'content_en', lang),
    }))

    res.json({ checkpoints, collectibles, achievements, helpSections, sitePositions: positionRows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT || 3002)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mật Mã Thăng Long API running at http://0.0.0.0:${PORT}`)
  })
}

export default app
