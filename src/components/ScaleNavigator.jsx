const SCALES = [
  { id: 'solar', label: 'SOLAR SYSTEM', icon: '☀', color: 'text-neon-orange', bg: 'bg-neon-orange/20', border: 'border-neon-orange/40' },
  { id: 'galaxy', label: 'MILKY WAY', icon: '🌀', color: 'text-neon-purple', bg: 'bg-neon-purple/20', border: 'border-neon-purple/40' },
  { id: 'deepspace', label: 'DEEP SPACE', icon: '✦', color: 'text-neon-cyan', bg: 'bg-neon-cyan/20', border: 'border-neon-cyan/40' },
]

export default function ScaleNavigator({ currentScale, onScaleChange }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-16 z-30 pointer-events-auto">
      <div className="glass-panel rounded-full px-1 py-1 flex gap-1">
        {SCALES.map((scale) => {
          const active = currentScale === scale.id
          return (
            <button
              key={scale.id}
              onClick={() => onScaleChange(scale.id)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-[family-name:var(--font-orbitron)] tracking-wider transition-all cursor-pointer ${
                active
                  ? `${scale.bg} ${scale.color} border ${scale.border}`
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="mr-1.5">{scale.icon}</span>
              {scale.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
