import { useState, useRef, useEffect, useCallback } from 'react'

// Musical scales (Hz)
const SCALES = {
  solar: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63],
  galaxy: [130.81, 155.56, 164.81, 196.00, 233.08, 261.63, 311.13, 329.63],
  deepspace: [130.81, 138.59, 164.81, 185.00, 207.65, 233.08, 261.63, 277.18],
}

const MODE_CONFIGS = {
  solar: {
    droneFreqs: [55, 82.41, 110],
    droneVol: 0.18,
    padFreqs: [261.63, 329.63, 392.00],
    padVol: 0.025,
    noiseVol: 0.004,
    noiseFreq: 350,
    melodyScale: 'solar',
    melodyInterval: 3.0,
    melodyDensity: 0.3,
    melodyVol: 0.02,
    lfoRate: 0.04,
  },
  galaxy: {
    droneFreqs: [41.2, 61.74, 82.41],
    droneVol: 0.2,
    padFreqs: [196.00, 233.08, 311.13],
    padVol: 0.02,
    noiseVol: 0.006,
    noiseFreq: 200,
    melodyScale: 'galaxy',
    melodyInterval: 4.0,
    melodyDensity: 0.2,
    melodyVol: 0.015,
    lfoRate: 0.025,
  },
  deepspace: {
    droneFreqs: [32.7, 49.0, 65.41],
    droneVol: 0.22,
    padFreqs: [138.59, 164.81, 207.65],
    padVol: 0.018,
    noiseVol: 0.008,
    noiseFreq: 150,
    melodyScale: 'deepspace',
    melodyInterval: 5.0,
    melodyDensity: 0.15,
    melodyVol: 0.012,
    lfoRate: 0.015,
  },
}

function createSoundscape(ctx, mode) {
  const cfg = MODE_CONFIGS[mode] || MODE_CONFIGS.solar
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)

  // Connect master → destination
  master.connect(ctx.destination)

  // === DRONE layer ===
  const droneGain = ctx.createGain()
  droneGain.gain.setValueAtTime(cfg.droneVol, ctx.currentTime)
  droneGain.connect(master)

  const drones = cfg.droneFreqs.map((freq) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime)
    osc.connect(droneGain)
    return osc
  })

  // LFO modulation on first drone
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.setValueAtTime(cfg.lfoRate, ctx.currentTime)
  const lfoGain = ctx.createGain()
  lfoGain.gain.setValueAtTime(4, ctx.currentTime)
  lfo.connect(lfoGain)
  lfoGain.connect(drones[0].frequency)

  // === PAD layer ===
  const padGain = ctx.createGain()
  padGain.gain.setValueAtTime(cfg.padVol, ctx.currentTime)
  padGain.connect(master)

  const pads = cfg.padFreqs.map((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.detune.setValueAtTime((i % 2 === 0 ? 5 : -5), ctx.currentTime)
    osc.connect(padGain)
    return osc
  })

  // === NOISE layer ===
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(cfg.noiseVol, ctx.currentTime)
  noiseGain.connect(master)

  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const noiseData = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    noiseData[i] = (Math.random() * 2 - 1)
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.setValueAtTime(cfg.noiseFreq, ctx.currentTime)
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)

  // === MELODY layer (scheduled notes) ===
  const melodyGain = ctx.createGain()
  melodyGain.gain.setValueAtTime(cfg.melodyVol, ctx.currentTime)
  melodyGain.connect(master)

  const scale = SCALES[cfg.melodyScale]
  let melodyScheduledUntil = 0
  let seed = mode === 'solar' ? 12345 : mode === 'galaxy' ? 67890 : 99999

  function nextRand() {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  function scheduleNotes(startTime) {
    for (let i = 0; i < 20; i++) {
      const noteTime = startTime + i * cfg.melodyInterval
      if (nextRand() > cfg.melodyDensity) continue

      const freq = scale[Math.floor(nextRand() * scale.length)]
      const octave = nextRand() > 0.5 ? 2 : 1
      const dur = 1.5 + nextRand() * 2.5

      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq * octave, noteTime)

      const env = ctx.createGain()
      env.gain.setValueAtTime(0.001, noteTime)
      env.gain.linearRampToValueAtTime(1.0, noteTime + 0.4)
      env.gain.exponentialRampToValueAtTime(0.001, noteTime + dur)

      osc.connect(env)
      env.connect(melodyGain)
      osc.start(noteTime)
      osc.stop(noteTime + dur + 0.1)

      melodyScheduledUntil = Math.max(melodyScheduledUntil, noteTime + dur)
    }
  }

  let melodyInterval = null

  return {
    master,
    start() {
      drones.forEach((o) => o.start())
      lfo.start()
      pads.forEach((o) => o.start())
      noise.start()
      scheduleNotes(ctx.currentTime + 1)
      melodyInterval = setInterval(() => {
        if (ctx.currentTime > melodyScheduledUntil - 15) {
          scheduleNotes(melodyScheduledUntil)
        }
      }, 5000)
    },
    fadeIn(dur = 2) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.25, ctx.currentTime + dur)
    },
    fadeOut(dur = 1.5) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + dur)
    },
    cleanup() {
      if (melodyInterval) clearInterval(melodyInterval)
    },
  }
}

export default function AudioManager({ scale = 'solar' }) {
  const [playing, setPlaying] = useState(false)
  const ctxRef = useRef(null)
  const scapesRef = useRef({})
  const modeRef = useRef(null)

  const getMode = useCallback((s) => (s === 'deepspace' ? 'deepspace' : s), [])

  // Crossfade when scale changes
  useEffect(() => {
    if (!playing || !ctxRef.current) return
    const ctx = ctxRef.current
    const newMode = getMode(scale)
    const oldMode = modeRef.current
    if (oldMode === newMode) return

    // Fade out old
    if (oldMode && scapesRef.current[oldMode]) {
      scapesRef.current[oldMode].fadeOut(1.5)
    }

    // Create + fade in new
    if (!scapesRef.current[newMode]) {
      const s = createSoundscape(ctx, newMode)
      s.start()
      scapesRef.current[newMode] = s
    }
    scapesRef.current[newMode].fadeIn(2)
    modeRef.current = newMode
  }, [scale, playing, getMode])

  const toggle = useCallback(() => {
    if (!playing) {
      // First play or resume
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      const mode = getMode(scale)
      if (!scapesRef.current[mode]) {
        const s = createSoundscape(ctx, mode)
        s.start()
        scapesRef.current[mode] = s
      }
      scapesRef.current[mode].fadeIn(1.5)
      modeRef.current = mode
      setPlaying(true)
    } else {
      // Mute all
      Object.values(scapesRef.current).forEach((s) => s.fadeOut(0.8))
      setPlaying(false)
    }
  }, [playing, scale, getMode])

  useEffect(() => {
    return () => {
      Object.values(scapesRef.current).forEach((s) => s.cleanup())
      if (ctxRef.current) ctxRef.current.close()
    }
  }, [])

  const modeLabel = scale === 'solar' ? 'Solar' : scale === 'galaxy' ? 'Galaxy' : 'Deep'

  return (
    <button
      onClick={toggle}
      className="absolute bottom-4 right-4 z-20 glass-panel rounded-full h-10 flex items-center gap-2 px-3 hover:bg-white/10 transition-colors cursor-pointer group"
      title={playing ? `Playing: ${modeLabel} — Click to mute` : 'Enable ambient music'}
    >
      {!playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-neon-cyan transition-colors">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neon-cyan">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          {/* Animated bars */}
          <div className="flex items-end gap-0.5 h-3">
            <div className="w-0.5 bg-neon-cyan rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }} />
            <div className="w-0.5 bg-neon-cyan rounded-full animate-pulse" style={{ height: '80%', animationDelay: '200ms' }} />
            <div className="w-0.5 bg-neon-cyan rounded-full animate-pulse" style={{ height: '50%', animationDelay: '400ms' }} />
            <div className="w-0.5 bg-neon-cyan rounded-full animate-pulse" style={{ height: '90%', animationDelay: '100ms' }} />
          </div>
        </>
      )}
    </button>
  )
}
