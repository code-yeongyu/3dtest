'use client';

import { useMemo, useSyncExternalStore } from 'react';

export type DeviceTier = 'low' | 'medium' | 'high';

export interface DeviceCapability {
  tier: DeviceTier;
  isMobile: boolean;
}

interface DeviceInfo {
  memory: number;
  cores: number;
  isMobile: boolean;
  gpuRenderer: string;
}

const defaultDeviceInfo: DeviceInfo = {
  memory: 4,
  cores: 4,
  isMobile: false,
  gpuRenderer: '',
};

let cachedDeviceInfo: DeviceInfo | null = null;

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return defaultDeviceInfo;
  }

  if (cachedDeviceInfo) {
    return cachedDeviceInfo;
  }

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let gpuRenderer = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      }
    }
  } catch {
    // WebGL not available
  }

  cachedDeviceInfo = { memory, cores, isMobile, gpuRenderer };
  return cachedDeviceInfo;
}

function detectTier(info: DeviceInfo): DeviceTier {
  const { memory, cores, isMobile, gpuRenderer } = info;

  const lowEndGPUs = [
    'intel',
    'hd graphics',
    'uhd graphics',
    'integrated',
    'mali-4',
    'mali-t',
    'adreno 3',
    'adreno 4',
    'powervr',
  ];

  const highEndGPUs = [
    'nvidia',
    'geforce',
    'rtx',
    'gtx',
    'radeon rx',
    'radeon pro',
    'apple m1',
    'apple m2',
    'apple m3',
    'apple m4',
  ];

  const gpuLower = gpuRenderer.toLowerCase();
  const isLowEndGPU = lowEndGPUs.some((gpu) => gpuLower.includes(gpu));
  const isHighEndGPU = highEndGPUs.some((gpu) => gpuLower.includes(gpu));

  if (isMobile) {
    if (memory >= 6 && cores >= 6) {
      return 'medium';
    }
    return 'low';
  }

  if (isLowEndGPU || memory < 4 || cores < 4) {
    return 'low';
  }

  if (isHighEndGPU && memory >= 16 && cores >= 8) {
    return 'high';
  }

  if (memory >= 8 && cores >= 6) {
    return 'medium';
  }

  return 'medium';
}

function subscribe() {
  return () => {};
}

function getSnapshot(): DeviceInfo {
  return getDeviceInfo();
}

function getServerSnapshot(): DeviceInfo {
  return defaultDeviceInfo;
}

export function useDeviceCapability(): DeviceCapability {
  const deviceInfo = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const capability = useMemo<DeviceCapability>(() => {
    return {
      tier: detectTier(deviceInfo),
      isMobile: deviceInfo.isMobile,
    };
  }, [deviceInfo]);

  return capability;
}
