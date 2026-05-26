import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const PLATFORMS = ['steam', 'playstation', 'xbox', 'nintendo']

const normalizePlatform = (platforms) => {
  if (!platforms || platforms.length === 0) return 'steam'
  const names = platforms.map(p => p.name.toLowerCase()).join(' ')
  if (names.includes('playstation')) return 'playstation'
  if (names.includes('xbox')) return 'xbox'
  if (names.includes('nintendo') || names.includes('switch')) return 'nintendo'
  return 'steam'
}

function IGDBGameModal({ game, onClose, session, hoursPlayed }) {
  const [status, setStatus] = useState('want_to_play')
  const [rating, setRating] = useState(null)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isOnShelf, setIsOnShelf] = useState(false)
  const [platform, setPlatform] = useState(
    game.platforms?.[0]?.name ? normalizePlatform(game.platforms) : 'steam')

  const coverUrl = game.cover?.url
    ? game.cover.url.replace('t_thumb', 't_cover_big')
    : null

  const releaseYear = game.release_dates?.[0]?.y
  const platforms = game.platforms?.map(p => p.name).join(', ')
  const genres = game.genres?.map(g => g.name).join(', ')

  useEffect(() => {
    const fetchExisting = async () => {
      const { data: gameRow } = await supabase
        .from('games')
        .select('id')
        .eq('igdb_id', game.id)
        .maybeSingle()

      if (!gameRow) return

      const { data: shelfRow } = await supabase
        .from('shelf_games')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('game_id', gameRow.id)
        .maybeSingle()

      if (shelfRow) {
        setStatus(shelfRow.status)
        setRating(shelfRow.rating && shelfRow.rating <= 3 ? shelfRow.rating : null)
        setReview(shelfRow.review || '')
        setIsOnShelf(true)
      }
    }

    fetchExisting()
  }, [game.id, session.user.id])

  const handleSave = async () => {
    setLoading(true)

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .upsert({
        igdb_id: game.id,
        title: game.name,
        cover_url: coverUrl,
        genre: genres,
        release_year: releaseYear,
        platform: platform  // ← use selected platform
      }, { onConflict: 'igdb_id' })
      .select('id')
      .single()

      if (gameError) {
        console.error('Game upsert error:', gameError)
        setLoading(false)
        return
      }

      const { error: shelfError } = await supabase
        .from('shelf_games')
        .upsert({
          user_id: session.user.id,
          game_id: gameData.id,
          status,
          rating,
          review
        }, { onConflict: 'user_id,game_id' })

        if (shelfError) {
          console.error('Shelf upsert error:', shelfError)
        } else {
          onClose()
        }
      setLoading(false)
    }

  const handleDelete = async () => {
    setLoading(true)

    const { data: gameRow } = await supabase
      .from('games')
      .select('id')
      .eq('igdb_id', game.id)
      .maybeSingle()

    if (!gameRow) {
      setLoading(false)
      return
    }

    await supabase
      .from('shelf_games')
      .delete()
      .eq('user_id', session.user.id)
      .eq('game_id', gameRow.id)

      onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl max-w-lg w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex gap-4 mb-6">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={game.name}
              className="w-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs">No Cover</span>
            </div>
          )}
          <div>
            <h2 className="text-white text-xl font-bold">{game.name}</h2>
            {releaseYear && <p className="text-gray-400 text-sm mt-1">{releaseYear}</p>}
            {platforms && <p className="text-gray-400 text-xs mt-1">{platforms}</p>}
            {genres && <p className="text-blue-400 text-xs mt-1">{genres}</p>}
            {isOnShelf && (
              <span className="text-green-400 text-xs mt-1 block">✅ Already on your shelf</span>
            )}
            {hoursPlayed > 0 && (
              <p className="text-gray-400 text-xs mt-1">{hoursPlayed} hrs on Steam</p>
            )}
          </div>
        </div>

        {game.summary && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">{game.summary}</p>
        )}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Platform</label>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`py-2 rounded text-sm font-medium capitalize transition-colors ${
                  platform === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <label className="text-gray-400 text-sm mb-2 block">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {['playing', 'completed', 'dropped', 'want_to_play'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`py-2 rounded text-sm font-medium transition-colors ${
                  status === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {(status === 'completed' || status === 'dropped') && (
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Rating</label>
            <div className="flex gap-3">
              {[1, 2, 3].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(rating === star ? null : star)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {rating >= star ? '⭐' : '☆'}
                </button>
              ))}
              {rating && (
                <span className="text-gray-500 text-sm self-center ml-2">
                  {rating === 1 ? 'Not for me' : rating === 2 ? 'Pretty good' : 'Loved it'}
                </span>
              )}
            </div>
          </div>
        )}

        {(status === 'completed' || status === 'dropped') && (
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Review</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="What did you think?"
              rows={3}
              className="w-full bg-gray-700 text-white rounded p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isOnShelf ? 'Update Shelf' : 'Add to Shelf'}
          </button>
            {isOnShelf && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-red-900 hover:bg-red-800 text-red-400 hover:text-red-300 text-sm py-2 rounded transition-colors disabled:opacity-50"
              >
                Remove from shelf
              </button>
            )}
        </div>
      </div>
    </div>
  )
}

export default IGDBGameModal