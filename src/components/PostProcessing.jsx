import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function PostProcessing({ mode = 'solar' }) {
  // Lighter bloom for solar (performance), stronger for galaxy (cinematic)
  const intensity = mode === 'galaxy' ? 1.8 : mode === 'deepspace' ? 1.5 : 1.2
  const radius = mode === 'galaxy' ? 0.9 : 0.7

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={intensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={radius}
      />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  )
}
