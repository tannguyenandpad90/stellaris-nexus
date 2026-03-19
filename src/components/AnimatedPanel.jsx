import { useState, useEffect, useRef } from 'react'

const SLIDE_MAP = {
  left: { from: 'translate-x-[-110%]', to: 'translate-x-0' },
  right: { from: 'translate-x-[110%]', to: 'translate-x-0' },
  center: { from: 'scale-90 opacity-0', to: 'scale-100 opacity-100' },
  bottom: { from: 'translate-y-[110%]', to: 'translate-y-0' },
}

export default function AnimatedPanel({ children, show, direction = 'left', onExited }) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (show) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else if (mounted) {
      setVisible(false)
      timeoutRef.current = setTimeout(() => {
        setMounted(false)
        onExited?.()
      }, 300)
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [show, mounted, onExited])

  if (!mounted) return null

  const slide = SLIDE_MAP[direction] || SLIDE_MAP.left

  return (
    <div className={`transition-all duration-300 ease-out ${visible ? slide.to : slide.from}`}>
      {children}
    </div>
  )
}
