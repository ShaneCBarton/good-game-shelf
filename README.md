# 🎮 Good Game Shelf

A full-stack game tracking web app — like Goodreads, but for games. Pull your Steam library automatically, manually add PlayStation, Xbox, and Nintendo titles, and keep all your games in one place with personal reviews and completion status.

## Features

- 🔗 Steam library sync via Steam API
- 🎮 Rich game metadata from IGDB (cover art, genres, descriptions)
- ✅ Track completion status per game
- ⭐ Leave personal reviews and ratings
- 👤 User authentication via Supabase
- 📚 Unified shelf across all platforms

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Game Metadata | IGDB API |
| Library Sync | Steam Web API |

## Project Structure

```
game-tracker/
├── client/          # React frontend (Vite)
└── server/          # Node.js + Express API
    ├── routes/      # API route handlers
    └── index.js     # Express entry point
```

## Getting Started

### Prerequisites

- Node.js v22+
- A [Supabase](https://supabase.com) project
- [Steam API Key](https://steamcommunity.com/dev/apikey)
- [Twitch Developer credentials](https://dev.twitch.tv/console) (for IGDB)

### Installation

1. Clone the repo
   ```
   git clone https://github.com/yourusername/game-tracker.git
   cd game-tracker
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Create `server/.env` with your credentials
   ```
   STEAM_API_KEY=your_steam_api_key
   STEAM_ID=your_steamid64
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   ```

5. Start the server
   ```
   cd server
   node index.js
   ```

6. Start the client (in a separate terminal)
   ```
   cd client
   npm run dev
   ```

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/api/steam/library` | Fetch Steam game library |

*More routes coming as the project grows.*

## Roadmap

- [x] Express server setup
- [x] Steam library sync
- [ ] IGDB metadata integration
- [ ] Supabase database schema
- [ ] User authentication
- [ ] Game reviews + completion tracking
- [ ] Xbox integration
- [ ] Manual game search + add

## License

MIT
