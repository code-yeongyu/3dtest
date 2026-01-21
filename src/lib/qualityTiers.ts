/**
 * 3-Tier Quality System
 *
 * Provides automatic device detection and quality presets for:
 * - Particle counts
 * - Shadow quality
 * - Post-processing
 * - LOD distances
 * - Physics complexity
 */

export type DeviceTier = 'low' | 'medium' | 'high';

export interface QualityPreset {
  // Particle system
  particleCount: number;
  particleSize: number;

  // Shadows
  shadowMapSize: number;
  shadowEnabled: boolean;
  shadowSoftness: number;

  // Post-processing
  bloomEnabled: boolean;
  bloomIntensity: number;
  ssaoEnabled: boolean;
  antialiasingSamples: number;

  // LOD (Level of Detail)
  lodBias: number;
  lodDistanceNear: number;
  lodDistanceFar: number;

  // Physics
  physicsIterations: number;
  physicsSubsteps: number;
  maxPhysicsBodies: number;

  // General
  maxLights: number;
  textureQuality: 'low' | 'medium' | 'high';
  geometryDetail: number;
}

export const QUALITY_PRESETS: Record<DeviceTier, QualityPreset> = {
  low: {
    // Particle system - minimal
    particleCount: 100,
    particleSize: 0.5,

    // Shadows - disabled
    shadowMapSize: 512,
    shadowEnabled: false,
    shadowSoftness: 0,

    // Post-processing - disabled
    bloomEnabled: false,
    bloomIntensity: 0,
    ssaoEnabled: false,
    antialiasingSamples: 0,

    // LOD - aggressive culling
    lodBias: 2.0,
    lodDistanceNear: 5,
    lodDistanceFar: 30,

    // Physics - minimal
    physicsIterations: 2,
    physicsSubsteps: 1,
    maxPhysicsBodies: 20,

    // General
    maxLights: 2,
    textureQuality: 'low',
    geometryDetail: 0.5,
  },

  medium: {
    // Particle system - balanced
    particleCount: 500,
    particleSize: 1.0,

    // Shadows - basic
    shadowMapSize: 1024,
    shadowEnabled: true,
    shadowSoftness: 1,

    // Post-processing - selective
    bloomEnabled: true,
    bloomIntensity: 0.5,
    ssaoEnabled: false,
    antialiasingSamples: 2,

    // LOD - balanced
    lodBias: 1.0,
    lodDistanceNear: 10,
    lodDistanceFar: 50,

    // Physics - balanced
    physicsIterations: 4,
    physicsSubsteps: 2,
    maxPhysicsBodies: 50,

    // General
    maxLights: 4,
    textureQuality: 'medium',
    geometryDetail: 0.75,
  },

  high: {
    // Particle system - full
    particleCount: 2000,
    particleSize: 1.5,

    // Shadows - high quality
    shadowMapSize: 2048,
    shadowEnabled: true,
    shadowSoftness: 3,

    // Post-processing - full
    bloomEnabled: true,
    bloomIntensity: 1.0,
    ssaoEnabled: true,
    antialiasingSamples: 4,

    // LOD - minimal culling
    lodBias: 0.5,
    lodDistanceNear: 20,
    lodDistanceFar: 100,

    // Physics - full simulation
    physicsIterations: 8,
    physicsSubsteps: 4,
    maxPhysicsBodies: 100,

    // General
    maxLights: 8,
    textureQuality: 'high',
    geometryDetail: 1.0,
  },
};

// Device detection types
export interface DeviceInfo {
  memory: number;
  cores: number;
  isMobile: boolean;
  gpuRenderer: string;
  gpuVendor: string;
  maxTextureSize: number;
  webglVersion: number;
}

const DEFAULT_DEVICE_INFO: DeviceInfo = {
  memory: 4,
  cores: 4,
  isMobile: false,
  gpuRenderer: '',
  gpuVendor: '',
  maxTextureSize: 4096,
  webglVersion: 1,
};

let cachedDeviceInfo: DeviceInfo | null = null;

/**
 * Detects device capabilities using WebGL, RAM, and CPU cores.
 * Uses actual capability detection, not just user agent sniffing.
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return DEFAULT_DEVICE_INFO;
  }

  if (cachedDeviceInfo) {
    return cachedDeviceInfo;
  }

  // RAM detection (deviceMemory API)
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

  // CPU cores detection
  const cores = navigator.hardwareConcurrency || 4;

  // Mobile detection - combine multiple signals
  const isMobile =
    /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0) ||
    window.matchMedia('(pointer: coarse)').matches;

  // WebGL capability detection
  let gpuRenderer = '';
  let gpuVendor = '';
  let maxTextureSize = 4096;
  let webglVersion = 1;

  try {
    const canvas = document.createElement('canvas');

    // Try WebGL2 first
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    if (gl) {
      webglVersion = 2;
    } else {
      gl =
        (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    }

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      }
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
    }
  } catch {
    // WebGL not available
  }

  cachedDeviceInfo = {
    memory,
    cores,
    isMobile,
    gpuRenderer,
    gpuVendor,
    maxTextureSize,
    webglVersion,
  };

  return cachedDeviceInfo;
}

// GPU classification lists
const LOW_END_GPUS = [
  'intel',
  'hd graphics',
  'uhd graphics',
  'integrated',
  'mali-4',
  'mali-t',
  'adreno 3',
  'adreno 4',
  'powervr',
  'sgx',
  'vivante',
];

const HIGH_END_GPUS = [
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
  'arc a',
  'quadro',
  'tesla',
];

/**
 * Detects the appropriate quality tier based on device capabilities.
 * Uses WebGL, RAM, CPU cores, and GPU detection.
 */
export function detectDeviceTier(info?: DeviceInfo): DeviceTier {
  const deviceInfo = info || getDeviceInfo();
  const { memory, cores, isMobile, gpuRenderer, maxTextureSize, webglVersion } = deviceInfo;

  const gpuLower = gpuRenderer.toLowerCase();
  const isLowEndGPU = LOW_END_GPUS.some((gpu) => gpuLower.includes(gpu));
  const isHighEndGPU = HIGH_END_GPUS.some((gpu) => gpuLower.includes(gpu));

  // Mobile devices
  if (isMobile) {
    // High-end mobile (flagship phones/tablets)
    if (memory >= 6 && cores >= 6 && webglVersion === 2) {
      return 'medium';
    }
    return 'low';
  }

  // Desktop/Laptop detection

  // Low tier: integrated GPU, <4GB RAM, <4 cores, or small texture support
  if (isLowEndGPU || memory < 4 || cores < 4 || maxTextureSize < 4096) {
    return 'low';
  }

  // High tier: dedicated GPU, 16GB+ RAM, 8+ cores, WebGL2
  if (isHighEndGPU && memory >= 16 && cores >= 8 && webglVersion === 2) {
    return 'high';
  }

  // Medium tier: everything else (laptops, mid-range desktops)
  if (memory >= 8 && cores >= 6) {
    return 'medium';
  }

  // Default to medium for edge cases
  return 'medium';
}

/**
 * Gets the quality preset for a given tier.
 */
export function getQualityPreset(tier: DeviceTier): QualityPreset {
  return QUALITY_PRESETS[tier];
}

/**
 * Gets the automatically detected quality preset.
 */
export function getAutoQualityPreset(): QualityPreset {
  const tier = detectDeviceTier();
  return QUALITY_PRESETS[tier];
}

/**
 * Clears the cached device info (useful for testing).
 */
export function clearDeviceInfoCache(): void {
  cachedDeviceInfo = null;
}
