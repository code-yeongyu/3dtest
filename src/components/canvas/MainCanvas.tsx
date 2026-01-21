'use client';

import { useEffect, useRef, Suspense, lazy } from 'react';
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

const GoldenSparkles = lazy(() => import('../three/Effects/Particles/GoldenSparkles').then(m => ({ default: m.GoldenSparkles })));
const DustParticles = lazy(() => import('../three/Effects/Particles/DustParticles').then(m => ({ default: m.DustParticles })));
const EnergyBurst = lazy(() => import('../three/Effects/Particles/EnergyBurst').then(m => ({ default: m.EnergyBurst })));
const RevealText = lazy(() => import('../three/Effects/RevealText').then(m => ({ default: m.RevealText })));
const PostProcessing = lazy(() => import('./PostProcessing'));

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
