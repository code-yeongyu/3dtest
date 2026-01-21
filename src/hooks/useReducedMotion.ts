'use client';

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';

/**
 * Media query for prefers-reduced-motion
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Get the current media query match state (SSR-safe)
 */
function getMediaQuerySnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Server snapshot always returns false (no motion preference known)
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Subscribe to media query changes
 */
function subscribeToMediaQuery(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', callback);
  
  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
}

let manualOverride: boolean | null = null;
const overrideListeners = new Set<() => void>();

function notifyOverrideListeners() {
  overrideListeners.forEach((listener) => listener());
}

function getOverrideSnapshot(): boolean | null {
  return manualOverride;
}

function subscribeToOverride(callback: () => void): () => void {
  overrideListeners.add(callback);
  return () => {
    overrideListeners.delete(callback);
  };
}

export interface ReducedMotionState {
  /** Whether reduced motion is currently active (considering both system preference and override) */
  prefersReducedMotion: boolean;
  /** Raw system preference from media query */
  systemPreference: boolean;
  /** Manual override value (null = follow system) */
  override: boolean | null;
  /** Whether the current state is from manual override */
  isOverridden: boolean;
}

export interface ReducedMotionActions {
  /** Enable reduced motion (override system preference) */
  enableReducedMotion: () => void;
  /** Disable reduced motion (override system preference) */
  disableReducedMotion: () => void;
  /** Reset to follow system preference */
  resetToSystem: () => void;
  /** Toggle override (cycles: system -> enabled -> disabled -> system) */
  toggleOverride: () => void;
}

export type UseReducedMotionReturn = ReducedMotionState & ReducedMotionActions;

/**
 * Hook to detect and manage prefers-reduced-motion preference.
 * 
 * Features:
 * - Detects system `prefers-reduced-motion: reduce` media query
 * - Supports manual override (enable/disable/reset)
 * - SSR-safe with useSyncExternalStore
 * - Real-time updates when system preference changes
 * 
 * @example
 * ```tsx
 * const { prefersReducedMotion, enableReducedMotion, resetToSystem } = useReducedMotion();
 * 
 * // In animation component
 * if (prefersReducedMotion) {
 *   return <StaticPose />;
 * }
 * return <AnimatedCharacter />;
 * ```
 */
export function useReducedMotion(): UseReducedMotionReturn {
  const systemPreference = useSyncExternalStore(
    subscribeToMediaQuery,
    getMediaQuerySnapshot,
    getServerSnapshot
  );

  const override = useSyncExternalStore(
    subscribeToOverride,
    getOverrideSnapshot,
    () => null
  );

  const prefersReducedMotion = override !== null ? override : systemPreference;
  const isOverridden = override !== null;

  const enableReducedMotion = useCallback(() => {
    manualOverride = true;
    notifyOverrideListeners();
  }, []);

  const disableReducedMotion = useCallback(() => {
    manualOverride = false;
    notifyOverrideListeners();
  }, []);

  const resetToSystem = useCallback(() => {
    manualOverride = null;
    notifyOverrideListeners();
  }, []);

  const toggleOverride = useCallback(() => {
    if (manualOverride === null) {
      // System -> Enabled
      manualOverride = true;
    } else if (manualOverride === true) {
      // Enabled -> Disabled
      manualOverride = false;
    } else {
      // Disabled -> System
      manualOverride = null;
    }
    notifyOverrideListeners();
  }, []);

  return {
    prefersReducedMotion,
    systemPreference,
    override,
    isOverridden,
    enableReducedMotion,
    disableReducedMotion,
    resetToSystem,
    toggleOverride,
  };
}

/**
 * Simple hook that just returns whether reduced motion is preferred.
 * Use this when you only need the boolean value.
 */
export function usePrefersReducedMotion(): boolean {
  const { prefersReducedMotion } = useReducedMotion();
  return prefersReducedMotion;
}

/**
 * Get current reduced motion state outside of React (for imperative code)
 */
export function getReducedMotionState(): boolean {
  if (manualOverride !== null) return manualOverride;
  return getMediaQuerySnapshot();
}

/**
 * Set reduced motion override imperatively (for settings panels, etc.)
 */
export function setReducedMotionOverride(value: boolean | null): void {
  manualOverride = value;
  notifyOverrideListeners();
}
