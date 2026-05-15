import { useState, useEffect } from 'react'
import GameCard from './components/GameCard'
import GameModal from './components/GameModal'
import Auth from './components/Auth'
import supabase from './lib/supabase'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)

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

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading your library...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-white text-4xl font-bold">My Game Shelf</h1>
          <p className="text-gray-400 mt-1">{games.length} games in your library</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map(game => (
          <GameCard
            key={game.appid}
            game={game}
            onClick={() => setSelectedGame(game)}
          />
        ))}
      </div>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          session={session}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  )
}

export default App