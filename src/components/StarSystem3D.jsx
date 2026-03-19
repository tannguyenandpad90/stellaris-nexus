import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Ring } from '@react-three/drei'
import { Suspense, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PostProcessing from './PostProcessing'

// Generate procedural planet texture
function makePlanetTexture(color, type) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const base = new THREE.Color(color)

  ctx.fillStyle = color
  ctx.fillRect(0, 0, 256, 128)

  // Noise
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 128
    const r = Math.random() * 2.5 + 0.5
    const b = 0.6 + Math.random() * 0.8
    const c = base.clone().multiplyScalar(b)
    ctx.fillStyle = `rgb(${Math.floor(c.r * 255)},${Math.floor(c.g * 255)},${Math.floor(c.b * 255)})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Gas giant bands
  if (type === 'Gas Giant' || type === 'Ice Giant' || type === 'Hot Jupiter') {
    for (let i = 0; i < 10; i++) {
      const y = (i / 10) * 128
      const bc = base.clone().multiplyScalar(0.5 + Math.random() * 0.5)
      ctx.fillStyle = `rgba(${Math.floor(bc.r * 255)},${Math.floor(bc.g * 255)},${Math.floor(bc.b * 255)},0.3)`
      ctx.fillRect(0, y, 256, 5 + Math.random() * 12)
    }
  }

  // Ocean world water
  if (type === 'Ocean World') {
    ctx.fillStyle = 'rgba(30, 80, 180, 0.3)'
    ctx.fillRect(0, 0, 256, 128)
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(${40 + Math.random() * 40}, ${120 + Math.random() * 40}, ${40}, 0.4)`
      ctx.beginPath()
      ctx.ellipse(Math.random() * 256, 30 + Math.random() * 68, 15 + Math.random() * 25, 10 + Math.random() * 15, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(200, 220, 240, 0.5)'
    ctx.fillRect(0, 0, 256, 10)
    ctx.fillRect(0, 118, 256, 10)
  }

  // Lava world cracks
  if (type === 'Lava World') {
    for (let i = 0; i < 15; i++) {
      ctx.strokeStyle = `rgba(255, ${100 + Math.random() * 100}, 0, 0.6)`
      ctx.lineWidth = 1 + Math.random() * 2
      ctx.beginPath()
      ctx.moveTo(Math.random() * 256, Math.random() * 128)
      ctx.lineTo(Math.random() * 256, Math.random() * 128)
      ctx.stroke()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Star mesh with glow
function ProceduralStar({ spectral, isMultiStar, companionType }) {
  const ref = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) ref.current.rotation.y = t * 0.1
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.04)
  })

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color={spectral.color} toneMapped={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color={spectral.color} transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color={spectral.color} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      <pointLight color={spectral.color} intensity={80} distance={100} decay={1.5} />

      {/* Companion star */}
      {isMultiStar && companionType && (
        <group position={[3.5, 0.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.7, 24, 24]} />
            <meshBasicMaterial color={companionType.color} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial color={companionType.color} transparent opacity={0.1} side={THREE.BackSide} />
          </mesh>
          <pointLight color={companionType.color} intensity={20} distance={50} decay={2} />
        </group>
      )}
    </group>
  )
}

// Single planet orbiting
function ProceduralPlanet({ planet, index, totalPlanets }) {
  const groupRef = useRef()
  const meshRef = useRef()

  // Scale orbit for visualization (compress large orbits)
  const orbitRadius = 4 + Math.log2(planet.orbitAU + 1) * 5
  const planetScale = Math.max(0.15, Math.min(1.2, planet.radiusEarth * 0.15))
  const orbitSpeed = 1 / (planet.orbitalPeriod * 0.001 + 0.5)

  const texture = useMemo(() => makePlanetTexture(planet.color, planet.type), [planet.color, planet.type])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    const angle = t * orbitSpeed + index * 1.2
    groupRef.current.position.x = Math.cos(angle) * orbitRadius
    groupRef.current.position.z = Math.sin(angle) * orbitRadius
    if (meshRef.current) meshRef.current.rotation.y += 0.01
  })

  // Orbit ring points
  const orbitPoints = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [orbitRadius])

  return (
    <>
      {/* Orbit ring */}
      <line geometry={orbitPoints}>
        <lineBasicMaterial color={planet.habitable ? '#4ade80' : '#ffffff'} transparent opacity={planet.habitable ? 0.3 : 0.08} />
      </line>

      <group ref={groupRef}>
        {/* Planet */}
        <mesh ref={meshRef} scale={planetScale}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial map={texture} roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Habitable glow */}
        {planet.habitable && (
          <mesh scale={planetScale * 1.25}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.1} side={THREE.BackSide} />
          </mesh>
        )}

        {/* Rings for gas/ice giants */}
        {(planet.type === 'Gas Giant' || planet.type === 'Ice Giant') && planet.radiusEarth > 5 && (
          <Ring args={[planetScale * 1.3, planetScale * 2, 32]} rotation={[Math.PI * 0.4, 0, 0]}>
            <meshBasicMaterial color={planet.color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </Ring>
        )}

        {/* Label */}
        <Html position={[0, planetScale + 0.4, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
          <div className="text-[8px] text-gray-300 whitespace-nowrap text-center font-mono">
            <div className="truncate max-w-[80px]">{planet.name.split(' ').pop()}</div>
            <div className={`text-[7px] ${planet.habitable ? 'text-green-400' : 'text-gray-500'}`}>
              {planet.type}
            </div>
          </div>
        </Html>
      </group>
    </>
  )
}

function SystemScene({ system }) {
  return (
    <>
      <ambientLight intensity={0.05} />
      <Stars radius={150} depth={80} count={2000} factor={3} saturation={0.2} fade speed={0.3} />

      <ProceduralStar
        spectral={system.spectral}
        isMultiStar={system.isMultiStar}
        companionType={system.companionType}
      />

      {system.planets.map((planet, i) => (
        <ProceduralPlanet key={i} planet={planet} index={i} totalPlanets={system.planets.length} />
      ))}

      <PostProcessing mode="deepspace" />
    </>
  )
}

export default function StarSystem3D({ system, onBack }) {
  return (
    <div className="absolute inset-0" style={{ zIndex: 5 }}>
      <Canvas
        camera={{ position: [0, 8, 18], fov: 55, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false, toneMapping: 3 }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#030310']} />
        <Suspense fallback={null}>
          <SystemScene system={system} />
        </Suspense>
        <OrbitControls
          enableDamping dampingFactor={0.05}
          minDistance={3} maxDistance={60}
          maxPolarAngle={Math.PI * 0.85}
          rotateSpeed={0.5} zoomSpeed={0.7}
        />
      </Canvas>

      {/* Back button overlay */}
      <button
        onClick={onBack}
        className="absolute top-20 left-4 glass-panel rounded-lg px-4 py-2 text-xs text-neon-cyan hover:bg-neon-cyan/10 transition-colors cursor-pointer border border-neon-cyan/30 font-[family-name:var(--font-orbitron)] tracking-wider flex items-center gap-2"
        style={{ zIndex: 20 }}
      >
        ← BACK TO GALAXY
      </button>

      {/* System name overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none" style={{ zIndex: 20 }}>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-glow-cyan text-neon-cyan tracking-wider">
          {system.name}
        </h2>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {system.spectral.type}-class &middot; {system.numPlanets} planet{system.numPlanets !== 1 ? 's' : ''}
          {system.isMultiStar ? ' &middot; Binary' : ''}
          {system.hasHabitablePlanet ? ' &middot; ' : ''}
        </p>
        {system.hasHabitablePlanet && (
          <span className="text-[10px] text-green-400 font-bold animate-pulse">Habitable Zone Detected</span>
        )}
      </div>
    </div>
  )
}
