import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  'Initializing quantum drive...',
  'Calibrating star charts...',
  'Scanning asteroid fields...',
  'Establishing orbital trajectories...',
  'Syncing NASA telemetry...',
  'Rendering celestial bodies...',
  'Activating Stellaris Nexus...',
]

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [messageIdx, setMessageIdx] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 12 + 3
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => setFadeOut(true), 400)
          setTimeout(() => onComplete(), 1200)
          return 100
        }
        return next
      })
    }, 200)
    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const idx = Math.min(
      Math.floor((progress / 100) * LOADING_MESSAGES.length),
      LOADING_MESSAGES.length - 1
    )
    setMessageIdx(idx)
  }, [progress])

  return (
    <div
      className={`fixed inset-0 z-[100] bg-space-dark flex flex-col items-center justify-center transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Starfield dots */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative mb-12">
        <h1 className="font-[family-name:var(--font-orbitron)] text-5xl font-black tracking-[0.3em] text-glow-cyan text-neon-cyan">
          STELLARIS
        </h1>
        <p className="font-[family-name:var(--font-orbitron)] text-lg tracking-[0.5em] text-center text-neon-orange text-glow-orange mt-2">
          NEXUS
        </p>
      </div>

      {/* Orbital spinner */}
      <div className="relative w-24 h-24 mb-10">
        <div
          className="absolute inset-0 border border-neon-cyan/30 rounded-full"
          style={{ animation: 'spin 3s linear infinite' }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_8px_var(--color-neon-cyan)]" />
        </div>
        <div
          className="absolute inset-3 border border-neon-purple/30 rounded-full"
          style={{ animation: 'spin 2s linear infinite reverse' }}
        >
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neon-purple rounded-full shadow-[0_0_8px_var(--color-neon-purple)]" />
        </div>
        <div
          className="absolute inset-6 border border-neon-orange/30 rounded-full"
          style={{ animation: 'spin 1.5s linear infinite' }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-orange rounded-full shadow-[0_0_6px_var(--color-neon-orange)]" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-72">
        <div className="h-[2px] bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-orange rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[11px] text-gray-500 tracking-wider">
            {LOADING_MESSAGES[messageIdx]}
          </p>
          <span className="text-[11px] text-neon-cyan font-mono">
            {Math.min(Math.floor(progress), 100)}%
          </span>
        </div>
      </div>

      {/* Bottom tagline */}
      <p className="absolute bottom-8 text-[10px] text-gray-600 tracking-widest uppercase">
        Powered by NASA Open Data &middot; Three.js &middot; Claude AI
      </p>
    </div>
  )
}
