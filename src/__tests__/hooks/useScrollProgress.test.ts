import { describe, it, expect } from 'vitest';

import { interpolatePhase, easings, PHASE_NAMES } from '@/hooks/useScrollProgress';

describe('useScrollProgress', () => {
  describe('PHASE_NAMES', () => {
    it('should have 5 phase names', () => {
      // #given / #when / #then
      expect(PHASE_NAMES).toHaveLength(5);
    });

    it('should have correct phase names in order', () => {
      // #given / #when / #then
      expect(PHASE_NAMES).toEqual(['Push', 'Summit', 'Fall', 'Despair', 'Reveal']);
    });
  });

  describe('interpolatePhase', () => {
    describe('with numbers', () => {
      it('should return from value at progress 0', () => {
        // #given
        const from = 0;
        const to = 100;

        // #when
        const result = interpolatePhase(from, to, 0);

        // #then
        expect(result).toBe(0);
      });

      it('should return to value at progress 1', () => {
        // #given
        const from = 0;
        const to = 100;

        // #when
        const result = interpolatePhase(from, to, 1);

        // #then
        expect(result).toBe(100);
      });

      it('should return midpoint at progress 0.5', () => {
        // #given
        const from = 0;
        const to = 100;

        // #when
        const result = interpolatePhase(from, to, 0.5);

        // #then
        expect(result).toBe(50);
      });

      it('should handle negative values', () => {
        // #given
        const from = -50;
        const to = 50;

        // #when
        const result = interpolatePhase(from, to, 0.5);

        // #then
        expect(result).toBe(0);
      });

      it('should apply easing function', () => {
        // #given
        const from = 0;
        const to = 100;
        const easeIn = (t: number) => t * t;

        // #when
        const result = interpolatePhase(from, to, 0.5, easeIn);

        // #then
        expect(result).toBe(25); // 0.5^2 = 0.25, 0 + 100 * 0.25 = 25
      });
    });

    describe('with arrays', () => {
      it('should interpolate each element', () => {
        // #given
        const from = [0, 0, 0];
        const to = [100, 200, 300];

        // #when
        const result = interpolatePhase(from, to, 0.5);

        // #then
        expect(result).toEqual([50, 100, 150]);
      });

      it('should return from array at progress 0', () => {
        // #given
        const from = [10, 20, 30];
        const to = [100, 200, 300];

        // #when
        const result = interpolatePhase(from, to, 0);

        // #then
        expect(result).toEqual([10, 20, 30]);
      });

      it('should return to array at progress 1', () => {
        // #given
        const from = [10, 20, 30];
        const to = [100, 200, 300];

        // #when
        const result = interpolatePhase(from, to, 1);

        // #then
        expect(result).toEqual([100, 200, 300]);
      });

      it('should apply easing to array interpolation', () => {
        // #given
        const from = [0, 0];
        const to = [100, 100];
        const easeIn = (t: number) => t * t;

        // #when
        const result = interpolatePhase(from, to, 0.5, easeIn);

        // #then
        expect(result).toEqual([25, 25]);
      });
    });
  });

  describe('easings', () => {
    describe('linear', () => {
      it('should return input unchanged', () => {
        // #given
        const inputs = [0, 0.25, 0.5, 0.75, 1];

        // #when / #then
        for (const t of inputs) {
          expect(easings.linear(t)).toBe(t);
        }
      });
    });

    describe('easeInOut', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = easings.easeInOut(0);

        // #then
        expect(result).toBe(0);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = easings.easeInOut(1);

        // #then
        expect(result).toBe(1);
      });

      it('should return 0.5 at t=0.5', () => {
        // #given / #when
        const result = easings.easeInOut(0.5);

        // #then
        expect(result).toBe(0.5);
      });

      it('should be slower at start', () => {
        // #given / #when
        const earlyProgress = easings.easeInOut(0.1);

        // #then
        expect(earlyProgress).toBeLessThan(0.1);
      });

      it('should be slower at end', () => {
        // #given / #when
        const lateProgress = easings.easeInOut(0.9);

        // #then
        expect(lateProgress).toBeGreaterThan(0.9);
      });
    });

    describe('easeOut', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = easings.easeOut(0);

        // #then
        expect(result).toBe(0);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = easings.easeOut(1);

        // #then
        expect(result).toBe(1);
      });

      it('should be faster at start', () => {
        // #given / #when
        const earlyProgress = easings.easeOut(0.25);

        // #then
        expect(earlyProgress).toBeGreaterThan(0.25);
      });
    });

    describe('easeIn', () => {
      it('should return 0 at t=0', () => {
        // #given / #when
        const result = easings.easeIn(0);

        // #then
        expect(result).toBe(0);
      });

      it('should return 1 at t=1', () => {
        // #given / #when
        const result = easings.easeIn(1);

        // #then
        expect(result).toBe(1);
      });

      it('should be slower at start', () => {
        // #given / #when
        const earlyProgress = easings.easeIn(0.25);

        // #then
        expect(earlyProgress).toBeLessThan(0.25);
      });
    });
  });
});
