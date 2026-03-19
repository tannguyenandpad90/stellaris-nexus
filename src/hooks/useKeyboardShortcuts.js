import { useEffect } from 'react'

export default function useKeyboardShortcuts({ onScaleChange, onEscape, onTogglePanel, currentScale }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

      switch (e.key) {
        case '1': onScaleChange('solar'); break
        case '2': onScaleChange('galaxy'); break
        case '3': onScaleChange('deepspace'); break
        case 'Escape': onEscape(); break
        case 'i': case 'I': onTogglePanel('iss'); break
        case 'w': case 'W': onTogglePanel('weather'); break
        case 'n': case 'N': onTogglePanel('media'); break
        case '?': onTogglePanel('chat'); break
        case 'a': case 'A': if (currentScale === 'solar') onTogglePanel('asteroids'); break
        case 'm': case 'M': if (currentScale === 'solar') onTogglePanel('mars'); break
        case 't': case 'T': if (currentScale === 'solar') onTogglePanel('travel'); break
        case 'g': case 'G': if (currentScale === 'solar') onTogglePanel('gravity'); break
        case 'e': case 'E': if (currentScale !== 'solar') onTogglePanel('exoplanets'); break
        case 's': case 'S': onTogglePanel('sky'); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onScaleChange, onEscape, onTogglePanel, currentScale])
}
