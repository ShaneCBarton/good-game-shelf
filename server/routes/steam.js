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

export default router