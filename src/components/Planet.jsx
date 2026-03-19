import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Ring } from '@react-three/drei'
import * as THREE from 'three'
import Atmosphere from './Atmosphere'

const ATMOSPHERE_CONFIG = {
  earth: { color: '#4a9eff', intensity: 0.7 },
  venus: { color: '#e8cda0', intensity: 0.5 },
  mars: { color: '#c1440e', intensity: 0.25 },
  jupiter: { color: '#c88b3a', intensity: 0.3 },
  saturn: { color: '#e8d5a3', intensity: 0.25 },
  uranus: { color: '#7ec8e3', intensity: 0.4 },
  neptune: { color: '#3f54ba', intensity: 0.45 },
}

function makeTexture(data) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const base = new THREE.Color(data.color)

  ctx.fillStyle = data.color
  ctx.fillRect(0, 0, 512, 256)

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512, y = Math.random() * 256
    const r = Math.random() * 3 + 0.5
    const c = base.clone().multiplyScalar(0.7 + Math.random() * 0.6)
    ctx.fillStyle = `rgb(${Math.floor(c.r * 255)},${Math.floor(c.g * 255)},${Math.floor(c.b * 255)})`
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }

  if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id)) {
    for (let i = 0; i < 14; i++) {
      const y = (i / 14) * 256
      const bc = base.clone().multiplyScalar(0.5 + Math.random() * 0.5)
      ctx.fillStyle = `rgba(${Math.floor(bc.r * 255)},${Math.floor(bc.g * 255)},${Math.floor(bc.b * 255)},0.35)`
      ctx.fillRect(0, y, 512, 5 + Math.random() * 14)
    }
    if (data.id === 'jupiter') {
      const g = ctx.createRadialGradient(350, 150, 5, 350, 150, 28)
      g.addColorStop(0, 'rgba(180, 60, 20, 0.8)'); g.addColorStop(1, 'rgba(200, 100, 50, 0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(350, 150, 28, 18, 0, 0, Math.PI * 2); ctx.fill()
    }
  }

  if (data.id === 'earth') {
    ctx.fillStyle = 'rgba(30, 80, 160, 0.3)'; ctx.fillRect(0, 0, 512, 256)
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = `rgba(${60 + Math.random() * 60}, ${100 + Math.random() * 50}, ${40 + Math.random() * 30}, 0.5)`
      ctx.beginPath(); ctx.ellipse(Math.random() * 512, 40 + Math.random() * 176, 20 + Math.random() * 40, 15 + Math.random() * 30, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = 'rgba(220, 230, 240, 0.6)'; ctx.fillRect(0, 0, 512, 20); ctx.fillRect(0, 236, 512, 20)
  }
  if (data.id === 'mars') {
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = `rgba(${80 + Math.random() * 40}, ${30 + Math.random() * 20}, 10, 0.4)`
      ctx.beginPath(); ctx.arc(Math.random() * 512, Math.random() * 256, 10 + Math.random() * 30, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = 'rgba(200, 210, 220, 0.5)'; ctx.fillRect(0, 0, 512, 12)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping
  return tex
}

function makeCloudTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 512, 256)
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512, y = Math.random() * 256
    const rx = 30 + Math.random() * 60, ry = 10 + Math.random() * 20
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx)
    g.addColorStop(0, `rgba(255,255,255,${0.15 + Math.random() * 0.2})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, Math.random(), 0, Math.PI * 2); ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping
  return tex
}

function makeNightTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 512, 256)
  // City lights clusters
  const cities = [[100, 90], [150, 100], [200, 85], [250, 110], [300, 95], [350, 130], [400, 100], [130, 170], [280, 150], [380, 140], [180, 130], [320, 90], [420, 120], [80, 140], [450, 105]]
  cities.forEach(([cx, cy]) => {
    for (let i = 0; i < 30; i++) {
      const x = cx + (Math.random() - 0.5) * 30
      const y = cy + (Math.random() - 0.5) * 15
      ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 100}, ${0.5 + Math.random() * 0.5})`
      ctx.fillRect(x, y, 1, 1)
    }
  })
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping
  return tex
}

export default function Planet({ data, timeScale, isSelected, onClick }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const cloudRef = useRef()
  const [hovered, setHovered] = useState(false)

  const texture = useMemo(() => makeTexture(data), [data.id, data.color])
  const cloudTex = useMemo(() => data.id === 'earth' ? makeCloudTexture() : null, [data.id])
  const nightTex = useMemo(() => data.id === 'earth' ? makeNightTexture() : null, [data.id])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime() * timeScale * 0.05
    const angle = t * data.orbitSpeed * 0.1
    groupRef.current.position.x = Math.cos(angle) * data.orbitRadius
    groupRef.current.position.z = Math.sin(angle) * data.orbitRadius
    if (meshRef.current) meshRef.current.rotation.y += data.rotationSpeed * 0.01 * timeScale
    if (cloudRef.current) cloudRef.current.rotation.y += 0.003 * timeScale
  })

  const scale = isSelected ? 1.3 : hovered ? 1.15 : 1
  const atmo = ATMOSPHERE_CONFIG[data.id]

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        scale={scale}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Earth clouds */}
      {data.id === 'earth' && cloudTex && (
        <mesh ref={cloudRef} scale={scale * 1.01}>
          <sphereGeometry args={[data.radius, 48, 48]} />
          <meshStandardMaterial map={cloudTex} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      )}

      {/* Earth night lights */}
      {data.id === 'earth' && nightTex && (
        <mesh scale={scale * 1.001} rotation={meshRef.current?.rotation}>
          <sphereGeometry args={[data.radius, 48, 48]} />
          <meshBasicMaterial map={nightTex} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}

      {/* Atmosphere */}
      {atmo && <Atmosphere radius={data.radius} color={atmo.color} intensity={atmo.intensity} />}

      {/* Saturn rings */}
      {data.id === 'saturn' && (
        <group rotation={[Math.PI * 0.4, 0, 0]}>
          <Ring args={[data.radius * 1.4, data.radius * 1.8, 64]}><meshBasicMaterial color="#d4c48a" transparent opacity={0.5} side={THREE.DoubleSide} /></Ring>
          <Ring args={[data.radius * 1.85, data.radius * 2.2, 64]}><meshBasicMaterial color="#b8a870" transparent opacity={0.35} side={THREE.DoubleSide} /></Ring>
          <Ring args={[data.radius * 2.25, data.radius * 2.4, 64]}><meshBasicMaterial color="#9e9060" transparent opacity={0.2} side={THREE.DoubleSide} /></Ring>
        </group>
      )}

      {/* Uranus rings */}
      {data.id === 'uranus' && (
        <Ring args={[data.radius * 1.5, data.radius * 1.7, 64]} rotation={[Math.PI * 0.5, Math.PI * 0.45, 0]}>
          <meshBasicMaterial color="#9ecfe0" transparent opacity={0.15} side={THREE.DoubleSide} />
        </Ring>
      )}

      {/* Selection glow */}
      {(hovered || isSelected) && (
        <mesh scale={1.2}>
          <sphereGeometry args={[data.radius * 1.15, 32, 32]} />
          <meshBasicMaterial color={isSelected ? '#00f5ff' : '#ffffff'} transparent opacity={isSelected ? 0.15 : 0.08} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Label with extra info on hover */}
      {(hovered || isSelected) && (
        <Html position={[0, data.radius + 0.8, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
          <div className="text-center">
            <div className="font-[family-name:var(--font-orbitron)] text-xs tracking-widest text-neon-cyan text-glow-cyan whitespace-nowrap px-3 py-1 glass-panel rounded-full">
              {data.name.toUpperCase()}
            </div>
            {hovered && (
              <div className="glass-panel rounded-lg px-2 py-1 mt-1 text-[9px] text-gray-300 whitespace-nowrap">
                {data.gravity} m/s² &middot; {data.temperature.avg}°C &middot; {data.moons} moon{data.moons !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
