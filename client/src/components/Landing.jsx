import supabase from '../lib/supabase'

function Landing({ onSignIn }) {
  return (
    <div className="min-h-screen bg-gray-900">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-white text-xl font-bold">🎮 Good Game Shelf</h1>
        </div>
        <button
          onClick={onSignIn}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-32 text-center">
        <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-6">
          Your games. Your passport.
        </p>
        <h2 className="text-white text-6xl font-bold leading-tight mb-6">
          Every game you've played,<br />
          <span className="text-blue-400">in one place.</span>
        </h2>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
          Good Game Shelf is a personal game tracker built for collectors. 
          Import your Steam library, track PlayStation and Xbox games, 
          and build your passport — one stamp at a time.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Start your shelf →
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-white text-xl font-bold mb-3">Your Passport</h3>
            <p className="text-gray-400">
              Each platform is a passport booklet. Each game is a stamp. 
              Completed games are inked, dropped games are cancelled, 
              backlog games are unissued.
            </p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-white text-xl font-bold mb-3">Steam Import</h3>
            <p className="text-gray-400">
              Connect your Steam account with just your username. 
              We'll match your entire library to IGDB and import it 
              to your shelf automatically.
            </p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-white text-xl font-bold mb-3">Achievements</h3>
            <p className="text-gray-400">
              100% Steam achievements earn a gold stamp. 
              PSN Platinum trophies earn platinum. 
              Your rarest completions shine.
            </p>
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="max-w-6xl mx-auto px-8 pb-32 text-center">
        <p className="text-gray-500 text-sm tracking-widest uppercase mb-8">Supports</p>
        <div className="flex justify-center gap-12 text-gray-400">
          <span className="text-lg font-medium">Steam</span>
          <span className="text-lg font-medium">PlayStation</span>
          <span className="text-lg font-medium">Xbox</span>
          <span className="text-lg font-medium">Nintendo</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-8 py-6 max-w-6xl mx-auto flex justify-between items-center">
        <p className="text-gray-600 text-sm">© 2026 Good Game Shelf</p>
        <p className="text-gray-600 text-sm">Built with React, Node.js, Supabase & IGDB</p>
      </div>

    </div>
  )
}

export default Landing