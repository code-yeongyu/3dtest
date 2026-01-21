'use client';

import React from 'react';
import { Physics, PhysicsProps } from '@react-three/rapier';

interface PhysicsWorldProps extends Omit<PhysicsProps, 'children'> {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * PhysicsWorld - Conditional Rapier physics wrapper
 *
 * Desktop only physics simulation with:
 * - Gravity for natural boulder rolling
 * - Optimized timestep for 60fps+
 *
 * When disabled (mobile), children render without physics simulation.
 */
export default function PhysicsWorld({
  children,
  enabled = true,
  gravity = [0, -9.81, 0],
  timeStep = 1 / 60,
  ...props
}: PhysicsWorldProps) {
  if (!enabled) {
    // On mobile: render children without physics wrapper
    // RigidBody components will still render but won't simulate
    return <>{children}</>;
  }

  return (
    <Physics
      gravity={gravity}
      timeStep={timeStep}
      interpolate
      colliders={false}
      {...props}
    >
      {children}
    </Physics>
  );
}
