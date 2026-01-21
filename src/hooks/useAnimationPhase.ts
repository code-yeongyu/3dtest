'use client';

import { useEffect, useMemo, useRef } from 'react';

import {
  getPhaseConfig,
  getPhaseEasing,
  getPhaseKey,
  type PhaseConfig,
  type PhaseKey,
} from '@/lib/animationConfig';
import { syncPhaseToStore } from '@/lib/animationStateMachine';
import { useAnimationStore, type AnimationState } from '@/stores/animationStore';

import { useScrollProgress, type AnimationPhase, type ScrollDirection } from './useScrollProgress';

export interface AnimationPhaseState {
  phase: AnimationPhase;
  phaseKey: PhaseKey;
  phaseConfig: PhaseConfig;
  phaseProgress: number;
  easedProgress: number;
  globalProgress: number;
  direction: ScrollDirection;
  velocity: number;
  isScrolling: boolean;
  animationState: AnimationState;
}

export function useAnimationPhase(): AnimationPhaseState {
  const { progress, phase, phaseProgress, direction, velocity } = useScrollProgress();
  
  // Use ref to get store state without causing re-renders
  const animationStateRef = useRef<AnimationState>('IDLE');
  
  // Subscribe to store once and update ref
  useEffect(() => {
    const unsubscribe = useAnimationStore.subscribe((state) => {
      animationStateRef.current = state.state;
    });
    // Initialize with current state
    animationStateRef.current = useAnimationStore.getState().state;
    return unsubscribe;
  }, []);

  const computed = useMemo(() => {
    const phaseKey = getPhaseKey(phase);
    const phaseConfig = getPhaseConfig(phase);
    const easing = getPhaseEasing(phase);
    const easedProgress = easing(phaseProgress);
    const isScrolling = direction !== 'idle';

    return {
      phaseKey,
      phaseConfig,
      easedProgress,
      isScrolling,
    };
  }, [phase, phaseProgress, direction]);

  // Sync to store - use ref values to avoid dependency cycles
  const syncRef = useRef({ phase, phaseProgress, progress, direction, velocity });
  syncRef.current = { phase, phaseProgress, progress, direction, velocity };
  
  useEffect(() => {
    const { phase, phaseProgress, progress, direction, velocity } = syncRef.current;
    const phaseKey = getPhaseKey(phase);
    const easing = getPhaseEasing(phase);
    const easedProgress = easing(phaseProgress);
    const isScrolling = direction !== 'idle';
    
    syncPhaseToStore(
      phase,
      phaseKey,
      phaseProgress,
      easedProgress,
      progress,
      direction,
      velocity,
      isScrolling
    );
  }, [phase, phaseProgress, progress, direction, velocity]);

  return {
    phase,
    phaseKey: computed.phaseKey,
    phaseConfig: computed.phaseConfig,
    phaseProgress,
    easedProgress: computed.easedProgress,
    globalProgress: progress,
    direction,
    velocity,
    isScrolling: computed.isScrolling,
    animationState: animationStateRef.current,
  };
}
