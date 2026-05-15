import express from 'express'
import cors from 'cors'
import steamRouter from './routes/steam.js'
import igdbRouter from './routes/igdb.js'
import shelfRouter from './routes/shelf.js'

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/steam', steamRouter)
app.use('/api/igdb', igdbRouter)
app.use('/api/shelf', shelfRouter)

//test route
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})