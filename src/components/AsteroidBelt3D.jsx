import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Optimized asteroid belt — pre-calculates angles/radii, avoids per-frame trig
export default function AsteroidBelt3D({ count = 300 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Pre-calculate all static data once
  const asteroids = useMemo(() => {
    const data = new Float32Array(count * 5) // angle, radius, y, scale, speed
    for (let i = 0; i < count; i++) {
      const off = i * 5
      data[off] = Math.random() * Math.PI * 2     // base angle
      data[off + 1] = 20 + Math.random() * 3.5    // radius
      data[off + 2] = (Math.random() - 0.5) * 1.2 // y
      data[off + 3] = Math.random() * 0.07 + 0.02 // scale
      data[off + 4] = (Math.random() * 0.2 + 0.08) * (Math.random() > 0.5 ? 1 : -1) // speed
    }
    return data
  }, [count])

  // Varied asteroid colors
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const shade = 0.35 + Math.random() * 0.3
      const redness = Math.random() * 0.15
      arr[i * 3] = shade + redness
      arr[i * 3 + 1] = shade - redness * 0.5
      arr[i * 3 + 2] = shade - redness
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime() * 0.05

    for (let i = 0; i < count; i++) {
      const off = i * 5
      const angle = asteroids[off] + t * asteroids[off + 4]
      const r = asteroids[off + 1]

      // Fast sin/cos approximation not needed — these are simple enough
      dummy.position.x = Math.cos(angle) * r
      dummy.position.y = asteroids[off + 2]
      dummy.position.z = Math.sin(angle) * r
      dummy.scale.setScalar(asteroids[off + 3])
      dummy.rotation.x = angle * 2
      dummy.rotation.y = angle
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true

    // Update per-instance colors (once at init via geometry attribute)
  })

  // Apply instance colors
  const colorAttr = useMemo(() => {
    const geo = new THREE.InstancedBufferAttribute(colors, 3)
    return geo
  }, [colors])

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled>
      <dodecahedronGeometry args={[1, 1]}>
        <instancedBufferAttribute attach="attributes-instanceColor" args={[colors, 3]} />
      </dodecahedronGeometry>
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={0.3}
      />
    </instancedMesh>
  )
}
