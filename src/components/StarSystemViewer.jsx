import { useState } from 'react'

function PlanetRow({ planet, isExpanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left glass-panel rounded-lg p-2.5 transition-all cursor-pointer hover:bg-white/5 ${
        planet.habitable ? 'border-l-2 border-green-400/50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Planet sphere */}
        <div
          className="w-5 h-5 rounded-full shrink-0"
          style={{
            backgroundColor: planet.color,
            boxShadow: planet.habitable ? `0 0 8px ${planet.color}` : 'none',
            width: Math.max(12, Math.min(28, planet.radiusEarth * 10)),
            height: Math.max(12, Math.min(28, planet.radiusEarth * 10)),
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white font-semibold truncate">{planet.name}</span>
            {planet.habitable && (
              <span className="text-[8px] bg-green-400/20 text-green-400 px-1.5 py-0 rounded-full font-bold shrink-0">
                HZ
              </span>
            )}
          </div>
          <span className="text-[9px] text-gray-500">{planet.type}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono shrink-0">{planet.orbitAU} AU</span>
      </div>

      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-2 gap-1.5">
          <Stat label="Radius" value={`${planet.radiusEarth} R⊕`} />
          <Stat label="Temperature" value={`${planet.tempK} K (${planet.tempC}°C)`} />
          <Stat label="Orbital Period" value={`${planet.orbitalPeriod} days`} />
          <Stat label="Moons" value={planet.moons} />
          <div className="col-span-2">
            <Stat label="Atmosphere" value={planet.atmosphere} />
          </div>
        </div>
      )}
    </button>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[8px] text-gray-600 uppercase">{label}</p>
      <p className="text-[10px] text-white">{value}</p>
    </div>
  )
}

// Simple mini orrery SVG
function MiniOrrery({ system }) {
  const maxOrbit = Math.max(...system.planets.map((p) => p.orbitAU), 1)
  const scale = 55 / maxOrbit

  return (
    <svg viewBox="-65 -65 130 130" className="w-full h-32">
      {/* Star */}
      <circle cx="0" cy="0" r="6" fill={system.spectral.color}>
        <animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="0" cy="0" r="9" fill={system.spectral.color} opacity="0.15" />

      {/* Companion star */}
      {system.isMultiStar && system.companionType && (
        <circle cx="12" cy="-4" r="3" fill={system.companionType.color} opacity="0.7" />
      )}

      {/* Planet orbits and planets */}
      {system.planets.map((planet, i) => {
        const r = planet.orbitAU * scale + 12
        const angle = (i / system.planets.length) * Math.PI * 2 + 0.5
        const px = Math.cos(angle) * r
        const py = Math.sin(angle) * r
        const planetR = Math.max(1.5, Math.min(4, planet.radiusEarth * 1.5))

        return (
          <g key={i}>
            <circle cx="0" cy="0" r={r} fill="none" stroke="white" strokeWidth="0.3" opacity="0.15" />
            <circle cx={px} cy={py} r={planetR} fill={planet.color}>
              {planet.habitable && (
                <animate attributeName="r" values={`${planetR};${planetR + 1};${planetR}`} dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            {planet.habitable && (
              <circle cx={px} cy={py} r={planetR + 2} fill="none" stroke="#4ade80" strokeWidth="0.5" opacity="0.4" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function StarSystemViewer({ system, onClose }) {
  const [expandedPlanet, setExpandedPlanet] = useState(null)

  if (!system) return null

  return (
    <div className="absolute right-4 top-20 bottom-4 w-96 z-20 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="px-4 py-3 border-b border-panel-border shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-cyan text-glow-cyan tracking-wider">
                {system.name}
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Procedurally Generated Star System
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
          </div>
        </div>

        {/* Mini Orrery */}
        <div className="px-4 pt-2 shrink-0">
          <MiniOrrery system={system} />
        </div>

        {/* Star Info */}
        <div className="px-4 py-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-panel rounded-lg p-2 flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full shrink-0"
                style={{
                  backgroundColor: system.spectral.color,
                  boxShadow: `0 0 8px ${system.spectral.color}`,
                }}
              />
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Type</p>
                <p className="text-xs text-white font-mono">{system.spectral.type}-class</p>
              </div>
            </div>
            <div className="glass-panel rounded-lg p-2">
              <p className="text-[9px] text-gray-500 uppercase">Temperature</p>
              <p className="text-[11px] text-white">{system.spectral.temp}</p>
            </div>
            <div className="glass-panel rounded-lg p-2">
              <p className="text-[9px] text-gray-500 uppercase">Distance</p>
              <p className="text-[11px] text-white font-mono">{system.distanceLy.toLocaleString()} ly</p>
            </div>
            <div className="glass-panel rounded-lg p-2">
              <p className="text-[9px] text-gray-500 uppercase">Age</p>
              <p className="text-[11px] text-white">{system.age}</p>
            </div>
            <div className="glass-panel rounded-lg p-2">
              <p className="text-[9px] text-gray-500 uppercase">Mass</p>
              <p className="text-[11px] text-white">{system.spectral.mass}</p>
            </div>
            <div className="glass-panel rounded-lg p-2">
              <p className="text-[9px] text-gray-500 uppercase">Stars</p>
              <p className="text-[11px] text-white">{system.isMultiStar ? 'Binary' : 'Single'}</p>
            </div>
          </div>
        </div>

        {/* Planets */}
        <div className="px-4 py-1 shrink-0 flex items-center justify-between">
          <h3 className="text-[10px] text-gray-400 uppercase tracking-wider">
            Planets ({system.numPlanets})
          </h3>
          {system.hasHabitablePlanet && (
            <span className="text-[9px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Habitable zone detected
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-1.5">
          {system.planets.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-6">
              No planets detected in this system
            </p>
          )}
          {system.planets.map((planet, i) => (
            <PlanetRow
              key={i}
              planet={planet}
              isExpanded={expandedPlanet === i}
              onToggle={() => setExpandedPlanet(expandedPlanet === i ? null : i)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-panel-border shrink-0">
          <p className="text-[8px] text-gray-600 text-center">
            System generated from galactic position ({system.position.x.toFixed(2)}, {system.position.y.toFixed(2)}, {system.position.z.toFixed(2)})
            &middot; Deterministic seed — same star always generates the same system
          </p>
        </div>
      </div>
    </div>
  )
}
