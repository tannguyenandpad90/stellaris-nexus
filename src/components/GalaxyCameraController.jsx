import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DEFAULT_POS = new THREE.Vector3(0, 35, 55)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)
const LERP_SPEED = 0.025

export default function GalaxyCameraController({ targetPosition, controlsRef }) {
  const { camera } = useThree()
  const goalPos = useRef(new THREE.Vector3().copy(DEFAULT_POS))
  const goalTarget = useRef(new THREE.Vector3().copy(DEFAULT_TARGET))
  const currentTarget = useRef(new THREE.Vector3().copy(DEFAULT_TARGET))
  const isAnimating = useRef(false)

  useEffect(() => {
    if (targetPosition) {
      // Fly to star: offset camera to show star nicely
      const target = new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2])
      const dir = target.clone().sub(camera.position).normalize()
      // Position camera above and slightly behind the star
      const offset = new THREE.Vector3(-dir.x * 5, 3, -dir.z * 5)
      goalPos.current.copy(target).add(offset)
      goalTarget.current.copy(target)
      isAnimating.current = true

      // Temporarily disable orbit controls during animation
      if (controlsRef?.current) {
        controlsRef.current.enabled = false
      }
    } else {
      goalPos.current.copy(DEFAULT_POS)
      goalTarget.current.copy(DEFAULT_TARGET)
      isAnimating.current = true
    }
  }, [targetPosition, camera, controlsRef])

  useFrame(() => {
    if (!isAnimating.current) return

    camera.position.lerp(goalPos.current, LERP_SPEED)
    currentTarget.current.lerp(goalTarget.current, LERP_SPEED)
    camera.lookAt(currentTarget.current)

    // Re-enable controls when close enough
    const dist = camera.position.distanceTo(goalPos.current)
    if (dist < 0.1) {
      isAnimating.current = false
      if (controlsRef?.current) {
        controlsRef.current.enabled = true
        controlsRef.current.target.copy(currentTarget.current)
        controlsRef.current.update()
      }
    }
  })

  return null
}
