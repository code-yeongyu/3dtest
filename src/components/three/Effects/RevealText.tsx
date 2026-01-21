import { Text } from '@react-three/drei';
import { useAnimationStore } from '@/stores/animationStore';
import { useEffect, useRef } from 'react';
import { Group, Color } from 'three';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

export function RevealText() {
  const groupRef = useRef<Group>(null);
  const state = useAnimationStore((s) => s.state);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!groupRef.current) return;

    if (state === 'REVEAL') {
      if (prefersReducedMotion) {
        gsap.set(groupRef.current.position, { y: 0 });
      } else {
        gsap.to(groupRef.current.position, {
          y: 0,
          duration: 2.5,
          ease: 'power3.out',
        });
      }
    } else {
      gsap.set(groupRef.current.position, { y: 50 });
    }
  }, [state, prefersReducedMotion]);

  const titleColor = new Color(2, 2, 2);
  const taglineColor = new Color(1.2, 1.2, 1.2);

  return (
    <group ref={groupRef} position={[0, 50, 0]}>
      <Text
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        fontSize={5}
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
        color={titleColor}
      >
        OlympusCode
      </Text>

      <Text
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        fontSize={1.5}
        position={[0, -4, 0]}
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
        color={taglineColor}
      >
        Code like a god
      </Text>
    </group>
  );
}
