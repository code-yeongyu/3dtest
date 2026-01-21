import React, { useMemo, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { RigidBody, RigidBodyProps, RapierRigidBody } from '@react-three/rapier';
import { Detailed } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAnimationStore } from '@/stores/animationStore';

interface BoulderProps extends RigidBodyProps {
  seed?: number;
  enablePhysicsForce?: boolean;
}

const createSeededRandom = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const PUSH_FORCE_MAGNITUDE = 15;
const SLOPE_DIRECTION = new THREE.Vector3(0, 0.3, -1).normalize();

const Boulder = forwardRef<RapierRigidBody, BoulderProps>(({ seed = 12345, enablePhysicsForce = false, ...props }, ref) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const prevState = useRef<string | null>(null);

  useImperativeHandle(ref, () => rigidBodyRef.current as RapierRigidBody);

  const state = useAnimationStore((s) => s.state);
  const phaseProgress = useAnimationStore((s) => s.phaseProgress);

  const noise3D = useMemo(() => {
    const rng = createSeededRandom(seed);
    return createNoise3D(() => rng());
  }, [seed]);

  useEffect(() => {
    if (!enablePhysicsForce || !rigidBodyRef.current) return;

    if (prevState.current === 'SUMMIT' && state === 'FALLING') {
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    prevState.current = state;
  }, [state, enablePhysicsForce]);

  useFrame(() => {
    if (!enablePhysicsForce || !rigidBodyRef.current) return;

    if (state === 'PUSHING') {
      const forceMagnitude = PUSH_FORCE_MAGNITUDE * (0.5 + phaseProgress * 0.5);
      rigidBodyRef.current.applyImpulse(
        {
          x: SLOPE_DIRECTION.x * forceMagnitude * 0.016,
          y: SLOPE_DIRECTION.y * forceMagnitude * 0.016,
          z: SLOPE_DIRECTION.z * forceMagnitude * 0.016,
        },
        true
      );
    }
  });

  const { highDetailGeo, lowDetailGeo } = useMemo(() => {
    const generateBoulderGeometry = (detail: number) => {
      const geometry = new THREE.SphereGeometry(1, detail, detail);
      const positionAttribute = geometry.attributes.position;

      const vertex = new THREE.Vector3();

      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        // Multi-frequency noise for rocky detail
        const scale = 1.5;
        const n1 = noise3D(vertex.x * scale, vertex.y * scale, vertex.z * scale);
        const n2 = noise3D(vertex.x * scale * 2, vertex.y * scale * 2, vertex.z * scale * 2) * 0.5;
        const n3 = noise3D(vertex.x * scale * 4, vertex.y * scale * 4, vertex.z * scale * 4) * 0.25;

        const noiseValue = n1 + n2 + n3;
        const displacement = noiseValue * 0.2; // Displacement strength

        // Apply displacement along normal (which is just the normalized position for a sphere)
        vertex.normalize().multiplyScalar(1 + displacement);

        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      geometry.computeVertexNormals();
      return geometry;
    };

    return {
      highDetailGeo: generateBoulderGeometry(64), // ~4225 vertices
      lowDetailGeo: generateBoulderGeometry(16), // ~289 vertices
    };
  }, [noise3D]);

  // Rocky material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#8a8a8a',
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true, // Low poly look fits rocky aesthetic well, or smooth with normal map
    });
  }, []);

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="hull"
      friction={0.8}
      restitution={0.1}
      linearDamping={0.5}
      angularDamping={0.3}
      {...props}
    >
      <Detailed distances={[0, 15]}>
        <mesh geometry={highDetailGeo} material={material} castShadow receiveShadow />
        <mesh geometry={lowDetailGeo} material={material} castShadow receiveShadow />
      </Detailed>
    </RigidBody>
  );
});

Boulder.displayName = 'Boulder';

export default Boulder;
