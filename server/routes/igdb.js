import express from 'express'
import axios from 'axios'

const router = express.Router()

let twitchToken = null
let tokenExpiry = null

async function getTwitchToken() {
  if (twitchToken && tokenExpiry && Date.now() < tokenExpiry) {
    return twitchToken
  }

  try {
    const params = new URLSearchParams()
    params.append('client_id', process.env.TWITCH_CLIENT_ID)
    params.append('client_secret', process.env.TWITCH_CLIENT_SECRET)
    params.append('grant_type', 'client_credentials')

    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    twitchToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000
    return twitchToken
  } catch (err) {
    console.error('Twitch token error:', err?.response?.data || err.message)
    throw new Error('Failed to get Twitch token')
  }
}

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body
    const token = await getTwitchToken()

    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      `search "${query}";
       fields name, cover.url, genres.name, release_dates.y,
              platforms.name, summary, hypes, rating;
       limit 10;`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    )

    console.log('IGDB response:', JSON.stringify(response.data, null, 2))
    res.json(response.data)
  } catch (error) {
    console.error(error?.response?.data || error.message)
    res.status(500).json({ error: 'Failed to search IGDB' })
  }
})

router.post('/match', async (req, res) => {
  try {
    const { name, steamAppId } = req.body
    const token = await getTwitchToken()

    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      `search "${name}";
       fields name, cover.url, genres.name, release_dates.y,
              platforms.name, summary, rating;
       limit 5;`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    )

    const results = response.data
    if (!results || results.length === 0) {
      return res.json({ matched: false, steamAppId, name })
    }

    // Score each result — exact name match wins, otherwise take first
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '')
    const normalizedName = normalize(name)

    const scored = results.map(game => ({
      ...game,
      score: normalize(game.name) === normalizedName ? 100 : 0
    }))

    scored.sort((a, b) => b.score - a.score)
    const best = scored[0]

    res.json({
      matched: true,
      steamAppId,
      originalName: name,
      igdbGame: {
        id: best.id,
        name: best.name,
        cover_url: best.cover?.url?.replace('t_thumb', 't_cover_big') || null,
        genre: best.genres?.map(g => g.name).join(', ') || null,
        release_year: best.release_dates?.[0]?.y || null,
        summary: best.summary || null,
        rating: best.rating || null
      }
    })
  } catch (error) {
    console.error(error?.response?.data || error.message)
    res.status(500).json({ error: 'Failed to match game' })
  }
})

export default router