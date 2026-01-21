'use client';

import { useEffect, useMemo } from 'react';
import {
  type DeviceTier,
  type QualityPreset,
  getDeviceInfo,
  detectDeviceTier,
  getQualityPreset,
} from '@/lib/qualityTiers';
import { useSettingsStore } from '@/stores/settingsStore';

export type { DeviceTier, QualityPreset };

export interface DeviceCapability {
  tier: DeviceTier;
  isMobile: boolean;
  preset: QualityPreset;
  isAutoDetected: boolean;
}

export function useDeviceCapability(): DeviceCapability {
  const { detectedTier, userOverrideTier, currentPreset, initializeDetection } = useSettingsStore();

  useEffect(() => {
    initializeDetection();
  }, [initializeDetection]);

  const capability = useMemo<DeviceCapability>(() => {
    const deviceInfo = getDeviceInfo();
    const effectiveTier = userOverrideTier ?? detectedTier;

    return {
      tier: effectiveTier,
      isMobile: deviceInfo.isMobile,
      preset: currentPreset,
      isAutoDetected: userOverrideTier === null,
    };
  }, [detectedTier, userOverrideTier, currentPreset]);

  return capability;
}

export function useQualityPreset(): QualityPreset {
  const { currentPreset } = useSettingsStore();
  return currentPreset;
}

export function useQualityTier(): DeviceTier {
  const { detectedTier, userOverrideTier } = useSettingsStore();
  return userOverrideTier ?? detectedTier;
}

export { detectDeviceTier, getDeviceInfo, getQualityPreset };
