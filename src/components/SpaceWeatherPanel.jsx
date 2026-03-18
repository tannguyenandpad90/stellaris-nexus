import { useState } from 'react'
import { useSpaceWeather } from '../hooks/useSpaceWeather'

function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false)
  const time = new Date(event.time).toLocaleString()

  const typeStyles = {
    'Solar Flare': { color: 'text-yellow-400', border: 'border-yellow-400/30' },
    'CME': { color: 'text-orange-400', border: 'border-orange-400/30' },
    'Geomagnetic Storm': { color: 'text-red-400', border: 'border-red-400/30' },
  }
  const style = typeStyles[event.type] || { color: 'text-gray-400', border: '' }

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left glass-panel rounded-lg p-2.5 transition-all cursor-pointer hover:bg-white/5 border-l-2 ${style.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-[10px] font-bold uppercase ${style.color}`}>{event.type}</span>
          {event.class && <span className="text-white text-xs ml-2 font-mono">{event.class}</span>}
        </div>
        <span className="text-[9px] text-gray-500">{time}</span>
      </div>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-400 space-y-1">
          {event.peakTime && <p>Peak: {new Date(event.peakTime).toLocaleString()}</p>}
          {event.region && <p>Active Region: {event.region}</p>}
          {event.source && <p>Source: {event.source}</p>}
          {event.speed && <p>Speed: <span className="text-white font-mono">{event.speed} km/s</span></p>}
          {event.kpIndex && <p>Kp Index: <span className="text-white font-mono">{event.kpIndex}</span></p>}
          {event.note && <p className="text-gray-500 text-[10px]">{event.note}</p>}
        </div>
      )}
    </button>
  )
}

export default function SpaceWeatherPanel({ onClose }) {
  const { data, loading, error } = useSpaceWeather()

  return (
    <div className="absolute right-4 top-20 w-80 z-20 max-h-[calc(100vh-120px)]">
      <div className="glass-panel rounded-2xl flex flex-col max-h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-yellow-400 tracking-wider">
              SPACE WEATHER
            </h2>
            <p className="text-[9px] text-gray-500 mt-0.5">NASA DONKI — Last 7 Days</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center h-20">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-xs p-2">{error}</p>}

          {data && (
            <>
              {/* Alert Status */}
              <div className="glass-panel rounded-xl p-3 text-center">
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Solar Activity Status</p>
                <p
                  className="font-[family-name:var(--font-orbitron)] text-lg font-bold tracking-wider"
                  style={{ color: data.alertColor }}
                >
                  {data.alertLevel}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {data.totalEvents} events detected ({data.period.start} → {data.period.end})
                </p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="glass-panel rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-yellow-400 font-mono">{data.flares.length}</p>
                  <p className="text-[8px] text-gray-500 uppercase">Flares</p>
                </div>
                <div className="glass-panel rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-orange-400 font-mono">{data.cmes.length}</p>
                  <p className="text-[8px] text-gray-500 uppercase">CMEs</p>
                </div>
                <div className="glass-panel rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-red-400 font-mono">{data.storms.length}</p>
                  <p className="text-[8px] text-gray-500 uppercase">Storms</p>
                </div>
              </div>

              {/* Event list */}
              {[...data.flares, ...data.cmes, ...data.storms]
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .map((event, i) => (
                  <EventCard key={i} event={event} />
                ))}

              {data.totalEvents === 0 && (
                <p className="text-gray-500 text-xs text-center py-4">
                  No significant space weather events in the past 7 days. All quiet!
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
