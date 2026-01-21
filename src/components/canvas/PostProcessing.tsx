import { forwardRef, useState } from 'react';
import { Mesh } from 'three';
import { EffectComposer, Bloom, GodRays, Vignette } from '@react-three/postprocessing';
import { useSceneStore } from '@/stores/sceneStore';
import { useAnimationStore } from '@/stores/animationStore';

const Sun = forwardRef<Mesh, any>((props, ref) => (
  <mesh ref={ref} position={[10, 10, 5]} {...props}>
    <sphereGeometry args={[1, 32, 32]} />
    <meshBasicMaterial color={[10, 10, 10]} toneMapped={false} />
  </mesh>
));

Sun.displayName = 'Sun';

export default function PostProcessing() {
  const quality = useSceneStore((s) => s.quality);
  const state = useAnimationStore((s) => s.state);
  const [sunRef, setSunRef] = useState<Mesh | null>(null);

  const isHigh = quality === 'high';
  const isMedium = quality === 'medium';
  const isLow = quality === 'low';

  const effects = [
    <Bloom
      key="bloom"
      luminanceThreshold={0.9}
      mipmapBlur
      intensity={1.5}
      radius={0.4}
    />
  ];

  if (!isLow) {
    effects.push(
      <Vignette key="vignette" eskil={false} offset={0.1} darkness={1.1} />
    );
  }

  if (isHigh && state === 'REVEAL' && sunRef) {
    effects.push(
      <GodRays key="godrays" sun={sunRef} samples={60} density={0.96} />
    );
  }

  return (
    <>
      <Sun ref={setSunRef} visible={state === 'REVEAL'} />

      <EffectComposer 
        enableNormalPass={isHigh} 
        multisampling={isHigh ? 4 : 0}
        enabled={true}
      >
        {effects}
      </EffectComposer>
    </>
  );
}
