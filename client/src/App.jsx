import { useState, useEffect } from 'react'

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

  if (loading) return <p>Loading your library...</p>

  return (
    <div>
      <h1>My Game Shelf</h1>
      <p>{games.length} games found</p>
      <ul>
        {games.map(games => (
          <li key={games.appid}>{games.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App