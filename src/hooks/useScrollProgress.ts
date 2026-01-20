'use client';

import { useEffect, useSyncExternalStore } from 'react';

export type AnimationPhase = 0 | 1 | 2 | 3 | 4;

export interface ScrollProgress {
  progress: number;
  phase: AnimationPhase;
  phaseProgress: number;
}

const PHASE_BOUNDARIES = [0, 0.2, 0.4, 0.6, 0.8, 1.0] as const;

export const PHASE_NAMES = ['Push', 'Summit', 'Fall', 'Despair', 'Reveal'] as const;

let scrollProgress: ScrollProgress = {
  progress: 0,
  phase: 0,
  phaseProgress: 0,
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ScrollProgress {
  return scrollProgress;
}

// Cached server snapshot to avoid React infinite loop
// (useSyncExternalStore requires getServerSnapshot to return stable reference)
const serverSnapshot: ScrollProgress = { progress: 0, phase: 0, phaseProgress: 0 };

function getServerSnapshot(): ScrollProgress {
  return serverSnapshot;
}

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

function updateScrollProgress(progress: number) {
  const { phase, phaseProgress } = calculatePhase(progress);

  if (
    scrollProgress.progress !== progress ||
    scrollProgress.phase !== phase ||
    scrollProgress.phaseProgress !== phaseProgress
  ) {
    scrollProgress = { progress, phase, phaseProgress };
    emitChange();
  }
}

export function useScrollProgress(): ScrollProgress {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      updateScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
