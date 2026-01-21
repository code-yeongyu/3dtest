/**
 * Mobile Optimization Configuration
 *
 * Centralizes all mobile-specific optimizations and performance monitoring.
 * Documents existing optimizations and provides additional mobile-specific utilities.
 */

import { getDeviceInfo, type DeviceInfo } from './qualityTiers';

// ============================================================================
// EXISTING MOBILE OPTIMIZATIONS (DOCUMENTED)
// ============================================================================

/**
 * Quality Tier System (qualityTiers.ts)
 * - Mobile devices auto-detect to 'low' tier (or 'medium' for flagship)
 * - Low tier: 100 particles, no shadows, no bloom, no SSAO
 * - Aggressive LOD: lodDistanceNear=5, lodDistanceFar=30
 */

/**
 * Pre-baked Physics (PrebakedPath.tsx)
 * - Mobile: Uses CatmullRomCurve3 interpolation instead of Rapier physics
 * - PhysicsWorld.tsx: enabled={!isMobile} bypasses physics entirely
 * - Eliminates ~2-3ms per frame physics overhead
 */

/**
 * Reduced Particles (DustParticles.tsx, GoldenSparkles.tsx)
 * - DustParticles: 3,000 (low) vs 30,000 (high)
 * - GoldenSparkles: 200 (low) vs 2,000 (high)
 * - 10x reduction in particle count
 */

/**
 * Simplified Post-Processing (PostProcessing.tsx)
 * - Low tier: Bloom only (no Vignette, no GodRays)
 * - No multisampling (multisampling={0})
 * - No normal pass (enableNormalPass={false})
 */

/**
 * LOD with Closer Distances (PrebakedPath.tsx, qualityTiers.ts)
 * - Detailed component with distances=[0, 15]
 * - Low tier: lodDistanceNear=5, lodDistanceFar=30
 * - High detail geometry: 64 segments, Low: 16 segments
 */

/**
 * Canvas Configuration (MainCanvas.tsx)
 * - DPR: [1, 1.5] for mobile vs [1, 2] for desktop
 * - Shadows disabled for low tier
 * - antialias: false (uses post-processing AA instead)
 */

// ============================================================================
// MOBILE-SPECIFIC CONSTANTS
// ============================================================================

export const MOBILE_CONSTANTS = {
  // Texture resolution limits
  MAX_TEXTURE_SIZE: 1024,
  PREFERRED_TEXTURE_SIZE: 512,

  // Geometry limits
  MAX_VERTICES_PER_MESH: 10000,
  MAX_DRAW_CALLS: 50,

  // Animation limits
  MAX_ANIMATED_OBJECTS: 10,
  ANIMATION_UPDATE_INTERVAL: 2, // Update every N frames

  // Memory limits (approximate)
  TARGET_MEMORY_MB: 150,
  MAX_MEMORY_MB: 256,

  // Frame budget
  TARGET_FRAME_TIME_MS: 16.67, // 60fps
  MAX_FRAME_TIME_MS: 33.33, // 30fps minimum

  // Particle limits
  MAX_PARTICLES: 5000,
  PARTICLE_SPAWN_RATE: 0.5, // Multiplier vs desktop

  // Shader complexity
  MAX_SHADER_INSTRUCTIONS: 128,
  DISABLE_EXPENSIVE_SHADERS: true,
} as const;

// ============================================================================
// THERMAL THROTTLING DETECTION
// ============================================================================

interface ThermalState {
  isThrottling: boolean;
  consecutiveSlowFrames: number;
  averageFrameTime: number;
  lastCheckTime: number;
}

let thermalState: ThermalState = {
  isThrottling: false,
  consecutiveSlowFrames: 0,
  averageFrameTime: 16.67,
  lastCheckTime: 0,
};

const THERMAL_CONFIG = {
  SLOW_FRAME_THRESHOLD_MS: 25, // Frame taking >25ms is "slow"
  THROTTLE_TRIGGER_COUNT: 30, // 30 consecutive slow frames = throttling
  RECOVERY_THRESHOLD_MS: 18, // Frames <18ms = recovering
  RECOVERY_COUNT: 60, // 60 good frames to recover
  CHECK_INTERVAL_MS: 100, // Check every 100ms
  FRAME_TIME_SAMPLES: 30, // Rolling average window
};

const frameTimeSamples: number[] = [];

/**
 * Updates thermal state based on frame time.
 * Call this in useFrame() to monitor for thermal throttling.
 *
 * @param deltaMs - Frame delta time in milliseconds
 * @returns Current thermal state
 */
export function updateThermalState(deltaMs: number): ThermalState {
  const now = performance.now();

  // Throttle checks to avoid overhead
  if (now - thermalState.lastCheckTime < THERMAL_CONFIG.CHECK_INTERVAL_MS) {
    return thermalState;
  }
  thermalState.lastCheckTime = now;

  // Update rolling average
  frameTimeSamples.push(deltaMs);
  if (frameTimeSamples.length > THERMAL_CONFIG.FRAME_TIME_SAMPLES) {
    frameTimeSamples.shift();
  }

  thermalState.averageFrameTime =
    frameTimeSamples.reduce((a, b) => a + b, 0) / frameTimeSamples.length;

  // Detect throttling
  if (deltaMs > THERMAL_CONFIG.SLOW_FRAME_THRESHOLD_MS) {
    thermalState.consecutiveSlowFrames++;
    if (thermalState.consecutiveSlowFrames >= THERMAL_CONFIG.THROTTLE_TRIGGER_COUNT) {
      thermalState.isThrottling = true;
    }
  } else if (deltaMs < THERMAL_CONFIG.RECOVERY_THRESHOLD_MS) {
    // Recovery
    if (thermalState.isThrottling) {
      thermalState.consecutiveSlowFrames--;
      if (thermalState.consecutiveSlowFrames <= 0) {
        thermalState.isThrottling = false;
        thermalState.consecutiveSlowFrames = 0;
      }
    } else {
      thermalState.consecutiveSlowFrames = Math.max(0, thermalState.consecutiveSlowFrames - 1);
    }
  }

  return thermalState;
}

/**
 * Gets current thermal throttling state.
 */
export function getThermalState(): Readonly<ThermalState> {
  return thermalState;
}

/**
 * Resets thermal state (useful for testing or scene transitions).
 */
export function resetThermalState(): void {
  thermalState = {
    isThrottling: false,
    consecutiveSlowFrames: 0,
    averageFrameTime: 16.67,
    lastCheckTime: 0,
  };
  frameTimeSamples.length = 0;
}

// ============================================================================
// PERFORMANCE DEGRADATION DETECTION
// ============================================================================

export type PerformanceLevel = 'optimal' | 'degraded' | 'critical';

interface PerformanceState {
  level: PerformanceLevel;
  fps: number;
  memoryPressure: boolean;
  recommendations: string[];
}

/**
 * Analyzes current performance and provides recommendations.
 *
 * @param averageFrameTimeMs - Rolling average frame time
 * @param deviceInfo - Device capability info
 * @returns Performance state with recommendations
 */
export function analyzePerformance(
  averageFrameTimeMs: number,
  deviceInfo?: DeviceInfo
): PerformanceState {
  const info = deviceInfo || getDeviceInfo();
  const fps = 1000 / averageFrameTimeMs;
  const recommendations: string[] = [];

  let level: PerformanceLevel = 'optimal';

  // FPS-based analysis
  if (fps < 30) {
    level = 'critical';
    recommendations.push('Consider reducing particle count');
    recommendations.push('Disable post-processing effects');
    recommendations.push('Reduce draw distance');
  } else if (fps < 50) {
    level = 'degraded';
    recommendations.push('Consider lowering quality tier');
  }

  // Memory-based analysis (if available)
  const memoryPressure = info.memory < 4;
  if (memoryPressure) {
    recommendations.push('Low device memory detected');
    if (level === 'optimal') level = 'degraded';
  }

  // Mobile-specific
  if (info.isMobile) {
    if (fps < 55) {
      recommendations.push('Mobile device: ensure low quality tier');
    }
  }

  return {
    level,
    fps: Math.round(fps),
    memoryPressure,
    recommendations,
  };
}

// ============================================================================
// TEXTURE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Calculates optimal texture size for mobile devices.
 *
 * @param originalSize - Original texture dimension
 * @param isMobile - Whether device is mobile
 * @returns Optimized texture size
 */
export function getOptimalTextureSize(originalSize: number, isMobile: boolean): number {
  if (!isMobile) return originalSize;

  const maxSize = MOBILE_CONSTANTS.MAX_TEXTURE_SIZE;
  const preferredSize = MOBILE_CONSTANTS.PREFERRED_TEXTURE_SIZE;

  if (originalSize <= preferredSize) return originalSize;
  if (originalSize <= maxSize) return preferredSize;

  // For very large textures, use max mobile size
  return maxSize;
}

/**
 * Determines if a texture should be loaded at reduced resolution.
 *
 * @param texturePath - Path to texture
 * @param deviceInfo - Device capability info
 * @returns Whether to use reduced resolution
 */
export function shouldReduceTextureResolution(
  _texturePath: string,
  deviceInfo?: DeviceInfo
): boolean {
  const info = deviceInfo || getDeviceInfo();

  // Always reduce on mobile
  if (info.isMobile) return true;

  // Reduce on low-end desktop
  if (info.memory < 4 || info.maxTextureSize < 4096) return true;

  return false;
}

// ============================================================================
// SHADER SIMPLIFICATION FLAGS
// ============================================================================

export interface ShaderFlags {
  useSimpleLighting: boolean;
  disableNormalMaps: boolean;
  disableSpecular: boolean;
  disableShadowReceive: boolean;
  maxLightCount: number;
}

/**
 * Gets shader simplification flags based on device capability.
 *
 * @param isMobile - Whether device is mobile
 * @param tier - Quality tier
 * @returns Shader flags for simplification
 */
export function getShaderFlags(
  isMobile: boolean,
  tier: 'low' | 'medium' | 'high'
): ShaderFlags {
  if (tier === 'low' || isMobile) {
    return {
      useSimpleLighting: true,
      disableNormalMaps: true,
      disableSpecular: true,
      disableShadowReceive: true,
      maxLightCount: 2,
    };
  }

  if (tier === 'medium') {
    return {
      useSimpleLighting: false,
      disableNormalMaps: false,
      disableSpecular: false,
      disableShadowReceive: false,
      maxLightCount: 4,
    };
  }

  // High tier
  return {
    useSimpleLighting: false,
    disableNormalMaps: false,
    disableSpecular: false,
    disableShadowReceive: false,
    maxLightCount: 8,
  };
}

// ============================================================================
// MOBILE OPTIMIZATION SUMMARY
// ============================================================================

/**
 * Returns a summary of all mobile optimizations for debugging/logging.
 */
export function getMobileOptimizationSummary(): Record<string, unknown> {
  const deviceInfo = getDeviceInfo();

  return {
    device: {
      isMobile: deviceInfo.isMobile,
      memory: deviceInfo.memory,
      cores: deviceInfo.cores,
      gpu: deviceInfo.gpuRenderer,
      webglVersion: deviceInfo.webglVersion,
    },
    optimizations: {
      qualityTier: 'Auto-detected (low for mobile)',
      physics: 'Pre-baked CatmullRom curve (no Rapier)',
      particles: {
        dust: '3,000 (vs 30,000 desktop)',
        sparkles: '200 (vs 2,000 desktop)',
      },
      postProcessing: 'Bloom only (no Vignette, GodRays)',
      lod: 'Aggressive (near=5, far=30)',
      dpr: '[1, 1.5] (vs [1, 2] desktop)',
      shadows: 'Disabled',
      textures: `Max ${MOBILE_CONSTANTS.MAX_TEXTURE_SIZE}px`,
    },
    thermal: getThermalState(),
    constants: MOBILE_CONSTANTS,
  };
}
