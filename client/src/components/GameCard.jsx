function GameCard({ game }) {
  const covers = [
    `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`,
    `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_616x353.jpg`,
  ]

  const hoursPlayed = Math.round(game.playtime_forever / 60)

  const handleError = (e) => {
    const current = e.target.src
    const currentIndex = covers.indexOf(current)
    const next = covers[currentIndex + 1]
    if (next) {
      e.target.src = next
    } else {
      e.target.src = 'https://placehold.co/600x900?text=No+Cover'
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200">
      <img
        src={covers[0]}
        alt={game.name}
        className="w-full object-cover"
        onError={handleError}
      />
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">{game.name}</h3>
        <p className="text-gray-400 text-xs mt-1">{hoursPlayed} hrs played</p>
      </div>
    </div>
  )
}

export default GameCard