import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Ring } from '@react-three/drei'
import * as THREE from 'three'
import Atmosphere from './Atmosphere'

// Atmosphere config per planet
const ATMOSPHERE_CONFIG = {
  earth: { color: '#4a9eff', intensity: 0.7 },
  venus: { color: '#e8cda0', intensity: 0.5 },
  mars: { color: '#c1440e', intensity: 0.25 },
  jupiter: { color: '#c88b3a', intensity: 0.3 },
  saturn: { color: '#e8d5a3', intensity: 0.25 },
  uranus: { color: '#7ec8e3', intensity: 0.4 },
  neptune: { color: '#3f54ba', intensity: 0.45 },
}

export default function Planet({ data, timeScale, isSelected, onClick }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Generate a procedural texture for each planet
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const baseColor = new THREE.Color(data.color)

    // Fill base
    ctx.fillStyle = data.color
    ctx.fillRect(0, 0, 512, 256)

    // Add noise/features
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const r = Math.random() * 3 + 0.5
      const brightness = 0.7 + Math.random() * 0.6
      const c = baseColor.clone().multiplyScalar(brightness)
      ctx.fillStyle = `rgb(${Math.floor(c.r * 255)},${Math.floor(c.g * 255)},${Math.floor(c.b * 255)})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add bands for gas giants
    if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id)) {
      for (let i = 0; i < 12; i++) {
        const y = (i / 12) * 256
        const bandColor = baseColor.clone().multiplyScalar(0.5 + Math.random() * 0.5)
        ctx.fillStyle = `rgba(${Math.floor(bandColor.r * 255)},${Math.floor(bandColor.g * 255)},${Math.floor(bandColor.b * 255)},0.35)`
        ctx.fillRect(0, y, 512, 6 + Math.random() * 16)
      }
      // Jupiter's Great Red Spot
      if (data.id === 'jupiter') {
        const spotGrad = ctx.createRadialGradient(350, 150, 5, 350, 150, 25)
        spotGrad.addColorStop(0, 'rgba(180, 60, 20, 0.8)')
        spotGrad.addColorStop(1, 'rgba(200, 100, 50, 0)')
        ctx.fillStyle = spotGrad
        ctx.beginPath()
        ctx.ellipse(350, 150, 28, 18, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Earth: continents and ocean hints
    if (data.id === 'earth') {
      // Blue oceans
      ctx.fillStyle = 'rgba(30, 80, 160, 0.3)'
      ctx.fillRect(0, 0, 512, 256)
      // Green-brown landmasses
      for (let i = 0; i < 15; i++) {
        const cx = Math.random() * 512
        const cy = 40 + Math.random() * 176
        const rx = 20 + Math.random() * 40
        const ry = 15 + Math.random() * 30
        ctx.fillStyle = `rgba(${60 + Math.random() * 60}, ${100 + Math.random() * 50}, ${40 + Math.random() * 30}, 0.5)`
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      // Polar ice caps
      ctx.fillStyle = 'rgba(220, 230, 240, 0.6)'
      ctx.fillRect(0, 0, 512, 20)
      ctx.fillRect(0, 236, 512, 20)
    }

    // Mars: surface features
    if (data.id === 'mars') {
      for (let i = 0; i < 8; i++) {
        const cx = Math.random() * 512
        const cy = Math.random() * 256
        const r = 10 + Math.random() * 30
        ctx.fillStyle = `rgba(${80 + Math.random() * 40}, ${30 + Math.random() * 20}, ${10}, 0.4)`
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }
      // Polar cap
      ctx.fillStyle = 'rgba(200, 210, 220, 0.5)'
      ctx.fillRect(0, 0, 512, 12)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [data.id, data.color])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime() * timeScale * 0.05

    // Orbital motion
    const angle = t * data.orbitSpeed * 0.1
    groupRef.current.position.x = Math.cos(angle) * data.orbitRadius
    groupRef.current.position.z = Math.sin(angle) * data.orbitRadius

    // Rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed * 0.01 * timeScale
    }
  })

  const scale = isSelected ? 1.3 : hovered ? 1.15 : 1
  const atmoConfig = ATMOSPHERE_CONFIG[data.id]

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        scale={scale}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow (shader-based) */}
      {atmoConfig && (
        <Atmosphere
          radius={data.radius}
          color={atmoConfig.color}
          intensity={atmoConfig.intensity}
        />
      )}

      {/* Saturn's rings */}
      {data.id === 'saturn' && (
        <group rotation={[Math.PI * 0.4, 0, 0]}>
          <Ring args={[data.radius * 1.4, data.radius * 1.8, 64]}>
            <meshBasicMaterial color="#d4c48a" transparent opacity={0.5} side={THREE.DoubleSide} />
          </Ring>
          <Ring args={[data.radius * 1.85, data.radius * 2.2, 64]}>
            <meshBasicMaterial color="#b8a870" transparent opacity={0.35} side={THREE.DoubleSide} />
          </Ring>
          <Ring args={[data.radius * 2.25, data.radius * 2.4, 64]}>
            <meshBasicMaterial color="#9e9060" transparent opacity={0.2} side={THREE.DoubleSide} />
          </Ring>
        </group>
      )}

      {/* Uranus rings (thin) */}
      {data.id === 'uranus' && (
        <Ring args={[data.radius * 1.5, data.radius * 1.7, 64]} rotation={[Math.PI * 0.5, Math.PI * 0.45, 0]}>
          <meshBasicMaterial color="#9ecfe0" transparent opacity={0.15} side={THREE.DoubleSide} />
        </Ring>
      )}

      {/* Hover/selected glow */}
      {(hovered || isSelected) && (
        <mesh scale={1.2}>
          <sphereGeometry args={[data.radius * 1.15, 32, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#00f5ff' : '#ffffff'}
            transparent
            opacity={isSelected ? 0.15 : 0.08}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Planet name label */}
      {(hovered || isSelected) && (
        <Html
          position={[0, data.radius + 0.8, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
        >
          <div className="font-[family-name:var(--font-orbitron)] text-xs tracking-widest text-neon-cyan text-glow-cyan whitespace-nowrap px-3 py-1 glass-panel rounded-full">
            {data.name.toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  )
}
