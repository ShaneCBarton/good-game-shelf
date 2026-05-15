import express from 'express'
import axios from 'axios'

const router = express.Router()

let twitchToken = null
let tokenExpiry = null

async function getTwitchToken() {
    
    if (twitchToken && tokenExpiry && Date.now() < tokenExpiry) {
        return twitchToken
    }

    const response = await axios.post(
        `https://id.twitch.tv/oauth2/token`,
        null,
        {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        }
    )

    twitchToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000
    return twitchToken
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

    res.json(response.data)
  } catch (error) {
    console.error(error?.response?.data || error.message)
    res.status(500).json({ error: 'Failed to search IGDB' })
  }
})

export default router