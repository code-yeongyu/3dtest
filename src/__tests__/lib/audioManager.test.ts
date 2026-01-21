import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('howler', () => {
  class MockHowl {
    _src: string[];
    _loop: boolean;
    _volume: number;
    _muted: boolean;
    _playing: boolean;
    _options: Record<string, unknown>;

    constructor(options: Record<string, unknown>) {
      this._options = options;
      this._src = options.src as string[];
      this._loop = (options.loop as boolean) ?? false;
      this._volume = (options.volume as number) ?? 1;
      this._muted = false;
      this._playing = false;
    }

    play() {
      this._playing = true;
      (this._options.onplay as (() => void) | undefined)?.();
      return 1;
    }

    pause() {
      this._playing = false;
      (this._options.onpause as (() => void) | undefined)?.();
    }

    stop() {
      this._playing = false;
      (this._options.onstop as (() => void) | undefined)?.();
    }

    volume(vol?: number) {
      if (vol !== undefined) {
        this._volume = vol;
      }
      return this._volume;
    }

    mute(muted: boolean) {
      this._muted = muted;
    }

    loop() {
      return this._loop;
    }

    unload() {}
  }

  const mockHowler = {
    autoUnlock: false,
    volume: vi.fn(),
    mute: vi.fn(),
  };

  return {
    Howl: MockHowl,
    Howler: mockHowler,
  };
});

import { AudioManager } from '@/lib/audioManager';

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    // Get fresh instance by destroying previous
    audioManager = AudioManager.getInstance();
    audioManager.destroy();
    audioManager = AudioManager.getInstance();
  });

  afterEach(() => {
    audioManager.destroy();
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      // #given / #when
      const instance1 = AudioManager.getInstance();
      const instance2 = AudioManager.getInstance();

      // #then
      expect(instance1).toBe(instance2);
    });
  });

  describe('init', () => {
    it('should set isUserInteracted to true', () => {
      // #given
      const initialState = audioManager.getState();
      expect(initialState.isUserInteracted).toBe(false);

      // #when
      audioManager.init();

      // #then
      const state = audioManager.getState();
      expect(state.isUserInteracted).toBe(true);
    });

    it('should set state to ready', () => {
      // #given / #when
      audioManager.init();

      // #then
      const state = audioManager.getState();
      expect(state.state).toBe('ready');
    });

    it('should only initialize once', () => {
      // #given
      audioManager.init();
      const stateAfterFirst = audioManager.getState();

      // #when
      audioManager.init();
      const stateAfterSecond = audioManager.getState();

      // #then
      expect(stateAfterFirst).toEqual(stateAfterSecond);
    });
  });

  describe('load', () => {
    it('should not load before user interaction', () => {
      // #given
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // #when
      audioManager.load('/audio/test.mp3');

      // #then
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AudioManager] Cannot load audio before user interaction'
      );
      consoleSpy.mockRestore();
    });

    it('should load audio after init', () => {
      // #given
      audioManager.init();

      // #when
      audioManager.load('/audio/test.mp3');

      // #then
      const state = audioManager.getState();
      expect(state.state).toBe('ready');
    });

    it('should accept array of sources', () => {
      // #given
      audioManager.init();

      // #when / #then - should not throw
      expect(() => {
        audioManager.load(['/audio/test.mp3', '/audio/test.ogg']);
      }).not.toThrow();
    });
  });

  describe('play', () => {
    it('should not play before user interaction', () => {
      // #given
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // #when
      audioManager.play();

      // #then
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AudioManager] Cannot play audio before user interaction'
      );
      consoleSpy.mockRestore();
    });

    it('should not play without loaded audio', () => {
      // #given
      audioManager.init();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // #when
      audioManager.play();

      // #then
      expect(consoleSpy).toHaveBeenCalledWith('[AudioManager] No audio loaded');
      consoleSpy.mockRestore();
    });

    it('should play loaded audio', () => {
      // #given
      audioManager.init();
      audioManager.load('/audio/test.mp3');

      // #when
      audioManager.play();

      // #then
      expect(audioManager.isPlaying()).toBe(true);
    });
  });

  describe('pause', () => {
    it('should pause playing audio', () => {
      // #given
      audioManager.init();
      audioManager.load('/audio/test.mp3');
      audioManager.play();
      expect(audioManager.isPlaying()).toBe(true);

      // #when
      audioManager.pause();

      // #then
      expect(audioManager.isPlaying()).toBe(false);
      expect(audioManager.getState().state).toBe('paused');
    });
  });

  describe('stop', () => {
    it('should stop playing audio', () => {
      // #given
      audioManager.init();
      audioManager.load('/audio/test.mp3');
      audioManager.play();

      // #when
      audioManager.stop();

      // #then
      expect(audioManager.getState().state).toBe('stopped');
    });
  });

  describe('volume control', () => {
    it('should set volume', () => {
      // #given
      audioManager.init();

      // #when
      audioManager.setVolume(0.7);

      // #then
      expect(audioManager.getVolume()).toBe(0.7);
    });

    it('should clamp volume to 0-1 range', () => {
      // #given
      audioManager.init();

      // #when
      audioManager.setVolume(1.5);
      const highVolume = audioManager.getVolume();

      audioManager.setVolume(-0.5);
      const lowVolume = audioManager.getVolume();

      // #then
      expect(highVolume).toBe(1);
      expect(lowVolume).toBe(0);
    });
  });

  describe('mute control', () => {
    it('should mute audio', () => {
      // #given
      audioManager.init();
      expect(audioManager.getIsMuted()).toBe(false);

      // #when
      audioManager.mute();

      // #then
      expect(audioManager.getIsMuted()).toBe(true);
    });

    it('should unmute audio', () => {
      // #given
      audioManager.init();
      audioManager.mute();

      // #when
      audioManager.unmute();

      // #then
      expect(audioManager.getIsMuted()).toBe(false);
    });

    it('should toggle mute state', () => {
      // #given
      audioManager.init();
      const initialMuted = audioManager.getIsMuted();

      // #when
      audioManager.toggleMute();
      const afterFirstToggle = audioManager.getIsMuted();

      audioManager.toggleMute();
      const afterSecondToggle = audioManager.getIsMuted();

      // #then
      expect(afterFirstToggle).toBe(!initialMuted);
      expect(afterSecondToggle).toBe(initialMuted);
    });
  });

  describe('isReady', () => {
    it('should return false before init', () => {
      // #given / #when / #then
      expect(audioManager.isReady()).toBe(false);
    });

    it('should return true after init', () => {
      // #given
      audioManager.init();

      // #when / #then
      expect(audioManager.isReady()).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('should call callback immediately with current state', () => {
      // #given
      const callback = vi.fn();

      // #when
      audioManager.subscribe(callback);

      // #then
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(audioManager.getState());
    });

    it('should call callback on state changes', () => {
      // #given
      const callback = vi.fn();
      audioManager.subscribe(callback);
      callback.mockClear();

      // #when
      audioManager.init();

      // #then
      expect(callback).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      // #given
      const callback = vi.fn();
      const unsubscribe = audioManager.subscribe(callback);
      callback.mockClear();

      // #when
      unsubscribe();
      audioManager.init();

      // #then
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should return complete state object', () => {
      // #given / #when
      const state = audioManager.getState();

      // #then
      expect(state).toHaveProperty('state');
      expect(state).toHaveProperty('volume');
      expect(state).toHaveProperty('isMuted');
      expect(state).toHaveProperty('isTabVisible');
      expect(state).toHaveProperty('isUserInteracted');
    });

    it('should return initial state values', () => {
      // #given / #when
      const state = audioManager.getState();

      // #then
      expect(state.state).toBe('uninitialized');
      expect(state.volume).toBe(0.5);
      expect(state.isMuted).toBe(false);
      expect(state.isUserInteracted).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should reset state to uninitialized', () => {
      // #given
      audioManager.init();
      audioManager.load('/audio/test.mp3');

      // #when
      audioManager.destroy();

      // #then
      const newInstance = AudioManager.getInstance();
      expect(newInstance.getState().state).toBe('uninitialized');
      expect(newInstance.getState().isUserInteracted).toBe(false);
    });

    it('should clear listeners', () => {
      // #given
      const callback = vi.fn();
      audioManager.subscribe(callback);
      callback.mockClear();

      // #when
      audioManager.destroy();
      const newInstance = AudioManager.getInstance();
      newInstance.init();

      // #then
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
