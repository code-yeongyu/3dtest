import React from 'react';
import { Sky, Stars } from '@react-three/drei';
import { Terrain } from './Terrain';
import { Rocks } from './Rocks';
import { DeadTrees } from './DeadTrees';

export function Environment() {
  return (
    <group>
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.6}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
        rayleigh={3}
        turbidity={10}
      />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <ambientLight intensity={0.2} />

      <Terrain />
      <Rocks />
      <DeadTrees />

      <fog attach="fog" args={['#202030', 10, 150]} />
    </group>
  );
}
