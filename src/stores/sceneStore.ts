import { create } from 'zustand';
import type { DeviceTier } from '@/hooks/useDeviceCapability';

interface SceneState {
  quality: DeviceTier;
  isReady: boolean;
  isLoading: boolean;
  setQuality: (quality: DeviceTier) => void;
  setReady: (ready: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  quality: 'medium',
  isReady: false,
  isLoading: true,
  setQuality: (quality) => set({ quality }),
  setReady: (ready) => set({ isReady: ready }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
