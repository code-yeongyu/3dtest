import type { AnimationPhase } from '@/hooks/useScrollProgress';

export interface PhaseConfig {
  start: number;
  end: number;
  name: string;
  description: string;
}

export const ANIMATION_PHASES: Record<string, PhaseConfig> = {
  PUSH: { start: 0, end: 0.2, name: 'Push', description: 'Sisyphus pushes the boulder uphill' },
  SUMMIT: { start: 0.2, end: 0.4, name: 'Summit', description: 'Reaching the peak moment' },
  FALL: { start: 0.4, end: 0.6, name: 'Fall', description: 'Boulder rolls back down' },
  DESPAIR: {
    start: 0.6,
    end: 0.8,
    name: 'Despair',
    description: 'Moment of existential reflection',
  },
  REVEAL: { start: 0.8, end: 1.0, name: 'Reveal', description: 'OlympusCode brand reveal' },
} as const;

export const PHASE_KEYS = ['PUSH', 'SUMMIT', 'FALL', 'DESPAIR', 'REVEAL'] as const;
export type PhaseKey = (typeof PHASE_KEYS)[number];

export const EASING_CURVES = {
  linear: (t: number) => t,
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
} as const;

export type EasingKey = keyof typeof EASING_CURVES;

export const PHASE_EASING: Record<PhaseKey, EasingKey> = {
  PUSH: 'easeInOut',
  SUMMIT: 'easeOut',
  FALL: 'easeIn',
  DESPAIR: 'easeInOut',
  REVEAL: 'easeOutBack',
} as const;

export const ANIMATION_TIMING = {
  phaseTransitionDuration: 300,
  velocityThreshold: 0.5,
  idleTimeout: 150,
} as const;

export function getPhaseConfig(phase: AnimationPhase): PhaseConfig {
  return Object.values(ANIMATION_PHASES)[phase];
}

export function getPhaseKey(phase: AnimationPhase): PhaseKey {
  return PHASE_KEYS[phase];
}

export function getPhaseEasing(phase: AnimationPhase): (t: number) => number {
  const key = getPhaseKey(phase);
  return EASING_CURVES[PHASE_EASING[key]];
}
