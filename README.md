# 🎮 Good Game Shelf

A game tracking web app built for players who want a beautiful, unified home for their entire collection — across Steam, PlayStation, Xbox, and Nintendo.

Think Goodreads, but for games. Your shelf is your passport.

---

## The Concept

Every platform is a **passport booklet**. Every game is a **stamp**.

- Completed games are fully inked
- Dropped games are cancelled
- Playing games are in-progress
- Backlog games are unissued
- 100% Steam achievements earn a **gold stamp**
- PSN Platinum trophies earn a **platinum stamp**

Your profile is your passport — a living record of every world you've explored.

---

## Features

- **Steam import** — match your entire Steam library to IGDB automatically
- **Cross-platform search** — find and add any game via IGDB
- **Platform carousels** — Steam, PlayStation, Xbox, and Nintendo each get their own booklet
- **Status tracking** — Playing, Completed, Dropped, Want to Play
- **3-star ratings** — simple, honest ratings for completed and dropped games only
- **Reviews** — leave personal notes on games you've finished or abandoned
- **Per-user shelves** — full Row Level Security, every collection is private by default
- **Google + Discord OAuth** — coming soon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Game Metadata | IGDB API (via Twitch) |
| Steam Data | Steam Web API |
| Deployment | Railway (coming soon) |

---

## Architecture

```
client/                  # React frontend
  src/
    components/
      Auth.jsx           # Email + OAuth login
      IGDBGameModal.jsx  # Unified game modal
      SearchBar.jsx      # Debounced IGDB search
      Shelf.jsx          # Platform carousels + stamp grid
      SteamImport.jsx    # Bulk Steam → IGDB import flow
    lib/
      supabase.js        # Supabase client
    App.jsx

server/                  # Node.js + Express API
  routes/
    steam.js             # Steam library + import endpoints
    igdb.js              # IGDB search + game matching
    shelf.js             # Authenticated shelf data
  index.js
```

---

## Database Schema

```
profiles      — user accounts, linked to Supabase auth
games         — IGDB game metadata cache (cover, genre, release year, time to beat)
shelf_games   — user ↔ game relationship
                  status, rating, review,
                  source_platform, source_platform_id,
                  hours_played, achievement data
```

---

## How the Steam Import Works

1. Fetch the user's full Steam library via the Steam Web API
2. For each game, POST to `/api/igdb/match` — searches IGDB by name and scores results for best match
3. Matched games are upserted into the `games` table under their IGDB identity
4. The original `steam_appid` is preserved as `source_platform_id` so achievement data can still be fetched later
5. Games land on the shelf as **Want to Play** — the user stamps them from there

---

## Roadmap

- [x] Steam library import with IGDB matching
- [x] IGDB search — add any game across all platforms
- [x] Supabase database with Row Level Security
- [x] User authentication
- [x] Platform carousels with status stats
- [x] Unified game modal with platform selector
- [x] 3-star rating system (completed + dropped only)
- [x] Debounced search with live results
- [ ] Steam achievement sync
- [ ] Passport + stamp UI design pass
- [ ] Gold stamps for 100% achievements
- [ ] Platinum stamps for PSN trophies
- [ ] Game detail page with time-to-beat comparison
- [ ] PSN trophy import via psn-api
- [ ] Xbox integration
- [ ] Google + Discord OAuth
- [ ] Shareable passport profile card
- [ ] Landing page
- [ ] Deploy to Railway

---

## License

MIT