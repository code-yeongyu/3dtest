import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { createNoise2D } from 'simplex-noise';
import { Detailed } from '@react-three/drei';

// Constants
const WIDTH = 100;
const DEPTH = 200;
const PATH_WIDTH = 8;
const NOISE_SCALE = 0.1;
const HEIGHT_SCALE = 5;
const SLOPE_ANGLE = Math.PI / 6;

function GenerateTerrainGeometry(segmentsW: number, segmentsD: number) {
  const geo = new THREE.PlaneGeometry(WIDTH, DEPTH, segmentsW, segmentsD);
  geo.rotateX(-Math.PI / 2);

  const posAttribute = geo.attributes.position;
  const vertex = new THREE.Vector3();
  const noise2D = createNoise2D();

  for (let i = 0; i < posAttribute.count; i++) {
    vertex.fromBufferAttribute(posAttribute, i);

    // Calculate slope (rise along -Z axis)
    const slopeHeight = (DEPTH / 2 - vertex.z) * Math.tan(SLOPE_ANGLE * 0.5);

    let noise = noise2D(vertex.x * NOISE_SCALE, vertex.z * NOISE_SCALE) * HEIGHT_SCALE;

    // Create path by flattening noise near X=0
    const distFromPath = Math.abs(vertex.x);
    const pathInfluence = Math.min(1, Math.max(0, (distFromPath - 2) / PATH_WIDTH));
    const smoothPath = pathInfluence * pathInfluence * (3 - 2 * pathInfluence);

    noise *= smoothPath;

    const pathRoughness = noise2D(vertex.x * 0.5, vertex.z * 0.5) * 0.5;

    vertex.y = slopeHeight + noise + pathRoughness * (1 - smoothPath);

    posAttribute.setY(i, vertex.y);
  }

  geo.computeVertexNormals();
  return geo;
}

export function Terrain() {
  // High detail: 100x200 = 20k verts
  const geometryHigh = useMemo(() => GenerateTerrainGeometry(100, 200), []);

  // Low detail: 50x100 = 5k verts
  const geometryLow = useMemo(() => GenerateTerrainGeometry(50, 100), []);

  return (
    <group>
      {/* Physics body always uses high detail for accuracy */}
      <RigidBody type="fixed" colliders="trimesh">
        <Detailed distances={[0, 80]}>
          <mesh geometry={geometryHigh} receiveShadow castShadow>
            <meshStandardMaterial
              color="#5d4037"
              roughness={0.8}
              metalness={0.2}
              flatShading={true}
            />
          </mesh>
          <mesh geometry={geometryLow} receiveShadow castShadow>
            <meshStandardMaterial
              color="#5d4037"
              roughness={0.8}
              metalness={0.2}
              flatShading={true}
            />
          </mesh>
        </Detailed>
      </RigidBody>
    </group>
  );
}
