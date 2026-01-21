import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { AnimationPhase, ScrollDirection } from '@/hooks/useScrollProgress';
import { ANIMATION_TIMING, type PhaseKey } from '@/lib/animationConfig';

/**
 * Animation states representing the Sisyphus narrative phases.
 * Maps directly to scroll phases (0-4) with an additional 'IDLE' state.
 */
export type AnimationState = 'IDLE' | 'PUSHING' | 'SUMMIT' | 'FALLING' | 'DESPAIR' | 'REVEAL';

/**
 * Callback type for state transition events
 */
export type StateTransitionCallback = (
  state: AnimationState,
  previousState: AnimationState | null
) => void;

export interface AnimationStoreState {
  // Core state
  state: AnimationState;
  previousState: AnimationState | null;

  // Phase data
  phase: AnimationPhase;
  phaseKey: PhaseKey;
  phaseProgress: number;
  easedProgress: number;
  globalProgress: number;

  // Scroll context
  direction: ScrollDirection;
  velocity: number;
  isScrolling: boolean;

  // Transition state
  isTransitioning: boolean;
  transitionProgress: number;
  transitionStartTime: number | null;

  // Internal: debounce tracking (prefixed with _ to indicate internal)
  _lastStateChangeTime: number;
  _pendingState: AnimationState | null;
  _transitionTimeoutId: ReturnType<typeof setTimeout> | null;
  _transitionRafId: number | null;

  // Subscribers
  listeners: Set<StateTransitionCallback>;
}

export interface AnimationStoreActions {
  /**
   * Set state directly (with debounce protection)
   */
  setState: (state: AnimationState) => void;

  /**
   * Set phase data from useAnimationPhase hook.
   * Handles debouncing and scroll bounce protection internally.
   */
  setPhaseData: (data: {
    phase: AnimationPhase;
    phaseKey: PhaseKey;
    phaseProgress: number;
    easedProgress: number;
    globalProgress: number;
    direction: ScrollDirection;
    velocity: number;
    isScrolling: boolean;
  }) => void;

  /**
   * Force set state immediately, bypassing debounce.
   * Use sparingly - mainly for initialization or testing.
   */
  setStateImmediate: (state: AnimationState) => void;

  /**
   * Start a transition animation
   */
  startTransition: () => void;

  /**
   * End a transition animation
   */
  endTransition: () => void;

  /**
   * Subscribe to phase/state change events.
   * Returns unsubscribe function.
   */
  onPhaseChange: (callback: StateTransitionCallback) => () => void;

  /**
   * Alias for onPhaseChange for semantic clarity
   */
  onStateTransition: (callback: StateTransitionCallback) => () => void;

  /**
   * Reset store to initial state
   */
  reset: () => void;
}

export type AnimationStore = AnimationStoreState & AnimationStoreActions;

/**
 * Maps AnimationPhase (0-4) to AnimationState
 */
function phaseToState(phase: AnimationPhase): AnimationState {
  switch (phase) {
    case 0:
      return 'PUSHING';
    case 1:
      return 'SUMMIT';
    case 2:
      return 'FALLING';
    case 3:
      return 'DESPAIR';
    case 4:
      return 'REVEAL';
    default:
      return 'IDLE';
  }
}

/**
 * Minimum scroll velocity to trigger state change (prevents micro-movements / scroll bounce)
 */
const SCROLL_BOUNCE_THRESHOLD = 0.01;

/**
 * Minimum time between state changes (debounce for rapid scrolling)
 */
const STATE_CHANGE_DEBOUNCE_MS = ANIMATION_TIMING.phaseTransitionDuration;

/**
 * Notify all listeners of a state change
 */
function notifyListeners(
  listeners: Set<StateTransitionCallback>,
  state: AnimationState,
  previousState: AnimationState | null
) {
  for (const callback of listeners) {
    try {
      callback(state, previousState);
    } catch (error) {
      console.error('[AnimationStore] Listener callback error:', error);
    }
  }
}

/**
 * Execute state transition with animated progress
 */
function executeStateTransition(
  set: (
    partial:
      | Partial<AnimationStoreState>
      | ((state: AnimationStoreState) => Partial<AnimationStoreState>)
  ) => void,
  get: () => AnimationStore,
  targetState: AnimationState
) {
  const current = get();
  const previousState = current.state;

  // Clear any pending timeout/raf
  if (current._transitionTimeoutId) {
    clearTimeout(current._transitionTimeoutId);
  }
  if (current._transitionRafId) {
    cancelAnimationFrame(current._transitionRafId);
  }

  // Start transition
  set({
    isTransitioning: true,
    transitionProgress: 0,
    transitionStartTime: performance.now(),
    _pendingState: null,
    _transitionTimeoutId: null,
  });

  // Animate transition progress
  const startTime = performance.now();
  const duration = ANIMATION_TIMING.phaseTransitionDuration;

  function animateTransition() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);

    if (progress < 1) {
      set({ transitionProgress: progress });
      const rafId = requestAnimationFrame(animateTransition);
      set({ _transitionRafId: rafId });
    } else {
      // Transition complete
      set({
        state: targetState,
        previousState,
        isTransitioning: false,
        transitionProgress: 1,
        transitionStartTime: null,
        _lastStateChangeTime: performance.now(),
        _transitionRafId: null,
      });

      // Notify listeners
      notifyListeners(get().listeners, targetState, previousState);
    }
  }

  const rafId = requestAnimationFrame(animateTransition);
  set({ _transitionRafId: rafId });
}

export const useAnimationStore = create<AnimationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    state: 'IDLE',
    previousState: null,
    phase: 0,
    phaseKey: 'PUSH',
    phaseProgress: 0,
    easedProgress: 0,
    globalProgress: 0,
    direction: 'idle',
    velocity: 0,
    isScrolling: false,
    isTransitioning: false,
    transitionProgress: 0,
    transitionStartTime: null,
    _lastStateChangeTime: 0,
    _pendingState: null,
    _transitionTimeoutId: null,
    _transitionRafId: null,
    listeners: new Set(),

    setState: (newState) => {
      const { state: currentState, _lastStateChangeTime, isTransitioning } = get();

      // Skip if same state and not transitioning
      if (newState === currentState && !isTransitioning) {
        return;
      }

      const now = performance.now();
      const timeSinceLastChange = now - _lastStateChangeTime;

      // Debounce rapid state changes
      if (timeSinceLastChange < STATE_CHANGE_DEBOUNCE_MS) {
        const current = get();

        // Queue the state change
        if (current._pendingState !== newState) {
          // Clear existing timeout
          if (current._transitionTimeoutId) {
            clearTimeout(current._transitionTimeoutId);
          }

          set({ _pendingState: newState });

          // Schedule state change after debounce period
          const remainingTime = STATE_CHANGE_DEBOUNCE_MS - timeSinceLastChange;
          const timeoutId = setTimeout(() => {
            const currentState = get();
            if (currentState._pendingState) {
              executeStateTransition(set, get, currentState._pendingState);
            }
          }, remainingTime);

          set({ _transitionTimeoutId: timeoutId });
        }
        return;
      }

      // Execute transition
      executeStateTransition(set, get, newState);
    },

    setPhaseData: (data) => {
      const { state: currentState, _lastStateChangeTime, isTransitioning } = get();
      const newState = phaseToState(data.phase);

      // Always update phase data
      const updates: Partial<AnimationStoreState> = {
        phase: data.phase,
        phaseKey: data.phaseKey,
        phaseProgress: data.phaseProgress,
        easedProgress: data.easedProgress,
        globalProgress: data.globalProgress,
        direction: data.direction,
        velocity: data.velocity,
        isScrolling: data.isScrolling,
      };

      set(updates);

      // Skip state change if same state and not transitioning
      if (newState === currentState && !isTransitioning) {
        return;
      }

      // Scroll bounce protection: ignore micro-movements
      if (Math.abs(data.velocity) < SCROLL_BOUNCE_THRESHOLD && data.direction !== 'idle') {
        return;
      }

      const now = performance.now();
      const timeSinceLastChange = now - _lastStateChangeTime;

      // Debounce rapid state changes
      if (timeSinceLastChange < STATE_CHANGE_DEBOUNCE_MS) {
        const current = get();

        // Queue the state change
        if (current._pendingState !== newState) {
          // Clear existing timeout
          if (current._transitionTimeoutId) {
            clearTimeout(current._transitionTimeoutId);
          }

          set({ _pendingState: newState });

          // Schedule state change after debounce period
          const remainingTime = STATE_CHANGE_DEBOUNCE_MS - timeSinceLastChange;
          const timeoutId = setTimeout(() => {
            const currentState = get();
            if (currentState._pendingState) {
              executeStateTransition(set, get, currentState._pendingState);
            }
          }, remainingTime);

          set({ _transitionTimeoutId: timeoutId });
        }
        return;
      }

      // Execute transition
      executeStateTransition(set, get, newState);
    },

    setStateImmediate: (newState) => {
      const current = get();

      // Clear any pending transitions
      if (current._transitionTimeoutId) {
        clearTimeout(current._transitionTimeoutId);
      }
      if (current._transitionRafId) {
        cancelAnimationFrame(current._transitionRafId);
      }

      const previousState = current.state;
      const stateChanged = previousState !== newState;

      set({
        state: newState,
        previousState: stateChanged ? previousState : current.previousState,
        isTransitioning: false,
        transitionProgress: 1,
        transitionStartTime: null,
        _lastStateChangeTime: performance.now(),
        _pendingState: null,
        _transitionTimeoutId: null,
        _transitionRafId: null,
      });

      // Notify listeners if state changed
      if (stateChanged) {
        notifyListeners(current.listeners, newState, previousState);
      }
    },

    startTransition: () => {
      set({
        isTransitioning: true,
        transitionProgress: 0,
        transitionStartTime: performance.now(),
      });
    },

    endTransition: () => {
      set({
        isTransitioning: false,
        transitionProgress: 1,
        transitionStartTime: null,
      });
    },

    onPhaseChange: (callback) => {
      const { listeners } = get();
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },

    onStateTransition: (callback) => {
      // Alias for onPhaseChange
      return get().onPhaseChange(callback);
    },

    reset: () => {
      const current = get();

      // Clear any pending transitions
      if (current._transitionTimeoutId) {
        clearTimeout(current._transitionTimeoutId);
      }
      if (current._transitionRafId) {
        cancelAnimationFrame(current._transitionRafId);
      }

      set({
        state: 'IDLE',
        previousState: null,
        phase: 0,
        phaseKey: 'PUSH',
        phaseProgress: 0,
        easedProgress: 0,
        globalProgress: 0,
        direction: 'idle',
        velocity: 0,
        isScrolling: false,
        isTransitioning: false,
        transitionProgress: 0,
        transitionStartTime: null,
        _lastStateChangeTime: 0,
        _pendingState: null,
        _transitionTimeoutId: null,
        _transitionRafId: null,
        // Keep listeners
      });
    },
  }))
);

// ============================================================================
// Selectors for optimized re-renders
// ============================================================================

/**
 * Select only the current animation state
 */
export const useAnimationState = () => useAnimationStore((s) => s.state);

/**
 * Select phase-related data
 */
export const useAnimationPhaseData = () =>
  useAnimationStore((s) => ({
    phase: s.phase,
    phaseKey: s.phaseKey,
    phaseProgress: s.phaseProgress,
    easedProgress: s.easedProgress,
  }));

/**
 * Select progress values
 */
export const useAnimationProgress = () =>
  useAnimationStore((s) => ({
    globalProgress: s.globalProgress,
    phaseProgress: s.phaseProgress,
    easedProgress: s.easedProgress,
  }));

/**
 * Select transition state
 */
export const useIsTransitioning = () => useAnimationStore((s) => s.isTransitioning);

/**
 * Select transition progress (0-1 during transitions)
 */
export const useTransitionProgress = () => useAnimationStore((s) => s.transitionProgress);

/**
 * Select scroll context
 */
export const useScrollContext = () =>
  useAnimationStore((s) => ({
    direction: s.direction,
    velocity: s.velocity,
    isScrolling: s.isScrolling,
  }));

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Get AnimationState from AnimationPhase
 */
export function getStateFromPhase(phase: AnimationPhase): AnimationState {
  return phaseToState(phase);
}

/**
 * Check if a state transition is valid (for debugging)
 */
export function isValidTransition(from: AnimationState, to: AnimationState): boolean {
  // All transitions are valid in this simple state machine
  // Add guards here if needed in the future
  return from !== to;
}
