import { useState, useRef, useEffect } from 'react'

const MISSIONS = [
  { year: 1957, name: 'Sputnik 1', org: 'USSR', type: 'satellite', desc: 'First artificial satellite in orbit', icon: '🛰' },
  { year: 1961, name: 'Vostok 1', org: 'USSR', type: 'crewed', desc: 'Yuri Gagarin — First human in space', icon: '👨‍🚀' },
  { year: 1962, name: 'Mariner 2', org: 'NASA', type: 'flyby', desc: 'First successful planetary flyby (Venus)', icon: '🚀' },
  { year: 1966, name: 'Luna 9', org: 'USSR', type: 'lander', desc: 'First soft landing on the Moon', icon: '🌕' },
  { year: 1969, name: 'Apollo 11', org: 'NASA', type: 'crewed', desc: 'First humans on the Moon — Armstrong & Aldrin', icon: '🌕' },
  { year: 1971, name: 'Salyut 1', org: 'USSR', type: 'station', desc: 'First space station in orbit', icon: '🛰' },
  { year: 1976, name: 'Viking 1', org: 'NASA', type: 'lander', desc: 'First successful Mars lander — searched for life', icon: '🔴' },
  { year: 1977, name: 'Voyager 1 & 2', org: 'NASA', type: 'flyby', desc: 'Grand Tour of outer planets — still active in interstellar space', icon: '🚀' },
  { year: 1981, name: 'STS-1 Columbia', org: 'NASA', type: 'crewed', desc: 'First Space Shuttle mission', icon: '🛸' },
  { year: 1990, name: 'Hubble Telescope', org: 'NASA/ESA', type: 'telescope', desc: 'Revolutionized our understanding of the universe', icon: '🔭' },
  { year: 1997, name: 'Cassini-Huygens', org: 'NASA/ESA', type: 'orbiter', desc: 'Saturn orbiter — discovered oceans on Enceladus', icon: '🪐' },
  { year: 1998, name: 'ISS Assembly', org: 'International', type: 'station', desc: 'International Space Station construction begins', icon: '🛰' },
  { year: 2004, name: 'Spirit & Opportunity', org: 'NASA', type: 'rover', desc: 'Mars Exploration Rovers — Opportunity lasted 15 years!', icon: '🤖' },
  { year: 2006, name: 'New Horizons', org: 'NASA', type: 'flyby', desc: 'First Pluto flyby — revealed heart-shaped glacier', icon: '💙' },
  { year: 2012, name: 'Curiosity', org: 'NASA', type: 'rover', desc: 'Mars Science Laboratory — still active on Mars', icon: '🤖' },
  { year: 2015, name: 'LIGO Detection', org: 'NSF', type: 'science', desc: 'First detection of gravitational waves', icon: '🌊' },
  { year: 2019, name: 'M87* Black Hole', org: 'EHT', type: 'science', desc: 'First direct image of a black hole', icon: '🕳' },
  { year: 2021, name: 'Perseverance', org: 'NASA', type: 'rover', desc: 'Mars rover with Ingenuity helicopter — first powered flight on another planet', icon: '🚁' },
  { year: 2021, name: 'JWST Launch', org: 'NASA/ESA/CSA', type: 'telescope', desc: 'James Webb Space Telescope — seeing the earliest galaxies', icon: '🔭' },
  { year: 2022, name: 'DART Impact', org: 'NASA', type: 'science', desc: 'First planetary defense test — redirected asteroid Dimorphos', icon: '☄' },
  { year: 2022, name: 'Sgr A* Imaged', org: 'EHT', type: 'science', desc: 'First image of our own Milky Way black hole', icon: '🕳' },
  { year: 2024, name: 'Artemis Program', org: 'NASA', type: 'crewed', desc: 'Returning humans to the Moon — first woman and person of color', icon: '🌕' },
  { year: 2025, name: 'Europa Clipper', org: 'NASA', type: 'orbiter', desc: "Investigating Jupiter's moon Europa for habitability", icon: '🧊' },
]

const TYPE_COLORS = {
  satellite: '#6b7280',
  crewed: '#3b82f6',
  flyby: '#8b5cf6',
  lander: '#f59e0b',
  station: '#06b6d4',
  rover: '#ef4444',
  telescope: '#10b981',
  orbiter: '#ec4899',
  science: '#a855f7',
}

export default function MissionTimeline({ onClose }) {
  const [selectedType, setSelectedType] = useState('all')
  const scrollRef = useRef(null)

  const types = [...new Set(MISSIONS.map((m) => m.type))]
  const filtered = selectedType === 'all'
    ? MISSIONS
    : MISSIONS.filter((m) => m.type === selectedType)

  return (
    <div className="absolute left-4 top-20 bottom-4 w-[380px] z-20 flex flex-col">
      <div className="glass-panel rounded-2xl flex flex-col h-full animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-blue-400 tracking-wider">
              SPACE MISSIONS
            </h2>
            <p className="text-[9px] text-gray-500 mt-0.5">1957 — Present</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Type filters */}
        <div className="px-4 py-2 flex flex-wrap gap-1 shrink-0 border-b border-panel-border">
          <button
            onClick={() => setSelectedType('all')}
            className={`text-[8px] px-2 py-0.5 rounded-full cursor-pointer transition-all ${
              selectedType === 'all' ? 'bg-blue-400/20 text-blue-400 border border-blue-400/40' : 'glass-panel text-gray-500 hover:bg-white/5'
            }`}
          >
            ALL
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`text-[8px] px-2 py-0.5 rounded-full cursor-pointer capitalize transition-all ${
                selectedType === t ? 'bg-blue-400/20 text-blue-400 border border-blue-400/40' : 'glass-panel text-gray-500 hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />

            {filtered.map((mission, i) => (
              <div key={`${mission.name}-${i}`} className="relative pl-8 pb-4 group">
                {/* Dot */}
                <div
                  className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: TYPE_COLORS[mission.type] || '#6b7280',
                    backgroundColor: `${TYPE_COLORS[mission.type] || '#6b7280'}33`,
                  }}
                />

                {/* Content */}
                <div className="glass-panel rounded-lg p-2.5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{mission.icon}</span>
                        <span className="text-xs font-semibold text-white truncate">{mission.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-neon-cyan font-mono">{mission.year}</span>
                        <span className="text-[9px] text-gray-500">{mission.org}</span>
                        <span
                          className="text-[8px] px-1.5 py-0 rounded-full capitalize"
                          style={{
                            color: TYPE_COLORS[mission.type],
                            backgroundColor: `${TYPE_COLORS[mission.type]}20`,
                          }}
                        >
                          {mission.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                    {mission.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
