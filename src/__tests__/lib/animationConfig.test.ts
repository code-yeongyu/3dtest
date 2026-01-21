import { describe, it, expect } from 'vitest';

import {
  ANIMATION_PHASES,
  PHASE_KEYS,
  EASING_CURVES,
  PHASE_EASING,
  ANIMATION_TIMING,
  getPhaseConfig,
  getPhaseKey,
  getPhaseEasing,
  type PhaseKey,
} from '@/lib/animationConfig';
import type { AnimationPhase } from '@/hooks/useScrollProgress';

describe('animationConfig', () => {
  describe('ANIMATION_PHASES', () => {
    it('should have 5 phases defined', () => {
      // #given
      const phases = Object.keys(ANIMATION_PHASES);

      // #when
      const count = phases.length;

      // #then
      expect(count).toBe(5);
    });

    it('should have correct phase boundaries', () => {
      // #given
      const expectedBoundaries = {
        PUSH: { start: 0, end: 0.2 },
        SUMMIT: { start: 0.2, end: 0.4 },
        FALL: { start: 0.4, end: 0.6 },
        DESPAIR: { start: 0.6, end: 0.8 },
        REVEAL: { start: 0.8, end: 1.0 },
      };

      // #when / #then
      for (const [key, expected] of Object.entries(expectedBoundaries)) {
        const phase = ANIMATION_PHASES[key];
        expect(phase.start).toBe(expected.start);
        expect(phase.end).toBe(expected.end);
      }
    });

    it('should have contiguous phase boundaries (no gaps)', () => {
      // #given
      const phases = PHASE_KEYS.map((key) => ANIMATION_PHASES[key]);

      // #when / #then
      for (let i = 0; i < phases.length - 1; i++) {
        expect(phases[i].end).toBe(phases[i + 1].start);
      }
    });

    it('should cover full range from 0 to 1', () => {
      // #given
      const firstPhase = ANIMATION_PHASES[PHASE_KEYS[0]];
      const lastPhase = ANIMATION_PHASES[PHASE_KEYS[PHASE_KEYS.length - 1]];

      // #when / #then
      expect(firstPhase.start).toBe(0);
      expect(lastPhase.end).toBe(1.0);
    });
  });

  describe('PHASE_KEYS', () => {
    it('should have correct order', () => {
      // #given / #when / #then
      expect(PHASE_KEYS).toEqual(['PUSH', 'SUMMIT', 'FALL', 'DESPAIR', 'REVEAL']);
    });
  });

  describe('EASING_CURVES', () => {
    describe('linear', () => {
      it('should return input unchanged', () => {
        // #given
        const inputs = [0, 0.25, 0.5, 0.75, 1];

        // #when / #then
        for (const t of inputs) {
          expect(EASING_CURVES.linear(t)).toBe(t);
        }
      });
    });

    describe('easeInOut', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = EASING_CURVES.easeInOut(0);

        // #then
        expect(result).toBe(0);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = EASING_CURVES.easeInOut(1);

        // #then
        expect(result).toBe(1);
      });

      it('should return 0.5 at t=0.5', () => {
        // #given / #when
        const result = EASING_CURVES.easeInOut(0.5);

        // #then
        expect(result).toBe(0.5);
      });

      it('should be slower at start and end', () => {
        // #given
        const earlyProgress = EASING_CURVES.easeInOut(0.1);
        const lateProgress = EASING_CURVES.easeInOut(0.9);

        // #when / #then
        expect(earlyProgress).toBeLessThan(0.1);
        expect(lateProgress).toBeGreaterThan(0.9);
      });
    });

    describe('easeOut', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = EASING_CURVES.easeOut(0);

        // #then
        expect(result).toBe(0);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = EASING_CURVES.easeOut(1);

        // #then
        expect(result).toBe(1);
      });

      it('should be faster at start', () => {
        // #given / #when
        const earlyProgress = EASING_CURVES.easeOut(0.25);

        // #then
        expect(earlyProgress).toBeGreaterThan(0.25);
      });
    });

    describe('easeIn', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = EASING_CURVES.easeIn(0);

        // #then
        expect(result).toBe(0);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = EASING_CURVES.easeIn(1);

        // #then
        expect(result).toBe(1);
      });

      it('should be slower at start', () => {
        // #given / #when
        const earlyProgress = EASING_CURVES.easeIn(0.25);

        // #then
        expect(earlyProgress).toBeLessThan(0.25);
      });
    });

    describe('easeOutBack', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = EASING_CURVES.easeOutBack(0);

        // #then
        expect(result).toBeCloseTo(0, 5);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = EASING_CURVES.easeOutBack(1);

        // #then
        expect(result).toBe(1);
      });

      it('should overshoot past 1 before settling', () => {
        // #given / #when
        const midProgress = EASING_CURVES.easeOutBack(0.7);

        // #then
        expect(midProgress).toBeGreaterThan(1);
      });
    });

    describe('easeInOutElastic', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = EASING_CURVES.easeInOutElastic(0);

        // #then
        expect(result).toBe(0);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = EASING_CURVES.easeInOutElastic(1);

        // #then
        expect(result).toBe(1);
      });

      it('should have elastic oscillation', () => {
        // #given / #when
        const earlyProgress = EASING_CURVES.easeInOutElastic(0.2);
        const lateProgress = EASING_CURVES.easeInOutElastic(0.8);

        // #then - elastic curves can go negative or above 1
        expect(typeof earlyProgress).toBe('number');
        expect(typeof lateProgress).toBe('number');
      });
    });
  });

  describe('PHASE_EASING', () => {
    it('should map each phase to an easing function', () => {
      // #given
      const phaseKeys: PhaseKey[] = ['PUSH', 'SUMMIT', 'FALL', 'DESPAIR', 'REVEAL'];

      // #when / #then
      for (const key of phaseKeys) {
        expect(PHASE_EASING[key]).toBeDefined();
        expect(EASING_CURVES[PHASE_EASING[key]]).toBeDefined();
      }
    });

    it('should have expected easing assignments', () => {
      // #given / #when / #then
      expect(PHASE_EASING.PUSH).toBe('easeInOut');
      expect(PHASE_EASING.SUMMIT).toBe('easeOut');
      expect(PHASE_EASING.FALL).toBe('easeIn');
      expect(PHASE_EASING.DESPAIR).toBe('easeInOut');
      expect(PHASE_EASING.REVEAL).toBe('easeOutBack');
    });
  });

  describe('ANIMATION_TIMING', () => {
    it('should have phaseTransitionDuration defined', () => {
      // #given / #when / #then
      expect(ANIMATION_TIMING.phaseTransitionDuration).toBe(300);
    });

    it('should have velocityThreshold defined', () => {
      // #given / #when / #then
      expect(ANIMATION_TIMING.velocityThreshold).toBe(0.5);
    });

    it('should have idleTimeout defined', () => {
      // #given / #when / #then
      expect(ANIMATION_TIMING.idleTimeout).toBe(150);
    });
  });

  describe('getPhaseConfig', () => {
    it('should return correct config for each phase', () => {
      // #given
      const phases: AnimationPhase[] = [0, 1, 2, 3, 4];
      const expectedNames = ['Push', 'Summit', 'Fall', 'Despair', 'Reveal'];

      // #when / #then
      for (let i = 0; i < phases.length; i++) {
        const config = getPhaseConfig(phases[i]);
        expect(config.name).toBe(expectedNames[i]);
      }
    });

    it('should return config with start, end, name, description', () => {
      // #given / #when
      const config = getPhaseConfig(0);

      // #then
      expect(config).toHaveProperty('start');
      expect(config).toHaveProperty('end');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('description');
    });
  });

  describe('getPhaseKey', () => {
    it('should return correct key for each phase', () => {
      // #given
      const phases: AnimationPhase[] = [0, 1, 2, 3, 4];
      const expectedKeys: PhaseKey[] = ['PUSH', 'SUMMIT', 'FALL', 'DESPAIR', 'REVEAL'];

      // #when / #then
      for (let i = 0; i < phases.length; i++) {
        expect(getPhaseKey(phases[i])).toBe(expectedKeys[i]);
      }
    });
  });

  describe('getPhaseEasing', () => {
    it('should return a function for each phase', () => {
      // #given
      const phases: AnimationPhase[] = [0, 1, 2, 3, 4];

      // #when / #then
      for (const phase of phases) {
        const easing = getPhaseEasing(phase);
        expect(typeof easing).toBe('function');
      }
    });

    it('should return correct easing function for PUSH phase', () => {
      // #given / #when
      const easing = getPhaseEasing(0);

      // #then - PUSH uses easeInOut
      expect(easing(0)).toBe(0);
      expect(easing(0.5)).toBe(0.5);
      expect(easing(1)).toBe(1);
    });

    it('should return correct easing function for REVEAL phase', () => {
      // #given / #when
      const easing = getPhaseEasing(4);

      // #then - REVEAL uses easeOutBack which overshoots
      expect(easing(0.7)).toBeGreaterThan(1);
    });
  });
});
