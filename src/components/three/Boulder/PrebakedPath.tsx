'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { Detailed } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAnimationStore } from '@/stores/animationStore';

interface PrebakedPathProps {
  seed?: number;
}

const createSeededRandom = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/**
 * PrebakedPath - Mobile-optimized boulder animation using pre-computed curve
 *
 * Replaces physics simulation on mobile with smooth scroll-synced interpolation.
 * Uses CatmullRomCurve3 to match desktop physics trajectory:
 * - Start: (0, 5, 0) - initial position
 * - Uphill: (0, 8, -3) - pushing phase
 * - Summit: (0, 10, -6) - peak
 * - Downhill: (0, 6, -9) - falling phase
 * - Bottom: (0, 2, -12) - final resting position
 *
 * Interpolates position based on phaseProgress for smooth 60fps animation.
 */
const PrebakedPath: React.FC<PrebakedPathProps> = ({ seed = 12345 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  const phaseProgress = useAnimationStore((s) => s.phaseProgress);
  const globalProgress = useAnimationStore((s) => s.globalProgress);

  const noise3D = useMemo(() => {
    const rng = createSeededRandom(seed);
    return createNoise3D(() => rng());
  }, [seed]);

  useEffect(() => {
    const waypoints = [
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(0, 8, -3),
      new THREE.Vector3(0, 10, -6),
      new THREE.Vector3(0, 6, -9),
      new THREE.Vector3(0, 2, -12),
      new THREE.Vector3(0, 2, -12),
    ];

    curveRef.current = new THREE.CatmullRomCurve3(waypoints);
    curveRef.current.curveType = 'catmullrom';
  }, []);

  const { highDetailGeo, lowDetailGeo } = useMemo(() => {
    const generateBoulderGeometry = (detail: number) => {
      const geometry = new THREE.SphereGeometry(1, detail, detail);
      const positionAttribute = geometry.attributes.position;

      const vertex = new THREE.Vector3();

      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        const scale = 1.5;
        const n1 = noise3D(vertex.x * scale, vertex.y * scale, vertex.z * scale);
        const n2 = noise3D(vertex.x * scale * 2, vertex.y * scale * 2, vertex.z * scale * 2) * 0.5;
        const n3 = noise3D(vertex.x * scale * 4, vertex.y * scale * 4, vertex.z * scale * 4) * 0.25;

        const noiseValue = n1 + n2 + n3;
        const displacement = noiseValue * 0.2;

        vertex.normalize().multiplyScalar(1 + displacement);

        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      geometry.computeVertexNormals();
      return geometry;
    };

    return {
      highDetailGeo: generateBoulderGeometry(64),
      lowDetailGeo: generateBoulderGeometry(16),
    };
  }, [noise3D]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#8a8a8a',
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current || !curveRef.current) return;

    const position = curveRef.current.getPoint(globalProgress);
    meshRef.current.position.copy(position);
  });

  return (
    <Detailed distances={[0, 15]}>
      <mesh ref={meshRef} geometry={highDetailGeo} material={material} castShadow receiveShadow />
      <mesh ref={meshRef} geometry={lowDetailGeo} material={material} castShadow receiveShadow />
    </Detailed>
  );
};

export default PrebakedPath;
