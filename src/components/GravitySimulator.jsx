import { useState, useRef, useEffect, useCallback } from 'react'
import planets from '../data/planets.json'

const BALL_RADIUS = 12
const DROP_HEIGHT = 280

export default function GravitySimulator({ onClose }) {
  const [selectedPlanets, setSelectedPlanets] = useState(['earth', 'mars', 'jupiter'])
  const [running, setRunning] = useState(false)
  const [ballPositions, setBallPositions] = useState({})
  const [times, setTimes] = useState({})
  const animRef = useRef(null)
  const startTimeRef = useRef(null)
  const velocitiesRef = useRef({})

  const reset = useCallback(() => {
    setRunning(false)
    setTimes({})
    const initial = {}
    selectedPlanets.forEach((id) => { initial[id] = 0 })
    setBallPositions(initial)
    velocitiesRef.current = {}
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [selectedPlanets])

  useEffect(() => {
    reset()
  }, [selectedPlanets, reset])

  const start = () => {
    reset()
    // Small timeout to let reset take effect
    setTimeout(() => {
      setRunning(true)
      startTimeRef.current = performance.now()
      velocitiesRef.current = {}
      selectedPlanets.forEach((id) => { velocitiesRef.current[id] = 0 })
    }, 50)
  }

  useEffect(() => {
    if (!running) return

    const finished = {}
    const finishTimes = {}

    const animate = (now) => {
      const dt = 1 / 60 // Fixed timestep for consistency
      const newPositions = {}
      let allDone = true

      selectedPlanets.forEach((id) => {
        if (finished[id]) {
          newPositions[id] = DROP_HEIGHT
          return
        }

        const planet = planets.find((p) => p.id === id)
        // Scale gravity for visual effect (real gravity * 8 pixels per m/s²)
        const g = planet.gravity * 8
        velocitiesRef.current[id] = (velocitiesRef.current[id] || 0) + g * dt
        const pos = (ballPositions[id] || 0) + velocitiesRef.current[id] * dt

        if (pos >= DROP_HEIGHT) {
          newPositions[id] = DROP_HEIGHT
          finished[id] = true
          if (!finishTimes[id]) {
            finishTimes[id] = ((now - startTimeRef.current) / 1000).toFixed(2)
          }
        } else {
          newPositions[id] = pos
          allDone = false
        }
      })

      setBallPositions(newPositions)
      if (Object.keys(finishTimes).length > 0) {
        setTimes((prev) => ({ ...prev, ...finishTimes }))
      }

      if (!allDone) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setRunning(false)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [running, selectedPlanets]) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlanet = (id) => {
    setSelectedPlanets((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 4) return prev // max 4
      return [...prev, id]
    })
  }

  const colWidth = Math.min(70, 260 / Math.max(selectedPlanets.length, 1))

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-20 w-[400px] z-20">
      <div className="glass-panel rounded-2xl p-4 animate-pulse-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-neon-cyan tracking-wider">
              GRAVITY SIMULATOR
            </h2>
            <p className="text-[9px] text-gray-500 mt-0.5">Compare gravitational acceleration</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Planet selector */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {planets.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlanet(p.id)}
              className={`text-[9px] px-2 py-1 rounded-full cursor-pointer transition-all ${
                selectedPlanets.includes(p.id)
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                  : 'glass-panel text-gray-500 hover:bg-white/5'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Drop visualization */}
        <div className="glass-panel rounded-xl p-3 mb-3 relative" style={{ height: DROP_HEIGHT + 60 }}>
          <div className="flex justify-around h-full">
            {selectedPlanets.map((id) => {
              const planet = planets.find((p) => p.id === id)
              const pos = ballPositions[id] || 0

              return (
                <div key={id} className="flex flex-col items-center relative" style={{ width: colWidth }}>
                  {/* Planet label */}
                  <p className="text-[9px] text-gray-400 mb-1 truncate w-full text-center">{planet.name}</p>
                  <p className="text-[8px] text-gray-600 mb-2">{planet.gravity} m/s²</p>

                  {/* Track */}
                  <div className="relative flex-1 w-0.5 bg-white/10 rounded-full">
                    {/* Ball */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 rounded-full transition-none"
                      style={{
                        width: BALL_RADIUS * 2,
                        height: BALL_RADIUS * 2,
                        top: pos,
                        backgroundColor: planet.color,
                        boxShadow: `0 0 8px ${planet.color}`,
                      }}
                    />
                  </div>

                  {/* Ground line */}
                  <div className="w-full h-px bg-white/20 mt-1" />

                  {/* Time */}
                  {times[id] && (
                    <p className="text-[10px] text-neon-cyan font-mono mt-1">{times[id]}s</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={running || selectedPlanets.length === 0}
            className="flex-1 glass-panel rounded-lg px-4 py-2 text-xs text-neon-cyan hover:bg-neon-cyan/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-neon-cyan/30 font-[family-name:var(--font-orbitron)] tracking-wider"
          >
            DROP
          </button>
          <button
            onClick={reset}
            className="glass-panel rounded-lg px-4 py-2 text-xs text-gray-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            RESET
          </button>
        </div>

        <p className="text-[8px] text-gray-600 text-center mt-2">
          Select up to 4 planets &middot; Watch how gravity differs
        </p>
      </div>
    </div>
  )
}
