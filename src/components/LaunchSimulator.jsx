import { useState, useMemo } from 'react'
import planets from '../data/planets.json'

const PROPULSION = [
  { id: 'chemical', name: 'Chemical Rocket', speed: 40000, desc: 'Traditional rockets (Saturn V, Falcon 9)', emoji: '🚀' },
  { id: 'ion', name: 'Ion Drive', speed: 90000, desc: 'Electric propulsion (Dawn, SMART-1)', emoji: '⚡' },
  { id: 'nuclear', name: 'Nuclear Thermal', speed: 200000, desc: 'Theoretical nuclear-heated propellant', emoji: '☢' },
  { id: 'solar_sail', name: 'Solar Sail', speed: 300000, desc: 'Propelled by photon pressure (IKAROS)', emoji: '🪁' },
  { id: 'fusion', name: 'Fusion Drive', speed: 1000000, desc: 'Theoretical fusion-powered engine', emoji: '💫' },
  { id: 'antimatter', name: 'Antimatter', speed: 100000000, desc: 'Theoretical matter-antimatter annihilation', emoji: '✨' },
]

function formatDuration(hours) {
  if (hours < 24) return `${hours.toFixed(1)} hours`
  const days = hours / 24
  if (days < 365) return `${days.toFixed(1)} days`
  const years = days / 365.25
  if (years < 1000) return `${years.toFixed(1)} years`
  if (years < 1e6) return `${(years / 1000).toFixed(1)}K years`
  return `${(years / 1e6).toFixed(1)}M years`
}

// Simplified Hohmann transfer orbit calculation
function hohmannTransfer(r1Km, r2Km) {
  const a = (r1Km + r2Km) / 2 // Semi-major axis of transfer orbit
  const period = 2 * Math.PI * Math.sqrt(a * a * a / (1.327e11)) // Kepler's 3rd (hours)
  return period / 2 // Half the period for transfer
}

export default function LaunchSimulator({ onClose }) {
  const [from, setFrom] = useState('earth')
  const [to, setTo] = useState('mars')
  const [propulsion, setPropulsion] = useState('chemical')

  const result = useMemo(() => {
    const fromP = planets.find(p => p.id === from)
    const toP = planets.find(p => p.id === to)
    if (!fromP || !toP || from === to) return null

    const distance = Math.abs(fromP.distanceFromSunKm - toP.distanceFromSunKm)
    const engine = PROPULSION.find(p => p.id === propulsion)
    const directHours = distance / engine.speed
    const hohmannHours = hohmannTransfer(fromP.distanceFromSunKm, toP.distanceFromSunKm)

    // Delta-V approximation (simplified)
    const mu = 1.327e11 // Sun's gravitational parameter (km³/h²)
    const r1 = fromP.distanceFromSunKm
    const r2 = toP.distanceFromSunKm
    const a = (r1 + r2) / 2
    const v1 = Math.sqrt(mu / r1)
    const vt1 = Math.sqrt(mu * (2 / r1 - 1 / a))
    const deltaV1 = Math.abs(vt1 - v1)
    const v2 = Math.sqrt(mu / r2)
    const vt2 = Math.sqrt(mu * (2 / r2 - 1 / a))
    const deltaV2 = Math.abs(v2 - vt2)
    const totalDeltaV = (deltaV1 + deltaV2) * 3600 // to km/s... approximation

    return {
      distance,
      directTime: formatDuration(directHours),
      hohmannTime: formatDuration(hohmannHours),
      engine,
      deltaV: totalDeltaV.toFixed(1),
    }
  }, [from, to, propulsion])

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-20 w-[420px] z-20">
      <div className="glass-panel rounded-2xl p-5 animate-pulse-glow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-cyan text-glow-cyan tracking-wider">
              LAUNCH SIMULATOR
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Plan your interplanetary mission</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Route */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end mb-4">
          <div>
            <label className="text-[10px] text-gray-400 uppercase block mb-1">Launch From</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full glass-panel rounded-lg px-2 py-1.5 text-xs text-white bg-transparent border border-panel-border outline-none">
              {planets.map(p => <option key={p.id} value={p.id} className="bg-space-dark">{p.name}</option>)}
            </select>
          </div>
          <button onClick={() => { setFrom(to); setTo(from) }} className="text-neon-cyan text-lg cursor-pointer mb-1">↔</button>
          <div>
            <label className="text-[10px] text-gray-400 uppercase block mb-1">Destination</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full glass-panel rounded-lg px-2 py-1.5 text-xs text-white bg-transparent border border-panel-border outline-none">
              {planets.map(p => <option key={p.id} value={p.id} className="bg-space-dark">{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Propulsion */}
        <div className="mb-4">
          <label className="text-[10px] text-gray-400 uppercase block mb-2">Propulsion System</label>
          <div className="grid grid-cols-3 gap-1.5">
            {PROPULSION.map((p) => (
              <button key={p.id} onClick={() => setPropulsion(p.id)}
                className={`glass-panel rounded-lg p-2 text-center cursor-pointer transition-all ${propulsion === p.id ? 'border-neon-cyan/50 bg-neon-cyan/10' : 'hover:bg-white/5'}`}>
                <div className="text-lg">{p.emoji}</div>
                <p className="text-[9px] text-white font-semibold mt-0.5">{p.name}</p>
                <p className="text-[8px] text-gray-500">{(p.speed).toLocaleString()} km/h</p>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Distance</p>
                <p className="text-sm text-white font-mono">{result.distance.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Approx. ΔV</p>
                <p className="text-sm text-white font-mono">{result.deltaV} km/s</p>
              </div>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-[9px] text-gray-500 uppercase">Direct Flight ({result.engine.name})</p>
              <p className="text-xl font-bold text-neon-cyan text-glow-cyan font-[family-name:var(--font-orbitron)]">{result.directTime}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase">Hohmann Transfer Orbit</p>
              <p className="text-lg font-bold text-neon-orange font-mono">{result.hohmannTime}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">Energy-efficient elliptical path using gravity</p>
            </div>
          </div>
        )}

        {from === to && (
          <div className="glass-panel rounded-xl p-4 text-center text-gray-400 text-sm">You are already here!</div>
        )}
      </div>
    </div>
  )
}
