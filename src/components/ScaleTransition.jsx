import { useState, useEffect, useCallback } from 'react'
import WarpTransition from './WarpTransition'

const MODE_TEXT = {
  solar: { title: 'SOLAR SYSTEM', subtitle: 'Our cosmic neighborhood', color: 'text-neon-orange' },
  galaxy: { title: 'MILKY WAY', subtitle: '100 billion stars', color: 'text-neon-purple' },
  deepspace: { title: 'DEEP SPACE', subtitle: 'Beyond the galaxy', color: 'text-neon-cyan' },
}

export default function ScaleTransition({ scale, prevScale }) {
  const [warpActive, setWarpActive] = useState(false)
  const [showText, setShowText] = useState(false)
  const [textPhase, setTextPhase] = useState('idle')

  useEffect(() => {
    if (prevScale && prevScale !== scale) {
      setWarpActive(true)
    }
  }, [scale, prevScale])

  const handleWarpComplete = useCallback(() => {
    setWarpActive(false)
    setShowText(true)
    setTextPhase('show')
    const t1 = setTimeout(() => setTextPhase('out'), 800)
    const t2 = setTimeout(() => { setTextPhase('idle'); setShowText(false) }, 1300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const info = MODE_TEXT[scale] || MODE_TEXT.solar

  return (
    <>
      <WarpTransition active={warpActive} onComplete={handleWarpComplete} />

      {showText && (
        <div
          className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${textPhase === 'show' ? 'opacity-100' : 'opacity-0'}`}
          style={{ zIndex: 96 }}
        >
          <div className={`relative text-center transition-all duration-500 ${textPhase === 'show' ? 'scale-100' : 'scale-90'}`}>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-4" />
            <h2 className={`font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] ${info.color}`}>
              {info.title}
            </h2>
            <p className="text-gray-400 text-sm tracking-[0.3em] uppercase mt-2">{info.subtitle}</p>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-4" />
          </div>
        </div>
      )}
    </>
  )
}
