import { useState } from 'react'
import { useExoplanets } from '../hooks/useExoplanets'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-lg px-3 py-2 text-xs">
        <p className="text-neon-cyan">{label}</p>
        <p className="text-white">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

function HabitabilityScore({ planet }) {
  let score = 0
  if (planet.temperature && planet.temperature > 200 && planet.temperature < 320) score += 40
  if (planet.radius && planet.radius > 0.5 && planet.radius < 2) score += 30
  if (planet.mass && planet.mass > 0.1 && planet.mass < 5) score += 20
  if (planet.orbitalPeriod && planet.orbitalPeriod > 50 && planet.orbitalPeriod < 800) score += 10

  let color = 'text-red-400'
  let label = 'Hostile'
  if (score >= 70) { color = 'text-green-400'; label = 'Promising' }
  else if (score >= 40) { color = 'text-yellow-400'; label = 'Marginal' }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 70 ? 'bg-green-400' : score >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${color}`}>{label}</span>
    </div>
  )
}

export default function ExoplanetPanel({ onClose }) {
  const { data, loading, error, stats } = useExoplanets()
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all') // all, habitable, recent

  const filtered = data?.filter((p) => {
    if (filter === 'habitable') return p.temperature && p.temperature > 200 && p.temperature < 320
    if (filter === 'recent') return p.discoveryYear >= 2023
    return true
  }) || []

  const discoveryChartData = stats?.yearlyDiscoveries?.slice(-10).map(([year, count]) => ({
    year: String(year),
    count,
  })) || []

  return (
    <div className="absolute left-4 top-20 bottom-4 w-[420px] z-20 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-green-400 tracking-wider">
              EXOPLANET ARCHIVE
            </h2>
            <p className="text-[10px] text-gray-500 mt-0.5">NASA Confirmed Discoveries</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="px-4 py-3 border-b border-panel-border shrink-0">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="glass-panel rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-white font-mono">{stats.total}</p>
                <p className="text-[9px] text-gray-400 uppercase">Loaded</p>
              </div>
              <div className="glass-panel rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-green-400 font-mono">{stats.habitable}</p>
                <p className="text-[9px] text-gray-400 uppercase">Habitable?</p>
              </div>
              <div className="glass-panel rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-neon-cyan font-mono">{stats.methods.length}</p>
                <p className="text-[9px] text-gray-400 uppercase">Methods</p>
              </div>
            </div>

            {/* Discovery timeline chart */}
            {discoveryChartData.length > 0 && (
              <div className="h-20">
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Recent Discoveries</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={discoveryChartData}>
                    <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#4ade80" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="px-4 py-2 flex gap-2 shrink-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'habitable', label: 'Habitable Zone' },
            { id: 'recent', label: 'Recent (2023+)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-[10px] px-2 py-1 rounded-full transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-green-400/20 text-green-400 border border-green-400/40'
                  : 'glass-panel text-gray-400 hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Planet List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm p-3 glass-panel rounded-lg">Error: {error}</div>
          )}

          {filtered.map((planet, i) => (
            <button
              key={`${planet.name}-${i}`}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-left glass-panel rounded-lg p-3 transition-all cursor-pointer hover:bg-white/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{planet.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {planet.hostStar} &middot; {planet.discoveryYear} &middot; {planet.discoveryMethod}
                  </p>
                </div>
                {planet.radius && (
                  <span className="text-[10px] text-neon-cyan ml-2 shrink-0">
                    {planet.radius.toFixed(1)} R⊕
                  </span>
                )}
              </div>

              {/* Habitability score */}
              <div className="mt-2">
                <HabitabilityScore planet={planet} />
              </div>

              {/* Expanded details */}
              {expanded === i && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  {planet.distance && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Distance</p>
                      <p className="text-xs text-white font-mono">{planet.distance.toFixed(1)} pc</p>
                    </div>
                  )}
                  {planet.mass && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Mass</p>
                      <p className="text-xs text-white font-mono">{planet.mass.toFixed(2)} M⊕</p>
                    </div>
                  )}
                  {planet.temperature && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Temperature</p>
                      <p className="text-xs text-white font-mono">{Math.round(planet.temperature)} K ({Math.round(planet.temperature - 273)}°C)</p>
                    </div>
                  )}
                  {planet.orbitalPeriod && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Orbital Period</p>
                      <p className="text-xs text-white font-mono">{planet.orbitalPeriod.toFixed(1)} days</p>
                    </div>
                  )}
                  {planet.numPlanets && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">System Planets</p>
                      <p className="text-xs text-white font-mono">{planet.numPlanets}</p>
                    </div>
                  )}
                  {planet.spectralType && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Star Type</p>
                      <p className="text-xs text-white font-mono">{planet.spectralType}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">No exoplanets match this filter</p>
          )}
        </div>
      </div>
    </div>
  )
}
