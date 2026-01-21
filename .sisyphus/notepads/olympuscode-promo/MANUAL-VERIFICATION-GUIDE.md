# Manual Verification Guide for OlympusCode

This document describes the remaining manual verification steps that require browser/device testing or deployment.

## Status: 36/50 Checks Complete ✅

### ✅ Completed Automated Checks
- [x] All implementation tasks (Phases 0-10) complete
- [x] Build succeeds (`bun run build`)
- [x] 175 unit tests passing
- [x] 54 E2E tests passing
- [x] All "Must Have" features implemented
- [x] All "Must NOT Have" guardrails respected
- [x] prefers-reduced-motion implemented
- [x] WebGL fallback implemented
- [x] Audio user interaction gate implemented
- [x] CTA button implemented

---

## 🔍 Remaining Manual Verification Steps

### 1. Performance Benchmarks (Desktop)

**Target**: 120fps sustained

**Steps**:
1. Run dev server: `bun dev`
2. Open http://localhost:3000 in Chrome
3. Open DevTools → Performance tab
4. Click Record
5. Scroll through entire page (0% → 100%)
6. Stop recording
7. Check FPS chart → should sustain ~120fps on high-end desktop

**Expected**:
- No significant frame drops
- GPU utilization efficient
- Particles render smoothly

---

### 2. Performance Benchmarks (Mobile)

**Target**: 60fps sustained on iPhone 12 or equivalent

**Steps**:
1. Deploy to preview environment or use ngrok
2. Open on iPhone 12 (or equivalent Android mid-range)
3. Scroll through entire experience
4. Use Safari/Chrome mobile dev tools for FPS monitoring

**Expected**:
- Consistent 60fps
- Pre-baked physics (no Rapier)
- Reduced particle count (5k vs 50k)
- Bloom-only post-processing

---

### 3. Lighthouse Performance Scores

**Desktop Target**: ≥ 90

**Steps**:
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run on production build
bun run build
bun run start

# Run Lighthouse (desktop)
lighthouse http://localhost:3000 --preset=desktop --output=html --output-path=./lighthouse-desktop.html
```

**Expected**:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

**Mobile Target**: ≥ 70

```bash
# Run Lighthouse (mobile)
lighthouse http://localhost:3000 --preset=mobile --output=html --output-path=./lighthouse-mobile.html
```

**Expected**:
- Performance: ≥ 70 (mobile has stricter requirements)
- Other metrics: ≥ 90

---

### 4. Vercel Deployment

**Steps**:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy to preview:
   ```bash
   vercel
   ```

3. Verify deployment:
   - Preview URL opens without errors
   - 3D canvas renders
   - Audio controls work
   - Scroll animation smooth
   - CTA button functional

4. Deploy to production:
   ```bash
   vercel --prod
   ```

5. Check production:
   - Run Lighthouse on production URL
   - Test from multiple devices
   - Verify caching headers (check Network tab for static assets)

**Expected**:
- Deployment succeeds
- No console errors
- All features functional
- Static assets cached properly (1 year max-age)

---

### 5. Cross-Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

**Checklist per browser**:
- [ ] Canvas renders
- [ ] Scroll animation works
- [ ] Audio plays after interaction
- [ ] CTA button clickable
- [ ] No console errors
- [ ] Performance acceptable

---

### 6. Accessibility Testing

**prefers-reduced-motion**:
1. Enable in OS settings (macOS: System Settings → Accessibility → Display → Reduce motion)
2. OR use DevTools: Rendering → Emulate CSS media feature `prefers-reduced-motion` → `reduce`
3. Reload page
4. Verify: No animations, static poses, instant transitions

**WebGL Fallback**:
1. Disable WebGL: Chrome → chrome://flags → WebGL → Disabled
2. Reload page
3. Verify: Static fallback with Sisyphus illustration, branding, CTA button

**Keyboard Navigation**:
- Tab through page
- CTA button focusable and activatable with Enter

---

### 7. Audio Verification

1. Load page → Audio should NOT auto-play
2. Interact with page (click anywhere)
3. Audio controls appear (bottom-right)
4. Click mute → BGM stops
5. Hover volume icon → Slider appears
6. Adjust volume → Works
7. Scroll through phases → BGM intensity changes
8. Trigger events → SFX play (boulder roll, impact, etc.)

---

### 8. Visual Regression

Capture screenshots at key scroll positions:
- 0% (Initial)
- 20% (Push phase)
- 40% (Summit)
- 60% (Fall)
- 80% (Despair)
- 100% (Reveal with text and CTA)

Compare across browsers and devices for consistency.

---

## Checklist Summary

Current status: **36/50 complete**

Remaining manual steps:
- [ ] Desktop 120fps verified
- [ ] Mobile 60fps verified
- [ ] Lighthouse Desktop ≥ 90
- [ ] Lighthouse Mobile ≥ 70
- [ ] Vercel preview deployment successful
- [ ] Vercel production deployment successful
- [ ] Cross-browser testing complete
- [ ] Accessibility manual testing complete
- [ ] Audio workflow verified
- [ ] Visual regression baseline established
- [ ] Real device testing (iPhone 12 or equivalent)
- [ ] Real device testing (Android mid-range)
- [ ] Production monitoring setup (optional)
- [ ] Performance degradation alerts (optional)

---

## Notes

- Many remaining items require browser interaction or real devices
- Performance targets are aggressive (120fps desktop) - may need tuning
- Mobile optimizations are in place but need real device verification
- Thermal throttling detection is implemented but needs real device testing

## Quick Verification Commands

```bash
# Development
bun dev                    # Start dev server

# Testing
bun test                   # Run unit tests (175 passing)
bunx playwright test       # Run E2E tests (54 passing)

# Production build
bun run build              # Build for production
bun run start              # Start production server

# Deployment
vercel                     # Deploy to preview
vercel --prod             # Deploy to production

# Performance
lighthouse http://localhost:3000 --preset=desktop
lighthouse http://localhost:3000 --preset=mobile
```
