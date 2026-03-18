import { useState } from 'react'
import { useAsteroids } from '../hooks/useNasaData'

function formatDistance(km) {
  if (km > 1e6) return `${(km / 1e6).toFixed(2)}M km`
  return `${Math.round(km).toLocaleString()} km`
}

function formatSpeed(kmh) {
  return `${Math.round(kmh).toLocaleString()} km/h`
}

function ThreatLevel({ isHazardous, distance }) {
  // Distance in lunar distances (384,400 km)
  const lunarDist = distance / 384400
  let level, color, label
  if (isHazardous && lunarDist < 5) {
    level = 'CRITICAL'
    color = 'text-red-400'
    label = 'bg-red-400'
  } else if (isHazardous) {
    level = 'WARNING'
    color = 'text-yellow-400'
    label = 'bg-yellow-400'
  } else {
    level = 'SAFE'
    color = 'text-green-400'
    label = 'bg-green-400'
  }
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-bold ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${label} ${level === 'CRITICAL' ? 'animate-ping' : ''}`} />
      {level}
    </span>
  )
}

export default function AsteroidAlert({ onClose }) {
  const { data, loading, error } = useAsteroids()
  const [expanded, setExpanded] = useState(null)

  const hazardousCount = data?.asteroids?.filter(a => a.isHazardous).length || 0

  return (
    <div className="absolute left-4 top-20 bottom-4 w-96 z-20 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-red-400 tracking-wider">
                NEO TRACKER
              </h2>
              {hazardousCount > 0 && (
                <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {hazardousCount} HAZARDOUS
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Near-Earth Objects — Today</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm p-3 glass-panel rounded-lg">
              Error: {error}
            </div>
          )}

          {data && (
            <>
              {/* Summary */}
              <div className="glass-panel rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Objects detected</p>
                  <p className="text-2xl font-bold text-white font-mono">{data.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Potentially hazardous</p>
                  <p className={`text-2xl font-bold font-mono ${hazardousCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {hazardousCount}
                  </p>
                </div>
              </div>

              {/* Asteroid List */}
              {data.asteroids.map((asteroid) => (
                <button
                  key={asteroid.id}
                  onClick={() => setExpanded(expanded === asteroid.id ? null : asteroid.id)}
                  className={`w-full text-left glass-panel rounded-lg p-3 transition-all cursor-pointer hover:bg-white/5 ${
                    asteroid.isHazardous ? 'border-l-2 border-red-400/50' : ''
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{asteroid.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">ID: {asteroid.id}</p>
                    </div>
                    <ThreatLevel isHazardous={asteroid.isHazardous} distance={asteroid.missDistance} />
                  </div>

                  {/* Size bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Diameter</span>
                      <span>{Math.round(asteroid.diameter.min)}-{Math.round(asteroid.diameter.max)}m</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${asteroid.isHazardous ? 'bg-red-400' : 'bg-neon-cyan'}`}
                        style={{ width: `${Math.min((asteroid.diameter.max / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded === asteroid.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Velocity</p>
                        <p className="text-xs text-white font-mono">{formatSpeed(asteroid.velocity)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Miss Distance</p>
                        <p className="text-xs text-white font-mono">{formatDistance(asteroid.missDistance)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-500 uppercase">Close Approach</p>
                        <p className="text-xs text-white">{asteroid.closeApproachDate}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-500 uppercase">Lunar Distance</p>
                        <p className="text-xs text-neon-cyan font-mono">
                          {(asteroid.missDistance / 384400).toFixed(2)} LD
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
