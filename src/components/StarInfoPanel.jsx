export default function StarInfoPanel({ star, onClose, onGoToSolarSystem }) {
  if (!star) return null

  const isSol = star.name === 'Sol'
  const isSgrA = star.name === 'Sagittarius A*'

  return (
    <div className="absolute right-4 top-20 w-80 z-20">
      <div className="glass-panel rounded-2xl p-4 animate-pulse-glow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-neon-cyan text-glow-cyan">
              {star.name}
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {star.type} &middot; {star.name === 'Sol' ? 'Home System' : 'Notable Star'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Star color indicator */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full"
            style={{
              backgroundColor: isSgrA ? '#330033' : star.color,
              boxShadow: isSgrA ? '0 0 15px #9900ff' : `0 0 12px ${star.color}`,
            }}
          />
          <div>
            <p className="text-xs text-white">{star.info}</p>
          </div>
        </div>

        {/* Quick data */}
        <div className="space-y-2 mb-4">
          <div className="glass-panel rounded-lg p-2 flex justify-between">
            <span className="text-[10px] text-gray-400 uppercase">Spectral Type</span>
            <span className="text-xs text-white font-mono">{star.type}</span>
          </div>
          <div className="glass-panel rounded-lg p-2 flex justify-between">
            <span className="text-[10px] text-gray-400 uppercase">Position (Galaxy)</span>
            <span className="text-xs text-white font-mono">
              ({star.x.toFixed(1)}, {star.y.toFixed(1)}, {star.z.toFixed(1)})
            </span>
          </div>
        </div>

        {/* Navigate to Solar System */}
        {isSol && onGoToSolarSystem && (
          <button
            onClick={onGoToSolarSystem}
            className="w-full glass-panel rounded-lg px-4 py-3 text-sm text-neon-cyan hover:bg-neon-cyan/10 transition-colors cursor-pointer border border-neon-cyan/30 font-[family-name:var(--font-orbitron)] tracking-wider"
          >
            ENTER SOLAR SYSTEM →
          </button>
        )}

        {isSgrA && (
          <div className="glass-panel rounded-lg p-3 border-l-2 border-purple-400">
            <p className="text-[10px] text-purple-400 uppercase font-bold mb-1">Black Hole</p>
            <p className="text-xs text-gray-300">
              Mass: 4 million solar masses. Event horizon radius: ~12 million km.
              First imaged by EHT in May 2022.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
