import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

// Service client - bypasses RLS for server-side auth verification
const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Auth client - used to verify the user's token
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

  const token = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data, error } = await supabaseService
    .from('shelf_games')
    .select(`
      *,
      games (
        id,
        title,
        cover_url,
        platform,
        genre,
        release_year,
        steam_appid,
        igdb_id
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  res.json(data)
})

export default router