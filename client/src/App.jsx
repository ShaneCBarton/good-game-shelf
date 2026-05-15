import { useState, useEffect } from 'react'
import GameCard from './components/GameCard'
import GameModal from './components/GameModal'
import IGDBGameModal from './components/IGDBGameModal'
import SearchBar from './components/SearchBar'
import Shelf from './components/Shelf'
import Auth from './components/Auth'
import supabase from './lib/supabase'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedIGDBGame, setSelectedIGDBGame] = useState(null)
  const [selectedShelfItem, setSelectedShelfItem] = useState(null)
  const [view, setView] = useState('shelf')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetch('http://localhost:3001/api/steam/library')
      .then(res => res.json())
      .then(data => {
        setGames(data.games || [])
        setLoading(false)
      })
  }, [session])

  if (!session) return <Auth />

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-white text-4xl font-bold">🎮 Good Game Shelf</h1>
          <p className="text-gray-400 mt-1">
            {session.user.email}
          </p>
        </div>
        <SearchBar onSelectGame={(game) => setSelectedIGDBGame(game)} />
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-gray-400 hover:text-white text-sm transition-colors whitespace-nowrap"
        >
          Sign Out
        </button>
      </div>

      {/* View toggle */}
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
          onClick={() => setView('library')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'library'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Steam Library
        </button>
      </div>

      {/* Views */}
      {view === 'shelf' && (
        <Shelf
          session={session}
          onEditGame={(item) => setSelectedShelfItem(item)}
        />
      )}

      {view === 'library' && (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-white text-xl">Loading your Steam library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {games.map(game => (
              <GameCard
                key={game.appid}
                game={game}
                onClick={() => setSelectedGame(game)}
              />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {selectedGame && (
        <GameModal
          game={selectedGame}
          session={session}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {selectedIGDBGame && (
        <IGDBGameModal
          game={selectedIGDBGame}
          session={session}
          onClose={() => setSelectedIGDBGame(null)}
        />
      )}

      {selectedShelfItem && (
        <IGDBGameModal
          game={{
            id: selectedShelfItem.games.igdb_id,
            name: selectedShelfItem.games.title,
            cover: { url: selectedShelfItem.games.cover_url },
            platforms: selectedShelfItem.games.platform ?
              [{ name: selectedShelfItem.games.platform }] : [],
          }}
          session={session}
          onClose={() => setSelectedShelfItem(null)}
        />
      )}
    </div>
  )
}

export default App