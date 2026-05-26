import { useState, useEffect } from 'react'
import IGDBGameModal from './components/IGDBGameModal'
import SearchBar from './components/SearchBar'
import Shelf from './components/Shelf'
import Auth from './components/Auth'
import SteamImport from './components/SteamImport'
import supabase from './lib/supabase'
import Landing from './components/Landing'

function App() {
  const [session, setSession] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [view, setView] = useState('shelf')
  const [showSteamImport, setShowSteamImport] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [shelfKey, setShelfKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    if (showAuth) return <Auth />
    return <Landing onSignIn={() => setShowAuth(true)} />
  }

  const handleSelectShelfItem = (item) => {
    setSelectedGame({
      id: item.games.igdb_id,
      name: item.games.title,
      cover: { url: item.games.cover_url },
      platforms: item.games.platform ? [{ name: item.games.platform }] : [],
      hoursPlayed: item.hours_played || 0
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-white text-4xl font-bold">🎮 Good Game Shelf</h1>
          <p className="text-gray-400 mt-1">{session.user.email}</p>
        </div>
        <SearchBar onSelectGame={(game) => setSelectedGame(game)} />
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-gray-400 hover:text-white text-sm transition-colors whitespace-nowrap"
        >
          Sign Out
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setView('shelf')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'shelf'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          My Shelf
        </button>
        <button
          onClick={() => setShowSteamImport(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
        >
          Import Steam
        </button>
      </div>

      {view === 'shelf' && (
        <Shelf
          key={shelfKey}
          session={session}
          onEditGame={handleSelectShelfItem}
        />
      )}

      {selectedGame && (
        <IGDBGameModal
          game={selectedGame}
          session={session}
          hoursPlayed={selectedGame.hoursPlayed}
          onClose={() => {
            setSelectedGame(null)
            setShelfKey(prev => prev + 1)
          }}
        />
      )}

      {showSteamImport && (
        <SteamImport
          session={session}
          onClose={() => setShowSteamImport(false)}
          onImportComplete={() => {
            setShowSteamImport(false)
            setView('shelf')
          }}
        />
      )}
    </div>
  )
}

export default App