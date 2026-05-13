function GameCard({ game }) {
    const coverUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`
    const hoursPlayed = Math.round(game.platyime_forever / 60)

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200">
        <img
            src={coverUrl}
            alt={game.name}
            className="w-full object-cover"
            onError={(e) => e.target.src = 'https://placehold.co/600x900?text=No+Cover'}
        />
        <div className="p-3">
            <h3 className="text-white font-semibold text-sm truncate">{game.name}</h3>
            <p className="text-gray-400 text-xs mt-1">{hoursPlayed} hrs played</p>
        </div>
    </div> 
    )
}

export default GameCard