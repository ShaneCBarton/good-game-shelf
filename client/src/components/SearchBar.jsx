import { useState, useEffect, useRef } from 'react'

function SearchBar({ onSelectGame }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    // Debounce — wait 400ms after user stops typing before searching
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:3001/api/igdb/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })
        const data = await response.json()
        setResults(Array.isArray(data) ? data : [])
      } catch (err) {
        setResults([])
      }
      setLoading(false)
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSelect = (game) => {
    onSelectGame(game)
    setResults([])
    setQuery('')
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any game..."
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-11 left-0 right-0 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-700">
          {results.map(game => (
            <div
              key={game.id}
              onClick={() => handleSelect(game)}
              className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors"
            >
              {game.cover?.url && (
                <img
                  src={game.cover.url.replace('t_thumb', 't_cover_small')}
                  alt={game.name}
                  className="w-10 h-14 object-cover rounded flex-shrink-0"
                />
              )}
              <div>
                <p className="text-white font-medium text-sm">{game.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">
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