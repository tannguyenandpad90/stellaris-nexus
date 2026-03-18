import { useMemo } from 'react'
import * as THREE from 'three'

export default function OrbitRing({ radius, isSelected }) {
  const points = useMemo(() => {
    const pts = []
    const segments = 128
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={isSelected ? '#00f5ff' : '#ffffff'}
        transparent
        opacity={isSelected ? 0.4 : 0.08}
        linewidth={1}
      />
    </line>
  )
}
