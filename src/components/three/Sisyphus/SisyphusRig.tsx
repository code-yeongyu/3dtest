import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshStandardMaterial, AnimationMixer, AnimationAction, LoopRepeat, LoopOnce } from 'three';
import { PoseData, POSES } from './poses';
import { createSisyphusAnimations, ANIMATIONS } from './animations';
import { AnimationState } from '@/stores/animationStore';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

interface SisyphusRigProps {
  detail: 'high' | 'medium' | 'low';
  poseData: PoseData;
  animationState?: AnimationState;
  phaseProgress?: number;
  velocity?: number;
}

const MATERIAL = new MeshStandardMaterial({
  color: '#e0e0e0',
  roughness: 0.7,
  metalness: 0.1,
  flatShading: true,
});

const JOINTS_MATERIAL = new MeshStandardMaterial({
  color: '#444',
  roughness: 0.8,
  metalness: 0.2,
  flatShading: true,
});

export function SisyphusRig({ detail, poseData, animationState = 'IDLE', phaseProgress = 0, velocity = 0 }: SisyphusRigProps) {
  const segments = detail === 'high' ? 16 : detail === 'medium' ? 8 : 4;
  const prefersReducedMotion = usePrefersReducedMotion();

  const groupRef = useRef<Group>(null);
  const hipsRef = useRef<Group>(null);
  const spineRef = useRef<Group>(null);
  const chestRef = useRef<Group>(null);
  const neckRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  const shoulderLRef = useRef<Group>(null);
  const armUpperLRef = useRef<Group>(null);
  const armLowerLRef = useRef<Group>(null);
  const handLRef = useRef<Group>(null);

  const shoulderRRef = useRef<Group>(null);
  const armUpperRRef = useRef<Group>(null);
  const armLowerRRef = useRef<Group>(null);
  const handRRef = useRef<Group>(null);

  const legUpperLRef = useRef<Group>(null);
  const legLowerLRef = useRef<Group>(null);
  const footLRef = useRef<Group>(null);

  const legUpperRRef = useRef<Group>(null);
  const legLowerRRef = useRef<Group>(null);
  const footRRef = useRef<Group>(null);

  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, AnimationAction>>({});
  const currentActionRef = useRef<AnimationAction | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const mixer = new AnimationMixer(groupRef.current);
    const clips = createSisyphusAnimations();

    clips.forEach((clip) => {
      const action = mixer.clipAction(clip);
      actionsRef.current[clip.name] = action;
    });

    mixerRef.current = mixer;

    return () => {
      mixer.stopAllAction();
    };
  }, []);

  useEffect(() => {
    if (!mixerRef.current) return;

    if (prefersReducedMotion) {
      mixerRef.current.stopAllAction();
      currentActionRef.current = null;
      return;
    }

    const fadeDuration = 0.5;
    let nextActionName = ANIMATIONS.IDLE;

    switch (animationState) {
      case 'PUSHING':
        nextActionName = ANIMATIONS.PUSH_CYCLE;
        break;
      case 'SUMMIT':
        nextActionName = ANIMATIONS.SUMMIT_REACH;
        break;
      case 'FALLING':
        nextActionName = ANIMATIONS.WATCH_FALL;
        break;
      case 'DESPAIR':
        nextActionName = ANIMATIONS.DESPAIR;
        break;
      case 'REVEAL':
        nextActionName = ANIMATIONS.RISE_AGAIN;
        break;
      default:
        nextActionName = ANIMATIONS.IDLE;
    }

    const nextAction = actionsRef.current[nextActionName];
    const currentAction = currentActionRef.current;

    if (nextAction && nextAction !== currentAction) {
      nextAction.reset().fadeIn(fadeDuration).play();
      
      if (currentAction) {
        currentAction.fadeOut(fadeDuration);
      }

      if (nextActionName === ANIMATIONS.PUSH_CYCLE) {
        nextAction.setLoop(LoopRepeat, Infinity);
      } else {
        nextAction.setLoop(LoopOnce, 1);
        nextAction.clampWhenFinished = true;
      }

      currentActionRef.current = nextAction;
    }
  }, [animationState, prefersReducedMotion]);

  useFrame((state, delta) => {
    if (mixerRef.current && !prefersReducedMotion) {
      mixerRef.current.update(delta);

      if (animationState === 'PUSHING' && currentActionRef.current) {
        const targetTimeScale = Math.max(0.5, Math.min(2.0, Math.abs(velocity) * 50));
        currentActionRef.current.timeScale += (targetTimeScale - currentActionRef.current.timeScale) * 0.1;
      }
    }
  });

  useEffect(() => {
    const getStaticPoseForState = (state: AnimationState): PoseData => {
      switch (state) {
        case 'PUSHING':
          return POSES.pushing;
        case 'DESPAIR':
          return POSES.despair;
        case 'SUMMIT':
        case 'FALLING':
        case 'REVEAL':
        case 'IDLE':
        default:
          return POSES.standing;
      }
    };

    const activePose = prefersReducedMotion ? getStaticPoseForState(animationState) : poseData;
    if (!activePose) return;
    
    const applyRot = (ref: React.RefObject<Group | null>, rot: [number, number, number]) => {
      if (ref.current) {
        ref.current.rotation.set(rot[0], rot[1], rot[2]);
      }
    };

    applyRot(hipsRef, activePose.hips);
    applyRot(spineRef, activePose.spine);
    applyRot(chestRef, activePose.chest);
    applyRot(neckRef, activePose.neck);
    applyRot(headRef, activePose.head);

    applyRot(shoulderLRef, activePose.shoulderL);
    applyRot(armUpperLRef, activePose.armUpperL);
    applyRot(armLowerLRef, activePose.armLowerL);
    applyRot(handLRef, activePose.handL);

    applyRot(shoulderRRef, activePose.shoulderR);
    applyRot(armUpperRRef, activePose.armUpperR);
    applyRot(armLowerRRef, activePose.armLowerR);
    applyRot(handRRef, activePose.handR);

    applyRot(legUpperLRef, activePose.legUpperL);
    applyRot(legLowerLRef, activePose.legLowerL);
    applyRot(footLRef, activePose.footL);

    applyRot(legUpperRRef, activePose.legUpperR);
    applyRot(legLowerRRef, activePose.legLowerR);
    applyRot(footRRef, activePose.footR);
  }, [poseData, prefersReducedMotion, animationState]);

  return (
    <group dispose={null} ref={groupRef}>
      <group ref={hipsRef} name="hips" position={[0, 1, 0]}>
        <mesh material={MATERIAL}>
          <boxGeometry args={[0.3, 0.2, 0.2]} />
        </mesh>

        <group ref={spineRef} name="spine" position={[0, 0.1, 0]}>
          <mesh material={MATERIAL} position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.3, segments]} />
          </mesh>

          <group ref={chestRef} name="chest" position={[0, 0.3, 0]}>
            <mesh material={MATERIAL} position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.18, 0.12, 0.3, segments]} />
            </mesh>

            <group ref={neckRef} name="neck" position={[0, 0.3, 0]}>
              <mesh material={MATERIAL} position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.05, 0.06, 0.1, segments]} />
              </mesh>

              <group ref={headRef} name="head" position={[0, 0.1, 0]}>
                <mesh material={MATERIAL} position={[0, 0.12, 0]}>
                  <sphereGeometry args={[0.12, segments, segments]} />
                </mesh>
              </group>
            </group>

            <group ref={shoulderLRef} name="shoulderL" position={[0.2, 0.2, 0]}>
              <mesh material={JOINTS_MATERIAL}>
                <sphereGeometry args={[0.08, segments, segments]} />
              </mesh>
              <group ref={armUpperLRef} name="armUpperL" position={[0.05, 0, 0]}>
                <mesh material={MATERIAL} position={[0, -0.15, 0]}>
                  <cylinderGeometry args={[0.05, 0.06, 0.3, segments]} />
                </mesh>
                <group ref={armLowerLRef} name="armLowerL" position={[0, -0.3, 0]}>
                  <mesh material={JOINTS_MATERIAL}>
                    <sphereGeometry args={[0.06, segments, segments]} />
                  </mesh>
                  <mesh material={MATERIAL} position={[0, -0.15, 0]}>
                    <cylinderGeometry args={[0.04, 0.05, 0.3, segments]} />
                  </mesh>
                  <group ref={handLRef} name="handL" position={[0, -0.3, 0]}>
                    <mesh material={JOINTS_MATERIAL}>
                      <boxGeometry args={[0.08, 0.08, 0.08]} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            <group ref={shoulderRRef} name="shoulderR" position={[-0.2, 0.2, 0]}>
              <mesh material={JOINTS_MATERIAL}>
                <sphereGeometry args={[0.08, segments, segments]} />
              </mesh>
              <group ref={armUpperRRef} name="armUpperR" position={[-0.05, 0, 0]}>
                <mesh material={MATERIAL} position={[0, -0.15, 0]}>
                  <cylinderGeometry args={[0.05, 0.06, 0.3, segments]} />
                </mesh>
                <group ref={armLowerRRef} name="armLowerR" position={[0, -0.3, 0]}>
                  <mesh material={JOINTS_MATERIAL}>
                    <sphereGeometry args={[0.06, segments, segments]} />
                  </mesh>
                  <mesh material={MATERIAL} position={[0, -0.15, 0]}>
                    <cylinderGeometry args={[0.04, 0.05, 0.3, segments]} />
                  </mesh>
                  <group ref={handRRef} name="handR" position={[0, -0.3, 0]}>
                    <mesh material={JOINTS_MATERIAL}>
                      <boxGeometry args={[0.08, 0.08, 0.08]} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        <group ref={legUpperLRef} name="legUpperL" position={[0.1, 0, 0]}>
          <mesh material={JOINTS_MATERIAL}>
            <sphereGeometry args={[0.09, segments, segments]} />
          </mesh>
          <mesh material={MATERIAL} position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.4, segments]} />
          </mesh>
          <group ref={legLowerLRef} name="legLowerL" position={[0, -0.4, 0]}>
            <mesh material={JOINTS_MATERIAL}>
              <sphereGeometry args={[0.07, segments, segments]} />
            </mesh>
            <mesh material={MATERIAL} position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 0.4, segments]} />
            </mesh>
            <group ref={footLRef} name="footL" position={[0, -0.4, 0]}>
              <mesh material={JOINTS_MATERIAL} position={[0, -0.05, 0.05]}>
                <boxGeometry args={[0.08, 0.1, 0.15]} />
              </mesh>
            </group>
          </group>
        </group>

        <group ref={legUpperRRef} name="legUpperR" position={[-0.1, 0, 0]}>
          <mesh material={JOINTS_MATERIAL}>
            <sphereGeometry args={[0.09, segments, segments]} />
          </mesh>
          <mesh material={MATERIAL} position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.4, segments]} />
          </mesh>
          <group ref={legLowerRRef} name="legLowerR" position={[0, -0.4, 0]}>
            <mesh material={JOINTS_MATERIAL}>
              <sphereGeometry args={[0.07, segments, segments]} />
            </mesh>
            <mesh material={MATERIAL} position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 0.4, segments]} />
            </mesh>
            <group ref={footRRef} name="footR" position={[0, -0.4, 0]}>
              <mesh material={JOINTS_MATERIAL} position={[0, -0.05, 0.05]}>
                <boxGeometry args={[0.08, 0.1, 0.15]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
