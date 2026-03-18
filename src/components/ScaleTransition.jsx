import { useState, useEffect } from 'react'

const MODE_TEXT = {
  solar: { title: 'SOLAR SYSTEM', subtitle: 'Our cosmic neighborhood', color: 'text-neon-orange' },
  galaxy: { title: 'MILKY WAY', subtitle: '100 billion stars', color: 'text-neon-purple' },
  deepspace: { title: 'DEEP SPACE', subtitle: 'Beyond the galaxy', color: 'text-neon-cyan' },
}

export default function ScaleTransition({ scale, prevScale }) {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | in | show | out

  useEffect(() => {
    if (prevScale && prevScale !== scale) {
      setVisible(true)
      setPhase('in')
      // Phase timeline: fade in (300ms) → show (800ms) → fade out (500ms)
      const t1 = setTimeout(() => setPhase('show'), 300)
      const t2 = setTimeout(() => setPhase('out'), 1100)
      const t3 = setTimeout(() => { setPhase('idle'); setVisible(false) }, 1600)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [scale, prevScale])

  if (!visible) return null

  const info = MODE_TEXT[scale] || MODE_TEXT.solar

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        phase === 'in' ? 'opacity-100' : phase === 'show' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background flash */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
        phase === 'in' ? 'opacity-70' : phase === 'show' ? 'opacity-50' : 'opacity-0'
      }`} />

      {/* Text */}
      <div className={`relative text-center transition-all duration-500 ${
        phase === 'show' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      }`}>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-4" />
        <h2 className={`font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] ${info.color}`}>
          {info.title}
        </h2>
        <p className="text-gray-400 text-sm tracking-[0.3em] uppercase mt-2">{info.subtitle}</p>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-4" />
      </div>
    </div>
  )
}
