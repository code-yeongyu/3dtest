## Task 5.3: Post-processing Effects

### Implementation Details

- **Effect Pipeline**:
  - Used `@react-three/postprocessing` for the effect composer.
  - **Bloom**: Adds glow to emissive materials (particles, text). Threshold `0.9`, Intensity `1.5`.
  - **Vignette**: Adds cinematic darkening at edges.
  - **GodRays**: Simulates volumetric light shafts from the sun.

- **Quality Tiers**:
  - **High**: Bloom + Vignette + GodRays (during REVEAL) + 4x Multisampling.
  - **Medium**: Bloom + Vignette.
  - **Low/Mobile**: Bloom only.
  - Logic implemented in `PostProcessing.tsx` using `useSceneStore`.

- **God Rays Logic**:
  - Created a `Sun` component (invisible mesh with high emissive color) to serve as the light source.
  - Only active during `REVEAL` state to match the narrative (sun rising/revealing).
  - Conditional rendering ensures performance cost is only paid when effect is visible.

- **Performance Optimization**:
  - **Conditional Rendering**: Effects are not just disabled but removed from the render tree when not needed (via array construction).
  - **Multisampling**: Disabled on Low/Medium tiers.
  - **Normal Pass**: Enabled only for High tier (required for some advanced effects, though mainly for GodRays/SSAO if used).

### Architecture Decisions

- **Array-based Children**:
  - Used an array of effect elements to handle conditional logic cleanly and avoid TypeScript errors with `null` children in `EffectComposer`.
  - This allows for flexible composition based on multiple conditions (quality, state).

- **Sun Management**:
  - The `Sun` mesh is part of `PostProcessing` component but rendered into the scene.
  - Used `useState` callback ref to ensure `GodRays` has access to the mesh instance immediately upon mounting.

### Gotchas & Fixes

- **EffectComposer Children Types**:
  - `EffectComposer` types in `@react-three/postprocessing` can be strict about `null` children.
  - Solution: Construct an array of valid elements and pass that as children, rather than using inline `condition && <Effect />`.

- **GodRays Source**:
  - `GodRays` requires a physical mesh reference, not just a light.
  - Created a specific `Sun` sphere with `toneMapped={false}` and high color intensity to ensure it generates strong rays.

## Task 5.4: CTA Button Integration

### Implementation Details

- **Technology**:
  - Used `framer-motion` for high-quality entrance/exit animations (`AnimatePresence`, `motion.div`).
  - Used `zustand` (`useAnimationStore`) to reactively track the `REVEAL` state.

- **Design & Aesthetics**:
  - **Glassmorphism**: `backdrop-blur-md`, `bg-white/5`, `border-white/20`.
  - **Interactive Feedback**: Scale on hover/tap, border brightening, and a subtle internal gradient shine effect.
  - **Timing**: Added a `2.0s` delay to the entrance animation to synchronize with the `RevealText` 3D animation (which takes ~2.5s). This ensures the button appears just as the text settles.

- **Accessibility & UX**:
  - **HTML Overlay**: Implemented as a standard HTML `<button>` (wrapped in `<a>`) rather than a 3D object to ensure screen reader accessibility and standard cursor behavior.
  - **Touch Targets**: Generous padding (`px-8 py-4`) ensures a large hit area for mobile users.
  - **Focus Management**: Standard HTML focus behavior is preserved.

### Architecture Decisions

- **Separation of Concerns**:
  - Kept the UI overlay separate from the 3D canvas (`src/components/ui/CTAButton.tsx` vs `src/components/canvas/MainCanvas.tsx`).
  - This prevents event bubbling issues and simplifies z-index management (`z-50` for UI).

- **State-Driven Visibility**:
  - The button is completely unmounted (via `AnimatePresence`) when not in the `REVEAL` state, preventing accidental clicks or interference during the scrolling/gameplay phases.

## Task 6.1: Audio Manager Setup

### Implementation Details

- **Technology**:
  - Used `howler.js` for cross-browser audio playback with Web Audio API fallback.
  - Singleton pattern for global audio state management.

- **User Interaction Gate**:
  - `init()` must be called from a user gesture (click/touch) to comply with browser autoplay policies.
  - Audio NEVER plays without explicit user interaction.
  - `Howler.autoUnlock = true` ensures Web Audio context is unlocked on first interaction.

- **Tab Visibility Handling**:
  - Listens to `document.visibilitychange` event.
  - Pauses audio when tab becomes hidden, resumes when visible.
  - Tracks `wasPlayingBeforeHidden` state to restore playback correctly.

- **Volume & Mute**:
  - Volume range: 0-1 (normalized).
  - Mute/unmute toggles both individual sound and global Howler state.
  - UI slider with percentage display.

### Architecture Decisions

- **Singleton Pattern**:
  - `AudioManager.getInstance()` ensures single source of truth for audio state.
  - Prevents multiple audio contexts and conflicting playback.

- **Subscription Model**:
  - `subscribe(callback)` pattern for reactive UI updates.
  - Immediately notifies new subscribers with current state.

- **HTML5 Audio Mode**:
  - `html5: true` in Howl config for better streaming of long audio files.
  - Reduces memory usage compared to Web Audio buffer mode.

### UI Component (AudioControls.tsx)

- **Design**:
  - Bottom-right corner positioning (`fixed bottom-6 right-6`).
  - Glassmorphism style matching existing UI (CTAButton).
  - Expandable volume slider on hover.

- **Accessibility**:
  - `aria-label` on mute button.
  - Standard HTML range input for volume.

### Gotchas & Fixes

- **Browser Autoplay Policy**:
  - Modern browsers block audio autoplay without user interaction.
  - Solution: Require explicit `init()` call from click handler.

- **Tab Visibility Edge Cases**:
  - Must track if audio was playing before tab hidden to avoid unwanted resume.
  - `wasPlayingBeforeHidden` flag handles this correctly.

## Task 6.2: BGM Integration

### Implementation Details

- **Technology**:
  - Created `useBGM.ts` hook using Howler.js for BGM playback.
  - Subscribes to `animationStore` for phase-based intensity control.

- **Phase Intensity Mapping**:
  - IDLE: volume 0.3, rate 1.0
  - PUSHING: volume 0.4, rate 1.0 (soft, building tension)
  - SUMMIT: volume 0.7, rate 1.05 (climactic build-up)
  - FALLING: volume 0.6, rate 0.95 (dramatic, descending)
  - DESPAIR: volume 0.35, rate 0.85 (melancholic, slow)
  - REVEAL: volume 0.9, rate 1.1 (triumphant, uplifting)

- **Smooth Transitions**:
  - Volume fades use Howler's built-in `fade()` method (1.5s duration).
  - Playback rate fades use custom interval-based interpolation (50ms steps).
  - Pause fades out over 500ms before actually pausing.

- **Audio File**:
  - Location: `public/audio/bgm.mp3`
  - Current: Silent placeholder (3 min, 1.4MB, 64kbps MP3)
  - TODO: Replace with royalty-free epic BGM from Pixabay/Freesound/YouTube Audio Library

### Architecture Decisions

- **Separate from AudioManager**:
  - `useBGM` creates its own Howl instance for BGM-specific control.
  - Still respects `audioManager.isReady()` for user interaction gate.
  - Allows independent volume/rate control without affecting other sounds.

- **Ref-based State**:
  - `isPlayingRef` used instead of state to avoid re-renders on play/pause.
  - `howlRef` persists Howl instance across renders.

### Gotchas & Fixes

- **Rate Interpolation**:
  - Howler doesn't have built-in rate fade, so implemented custom interval-based fade.
  - Uses 50ms step interval for smooth transitions.

- **Cleanup**:
  - Must `unload()` Howl instance on unmount to prevent memory leaks.
  - Clear any pending fade timeouts on unmount.

## Task 6.3: SFX Integration

### Implementation Details

- **Technology**:
  - Created `useSFX.ts` hook using Howler.js for sound effects.
  - Sound pooling system to manage max 10 simultaneous sounds.
  - Subscribes to `animationStore` for state-based SFX triggers.

- **Sound Effects**:
  - `boulder-roll.mp3`: Continuous, velocity-sensitive (rate 0.5-1.5x)
  - `footsteps.mp3`: Continuous, velocity-sensitive (rate 0.7-1.3x)
  - `boulder-impact.mp3`: One-shot on FALLING state
  - `despair-sigh.mp3`: One-shot on DESPAIR state
  - `reveal-whoosh.mp3`: One-shot on REVEAL state
  - Current: Silent placeholders generated via ffmpeg
  - TODO: Replace with royalty-free SFX from Freesound.org

- **State-to-SFX Mapping**:
  - PUSHING: boulder-roll + footsteps (looping)
  - SUMMIT: silence (dramatic pause)
  - FALLING: boulder-impact (one-shot)
  - DESPAIR: despair-sigh (one-shot)
  - REVEAL: reveal-whoosh (one-shot)

- **Velocity Sync**:
  - Boulder roll and footsteps playback rate varies with scroll velocity.
  - Normalized velocity (0-1) maps to rate range (minRate-maxRate).
  - Updates in real-time via `setVelocity()` callback.

### Architecture Decisions

- **Sound Pool Pattern**:
  - `SoundPool` class manages Howl instances per SFX type.
  - Reuses stopped sounds instead of creating new instances.
  - Hard limit of 10 concurrent sounds prevents audio overload.
  - `acquire()` / `release()` pattern for clean resource management.

- **State Transition Handling**:
  - Looping sounds (boulder-roll, footsteps) stop when leaving PUSHING state.
  - One-shot sounds auto-release via `onend` callback.
  - `STATE_STOP_SFX` map defines which sounds to stop on state exit.

- **Separation from BGM**:
  - SFX uses separate Howl instances from BGM.
  - Independent volume control via `masterVolume` option.
  - Both respect `audioManager.isReady()` for user interaction gate.

### File Size Constraints

- Individual file limit: 500KB (all files ~4-12KB)
- Total SFX limit: 1MB (actual: ~40KB)
- Generated silent placeholders via ffmpeg for development.

### Gotchas & Fixes

- **Sound Pool Cleanup**:
  - Must call `destroy()` on unmount to unload all Howl instances.
  - Track `inUse` flag to prevent double-release.

- **Velocity-Sensitive Rate**:
  - Must update rate on active sounds when velocity changes.
  - Use `howl.rate(rate, soundId)` to target specific playing instance.

## Task 8.1: prefers-reduced-motion Support

### Implementation Details

- **Technology**:
  - Created `useReducedMotion.ts` hook using `useSyncExternalStore` for SSR-safe media query detection.
  - Supports manual override (enable/disable/reset to system).
  - Module-level state for override persistence across hook instances.

- **Media Query Detection**:
  - Detects `(prefers-reduced-motion: reduce)` media query.
  - Real-time updates when system preference changes via `addEventListener('change')`.
  - SSR-safe: returns `false` on server, hydrates correctly on client.

- **Override System**:
  - `enableReducedMotion()`: Force reduced motion on.
  - `disableReducedMotion()`: Force reduced motion off.
  - `resetToSystem()`: Follow system preference.
  - `toggleOverride()`: Cycles through System -> Enabled -> Disabled -> System.

### Components Updated

- **SisyphusRig.tsx**:
  - Stops all animations when reduced motion is preferred.
  - Shows static poses based on animation state (PUSHING -> pushing pose, DESPAIR -> despair pose, etc.).
  - Mixer update skipped in useFrame when reduced motion is active.

- **RevealText.tsx**:
  - Uses `gsap.set()` for instant position instead of `gsap.to()` animation.
  - Text appears immediately at final position in REVEAL state.

- **Particle Components** (DustParticles, GoldenSparkles, EnergyBurst):
  - Return `null` when reduced motion is preferred.
  - Completely removes particle rendering from scene.

- **CameraRig.tsx**:
  - Uses instant position/lookAt instead of lerp interpolation.
  - Camera snaps to target position immediately.

### Architecture Decisions

- **Hook-based Approach**:
  - `usePrefersReducedMotion()` simple boolean hook for most use cases.
  - `useReducedMotion()` full hook with override controls for settings UI.
  - `getReducedMotionState()` imperative getter for non-React code.

- **Early Return Pattern**:
  - Particle components return `null` early to avoid unnecessary hook calls.
  - This is safe because the hook is called before the early return.

### Accessibility Considerations

- **Narrative Preservation**:
  - Static poses still convey the story (pushing, despair, standing).
  - RevealText still appears (just instantly).
  - Camera still moves to correct positions (just instantly).

- **No Seizure Risk**:
  - All rapid animations disabled.
  - No flashing particles.
  - Smooth camera movements replaced with instant cuts.

## Task 8.2: WebGL Fallback

### Implementation Details

- **Technology**:
  - Created `useWebGLSupport.ts` hook for WebGL detection.
  - Created `Fallback.tsx` component for non-WebGL browsers.
  - Updated `page.tsx` to conditionally render based on WebGL support.

- **WebGL Detection**:
  - Attempts to create `webgl2` or `webgl` context.
  - Checks for software renderers (SwiftShader, Software) via `WEBGL_debug_renderer_info`.
  - Returns `false` if no hardware-accelerated WebGL available.
  - Uses `useState` with `null` initial value for loading state.

- **Fallback Component**:
  - **Hero Visual**: SVG illustration of Sisyphus pushing boulder up mountain.
  - **Animated Elements**: Gradient orbs with scale/opacity animation, subtle grid pattern.
  - **Content**: "OlympusCode" title, "Code like a god" tagline, Sisyphus story description.
  - **CTA Button**: Matches existing CTAButton styling (glassmorphism, hover effects).
  - **WebGL Notice**: Subtle message about full 3D experience.

- **Loading State**:
  - Shows minimal spinner while WebGL detection runs.
  - Prevents flash of wrong content during hydration.

### Architecture Decisions

- **Client Component**:
  - `page.tsx` converted to `'use client'` for WebGL detection.
  - Detection must run in browser (no SSR for canvas context).

- **Progressive Enhancement**:
  - Full 3D experience for WebGL-capable browsers.
  - Static fallback with CSS animations for others.
  - All content accessible in both modes.

- **Framer Motion Animations**:
  - Fade-in, slide-up entrance animations.
  - Subtle hover effects on CTA button.
  - Animated SVG path drawing for mountain.
  - Floating boulder animation (cy oscillation).

### Gotchas & Fixes

- **TypeScript WebGL Types**:
  - `getContext('experimental-webgl')` returns `RenderingContext` union type.
  - Solution: Use explicit `WebGLContext` type alias and only use `webgl2`/`webgl`.

- **Software Renderer Detection**:
  - Some browsers fall back to software rendering (SwiftShader).
  - These perform poorly with Three.js, so treated as "not supported".
  - Check `WEBGL_debug_renderer_info` extension for renderer string.

## Task 10.1: Vercel Deployment Setup

### Implementation Details

- **vercel.json Configuration**:
  - Framework: `nextjs` (auto-detected, but explicit for clarity).
  - Static-only deployment (no API routes).
  - Aggressive caching headers for all static assets.

- **Cache Headers Strategy**:
  - `max-age=31536000, immutable` (1 year) for:
    - Audio files: `/audio/*`, `*.mp3`
    - Fonts: `*.woff2`, `*.woff`
    - Images: `*.svg`, `*.png`, `*.jpg`, `*.webp`
    - 3D assets: `*.glb`, `*.gltf`
    - Next.js static: `/_next/static/*`
  - `immutable` directive tells browsers to never revalidate.

- **.vercelignore Configuration**:
  - Excludes development/test files from deployment:
    - `.sisyphus/` (planning files)
    - `**/__tests__/`, `e2e/`, `test-results/`, `coverage/`
    - Config files: `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`
    - Documentation: `*.md`
    - Build artifacts: `.next/`, `node_modules/`, `bun.lock`

### Architecture Decisions

- **No Rewrites/Redirects**:
  - Single-page static app, no routing complexity.
  - Next.js handles all routing internally.

- **No API Routes**:
  - Pure static export, no serverless functions.
  - Reduces cold start latency and costs.

- **CDN-First Approach**:
  - All assets served from Vercel Edge Network.
  - Long cache TTLs reduce origin requests.
  - `immutable` prevents unnecessary revalidation.

### Build Verification

- `bun run build` succeeds with:
  - TypeScript compilation: ✓
  - Static page generation: 4 pages (/, /_not-found)
  - Build time: ~3.1s (Turbopack)
  - No console errors

### Gotchas & Fixes

- **Next.js 16 Turbopack Warning**:
  - Warning about multiple lockfiles (pnpm-lock.yaml in parent, bun.lock in project).
  - Non-blocking, can be silenced with `turbopack.root` in next.config.ts if needed.

- **Vercel Auto-Detection**:
  - Vercel auto-detects Next.js framework.
  - Explicit `"framework": "nextjs"` in vercel.json for documentation purposes.

## [2026-01-21 01:08] Performance Testing Results

### Desktop Performance (Lighthouse)
- **Score**: 94/100 ✅ (Target: ≥90)
- FCP: 0.2s, SI: 0.5s, LCP: 1.6s
- TTI: 1.6s, TBT: 70ms, CLS: 0
- **Status**: PASSED - Exceeds target

### Mobile Performance (Lighthouse)
- **Score**: 64/100 ❌ (Target: ≥70)
- FCP: 0.8s, SI: 0.8s, LCP: 8.8s
- TTI: 8.8s, TBT: 450ms, CLS: 0
- **Status**: FAILED - Below target

### Root Cause Analysis (Mobile)
1. **LCP 8.8s**: WebGL/Three.js initialization blocking
2. **TBT 450ms**: Heavy JavaScript execution on main thread
3. **TTI 8.8s**: Canvas setup + physics engine loading

### Optimization Needed
- Code splitting for Rapier physics (load on demand)
- Lazy load Three.js modules
- Show loading skeleton while canvas initializes
- Consider service worker for asset caching
- Investigate shader compilation time

### Trade-offs
- Complex 3D experience inherently heavy for mobile
- Current implementation prioritizes visual quality over mobile performance
- Pre-baked animations help but initialization still slow


## [2026-01-21 01:10] Deployment Learnings

### Vercel Configuration
- ✅ `vercel.json` properly configured with cache headers
- ✅ `.vercelignore` excludes dev/test files
- ✅ Framework auto-detected as Next.js
- ✅ Build command verified locally

### Vercel CLI Limitations
- Direct CLI upload may fail with certain file patterns
- GitHub integration is more reliable for production
- `.gitkeep` files (0 bytes) can cause issues - removed
- Alternative: CI/CD via GitHub Actions + Vercel

### Recommended Deployment Flow
1. **Development**: Local server (`bun run dev`)
2. **Testing**: Production build (`bun run build && bun run start`)
3. **CI**: GitHub Actions + Vercel integration
4. **Production**: Automatic deployment from main branch

### Manual Deployment Instructions
```bash
# If CLI fails, use GitHub integration:
1. git push origin main
2. Visit vercel.com/indentcorp/3dtest
3. Click "Deploy"
4. Verify at provided URL
```

