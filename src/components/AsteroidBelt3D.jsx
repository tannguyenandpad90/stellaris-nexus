import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 3D asteroid belt between Mars and Jupiter orbits
export default function AsteroidBelt3D({ count = 600 }) {
  const meshRef = useRef()

  const { positions, scales, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Belt between Mars orbit (18) and Jupiter orbit (24)
      const radius = 20 + Math.random() * 3.5
      const angle = Math.random() * Math.PI * 2
      const ySpread = (Math.random() - 0.5) * 1.5

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = ySpread
      positions[i * 3 + 2] = Math.sin(angle) * radius

      scales[i] = Math.random() * 0.08 + 0.02
      speeds[i] = (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1)
    }

    return { positions, scales, speeds }
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime() * 0.05

    for (let i = 0; i < count; i++) {
      const baseAngle = Math.atan2(positions[i * 3 + 2], positions[i * 3])
      const radius = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2)
      const angle = baseAngle + t * speeds[i]

      dummy.position.set(
        Math.cos(angle) * radius,
        positions[i * 3 + 1],
        Math.sin(angle) * radius
      )
      dummy.scale.setScalar(scales[i])
      dummy.rotation.set(t * speeds[i] * 2, t * speeds[i], 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#8a7a6a"
        roughness={0.9}
        metalness={0.2}
      />
    </instancedMesh>
  )
}
