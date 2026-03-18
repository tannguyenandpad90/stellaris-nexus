import { useMemo } from 'react'
import * as THREE from 'three'

// Atmosphere glow shader — renders a soft halo around planets
export default function Atmosphere({ radius, color = '#4a90d9', intensity = 0.6 }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          float glow = intensity - dot(vNormal, vPositionNormal);
          gl_FragColor = vec4(glowColor, glow * glow * 0.8);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [color, intensity])

  return (
    <mesh material={material} scale={1.15}>
      <sphereGeometry args={[radius, 32, 32]} />
    </mesh>
  )
}
