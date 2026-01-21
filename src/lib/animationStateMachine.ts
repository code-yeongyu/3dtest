import { ANIMATION_TIMING, type PhaseKey } from './animationConfig';
import { useAnimationStore, type AnimationState } from '@/stores/animationStore';
import type { AnimationPhase, ScrollDirection } from '@/hooks/useScrollProgress';

export interface TransitionEvent {
  from: AnimationState;
  to: AnimationState;
  phase: AnimationPhase;
  phaseKey: PhaseKey;
  direction: ScrollDirection;
  velocity: number;
  timestamp: number;
}

export type TransitionCallback = (event: TransitionEvent) => void;

const PHASE_TO_STATE: Record<PhaseKey, AnimationState> = {
  PUSH: 'PUSHING',
  SUMMIT: 'SUMMIT',
  FALL: 'FALLING',
  DESPAIR: 'DESPAIR',
  REVEAL: 'REVEAL',
};

const VALID_TRANSITIONS: Record<AnimationState, AnimationState[]> = {
  IDLE: ['PUSHING'],
  PUSHING: ['SUMMIT', 'IDLE'],
  SUMMIT: ['FALLING', 'PUSHING'],
  FALLING: ['DESPAIR', 'SUMMIT'],
  DESPAIR: ['REVEAL', 'FALLING'],
  REVEAL: ['DESPAIR'],
};

/**
 * Animation State Machine
 *
 * Manages state transitions with:
 * - Valid transition guards (prevents invalid state jumps)
 * - Debounce for rapid scrolling
 * - Event emission for audio/effects systems
 *
 * Works in conjunction with useAnimationStore which handles:
 * - Scroll bounce protection
 * - Transition progress animation
 * - State persistence
 */
class AnimationStateMachine {
  private transitionCallbacks: Set<TransitionCallback> = new Set();
  private lastTransitionTime = 0;
  private pendingTransition: AnimationState | null = null;
  private pendingContext: {
    phase: AnimationPhase;
    phaseKey: PhaseKey;
    direction: ScrollDirection;
    velocity: number;
  } | null = null;
  private transitionTimeoutId: ReturnType<typeof setTimeout> | null = null;

  canTransition(from: AnimationState, to: AnimationState): boolean {
    if (from === to) return false;
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  shouldDebounceTransition(velocity: number): boolean {
    const now = performance.now();
    const timeSinceLastTransition = now - this.lastTransitionTime;
    const isRapidScrolling = velocity > ANIMATION_TIMING.velocityThreshold;

    if (isRapidScrolling && timeSinceLastTransition < ANIMATION_TIMING.phaseTransitionDuration) {
      return true;
    }

    return false;
  }

  requestTransition(
    targetState: AnimationState,
    context: {
      phase: AnimationPhase;
      phaseKey: PhaseKey;
      direction: ScrollDirection;
      velocity: number;
    }
  ): boolean {
    const store = useAnimationStore.getState();
    const currentState = store.state;

    if (!this.canTransition(currentState, targetState)) {
      return false;
    }

    if (this.shouldDebounceTransition(context.velocity)) {
      this.scheduleTransition(targetState, context);
      return false;
    }

    this.executeTransition(currentState, targetState, context);
    return true;
  }

  private scheduleTransition(
    targetState: AnimationState,
    context: {
      phase: AnimationPhase;
      phaseKey: PhaseKey;
      direction: ScrollDirection;
      velocity: number;
    }
  ): void {
    this.pendingTransition = targetState;
    this.pendingContext = context;

    if (this.transitionTimeoutId) {
      clearTimeout(this.transitionTimeoutId);
    }

    this.transitionTimeoutId = setTimeout(() => {
      if (this.pendingTransition && this.pendingContext) {
        const store = useAnimationStore.getState();
        const currentState = store.state;

        if (this.canTransition(currentState, this.pendingTransition)) {
          this.executeTransition(currentState, this.pendingTransition, this.pendingContext);
        }

        this.pendingTransition = null;
        this.pendingContext = null;
        this.transitionTimeoutId = null;
      }
    }, ANIMATION_TIMING.idleTimeout);
  }

  private executeTransition(
    from: AnimationState,
    to: AnimationState,
    context: {
      phase: AnimationPhase;
      phaseKey: PhaseKey;
      direction: ScrollDirection;
      velocity: number;
    }
  ): void {
    const store = useAnimationStore.getState();
    const timestamp = performance.now();

    store.setStateImmediate(to);
    this.lastTransitionTime = timestamp;

    const event: TransitionEvent = {
      from,
      to,
      phase: context.phase,
      phaseKey: context.phaseKey,
      direction: context.direction,
      velocity: context.velocity,
      timestamp,
    };

    for (const callback of this.transitionCallbacks) {
      try {
        callback(event);
      } catch (error) {
        console.error('[AnimationStateMachine] Transition callback error:', error);
      }
    }
  }

  onTransition(callback: TransitionCallback): () => void {
    this.transitionCallbacks.add(callback);
    return () => {
      this.transitionCallbacks.delete(callback);
    };
  }

  getStateForPhase(phaseKey: PhaseKey): AnimationState {
    return PHASE_TO_STATE[phaseKey];
  }

  cancelPendingTransition(): void {
    if (this.transitionTimeoutId) {
      clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }
    this.pendingTransition = null;
    this.pendingContext = null;
  }

  reset(): void {
    this.cancelPendingTransition();
    this.lastTransitionTime = 0;
    useAnimationStore.getState().setStateImmediate('IDLE');
  }
}

export const animationStateMachine = new AnimationStateMachine();

export function syncPhaseToStore(
  phase: AnimationPhase,
  phaseKey: PhaseKey,
  phaseProgress: number,
  easedProgress: number,
  globalProgress: number,
  direction: ScrollDirection,
  velocity: number,
  isScrolling: boolean
): void {
  const store = useAnimationStore.getState();
  const targetState = animationStateMachine.getStateForPhase(phaseKey);
  const currentState = store.state;

  store.setPhaseData({
    phase,
    phaseKey,
    phaseProgress,
    easedProgress,
    globalProgress,
    direction,
    velocity,
    isScrolling,
  });

  if (currentState !== targetState) {
    animationStateMachine.requestTransition(targetState, {
      phase,
      phaseKey,
      direction,
      velocity,
    });
  }
}
