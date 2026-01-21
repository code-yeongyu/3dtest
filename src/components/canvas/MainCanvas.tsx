'use client';

import { useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';
import { useSceneStore } from '@/stores/sceneStore';
import CameraRig from './CameraRig';
import Lighting from './Lighting';
import PhysicsWorld from './PhysicsWorld';

import Boulder from '../three/Boulder/Boulder';
import Sisyphus from '../three/Sisyphus/Sisyphus';
import { Environment } from '../three/Environment/Environment';
import { GoldenSparkles } from '../three/Effects/Particles/GoldenSparkles';
import { DustParticles } from '../three/Effects/Particles/DustParticles';
import { EnergyBurst } from '../three/Effects/Particles/EnergyBurst';
import { RevealText } from '../three/Effects/RevealText';
import PostProcessing from './PostProcessing';

export default function MainCanvas() {
  const { tier, isMobile } = useDeviceCapability();
  const { setQuality, setReady, setLoading } = useSceneStore();
  const boulderRef = useRef<RapierRigidBody>(null);

  useEffect(() => {
    setQuality(tier);
  }, [tier, setQuality]);

  const handleCreated = () => {
    setLoading(false);
    setReady(true);
  };

  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{ position: [5, 2, 8], fov: 75 }}
      shadows={tier !== 'low'}
      flat
      onCreated={handleCreated}
    >
      <Suspense fallback={null}>
        <CameraRig />
        <Lighting />

        <PhysicsWorld enabled={!isMobile}>
          <Environment />
          <Boulder ref={boulderRef} position={[0, 5, 0]} enablePhysicsForce={!isMobile} />
          <Sisyphus position={[1.5, 0, 0]} scale={1.5} />
        </PhysicsWorld>
        
        <RevealText />

        <GoldenSparkles />
        <DustParticles boulderRef={boulderRef} />
        <EnergyBurst />
        <PostProcessing />
      </Suspense>
    </Canvas>
  );
}
