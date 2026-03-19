import { useRef, useState, useMemo, memo } from 'react'
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

// High-quality planet textures — generated once, cached globally
const textureCache = new Map()

function getTexture(data) {
  if (textureCache.has(data.id)) return textureCache.get(data.id)

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const base = new THREE.Color(data.color)

  // Base fill
  ctx.fillStyle = data.color
  ctx.fillRect(0, 0, 1024, 512)

  // Multi-layered noise for realistic surface
  for (let layer = 0; layer < 3; layer++) {
    const dotCount = [3000, 2000, 1000][layer]
    const sizeRange = [{ min: 1, max: 4 }, { min: 2, max: 6 }, { min: 4, max: 10 }][layer]
    const brightRange = [{ min: 0.6, max: 1.3 }, { min: 0.4, max: 1.0 }, { min: 0.7, max: 1.1 }][layer]

    for (let i = 0; i < dotCount; i++) {
      const x = Math.random() * 1024, y = Math.random() * 512
      const r = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min)
      const b = brightRange.min + Math.random() * (brightRange.max - brightRange.min)
      const c = base.clone().multiplyScalar(b)
      ctx.globalAlpha = 0.3 + Math.random() * 0.4
      ctx.fillStyle = `rgb(${Math.floor(c.r * 255)},${Math.floor(c.g * 255)},${Math.floor(c.b * 255)})`
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  // Gas giant bands with turbulence
  if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id)) {
    for (let i = 0; i < 18; i++) {
      const y = (i / 18) * 512
      const bc = base.clone().multiplyScalar(0.4 + Math.random() * 0.6)
      const h = 4 + Math.random() * 20
      // Wavy bands
      ctx.fillStyle = `rgba(${Math.floor(bc.r * 255)},${Math.floor(bc.g * 255)},${Math.floor(bc.b * 255)},0.3)`
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= 1024; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 5)
      }
      ctx.lineTo(1024, y + h)
      for (let x = 1024; x >= 0; x -= 16) {
        ctx.lineTo(x, y + h + Math.sin(x * 0.02 + i + 1) * 3)
      }
      ctx.closePath()
      ctx.fill()
    }
    // Jupiter Great Red Spot
    if (data.id === 'jupiter') {
      const g = ctx.createRadialGradient(700, 300, 8, 700, 300, 50)
      g.addColorStop(0, 'rgba(180, 50, 15, 0.9)')
      g.addColorStop(0.5, 'rgba(200, 80, 40, 0.5)')
      g.addColorStop(1, 'rgba(200, 100, 60, 0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(700, 300, 55, 35, 0.1, 0, Math.PI * 2); ctx.fill()
      // Swirl lines around the spot
      for (let a = 0; a < Math.PI * 2; a += 0.3) {
        ctx.strokeStyle = `rgba(150, 60, 20, ${0.2 + Math.random() * 0.2})`
        ctx.lineWidth = 1
        const r1 = 40 + Math.random() * 20
        ctx.beginPath()
        ctx.arc(700, 300, r1, a, a + 0.8)
        ctx.stroke()
      }
    }
    // Neptune's Great Dark Spot
    if (data.id === 'neptune') {
      const g = ctx.createRadialGradient(500, 240, 5, 500, 240, 35)
      g.addColorStop(0, 'rgba(20, 30, 80, 0.8)')
      g.addColorStop(1, 'rgba(40, 50, 120, 0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(500, 240, 40, 25, 0, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Earth: detailed continents + oceans
  if (data.id === 'earth') {
    ctx.fillStyle = 'rgba(20, 60, 140, 0.35)'; ctx.fillRect(0, 0, 1024, 512)
    // Continents (more detailed shapes)
    const landAreas = [
      { cx: 500, cy: 180, rx: 80, ry: 60 },  // Eurasia
      { cx: 550, cy: 280, rx: 40, ry: 50 },  // Africa
      { cx: 250, cy: 200, rx: 60, ry: 80 },  // Americas N
      { cx: 280, cy: 330, rx: 35, ry: 70 },  // Americas S
      { cx: 700, cy: 370, rx: 60, ry: 30 },  // Australia
      { cx: 520, cy: 140, rx: 90, ry: 30 },  // Russia
    ]
    landAreas.forEach(({ cx, cy, rx, ry }) => {
      for (let j = 0; j < 8; j++) {
        const ox = cx + (Math.random() - 0.5) * rx
        const oy = cy + (Math.random() - 0.5) * ry
        ctx.fillStyle = `rgba(${50 + Math.random() * 50}, ${90 + Math.random() * 60}, ${30 + Math.random() * 30}, 0.6)`
        ctx.beginPath(); ctx.ellipse(ox, oy, 10 + Math.random() * rx * 0.4, 8 + Math.random() * ry * 0.3, Math.random(), 0, Math.PI * 2); ctx.fill()
      }
    })
    // Ice caps
    ctx.fillStyle = 'rgba(220, 235, 245, 0.7)'; ctx.fillRect(0, 0, 1024, 35); ctx.fillRect(0, 477, 1024, 35)
    // Desert regions
    ctx.fillStyle = 'rgba(200, 170, 100, 0.3)'; ctx.beginPath(); ctx.ellipse(540, 260, 50, 20, 0, 0, Math.PI * 2); ctx.fill()
  }

  // Mars: craters + Valles Marineris + Olympus Mons
  if (data.id === 'mars') {
    for (let i = 0; i < 25; i++) {
      const cx = Math.random() * 1024, cy = Math.random() * 512
      const r = 8 + Math.random() * 40
      ctx.strokeStyle = `rgba(60, 20, 5, ${0.3 + Math.random() * 0.3})`
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = `rgba(90, 40, 15, 0.2)`; ctx.fill()
    }
    // Valles Marineris (canyon)
    ctx.strokeStyle = 'rgba(80, 30, 10, 0.5)'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(300, 260); ctx.bezierCurveTo(450, 255, 550, 270, 700, 265); ctx.stroke()
    // Olympus Mons
    const om = ctx.createRadialGradient(400, 180, 5, 400, 180, 40)
    om.addColorStop(0, 'rgba(170, 90, 50, 0.6)'); om.addColorStop(1, 'rgba(150, 70, 30, 0)')
    ctx.fillStyle = om; ctx.beginPath(); ctx.arc(400, 180, 40, 0, Math.PI * 2); ctx.fill()
    // Polar cap
    ctx.fillStyle = 'rgba(210, 220, 230, 0.6)'; ctx.fillRect(0, 0, 1024, 25)
  }

  // Venus: thick cloud bands
  if (data.id === 'venus') {
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * 512
      ctx.fillStyle = `rgba(200, 180, 130, ${0.15 + Math.random() * 0.15})`
      ctx.fillRect(0, y, 1024, 20 + Math.random() * 25)
    }
  }

  // Mercury: heavy cratering
  if (data.id === 'mercury') {
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * 1024, cy = Math.random() * 512
      const r = 5 + Math.random() * 25
      ctx.strokeStyle = `rgba(60, 50, 40, ${0.3 + Math.random() * 0.3})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
      // Crater shadow
      ctx.fillStyle = `rgba(40, 35, 30, 0.15)`; ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  textureCache.set(data.id, tex)
  return tex
}

// Cloud texture — cached globally
let cloudTexCache = null
function getCloudTexture() {
  if (cloudTexCache) return cloudTexCache
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 1024, 512)
  // Realistic cloud patterns
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 1024, y = Math.random() * 512
    const rx = 40 + Math.random() * 100, ry = 15 + Math.random() * 30
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx)
    g.addColorStop(0, `rgba(255,255,255,${0.1 + Math.random() * 0.15})`)
    g.addColorStop(0.7, `rgba(255,255,255,${Math.random() * 0.05})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, Math.random(), 0, Math.PI * 2); ctx.fill()
  }
  cloudTexCache = new THREE.CanvasTexture(canvas)
  cloudTexCache.wrapS = THREE.RepeatWrapping; cloudTexCache.wrapT = THREE.RepeatWrapping
  return cloudTexCache
}

// Night texture — cached globally
let nightTexCache = null
function getNightTexture() {
  if (nightTexCache) return nightTexCache
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1024, 512)
  const cities = [
    [200, 180], [300, 200], [400, 170], [500, 220], [600, 190], [700, 260],
    [800, 200], [260, 340], [560, 300], [760, 280], [360, 260], [640, 180],
    [840, 240], [160, 280], [900, 210], [450, 145], [680, 150], [100, 200],
  ]
  cities.forEach(([cx, cy]) => {
    for (let i = 0; i < 50; i++) {
      const x = cx + (Math.random() - 0.5) * 50
      const y = cy + (Math.random() - 0.5) * 25
      const brightness = 0.4 + Math.random() * 0.6
      ctx.fillStyle = `rgba(255, ${180 + Math.random() * 75}, ${80 + Math.random() * 120}, ${brightness})`
      ctx.fillRect(x, y, Math.random() > 0.5 ? 2 : 1, 1)
    }
  })
  nightTexCache = new THREE.CanvasTexture(canvas)
  nightTexCache.wrapS = THREE.RepeatWrapping; nightTexCache.wrapT = THREE.RepeatWrapping
  return nightTexCache
}

const Planet = memo(function Planet({ data, timeScale, isSelected, onClick }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const cloudRef = useRef()
  const [hovered, setHovered] = useState(false)

  const texture = useMemo(() => getTexture(data), [data.id])
  const cloudTex = useMemo(() => data.id === 'earth' ? getCloudTexture() : null, [data.id])
  const nightTex = useMemo(() => data.id === 'earth' ? getNightTexture() : null, [data.id])

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
      {/* Main planet — 48 segments (from 64) */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        scale={scale}
      >
        <sphereGeometry args={[data.radius, 48, 48]} />
        <meshStandardMaterial map={texture} roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Earth clouds — 32 segments */}
      {cloudTex && (
        <mesh ref={cloudRef} scale={scale * 1.008}>
          <sphereGeometry args={[data.radius, 32, 32]} />
          <meshStandardMaterial map={cloudTex} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}

      {/* Earth night lights — uses same mesh rotation */}
      {nightTex && (
        <mesh scale={scale * 1.001}>
          <sphereGeometry args={[data.radius, 32, 32]} />
          <meshBasicMaterial map={nightTex} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}

      {/* Atmosphere glow */}
      {atmo && <Atmosphere radius={data.radius} color={atmo.color} intensity={atmo.intensity} />}

      {/* Saturn rings */}
      {data.id === 'saturn' && (
        <group rotation={[Math.PI * 0.4, 0, 0]}>
          <Ring args={[data.radius * 1.4, data.radius * 1.8, 48]}><meshBasicMaterial color="#d4c48a" transparent opacity={0.5} side={THREE.DoubleSide} /></Ring>
          <Ring args={[data.radius * 1.85, data.radius * 2.2, 48]}><meshBasicMaterial color="#b8a870" transparent opacity={0.35} side={THREE.DoubleSide} /></Ring>
          <Ring args={[data.radius * 2.25, data.radius * 2.4, 32]}><meshBasicMaterial color="#9e9060" transparent opacity={0.2} side={THREE.DoubleSide} /></Ring>
        </group>
      )}

      {/* Uranus rings */}
      {data.id === 'uranus' && (
        <Ring args={[data.radius * 1.5, data.radius * 1.7, 32]} rotation={[Math.PI * 0.5, Math.PI * 0.45, 0]}>
          <meshBasicMaterial color="#9ecfe0" transparent opacity={0.15} side={THREE.DoubleSide} />
        </Ring>
      )}

      {/* Selection glow — 16 segments (cheap) */}
      {(hovered || isSelected) && (
        <mesh scale={1.2}>
          <sphereGeometry args={[data.radius * 1.15, 16, 16]} />
          <meshBasicMaterial color={isSelected ? '#00f5ff' : '#ffffff'} transparent opacity={isSelected ? 0.15 : 0.08} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Enhanced label */}
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
})

export default Planet
