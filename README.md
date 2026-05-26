# Good Game Shelf

A game tracking web app for players who want a unified home for their entire collection across Steam, PlayStation, Xbox, and Nintendo.

Think Goodreads, but for games. Your shelf is your passport.

---

## The Concept

Every platform is a **passport booklet**. Every game is a **stamp**.

- Completed games are fully inked
- Dropped games are cancelled
- Playing games are in progress
- Backlog games are unissued
- 100% Steam achievements earn a **gold stamp**
- PSN Platinum trophies earn a **platinum stamp**

Your profile is your passport. A living record of every world you have explored.

---

## Features

- **Steam import**: enter your Steam username and we match your entire library to IGDB automatically
- **Cross-platform search**: find and add any game via IGDB
- **Platform carousels**: Steam, PlayStation, Xbox, and Nintendo each get their own booklet
- **Status tracking**: Playing, Completed, Dropped, Want to Play
- **3-star ratings**: simple ratings for completed and dropped games only
- **Reviews**: leave personal notes on games you have finished or abandoned
- **Remove from shelf**: clean up your collection anytime
- **Per-user shelves**: full Row Level Security, every collection is private by default
- **Landing page**: public-facing page for new visitors
- **Google and Discord OAuth**: coming soon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Game Metadata | IGDB API via Twitch |
| Steam Data | Steam Web API |
| Deployment | Railway + Vercel |

---

## Architecture

```
client/                  # React frontend
  src/
    components/
      Auth.jsx           # Email login and signup
      Landing.jsx        # Public landing page
      IGDBGameModal.jsx  # Unified game modal
      SearchBar.jsx      # Debounced IGDB search
      Shelf.jsx          # Platform carousels and stamp grid
      SteamImport.jsx    # Steam to IGDB import flow
    lib/
      supabase.js        # Supabase client
    App.jsx

server/                  # Node.js + Express API
  routes/
    steam.js             # Steam import and username resolution
    igdb.js              # IGDB search and game matching
    shelf.js             # Authenticated shelf data
  index.js
```

---

## Database Schema

```
profiles      user accounts linked to Supabase auth
              includes steam_id for library import

games         IGDB game metadata cache
              cover, genre, release year, steam_appid

shelf_games   user to game relationship
              status, rating, review
              source_platform, source_platform_id
              hours_played
```

---

## How the Steam Import Works

1. User enters their Steam username or profile URL
2. We resolve it to a SteamID64 via the Steam API
3. The SteamID64 is saved to their profile
4. We fetch their full Steam library sorted by playtime
5. Each game is matched to IGDB by name and scored for accuracy
6. Matched games are saved to the games table under their IGDB identity
7. The original steam_appid is preserved so achievement data can be fetched later
8. Games land on the shelf as Want to Play and the user stamps them from there

---

## Roadmap

- [x] Steam library import with IGDB matching
- [x] Steam username resolution (no SteamID64 required)
- [x] IGDB search to add any game across all platforms
- [x] Supabase database with Row Level Security
- [x] User authentication with email and password
- [x] Platform carousels with per-status stats
- [x] Unified game modal with platform selector
- [x] 3-star rating system for completed and dropped games only
- [x] Debounced live search
- [x] Remove games from shelf
- [x] Landing page for new visitors
- [x] Welcoming empty shelf state
- [x] Deploy to Railway and Vercel
- [ ] Steam achievement sync
- [ ] Passport and stamp UI design pass
- [ ] Gold stamps for 100% Steam achievements
- [ ] Platinum stamps for PSN trophies
- [ ] Game detail page with time-to-beat comparison
- [ ] PSN trophy import via psn-api
- [ ] Xbox integration
- [ ] Google and Discord OAuth
- [ ] Shareable passport profile card

---

## License

MIT