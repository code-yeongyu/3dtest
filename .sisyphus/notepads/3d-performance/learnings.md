# 3D Performance Optimization Learnings

## Task 7.1: 3-Tier Quality System

### Implementation Summary

Created a comprehensive 3-tier quality system with automatic device detection and manual override capability.

### Files Created/Modified

1. **`src/lib/qualityTiers.ts`** (NEW)
   - `DeviceTier` type: 'low' | 'medium' | 'high'
   - `QualityPreset` interface with all quality settings
   - `QUALITY_PRESETS` constant with tier-specific values
   - `getDeviceInfo()`: Detects RAM, cores, GPU, WebGL version
   - `detectDeviceTier()`: Determines tier from device capabilities
   - `getQualityPreset()`: Returns preset for given tier

2. **`src/stores/settingsStore.ts`** (NEW)
   - Zustand store with persist middleware
   - `detectedTier`: Auto-detected quality tier
   - `userOverrideTier`: Manual override (null = auto)
   - `currentPreset`: Active quality preset
   - `setUserOverride()`: Apply manual tier selection
   - `resetToAuto()`: Clear override, use auto-detection
   - `initializeDetection()`: Run detection on mount

3. **`src/hooks/useDeviceCapability.ts`** (UPDATED)
   - Now integrates with `qualityTiers.ts` and `settingsStore.ts`
   - Returns `preset` and `isAutoDetected` in addition to `tier` and `isMobile`
   - Exports helper hooks: `useQualityPreset()`, `useQualityTier()`

### Device Detection Criteria

| Tier | RAM | Cores | GPU | Mobile |
|------|-----|-------|-----|--------|
| Low | <4GB | <4 | Integrated | Yes (basic) |
| Medium | 8GB+ | 6+ | Mid-range | Yes (flagship) |
| High | 16GB+ | 8+ | Dedicated | No |

### Quality Preset Differences

| Setting | Low | Medium | High |
|---------|-----|--------|------|
| Particle Count | 100 | 500 | 2000 |
| Shadow Map | 512 | 1024 | 2048 |
| Shadows | Off | On | On |
| Bloom | Off | On | On |
| SSAO | Off | Off | On |
| AA Samples | 0 | 2 | 4 |
| Max Lights | 2 | 4 | 8 |
| Physics Bodies | 20 | 50 | 100 |

### Key Design Decisions

1. **Capability-based detection over user agent**: Uses WebGL, deviceMemory API, hardwareConcurrency, and GPU renderer info
2. **Persistent user override**: Settings stored in localStorage via Zustand persist
3. **Immediate preset application**: Changing tier instantly updates `currentPreset`
4. **Backward compatible**: Existing code using `useDeviceCapability()` continues to work

### Usage Examples

```tsx
// Basic usage (unchanged from before)
const { tier, isMobile } = useDeviceCapability();

// New: Access full preset
const { tier, preset, isAutoDetected } = useDeviceCapability();

// New: Direct preset access
const preset = useQualityPreset();
console.log(preset.particleCount); // 100, 500, or 2000

// New: Manual override
const { setUserOverride, resetToAuto } = useSettingsStore();
setUserOverride('high'); // Force high quality
resetToAuto(); // Return to auto-detection
```
