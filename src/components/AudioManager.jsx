import { useState, useRef, useEffect, useCallback } from 'react'

// Generate ambient space sounds using Web Audio API
function createSpaceAmbience(audioCtx) {
  const masterGain = audioCtx.createGain()
  masterGain.gain.value = 0.15

  // Deep space drone (low frequency oscillators)
  const drone1 = audioCtx.createOscillator()
  drone1.type = 'sine'
  drone1.frequency.value = 55
  const drone1Gain = audioCtx.createGain()
  drone1Gain.gain.value = 0.3
  drone1.connect(drone1Gain).connect(masterGain)

  const drone2 = audioCtx.createOscillator()
  drone2.type = 'sine'
  drone2.frequency.value = 82.5
  const drone2Gain = audioCtx.createGain()
  drone2Gain.gain.value = 0.15
  drone2.connect(drone2Gain).connect(masterGain)

  // Ethereal pad (detuned oscillators)
  const pad1 = audioCtx.createOscillator()
  pad1.type = 'triangle'
  pad1.frequency.value = 220
  const pad1Gain = audioCtx.createGain()
  pad1Gain.gain.value = 0.04
  pad1.connect(pad1Gain).connect(masterGain)

  const pad2 = audioCtx.createOscillator()
  pad2.type = 'triangle'
  pad2.frequency.value = 223
  const pad2Gain = audioCtx.createGain()
  pad2Gain.gain.value = 0.04
  pad2.connect(pad2Gain).connect(masterGain)

  // Very gentle noise for "cosmic hiss"
  const bufferSize = audioCtx.sampleRate * 2
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.01
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  const noiseFilter = audioCtx.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 300
  noise.connect(noiseFilter).connect(masterGain)

  // LFO to modulate drone for movement feeling
  const lfo = audioCtx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.05
  const lfoGain = audioCtx.createGain()
  lfoGain.gain.value = 5
  lfo.connect(lfoGain).connect(drone1.frequency)

  const startAll = () => {
    drone1.start()
    drone2.start()
    pad1.start()
    pad2.start()
    noise.start()
    lfo.start()
  }

  return { masterGain, startAll }
}

export default function AudioManager() {
  const [muted, setMuted] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const audioCtxRef = useRef(null)
  const ambienceRef = useRef(null)

  const toggleAudio = useCallback(() => {
    if (!initialized) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx
      const ambience = createSpaceAmbience(ctx)
      ambience.masterGain.connect(ctx.destination)
      ambience.startAll()
      ambienceRef.current = ambience
      setInitialized(true)
      setMuted(false)
    } else {
      const newMuted = !muted
      setMuted(newMuted)
      if (ambienceRef.current) {
        ambienceRef.current.masterGain.gain.linearRampToValueAtTime(
          newMuted ? 0 : 0.15,
          audioCtxRef.current.currentTime + 0.5
        )
      }
    }
  }, [initialized, muted])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  return (
    <button
      onClick={toggleAudio}
      className="absolute bottom-4 right-4 z-20 glass-panel rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group"
      title={muted ? 'Enable ambient sound' : 'Mute'}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-neon-cyan transition-colors">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neon-cyan">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  )
}
