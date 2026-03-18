import { useState } from 'react'
import deepSpaceObjects from '../data/deepspace.json'

const TYPE_COLORS = {
  'Spiral Galaxy': 'text-blue-400',
  'Elliptical Galaxy': 'text-yellow-300',
  'Supergiant Elliptical Galaxy': 'text-yellow-200',
  'Globular Cluster': 'text-amber-300',
  'Open Cluster': 'text-sky-300',
  'Emission Nebula': 'text-pink-400',
  'Planetary Nebula': 'text-cyan-400',
  'Supernova Remnant': 'text-red-400',
  'Star-Forming Region': 'text-orange-400',
  'Supermassive Black Hole': 'text-purple-400',
}

function formatDistance(ly) {
  if (ly >= 1e9) return `${(ly / 1e9).toFixed(1)}B ly`
  if (ly >= 1e6) return `${(ly / 1e6).toFixed(1)}M ly`
  if (ly >= 1e3) return `${(ly / 1e3).toFixed(1)}K ly`
  return `${ly} ly`
}

export default function DeepSpacePanel({ onClose, onSelectObject }) {
  const [selected, setSelected] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')

  const types = [...new Set(deepSpaceObjects.map((o) => o.type))]

  const filtered = typeFilter === 'all'
    ? deepSpaceObjects
    : deepSpaceObjects.filter((o) => o.type === typeFilter)

  const handleSelect = (obj) => {
    setSelected(selected?.id === obj.id ? null : obj)
    onSelectObject?.(obj)
  }

  return (
    <div className="absolute left-4 top-20 bottom-4 w-[420px] z-20 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-purple tracking-wider">
              DEEP SPACE CATALOG
            </h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Messier & Notable Objects</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Type filter */}
        <div className="px-4 py-2 flex gap-1.5 flex-wrap shrink-0 border-b border-panel-border">
          <button
            onClick={() => setTypeFilter('all')}
            className={`text-[9px] px-2 py-1 rounded-full transition-all cursor-pointer ${
              typeFilter === 'all' ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40' : 'glass-panel text-gray-400 hover:bg-white/5'
            }`}
          >
            All ({deepSpaceObjects.length})
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-[9px] px-2 py-1 rounded-full transition-all cursor-pointer ${
                typeFilter === t ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40' : 'glass-panel text-gray-400 hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Object List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((obj) => (
            <button
              key={obj.id}
              onClick={() => handleSelect(obj)}
              className={`w-full text-left glass-panel rounded-lg p-3 transition-all cursor-pointer hover:bg-white/5 ${
                selected?.id === obj.id ? 'border-neon-purple/50' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: obj.color, boxShadow: `0 0 6px ${obj.color}` }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">{obj.name}</p>
                    <p className="text-[10px] text-gray-500">{obj.id} &middot; {obj.constellation}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold ${TYPE_COLORS[obj.type] || 'text-gray-400'}`}>
                  {obj.type}
                </span>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                <span>Distance: <span className="text-white">{formatDistance(obj.distance)}</span></span>
                {obj.magnitude && <span>Mag: <span className="text-white">{obj.magnitude}</span></span>}
                <span>Size: <span className="text-white">{obj.size}</span></span>
              </div>

              {/* Expanded */}
              {selected?.id === obj.id && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-300 leading-relaxed">{obj.description}</p>
                  <div className="mt-2 flex gap-3 text-[10px] text-gray-500">
                    <span>RA: {obj.ra.toFixed(2)}°</span>
                    <span>Dec: {obj.dec.toFixed(2)}°</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
