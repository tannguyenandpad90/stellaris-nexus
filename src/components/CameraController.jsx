import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DEFAULT_POS = new THREE.Vector3(0, 30, 50)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)

export default function CameraController({ targetPosition, isActive }) {
  const { camera } = useThree()
  const currentTarget = useRef(new THREE.Vector3())
  const currentPos = useRef(new THREE.Vector3(0, 30, 50))
  const goalPos = useRef(new THREE.Vector3())
  const goalTarget = useRef(new THREE.Vector3())

  useEffect(() => {
    if (isActive && targetPosition) {
      // Fly to planet: position camera offset from planet
      const offset = new THREE.Vector3(3, 2, 5)
      goalPos.current.copy(targetPosition).add(offset)
      goalTarget.current.copy(targetPosition)
    } else {
      // Return to overview
      goalPos.current.copy(DEFAULT_POS)
      goalTarget.current.copy(DEFAULT_TARGET)
    }
  }, [targetPosition, isActive])

  useFrame(() => {
    const lerpFactor = 0.03

    // Smoothly interpolate camera position
    currentPos.current.lerp(goalPos.current, lerpFactor)
    camera.position.copy(currentPos.current)

    // Smoothly interpolate look-at target
    currentTarget.current.lerp(goalTarget.current, lerpFactor)
    camera.lookAt(currentTarget.current)
  })

  return null
}
