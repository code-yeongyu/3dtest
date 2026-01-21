import React, { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';

export function DeadTrees() {
  const trees = useMemo(() => {
    return [
      { position: [15, 10, -20], scale: 1.2, rotation: [0, 1, 0.1] },
      { position: [-18, 15, -50], scale: 0.9, rotation: [0.1, 2, 0] },
    ];
  }, []);

  return (
    <group>
      {trees.map((tree, i) => (
        <group
          key={i}
          position={tree.position as [number, number, number]}
          scale={tree.scale}
          rotation={tree.rotation as [number, number, number]}
        >
          <RigidBody type="fixed" colliders="hull">
            <mesh castShadow receiveShadow position={[0, 2, 0]}>
              <cylinderGeometry args={[0.2, 0.4, 4, 6]} />
              <meshStandardMaterial color="#3e2723" />
            </mesh>
          </RigidBody>
          <mesh position={[0.5, 3, 0]} rotation={[0, 0, -0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 2, 4]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>
          <mesh position={[-0.5, 2.5, 0.5]} rotation={[0.5, 0, 0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 1.5, 4]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
