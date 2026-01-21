import { Howl, Howler } from 'howler';

export type AudioState = 'uninitialized' | 'ready' | 'playing' | 'paused' | 'stopped';

export interface AudioManagerState {
  state: AudioState;
  volume: number;
  isMuted: boolean;
  isTabVisible: boolean;
  isUserInteracted: boolean;
}

export type AudioStateCallback = (state: AudioManagerState) => void;

/**
 * Audio Manager Singleton
 *
 * Manages global audio state with:
 * - User interaction gate (no auto-play)
 * - Tab visibility handling (pause when hidden)
 * - Mute/unmute toggle
 * - Volume control
 *
 * IMPORTANT: init() must be called after user interaction (click/touch)
 * to comply with browser autoplay policies.
 */
class AudioManager {
  private static instance: AudioManager | null = null;

  private state: AudioState = 'uninitialized';
  private volume = 0.5;
  private isMuted = false;
  private isTabVisible = true;
  private isUserInteracted = false;
  private wasPlayingBeforeHidden = false;

  private sound: Howl | null = null;
  private listeners: Set<AudioStateCallback> = new Set();

  private constructor() {
    // Private constructor for singleton
    this.setupVisibilityListener();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio system after user interaction.
   * Must be called from a user gesture event handler (click, touch, etc.)
   */
  init(): void {
    if (this.isUserInteracted) {
      return;
    }

    this.isUserInteracted = true;

    // Unlock Web Audio context
    Howler.autoUnlock = true;

    // Set global volume
    Howler.volume(this.volume);

    this.state = 'ready';
    this.notifyListeners();
  }

  /**
   * Load and prepare an audio file
   */
  load(src: string | string[], options?: { loop?: boolean; volume?: number }): void {
    if (!this.isUserInteracted) {
      console.warn('[AudioManager] Cannot load audio before user interaction');
      return;
    }

    // Unload previous sound
    if (this.sound) {
      this.sound.unload();
    }

    this.sound = new Howl({
      src: Array.isArray(src) ? src : [src],
      loop: options?.loop ?? true,
      volume: options?.volume ?? this.volume,
      html5: true, // Better for long audio files
      onplay: () => {
        this.state = 'playing';
        this.notifyListeners();
      },
      onpause: () => {
        this.state = 'paused';
        this.notifyListeners();
      },
      onstop: () => {
        this.state = 'stopped';
        this.notifyListeners();
      },
      onend: () => {
        if (!this.sound?.loop()) {
          this.state = 'stopped';
          this.notifyListeners();
        }
      },
    });

    this.state = 'ready';
    this.notifyListeners();
  }

  /**
   * Play audio (requires prior init() call)
   */
  play(): void {
    if (!this.isUserInteracted) {
      console.warn('[AudioManager] Cannot play audio before user interaction');
      return;
    }

    if (!this.sound) {
      console.warn('[AudioManager] No audio loaded');
      return;
    }

    if (!this.isTabVisible) {
      // Don't play if tab is hidden
      this.wasPlayingBeforeHidden = true;
      return;
    }

    this.sound.play();
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (this.sound && this.state === 'playing') {
      this.sound.pause();
    }
  }

  /**
   * Stop audio
   */
  stop(): void {
    if (this.sound) {
      this.sound.stop();
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));

    if (this.sound) {
      this.sound.volume(this.isMuted ? 0 : this.volume);
    }

    Howler.volume(this.isMuted ? 0 : this.volume);
    this.notifyListeners();
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Mute audio
   */
  mute(): void {
    this.isMuted = true;

    if (this.sound) {
      this.sound.mute(true);
    }

    Howler.mute(true);
    this.notifyListeners();
  }

  /**
   * Unmute audio
   */
  unmute(): void {
    this.isMuted = false;

    if (this.sound) {
      this.sound.mute(false);
    }

    Howler.mute(false);
    this.notifyListeners();
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Check if muted
   */
  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get current audio state
   */
  getState(): AudioManagerState {
    return {
      state: this.state,
      volume: this.volume,
      isMuted: this.isMuted,
      isTabVisible: this.isTabVisible,
      isUserInteracted: this.isUserInteracted,
    };
  }

  /**
   * Check if audio system is ready
   */
  isReady(): boolean {
    return this.isUserInteracted && this.state !== 'uninitialized';
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.state === 'playing';
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: AudioStateCallback): () => void {
    this.listeners.add(callback);
    // Immediately notify with current state
    callback(this.getState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Setup tab visibility listener
   */
  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = (): void => {
    const wasVisible = this.isTabVisible;
    this.isTabVisible = document.visibilityState === 'visible';

    if (!wasVisible && this.isTabVisible) {
      // Tab became visible
      if (this.wasPlayingBeforeHidden && this.sound) {
        this.sound.play();
        this.wasPlayingBeforeHidden = false;
      }
    } else if (wasVisible && !this.isTabVisible) {
      // Tab became hidden
      if (this.state === 'playing') {
        this.wasPlayingBeforeHidden = true;
        this.pause();
      }
    }

    this.notifyListeners();
  };

  private notifyListeners(): void {
    const state = this.getState();
    for (const callback of this.listeners) {
      try {
        callback(state);
      } catch (error) {
        console.error('[AudioManager] Listener callback error:', error);
      }
    }
  }

  /**
   * Cleanup (for testing or unmounting)
   */
  destroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    if (this.sound) {
      this.sound.unload();
      this.sound = null;
    }

    this.listeners.clear();
    this.state = 'uninitialized';
    this.isUserInteracted = false;
    AudioManager.instance = null;
  }
}

// Export singleton instance getter
export const audioManager = AudioManager.getInstance();

// Export class for testing
export { AudioManager };
