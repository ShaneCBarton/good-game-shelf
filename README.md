# 🎮 Good Game Shelf

A full-stack game tracking web app — like Goodreads, but for games. Pull your Steam library automatically, search any game via IGDB, and keep your entire collection in one place with personal reviews, ratings, and completion tracking.

The UI is built around a **passport and stamp** concept — each platform is a passport booklet, each game is a stamp. Completed games are fully inked, dropped games are cancelled, playing games are in-progress. Your profile is your passport.

## Features

- 🔗 Steam library sync — your full library imported automatically
- 🔍 IGDB search — find and add any game across all platforms
- 📚 Unified shelf — all your games in one place, organized by platform
- 🎮 Platform carousels — Steam, PlayStation, Xbox, Nintendo each get their own section
- ✅ Status tracking — Playing, Completed, Dropped, Want to Play
- ⭐ Reviews and ratings — leave scores and notes per game
- 👤 User auth — email/password via Supabase (Google + Discord OAuth coming soon)
- 🗃️ Per-user data — full Row Level Security, every shelf is private by default

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Game Metadata | IGDB API (via Twitch) |
| Steam Library | Steam Web API |

## Project Structure

```
game-tracker/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx
│   │   │   ├── GameCard.jsx
│   │   │   ├── GameModal.jsx
│   │   │   ├── IGDBGameModal.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Shelf.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   └── App.jsx
└── server/                  # Node.js + Express API
    ├── routes/
    │   ├── steam.js         # Steam library endpoint
    │   ├── igdb.js          # IGDB search endpoint
    │   └── shelf.js         # User shelf endpoint
    └── index.js
```

## Database Schema

```
profiles       — user accounts (linked to Supabase auth)
games          — game metadata cache (Steam + IGDB)
shelf_games    — user ↔ game link with status, rating, review
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

4. Create `server/.env`
   ```
   STEAM_API_KEY=your_steam_api_key
   STEAM_ID=your_steamid64
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   PORT=3001
   ```

5. Create `client/.env`
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Start the server
   ```
   cd server
   node --env-file=.env index.js
   ```

7. Start the client (separate terminal)
   ```
   cd client
   npm run dev
   ```

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/api/steam/library` | Fetch Steam game library |
| POST | `/api/igdb/search` | Search games via IGDB |
| GET | `/api/shelf` | Fetch authenticated user's shelf |

## Roadmap

- [x] Express server + REST API
- [x] Steam library sync
- [x] IGDB search + metadata
- [x] Supabase database schema with RLS
- [x] User authentication
- [x] Game shelf with status, reviews, ratings
- [x] Platform carousels on shelf view
- [x] Cross-platform game add via IGDB search
- [ ] Steam achievement sync
- [ ] Game detail page
- [ ] PSN trophy data (via psn-api)
- [ ] Xbox integration
- [ ] Google + Discord OAuth
- [ ] Passport + stamp UI design pass
- [ ] Shareable profile/passport card
- [ ] Landing page
- [ ] Deploy to Railway

## License

MIT