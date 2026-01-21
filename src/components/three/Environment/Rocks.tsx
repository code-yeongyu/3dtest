import React, { useMemo } from 'react';
import { InstancedRigidBodies, InstancedRigidBodyProps } from '@react-three/rapier';

const ROCK_COUNT = 20;
const SPREAD = 40;

const createSeededRandom = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export function Rocks() {
  const instances = useMemo(() => {
    const rng = createSeededRandom(123);
    const instances: InstancedRigidBodyProps[] = [];

    for (let i = 0; i < ROCK_COUNT; i++) {
      // Random position, avoiding the center path (width ~10)
      let x = (rng() - 0.5) * SPREAD * 2;
      if (Math.abs(x) < 8) x = x > 0 ? 8 + rng() * 5 : -8 - rng() * 5;

      const z = (rng() - 0.5) * SPREAD * 4; // Spread along the slope

      // Approximate Y based on slope (simplified, physics will handle actual collision)
      // We'll let them fall or place them slightly high
      const y = (100 - z) * 0.3 + 5;

      const scale = 0.5 + rng() * 1.5;

      instances.push({
        key: 'rock_' + i,
        position: [x, y, z],
        rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
        scale: [scale, scale, scale],
      });
    }

    return instances;
  }, []);

  return (
    <InstancedRigidBodies instances={instances} colliders="hull">
      <instancedMesh args={[undefined, undefined, ROCK_COUNT]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
