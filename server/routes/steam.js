import express from 'express'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

const STEAM_API_KEY = process.env.STEAM_API_KEY

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

router.get('/import', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

    // Use Steam ID from header if provided, otherwise look up from profile
    const steamId = req.headers['x-steam-id'] || null

    let resolvedSteamId = steamId

    if (!resolvedSteamId) {
      const { data: profile } = await supabaseService
        .from('profiles')
        .select('steam_id')
        .eq('id', user.id)
        .single()

      resolvedSteamId = profile?.steam_id
    }

    if (!resolvedSteamId) {
      return res.status(400).json({ error: 'No Steam ID connected to this account' })
    }

    const response = await axios.get(
      'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
      {
        params: {
          key: STEAM_API_KEY,
          steamid: resolvedSteamId,
          include_appinfo: true,
          include_played_free_games: true,
          format: 'json'
        }
      }
    )

    const games = response.data.response.games || []
    const sorted = games
      .filter(g => g.name)
      .sort((a, b) => b.playtime_forever - a.playtime_forever)

    res.json({
      total: sorted.length,
      games: sorted.map(g => ({
        steamAppId: g.appid,
        name: g.name,
        playtimeMinutes: g.playtime_forever,
        iconUrl: g.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
          : null
      }))
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch Steam library' })
  }
})

router.get('/resolve/:username', async (req, res) => {
  try {
    const { username } = req.params

    const cleaned = username
      .replace('https://steamcommunity.com/id/', '')
      .replace('https://steamcommunity.com/profiles/', '')
      .replace(/\/$/, '')
      .trim()

    if (/^\d{17}$/.test(cleaned)) {
      return res.json({ steamId: cleaned })
    }

    const response = await axios.get(
      'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/',
      {
        params: {
          key: STEAM_API_KEY,
          vanityurl: cleaned
        }
      }
    )

    const { success, steamid } = response.data.response

    if (success === 1) {
      res.json({ steamId: steamid })
    } else {
      res.status(404).json({ error: 'Steam user not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to resolve Steam username' })
  }
})

export default router