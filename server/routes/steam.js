import express from 'express'
import axios from 'axios'

const router = express.Router()

const STEAM_API_KEY = process.env.STEAM_API_KEY
const STEAM_ID = process.env.STEAM_ID

router.get('/library', async (requestAnimationFrame, res) => {
    try {
        const response = await axios.get(
            'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
                params: {
                    key: STEAM_API_KEY,
                    steamid: STEAM_ID,
                    include_appinfo: true, 
                    include_played_free_games: true,
                    format: 'json'
                }
            }
        )
        res.json(response.data.response)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch Steam library' })
    }
})

router.get('/import', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
      {
        params: {
          key: STEAM_API_KEY,
          steamid: STEAM_ID,
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
    res.status(500).json({ error: 'Failed to fetch Steam library for import' })
  }
})

export default router