import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const STATUS_LABELS = {
  playing: '🎮 Playing',
  completed: '✅ Completed',
  dropped: '🗑️ Dropped',
  want_to_play: '📋 Want to Play'
}

const PLATFORM_LABELS = {
  steam: { label: 'Steam', color: 'from-blue-900 to-blue-700' },
  playstation: { label: 'PlayStation', color: 'from-blue-900 to-indigo-700' },
  xbox: { label: 'Xbox', color: 'from-green-900 to-green-700' },
  nintendo: { label: 'Nintendo', color: 'from-red-900 to-red-700' },
  pc: { label: 'PC', color: 'from-gray-800 to-gray-600' },
}

function ShelfCard({ item, onClick }) {
  const game = item.games
  const coverUrl = game.cover_url

  return (
    <div
      onClick={onClick}
      className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer group flex-shrink-0 w-36"
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={game.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
      ) : (
        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 text-xs text-center px-2">{game.title}</span>
        </div>
      )}

      {/* Status badge */}
      <div className="absolute top-2 left-2">
        <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
          {STATUS_LABELS[item.status]}
        </span>
      </div>

      {/* Rating badge */}
      {item.rating && (
        <div className="absolute top-2 right-2">
          <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
            {item.rating}/10
          </span>
        </div>
      )}

      <div className="p-2">
        <p className="text-white text-xs font-medium truncate">{game.title}</p>
      </div>
    </div>
  )
}

function PlatformCarousel({ platform, items, onSelectItem }) {
  const config = PLATFORM_LABELS[platform] || { label: platform, color: 'from-gray-800 to-gray-600' }

  const stats = {
    completed: items.filter(i => i.status === 'completed').length,
    playing: items.filter(i => i.status === 'playing').length,
    dropped: items.filter(i => i.status === 'dropped').length,
    want_to_play: items.filter(i => i.status === 'want_to_play').length,
  }

  return (
    <div className="mb-10">
      {/* Platform header */}
      <div className={`bg-gradient-to-r ${config.color} rounded-xl p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-white text-2xl font-bold capitalize">{config.label}</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-green-300">✅ {stats.completed}</span>
            <span className="text-blue-300">🎮 {stats.playing}</span>
            <span className="text-red-300">🗑️ {stats.dropped}</span>
            <span className="text-gray-300">📋 {stats.want_to_play}</span>
          </div>
        </div>
        <p className="text-gray-300 text-sm mt-1">{items.length} games on shelf</p>
      </div>

      {/* Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {items.map(item => (
          <ShelfCard
            key={item.id}
            item={item}
            onClick={() => onSelectItem(item)}
          />
        ))}
      </div>
    </div>
  )
}

function Shelf({ session, onEditGame }) {
  const [shelfItems, setShelfItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    const fetchShelf = async () => {
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession()

            const response = await fetch('http://localhost:3001/api/shelf', {
            headers: {
                Authorization: `Bearer ${currentSession.access_token}`
            }
            })

            const data = await response.json()
            setShelfItems(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Shelf fetch error:', err)
            setShelfItems([])
        } finally {
            setLoading(false)
        }
    }   

    fetchShelf()
  }, [session])

  // Group by platform
    const groupedByPlatform = Array.isArray(shelfItems) ? shelfItems.reduce((acc, item) => {
    const platform = item.games?.platform || 'unknown'
    if (!acc[platform]) acc[platform] = []
    acc[platform].push(item)
    return acc
    }, {}) : {}

    const filteredItems = activeFilter === 'all'
    ? (Array.isArray(shelfItems) ? shelfItems : [])
    : (Array.isArray(shelfItems) ? shelfItems : []).filter(i => i.status === activeFilter)

  const filteredByPlatform = filteredItems.reduce((acc, item) => {
    const platform = item.games?.platform || 'unknown'
    if (!acc[platform]) acc[platform] = []
    acc[platform].push(item)
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading your shelf...</p>
    </div>
  )

  if (shelfItems.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-gray-400 text-xl">Your shelf is empty</p>
      <p className="text-gray-500 text-sm">Search for a game above to get started</p>
    </div>
  )

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveFilter(activeFilter === key ? 'all' : key)}
            className={`p-4 rounded-xl text-center transition-colors ${
              activeFilter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <p className="text-2xl font-bold text-white">
              {shelfItems.filter(i => i.status === key).length}
            </p>
            <p className="text-xs mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Platform carousels */}
      {Object.entries(filteredByPlatform).map(([platform, items]) => (
        <PlatformCarousel
          key={platform}
          platform={platform}
          items={items}
          onSelectItem={onEditGame}
        />
      ))}
    </div>
  )
}

export default Shelf