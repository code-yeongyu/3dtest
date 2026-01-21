'use client';

import { useCallback, useEffect, useState } from 'react';

export type AnimationPhase = 0 | 1 | 2 | 3 | 4;

export type ScrollDirection = 'up' | 'down' | 'idle';

export interface ScrollProgress {
  progress: number;
  phase: AnimationPhase;
  phaseProgress: number;
  direction: ScrollDirection;
  velocity: number;
}

const PHASE_BOUNDARIES = [0, 0.2, 0.4, 0.6, 0.8, 1.0] as const;

export const PHASE_NAMES = ['Push', 'Summit', 'Fall', 'Despair', 'Reveal'] as const;

const initialProgress: ScrollProgress = {
  progress: 0,
  phase: 0,
  phaseProgress: 0,
  direction: 'idle',
  velocity: 0,
};

function calculatePhase(progress: number): { phase: AnimationPhase; phaseProgress: number } {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  for (let i = 0; i < PHASE_BOUNDARIES.length - 1; i++) {
    const start = PHASE_BOUNDARIES[i];
    const end = PHASE_BOUNDARIES[i + 1];

    if (clampedProgress >= start && clampedProgress < end) {
      const phaseProgress = (clampedProgress - start) / (end - start);
      return { phase: i as AnimationPhase, phaseProgress };
    }
  }

  return { phase: 4, phaseProgress: 1 };
}

export function useScrollProgress(): ScrollProgress {
  const [scrollData, setScrollData] = useState<ScrollProgress>(initialProgress);

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
    const { phase, phaseProgress } = calculatePhase(progress);

    setScrollData((prev) => {
      const deltaProgress = progress - prev.progress;
      const direction: ScrollDirection =
        deltaProgress > 0.0001 ? 'down' : deltaProgress < -0.0001 ? 'up' : 'idle';
      const velocity = Math.abs(deltaProgress) * 1000;

      if (
        prev.progress === progress &&
        prev.phase === phase &&
        prev.direction === direction
      ) {
        return prev;
      }

      return { progress, phase, phaseProgress, direction, velocity };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return scrollData;
}

export function interpolatePhase<T extends number | number[]>(
  from: T,
  to: T,
  phaseProgress: number,
  easing: (t: number) => number = (t) => t
): T {
  const easedProgress = easing(phaseProgress);

  if (typeof from === 'number' && typeof to === 'number') {
    return (from + (to - from) * easedProgress) as T;
  }

  if (Array.isArray(from) && Array.isArray(to)) {
    return from.map((v, i) => v + (to[i] - v) * easedProgress) as T;
  }

  return from;
}

export const easings = {
  linear: (t: number) => t,
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
} as const;
