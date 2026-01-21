'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

import { audioManager } from '@/lib/audioManager';
import { useAnimationStore, type AnimationState } from '@/stores/animationStore';

interface PhaseIntensity {
  volume: number;
  rate?: number;
}

const PHASE_INTENSITY: Record<AnimationState, PhaseIntensity> = {
  IDLE: { volume: 0.3, rate: 1.0 },
  PUSHING: { volume: 0.4, rate: 1.0 },
  SUMMIT: { volume: 0.7, rate: 1.05 },
  FALLING: { volume: 0.6, rate: 0.95 },
  DESPAIR: { volume: 0.35, rate: 0.85 },
  REVEAL: { volume: 0.9, rate: 1.1 },
};

const FADE_DURATION_MS = 1500;

// TODO: Replace with actual royalty-free epic BGM (Pixabay/Freesound/YouTube Audio Library)
const BGM_SRC = '/audio/bgm.mp3';

export interface UseBGMOptions {
  autoStart?: boolean;
  baseVolume?: number;
}

export interface UseBGMReturn {
  play: () => void;
  pause: () => void;
  stop: () => void;
  isPlaying: boolean;
  currentIntensity: PhaseIntensity;
}

export function useBGM(options: UseBGMOptions = {}): UseBGMReturn {
  const { autoStart = false, baseVolume = 1.0 } = options;

  const howlRef = useRef<Howl | null>(null);
  const isPlayingRef = useRef(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animationState = useAnimationStore((s) => s.state);
  const currentIntensity = PHASE_INTENSITY[animationState] || PHASE_INTENSITY.IDLE;

  const initHowl = useCallback(() => {
    if (howlRef.current) {
      return howlRef.current;
    }

    const howl = new Howl({
      src: [BGM_SRC],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
    });

    howlRef.current = howl;
    return howl;
  }, []);

  const fadeToVolume = useCallback(
    (targetVolume: number, duration: number = FADE_DURATION_MS) => {
      const howl = howlRef.current;
      if (!howl) return;

      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }

      const currentVolume = howl.volume();
      const finalVolume = targetVolume * baseVolume;

      if (Math.abs(currentVolume - finalVolume) < 0.01) {
        return;
      }

      howl.fade(currentVolume, finalVolume, duration);
    },
    [baseVolume]
  );

  const fadeToRate = useCallback((targetRate: number, duration: number = FADE_DURATION_MS) => {
    const howl = howlRef.current;
    if (!howl) return;

    const currentRate = howl.rate();
    const STEP_INTERVAL_MS = 50;
    const steps = Math.ceil(duration / STEP_INTERVAL_MS);
    const rateStep = (targetRate - currentRate) / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const newRate = currentRate + rateStep * step;
      howl.rate(newRate);

      if (step >= steps) {
        clearInterval(interval);
        howl.rate(targetRate);
      }
    }, STEP_INTERVAL_MS);
  }, []);

  const play = useCallback(() => {
    if (!audioManager.isReady()) {
      console.warn('[useBGM] AudioManager not ready. Call audioManager.init() first.');
      return;
    }

    const howl = initHowl();

    if (!isPlayingRef.current) {
      howl.play();
      isPlayingRef.current = true;

      fadeToVolume(currentIntensity.volume);
      if (currentIntensity.rate) {
        howl.rate(currentIntensity.rate);
      }
    }
  }, [initHowl, fadeToVolume, currentIntensity]);

  const pause = useCallback(() => {
    const howl = howlRef.current;
    if (howl && isPlayingRef.current) {
      fadeToVolume(0, 500);
      fadeTimeoutRef.current = setTimeout(() => {
        howl.pause();
        isPlayingRef.current = false;
      }, 500);
    }
  }, [fadeToVolume]);

  const stop = useCallback(() => {
    const howl = howlRef.current;
    if (howl) {
      howl.stop();
      isPlayingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isPlayingRef.current || !howlRef.current) {
      return;
    }

    const intensity = PHASE_INTENSITY[animationState] || PHASE_INTENSITY.IDLE;

    fadeToVolume(intensity.volume);
    if (intensity.rate) {
      fadeToRate(intensity.rate);
    }
  }, [animationState, fadeToVolume, fadeToRate]);

  useEffect(() => {
    if (!autoStart) return;

    const unsubscribe = audioManager.subscribe((state) => {
      if (state.isUserInteracted && !isPlayingRef.current) {
        play();
      }
    });

    return unsubscribe;
  }, [autoStart, play]);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
    };
  }, []);

  return {
    play,
    pause,
    stop,
    isPlaying: isPlayingRef.current,
    currentIntensity,
  };
}
