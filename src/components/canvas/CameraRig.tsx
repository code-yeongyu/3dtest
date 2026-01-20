'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress, easings, type AnimationPhase } from '@/hooks/useScrollProgress';

interface Waypoint {
  position: THREE.Vector3Tuple;
  lookAt: THREE.Vector3Tuple;
}

const WAYPOINTS: Record<AnimationPhase, Waypoint> = {
  0: { position: [5, 2, 8], lookAt: [0, 1, 0] },
  1: { position: [3, 5, 6], lookAt: [0, 3, 0] },
  2: { position: [8, 6, 10], lookAt: [2, 0, 2] },
  3: { position: [2, 1, 4], lookAt: [0, 0.5, 0] },
  4: { position: [0, 8, 15], lookAt: [0, 5, 0] },
};

const LERP_FACTOR = 0.05;

function lerpVector3(current: THREE.Vector3, target: THREE.Vector3Tuple, factor: number): void {
  current.x += (target[0] - current.x) * factor;
  current.y += (target[1] - current.y) * factor;
  current.z += (target[2] - current.z) * factor;
}

function interpolateWaypoints(
  phase: AnimationPhase,
  phaseProgress: number
): { position: THREE.Vector3Tuple; lookAt: THREE.Vector3Tuple } {
  const currentWaypoint = WAYPOINTS[phase];
  const nextPhase = Math.min(4, phase + 1) as AnimationPhase;
  const nextWaypoint = WAYPOINTS[nextPhase];

  const easedProgress = easings.easeInOut(phaseProgress);

  const position: THREE.Vector3Tuple = [
    currentWaypoint.position[0] +
      (nextWaypoint.position[0] - currentWaypoint.position[0]) * easedProgress,
    currentWaypoint.position[1] +
      (nextWaypoint.position[1] - currentWaypoint.position[1]) * easedProgress,
    currentWaypoint.position[2] +
      (nextWaypoint.position[2] - currentWaypoint.position[2]) * easedProgress,
  ];

  const lookAt: THREE.Vector3Tuple = [
    currentWaypoint.lookAt[0] +
      (nextWaypoint.lookAt[0] - currentWaypoint.lookAt[0]) * easedProgress,
    currentWaypoint.lookAt[1] +
      (nextWaypoint.lookAt[1] - currentWaypoint.lookAt[1]) * easedProgress,
    currentWaypoint.lookAt[2] +
      (nextWaypoint.lookAt[2] - currentWaypoint.lookAt[2]) * easedProgress,
  ];

  return { position, lookAt };
}

export default function CameraRig() {
  const { camera } = useThree();
  const { phase, phaseProgress } = useScrollProgress();

  const targetPosition = useRef(new THREE.Vector3(...WAYPOINTS[0].position));
  const targetLookAt = useRef(new THREE.Vector3(...WAYPOINTS[0].lookAt));
  const currentLookAt = useRef(new THREE.Vector3(...WAYPOINTS[0].lookAt));

  useFrame(() => {
    const { position, lookAt } = interpolateWaypoints(phase, phaseProgress);

    targetPosition.current.set(...position);
    targetLookAt.current.set(...lookAt);

    lerpVector3(
      camera.position,
      targetPosition.current.toArray() as THREE.Vector3Tuple,
      LERP_FACTOR
    );
    lerpVector3(
      currentLookAt.current,
      targetLookAt.current.toArray() as THREE.Vector3Tuple,
      LERP_FACTOR
    );

    camera.lookAt(currentLookAt.current);
  });

  return null;
}
