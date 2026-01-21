'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

import { audioManager } from '@/lib/audioManager';
import { useAnimationStore, type AnimationState } from '@/stores/animationStore';

// =============================================================================
// Types
// =============================================================================

export type SFXType =
  | 'boulder-roll'
  | 'footsteps'
  | 'boulder-impact'
  | 'despair-sigh'
  | 'reveal-whoosh';

interface SFXConfig {
  src: string;
  loop: boolean;
  volume: number;
  /** If true, playback rate varies with velocity */
  velocitySensitive?: boolean;
  /** Min playback rate when velocity-sensitive */
  minRate?: number;
  /** Max playback rate when velocity-sensitive */
  maxRate?: number;
}

interface PooledSound {
  howl: Howl;
  id: number | null;
  inUse: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_SIMULTANEOUS_SOUNDS = 10;

// TODO: Replace with actual royalty-free SFX from Freesound.org
const SFX_CONFIG: Record<SFXType, SFXConfig> = {
  'boulder-roll': {
    src: '/audio/sfx/boulder-roll.mp3',
    loop: true,
    volume: 0.6,
    velocitySensitive: true,
    minRate: 0.5,
    maxRate: 1.5,
  },
  footsteps: {
    src: '/audio/sfx/footsteps.mp3',
    loop: true,
    volume: 0.4,
    velocitySensitive: true,
    minRate: 0.7,
    maxRate: 1.3,
  },
  'boulder-impact': {
    src: '/audio/sfx/boulder-impact.mp3',
    loop: false,
    volume: 0.8,
  },
  'despair-sigh': {
    src: '/audio/sfx/despair-sigh.mp3',
    loop: false,
    volume: 0.5,
  },
  'reveal-whoosh': {
    src: '/audio/sfx/reveal-whoosh.mp3',
    loop: false,
    volume: 0.7,
  },
};

/**
 * Maps animation state transitions to SFX triggers
 */
const STATE_SFX_MAP: Partial<Record<AnimationState, SFXType[]>> = {
  PUSHING: ['boulder-roll', 'footsteps'],
  SUMMIT: [], // Silence at summit for dramatic effect
  FALLING: ['boulder-impact'],
  DESPAIR: ['despair-sigh'],
  REVEAL: ['reveal-whoosh'],
};

/**
 * SFX that should stop when leaving certain states
 */
const STATE_STOP_SFX: Partial<Record<AnimationState, SFXType[]>> = {
  PUSHING: ['boulder-roll', 'footsteps'],
};

// =============================================================================
// Sound Pool Manager
// =============================================================================

class SoundPool {
  private pools: Map<SFXType, PooledSound[]> = new Map();
  private activeCount = 0;

  /**
   * Get or create a Howl instance from the pool
   */
  acquire(type: SFXType): PooledSound | null {
    if (this.activeCount >= MAX_SIMULTANEOUS_SOUNDS) {
      console.warn('[SoundPool] Max simultaneous sounds reached');
      return null;
    }

    const config = SFX_CONFIG[type];
    let pool = this.pools.get(type);

    if (!pool) {
      pool = [];
      this.pools.set(type, pool);
    }

    let sound = pool.find((s) => !s.inUse);

    if (!sound) {
      const howl = new Howl({
        src: [config.src],
        loop: config.loop,
        volume: config.volume,
        preload: true,
        onend: () => {
          if (!config.loop && sound) {
            sound.inUse = false;
            sound.id = null;
            this.activeCount--;
          }
        },
        onstop: () => {
          if (sound) {
            sound.inUse = false;
            sound.id = null;
            this.activeCount--;
          }
        },
      });

      sound = { howl, id: null, inUse: false };
      pool.push(sound);
    }

    sound.inUse = true;
    this.activeCount++;
    return sound;
  }

  /**
   * Release a sound back to the pool
   */
  release(type: SFXType, sound: PooledSound): void {
    if (sound.id !== null) {
      sound.howl.stop(sound.id);
    }
    sound.inUse = false;
    sound.id = null;
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  /**
   * Stop all sounds of a specific type
   */
  stopAll(type: SFXType): void {
    const pool = this.pools.get(type);
    if (!pool) return;

    for (const sound of pool) {
      if (sound.inUse) {
        this.release(type, sound);
      }
    }
  }

  /**
   * Get active sounds of a type
   */
  getActive(type: SFXType): PooledSound[] {
    const pool = this.pools.get(type);
    if (!pool) return [];
    return pool.filter((s) => s.inUse);
  }

  /**
   * Get current active count
   */
  getActiveCount(): number {
    return this.activeCount;
  }

  /**
   * Cleanup all sounds
   */
  destroy(): void {
    for (const pool of this.pools.values()) {
      for (const sound of pool) {
        sound.howl.unload();
      }
    }
    this.pools.clear();
    this.activeCount = 0;
  }
}

// =============================================================================
// Hook
// =============================================================================

export interface UseSFXOptions {
  /** Enable SFX (default: true) */
  enabled?: boolean;
  /** Master volume multiplier (0-1, default: 1) */
  masterVolume?: number;
}

export interface UseSFXReturn {
  /** Play a specific SFX */
  play: (type: SFXType) => void;
  /** Stop a specific SFX */
  stop: (type: SFXType) => void;
  /** Stop all SFX */
  stopAll: () => void;
  /** Update velocity for velocity-sensitive sounds */
  setVelocity: (velocity: number) => void;
  /** Current active sound count */
  activeCount: number;
}

export function useSFX(options: UseSFXOptions = {}): UseSFXReturn {
  const { enabled = true, masterVolume = 1.0 } = options;

  const poolRef = useRef<SoundPool | null>(null);
  const velocityRef = useRef(0);
  const activeCountRef = useRef(0);

  const animationState = useAnimationStore((s) => s.state);
  const previousState = useAnimationStore((s) => s.previousState);
  const velocity = useAnimationStore((s) => s.velocity);

  const getPool = useCallback(() => {
    if (!poolRef.current) {
      poolRef.current = new SoundPool();
    }
    return poolRef.current;
  }, []);

  const play = useCallback(
    (type: SFXType) => {
      if (!enabled || !audioManager.isReady()) {
        return;
      }

      const pool = getPool();
      const sound = pool.acquire(type);

      if (!sound) {
        return;
      }

      const config = SFX_CONFIG[type];
      const volume = config.volume * masterVolume;

      sound.howl.volume(volume);

      if (config.velocitySensitive && config.minRate && config.maxRate) {
        const normalizedVelocity = Math.min(1, Math.abs(velocityRef.current));
        const rate =
          config.minRate + normalizedVelocity * (config.maxRate - config.minRate);
        sound.howl.rate(rate);
      }

      sound.id = sound.howl.play();
      activeCountRef.current = pool.getActiveCount();
    },
    [enabled, masterVolume, getPool]
  );

  const stop = useCallback(
    (type: SFXType) => {
      const pool = poolRef.current;
      if (!pool) return;

      pool.stopAll(type);
      activeCountRef.current = pool.getActiveCount();
    },
    []
  );

  const stopAll = useCallback(() => {
    const pool = poolRef.current;
    if (!pool) return;

    for (const type of Object.keys(SFX_CONFIG) as SFXType[]) {
      pool.stopAll(type);
    }
    activeCountRef.current = 0;
  }, []);

  const setVelocity = useCallback(
    (newVelocity: number) => {
      velocityRef.current = newVelocity;

      const pool = poolRef.current;
      if (!pool) return;

      for (const type of Object.keys(SFX_CONFIG) as SFXType[]) {
        const config = SFX_CONFIG[type];
        if (!config.velocitySensitive || !config.minRate || !config.maxRate) {
          continue;
        }

        const activeSounds = pool.getActive(type);
        const normalizedVelocity = Math.min(1, Math.abs(newVelocity));
        const rate =
          config.minRate + normalizedVelocity * (config.maxRate - config.minRate);

        for (const sound of activeSounds) {
          if (sound.id !== null) {
            sound.howl.rate(rate, sound.id);
          }
        }
      }
    },
    []
  );

  useEffect(() => {
    setVelocity(velocity);
  }, [velocity, setVelocity]);

  useEffect(() => {
    if (!enabled) return;

    if (previousState) {
      const sfxToStop = STATE_STOP_SFX[previousState];
      if (sfxToStop) {
        for (const sfx of sfxToStop) {
          stop(sfx);
        }
      }
    }

    const sfxToPlay = STATE_SFX_MAP[animationState];
    if (sfxToPlay) {
      for (const sfx of sfxToPlay) {
        play(sfx);
      }
    }
  }, [animationState, previousState, enabled, play, stop]);

  useEffect(() => {
    return () => {
      if (poolRef.current) {
        poolRef.current.destroy();
        poolRef.current = null;
      }
    };
  }, []);

  return {
    play,
    stop,
    stopAll,
    setVelocity,
    activeCount: activeCountRef.current,
  };
}
