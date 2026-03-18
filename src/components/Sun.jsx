import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Sun() {
  const sunRef = useRef()
  const glowRef = useRef()
  const coronaRef = useRef()

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#ff6b00') },
        color2: { value: new THREE.Color('#ffd700') },
        color3: { value: new THREE.Color('#ff4500') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Simple noise function
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 uv = vUv * 4.0;
          float n = noise(uv + time * 0.3);
          n += 0.5 * noise(uv * 2.0 + time * 0.5);
          n += 0.25 * noise(uv * 4.0 + time * 0.7);
          n /= 1.75;

          vec3 color = mix(color1, color2, n);
          color = mix(color, color3, pow(n, 2.0));

          // Limb darkening
          float rim = dot(vNormal, vec3(0.0, 0.0, 1.0));
          color *= 0.6 + 0.4 * rim;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    sunMaterial.uniforms.time.value = t

    if (sunRef.current) {
      sunRef.current.rotation.y = t * 0.05
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.03)
    }
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05)
    }
  })

  return (
    <group>
      {/* Sun sphere */}
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[3, 64, 64]} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.3, 32, 32]} />
        <meshBasicMaterial
          color="#ff8c00"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff6b00"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light from sun */}
      <pointLight
        color="#ffd700"
        intensity={200}
        distance={200}
        decay={1.5}
      />
      <pointLight
        color="#ff8c00"
        intensity={50}
        distance={100}
        decay={2}
      />
    </group>
  )
}
