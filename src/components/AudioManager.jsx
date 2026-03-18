import { useState, useRef, useEffect, useCallback } from 'react'

// Seeded random for deterministic melodies
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Musical scales (frequencies in Hz)
const SCALES = {
  solar: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63], // C major (warm)
  galaxy: [130.81, 155.56, 164.81, 196.00, 233.08, 261.63, 311.13, 329.63], // C minor pentatonic (mysterious)
  deepspace: [130.81, 138.59, 164.81, 185.00, 207.65, 233.08, 261.63, 277.18], // Phrygian (dark, eerie)
}

function createLayer(ctx, type, config) {
  const gain = ctx.createGain()
  gain.gain.value = 0

  if (type === 'drone') {
    const oscs = config.frequencies.map((freq) => {
      const osc = ctx.createOscillator()
      osc.type = config.waveform || 'sine'
      osc.frequency.value = freq
      // Detune slightly for richness
      osc.detune.value = (Math.random() - 0.5) * config.detune
      const oscGain = ctx.createGain()
      oscGain.gain.value = config.volume || 0.3
      osc.connect(oscGain).connect(gain)
      return osc
    })

    // LFO for slow movement
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = config.lfoRate || 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = config.lfoDepth || 3
    lfo.connect(lfoGain).connect(oscs[0].frequency)

    return {
      gain,
      start: () => { oscs.forEach((o) => o.start()); lfo.start() },
      stop: () => { oscs.forEach((o) => o.stop()); lfo.stop() },
    }
  }

  if (type === 'pad') {
    const oscs = config.frequencies.map((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      osc.detune.value = (i % 2 === 0 ? 1 : -1) * (config.detune || 4)
      const oscGain = ctx.createGain()
      oscGain.gain.value = config.volume || 0.05
      osc.connect(oscGain).connect(gain)
      return osc
    })

    return {
      gain,
      start: () => oscs.forEach((o) => o.start()),
      stop: () => oscs.forEach((o) => o.stop()),
    }
  }

  if (type === 'noise') {
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (config.amplitude || 0.008)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = config.filterType || 'lowpass'
    filter.frequency.value = config.filterFreq || 400
    filter.Q.value = config.filterQ || 1
    noise.connect(filter).connect(gain)

    return {
      gain,
      start: () => noise.start(),
      stop: () => noise.stop(),
    }
  }

  if (type === 'melody') {
    // Generative melody using scheduled oscillators
    const scale = config.scale || SCALES.solar
    const rng = seededRandom(config.seed || 42)
    let scheduledUntil = 0

    const scheduleNotes = (startTime) => {
      for (let i = 0; i < 16; i++) {
        const noteTime = startTime + i * (config.noteInterval || 2.5)
        if (rng() > (config.density || 0.35)) continue // Skip some notes

        const freq = scale[Math.floor(rng() * scale.length)]
        const octave = rng() > 0.5 ? 2 : 1
        const duration = (config.noteDuration || 1.8) + rng() * 1.5

        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq * octave

        const noteGain = ctx.createGain()
        noteGain.gain.setValueAtTime(0, noteTime)
        noteGain.gain.linearRampToValueAtTime(config.volume || 0.03, noteTime + 0.3)
        noteGain.gain.linearRampToValueAtTime(0, noteTime + duration)

        osc.connect(noteGain).connect(gain)
        osc.start(noteTime)
        osc.stop(noteTime + duration + 0.1)

        scheduledUntil = Math.max(scheduledUntil, noteTime + duration)
      }
    }

    // Re-schedule periodically
    let intervalId = null

    return {
      gain,
      start: () => {
        scheduleNotes(ctx.currentTime + 0.5)
        intervalId = setInterval(() => {
          if (ctx.currentTime > scheduledUntil - 10) {
            scheduleNotes(scheduledUntil)
          }
        }, 5000)
      },
      stop: () => { if (intervalId) clearInterval(intervalId) },
    }
  }

  return { gain, start: () => {}, stop: () => {} }
}

// Create the full soundscape for a given mode
function createSoundscape(ctx, mode) {
  const master = ctx.createGain()
  master.gain.value = 0

  // Reverb via convolution approximation (feedback delay)
  const delay = ctx.createDelay(1)
  delay.delayTime.value = 0.4
  const feedback = ctx.createGain()
  feedback.gain.value = 0.3
  const reverbFilter = ctx.createBiquadFilter()
  reverbFilter.type = 'lowpass'
  reverbFilter.frequency.value = 2000
  master.connect(delay)
  delay.connect(feedback).connect(reverbFilter).connect(delay)
  reverbFilter.connect(ctx.destination)
  master.connect(ctx.destination)

  const layers = []

  if (mode === 'solar') {
    layers.push(createLayer(ctx, 'drone', {
      frequencies: [55, 82.41, 110],
      waveform: 'sine',
      detune: 6,
      volume: 0.25,
      lfoRate: 0.04,
      lfoDepth: 3,
    }))
    layers.push(createLayer(ctx, 'pad', {
      frequencies: [261.63, 329.63, 392.00],
      detune: 5,
      volume: 0.035,
    }))
    layers.push(createLayer(ctx, 'noise', {
      amplitude: 0.006,
      filterFreq: 350,
    }))
    layers.push(createLayer(ctx, 'melody', {
      scale: SCALES.solar,
      seed: 12345,
      noteInterval: 3.0,
      density: 0.3,
      volume: 0.025,
      noteDuration: 2.0,
    }))
  }

  if (mode === 'galaxy') {
    layers.push(createLayer(ctx, 'drone', {
      frequencies: [41.2, 61.74, 82.41],
      waveform: 'sine',
      detune: 10,
      volume: 0.3,
      lfoRate: 0.025,
      lfoDepth: 5,
    }))
    layers.push(createLayer(ctx, 'pad', {
      frequencies: [196.00, 233.08, 311.13, 369.99],
      detune: 8,
      volume: 0.03,
    }))
    layers.push(createLayer(ctx, 'noise', {
      amplitude: 0.01,
      filterType: 'bandpass',
      filterFreq: 200,
      filterQ: 2,
    }))
    layers.push(createLayer(ctx, 'melody', {
      scale: SCALES.galaxy,
      seed: 67890,
      noteInterval: 4.0,
      density: 0.2,
      volume: 0.02,
      noteDuration: 3.0,
    }))
  }

  if (mode === 'deepspace') {
    layers.push(createLayer(ctx, 'drone', {
      frequencies: [32.7, 49.0, 65.41],
      waveform: 'sine',
      detune: 15,
      volume: 0.35,
      lfoRate: 0.015,
      lfoDepth: 8,
    }))
    layers.push(createLayer(ctx, 'pad', {
      frequencies: [138.59, 164.81, 207.65, 277.18],
      detune: 12,
      volume: 0.025,
    }))
    layers.push(createLayer(ctx, 'noise', {
      amplitude: 0.015,
      filterFreq: 150,
      filterQ: 3,
    }))
    layers.push(createLayer(ctx, 'melody', {
      scale: SCALES.deepspace,
      seed: 99999,
      noteInterval: 5.0,
      density: 0.15,
      volume: 0.018,
      noteDuration: 4.0,
    }))
  }

  // Connect all layers to master
  layers.forEach((l) => l.gain.connect(master))

  return {
    master,
    layers,
    fadeIn: (duration = 2) => {
      master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + duration)
    },
    fadeOut: (duration = 2) => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
    },
    start: () => layers.forEach((l) => l.start()),
    stop: () => layers.forEach((l) => l.stop()),
  }
}

export default function AudioManager({ scale = 'solar' }) {
  const [muted, setMuted] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const audioCtxRef = useRef(null)
  const soundscapesRef = useRef({})
  const currentModeRef = useRef(null)

  // Switch soundscape when scale changes
  useEffect(() => {
    if (!initialized || muted) return
    const ctx = audioCtxRef.current
    if (!ctx) return

    const prevMode = currentModeRef.current
    const newMode = scale === 'deepspace' ? 'deepspace' : scale

    if (prevMode === newMode) return

    // Fade out previous
    if (prevMode && soundscapesRef.current[prevMode]) {
      soundscapesRef.current[prevMode].fadeOut(1.5)
    }

    // Create or fade in new
    if (!soundscapesRef.current[newMode]) {
      const s = createSoundscape(ctx, newMode)
      s.start()
      soundscapesRef.current[newMode] = s
    }
    soundscapesRef.current[newMode].fadeIn(2)

    currentModeRef.current = newMode
  }, [scale, initialized, muted])

  const toggleAudio = useCallback(() => {
    if (!initialized) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx

      const mode = scale === 'deepspace' ? 'deepspace' : scale
      const s = createSoundscape(ctx, mode)
      s.start()
      s.fadeIn(2)
      soundscapesRef.current[mode] = s
      currentModeRef.current = mode

      setInitialized(true)
      setMuted(false)
    } else {
      const newMuted = !muted
      setMuted(newMuted)

      // Fade all soundscapes
      Object.values(soundscapesRef.current).forEach((s) => {
        if (newMuted) s.fadeOut(0.5)
      })

      if (!newMuted) {
        const mode = scale === 'deepspace' ? 'deepspace' : scale
        if (soundscapesRef.current[mode]) {
          soundscapesRef.current[mode].fadeIn(1)
        }
      }
    }
  }, [initialized, muted, scale])

  useEffect(() => {
    return () => {
      Object.values(soundscapesRef.current).forEach((s) => s.stop())
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  const modeLabel = scale === 'solar' ? 'Solar' : scale === 'galaxy' ? 'Galaxy' : 'Deep'

  return (
    <button
      onClick={toggleAudio}
      className="absolute bottom-4 right-4 z-20 glass-panel rounded-full h-10 flex items-center gap-2 px-3 hover:bg-white/10 transition-colors cursor-pointer group"
      title={muted ? 'Enable ambient music' : 'Mute'}
    >
      {muted ? (
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
          <span className="text-[9px] text-neon-cyan/60 font-[family-name:var(--font-orbitron)] tracking-wider hidden group-hover:inline">
            {modeLabel}
          </span>
        </>
      )}
    </button>
  )
}
