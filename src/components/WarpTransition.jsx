import { useState, useEffect, useRef } from 'react'

export default function WarpTransition({ active, onComplete }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (!active) { setPhase('idle'); return }
    setPhase('warp')

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const stars = Array.from({ length: 300 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 50 + 10,
      speed: Math.random() * 8 + 4,
      size: Math.random() * 1.5 + 0.5,
      hue: 180 + Math.random() * 60,
    }))

    let startTime = performance.now()
    const duration = 1500

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      ctx.fillStyle = `rgba(0, 0, 10, ${0.3 + progress * 0.3})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const speedMult = 1 + progress * 20

      stars.forEach((star) => {
        star.dist += star.speed * speedMult * 0.16
        if (star.dist > Math.max(canvas.width, canvas.height)) {
          star.dist = Math.random() * 20 + 5
        }

        const x = cx + Math.cos(star.angle) * star.dist
        const y = cy + Math.sin(star.angle) * star.dist

        // Streak length based on speed
        const streakLen = Math.min(star.dist * 0.15 * speedMult * 0.05, 80)
        const x2 = cx + Math.cos(star.angle) * (star.dist - streakLen)
        const y2 = cy + Math.sin(star.angle) * (star.dist - streakLen)

        const alpha = Math.min(star.dist / 100, 1) * (1 - progress * 0.3)
        ctx.strokeStyle = `hsla(${star.hue}, 80%, 70%, ${alpha})`
        ctx.lineWidth = star.size * (1 + progress * 2)
        ctx.beginPath()
        ctx.moveTo(x2, y2)
        ctx.lineTo(x, y)
        ctx.stroke()
      })

      // Center glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100 + progress * 200)
      grad.addColorStop(0, `rgba(0, 245, 255, ${0.1 * (1 - progress)})`)
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        // Flash white then fade
        ctx.fillStyle = `rgba(255, 255, 255, 0.3)`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setTimeout(() => {
          setPhase('fade')
          setTimeout(() => {
            setPhase('idle')
            onComplete?.()
          }, 400)
        }, 100)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [active, onComplete])

  if (phase === 'idle') return null

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 transition-opacity duration-400 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}
      style={{ zIndex: 95, pointerEvents: 'none' }}
    />
  )
}
