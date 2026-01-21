import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/stores/sceneStore';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

const COUNTS = {
  high: 2000,
  medium: 1000,
  low: 200,
};

const GOLD_COLOR = new THREE.Color('#FFD700');

export function GoldenSparkles() {
  const quality = useSceneStore((s) => s.quality);
  const count = COUNTS[quality] || COUNTS.medium;
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHeight: { value: 20 }, // Height of the fall
  }), []);

  // Initialize particles
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const tempObject = new THREE.Object3D();
    const randoms = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Set initial matrix to identity (we'll handle position in shader)
      tempObject.position.set(0, 0, 0);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);

      // Random attributes
      randoms[i * 3] = (Math.random() - 0.5) * 20; // x
      randoms[i * 3 + 1] = Math.random() * 20;     // y (start height)
      randoms[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

      speeds[i] = 0.5 + Math.random() * 1.5;
      scales[i] = 0.5 + Math.random() * 0.5;
    }

    mesh.instanceMatrix.needsUpdate = true;
    
    // Add custom attributes to geometry
    mesh.geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 3));
    mesh.geometry.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
    mesh.geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));

  }, [count]);

  useFrame((state) => {
    if (materialRef.current && uniforms) {
      uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const onBeforeCompile = (shader: any) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uHeight = uniforms.uHeight;

    shader.vertexShader = `
      uniform float uTime;
      uniform float uHeight;
      attribute vec3 aRandom;
      attribute float aSpeed;
      attribute float aScale;
      ${shader.vertexShader}
    `;

    // Inject position logic
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      vec3 transformed = vec3( position * aScale );
      
      // Calculate position
      vec3 pos = aRandom;
      pos.y = mod(pos.y - uTime * aSpeed, uHeight);
      
      // Add some sway
      pos.x += sin(uTime * aSpeed + pos.y) * 0.2;
      
      transformed += pos;
      `
    );
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false} // Always render as they move in shader
    >
      <tetrahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial
        ref={materialRef}
        color={GOLD_COLOR}
        transparent
        opacity={0.8}
        onBeforeCompile={onBeforeCompile}
      />
    </instancedMesh>
  );
}
