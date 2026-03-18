import { useState } from 'react'

export default function Header({
  timeScale, setTimeScale,
  showTravel, setShowTravel,
  showChat, setShowChat,
  showAsteroids, setShowAsteroids,
  showMars, setShowMars,
}) {
  const [showControls, setShowControls] = useState(false)

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="pointer-events-auto">
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold tracking-wider text-glow-cyan text-neon-cyan">
            STELLARIS NEXUS
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">
            Solar System Explorer
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
          {/* Time Scale Control */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="glass-panel px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="text-neon-cyan">TIME</span>
            <span className="ml-1 text-white font-mono">{timeScale}x</span>
          </button>

          {/* Asteroids NEO */}
          <button
            onClick={setShowAsteroids}
            className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showAsteroids ? 'bg-red-400/20 text-red-400' : 'hover:bg-white/10'}`}
          >
            NEO
          </button>

          {/* Mars Rover */}
          <button
            onClick={setShowMars}
            className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showMars ? 'bg-neon-orange/20 text-neon-orange' : 'hover:bg-white/10'}`}
          >
            MARS
          </button>

          {/* Travel Calculator */}
          <button
            onClick={() => setShowTravel(!showTravel)}
            className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showTravel ? 'bg-neon-cyan/20 text-neon-cyan' : 'hover:bg-white/10'}`}
          >
            TRAVEL
          </button>

          {/* AI Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showChat ? 'bg-neon-purple/20 text-neon-purple' : 'hover:bg-white/10'}`}
          >
            AI GUIDE
          </button>
        </div>
      </div>

      {/* Time Scale Slider */}
      {showControls && (
        <div className="absolute top-16 right-6 glass-panel rounded-xl p-4 pointer-events-auto animate-pulse-glow">
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">
            Time Speed
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={timeScale}
            onChange={(e) => setTimeScale(Number(e.target.value))}
            className="w-48 accent-[var(--color-neon-cyan)]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Pause</span>
            <span>50x</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-gray-500 text-xs tracking-wider uppercase animate-pulse">
          Click on a planet to explore  |  Scroll to zoom  |  Drag to rotate
        </p>
      </div>
    </div>
  )
}
