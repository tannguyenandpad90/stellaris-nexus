const SHORTCUTS = [
  { cat: 'Navigation', keys: [
    { key: '1', desc: 'Solar System' },
    { key: '2', desc: 'Milky Way' },
    { key: '3', desc: 'Deep Space' },
    { key: 'Esc', desc: 'Close / Back' },
  ]},
  { cat: 'Solar System', keys: [
    { key: 'A', desc: 'Asteroid Tracker' },
    { key: 'M', desc: 'Mars Rover' },
    { key: 'T', desc: 'Travel Calculator' },
    { key: 'G', desc: 'Gravity Simulator' },
  ]},
  { cat: 'Galaxy / Deep Space', keys: [
    { key: 'E', desc: 'Exoplanets' },
  ]},
  { cat: 'Global', keys: [
    { key: 'I', desc: 'ISS Tracker' },
    { key: 'W', desc: 'Space Weather' },
    { key: 'N', desc: 'NASA Media' },
    { key: '?', desc: 'AI Guide' },
  ]},
]

export default function KeyboardOverlay({ show, onClose }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel rounded-2xl p-6 max-w-lg w-full mx-4 animate-pulse-glow" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-neon-cyan text-glow-cyan tracking-wider">
            KEYBOARD SHORTCUTS
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {SHORTCUTS.map((group) => (
            <div key={group.cat}>
              <h3 className="text-[10px] text-neon-orange uppercase tracking-wider mb-2 font-bold">{group.cat}</h3>
              <div className="space-y-1">
                {group.keys.map((k) => (
                  <div key={k.key} className="flex items-center gap-2">
                    <kbd className="glass-panel rounded px-1.5 py-0.5 text-[10px] font-mono text-neon-cyan min-w-[28px] text-center">{k.key}</kbd>
                    <span className="text-xs text-gray-400">{k.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-gray-600 text-center mt-4">Press Esc to close this overlay</p>
      </div>
    </div>
  )
}
