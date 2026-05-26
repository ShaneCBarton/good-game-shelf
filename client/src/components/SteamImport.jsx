import { useState } from 'react'
import supabase from '../lib/supabase'

function SteamImport({ session, onClose, onImportComplete }) {
  const [step, setStep] = useState('connect') // connect, loading, preview, importing, done
  const [steamInput, setSteamInput] = useState('')
  const [steamId, setSteamId] = useState(null)
  const [games, setGames] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [failed, setFailed] = useState([])
  const [error, setError] = useState(null)
  const [resolving, setResolving] = useState(false)

  const handleResolve = async () => {
    if (!steamInput.trim()) return
    setResolving(true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:3001/api/steam/resolve/${encodeURIComponent(steamInput.trim())}`
      )
      const data = await response.json()

      if (!response.ok || data.error) {
        setError('Steam profile not found. Check your username or URL and try again.')
        setResolving(false)
        return
      }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ steam_id: data.steamId })
      .eq('id', session.user.id)

    console.log('Steam ID resolved:', data.steamId)
    console.log('User ID:', session.user.id)
    console.log('Update error:', JSON.stringify(updateError))

    setSteamId(data.steamId)
    await fetchLibrary(data.steamId)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setResolving(false)
  }

  const fetchLibrary = async (resolvedSteamId) => {
    setStep('loading')
    const { data: { session: currentSession } } = await supabase.auth.getSession()

    const response = await fetch('http://localhost:3001/api/steam/import', {
      headers: {
        Authorization: `Bearer ${currentSession.access_token}`,
        'X-Steam-Id': resolvedSteamId  // ← pass it directly
      }
    })

    const data = await response.json()
    setGames(data.games || [])
    setSelected(new Set(data.games.map(g => g.steamAppId)))
    setStep('preview')
  }

  const toggleGame = (steamAppId) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(steamAppId) ? next.delete(steamAppId) : next.add(steamAppId)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === games.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(games.map(g => g.steamAppId)))
    }
  }

  const runImport = async () => {
    const toImport = games.filter(g => selected.has(g.steamAppId))
    setProgress({ current: 0, total: toImport.length })
    setStep('importing')
    setFailed([])

    const { data: { session: currentSession } } = await supabase.auth.getSession()

    for (let i = 0; i < toImport.length; i++) {
      const game = toImport[i]
      setProgress({ current: i + 1, total: toImport.length })

      try {
        const matchRes = await fetch('http://localhost:3001/api/igdb/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: game.name, steamAppId: game.steamAppId })
        })
        const match = await matchRes.json()

        if (!match.matched) {
          setFailed(prev => [...prev, game.name])
          continue
        }

        const ig = match.igdbGame

        const { data: gameRow, error: gameError } = await supabase
          .from('games')
          .upsert({
            igdb_id: ig.id,
            steam_appid: game.steamAppId,
            title: ig.name,
            cover_url: ig.cover_url,
            genre: ig.genre,
            release_year: ig.release_year,
            platform: 'steam'
          }, { onConflict: 'igdb_id' })
          .select('id')
          .single()

        if (gameError) {
          setFailed(prev => [...prev, game.name])
          continue
        }

        await supabase
          .from('shelf_games')
          .upsert({
            user_id: currentSession.user.id,
            game_id: gameRow.id,
            status: 'want_to_play',
            source_platform: 'steam',
            source_platform_id: String(game.steamAppId),
            hours_played: Math.round(game.playtimeMinutes / 60)
          }, { onConflict: 'user_id,game_id' })

      } catch (err) {
        setFailed(prev => [...prev, game.name])
      }

      await new Promise(r => setTimeout(r, 250))
    }

    setStep('done')
    onImportComplete()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={step === 'connect' ? onClose : undefined}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold">Import Steam Library</h2>
          <p className="text-gray-400 text-sm mt-1">
            Connect your Steam account to import your library
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {step === 'connect' && (
            <div>
              <p className="text-gray-400 text-sm mb-6">
                Enter your Steam username or profile URL. Your profile must be set to public in Steam privacy settings.
              </p>
              <label className="text-gray-400 text-sm mb-2 block">Steam username or profile URL</label>
              <input
                type="text"
                value={steamInput}
                onChange={e => setSteamInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResolve()}
                placeholder="e.g. shanegaming or steamcommunity.com/id/shanegaming"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <button
                onClick={handleResolve}
                disabled={resolving || !steamInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {resolving ? 'Looking up Steam profile...' : 'Connect Steam'}
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-400 text-sm py-3 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 'loading' && (
            <div className="text-center py-8">
              <p className="text-gray-400">Fetching your Steam library...</p>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-400 text-sm">{selected.size} of {games.length} selected</p>
                <button
                  onClick={toggleAll}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  {selected.size === games.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="space-y-2">
                {games.map(game => (
                  <div
                    key={game.steamAppId}
                    onClick={() => toggleGame(game.steamAppId)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selected.has(game.steamAppId)
                        ? 'bg-blue-900 bg-opacity-30 border border-blue-700'
                        : 'bg-gray-800 border border-transparent'
                    }`}
                  >
                    {game.iconUrl && (
                      <img src={game.iconUrl} alt="" className="w-8 h-8 rounded" />
                    )}
                    <span className="text-white text-sm flex-1">{game.name}</span>
                    <span className="text-gray-500 text-xs">
                      {Math.round(game.playtimeMinutes / 60)}h
                    </span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      selected.has(game.steamAppId)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-600'
                    }`}>
                      {selected.has(game.steamAppId) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Matching games to IGDB...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              {failed.length > 0 && (
                <p className="text-yellow-400 text-xs">
                  {failed.length} games couldn't be matched yet
                </p>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-8">
              <p className="text-green-400 text-xl mb-2">✅ Import complete!</p>
              <p className="text-gray-400 text-sm mb-2">
                {progress.total - failed.length} games added to your shelf
              </p>
              {failed.length > 0 && (
                <p className="text-yellow-400 text-sm mb-6">
                  {failed.length} games couldn't be matched to IGDB
                </p>
              )}
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Go to my shelf
              </button>
            </div>
          )}
        </div>

        {step === 'preview' && (
          <div className="p-6 border-t border-gray-700">
            <button
              onClick={runImport}
              disabled={selected.size === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Import {selected.size} games
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SteamImport