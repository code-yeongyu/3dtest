import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  useAnimationStore,
  getStateFromPhase,
  isValidTransition,
} from '@/stores/animationStore';

describe('animationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAnimationStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have IDLE as initial state', () => {
      // #given / #when
      const state = useAnimationStore.getState();

      // #then
      expect(state.state).toBe('IDLE');
    });

    it('should have null previousState initially', () => {
      // #given / #when
      const state = useAnimationStore.getState();

      // #then
      expect(state.previousState).toBe(null);
    });

    it('should have phase 0 initially', () => {
      // #given / #when
      const state = useAnimationStore.getState();

      // #then
      expect(state.phase).toBe(0);
    });

    it('should have PUSH as initial phaseKey', () => {
      // #given / #when
      const state = useAnimationStore.getState();

      // #then
      expect(state.phaseKey).toBe('PUSH');
    });

    it('should have idle direction initially', () => {
      // #given / #when
      const state = useAnimationStore.getState();

      // #then
      expect(state.direction).toBe('idle');
    });

    it('should not be transitioning initially', () => {
      // #given / #when
      const state = useAnimationStore.getState();

      // #then
      expect(state.isTransitioning).toBe(false);
    });
  });

  describe('setStateImmediate', () => {
    it('should set state immediately', () => {
      // #given
      const store = useAnimationStore.getState();

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(useAnimationStore.getState().state).toBe('PUSHING');
    });

    it('should set previousState', () => {
      // #given
      const store = useAnimationStore.getState();

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(useAnimationStore.getState().previousState).toBe('IDLE');
    });

    it('should not set previousState if state unchanged', () => {
      // #given
      const store = useAnimationStore.getState();
      store.setStateImmediate('PUSHING');
      store.setStateImmediate('SUMMIT');

      // #when
      store.setStateImmediate('SUMMIT');

      // #then
      expect(useAnimationStore.getState().previousState).toBe('PUSHING');
    });

    it('should clear transitioning state', () => {
      // #given
      const store = useAnimationStore.getState();
      store.startTransition();
      expect(useAnimationStore.getState().isTransitioning).toBe(true);

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(useAnimationStore.getState().isTransitioning).toBe(false);
    });

    it('should notify listeners on state change', () => {
      // #given
      const callback = vi.fn();
      const store = useAnimationStore.getState();
      store.onStateTransition(callback);

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(callback).toHaveBeenCalledWith('PUSHING', 'IDLE');
    });
  });

  describe('setState', () => {
    it('should transition to new state via setStateImmediate', () => {
      // #given
      const store = useAnimationStore.getState();

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(useAnimationStore.getState().state).toBe('PUSHING');
    });

    it('should not notify on same state', () => {
      // #given
      const store = useAnimationStore.getState();
      store.setStateImmediate('PUSHING');
      const callback = vi.fn();
      store.onStateTransition(callback);
      callback.mockClear();

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(callback).not.toHaveBeenCalled();
    });

    it('should track state changes correctly', () => {
      // #given
      const store = useAnimationStore.getState();

      // #when - sequential state changes
      store.setStateImmediate('PUSHING');
      store.setStateImmediate('SUMMIT');
      store.setStateImmediate('FALLING');

      // #then
      expect(useAnimationStore.getState().state).toBe('FALLING');
      expect(useAnimationStore.getState().previousState).toBe('SUMMIT');
    });
  });

  describe('setPhaseData', () => {
    it('should update phase data', () => {
      // #given
      const store = useAnimationStore.getState();

      // #when
      store.setPhaseData({
        phase: 2,
        phaseKey: 'FALL',
        phaseProgress: 0.5,
        easedProgress: 0.6,
        globalProgress: 0.5,
        direction: 'down',
        velocity: 0.3,
        isScrolling: true,
      });

      // #then
      const state = useAnimationStore.getState();
      expect(state.phase).toBe(2);
      expect(state.phaseKey).toBe('FALL');
      expect(state.phaseProgress).toBe(0.5);
      expect(state.easedProgress).toBe(0.6);
      expect(state.globalProgress).toBe(0.5);
      expect(state.direction).toBe('down');
      expect(state.velocity).toBe(0.3);
      expect(state.isScrolling).toBe(true);
    });

    it('should update phase data without triggering animated transition', () => {
      // #given
      const store = useAnimationStore.getState();
      store.setStateImmediate('PUSHING');

      // #when
      store.setPhaseData({
        phase: 1,
        phaseKey: 'SUMMIT',
        phaseProgress: 0.5,
        easedProgress: 0.5,
        globalProgress: 0.3,
        direction: 'down',
        velocity: 0.1,
        isScrolling: true,
      });

      // #then
      expect(useAnimationStore.getState().phase).toBe(1);
      expect(useAnimationStore.getState().phaseKey).toBe('SUMMIT');
    });

    it('should ignore micro-movements (scroll bounce protection)', () => {
      // #given
      const store = useAnimationStore.getState();
      store.setStateImmediate('PUSHING');
      const callback = vi.fn();
      store.onStateTransition(callback);
      callback.mockClear();

      // #when - very low velocity
      store.setPhaseData({
        phase: 1,
        phaseKey: 'SUMMIT',
        phaseProgress: 0.5,
        easedProgress: 0.5,
        globalProgress: 0.3,
        direction: 'down',
        velocity: 0.001, // Below threshold
        isScrolling: true,
      });
      vi.advanceTimersByTime(500);

      // #then - should not transition due to low velocity
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('startTransition / endTransition', () => {
    it('should set isTransitioning to true', () => {
      // #given
      const store = useAnimationStore.getState();

      // #when
      store.startTransition();

      // #then
      expect(useAnimationStore.getState().isTransitioning).toBe(true);
    });

    it('should set transitionProgress to 0 on start', () => {
      // #given
      const store = useAnimationStore.getState();

      // #when
      store.startTransition();

      // #then
      expect(useAnimationStore.getState().transitionProgress).toBe(0);
    });

    it('should set isTransitioning to false on end', () => {
      // #given
      const store = useAnimationStore.getState();
      store.startTransition();

      // #when
      store.endTransition();

      // #then
      expect(useAnimationStore.getState().isTransitioning).toBe(false);
    });

    it('should set transitionProgress to 1 on end', () => {
      // #given
      const store = useAnimationStore.getState();
      store.startTransition();

      // #when
      store.endTransition();

      // #then
      expect(useAnimationStore.getState().transitionProgress).toBe(1);
    });
  });

  describe('onPhaseChange / onStateTransition', () => {
    it('should register callback', () => {
      // #given
      const callback = vi.fn();
      const store = useAnimationStore.getState();

      // #when
      const unsubscribe = store.onPhaseChange(callback);

      // #then
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback on state change', () => {
      // #given
      const callback = vi.fn();
      const store = useAnimationStore.getState();
      store.onPhaseChange(callback);

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(callback).toHaveBeenCalledWith('PUSHING', 'IDLE');
    });

    it('should unsubscribe correctly', () => {
      // #given
      const callback = vi.fn();
      const store = useAnimationStore.getState();
      const unsubscribe = store.onPhaseChange(callback);
      unsubscribe();

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(callback).not.toHaveBeenCalled();
    });

    it('onStateTransition should be alias for onPhaseChange', () => {
      // #given
      const callback = vi.fn();
      const store = useAnimationStore.getState();
      store.onStateTransition(callback);

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(callback).toHaveBeenCalledWith('PUSHING', 'IDLE');
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // #given
      const store = useAnimationStore.getState();
      store.setStateImmediate('SUMMIT');
      store.setPhaseData({
        phase: 2,
        phaseKey: 'FALL',
        phaseProgress: 0.5,
        easedProgress: 0.5,
        globalProgress: 0.5,
        direction: 'down',
        velocity: 0.5,
        isScrolling: true,
      });

      // #when
      store.reset();

      // #then
      const state = useAnimationStore.getState();
      expect(state.state).toBe('IDLE');
      expect(state.previousState).toBe(null);
      expect(state.phase).toBe(0);
      expect(state.phaseKey).toBe('PUSH');
      expect(state.direction).toBe('idle');
      expect(state.isScrolling).toBe(false);
    });

    it('should keep listeners after reset', () => {
      // #given
      const callback = vi.fn();
      const store = useAnimationStore.getState();
      store.onPhaseChange(callback);
      store.reset();
      callback.mockClear();

      // #when
      store.setStateImmediate('PUSHING');

      // #then
      expect(callback).toHaveBeenCalled();
    });
  });
});

describe('selectors (store access)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAnimationStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('state selector', () => {
    it('should return current state via getState', () => {
      // #given
      useAnimationStore.getState().setStateImmediate('PUSHING');

      // #when
      const state = useAnimationStore.getState().state;

      // #then
      expect(state).toBe('PUSHING');
    });
  });

  describe('phase data selector', () => {
    it('should return phase data via getState', () => {
      // #given
      useAnimationStore.getState().setStateImmediate('FALLING');
      useAnimationStore.getState().setPhaseData({
        phase: 2,
        phaseKey: 'FALL',
        phaseProgress: 0.5,
        easedProgress: 0.6,
        globalProgress: 0.5,
        direction: 'down',
        velocity: 0.3,
        isScrolling: true,
      });

      // #when
      const store = useAnimationStore.getState();

      // #then
      expect(store.phase).toBe(2);
      expect(store.phaseKey).toBe('FALL');
      expect(store.phaseProgress).toBe(0.5);
      expect(store.easedProgress).toBe(0.6);
    });
  });

  describe('progress selector', () => {
    it('should return progress values via getState', () => {
      // #given
      useAnimationStore.getState().setStateImmediate('FALLING');
      useAnimationStore.getState().setPhaseData({
        phase: 2,
        phaseKey: 'FALL',
        phaseProgress: 0.5,
        easedProgress: 0.6,
        globalProgress: 0.45,
        direction: 'down',
        velocity: 0.3,
        isScrolling: true,
      });

      // #when
      const store = useAnimationStore.getState();

      // #then
      expect(store.globalProgress).toBe(0.45);
      expect(store.phaseProgress).toBe(0.5);
      expect(store.easedProgress).toBe(0.6);
    });
  });

  describe('transitioning selector', () => {
    it('should return transitioning state via getState', () => {
      // #given
      useAnimationStore.getState().startTransition();

      // #when
      const isTransitioning = useAnimationStore.getState().isTransitioning;

      // #then
      expect(isTransitioning).toBe(true);
    });
  });

  describe('transition progress selector', () => {
    it('should return transition progress via getState', () => {
      // #given
      useAnimationStore.getState().startTransition();

      // #when
      const progress = useAnimationStore.getState().transitionProgress;

      // #then
      expect(progress).toBe(0);
    });
  });

  describe('scroll context selector', () => {
    it('should return scroll context via getState', () => {
      // #given
      useAnimationStore.getState().setPhaseData({
        phase: 0,
        phaseKey: 'PUSH',
        phaseProgress: 0.5,
        easedProgress: 0.5,
        globalProgress: 0.1,
        direction: 'down',
        velocity: 0.3,
        isScrolling: true,
      });

      // #when
      const store = useAnimationStore.getState();

      // #then
      expect(store.direction).toBe('down');
      expect(store.velocity).toBe(0.3);
      expect(store.isScrolling).toBe(true);
    });
  });
});

describe('utility functions', () => {
  describe('getStateFromPhase', () => {
    it('should map phase 0 to PUSHING', () => {
      // #given / #when
      const state = getStateFromPhase(0);

      // #then
      expect(state).toBe('PUSHING');
    });

    it('should map phase 1 to SUMMIT', () => {
      // #given / #when
      const state = getStateFromPhase(1);

      // #then
      expect(state).toBe('SUMMIT');
    });

    it('should map phase 2 to FALLING', () => {
      // #given / #when
      const state = getStateFromPhase(2);

      // #then
      expect(state).toBe('FALLING');
    });

    it('should map phase 3 to DESPAIR', () => {
      // #given / #when
      const state = getStateFromPhase(3);

      // #then
      expect(state).toBe('DESPAIR');
    });

    it('should map phase 4 to REVEAL', () => {
      // #given / #when
      const state = getStateFromPhase(4);

      // #then
      expect(state).toBe('REVEAL');
    });
  });

  describe('isValidTransition', () => {
    it('should return true for different states', () => {
      // #given / #when
      const valid = isValidTransition('IDLE', 'PUSHING');

      // #then
      expect(valid).toBe(true);
    });

    it('should return false for same state', () => {
      // #given / #when
      const valid = isValidTransition('PUSHING', 'PUSHING');

      // #then
      expect(valid).toBe(false);
    });
  });
});
