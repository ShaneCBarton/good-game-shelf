import { useState, useEffect } from 'react'
import GameCard from './components/GameCard'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/steam/library')
      .then(res => res.json())
      .then(data => {
        setGames(data.games || [])
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading your library...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-white text-4xl font-bold mb-2">My Game Shelf</h1>
      <p className="text-gray-400 mb-8">{games.length} games in your library</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map(game => (
          <GameCard key={game.appid} game={game} />
        ))}
      </div>
    </div>
  )
}

export default App