import { useISSTracker } from '../hooks/useISSTracker'

export default function ISSTracker({ onClose }) {
  const { position, history, loading, error } = useISSTracker()

  return (
    <div className="absolute right-4 top-20 w-80 z-20">
      <div className="glass-panel rounded-2xl p-4 animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <h2 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-green-400 tracking-wider">
              ISS LIVE TRACKER
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {loading && !position && (
          <div className="flex items-center justify-center h-20">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        {position && (
          <>
            {/* Mini globe visualization */}
            <div className="relative w-full h-40 mb-3 glass-panel rounded-xl overflow-hidden">
              <svg viewBox="-110 -110 220 220" className="w-full h-full">
                {/* Earth circle */}
                <circle cx="0" cy="0" r="90" fill="#0a1628" stroke="#1a3a5c" strokeWidth="1" />
                {/* Grid lines */}
                {[-60, -30, 0, 30, 60].map(lat => (
                  <ellipse
                    key={`lat-${lat}`}
                    cx="0" cy={0}
                    rx={90 * Math.cos(lat * Math.PI / 180)}
                    ry={90 * Math.cos(lat * Math.PI / 180) * 0.3}
                    fill="none" stroke="#1a3a5c" strokeWidth="0.5"
                    transform={`translate(0, ${-90 * Math.sin(lat * Math.PI / 180) * 0.3})`}
                  />
                ))}
                {[-90, -45, 0, 45, 90].map(lon => (
                  <ellipse
                    key={`lon-${lon}`}
                    cx="0" cy="0"
                    rx={Math.abs(90 * Math.sin(lon * Math.PI / 180))}
                    ry="90"
                    fill="none" stroke="#1a3a5c" strokeWidth="0.5"
                  />
                ))}
                {/* Trail */}
                {history.length > 1 && (
                  <polyline
                    points={history.map(p => {
                      const x = (p.longitude / 180) * 90
                      const y = -(p.latitude / 90) * 90 * 0.3
                      return `${x},${y}`
                    }).join(' ')}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                )}
                {/* ISS Position */}
                <g transform={`translate(${(position.longitude / 180) * 90}, ${-(position.latitude / 90) * 90 * 0.3})`}>
                  <circle r="6" fill="#4ade80" opacity="0.2">
                    <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle r="3" fill="#4ade80" />
                  <text x="8" y="4" fill="#4ade80" fontSize="8" fontFamily="monospace">ISS</text>
                </g>
              </svg>
            </div>

            {/* Position Data */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="glass-panel rounded-lg p-2">
                <p className="text-[9px] text-gray-500 uppercase">Latitude</p>
                <p className="text-xs text-white font-mono">{position.latitude.toFixed(4)}°</p>
              </div>
              <div className="glass-panel rounded-lg p-2">
                <p className="text-[9px] text-gray-500 uppercase">Longitude</p>
                <p className="text-xs text-white font-mono">{position.longitude.toFixed(4)}°</p>
              </div>
              <div className="glass-panel rounded-lg p-2">
                <p className="text-[9px] text-gray-500 uppercase">Altitude</p>
                <p className="text-xs text-white font-mono">{position.altitude.toFixed(1)} km</p>
              </div>
              <div className="glass-panel rounded-lg p-2">
                <p className="text-[9px] text-gray-500 uppercase">Velocity</p>
                <p className="text-xs text-white font-mono">{position.velocity.toFixed(0)} km/h</p>
              </div>
            </div>

            {/* Fun stats */}
            <div className="glass-panel rounded-lg p-2 text-center">
              <p className="text-[9px] text-gray-500">Orbits Earth every <span className="text-green-400 font-mono">92 min</span> at <span className="text-green-400 font-mono">27,600 km/h</span></p>
            </div>

            <p className="text-[9px] text-gray-600 text-center mt-2">
              {position.visibility === 'daylight' ? '☀ Daylight side' : '🌙 Night side'} &middot; Updates every 5s
            </p>
          </>
        )}
      </div>
    </div>
  )
}
