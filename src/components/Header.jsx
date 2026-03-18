import { useState } from 'react'

export default function Header({
  timeScale, setTimeScale,
  showTravel, setShowTravel,
  showChat, setShowChat,
  showAsteroids, setShowAsteroids,
  showMars, setShowMars,
  showExoplanets, setShowExoplanets,
  showDeepSpace, setShowDeepSpace,
  scale,
}) {
  const [showControls, setShowControls] = useState(false)
  const isSolar = scale === 'solar'
  const isGalaxy = scale === 'galaxy'
  const isDeepSpace = scale === 'deepspace'

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="pointer-events-auto">
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold tracking-wider text-glow-cyan text-neon-cyan">
            STELLARIS NEXUS
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">
            {isSolar && 'Solar System Explorer'}
            {isGalaxy && 'Milky Way Galaxy'}
            {isDeepSpace && 'Deep Space Observatory'}
          </p>
        </div>

        {/* Control Buttons — change based on scale */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
          {/* Time (Solar only) */}
          {isSolar && (
            <button
              onClick={() => setShowControls(!showControls)}
              className="glass-panel px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-neon-cyan">TIME</span>
              <span className="ml-1 text-white font-mono">{timeScale}x</span>
            </button>
          )}

          {/* Solar-mode buttons */}
          {isSolar && (
            <>
              <button
                onClick={setShowAsteroids}
                className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showAsteroids ? 'bg-red-400/20 text-red-400' : 'hover:bg-white/10'}`}
              >
                NEO
              </button>
              <button
                onClick={setShowMars}
                className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showMars ? 'bg-neon-orange/20 text-neon-orange' : 'hover:bg-white/10'}`}
              >
                MARS
              </button>
              <button
                onClick={() => setShowTravel(!showTravel)}
                className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showTravel ? 'bg-neon-cyan/20 text-neon-cyan' : 'hover:bg-white/10'}`}
              >
                TRAVEL
              </button>
            </>
          )}

          {/* Galaxy / Deep Space buttons */}
          {(isGalaxy || isDeepSpace) && (
            <button
              onClick={setShowExoplanets}
              className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showExoplanets ? 'bg-green-400/20 text-green-400' : 'hover:bg-white/10'}`}
            >
              EXOPLANETS
            </button>
          )}

          {isDeepSpace && (
            <button
              onClick={setShowDeepSpace}
              className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showDeepSpace ? 'bg-neon-purple/20 text-neon-purple' : 'hover:bg-white/10'}`}
            >
              CATALOG
            </button>
          )}

          {/* AI Chat (always available) */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showChat ? 'bg-neon-purple/20 text-neon-purple' : 'hover:bg-white/10'}`}
          >
            AI GUIDE
          </button>
        </div>
      </div>

      {/* Time Scale Slider */}
      {showControls && isSolar && (
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

      {/* Contextual instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-gray-500 text-xs tracking-wider uppercase animate-pulse">
          {isSolar && 'Click on a planet to explore  |  Scroll to zoom  |  Drag to rotate'}
          {isGalaxy && 'Click on a star to inspect  |  Find Sol to enter Solar System  |  50,000+ stars rendered'}
          {isDeepSpace && 'Explore nebulae, galaxies & black holes  |  Browse the catalog'}
        </p>
      </div>
    </div>
  )
}
