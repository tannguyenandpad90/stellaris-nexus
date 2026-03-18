import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import { Suspense, useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PostProcessing from './PostProcessing'

// Generate spiral arm points
function generateSpiralArm(count, armOffset, spread, armLength) {
  const points = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * armLength
    const angle = t * 2.5 + armOffset
    const radius = t * 12 + 2

    // Add spread/randomness
    const rx = (Math.random() - 0.5) * spread * (1 + t * 0.5)
    const ry = (Math.random() - 0.5) * spread * 0.3
    const rz = (Math.random() - 0.5) * spread * (1 + t * 0.5)

    points.push({
      x: Math.cos(angle) * radius + rx,
      y: ry,
      z: Math.sin(angle) * radius + rz,
      brightness: Math.random(),
      size: Math.random() * 0.15 + 0.02,
    })
  }
  return points
}

// Notable star systems with real data
const NOTABLE_STARS = [
  { name: 'Sol', x: 8, y: 0, z: 0, color: '#ffd700', info: 'Our Sun — 8 planets, home of humanity', type: 'G2V' },
  { name: 'Alpha Centauri', x: 8.2, y: 0.1, z: 0.3, color: '#fff4e0', info: 'Nearest star system — 4.37 ly away, triple star', type: 'G2V + K1V' },
  { name: 'Sirius', x: 8.6, y: 0, z: -0.5, color: '#a8d8ff', info: 'Brightest star in night sky — 8.6 ly, binary system', type: 'A1V' },
  { name: 'Betelgeuse', x: 7, y: 0.3, z: -3, color: '#ff6b4a', info: 'Red supergiant in Orion — 700 ly, may go supernova', type: 'M1-2Ia' },
  { name: 'Vega', x: 8.1, y: 0.1, z: 1.2, color: '#c8e0ff', info: 'Part of Summer Triangle — 25 ly, has debris disk', type: 'A0V' },
  { name: 'TRAPPIST-1', x: 8.3, y: -0.05, z: 0.2, color: '#ff9999', info: '7 Earth-sized planets, 3 in habitable zone — 40 ly', type: 'M8V' },
  { name: 'Kepler-442', x: 6.5, y: 0.2, z: 2, color: '#ffcc80', info: 'Hosts super-Earth in habitable zone — 1,206 ly', type: 'K' },
  { name: 'Sagittarius A*', x: 0, y: 0, z: 0, color: '#000000', info: 'Supermassive black hole at galactic center — 4M solar masses', type: 'Black Hole' },
]

function GalaxyParticles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const allStars = useMemo(() => {
    const stars = []
    // 4 spiral arms
    for (let arm = 0; arm < 4; arm++) {
      const armStars = generateSpiralArm(
        3000,
        (arm * Math.PI) / 2,
        2.5,
        3.5
      )
      stars.push(...armStars)
    }
    // Core bulge
    for (let i = 0; i < 4000; i++) {
      const r = Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      stars.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi) * 0.3,
        z: r * Math.sin(phi) * Math.sin(theta),
        brightness: 0.5 + Math.random() * 0.5,
        size: Math.random() * 0.12 + 0.03,
      })
    }
    // Scattered halo stars
    for (let i = 0; i < 2000; i++) {
      const r = 5 + Math.random() * 50
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 10
      stars.push({
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        brightness: Math.random() * 0.4,
        size: Math.random() * 0.05 + 0.01,
      })
    }
    return stars
  }, [])

  // Star colors based on temperature
  const colors = useMemo(() => {
    return allStars.map(() => {
      const temp = Math.random()
      if (temp < 0.1) return new THREE.Color('#ff8866') // M-type red
      if (temp < 0.3) return new THREE.Color('#ffcc88') // K-type orange
      if (temp < 0.5) return new THREE.Color('#fff8e8') // G-type yellow-white
      if (temp < 0.7) return new THREE.Color('#f0f0ff') // F-type white
      if (temp < 0.9) return new THREE.Color('#c8d8ff') // A-type blue-white
      return new THREE.Color('#9db4ff') // B/O-type blue
    })
  }, [allStars])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime() * 0.02

    for (let i = 0; i < allStars.length; i++) {
      const star = allStars[i]
      // Slow galactic rotation
      const dist = Math.sqrt(star.x ** 2 + star.z ** 2)
      const baseAngle = Math.atan2(star.z, star.x)
      const rotSpeed = 0.1 / (1 + dist * 0.05) // Inner stars rotate faster
      const angle = baseAngle + t * rotSpeed

      dummy.position.set(
        Math.cos(angle) * dist,
        star.y,
        Math.sin(angle) * dist
      )
      dummy.scale.setScalar(star.size * (0.8 + Math.sin(t * 2 + i) * 0.2))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, allStars.length]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </instancedMesh>
  )
}

function GalacticCore() {
  const ref = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = t * 0.05
      ref.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05)
    }
  })

  return (
    <group ref={ref}>
      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      {/* Accretion disk hint */}
      <mesh rotation={[Math.PI * 0.5, 0, 0]}>
        <ringGeometry args={[0.5, 2.5, 64]} />
        <meshBasicMaterial color="#ffa500" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Core light */}
      <pointLight color="#ffd700" intensity={100} distance={80} decay={1.5} />
    </group>
  )
}

function NotableStarMarker({ star, onClick, isSelected }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={[star.x, star.y, star.z]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(star) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      >
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color={star.color === '#000000' ? '#330033' : star.color}
          toneMapped={false}
        />
      </mesh>

      {/* Glow ring */}
      {(hovered || isSelected) && (
        <>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial
              color={star.name === 'Sagittarius A*' ? '#9900ff' : '#00f5ff'}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
          <Html center distanceFactor={20} style={{ pointerEvents: 'none' }}>
            <div className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-neon-cyan text-glow-cyan whitespace-nowrap px-2 py-0.5 glass-panel rounded-full">
              {star.name.toUpperCase()}
            </div>
          </Html>
        </>
      )}

      {/* Pulsing beacon for Sol */}
      {star.name === 'Sol' && (
        <mesh>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  )
}

function GalaxyScene({ onStarSelect, selectedStar }) {
  return (
    <>
      <ambientLight intensity={0.02} />

      <Stars radius={300} depth={200} count={3000} factor={6} saturation={0.3} fade speed={0.3} />

      <GalacticCore />
      <GalaxyParticles />

      {NOTABLE_STARS.map((star) => (
        <NotableStarMarker
          key={star.name}
          star={star}
          onClick={onStarSelect}
          isSelected={selectedStar?.name === star.name}
        />
      ))}

      <PostProcessing />
    </>
  )
}

export { NOTABLE_STARS }

export default function GalaxyView({ onStarSelect, selectedStar }) {
  return (
    <Canvas
      camera={{ position: [0, 35, 55], fov: 60, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false, toneMapping: 3 }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#020208']} />

      <Suspense fallback={null}>
        <GalaxyScene onStarSelect={onStarSelect} selectedStar={selectedStar} />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={150}
        maxPolarAngle={Math.PI * 0.85}
        rotateSpeed={0.4}
        zoomSpeed={0.6}
      />
    </Canvas>
  )
}
