'use client';

import React from 'react';
import { Detailed } from '@react-three/drei';
import { SisyphusRig } from './SisyphusRig';
import { POSES } from './poses';
import { useSceneStore } from '@/stores/sceneStore';
import { useAnimationStore } from '@/stores/animationStore';

interface SisyphusProps {
  pose?: 'standing' | 'pushing' | 'despair';
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export default function Sisyphus({
  pose = 'standing',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: SisyphusProps) {
  const quality = useSceneStore((state) => state.quality);
  const animationState = useAnimationStore((s) => s.state);
  const phaseProgress = useAnimationStore((s) => s.phaseProgress);
  const velocity = useAnimationStore((s) => s.velocity);
  
  const poseData = POSES[pose] || POSES.standing;

  const distances =
    quality === 'high' ? [0, 15, 30] : quality === 'medium' ? [0, 10, 20] : [0, 5, 10];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Detailed distances={distances}>
        <SisyphusRig 
          detail="high" 
          poseData={poseData} 
          animationState={animationState}
          phaseProgress={phaseProgress}
          velocity={velocity}
        />
        <SisyphusRig 
          detail="medium" 
          poseData={poseData} 
          animationState={animationState}
          phaseProgress={phaseProgress}
          velocity={velocity}
        />
        <SisyphusRig 
          detail="low" 
          poseData={poseData} 
          animationState={animationState}
          phaseProgress={phaseProgress}
          velocity={velocity}
        />
      </Detailed>
    </group>
  );
}
