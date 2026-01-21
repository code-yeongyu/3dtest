import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { useSceneStore } from '@/stores/sceneStore';
import { ParticlePool } from './ParticlePool';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

interface DustParticlesProps {
  boulderRef: React.RefObject<RapierRigidBody | null>;
}

const COUNTS = {
  high: 30000,
  medium: 15000,
  low: 3000,
};

const DUST_COLOR = new THREE.Color('#8a8a8a');

export function DustParticles({ boulderRef }: DustParticlesProps) {
  const quality = useSceneStore((s) => s.quality);
  const count = COUNTS[quality] || COUNTS.medium;
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const poolRef = useRef<ParticlePool | null>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  // Initialize pool
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Create pool
    poolRef.current = new ParticlePool(meshRef.current, count);
    
    // Initialize attributes
    const startTimes = new Float32Array(count).fill(-1000); // Start in past (invisible)
    const lifeTimes = new Float32Array(count).fill(1);
    const startPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count).fill(1);

    const geometry = meshRef.current.geometry;
    geometry.setAttribute('aStartTime', new THREE.InstancedBufferAttribute(startTimes, 1));
    geometry.setAttribute('aLife', new THREE.InstancedBufferAttribute(lifeTimes, 1));
    geometry.setAttribute('aStartPos', new THREE.InstancedBufferAttribute(startPositions, 3));
    geometry.setAttribute('aVelocity', new THREE.InstancedBufferAttribute(velocities, 3));
    geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));

    // Set initial matrix to identity
    const tempObject = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

  }, [count]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (materialRef.current) {
      uniforms.uTime.value = time;
    }

    if (boulderRef.current && poolRef.current) {
      // Rapier WASM throws if rigid body not initialized yet
      let vel: { x: number; y: number; z: number };
      try {
        vel = boulderRef.current.linvel();
      } catch {
        return;
      }
      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
      
      // Spawn if moving fast enough
      if (speed > 0.5) {
        const pos = boulderRef.current.translation();
        const spawnCount = Math.min(Math.ceil(speed * 2), 10); // Scale with speed

        for (let i = 0; i < spawnCount; i++) {
          const index = poolRef.current.spawn();
          
          // Random offset at bottom of boulder (radius ~1)
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.8;
          const offsetX = Math.cos(angle) * r;
          const offsetZ = Math.sin(angle) * r;
          const offsetY = -0.8 + Math.random() * 0.4; // Bottom area

          poolRef.current.setVec3('aStartPos', index, pos.x + offsetX, pos.y + offsetY, pos.z + offsetZ);
          
          // Velocity: slightly outward + random up
          poolRef.current.setVec3('aVelocity', index, 
            vel.x * 0.2 + (Math.random() - 0.5) * 0.5,
            Math.random() * 0.5,
            vel.z * 0.2 + (Math.random() - 0.5) * 0.5
          );
          
          poolRef.current.setFloat('aStartTime', index, time);
          poolRef.current.setFloat('aLife', index, 1.0 + Math.random()); // 1-2 seconds life
          poolRef.current.setFloat('aScale', index, 0.5 + Math.random() * 0.5);
        }
      }
    }
  });

  const onBeforeCompile = (shader: any) => {
    shader.uniforms.uTime = uniforms.uTime;

    shader.vertexShader = `
      uniform float uTime;
      attribute float aStartTime;
      attribute float aLife;
      attribute vec3 aStartPos;
      attribute vec3 aVelocity;
      attribute float aScale;
      varying float vAlpha;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      float age = uTime - aStartTime;
      vAlpha = 0.0;
      
      vec3 transformed = vec3( position );

      if (age >= 0.0 && age < aLife) {
        vAlpha = 1.0 - (age / aLife);
        
        // Scale down as it dies
        transformed *= aScale * vAlpha;
        
        // Move
        vec3 move = aVelocity * age;
        // Add gravity/drag?
        move.y -= 0.5 * age * age; // Simple gravity
        
        transformed += aStartPos + move;
      } else {
        // Hide
        transformed = vec3(0.0);
      }
      `
    );

    shader.fragmentShader = `
      varying float vAlpha;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      gl_FragColor.a *= vAlpha;
      if (gl_FragColor.a < 0.01) discard;
      `
    );
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial
        ref={materialRef}
        color={DUST_COLOR}
        transparent
        opacity={0.6}
        onBeforeCompile={onBeforeCompile}
      />
    </instancedMesh>
  );
}
