import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/stores/sceneStore';
import { useAnimationStore } from '@/stores/animationStore';
import { ParticlePool } from './ParticlePool';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

const COUNTS = {
  high: 10000,
  medium: 5000,
  low: 1000,
};

const ENERGY_COLOR = new THREE.Color('#00ffff');

export function EnergyBurst() {
  const quality = useSceneStore((s) => s.quality);
  const count = COUNTS[quality] || COUNTS.medium;
  const animationState = useAnimationStore((s) => s.state);
  const prevAnimationState = useRef(animationState);
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
    
    poolRef.current = new ParticlePool(meshRef.current, count);
    
    const startTimes = new Float32Array(count).fill(-1000);
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

    // Trigger burst on state change to REVEAL
    if (animationState === 'REVEAL' && prevAnimationState.current !== 'REVEAL') {
      if (poolRef.current) {
        // Spawn all particles
        for (let i = 0; i < count; i++) {
          const index = poolRef.current.spawn();
          
          // Sphere burst
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 0.5 + Math.random() * 2.0;
          
          const vx = Math.sin(phi) * Math.cos(theta);
          const vy = Math.sin(phi) * Math.sin(theta);
          const vz = Math.cos(phi);
          
          poolRef.current.setVec3('aStartPos', index, 0, 5, 0); // Center at (0,5,0)
          poolRef.current.setVec3('aVelocity', index, vx * 5, vy * 5, vz * 5);
          poolRef.current.setFloat('aStartTime', index, time);
          poolRef.current.setFloat('aLife', index, 2.0 + Math.random() * 2.0);
          poolRef.current.setFloat('aScale', index, 0.5 + Math.random());
        }
      }
    }
    prevAnimationState.current = animationState;
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
        vAlpha = pow(vAlpha, 0.5); // Fade out curve
        
        transformed *= aScale * vAlpha;
        
        vec3 move = aVelocity * age;
        move *= (1.0 - age/aLife * 0.5); // Drag
        
        transformed += aStartPos + move;
      } else {
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
      <tetrahedronGeometry args={[0.1, 0]} />
      <meshBasicMaterial
        ref={materialRef}
        color={ENERGY_COLOR}
        transparent
        opacity={0.9}
        onBeforeCompile={onBeforeCompile}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
