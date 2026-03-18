import { useState } from 'react'
import planets from '../data/planets.json'

// Real diameters in km for proper scaling
const DIAMETERS = {
  sun: 1392700,
  mercury: 4879,
  venus: 12104,
  earth: 12742,
  mars: 6779,
  jupiter: 139820,
  saturn: 116460,
  uranus: 50724,
  neptune: 49528,
}

export default function SizeComparison({ onClose }) {
  const [showSun, setShowSun] = useState(false)
  const [selected, setSelected] = useState(['mercury', 'earth', 'jupiter', 'neptune'])

  const togglePlanet = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const items = [
    ...(showSun ? [{ id: 'sun', name: 'Sun', color: '#ffd700', diameter: DIAMETERS.sun }] : []),
    ...selected.map((id) => {
      const p = planets.find((pl) => pl.id === id)
      return { id, name: p.name, color: p.color, diameter: DIAMETERS[id] }
    }),
  ]

  // Find max diameter for scaling
  const maxDiameter = Math.max(...items.map((i) => i.diameter))
  const maxDisplaySize = 160 // max px

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-20 w-[600px] z-20">
      <div className="glass-panel rounded-2xl p-4 animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-neon-orange text-glow-orange tracking-wider">
              SIZE COMPARISON
            </h2>
            <p className="text-[9px] text-gray-500 mt-0.5">True scale relative sizes</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Planet toggles */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => setShowSun(!showSun)}
            className={`text-[9px] px-2 py-1 rounded-full cursor-pointer transition-all ${
              showSun ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40' : 'glass-panel text-gray-500 hover:bg-white/5'
            }`}
          >
            Sun
          </button>
          {planets.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlanet(p.id)}
              className={`text-[9px] px-2 py-1 rounded-full cursor-pointer transition-all ${
                selected.includes(p.id)
                  ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/40'
                  : 'glass-panel text-gray-500 hover:bg-white/5'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Visual comparison */}
        <div className="glass-panel rounded-xl p-4 flex items-end justify-center gap-4" style={{ minHeight: maxDisplaySize + 40 }}>
          {items.map((item) => {
            const size = Math.max((item.diameter / maxDiameter) * maxDisplaySize, 4)
            return (
              <div key={item.id} className="flex flex-col items-center">
                <div
                  className="rounded-full transition-all duration-500 shrink-0"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: item.color,
                    boxShadow: `0 0 ${Math.max(size * 0.2, 4)}px ${item.color}`,
                  }}
                />
                <p className="text-[9px] text-white mt-2 font-semibold">{item.name}</p>
                <p className="text-[8px] text-gray-500 font-mono">{item.diameter.toLocaleString()} km</p>
              </div>
            )
          })}

          {items.length === 0 && (
            <p className="text-gray-500 text-xs py-8">Select planets above to compare</p>
          )}
        </div>

        {/* Scale info */}
        {items.length > 1 && (
          <p className="text-[8px] text-gray-600 text-center mt-2">
            Largest shown: {items.reduce((a, b) => a.diameter > b.diameter ? a : b).name}
            ({items.reduce((a, b) => a.diameter > b.diameter ? a : b).diameter.toLocaleString()} km)
            &middot; Ratio to smallest: {(Math.max(...items.map(i => i.diameter)) / Math.min(...items.map(i => i.diameter))).toFixed(1)}x
          </p>
        )}
      </div>
    </div>
  )
}
