import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  QUALITY_PRESETS,
  detectDeviceTier,
  getQualityPreset,
  getAutoQualityPreset,
  clearDeviceInfoCache,
  type DeviceInfo,
  type DeviceTier,
} from '@/lib/qualityTiers';

describe('qualityTiers', () => {
  beforeEach(() => {
    clearDeviceInfoCache();
  });

  describe('QUALITY_PRESETS', () => {
    it('should have three tiers defined', () => {
      // #given
      const tiers = Object.keys(QUALITY_PRESETS);

      // #when / #then
      expect(tiers).toEqual(['low', 'medium', 'high']);
    });

    it('should have increasing particle counts across tiers', () => {
      // #given / #when
      const lowParticles = QUALITY_PRESETS.low.particleCount;
      const mediumParticles = QUALITY_PRESETS.medium.particleCount;
      const highParticles = QUALITY_PRESETS.high.particleCount;

      // #then
      expect(lowParticles).toBeLessThan(mediumParticles);
      expect(mediumParticles).toBeLessThan(highParticles);
    });

    it('should have increasing shadow map sizes across tiers', () => {
      // #given / #when
      const lowShadow = QUALITY_PRESETS.low.shadowMapSize;
      const mediumShadow = QUALITY_PRESETS.medium.shadowMapSize;
      const highShadow = QUALITY_PRESETS.high.shadowMapSize;

      // #then
      expect(lowShadow).toBeLessThan(mediumShadow);
      expect(mediumShadow).toBeLessThan(highShadow);
    });

    it('should disable shadows on low tier', () => {
      // #given / #when / #then
      expect(QUALITY_PRESETS.low.shadowEnabled).toBe(false);
      expect(QUALITY_PRESETS.medium.shadowEnabled).toBe(true);
      expect(QUALITY_PRESETS.high.shadowEnabled).toBe(true);
    });

    it('should disable bloom on low tier', () => {
      // #given / #when / #then
      expect(QUALITY_PRESETS.low.bloomEnabled).toBe(false);
      expect(QUALITY_PRESETS.medium.bloomEnabled).toBe(true);
      expect(QUALITY_PRESETS.high.bloomEnabled).toBe(true);
    });

    it('should only enable SSAO on high tier', () => {
      // #given / #when / #then
      expect(QUALITY_PRESETS.low.ssaoEnabled).toBe(false);
      expect(QUALITY_PRESETS.medium.ssaoEnabled).toBe(false);
      expect(QUALITY_PRESETS.high.ssaoEnabled).toBe(true);
    });

    it('should have increasing max lights across tiers', () => {
      // #given / #when
      const lowLights = QUALITY_PRESETS.low.maxLights;
      const mediumLights = QUALITY_PRESETS.medium.maxLights;
      const highLights = QUALITY_PRESETS.high.maxLights;

      // #then
      expect(lowLights).toBeLessThan(mediumLights);
      expect(mediumLights).toBeLessThan(highLights);
    });

    it('should have correct texture quality per tier', () => {
      // #given / #when / #then
      expect(QUALITY_PRESETS.low.textureQuality).toBe('low');
      expect(QUALITY_PRESETS.medium.textureQuality).toBe('medium');
      expect(QUALITY_PRESETS.high.textureQuality).toBe('high');
    });

    it('should have increasing geometry detail across tiers', () => {
      // #given / #when
      const lowDetail = QUALITY_PRESETS.low.geometryDetail;
      const mediumDetail = QUALITY_PRESETS.medium.geometryDetail;
      const highDetail = QUALITY_PRESETS.high.geometryDetail;

      // #then
      expect(lowDetail).toBeLessThan(mediumDetail);
      expect(mediumDetail).toBeLessThan(highDetail);
      expect(highDetail).toBe(1.0);
    });
  });

  describe('detectDeviceTier', () => {
    it('should return low tier for mobile devices', () => {
      // #given
      const mobileDevice: DeviceInfo = {
        memory: 4,
        cores: 4,
        isMobile: true,
        gpuRenderer: 'Adreno 530',
        gpuVendor: 'Qualcomm',
        maxTextureSize: 4096,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(mobileDevice);

      // #then
      expect(tier).toBe('low');
    });

    it('should return medium tier for high-end mobile devices', () => {
      // #given
      const highEndMobile: DeviceInfo = {
        memory: 8,
        cores: 8,
        isMobile: true,
        gpuRenderer: 'Apple GPU',
        gpuVendor: 'Apple',
        maxTextureSize: 8192,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(highEndMobile);

      // #then
      expect(tier).toBe('medium');
    });

    it('should return low tier for integrated GPU desktop', () => {
      // #given
      const integratedGPU: DeviceInfo = {
        memory: 8,
        cores: 4,
        isMobile: false,
        gpuRenderer: 'Intel HD Graphics 630',
        gpuVendor: 'Intel',
        maxTextureSize: 4096,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(integratedGPU);

      // #then
      expect(tier).toBe('low');
    });

    it('should return high tier for high-end desktop', () => {
      // #given
      const highEndDesktop: DeviceInfo = {
        memory: 32,
        cores: 16,
        isMobile: false,
        gpuRenderer: 'NVIDIA GeForce RTX 4090',
        gpuVendor: 'NVIDIA',
        maxTextureSize: 16384,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(highEndDesktop);

      // #then
      expect(tier).toBe('high');
    });

    it('should return medium tier for mid-range desktop', () => {
      // #given
      const midRangeDesktop: DeviceInfo = {
        memory: 8,
        cores: 6,
        isMobile: false,
        gpuRenderer: 'AMD Radeon RX 580',
        gpuVendor: 'AMD',
        maxTextureSize: 8192,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(midRangeDesktop);

      // #then
      expect(tier).toBe('medium');
    });

    it('should return low tier for low memory devices', () => {
      // #given
      const lowMemory: DeviceInfo = {
        memory: 2,
        cores: 4,
        isMobile: false,
        gpuRenderer: 'Unknown',
        gpuVendor: 'Unknown',
        maxTextureSize: 4096,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(lowMemory);

      // #then
      expect(tier).toBe('low');
    });

    it('should return low tier for small texture size', () => {
      // #given
      const smallTexture: DeviceInfo = {
        memory: 8,
        cores: 8,
        isMobile: false,
        gpuRenderer: 'Unknown',
        gpuVendor: 'Unknown',
        maxTextureSize: 2048,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(smallTexture);

      // #then
      expect(tier).toBe('low');
    });

    it('should detect Apple Silicon as high tier', () => {
      // #given
      const appleSilicon: DeviceInfo = {
        memory: 16,
        cores: 10,
        isMobile: false,
        gpuRenderer: 'Apple M2 Pro',
        gpuVendor: 'Apple',
        maxTextureSize: 16384,
        webglVersion: 2,
      };

      // #when
      const tier = detectDeviceTier(appleSilicon);

      // #then
      expect(tier).toBe('high');
    });
  });

  describe('getQualityPreset', () => {
    it('should return correct preset for each tier', () => {
      // #given
      const tiers: DeviceTier[] = ['low', 'medium', 'high'];

      // #when / #then
      for (const tier of tiers) {
        const preset = getQualityPreset(tier);
        expect(preset).toBe(QUALITY_PRESETS[tier]);
      }
    });
  });

  describe('getAutoQualityPreset', () => {
    it('should return a valid preset', () => {
      // #given / #when
      const preset = getAutoQualityPreset();

      // #then
      expect(preset).toHaveProperty('particleCount');
      expect(preset).toHaveProperty('shadowMapSize');
      expect(preset).toHaveProperty('bloomEnabled');
    });
  });

  describe('clearDeviceInfoCache', () => {
    it('should allow re-detection after clearing cache', () => {
      // #given
      const device1: DeviceInfo = {
        memory: 4,
        cores: 4,
        isMobile: true,
        gpuRenderer: 'Test GPU',
        gpuVendor: 'Test',
        maxTextureSize: 4096,
        webglVersion: 2,
      };

      // #when
      const tier1 = detectDeviceTier(device1);
      clearDeviceInfoCache();

      const device2: DeviceInfo = {
        memory: 32,
        cores: 16,
        isMobile: false,
        gpuRenderer: 'NVIDIA RTX 4090',
        gpuVendor: 'NVIDIA',
        maxTextureSize: 16384,
        webglVersion: 2,
      };
      const tier2 = detectDeviceTier(device2);

      // #then
      expect(tier1).toBe('low');
      expect(tier2).toBe('high');
    });
  });

  describe('QualityPreset structure', () => {
    it('should have all required properties in each preset', () => {
      // #given
      const requiredProps = [
        'particleCount',
        'particleSize',
        'shadowMapSize',
        'shadowEnabled',
        'shadowSoftness',
        'bloomEnabled',
        'bloomIntensity',
        'ssaoEnabled',
        'antialiasingSamples',
        'lodBias',
        'lodDistanceNear',
        'lodDistanceFar',
        'physicsIterations',
        'physicsSubsteps',
        'maxPhysicsBodies',
        'maxLights',
        'textureQuality',
        'geometryDetail',
      ];

      // #when / #then
      for (const tier of ['low', 'medium', 'high'] as DeviceTier[]) {
        const preset = QUALITY_PRESETS[tier];
        for (const prop of requiredProps) {
          expect(preset).toHaveProperty(prop);
        }
      }
    });
  });
});
