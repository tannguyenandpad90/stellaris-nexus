import { Html } from '@react-three/drei'

export default function Scene3DLoader({ label = 'Scene' }) {
  return (
    <Html center>
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border border-neon-cyan/30 rounded-full" style={{ animation: 'spin 2s linear infinite' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_8px_var(--color-neon-cyan)]" />
          </div>
          <div className="absolute inset-3 border border-neon-purple/30 rounded-full" style={{ animation: 'spin 1.5s linear infinite reverse' }}>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neon-purple rounded-full" />
          </div>
        </div>
        <p className="font-[family-name:var(--font-orbitron)] text-xs text-neon-cyan tracking-widest animate-pulse">
          {label.toUpperCase()}
        </p>
      </div>
    </Html>
  )
}
