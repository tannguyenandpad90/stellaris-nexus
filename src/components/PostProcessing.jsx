import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

export default function PostProcessing({ mode = 'solar' }) {
  const bloomIntensity = mode === 'galaxy' ? 2.0 : mode === 'deepspace' ? 1.8 : 1.5
  const bloomRadius = mode === 'galaxy' ? 1.0 : 0.8

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={bloomRadius}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0004, 0.0004)}
        radialModulation
        modulationOffset={0.5}
      />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  )
}
