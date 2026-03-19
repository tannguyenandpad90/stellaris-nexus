import { useState } from 'react'

const STAGES = {
  low: [ // < 0.5 solar masses
    { name: 'Protostar', duration: '~100K years', color: '#ff6644', size: 40, desc: 'Collapsing cloud of gas and dust, heating up as gravity compresses material.' },
    { name: 'Main Sequence', duration: '~100B+ years', color: '#ff9966', size: 30, desc: 'Fusing hydrogen into helium. Red dwarfs burn so slowly they outlive the current age of the universe.' },
    { name: 'Red Dwarf Death', duration: '~Trillions of years', color: '#cc4422', size: 20, desc: 'Slowly cools and dims over trillions of years. No red dwarf has yet died in our universe.' },
    { name: 'Black Dwarf', duration: 'Forever', color: '#1a1a1a', size: 15, desc: 'A theoretical cold, dark remnant. The universe is too young for any to exist yet.' },
  ],
  medium: [ // 0.5 - 8 solar masses
    { name: 'Protostar', duration: '~100K years', color: '#ff8844', size: 40, desc: 'Cloud collapse under gravity. Angular momentum creates an accretion disk.' },
    { name: 'Main Sequence', duration: '~1-10B years', color: '#ffdd44', size: 50, desc: 'Stable hydrogen fusion in the core. Our Sun is currently in this stage.' },
    { name: 'Red Giant', duration: '~1B years', color: '#ff4422', size: 90, desc: 'Core contracts, outer layers expand enormously. Will engulf nearby planets.' },
    { name: 'Planetary Nebula', duration: '~50K years', color: '#44ddff', size: 120, desc: 'Outer layers ejected into space, forming a beautiful glowing shell of ionized gas.' },
    { name: 'White Dwarf', duration: '~Trillions of years', color: '#eeeeff', size: 12, desc: 'Ultra-dense core remnant. A teaspoon weighs ~5 tons. Slowly cools over eons.' },
  ],
  high: [ // > 8 solar masses
    { name: 'Protostar', duration: '~10K years', color: '#88aaff', size: 50, desc: 'Rapid collapse. Massive protostars form and evolve extremely quickly.' },
    { name: 'Main Sequence', duration: '~1-50M years', color: '#aaccff', size: 70, desc: 'Intense fusion. Burns through hydrogen much faster than lighter stars.' },
    { name: 'Red Supergiant', duration: '~1M years', color: '#ff3300', size: 130, desc: 'Enormous expansion. Fuses heavier elements: helium → carbon → oxygen → silicon → iron.' },
    { name: 'Supernova', duration: 'Seconds', color: '#ffffff', size: 160, desc: 'Core collapses in milliseconds. Explosion outshines entire galaxy for weeks. Creates elements heavier than iron.' },
    { name: 'Neutron Star', duration: 'Forever', color: '#9966ff', size: 8, desc: 'For 8-20 M☉: ultra-dense remnant. A sugar cube weighs ~1 billion tons. May spin 700x/sec (pulsar).' },
    { name: 'Black Hole', duration: 'Forever', color: '#000000', size: 20, desc: 'For >20 M☉: gravity so strong nothing escapes, not even light. Warps spacetime itself.' },
  ],
}

function getMassCategory(spectralType) {
  const massStr = spectralType?.mass || '1 M☉'
  const match = massStr.match(/([\d.]+)/)
  const maxMass = parseFloat(match?.[1] || 1)
  if (maxMass < 0.5) return 'low'
  if (maxMass < 8) return 'medium'
  return 'high'
}

export default function StellarEvolution({ system, onClose }) {
  const [activeStage, setActiveStage] = useState(1) // Start at main sequence
  const category = getMassCategory(system?.spectral)
  const stages = STAGES[category] || STAGES.medium

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-16 w-[550px] z-20">
      <div className="glass-panel rounded-2xl p-5 animate-pulse-glow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-neon-orange text-glow-orange tracking-wider">
              STELLAR EVOLUTION
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {system?.name} &middot; {system?.spectral?.type}-class &middot; {system?.spectral?.mass}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        {/* Visual timeline */}
        <div className="relative flex items-end justify-around h-44 mb-4 glass-panel rounded-xl p-4">
          {stages.map((stage, i) => (
            <button
              key={stage.name}
              onClick={() => setActiveStage(i)}
              className={`flex flex-col items-center cursor-pointer transition-all ${activeStage === i ? 'scale-110' : 'opacity-60 hover:opacity-80'}`}
            >
              {/* Star sphere */}
              <div
                className="rounded-full transition-all duration-500 mb-2"
                style={{
                  width: stage.size * 0.7,
                  height: stage.size * 0.7,
                  backgroundColor: stage.color,
                  boxShadow: stage.color === '#000000'
                    ? '0 0 15px #9900ff, inset 0 0 10px #330033'
                    : stage.color === '#ffffff'
                    ? '0 0 30px #ffffff, 0 0 60px #ffffff'
                    : `0 0 ${stage.size * 0.3}px ${stage.color}`,
                }}
              />
              <span className={`text-[8px] text-center leading-tight ${activeStage === i ? 'text-white' : 'text-gray-500'}`}>
                {stage.name}
              </span>
            </button>
          ))}

          {/* Arrow connectors */}
          <div className="absolute bottom-12 left-8 right-8 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-neon-orange/30 via-white/20 to-neon-orange/30" />
          </div>
        </div>

        {/* Stage detail */}
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-6 h-6 rounded-full shrink-0"
              style={{
                backgroundColor: stages[activeStage].color,
                boxShadow: stages[activeStage].color === '#000000' ? '0 0 8px #9900ff' : `0 0 8px ${stages[activeStage].color}`,
              }}
            />
            <div>
              <h3 className="text-sm text-white font-semibold">{stages[activeStage].name}</h3>
              <p className="text-[10px] text-neon-cyan font-mono">Duration: {stages[activeStage].duration}</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{stages[activeStage].desc}</p>
        </div>

        <p className="text-[8px] text-gray-600 text-center mt-3">
          Path: {category === 'low' ? 'Low mass (<0.5 M☉)' : category === 'medium' ? 'Medium mass (0.5-8 M☉)' : 'High mass (>8 M☉)'}
          &middot; Click each stage to explore
        </p>
      </div>
    </div>
  )
}
