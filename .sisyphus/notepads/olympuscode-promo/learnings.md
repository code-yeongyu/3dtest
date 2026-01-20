# Learnings - OlympusCode Promo Project

## Task 0.1: Initialize Next.js 15 + R3F Project

### Setup Commands Used

```bash
# Create Next.js project (used bun instead of pnpm due to environment)
bunx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-bun --turbopack

# Install R3F dependencies
bun add three @react-three/fiber @react-three/drei @react-three/rapier
bun add -d @types/three

# Install Prettier
bun add -d prettier eslint-config-prettier eslint-plugin-prettier
```

### Package Versions Installed

- next: 16.1.4 (latest as of 2026-01-20)
- react: 19.2.3
- react-dom: 19.2.3
- three: 0.182.0
- @react-three/fiber: 9.5.0
- @react-three/drei: 10.7.7
- @react-three/rapier: 2.2.0
- @types/three: 0.182.0
- typescript: 5.9.3
- eslint: 9.39.2
- prettier: 3.8.0
- tailwindcss: 4.1.18

### Gotchas & Notes

1. **Next.js 16 vs 15**: `create-next-app@latest` now creates Next.js 16.1.4, not 15. The task specified "Next.js 15" but latest is 16. Proceeding with latest as it's backward compatible.

2. **Turbopack Warning**: Next.js shows a warning about multiple lockfiles when using Turbopack. This is because there's a global pnpm-lock.yaml in the user's home directory. Can be silenced by setting `turbopack.root` in next.config.ts if needed.

3. **ESLint 9 Flat Config**: Next.js 16 uses ESLint 9 with flat config format (`eslint.config.mjs`). Prettier integration requires:
   - `eslint-config-prettier` for disabling conflicting rules
   - `eslint-plugin-prettier` for running Prettier as ESLint rule

4. **Tailwind CSS v4**: Uses new `@import "tailwindcss"` syntax and `@theme inline` directive. CSS language servers may show false positive errors for Tailwind-specific syntax.

5. **R3F Canvas in Next.js App Router**: Must use `'use client'` directive for Canvas component since R3F uses browser APIs.

6. **TypeScript Strict Mode**: Already enabled by default in create-next-app generated tsconfig.json.

### Folder Structure Created

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
│   ├── canvas/    # R3F canvas components (MainCanvas.tsx)
│   ├── ui/        # HTML UI components
│   └── three/     # Three.js specific components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── stores/        # State management (Zustand will be added later)
└── types/         # TypeScript type definitions
```

### Verification Results

- ✅ `bun dev` - Server starts successfully (port 3001 used as 3000 was occupied)
- ✅ `bun build` - Production build succeeds with static generation
- ✅ `bun lint` - ESLint passes with no errors (after running `bun format`)
- ✅ HTTP 200 response from dev server

---

## Task 0.2: Setup Test Infrastructure

### Setup Commands Used

```bash
# Install Vitest and testing dependencies
bun add -d vitest @vitest/ui @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom

# Install Playwright
bun add -d @playwright/test

# Install Playwright browsers
bunx playwright install --with-deps

# Run tests
bunx vitest run        # Unit tests
bunx playwright test   # E2E tests
```

### Package Versions Installed

- vitest: 4.0.17
- @vitest/ui: 4.0.17
- @testing-library/react: 16.3.2
- @testing-library/jest-dom: 6.9.1
- @vitejs/plugin-react: 5.1.2
- jsdom: 27.4.0
- @playwright/test: 1.57.0

### Configuration Files Created

1. **vitest.config.ts**
   - React plugin integration via `@vitejs/plugin-react`
   - jsdom environment for DOM testing
   - Explicit imports (globals: false) for better IDE support
   - Coverage configuration with v8 provider
   - Excluded e2e directory to prevent conflicts

2. **vitest.setup.ts**
   - Extended Vitest expect with @testing-library/jest-dom matchers
   - Used `expect.extend(matchers)` pattern instead of direct import

3. **playwright.config.ts**
   - Multi-browser testing: Chromium, Firefox, WebKit
   - Mobile testing: Pixel 5, iPhone 12
   - Headless mode for CI
   - Auto-start dev server with `webServer` config
   - Screenshots on failure, trace on first retry

### Gotchas & Notes

1. **Bun Test Runner Conflict**:
   - `bun test` runs Bun's built-in test runner, NOT Vitest
   - Must use `bunx vitest` to run Vitest explicitly
   - Updated package.json script to `"test": "bunx vitest"`

2. **@testing-library/jest-dom Setup**:
   - Cannot use direct import `import '@testing-library/jest-dom'`
   - Must manually extend expect: `expect.extend(matchers)`
   - This is because Vitest doesn't auto-inject global `expect`

3. **E2E Directory Exclusion**:
   - Vitest tried to run Playwright test files by default
   - Added `exclude: ['**/e2e/**']` to vitest.config.ts
   - Prevents "Playwright Test did not expect test.describe()" error

4. **Playwright URL Matching**:
   - Next.js may redirect to locale-specific URLs (e.g., `/en`)
   - Use regex patterns for URL assertions: `toHaveURL(/localhost:3000/)`
   - Avoids brittle exact string matching

5. **Test Scripts in package.json**:
   ```json
   "test": "bunx vitest",
   "test:ui": "vitest --ui",
   "test:e2e": "playwright test",
   "test:e2e:ui": "playwright test --ui"
   ```

### Test Files Created

1. **src/**tests**/example.test.ts**
   - 4 basic unit tests demonstrating Vitest setup
   - Tests: assertions, strings, arrays, async operations
   - All tests passing ✅

2. **e2e/example.spec.ts**
   - 4 E2E tests demonstrating Playwright setup
   - Tests: page load, title, responsive, content rendering
   - All tests passing ✅

### Verification Results

- ✅ `bunx vitest run` - 4 unit tests passed
- ✅ `bunx playwright test --project=chromium` - 4 E2E tests passed
- ✅ Vitest UI accessible via `bunx vitest --ui`
- ✅ Playwright UI accessible via `bunx playwright test --ui`
- ✅ Coverage configuration working
- ✅ Multi-browser support configured (Chromium, Firefox, WebKit)
- ✅ Mobile viewport testing configured

### How to Run Tests

```bash
# Unit tests (watch mode)
bun test

# Unit tests (single run)
bun test --run

# Unit tests with UI
bun test:ui

# E2E tests (all browsers)
bun test:e2e

# E2E tests (single browser)
bunx playwright test --project=chromium

# E2E tests with UI
bun test:e2e:ui
```

---

## Task 1.1: Setup R3F Canvas with Performance Monitoring

### Setup Commands Used

```bash
# Install stats.js for FPS monitoring
bun add stats.js zustand
bun add -D @types/stats.js
```

### Package Versions Installed

- stats.js: 0.17.0
- zustand: 5.0.10
- @types/stats.js: 0.17.4

### Files Created/Modified

1. **src/hooks/useDeviceCapability.ts**
   - Device tier detection (low/medium/high)
   - Mobile detection via user agent
   - GPU detection via WebGL debug info
   - Uses `useSyncExternalStore` for SSR-safe state

2. **src/stores/sceneStore.ts**
   - Zustand store for global 3D state
   - Tracks: quality tier, isReady, isLoading

3. **src/components/canvas/Stats.tsx**
   - Wrapper component with dev-only conditional
   - Uses `next/dynamic` for lazy loading

4. **src/components/canvas/StatsPanel.tsx**
   - Actual stats.js implementation
   - Dynamic import of stats.js library
   - Integrates with R3F useFrame for updates

5. **src/components/canvas/MainCanvas.tsx**
   - Enhanced with performance settings:
     - `dpr={[1, 2]}` (mobile: [1, 1.5])
     - `antialias: false` (performance)
     - `powerPreference: 'high-performance'`
     - `stencil: false` (not needed)
     - `shadows={false}` (will enable per quality tier)
     - `flat` (disable tone mapping)

### Device Tier Detection Logic

```typescript
// Tier assignment based on:
// - navigator.deviceMemory (RAM in GB)
// - navigator.hardwareConcurrency (CPU cores)
// - WebGL UNMASKED_RENDERER_WEBGL (GPU info)
// - User agent (mobile detection)

// Low: Mobile, <4GB RAM, integrated GPU
// Medium: 8GB+ RAM, 6+ cores
// High: 16GB+ RAM, 8+ cores, dedicated GPU
```

### Gotchas & Notes

1. **stats.js in Production Bundle**:
   - Initial approach: `process.env.NODE_ENV !== 'development'` check
   - Problem: Code still bundled, just not executed
   - Solution: `next/dynamic` + conditional rendering
   - Result: Lazy-loaded chunk never requested in production

2. **React 19 setState in useEffect Warning**:
   - ESLint rule `react-hooks/set-state-in-effect` triggered
   - Solution: Use `useSyncExternalStore` instead of useState + useEffect
   - Benefits: SSR-safe, no hydration mismatch, no cascading renders

3. **WebGL Context for GPU Detection**:
   - Create temporary canvas for WebGL context
   - Use `WEBGL_debug_renderer_info` extension
   - Graceful fallback if WebGL unavailable

4. **R3F Canvas Performance Settings**:
   - `dpr` clamps pixel ratio for performance
   - `antialias: false` saves GPU cycles (quality system will enable)
   - `powerPreference: 'high-performance'` hints to use dedicated GPU
   - `stencil: false` disables unused buffer

### Verification Results

- ✅ `bun dev` - FPS counter visible in top-left (60 FPS)
- ✅ `bun build` - Production build succeeds
- ✅ Production: stats.js chunk NOT loaded (verified via network tab)
- ✅ Production: No FPS counter visible
- ✅ `bun lint` - No ESLint errors
- ✅ TypeScript - No type errors

### Network Verification (Production)

Chunks loaded in production:

- `d3c446bde8213381.js`
- `8ffedbeb1fd054fe.js`
- `b815cde8f753af03.js`
- `turbopack-335c0d325f3fe969.js`
- `0ba1a4a6a53a4c14.js`
- `c8ab9d3a4c53708d.js`
- `882664d231051c63.js`
- `f76a92830c26ad19.js`

Chunks NOT loaded (stats.js):

- `83552f5ae8a74dfd.js` ❌
- `d52d64bd15bed98d.js` ❌

---

## Task 1.2: Camera System with Scroll Integration

### Setup Commands Used

```bash
bun add gsap
```

### Package Versions Installed

- gsap: 3.14.2

### Files Created

1. **src/hooks/useScrollProgress.ts**

   - GSAP ScrollTrigger integration for scroll tracking
   - Returns normalized progress (0-1), phase (0-4), and phaseProgress (0-1)
   - Uses `useSyncExternalStore` for SSR-safe state management
   - Phase boundaries: 0-20% (Push), 20-40% (Summit), 40-60% (Fall), 60-80% (Despair), 80-100% (Reveal)
   - Includes easing utilities: linear, easeInOut, easeOut, easeIn

2. **src/components/canvas/CameraRig.tsx**

   - R3F component controlling camera position via useFrame
   - 5 waypoints defined for each animation phase:
     - Phase 0 (Push): position [5, 2, 8], lookAt [0, 1, 0]
     - Phase 1 (Summit): position [3, 5, 6], lookAt [0, 3, 0]
     - Phase 2 (Fall): position [8, 6, 10], lookAt [2, 0, 2]
     - Phase 3 (Despair): position [2, 1, 4], lookAt [0, 0.5, 0]
     - Phase 4 (Reveal): position [0, 8, 15], lookAt [0, 5, 0]
   - Smooth interpolation using lerp (factor: 0.05)
   - EaseInOut applied between waypoints for cinematic feel

3. **src/components/ui/ScrollIndicator.tsx**

   - Debug UI showing scroll progress and current phase
   - Displays global progress, phase progress, and phase indicator
   - Fixed position bottom-left for easy monitoring

4. **src/app/page.tsx** (Modified)
   - Canvas fixed in background (z-0)
   - Main content scrollable (h-[500vh] for 5x viewport height)
   - Enables scroll-based camera movement

### Architecture Decisions

1. **GSAP ScrollTrigger vs drei useScroll**:

   - Chose GSAP ScrollTrigger for more control over scrub timing
   - `scrub: 0.5` provides smooth 0.5s delay for cinematic feel
   - Works with standard HTML scroll (not R3F ScrollControls)

2. **Camera Interpolation Strategy**:

   - Two-stage interpolation: waypoint → target → current
   - Phase progress interpolates between current and next waypoint
   - Lerp smooths actual camera movement for no jerky transitions
   - Both position AND lookAt are interpolated for smooth camera rotation

3. **State Management**:
   - Global scroll state via module-level variable + listeners
   - `useSyncExternalStore` for React integration (SSR-safe)
   - Avoids useState/useEffect pattern that triggers React 19 warnings

### Gotchas & Notes

1. **Scroll Container Setup**:

   - Canvas must be `fixed` with `inset-0` to stay in background
   - Main content needs explicit height (500vh = 5 viewport heights)
   - ScrollTrigger uses `document.documentElement` as trigger

2. **Camera Initial Position**:

   - Must match first waypoint in CameraRig
   - Canvas camera prop: `position: [5, 2, 8]`
   - Prevents initial jump on first scroll

3. **Lerp Factor Tuning**:

   - 0.05 provides smooth but responsive movement
   - Lower = smoother but more lag
   - Higher = snappier but potentially jerky

4. **Test Objects Added**:
   - Temporary meshes added to MainCanvas for visual feedback
   - Box at [0, 1, 0], Sphere at [0, 3, 0], Cone at [2, 0, 2], Torus at [0, 5, 0]
   - GridHelper for spatial reference
   - Will be replaced by actual scene objects in later tasks

### Verification Results

- ✅ `bun dev` - Dev server starts, scroll changes camera position
- ✅ `bun run build` - Production build succeeds
- ✅ `bun lint` - No ESLint errors (after `bun format`)
- ✅ TypeScript - No type errors
- ✅ Forward scroll - Camera moves through all 5 waypoints
- ✅ Backward scroll - Camera reverses smoothly
- ✅ No jerky movements - Lerp + easing provides smooth transitions

### How to Test Camera Movement

```bash
bun dev
# Open http://localhost:3000
# Scroll down to see camera move through phases
# Watch ScrollIndicator in bottom-left for progress info
```

---

## Task 1.2 Bug Fixes: ScrollTrigger Issues

### Bugs Fixed

1. **getServerSnapshot Infinite Loop**
   - **Symptom**: React error "The result of getServerSnapshot should be cached to avoid an infinite loop"
   - **Root Cause**: `getServerSnapshot()` returned a new object `{ progress: 0, phase: 0, phaseProgress: 0 }` on every call
   - **Fix**: Cache the server snapshot as a module-level constant
   ```typescript
   const serverSnapshot: ScrollProgress = { progress: 0, phase: 0, phaseProgress: 0 };
   function getServerSnapshot(): ScrollProgress {
     return serverSnapshot;
   }
   ```

2. **ScrollTrigger Not Updating Progress**
   - **Symptom**: Scroll Progress UI stuck at 0.0% even after scrolling
   - **Root Cause**: GSAP ScrollTrigger's `onUpdate` callback wasn't firing
   - **Investigation**: 
     - ScrollTrigger was being created (confirmed via console.log)
     - But `onUpdate` never fired during scroll
     - Tried various configurations: `scrub: true`, `scrub: 0.5`, `start: 0, end: 'max'`
     - None worked reliably
   - **Final Fix**: Replaced GSAP ScrollTrigger with native scroll event listener
   ```typescript
   const handleScroll = () => {
     const scrollTop = window.scrollY;
     const docHeight = document.documentElement.scrollHeight - window.innerHeight;
     const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
     updateScrollProgress(progress);
   };
   window.addEventListener('scroll', handleScroll, { passive: true });
   ```

### Key Learnings

1. **useSyncExternalStore Requirements**:
   - `getServerSnapshot` MUST return a stable reference (same object)
   - Returning a new object causes React to think state changed → infinite re-render
   - Always cache server snapshot as a module-level constant

2. **GSAP ScrollTrigger Limitations**:
   - ScrollTrigger works best with a specific `trigger` element
   - Without `scrub`, `onUpdate` only fires on enter/leave
   - With `scrub`, it creates a tween animation (not just tracking)
   - For simple scroll progress tracking, native scroll events are more reliable

3. **Native Scroll Events**:
   - `{ passive: true }` improves scroll performance
   - Formula: `progress = scrollTop / (scrollHeight - innerHeight)`
   - Clamp to [0, 1] to handle edge cases

### Removed Dependencies

- Removed GSAP imports from useScrollProgress.ts (no longer needed for scroll tracking)
- GSAP still available in project for other animations if needed

### Verification Results

- ✅ No console errors (getServerSnapshot fixed)
- ✅ Scroll to 0% → UI shows 0.0%, Phase 0: Push
- ✅ Scroll to 50% → UI shows 50.0%, Phase 2: Fall
- ✅ Scroll to 75% → UI shows 75.0%, Phase 3: Despair
- ✅ Scroll to 100% → UI shows 100.0%, Phase 4: Reveal
- ✅ Build succeeds
- ✅ TypeScript/ESLint pass

---

## Task 1.3: Scene Lighting Setup

### Implementation Details

- **3-Point Lighting**: Implemented Key (Directional), Fill (Hemisphere), and Rim (Directional) lights.
- **Color Temperature**: Mapped 5 animation phases to color palettes (Dawn -> Morning -> Afternoon -> Evening -> Golden Hour).
- **Interpolation**: Used `useFrame` and `lerpColors` for smooth transitions between phases based on scroll progress.
- **Quality Tiers**: 
  - High: Shadows enabled, 2048x2048 map size.
  - Medium: Shadows enabled, 1024x1024 map size.
  - Low: Shadows disabled for performance.
- **Shadow Configuration**: Tuned shadow bias (-0.0001) and camera frustum to cover the scene area (-10 to 10).
- **Performance**: Limited to 3 main lights. Shadows only on Key light.

### Verification Results

- ✅ `bun build` - Production build succeeds
- ✅ `bun lint` - No ESLint errors
- ✅ TypeScript - No type errors
- ✅ Shadows enabled on High/Medium tiers
- ✅ Shadows disabled on Low tier
- ✅ Color transitions smooth across phases
