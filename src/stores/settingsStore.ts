import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type DeviceTier,
  type QualityPreset,
  detectDeviceTier,
  getQualityPreset,
} from '@/lib/qualityTiers';

interface SettingsState {
  detectedTier: DeviceTier;
  userOverrideTier: DeviceTier | null;
  currentPreset: QualityPreset;

  setUserOverride: (tier: DeviceTier | null) => void;
  resetToAuto: () => void;
  initializeDetection: () => void;
}

function getEffectiveTier(detected: DeviceTier, override: DeviceTier | null): DeviceTier {
  return override ?? detected;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      detectedTier: 'medium',
      userOverrideTier: null,
      currentPreset: getQualityPreset('medium'),

      setUserOverride: (tier) => {
        const { detectedTier } = get();
        const effectiveTier = getEffectiveTier(detectedTier, tier);
        set({
          userOverrideTier: tier,
          currentPreset: getQualityPreset(effectiveTier),
        });
      },

      resetToAuto: () => {
        const { detectedTier } = get();
        set({
          userOverrideTier: null,
          currentPreset: getQualityPreset(detectedTier),
        });
      },

      initializeDetection: () => {
        const detected = detectDeviceTier();
        const { userOverrideTier } = get();
        const effectiveTier = getEffectiveTier(detected, userOverrideTier);
        set({
          detectedTier: detected,
          currentPreset: getQualityPreset(effectiveTier),
        });
      },
    }),
    {
      name: 'quality-settings',
      partialize: (state) => ({
        userOverrideTier: state.userOverrideTier,
      }),
    }
  )
);

export function getEffectiveQualityTier(): DeviceTier {
  const { detectedTier, userOverrideTier } = useSettingsStore.getState();
  return getEffectiveTier(detectedTier, userOverrideTier);
}

export function getCurrentQualityPreset(): QualityPreset {
  return useSettingsStore.getState().currentPreset;
}
