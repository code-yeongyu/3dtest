'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';
import { useSceneStore } from '@/stores/sceneStore';
import Stats from './Stats';
import CameraRig from './CameraRig';
import Lighting from './Lighting';

export default function MainCanvas() {
  const { tier, isMobile } = useDeviceCapability();
  const { setQuality, setReady, setLoading } = useSceneStore();

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
      <Stats />
      <CameraRig />
      <Lighting />
      <color attach="background" args={['#000000']} />
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>
      <mesh position={[2, 0, 2]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#ffe66d" />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.5, 0.2, 16, 32]} />
        <meshStandardMaterial color="#95e1d3" />
      </mesh>
      <gridHelper args={[20, 20, '#333333', '#222222']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </Canvas>
  );
}
