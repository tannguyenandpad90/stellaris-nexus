import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Enhanced Sun with volumetric corona, solar flares, and lens flare
export default function Sun() {
  const sunRef = useRef()
  const glowRef = useRef()
  const coronaRef = useRef()
  const flaresRef = useRef()

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
          return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
          return v;
        }

        void main() {
          vec2 uv = vUv * 5.0;
          float n = fbm(uv + time * 0.2);
          n += 0.4 * fbm(uv * 3.0 - time * 0.3);

          // Sunspot-like dark regions
          float spots = smoothstep(0.55, 0.65, fbm(uv * 2.0 + time * 0.1));

          vec3 col = mix(color1, color2, n);
          col = mix(col, color3, pow(n, 2.5));
          col *= 1.0 - spots * 0.3;

          // Limb darkening
          float rim = dot(vNormal, vec3(0,0,1));
          col *= 0.5 + 0.5 * rim;

          // Brighten core
          col += vec3(0.15, 0.08, 0.0) * pow(rim, 3.0);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  }, [])

  // Corona shader (volumetric glow)
  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#ff8c00') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec3 vNormal;
        varying vec3 vViewDir;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
        }

        void main() {
          float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
          float corona = pow(rim, 2.5);

          // Animated corona filaments
          float angle = atan(vNormal.y, vNormal.x);
          float filament = noise(vec2(angle * 3.0, time * 0.5)) * 0.5 + 0.5;
          corona *= 0.6 + filament * 0.8;

          // Pulsation
          corona *= 0.8 + 0.2 * sin(time * 1.5 + rim * 5.0);

          vec3 col = color * corona * 1.5;
          float alpha = corona * 0.5;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  // Solar flare particles
  const flareGeometry = useMemo(() => {
    const count = 200
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 3 + Math.random() * 2
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = 0.02 + Math.random() * 0.06
      speeds[i] = 0.5 + Math.random() * 1.5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return { geo, count, positions }
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    sunMaterial.uniforms.time.value = t
    coronaMaterial.uniforms.time.value = t

    if (sunRef.current) sunRef.current.rotation.y = t * 0.03
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.03)
    if (coronaRef.current) coronaRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04)

    // Animate flare particles
    if (flaresRef.current) {
      const pos = flaresRef.current.geometry.attributes.position
      const speeds = flaresRef.current.geometry.attributes.aSpeed
      for (let i = 0; i < flareGeometry.count; i++) {
        const speed = speeds.getX(i)
        const ox = flareGeometry.positions[i * 3]
        const oy = flareGeometry.positions[i * 3 + 1]
        const oz = flareGeometry.positions[i * 3 + 2]
        const dist = Math.sqrt(ox * ox + oy * oy + oz * oz)
        const pulse = Math.sin(t * speed + i) * 0.5 + 0.5
        const r = dist + pulse * 1.5
        const ratio = r / dist
        pos.setXYZ(i, ox * ratio, oy * ratio, oz * ratio)
      }
      pos.needsUpdate = true
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
        <sphereGeometry args={[3.4, 32, 32]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {/* Volumetric corona */}
      <mesh ref={coronaRef} material={coronaMaterial}>
        <sphereGeometry args={[5, 48, 48]} />
      </mesh>

      {/* Outer haze */}
      <mesh>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial color="#ff6b00" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Solar flare particles */}
      <points ref={flaresRef} geometry={flareGeometry.geo}>
        <pointsMaterial color="#ffaa44" size={0.08} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      {/* Lights */}
      <pointLight color="#ffd700" intensity={200} distance={200} decay={1.5} />
      <pointLight color="#ff8c00" intensity={50} distance={100} decay={2} />
    </group>
  )
}
