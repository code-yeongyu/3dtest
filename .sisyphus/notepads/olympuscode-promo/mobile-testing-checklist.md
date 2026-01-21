# Mobile Testing Checklist

## Overview

This checklist covers manual testing procedures for mobile devices to verify the OlympusCode promo page performs optimally on mobile hardware.

---

## Test Devices (Recommended)

### iOS
- [ ] iPhone 12/13 (baseline modern)
- [ ] iPhone SE (low-end)
- [ ] iPad Air (tablet)

### Android
- [ ] Samsung Galaxy S21+ (flagship)
- [ ] Google Pixel 6a (mid-range)
- [ ] Samsung Galaxy A52 (budget)

---

## Pre-Test Setup

- [ ] Clear browser cache
- [ ] Close all background apps
- [ ] Disable battery saver mode
- [ ] Connect to stable WiFi
- [ ] Enable browser developer tools (if available)

---

## Performance Targets

| Metric | Target | Minimum Acceptable |
|--------|--------|-------------------|
| FPS | 60fps | 30fps |
| Initial Load | <3s | <5s |
| Time to Interactive | <2s | <4s |
| Memory Usage | <150MB | <256MB |
| Frame Time | <16.67ms | <33.33ms |

---

## Test Scenarios

### 1. Initial Load

- [ ] Page loads without errors
- [ ] 3D canvas renders correctly
- [ ] No white flash or layout shift
- [ ] Loading indicator displays (if any)
- [ ] Quality tier auto-detects to "low" or "medium"

### 2. Scroll Animation (Core Experience)

- [ ] Scroll from top to bottom smoothly
- [ ] Boulder follows pre-baked path (no physics jitter)
- [ ] Sisyphus animation syncs with scroll
- [ ] No frame drops during scroll
- [ ] Scroll feels responsive (no input lag)

### 3. Particle Systems

- [ ] Dust particles visible but not overwhelming
- [ ] Golden sparkles render correctly
- [ ] Energy burst triggers at correct phase
- [ ] Particle count visually reduced (vs desktop)
- [ ] No particle "explosion" or glitches

### 4. Visual Quality

- [ ] Boulder geometry looks acceptable (16 segments)
- [ ] Terrain renders without holes
- [ ] Lighting transitions smoothly between phases
- [ ] Bloom effect visible but subtle
- [ ] No z-fighting or flickering

### 5. Post-Processing

- [ ] Bloom renders correctly
- [ ] No Vignette effect (disabled on mobile)
- [ ] No GodRays (disabled on mobile)
- [ ] Colors appear correct (no over-saturation)

### 6. Touch Interactions

- [ ] Scroll works with touch
- [ ] No accidental zoom on double-tap
- [ ] CTA button tappable
- [ ] Audio controls responsive
- [ ] No touch delay

### 7. Orientation Changes

- [ ] Portrait mode renders correctly
- [ ] Landscape mode renders correctly
- [ ] Transition between orientations smooth
- [ ] Canvas resizes appropriately
- [ ] No content cut-off

### 8. Thermal Throttling Test

- [ ] Run page for 5+ minutes continuously
- [ ] Monitor for FPS degradation
- [ ] Check device temperature (warm but not hot)
- [ ] Verify graceful degradation if throttling occurs
- [ ] No crashes or freezes

---

## Visual Regression Checks

### Phase 0: Intro
- [ ] Blue-ish lighting
- [ ] Boulder at starting position
- [ ] Sisyphus in idle pose

### Phase 1: Pushing
- [ ] Neutral lighting
- [ ] Boulder moving uphill
- [ ] Sisyphus pushing animation

### Phase 2: Summit
- [ ] Golden lighting begins
- [ ] Boulder at peak
- [ ] Sisyphus strain pose

### Phase 3: Falling
- [ ] Orange/sunset lighting
- [ ] Boulder rolling down
- [ ] Sisyphus reaching pose

### Phase 4: Reveal
- [ ] Warm golden lighting
- [ ] Text reveal animation
- [ ] Energy burst effect
- [ ] Final composition correct

---

## Audio Testing

- [ ] BGM plays on user interaction
- [ ] SFX triggers correctly
- [ ] Volume controls work
- [ ] Mute persists across refresh
- [ ] No audio glitches or pops

---

## Network Conditions

### Fast WiFi
- [ ] All assets load correctly
- [ ] No texture pop-in

### Slow 3G (Simulated)
- [ ] Page eventually loads
- [ ] Graceful loading states
- [ ] No broken textures

### Offline (After Initial Load)
- [ ] Page remains functional
- [ ] No network errors in console

---

## Browser-Specific Tests

### Safari (iOS)
- [ ] WebGL2 works correctly
- [ ] Touch events handled
- [ ] No Safari-specific rendering bugs
- [ ] Scroll momentum feels native

### Chrome (Android)
- [ ] WebGL2 works correctly
- [ ] Touch events handled
- [ ] No Chrome-specific bugs
- [ ] Smooth scrolling

### Samsung Internet
- [ ] Basic functionality works
- [ ] No major rendering issues

---

## Accessibility

- [ ] Text readable at default zoom
- [ ] Sufficient color contrast
- [ ] Animations not causing motion sickness
- [ ] Reduced motion preference respected (if implemented)

---

## Console Errors

- [ ] No JavaScript errors
- [ ] No WebGL warnings
- [ ] No memory warnings
- [ ] No deprecation warnings

---

## Memory Leak Test

1. [ ] Load page fresh
2. [ ] Note initial memory usage
3. [ ] Scroll through entire experience 5 times
4. [ ] Check memory usage again
5. [ ] Memory should not grow significantly (>50MB)

---

## Sign-Off

| Device | Tester | Date | Pass/Fail | Notes |
|--------|--------|------|-----------|-------|
| | | | | |
| | | | | |
| | | | | |

---

## Known Issues / Limitations

1. **Physics disabled on mobile** - Boulder uses pre-baked path instead of Rapier physics
2. **Reduced particle counts** - 3,000 dust particles vs 30,000 on desktop
3. **No GodRays** - Disabled for performance
4. **Lower DPR** - Max 1.5x vs 2x on desktop
5. **Simplified LOD** - Closer culling distances

---

## Debugging Tips

### Check Quality Tier
```javascript
// In browser console
localStorage.getItem('quality-settings')
```

### Force Low Quality
```javascript
// In browser console
localStorage.setItem('quality-settings', JSON.stringify({ userOverrideTier: 'low' }))
location.reload()
```

### Monitor FPS
- Use browser DevTools Performance tab
- Or enable Stats panel in development mode

### Check WebGL Info
```javascript
// In browser console
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
console.log('Renderer:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
console.log('Vendor:', gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
```
