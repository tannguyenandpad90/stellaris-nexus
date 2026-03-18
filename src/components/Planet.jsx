import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Ring } from '@react-three/drei'
import * as THREE from 'three'

export default function Planet({ data, timeScale, isSelected, onClick }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Generate a procedural texture for each planet
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    const baseColor = new THREE.Color(data.color)

    // Fill base
    ctx.fillStyle = data.color
    ctx.fillRect(0, 0, 256, 128)

    // Add noise/features
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 128
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
      for (let i = 0; i < 8; i++) {
        const y = (i / 8) * 128
        const bandColor = baseColor.clone().multiplyScalar(0.6 + Math.random() * 0.4)
        ctx.fillStyle = `rgba(${Math.floor(bandColor.r * 255)},${Math.floor(bandColor.g * 255)},${Math.floor(bandColor.b * 255)},0.3)`
        ctx.fillRect(0, y, 256, 8 + Math.random() * 12)
      }
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

      {/* Saturn's rings */}
      {data.id === 'saturn' && (
        <Ring args={[data.radius * 1.4, data.radius * 2.2, 64]} rotation={[Math.PI * 0.4, 0, 0]}>
          <meshBasicMaterial
            color="#c8b87a"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
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
