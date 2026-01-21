import * as THREE from 'three';

export class ParticlePool {
  mesh: THREE.InstancedMesh;
  capacity: number;
  cursor: number = 0;

  constructor(mesh: THREE.InstancedMesh, capacity: number) {
    this.mesh = mesh;
    this.capacity = capacity;
    this.mesh.count = 0; // Start with 0 visible
  }

  /**
   * Get the next available index for spawning a particle.
   * Automatically updates the mesh count if we haven't reached capacity yet.
   */
  spawn(): number {
    const index = this.cursor;
    this.cursor = (this.cursor + 1) % this.capacity;
    
    // If we haven't filled the pool yet, increase the draw count
    if (this.mesh.count < this.capacity) {
      this.mesh.count++;
    }
    
    return index;
  }

  /**
   * Update a Vec3 attribute at the given index
   */
  setVec3(name: string, index: number, x: number, y: number, z: number) {
    const attr = this.mesh.geometry.getAttribute(name) as THREE.InstancedBufferAttribute;
    if (attr) {
      attr.setXYZ(index, x, y, z);
      attr.needsUpdate = true;
      
      // Optimization: define update range if possible, but for ring buffer 
      // with frequent updates, full update might be safer or we manage ranges manually.
      // For now, let Three.js handle it.
    }
  }

  /**
   * Update a Float attribute at the given index
   */
  setFloat(name: string, index: number, value: number) {
    const attr = this.mesh.geometry.getAttribute(name) as THREE.InstancedBufferAttribute;
    if (attr) {
      attr.setX(index, value);
      attr.needsUpdate = true;
    }
  }
}
