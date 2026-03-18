import { useState } from 'react'

function Btn({ active, color, onClick, children }) {
  const colorMap = {
    cyan: { on: 'bg-neon-cyan/20 text-neon-cyan', off: '' },
    red: { on: 'bg-red-400/20 text-red-400', off: '' },
    orange: { on: 'bg-neon-orange/20 text-neon-orange', off: '' },
    purple: { on: 'bg-neon-purple/20 text-neon-purple', off: '' },
    green: { on: 'bg-green-400/20 text-green-400', off: '' },
    yellow: { on: 'bg-yellow-400/20 text-yellow-400', off: '' },
    blue: { on: 'bg-blue-400/20 text-blue-400', off: '' },
  }
  const c = colorMap[color] || colorMap.cyan
  return (
    <button
      onClick={onClick}
      className={`glass-panel px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${active ? c.on : 'hover:bg-white/10'}`}
    >
      {children}
    </button>
  )
}

export default function Header({ timeScale, setTimeScale, panels, togglePanel, scale }) {
  const [showControls, setShowControls] = useState(false)
  const isSolar = scale === 'solar'
  const isGalaxy = scale === 'galaxy'
  const isDeepSpace = scale === 'deepspace'

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
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

        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end max-w-[65%]">
          {/* Solar-only */}
          {isSolar && (
            <>
              <button
                onClick={() => setShowControls(!showControls)}
                className="glass-panel px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="text-neon-cyan">TIME</span>
                <span className="ml-1 text-white font-mono">{timeScale}x</span>
              </button>
              <Btn active={panels.asteroids} color="red" onClick={() => togglePanel('asteroids')}>NEO</Btn>
              <Btn active={panels.mars} color="orange" onClick={() => togglePanel('mars')}>MARS</Btn>
              <Btn active={panels.travel} color="cyan" onClick={() => togglePanel('travel')}>TRAVEL</Btn>
              <Btn active={panels.gravity} color="cyan" onClick={() => togglePanel('gravity')}>GRAVITY</Btn>
              <Btn active={panels.size} color="orange" onClick={() => togglePanel('size')}>SIZE</Btn>
              <Btn active={panels.missions} color="blue" onClick={() => togglePanel('missions')}>MISSIONS</Btn>
            </>
          )}

          {/* Galaxy / Deep Space */}
          {(isGalaxy || isDeepSpace) && (
            <Btn active={panels.exoplanets} color="green" onClick={() => togglePanel('exoplanets')}>EXOPLANETS</Btn>
          )}
          {isDeepSpace && (
            <Btn active={panels.deepSpace} color="purple" onClick={() => togglePanel('deepSpace')}>CATALOG</Btn>
          )}

          {/* Global */}
          <Btn active={panels.iss} color="green" onClick={() => togglePanel('iss')}>ISS</Btn>
          <Btn active={panels.weather} color="yellow" onClick={() => togglePanel('weather')}>WEATHER</Btn>
          <Btn active={panels.chat} color="purple" onClick={() => togglePanel('chat')}>AI GUIDE</Btn>
        </div>
      </div>

      {showControls && isSolar && (
        <div className="absolute top-16 right-6 glass-panel rounded-xl p-4 pointer-events-auto animate-pulse-glow">
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Time Speed</label>
          <input
            type="range" min="0" max="50" step="1" value={timeScale}
            onChange={(e) => setTimeScale(Number(e.target.value))}
            className="w-48 accent-[var(--color-neon-cyan)]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Pause</span><span>50x</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-gray-500 text-xs tracking-wider uppercase animate-pulse">
          {isSolar && 'Click on a planet to explore  |  Scroll to zoom  |  Drag to rotate'}
          {isGalaxy && 'Click on a star to inspect  |  Find Sol to enter Solar System  |  50,000+ stars'}
          {isDeepSpace && 'Explore nebulae, galaxies & black holes  |  Browse the catalog'}
        </p>
      </div>
    </div>
  )
}
