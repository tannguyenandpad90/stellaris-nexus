import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Optimized Sun: reduced geometry, simplified flares, efficient shaders
export default function Sun() {
  const sunRef = useRef()
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
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1, color2, color3;
        varying vec2 vUv;
        varying vec3 vNormal;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
        }
        void main() {
          vec2 uv = vUv * 4.0;
          float n = noise(uv + time * 0.2) + 0.5 * noise(uv * 2.0 - time * 0.3) + 0.25 * noise(uv * 4.0 + time * 0.15);
          n /= 1.75;
          vec3 col = mix(color1, color2, n);
          col = mix(col, color3, n * n);
          col *= 0.5 + 0.5 * dot(vNormal, vec3(0,0,1));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  }, [])

  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, color: { value: new THREE.Color('#ff8c00') } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
          float corona = pow(rim, 2.5) * (0.8 + 0.2 * sin(time * 1.5 + rim * 5.0));
          gl_FragColor = vec4(color * corona * 1.5, corona * 0.4);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    sunMaterial.uniforms.time.value = t
    coronaMaterial.uniforms.time.value = t
    if (sunRef.current) sunRef.current.rotation.y = t * 0.03
    if (coronaRef.current) coronaRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04)
  })

  return (
    <group>
      {/* Sun sphere — reduced to 48 segments */}
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[3, 48, 48]} />
      </mesh>

      {/* Corona — single BackSide sphere with shader */}
      <mesh ref={coronaRef} material={coronaMaterial}>
        <sphereGeometry args={[5, 32, 32]} />
      </mesh>

      {/* Outer haze — very cheap */}
      <mesh>
        <sphereGeometry args={[6.5, 16, 16]} />
        <meshBasicMaterial color="#ff6b00" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Lights */}
      <pointLight color="#ffd700" intensity={200} distance={200} decay={1.5} />
      <pointLight color="#ff8c00" intensity={40} distance={80} decay={2} />
    </group>
  )
}
