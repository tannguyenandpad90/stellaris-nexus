import { useState, useEffect } from 'react'

const LEVELS = [
  { name: 'Earth', type: 'Planet', icon: '🌍', desc: 'Our home world', scale: '12,742 km', color: '#4a90d9' },
  { name: 'Solar System', type: 'Star System', icon: '☀', desc: '8 planets orbiting the Sun', scale: '~287 billion km', color: '#ffd700' },
  { name: 'Orion Arm', type: 'Spiral Arm', icon: '🌟', desc: 'A minor arm of the Milky Way', scale: '~10,000 light-years wide', color: '#c8e0ff' },
  { name: 'Milky Way', type: 'Galaxy', icon: '🌀', desc: '100-400 billion stars', scale: '~100,000 light-years', color: '#b847ff' },
  { name: 'Local Group', type: 'Galaxy Group', icon: '✦', desc: '~80 galaxies including Andromeda', scale: '~10 million light-years', color: '#00f5ff' },
  { name: 'Virgo Supercluster', type: 'Supercluster', icon: '🕸', desc: '~100 galaxy groups & clusters', scale: '~110 million light-years', color: '#ff6b35' },
  { name: 'Laniakea', type: 'Supercluster Complex', icon: '🌊', desc: '"Immeasurable Heaven" — our home supercluster', scale: '~520 million light-years', color: '#e84a5f' },
  { name: 'Observable Universe', type: 'Universe', icon: '∞', desc: '~2 trillion galaxies, ~10²⁴ stars', scale: '~93 billion light-years', color: '#ffffff' },
]

export default function CosmicAddress({ onClose }) {
  const [activeLevel, setActiveLevel] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(() => {
      setActiveLevel((prev) => {
        if (prev >= LEVELS.length - 1) { setAutoPlay(false); return prev }
        return prev + 1
      })
    }, 1800)
    return () => clearInterval(interval)
  }, [autoPlay])

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-16 w-[500px] z-20">
      <div className="glass-panel rounded-2xl p-5 animate-pulse-glow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-cyan text-glow-cyan tracking-wider">
              YOUR COSMIC ADDRESS
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">From Earth to the Observable Universe</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Zoom visualization */}
        <div className="glass-panel rounded-xl p-4 mb-4 flex items-center justify-center h-36 relative overflow-hidden">
          {LEVELS.map((level, i) => (
            <div
              key={level.name}
              className={`absolute rounded-full border transition-all duration-700 ${i <= activeLevel ? 'opacity-100' : 'opacity-0'}`}
              style={{
                borderColor: `${level.color}40`,
                width: `${(i + 1) * 30}px`,
                height: `${(i + 1) * 30}px`,
                boxShadow: i === activeLevel ? `0 0 15px ${level.color}40, inset 0 0 15px ${level.color}20` : 'none',
              }}
            />
          ))}
          <div
            className="absolute w-3 h-3 rounded-full transition-all duration-300"
            style={{ backgroundColor: LEVELS[activeLevel].color, boxShadow: `0 0 10px ${LEVELS[activeLevel].color}` }}
          />
          <p className="absolute bottom-2 text-[9px] text-gray-500">
            {LEVELS[activeLevel].icon} {LEVELS[activeLevel].name}
          </p>
        </div>

        {/* Address list */}
        <div className="space-y-1">
          {LEVELS.map((level, i) => (
            <button
              key={level.name}
              onClick={() => { setActiveLevel(i); setAutoPlay(false) }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                i === activeLevel ? 'glass-panel bg-white/5' : i <= activeLevel ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <span className="text-base w-6 text-center">{level.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-white font-semibold">{level.name}</span>
                  <span className="text-[9px] text-gray-500">{level.type}</span>
                </div>
                {i === activeLevel && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{level.desc}</p>
                )}
              </div>
              <span className="text-[9px] text-gray-500 font-mono shrink-0">{level.scale}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 mt-3">
          <button
            onClick={() => { setActiveLevel(0); setAutoPlay(true) }}
            className="glass-panel rounded-lg px-3 py-1 text-[10px] text-neon-cyan cursor-pointer hover:bg-neon-cyan/10"
          >
            Replay
          </button>
        </div>
      </div>
    </div>
  )
}
