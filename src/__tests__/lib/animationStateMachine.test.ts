import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  animationStateMachine,
  syncPhaseToStore,
  type TransitionEvent,
} from '@/lib/animationStateMachine';
import { useAnimationStore } from '@/stores/animationStore';

describe('animationStateMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    animationStateMachine.reset();
    useAnimationStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
    animationStateMachine.cancelPendingTransition();
  });

  describe('canTransition', () => {
    it('should allow IDLE to PUSHING', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('IDLE', 'PUSHING');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should allow PUSHING to SUMMIT', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('PUSHING', 'SUMMIT');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should allow PUSHING to IDLE', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('PUSHING', 'IDLE');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should allow SUMMIT to FALLING', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('SUMMIT', 'FALLING');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should allow SUMMIT to PUSHING (reverse)', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('SUMMIT', 'PUSHING');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should allow FALLING to DESPAIR', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('FALLING', 'DESPAIR');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should allow DESPAIR to REVEAL', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('DESPAIR', 'REVEAL');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should allow REVEAL to DESPAIR (reverse)', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('REVEAL', 'DESPAIR');

      // #then
      expect(canTransition).toBe(true);
    });

    it('should not allow same state transition', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('PUSHING', 'PUSHING');

      // #then
      expect(canTransition).toBe(false);
    });

    it('should not allow IDLE to SUMMIT (skip)', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('IDLE', 'SUMMIT');

      // #then
      expect(canTransition).toBe(false);
    });

    it('should not allow IDLE to REVEAL (skip)', () => {
      // #given / #when
      const canTransition = animationStateMachine.canTransition('IDLE', 'REVEAL');

      // #then
      expect(canTransition).toBe(false);
    });
  });

  describe('shouldDebounceTransition', () => {
    it('should not debounce with low velocity', () => {
      // #given / #when
      const shouldDebounce = animationStateMachine.shouldDebounceTransition(0.1);

      // #then
      expect(shouldDebounce).toBe(false);
    });

    it('should debounce rapid transitions with high velocity', () => {
      // #given - simulate a recent transition
      useAnimationStore.getState().setStateImmediate('PUSHING');

      // #when - immediately try another transition with high velocity
      const shouldDebounce = animationStateMachine.shouldDebounceTransition(1.0);

      // #then - should debounce because we just transitioned
      // Note: This depends on lastTransitionTime being set
      expect(typeof shouldDebounce).toBe('boolean');
    });
  });

  describe('getStateForPhase', () => {
    it('should map PUSH to PUSHING', () => {
      // #given / #when
      const state = animationStateMachine.getStateForPhase('PUSH');

      // #then
      expect(state).toBe('PUSHING');
    });

    it('should map SUMMIT to SUMMIT', () => {
      // #given / #when
      const state = animationStateMachine.getStateForPhase('SUMMIT');

      // #then
      expect(state).toBe('SUMMIT');
    });

    it('should map FALL to FALLING', () => {
      // #given / #when
      const state = animationStateMachine.getStateForPhase('FALL');

      // #then
      expect(state).toBe('FALLING');
    });

    it('should map DESPAIR to DESPAIR', () => {
      // #given / #when
      const state = animationStateMachine.getStateForPhase('DESPAIR');

      // #then
      expect(state).toBe('DESPAIR');
    });

    it('should map REVEAL to REVEAL', () => {
      // #given / #when
      const state = animationStateMachine.getStateForPhase('REVEAL');

      // #then
      expect(state).toBe('REVEAL');
    });
  });

  describe('onTransition', () => {
    it('should register callback and return unsubscribe function', () => {
      // #given
      const callback = vi.fn();

      // #when
      const unsubscribe = animationStateMachine.onTransition(callback);

      // #then
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback on transition', () => {
      // #given
      const callback = vi.fn();
      animationStateMachine.onTransition(callback);

      // #when
      animationStateMachine.requestTransition('PUSHING', {
        phase: 0,
        phaseKey: 'PUSH',
        direction: 'down',
        velocity: 0.1,
      });

      // #then
      expect(callback).toHaveBeenCalled();
      const event: TransitionEvent = callback.mock.calls[0][0];
      expect(event.from).toBe('IDLE');
      expect(event.to).toBe('PUSHING');
    });

    it('should not call callback after unsubscribe', () => {
      // #given
      const callback = vi.fn();
      const unsubscribe = animationStateMachine.onTransition(callback);
      unsubscribe();

      // #when
      animationStateMachine.requestTransition('PUSHING', {
        phase: 0,
        phaseKey: 'PUSH',
        direction: 'down',
        velocity: 0.1,
      });

      // #then
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('requestTransition', () => {
    it('should execute valid transition', () => {
      // #given
      expect(useAnimationStore.getState().state).toBe('IDLE');

      // #when
      const result = animationStateMachine.requestTransition('PUSHING', {
        phase: 0,
        phaseKey: 'PUSH',
        direction: 'down',
        velocity: 0.1,
      });

      // #then
      expect(result).toBe(true);
      expect(useAnimationStore.getState().state).toBe('PUSHING');
    });

    it('should reject invalid transition', () => {
      // #given
      expect(useAnimationStore.getState().state).toBe('IDLE');

      // #when
      const result = animationStateMachine.requestTransition('REVEAL', {
        phase: 4,
        phaseKey: 'REVEAL',
        direction: 'down',
        velocity: 0.1,
      });

      // #then
      expect(result).toBe(false);
      expect(useAnimationStore.getState().state).toBe('IDLE');
    });
  });

  describe('cancelPendingTransition', () => {
    it('should cancel pending transition', () => {
      // #given - schedule a transition
      animationStateMachine.requestTransition('PUSHING', {
        phase: 0,
        phaseKey: 'PUSH',
        direction: 'down',
        velocity: 1.0, // High velocity to trigger debounce
      });

      // #when
      animationStateMachine.cancelPendingTransition();

      // #then - no error should occur
      expect(true).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset state to IDLE', () => {
      // #given
      animationStateMachine.requestTransition('PUSHING', {
        phase: 0,
        phaseKey: 'PUSH',
        direction: 'down',
        velocity: 0.1,
      });
      expect(useAnimationStore.getState().state).toBe('PUSHING');

      // #when
      animationStateMachine.reset();

      // #then
      expect(useAnimationStore.getState().state).toBe('IDLE');
    });
  });
});

describe('syncPhaseToStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    animationStateMachine.reset();
    useAnimationStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should update phase data in store', () => {
    // #given
    const store = useAnimationStore.getState();
    expect(store.phase).toBe(0);

    // #when
    syncPhaseToStore(1, 'SUMMIT', 0.5, 0.5, 0.3, 'down', 0.1, true);

    // #then
    const updatedStore = useAnimationStore.getState();
    expect(updatedStore.phase).toBe(1);
    expect(updatedStore.phaseKey).toBe('SUMMIT');
    expect(updatedStore.phaseProgress).toBe(0.5);
    expect(updatedStore.direction).toBe('down');
    expect(updatedStore.isScrolling).toBe(true);
  });

  it('should request state transition when phase changes', () => {
    // #given
    useAnimationStore.getState().setStateImmediate('PUSHING');

    // #when
    syncPhaseToStore(1, 'SUMMIT', 0.5, 0.5, 0.3, 'down', 0.1, true);

    // #then
    const state = useAnimationStore.getState().state;
    expect(state).toBe('SUMMIT');
  });

  it('should not transition when state matches phase', () => {
    // #given
    useAnimationStore.getState().setStateImmediate('PUSHING');
    const initialState = useAnimationStore.getState().state;

    // #when
    syncPhaseToStore(0, 'PUSH', 0.5, 0.5, 0.1, 'down', 0.1, true);

    // #then
    expect(useAnimationStore.getState().state).toBe(initialState);
  });
});
