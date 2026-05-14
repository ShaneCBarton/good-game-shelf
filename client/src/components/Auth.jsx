import { useState } from 'react'
import supabase from '../lib/supabase'

function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [isLogin, setIsLogin] = useState('')
    const [loading, setLoading] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
    } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
    }
    setLoading(false)
    }

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-white text-3xl font-bold mb-2">🎮 Good Game Shelf</h1>
        <p className="text-gray-400 mb-6">{isLogin ? 'Welcome back' : 'Create your account'}</p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-700 text-white rounded p-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-700 text-white rounded p-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-gray-400 text-sm text-center mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
    )
}

export default Auth