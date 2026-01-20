import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DirectionalLight, HemisphereLight } from 'three';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useSceneStore } from '@/stores/sceneStore';

// Color palettes for each phase
const PALETTES = {
  0: {
    key: new Color('#a8c8ff'),
    ground: new Color('#4a5568'),
    sky: new Color('#87ceeb'),
    rim: new Color('#ffffff'),
  },
  1: {
    key: new Color('#ffffff'),
    ground: new Color('#6b7280'),
    sky: new Color('#e0f7ff'),
    rim: new Color('#ffffff'),
  },
  2: {
    key: new Color('#ffffee'),
    ground: new Color('#8b7355'),
    sky: new Color('#ffd700'),
    rim: new Color('#ffcc99'),
  },
  3: {
    key: new Color('#ffcc99'),
    ground: new Color('#5a3e2b'),
    sky: new Color('#ff8c42'),
    rim: new Color('#ff4400'),
  },
  4: {
    key: new Color('#ffaa44'),
    ground: new Color('#2d1810'),
    sky: new Color('#ff6b35'),
    rim: new Color('#ffd700'),
  },
} as const;

export default function Lighting() {
  const { quality } = useSceneStore();
  const { phase, phaseProgress } = useScrollProgress();
  
  const keyLightRef = useRef<DirectionalLight>(null);
  const fillLightRef = useRef<HemisphereLight>(null);
  const rimLightRef = useRef<DirectionalLight>(null);

  const shadowConfig = useMemo(() => {
    if (quality === 'low') return { castShadow: false };
    
    return {
      castShadow: true,
      'shadow-mapSize': quality === 'high' ? [2048, 2048] : [1024, 1024],
      'shadow-bias': -0.0001,
      'shadow-camera-left': -10,
      'shadow-camera-right': 10,
      'shadow-camera-top': 10,
      'shadow-camera-bottom': -10,
      'shadow-camera-near': 0.1,
      'shadow-camera-far': 50,
    };
  }, [quality]);

  useFrame(() => {
    if (!keyLightRef.current || !fillLightRef.current || !rimLightRef.current) return;

    const currentPalette = PALETTES[phase];
    const nextPhaseIndex = Math.min(4, phase + 1) as keyof typeof PALETTES;
    const nextPalette = PALETTES[nextPhaseIndex];

    keyLightRef.current.color.lerpColors(currentPalette.key, nextPalette.key, phaseProgress);
    fillLightRef.current.color.lerpColors(currentPalette.sky, nextPalette.sky, phaseProgress);
    fillLightRef.current.groundColor.lerpColors(currentPalette.ground, nextPalette.ground, phaseProgress);
    rimLightRef.current.color.lerpColors(currentPalette.rim, nextPalette.rim, phaseProgress);
  });

  return (
    <>
      <directionalLight
        ref={keyLightRef}
        position={[10, 10, 5]}
        intensity={1.5}
        {...shadowConfig}
      />

      <hemisphereLight
        ref={fillLightRef}
        intensity={0.6}
      />

      <directionalLight
        ref={rimLightRef}
        position={[-5, 5, -10]}
        intensity={0.8}
        castShadow={false}
      />
    </>
  );
}
