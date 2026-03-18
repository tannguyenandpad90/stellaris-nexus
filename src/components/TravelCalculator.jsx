import { useState, useMemo } from 'react'

const VEHICLES = [
  { id: 'boeing', name: 'Boeing 747', speed: 885, unit: 'km/h', icon: 'plane' },
  { id: 'spacecraft', name: 'New Horizons', speed: 58536, unit: 'km/h', icon: 'rocket' },
  { id: 'light', name: 'Speed of Light', speed: 1079252849, unit: 'km/h', icon: 'bolt' },
]

function formatTime(hours) {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} minutes`
  }
  if (hours < 24) return `${hours.toFixed(1)} hours`
  const days = hours / 24
  if (days < 365) return `${days.toFixed(1)} days`
  const years = days / 365.25
  if (years < 1000) return `${years.toFixed(1)} years`
  if (years < 1000000) return `${(years / 1000).toFixed(1)}K years`
  return `${(years / 1000000).toFixed(1)}M years`
}

export default function TravelCalculator({ planets, onClose }) {
  const [from, setFrom] = useState('earth')
  const [to, setTo] = useState('mars')
  const [vehicle, setVehicle] = useState('spacecraft')

  const result = useMemo(() => {
    const fromPlanet = planets.find(p => p.id === from)
    const toPlanet = planets.find(p => p.id === to)
    if (!fromPlanet || !toPlanet) return null

    const distance = Math.abs(fromPlanet.distanceFromSunKm - toPlanet.distanceFromSunKm)
    const v = VEHICLES.find(v => v.id === vehicle)
    const hours = distance / v.speed

    return { distance, hours, formatted: formatTime(hours), vehicle: v }
  }, [from, to, vehicle, planets])

  return (
    <div className="absolute right-4 top-20 w-80 z-20">
      <div className="glass-panel rounded-2xl p-5 animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-orange text-glow-orange tracking-wider">
            TRAVEL CALCULATOR
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* From */}
        <div className="mb-3">
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">From</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full glass-panel rounded-lg px-3 py-2 text-sm text-white bg-transparent border border-panel-border outline-none focus:border-neon-cyan"
          >
            {planets.map(p => (
              <option key={p.id} value={p.id} className="bg-space-dark">{p.name}</option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div className="text-center my-1">
          <button
            onClick={() => { setFrom(to); setTo(from) }}
            className="text-neon-cyan hover:text-white transition-colors text-lg cursor-pointer"
          >
            ↕
          </button>
        </div>

        {/* To */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">To</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full glass-panel rounded-lg px-3 py-2 text-sm text-white bg-transparent border border-panel-border outline-none focus:border-neon-cyan"
          >
            {planets.map(p => (
              <option key={p.id} value={p.id} className="bg-space-dark">{p.name}</option>
            ))}
          </select>
        </div>

        {/* Vehicle Selection */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Vehicle</label>
          <div className="flex flex-col gap-2">
            {VEHICLES.map(v => (
              <button
                key={v.id}
                onClick={() => setVehicle(v.id)}
                className={`glass-panel rounded-lg px-3 py-2 text-left text-sm transition-all cursor-pointer ${
                  vehicle === v.id
                    ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <span className="font-semibold">{v.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {v.speed.toLocaleString()} {v.unit}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && from !== to && (
          <div className="glass-panel rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Distance</p>
            <p className="text-lg font-bold text-white font-mono">
              {result.distance.toLocaleString()} km
            </p>
            <div className="w-16 h-px bg-neon-cyan/30 mx-auto my-3"></div>
            <p className="text-xs text-gray-400 mb-1">Travel Time ({result.vehicle.name})</p>
            <p className="text-2xl font-bold text-neon-cyan text-glow-cyan font-[family-name:var(--font-orbitron)]">
              {result.formatted}
            </p>
          </div>
        )}

        {from === to && (
          <div className="glass-panel rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">You are already here!</p>
          </div>
        )}
      </div>
    </div>
  )
}
