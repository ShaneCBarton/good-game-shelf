import { useState } from 'react'

function SearchBar({ onSelectGame }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)

    const response = await fetch('http://localhost:3001/api/igdb/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })

    const data = await response.json()
    setResults(data)
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search any game to add to your shelf..."
          className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="absolute top-12 left-0 right-0 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map(game => (
            <div
              key={game.id}
              onClick={() => {
                onSelectGame(game)
                setResults([])
                setQuery('')
              }}
              className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors"
            >
              {game.cover?.url && (
                <img
                  src={game.cover.url.replace('t_thumb', 't_cover_small')}
                  alt={game.name}
                  className="w-10 h-14 object-cover rounded"
                />
              )}
              <div>
                <p className="text-white font-medium">{game.name}</p>
                <p className="text-gray-400 text-xs">
                  {game.release_dates?.[0]?.y} · {game.platforms?.map(p => p.name).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar