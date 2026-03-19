import { Canvas, useFrame as useR3Frame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense, memo } from 'react'
import Sun from './Sun'
import Planet from './Planet'
import OrbitRing from './OrbitRing'
import AsteroidBelt3D from './AsteroidBelt3D'
import PostProcessing from './PostProcessing'
import Scene3DLoader from './Scene3DLoader'
import planets from '../data/planets.json'

// Keeps render loop alive for animations
function RenderLoop() {
  useR3Frame(() => {})
  return null
}

function Scene({ onPlanetSelect, selectedPlanet, timeScale }) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <Stars radius={200} depth={100} count={4000} factor={4} saturation={0.2} fade speed={0.3} />
      <Sun />
      <AsteroidBelt3D count={300} />

      {planets.map((planet) => (
        <group key={planet.id}>
          <OrbitRing radius={planet.orbitRadius} isSelected={selectedPlanet?.id === planet.id} />
          <Planet
            data={planet}
            timeScale={timeScale}
            isSelected={selectedPlanet?.id === planet.id}
            onClick={() => onPlanetSelect(planet.id)}
          />
        </group>
      ))}

      <PostProcessing mode="solar" />
      <RenderLoop />
    </>
  )
}

const SolarSystem = memo(function SolarSystem({ onPlanetSelect, selectedPlanet, timeScale }) {
  return (
    <Canvas
      camera={{ position: [0, 30, 50], fov: 60, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false, toneMapping: 3, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#040410']} />

      <Suspense fallback={<Scene3DLoader label="Solar System" />}>
        <Scene onPlanetSelect={onPlanetSelect} selectedPlanet={selectedPlanet} timeScale={timeScale} />
      </Suspense>

      <OrbitControls
        enableDamping dampingFactor={0.05}
        minDistance={5} maxDistance={120}
        maxPolarAngle={Math.PI * 0.85}
        enablePan panSpeed={0.5} rotateSpeed={0.5} zoomSpeed={0.8}
      />
    </Canvas>
  )
})

export default SolarSystem
