# OlympusCode Promotional 3D Animation Website

## Context

### Original Request

Three.js를 활용해서 시지푸스가 돌을 밀어올리다가 끝까지 올리면 다시 떨어지고 크게 좌절하지만 다시 밀어내다가 하늘에서 애니메이션이 내려오면서 "OlympusCode"라고 홍보하는 애니메이션 웹 제작.

### Interview Summary

**Key Discussions**:

- **Character**: Procedural 생성 (코드 기반 기하학적 캐릭터, 외부 3D 모델 없음)
- **Visual Style**: Full 3D, 최대 복잡도 + 미학 추구
- **Effects**: "미친듯이 이펙트 팍 터지면서도 120fps" → GPU 파티클 + 셰이더 이펙트
- **Audio**: 전체 사운드 디자인 (BGM + SFX)
- **Interaction**: 스크롤 기반 애니메이션
- **Mobile**: 동일한 경험 + 극한 최적화
- **Testing**: E2E (Playwright) + Unit (Vitest), 강박적 모듈화
- **Deploy**: Vercel 정적 호스팅

**Research Findings**:

- Rapier physics: cannon.js 대비 2-10x 성능
- troika-three-text: SDF 기반 고품질 3D 텍스트
- GPU instancing: 파티클 성능 필수
- Mobile-first + LOD: 동일 경험 유지 핵심

### Metis Review

**Identified Gaps** (addressed in this plan):

- **Performance Target Conflict**: 120fps + "insane effects" + mobile = 상충 → 3-tier 품질 시스템 도입
- **Procedural Character Risk**: 복잡한 인간형 어려움 → Stylized geometric 접근 명시
- **Mobile Physics**: Real-time physics 비현실적 → Pre-baked animation fallback
- **prefers-reduced-motion**: 접근성 누락 → Day 1부터 구현
- **Fallback Strategy**: WebGL 미지원 → Static fallback 정의
- **Audio Autoplay**: 브라우저 차단 → User interaction 필수

---

## Work Objectives

### Core Objective

OlympusCode AI 코딩 툴을 홍보하는 시지푸스 신화 기반 3D 인터랙티브 웹사이트 구축. 스크롤 기반으로 시지푸스의 고된 노동 → 좌절 → 재시도 스토리를 전개하고, 클라이맥스에서 "OlympusCode"가 하늘에서 내려오며 화려한 이펙트와 함께 브랜드를 각인시킴.

### Concrete Deliverables

1. **Next.js 프로젝트**: SSR/SEO 최적화된 단일 페이지 애플리케이션
2. **3D Scene**: Procedural 시지푸스 + 돌 + 언덕 환경
3. **Animation System**: 5-phase 스크롤 기반 애니메이션
4. **Effects System**: GPU 파티클 + Post-processing
5. **Audio System**: BGM + SFX, user-initiated
6. **Performance System**: 3-tier 품질 (Low/Medium/High)
7. **Test Suite**: E2E + Unit tests
8. **Deployment**: Vercel 배포 설정

### Definition of Done

- [ ] `pnpm build && pnpm start` → 에러 없이 실행
- [ ] Lighthouse Performance score ≥ 90 (Desktop)
- [ ] Lighthouse Performance score ≥ 70 (Mobile)
- [ ] Desktop: 120fps sustained (Chrome DevTools Performance)
- [ ] Mobile (iPhone 12 기준): 60fps sustained
- [ ] All E2E tests pass: `pnpm test:e2e`
- [ ] All unit tests pass: `pnpm test`
- [ ] Vercel preview deployment 성공

### Must Have

- Procedural 시지푸스 캐릭터 (stylized geometric)
- Rapier 물리 시뮬레이션 (데스크톱) / Pre-baked (모바일)
- 5-phase 애니메이션: Push → Summit → Fall → Despair → Retry → Reveal
- OlympusCode 텍스트 + 파티클 reveal
- CTA 버튼 ("Get Started" 등)
- 전체 사운드: BGM + 최소 5개 SFX
- 스크롤 기반 인터랙션
- 3-tier 품질 시스템
- prefers-reduced-motion 지원
- WebGL fallback (static image)
- Mobile-first responsive

### Must NOT Have (Guardrails)

- ❌ 외부 3D 모델 파일 (.glb, .gltf, .fbx) - 모든 것 procedural
- ❌ Auto-playing audio - 반드시 user interaction 후
- ❌ 무한 파티클 시스템 - 항상 bounded pool
- ❌ 모바일에서 real-time physics - pre-baked 사용
- ❌ 개별 에셋 500KB 초과, 초기 로드 3MB 초과
- ❌ Main thread 16ms 이상 블로킹
- ❌ Post-processing 모바일 full 적용 - 감소 또는 비활성화
- ❌ 백엔드/데이터베이스/인증 시스템
- ❌ 다국어 지원 (영어 only)
- ❌ 무한 폴리싱 - 각 phase 최대 2회 iteration

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: NO (새 프로젝트)
- **User wants tests**: YES (E2E + Unit 둘 다)
- **Framework**: Vitest (unit) + Playwright (E2E)

### TDD Enabled

Each implementation task follows RED-GREEN-REFACTOR where applicable.

### Test Setup Task

- [ ] 0. Setup Test Infrastructure
  - Install: `pnpm add -D vitest @testing-library/react playwright @playwright/test`
  - Config: Create `vitest.config.ts`, `playwright.config.ts`
  - Verify: `pnpm test` → shows help or empty pass
  - Example: Create `src/__tests__/example.test.ts`
  - Verify: `pnpm test` → 1 test passes

### Manual Execution Verification

For 3D/visual components where automated testing is impractical:

- Browser automation via Playwright for screenshots
- FPS monitoring via stats.js during development
- Real device testing via BrowserStack or physical devices

---

## Task Flow

```
Phase 0: Project Setup
    ↓
Phase 1: Core 3D Infrastructure
    ├── 1.1 R3F + Scene Setup
    ├── 1.2 Camera System
    └── 1.3 Lighting Setup
    ↓
Phase 2: Procedural Assets (parallel)
    ├── 2.1 Sisyphus Character ──┐
    ├── 2.2 Boulder            ──┼── Can run in parallel
    └── 2.3 Hill Environment   ──┘
    ↓
Phase 3: Animation System
    ├── 3.1 Scroll Controller
    ├── 3.2 Animation State Machine
    └── 3.3 Character Animations
    ↓
Phase 4: Physics Integration
    ├── 4.1 Desktop Physics (Rapier)
    └── 4.2 Mobile Pre-baked Animation
    ↓
Phase 5: Effects & Reveal
    ├── 5.1 GPU Particle System
    ├── 5.2 OlympusCode Text (Troika)
    ├── 5.3 Post-processing Effects
    └── 5.4 CTA Integration
    ↓
Phase 6: Audio System
    ├── 6.1 Audio Manager
    ├── 6.2 BGM Integration
    └── 6.3 SFX Integration
    ↓
Phase 7: Performance & Optimization
    ├── 7.1 3-Tier Quality System
    ├── 7.2 LOD Implementation
    └── 7.3 Mobile Optimization
    ↓
Phase 8: Accessibility & Fallback
    ├── 8.1 prefers-reduced-motion
    └── 8.2 WebGL Fallback
    ↓
Phase 9: Testing
    ├── 9.1 Unit Tests
    └── 9.2 E2E Tests
    ↓
Phase 10: Deployment
    └── 10.1 Vercel Setup
```

## Parallelization

| Group | Tasks         | Reason                        |
| ----- | ------------- | ----------------------------- |
| A     | 2.1, 2.2, 2.3 | Independent procedural assets |
| B     | 5.1, 5.2      | Independent effect systems    |
| C     | 6.2, 6.3      | Independent audio tracks      |
| D     | 9.1, 9.2      | Independent test suites       |

| Task | Depends On | Reason                            |
| ---- | ---------- | --------------------------------- |
| 3.x  | 1.x, 2.x   | Needs scene + assets              |
| 4.x  | 2.x, 3.x   | Needs assets + animation states   |
| 5.x  | 3.x        | Needs animation timeline          |
| 6.x  | 3.x        | Needs animation events            |
| 7.x  | 5.x        | Needs full scene for optimization |
| 8.x  | 7.x        | Needs quality system              |
| 9.x  | 8.x        | Needs complete feature set        |
| 10.x | 9.x        | Needs passing tests               |

---

## TODOs

### Phase 0: Project Setup

- [x] 0.1. Initialize Next.js + R3F Project

  **What to do**:
  - Create Next.js 15 project with App Router
  - Install dependencies: @react-three/fiber, @react-three/drei, @react-three/rapier
  - Configure TypeScript strict mode
  - Setup ESLint + Prettier
  - Create folder structure for modular architecture:
    ```
    src/
    ├── app/           # Next.js App Router
    ├── components/    # React components
    │   ├── canvas/    # R3F canvas components
    │   ├── ui/        # HTML UI components
    │   └── three/     # Three.js specific
    ├── hooks/         # Custom hooks
    ├── lib/           # Utilities
    ├── stores/        # State management (Zustand)
    └── types/         # TypeScript types
    ```

  **Must NOT do**:
  - Pages Router 사용 금지
  - Any external 3D model imports

  **Parallelizable**: NO (first task)

  **References**:
  - Official Next.js docs: App Router setup
  - R3F docs: https://docs.pmnd.rs/react-three-fiber
  - drei docs: https://github.com/pmndrs/drei

  **Acceptance Criteria**:
  - [ ] `pnpm dev` → localhost:3000 접근 가능
  - [ ] `pnpm build` → 빌드 성공
  - [ ] ESLint + TypeScript 에러 없음
  - [ ] R3F Canvas 렌더링 확인 (빈 캔버스라도)

  **Commit**: YES
  - Message: `chore(init): setup Next.js 15 + R3F project structure`
  - Files: `package.json, tsconfig.json, src/app/*, etc.`
  - Pre-commit: `pnpm lint && pnpm build`

---

- [x] 0.2. Setup Test Infrastructure

  **What to do**:
  - Install Vitest + testing-library
  - Install Playwright
  - Configure vitest.config.ts
  - Configure playwright.config.ts
  - Create example tests to verify setup

  **Must NOT do**:
  - Jest 사용 금지 (Vitest 사용)
  - Cypress 사용 금지 (Playwright 사용)

  **Parallelizable**: NO (depends on 0.1)

  **References**:
  - Vitest docs: https://vitest.dev/
  - Playwright docs: https://playwright.dev/

  **Acceptance Criteria**:
  - [ ] `pnpm test` → Vitest 실행, example test pass
  - [ ] `pnpm test:e2e` → Playwright 실행
  - [ ] `vitest.config.ts` 존재
  - [ ] `playwright.config.ts` 존재

  **Commit**: YES
  - Message: `chore(test): setup Vitest + Playwright test infrastructure`
  - Files: `vitest.config.ts, playwright.config.ts, src/__tests__/*`
  - Pre-commit: `pnpm test`

---

### Phase 1: Core 3D Infrastructure

- [x] 1.1. Setup R3F Canvas with Performance Monitoring

  **What to do**:
  - Create main Canvas component with proper settings
  - Configure WebGL renderer options for performance
  - Add stats.js FPS counter (dev only)
  - Implement device capability detection hook
  - Setup Zustand store for global 3D state

  **Must NOT do**:
  - Production에서 stats.js 노출 금지
  - AntiAliasing 무조건 켜기 금지 (성능 기반 결정)

  **Parallelizable**: NO (depends on 0.x)

  **References**:
  - R3F Canvas props: https://docs.pmnd.rs/react-three-fiber/api/canvas
  - stats.js: https://github.com/mrdoob/stats.js/

  **Acceptance Criteria**:
  - [ ] Canvas 렌더링 성공
  - [ ] DEV 환경에서 FPS counter 표시
  - [ ] `useDeviceCapability()` hook 동작
    - Returns: { tier: 'low' | 'medium' | 'high', isMobile: boolean }
  - [ ] Zustand store 초기화 확인

  **Commit**: YES
  - Message: `feat(canvas): setup R3F canvas with performance monitoring`
  - Files: `src/components/canvas/*, src/hooks/useDeviceCapability.ts, src/stores/*`

---

- [x] 1.2. Camera System with Scroll Integration

  **What to do**:
  - Create camera rig component
  - Implement scroll-based camera movement using GSAP ScrollTrigger
  - Define camera path waypoints for each animation phase
  - Add smooth interpolation between positions

  **Must NOT do**:
  - OrbitControls 사용 금지 (fixed camera path)
  - 급격한 카메라 이동 (motion sickness 유발)

  **Parallelizable**: NO (depends on 1.1)

  **References**:
  - GSAP ScrollTrigger: https://greensock.com/scrolltrigger/
  - R3F useScroll: https://github.com/pmndrs/drei#usescroll

  **Acceptance Criteria**:
  - [ ] 스크롤 시 카메라 위치 변경
  - [ ] 5개 waypoint 정의 (Push, Summit, Fall, Despair, Reveal)
  - [ ] Smooth easing 적용
  - [ ] 스크롤 되감기 시 역방향 이동

  **Commit**: YES
  - Message: `feat(camera): implement scroll-based camera system`
  - Files: `src/components/canvas/CameraRig.tsx, src/hooks/useScrollProgress.ts`

---

- [x] 1.3. Scene Lighting Setup

  **What to do**:
  - Implement dramatic 3-point lighting
  - Create time-of-day system (dawn → dusk progression with scroll)
  - Add ambient occlusion (SSAO) for depth
  - Configure shadow settings with quality tiers

  **Must NOT do**:
  - 모바일에서 real-time shadows 금지 → baked 또는 disabled
  - 6개 이상 동적 광원 금지

  **Parallelizable**: YES (with 1.2 partially)

  **References**:
  - drei lighting helpers: https://github.com/pmndrs/drei#staging
  - Three.js lights: https://threejs.org/docs/#api/en/lights/

  **Acceptance Criteria**:
  - [ ] Key, fill, rim light 배치
  - [ ] 스크롤에 따른 lighting 색온도 변화
  - [ ] Desktop에서 그림자 렌더링
  - [ ] Mobile에서 그림자 비활성화

  **Commit**: YES
  - Message: `feat(lighting): implement dramatic 3-point lighting with quality tiers`
  - Files: `src/components/canvas/Lighting.tsx`

---

### Phase 2: Procedural Assets

- [ ] 2.1. Procedural Sisyphus Character

  **What to do**:
  - Create stylized geometric humanoid using THREE primitives
  - Implement skeletal structure with IK for pushing animation
  - Design character with distinct silhouette (recognizable from distance)
  - Apply custom shader for stylized look
  - Build animation-ready rig:
    - Spine bend for pushing posture
    - Arm/leg IK for ground contact
    - Head tracking

  **Must NOT do**:
  - Realistic human 시도 금지 (stylized geometric only)
  - 20개 이상 bone 금지 (performance)
  - 외부 모델 import 금지

  **Parallelizable**: YES (with 2.2, 2.3)

  **References**:
  - THREE.js BufferGeometry: https://threejs.org/docs/#api/en/core/BufferGeometry
  - drei Skeleton helpers
  - Inspiration: Monument Valley character style

  **Acceptance Criteria**:
  - [ ] 캐릭터 렌더링 성공
  - [ ] Pushing pose 표현 가능
  - [ ] Standing pose 표현 가능
  - [ ] Despair pose 표현 가능
  - [ ] LOD 3단계 (High: full geometry, Medium: simplified, Low: billboard)
  - [ ] 10,000 vertices 이하

  **Commit**: YES
  - Message: `feat(character): create procedural Sisyphus with IK rig`
  - Files: `src/components/three/Sisyphus/*`

---

- [ ] 2.2. Procedural Boulder

  **What to do**:
  - Create irregular boulder using noise-displaced sphere
  - Apply rocky texture via procedural shader
  - Add subtle rotation on roll
  - Implement collision shape for physics

  **Must NOT do**:
  - 완벽한 구체 금지 (rocks are irregular)
  - 10,000 vertices 초과 금지

  **Parallelizable**: YES (with 2.1, 2.3)

  **References**:
  - Noise displacement: https://threejs.org/examples/#webgl_modifier_simplifier
  - Procedural textures in GLSL

  **Acceptance Criteria**:
  - [ ] 불규칙한 바위 형태
  - [ ] 굴러갈 때 자연스러운 회전
  - [ ] Rapier collider 생성
  - [ ] LOD 2단계

  **Commit**: YES
  - Message: `feat(boulder): create procedural boulder with physics collider`
  - Files: `src/components/three/Boulder/*`

---

- [ ] 2.3. Procedural Hill Environment

  **What to do**:
  - Create hill terrain using heightmap or procedural noise
  - Design path for boulder to roll up/down
  - Add environmental details (rocks, dead trees - minimal for performance)
  - Create sky/background (gradient or simple skybox)
  - Ground collision mesh for physics

  **Must NOT do**:
  - 복잡한 vegetation 금지
  - 100,000 vertices 초과 terrain 금지

  **Parallelizable**: YES (with 2.1, 2.2)

  **References**:
  - Procedural terrain: Three.js PlaneGeometry with vertex displacement
  - Simple skybox: drei Sky component

  **Acceptance Criteria**:
  - [ ] 경사진 언덕 terrain
  - [ ] Boulder가 굴러가는 path 명확
  - [ ] 배경 (sky gradient 또는 skybox)
  - [ ] Ground collider for physics
  - [ ] LOD 2단계

  **Commit**: YES
  - Message: `feat(environment): create procedural hill terrain with sky`
  - Files: `src/components/three/Environment/*`

---

### Phase 3: Animation System

- [ ] 3.1. Scroll-Animation Controller

  **What to do**:
  - Create central animation controller using GSAP ScrollTrigger
  - Define 5 animation phases with scroll ranges:
    - 0-20%: Push (climbing)
    - 20-40%: Summit (reaching top)
    - 40-60%: Fall (boulder rolls back)
    - 60-80%: Despair (Sisyphus reacts)
    - 80-100%: Reveal (OlympusCode appears)
  - Implement progress normalization per phase
  - Add scroll direction detection

  **Must NOT do**:
  - 스크롤 hijacking 금지 (natural scroll feel)
  - Phase 경계에서 jerky transition 금지

  **Parallelizable**: NO (depends on 2.x)

  **References**:
  - GSAP ScrollTrigger: https://greensock.com/docs/v3/Plugins/ScrollTrigger
  - R3F useScroll from drei

  **Acceptance Criteria**:
  - [ ] 스크롤 0-100% 정규화
  - [ ] 각 phase progress 계산 정확
  - [ ] Forward/backward 스크롤 모두 부드러움
  - [ ] `useAnimationPhase()` hook 동작

  **Commit**: YES
  - Message: `feat(animation): implement scroll-based animation controller`
  - Files: `src/hooks/useAnimationPhase.ts, src/lib/animationConfig.ts`

---

- [ ] 3.2. Animation State Machine

  **What to do**:
  - Implement state machine for animation phases
  - Define transitions between states
  - Handle edge cases (rapid scroll, scroll bounce)
  - Emit events for audio/effects triggers

  **Must NOT do**:
  - 복잡한 XState 도입 금지 (simple custom implementation)
  - State transition 중 visual glitch 금지

  **Parallelizable**: NO (depends on 3.1)

  **References**:
  - Simple state machine pattern
  - Zustand for state management

  **Acceptance Criteria**:
  - [ ] State: idle, pushing, summit, falling, despair, reveal
  - [ ] Transition events emitted
  - [ ] `onPhaseChange` callback 동작
  - [ ] Rapid scroll handling (debounce/throttle)

  **Commit**: YES
  - Message: `feat(animation): implement animation state machine`
  - Files: `src/lib/animationStateMachine.ts, src/stores/animationStore.ts`

---

- [ ] 3.3. Character Animation Keyframes

  **What to do**:
  - Create keyframe animations for Sisyphus:
    - Push cycle (looping while climbing)
    - Summit reach (arms up briefly)
    - Watch fall (turning, reaching out)
    - Despair (knees, head down)
    - Rise again (standing up, determined)
  - Blend between animations based on state

  **Must NOT do**:
  - Frame-by-frame animation 금지 (keyframe interpolation)
  - 급격한 pose 전환 금지 (smooth blending)

  **Parallelizable**: NO (depends on 2.1, 3.2)

  **References**:
  - Three.js AnimationMixer
  - Procedural animation blending

  **Acceptance Criteria**:
  - [ ] 5개 animation state 모두 구현
  - [ ] Smooth blending between states
  - [ ] Push cycle이 스크롤과 동기화
  - [ ] Despair animation이 감정적으로 효과적

  **Commit**: YES
  - Message: `feat(character): implement Sisyphus keyframe animations`
  - Files: `src/components/three/Sisyphus/animations/*`

---

### Phase 4: Physics Integration

- [ ] 4.1. Desktop Physics with Rapier

  **What to do**:
  - Setup Rapier physics world
  - Implement boulder rolling physics:
    - Gravity
    - Friction with terrain
    - Sisyphus push force
  - Create invisible "release" trigger at summit
  - Simulate natural boulder descent

  **Must NOT do**:
  - 모바일에서 real-time physics 활성화 금지
  - Physics step > 16ms 금지

  **Parallelizable**: NO (depends on 2.x, 3.x)

  **References**:
  - @react-three/rapier: https://github.com/pmndrs/react-three-rapier
  - Rapier docs: https://rapier.rs/docs/

  **Acceptance Criteria**:
  - [ ] Boulder가 Sisyphus push에 반응
  - [ ] Summit에서 자연스럽게 굴러 떨어짐
  - [ ] Terrain과 collision 정확
  - [ ] 60fps 이상 유지 (physics active)

  **Commit**: YES
  - Message: `feat(physics): implement Rapier physics for desktop`
  - Files: `src/components/canvas/PhysicsWorld.tsx`

---

- [ ] 4.2. Mobile Pre-baked Animation

  **What to do**:
  - Create pre-calculated boulder path (bezier curve)
  - Implement scroll-synced position interpolation
  - Match visual appearance to physics version
  - Auto-detect mobile and switch to pre-baked

  **Must NOT do**:
  - Mobile에서 Rapier 초기화 금지
  - Desktop과 눈에 띄게 다른 움직임 금지

  **Parallelizable**: NO (depends on 4.1 for reference)

  **References**:
  - Three.js CatmullRomCurve3
  - Pre-baked animation patterns

  **Acceptance Criteria**:
  - [ ] Mobile에서 physics 비활성화 확인
  - [ ] Boulder 경로가 자연스러움
  - [ ] Desktop과 시각적으로 유사
  - [ ] 60fps 유지 (mobile)

  **Commit**: YES
  - Message: `feat(physics): implement pre-baked animation for mobile`
  - Files: `src/components/three/Boulder/PrebakedPath.tsx`

---

### Phase 5: Effects & Reveal

- [ ] 5.1. GPU Particle System

  **What to do**:
  - Implement instanced particle system for reveal effect
  - Create particle types:
    - Golden sparkles (descending from sky)
    - Dust particles (boulder movement)
    - Energy burst (reveal moment)
  - Object pooling for particle reuse
  - Quality-tier based particle count

  **Must NOT do**:
  - CPU-based particle updates 금지 (GPU instancing only)
  - 무한 particle emission 금지 (bounded pool)
  - 모바일에서 10,000+ particles 금지

  **Parallelizable**: YES (with 5.2)

  **References**:
  - drei Sparkles: https://github.com/pmndrs/drei#sparkles
  - GPU instancing: THREE.InstancedMesh

  **Acceptance Criteria**:
  - [ ] Golden particles 하늘에서 내려옴
  - [ ] Dust particles on boulder movement
  - [ ] Reveal burst effect
  - [ ] Desktop: 50,000 particles, 120fps 유지
  - [ ] Mobile: 5,000 particles, 60fps 유지
  - [ ] Object pool 재사용 확인

  **Commit**: YES
  - Message: `feat(effects): implement GPU instanced particle system`
  - Files: `src/components/three/Effects/Particles/*`

---

- [ ] 5.2. OlympusCode Text with Troika

  **What to do**:
  - Implement 3D text using troika-three-text
  - Create reveal animation (descend from sky)
  - Add glow/bloom effect to text
  - Implement tagline text below main logo

  **Must NOT do**:
  - THREE.TextGeometry 사용 금지 (troika only)
  - 너무 복잡한 font 금지 (readability)

  **Parallelizable**: YES (with 5.1)

  **References**:
  - troika-three-text: https://github.com/protectwise/troika/tree/main/packages/troika-three-text
  - R3F Text component from drei

  **Acceptance Criteria**:
  - [ ] "OlympusCode" 텍스트 3D 렌더링
  - [ ] 하늘에서 내려오는 애니메이션
  - [ ] Glow effect 적용
  - [ ] Tagline: "Code like a god" 또는 유사
  - [ ] 모든 zoom level에서 crisp

  **Commit**: YES
  - Message: `feat(text): implement OlympusCode reveal with troika`
  - Files: `src/components/three/Effects/RevealText.tsx`

---

- [ ] 5.3. Post-processing Effects

  **What to do**:
  - Setup postprocessing pipeline:
    - Bloom (for glow effects)
    - God rays (from reveal)
    - Vignette (cinematic)
    - Color grading
  - Quality-tier based effect levels
  - Disable on low-end devices

  **Must NOT do**:
  - 모바일에서 full postprocessing 금지
  - 5개 이상 effect pass 금지 (desktop)
  - 2개 이상 effect pass 금지 (mobile)

  **Parallelizable**: NO (depends on 5.1, 5.2)

  **References**:
  - @react-three/postprocessing: https://github.com/pmndrs/react-postprocessing
  - postprocessing library

  **Acceptance Criteria**:
  - [ ] Bloom on particles and text
  - [ ] God rays from sky during reveal
  - [ ] Vignette 적용
  - [ ] Desktop: full effects, 120fps
  - [ ] Mobile: bloom only or disabled, 60fps
  - [ ] Quality tier 자동 선택

  **Commit**: YES
  - Message: `feat(effects): implement quality-tiered postprocessing`
  - Files: `src/components/canvas/PostProcessing.tsx`

---

- [ ] 5.4. CTA Button Integration

  **What to do**:
  - Create HTML overlay CTA button
  - Animate appearance with reveal
  - Style consistent with 3D aesthetic
  - Add hover/click effects
  - Link to OlympusCode landing page (placeholder)

  **Must NOT do**:
  - 3D 내부 버튼 구현 금지 (HTML overlay for accessibility)
  - Reveal 전 버튼 노출 금지

  **Parallelizable**: NO (depends on 5.2, 5.3)

  **References**:
  - drei Html component for overlay
  - Framer Motion for animations

  **Acceptance Criteria**:
  - [ ] "Get Started" 버튼 표시
  - [ ] Reveal phase에서만 등장
  - [ ] Hover effect 동작
  - [ ] Click → placeholder URL로 이동
  - [ ] Mobile에서 터치 가능

  **Commit**: YES
  - Message: `feat(cta): implement animated CTA button`
  - Files: `src/components/ui/CTAButton.tsx`

---

### Phase 6: Audio System

- [ ] 6.1. Audio Manager Setup

  **What to do**:
  - Implement audio manager with Howler.js
  - Create user interaction gate (audio only after click)
  - Implement volume controls
  - Handle tab visibility (pause when hidden)
  - Mute/unmute functionality

  **Must NOT do**:
  - Auto-play audio 금지 (browser blocks it anyway)
  - Tab hidden 상태에서 audio 재생 금지

  **Parallelizable**: NO (depends on 3.x)

  **References**:
  - Howler.js: https://howlerjs.com/
  - Web Audio API visibility handling

  **Acceptance Criteria**:
  - [ ] Audio plays only after user interaction
  - [ ] Tab switch → audio pauses
  - [ ] Mute button 동작
  - [ ] Volume slider 동작 (optional)

  **Commit**: YES
  - Message: `feat(audio): implement audio manager with user interaction gate`
  - Files: `src/lib/audioManager.ts, src/components/ui/AudioControls.tsx`

---

- [ ] 6.2. BGM Integration

  **What to do**:
  - Source/create epic background music (~2-3 minutes, loopable)
  - Implement dynamic intensity based on animation phase:
    - Soft during push
    - Building at summit
    - Dramatic during fall
    - Melancholic at despair
    - Triumphant at reveal
  - Smooth crossfade between sections

  **Must NOT do**:
  - 저작권 침해 음악 금지 (royalty-free 또는 original)
  - 5MB 초과 audio file 금지

  **Parallelizable**: YES (with 6.3)

  **References**:
  - Royalty-free sources: Pixabay, Freesound, Artlist
  - Howler.js fade/seek

  **Acceptance Criteria**:
  - [ ] BGM 재생
  - [ ] Phase별 intensity 변화
  - [ ] Smooth fade transitions
  - [ ] Loop 가능
  - [ ] File size < 2MB (compressed)

  **Commit**: YES
  - Message: `feat(audio): integrate dynamic BGM with phase-based intensity`
  - Files: `public/audio/bgm.mp3, src/hooks/useBGM.ts`

---

- [ ] 6.3. SFX Integration

  **What to do**:
  - Source/create sound effects:
    - Boulder rolling (continuous, pitch varies with speed)
    - Footsteps (Sisyphus walking)
    - Boulder impact (hitting ground)
    - Despair sigh/groan
    - Reveal whoosh/sparkle
  - Sync SFX with animation events

  **Must NOT do**:
  - 동시 10개 이상 SFX 재생 금지
  - 개별 SFX 500KB 초과 금지

  **Parallelizable**: YES (with 6.2)

  **References**:
  - Freesound.org for source audio
  - Howler.js sprite sheets

  **Acceptance Criteria**:
  - [ ] 최소 5개 SFX 구현
  - [ ] Animation event와 동기화
  - [ ] 볼륨 밸런스 적절
  - [ ] Total SFX size < 1MB

  **Commit**: YES
  - Message: `feat(audio): integrate synchronized SFX`
  - Files: `public/audio/sfx/*, src/hooks/useSFX.ts`

---

### Phase 7: Performance & Optimization

- [ ] 7.1. 3-Tier Quality System

  **What to do**:
  - Implement automatic device detection and tier assignment:
    - Low: Mobile, <4GB RAM, integrated GPU
    - Medium: Laptop, 8GB RAM, mid-range GPU
    - High: Desktop, 16GB+ RAM, dedicated GPU
  - Create quality presets for each tier
  - Allow manual override

  **Must NOT do**:
  - User agent sniffing only 금지 (use actual capability detection)
  - 강제 tier lock 금지 (allow user choice)

  **Parallelizable**: NO (depends on 5.x)

  **References**:
  - WebGL capabilities detection
  - navigator.deviceMemory, navigator.hardwareConcurrency

  **Acceptance Criteria**:
  - [ ] Auto tier detection 동작
  - [ ] Low/Medium/High presets 적용
  - [ ] Manual override UI
  - [ ] Preset 변경 시 즉시 적용

  **Commit**: YES
  - Message: `feat(performance): implement 3-tier quality system`
  - Files: `src/lib/qualityTiers.ts, src/stores/settingsStore.ts`

---

- [ ] 7.2. LOD Implementation

  **What to do**:
  - Implement Level of Detail for all major assets:
    - Sisyphus: 3 LOD levels
    - Boulder: 2 LOD levels
    - Environment: 2 LOD levels
  - Distance-based LOD switching
  - Quality-tier based LOD thresholds

  **Must NOT do**:
  - LOD 전환 시 popping 금지 (smooth transition)
  - Mobile에서 highest LOD 사용 금지

  **Parallelizable**: NO (depends on 7.1)

  **References**:
  - THREE.LOD
  - drei Detailed component

  **Acceptance Criteria**:
  - [ ] LOD 전환 smooth
  - [ ] Distance threshold 적절
  - [ ] Mobile에서 lower LOD 기본
  - [ ] Draw call 감소 확인

  **Commit**: YES
  - Message: `feat(performance): implement LOD for all assets`
  - Files: `src/components/three/*/LOD.tsx`

---

- [ ] 7.3. Mobile Optimization Pass

  **What to do**:
  - Profile on real mobile device (iPhone 12 or equivalent)
  - Implement specific mobile optimizations:
    - Reduce texture resolution
    - Disable shadows
    - Limit particle count
    - Simplify shaders
    - Reduce post-processing
  - Add thermal throttling detection and response

  **Must NOT do**:
  - Chrome DevTools throttling만으로 테스트 금지 (real device 필수)
  - 60fps 미만 허용 금지

  **Parallelizable**: NO (depends on 7.2)

  **References**:
  - Mobile GPU profiling
  - Thermal state API (if available)

  **Acceptance Criteria**:
  - [ ] iPhone 12 (또는 동급)에서 60fps 유지
  - [ ] Android mid-range에서 60fps 유지
  - [ ] No visual glitches on mobile
  - [ ] Touch interactions smooth

  **Commit**: YES
  - Message: `perf(mobile): comprehensive mobile optimization pass`
  - Files: Various optimization changes

---

### Phase 8: Accessibility & Fallback

- [ ] 8.1. prefers-reduced-motion Support

  **What to do**:
  - Detect prefers-reduced-motion preference
  - Implement reduced motion mode:
    - Static poses instead of animations
    - Fade transitions instead of movement
    - Disable particles
    - Static reveal instead of descent
  - Respect user preference by default

  **Must NOT do**:
  - Preference 무시 금지
  - Reduced motion에서도 seizure-inducing patterns 금지

  **Parallelizable**: NO (depends on 7.x)

  **References**:
  - MDN prefers-reduced-motion
  - WCAG motion guidelines

  **Acceptance Criteria**:
  - [ ] `prefers-reduced-motion: reduce` 감지
  - [ ] Reduced mode에서 모든 animation 정적
  - [ ] 핵심 스토리는 여전히 전달됨
  - [ ] Toggle 가능

  **Commit**: YES
  - Message: `a11y: implement prefers-reduced-motion support`
  - Files: `src/hooks/useReducedMotion.ts, motion adjustments`

---

- [ ] 8.2. WebGL Fallback

  **What to do**:
  - Detect WebGL support/failure
  - Create static fallback experience:
    - Hero image showing key scene
    - CSS animation for minimal motion
    - Full content accessible
  - Graceful error handling

  **Must NOT do**:
  - 빈 화면 표시 금지
  - Fallback에서 CTA 누락 금지

  **Parallelizable**: NO (depends on 8.1)

  **References**:
  - WebGL detection
  - Progressive enhancement patterns

  **Acceptance Criteria**:
  - [ ] WebGL 비활성화 시 fallback 표시
  - [ ] Fallback에서 CTA 동작
  - [ ] 시각적으로 acceptable
  - [ ] SEO content 유지

  **Commit**: YES
  - Message: `a11y: implement WebGL fallback experience`
  - Files: `src/components/ui/Fallback.tsx`

---

### Phase 9: Testing

- [ ] 9.1. Unit Tests

  **What to do**:
  - Write unit tests for:
    - Animation utilities (phase calculation, interpolation)
    - Quality tier detection
    - Audio manager logic
    - State machine transitions
  - Target 80% coverage for utility functions

  **Must NOT do**:
  - 3D rendering unit test 시도 금지 (E2E로 커버)
  - Snapshot test 남용 금지

  **Parallelizable**: YES (with 9.2)

  **References**:
  - Vitest docs
  - Testing-library patterns

  **Acceptance Criteria**:
  - [ ] `pnpm test` → all pass
  - [ ] Coverage > 80% for src/lib/\*
  - [ ] Coverage > 80% for src/hooks/\*
  - [ ] No flaky tests

  **Commit**: YES
  - Message: `test: add comprehensive unit test suite`
  - Files: `src/__tests__/*`

---

- [ ] 9.2. E2E Tests

  **What to do**:
  - Write E2E tests for:
    - Page load and initial render
    - Scroll interaction triggers animation
    - Audio plays after interaction
    - CTA button clickable at reveal
    - Mobile viewport behavior
  - Visual regression for key frames

  **Must NOT do**:
  - Flaky timing-based assertions 금지
  - Hard-coded waits 금지 (use proper waits)

  **Parallelizable**: YES (with 9.1)

  **References**:
  - Playwright docs
  - Visual regression testing

  **Acceptance Criteria**:
  - [ ] `pnpm test:e2e` → all pass
  - [ ] Desktop + Mobile viewports tested
  - [ ] Visual regression baseline established
  - [ ] CI-friendly (headless)

  **Commit**: YES
  - Message: `test: add Playwright E2E test suite`
  - Files: `e2e/*`

---

### Phase 10: Deployment

- [ ] 10.1. Vercel Deployment Setup

  **What to do**:
  - Configure vercel.json for optimal 3D asset serving
  - Setup environment variables (if any)
  - Configure caching headers for static assets
  - Add preview deployment for PRs
  - Verify production build

  **Must NOT do**:
  - API routes 추가 금지 (static only)
  - 민감한 정보 하드코딩 금지

  **Parallelizable**: NO (final task)

  **References**:
  - Vercel docs for Next.js
  - Static asset optimization

  **Acceptance Criteria**:
  - [ ] `vercel deploy` 성공
  - [ ] Production URL 접근 가능
  - [ ] 3D assets properly cached
  - [ ] Lighthouse score targets met
  - [ ] No console errors

  **Commit**: YES
  - Message: `deploy: configure Vercel deployment`
  - Files: `vercel.json, .vercelignore`

---

## Commit Strategy

| After Task | Message                                       | Files                    | Verification       |
| ---------- | --------------------------------------------- | ------------------------ | ------------------ |
| 0.1        | `chore(init): setup Next.js 15 + R3F project` | package.json, src/\*     | `pnpm build`       |
| 0.2        | `chore(test): setup Vitest + Playwright`      | vitest.config.ts, etc.   | `pnpm test`        |
| 1.1        | `feat(canvas): setup R3F canvas`              | src/components/canvas/\* | `pnpm dev`         |
| 1.2        | `feat(camera): scroll-based camera`           | CameraRig.tsx            | `pnpm dev`         |
| 1.3        | `feat(lighting): 3-point lighting`            | Lighting.tsx             | `pnpm dev`         |
| 2.1        | `feat(character): procedural Sisyphus`        | Sisyphus/\*              | `pnpm dev`         |
| 2.2        | `feat(boulder): procedural boulder`           | Boulder/\*               | `pnpm dev`         |
| 2.3        | `feat(environment): procedural terrain`       | Environment/\*           | `pnpm dev`         |
| 3.1        | `feat(animation): scroll controller`          | useAnimationPhase.ts     | `pnpm test`        |
| 3.2        | `feat(animation): state machine`              | animationStateMachine.ts | `pnpm test`        |
| 3.3        | `feat(character): keyframe animations`        | animations/\*            | `pnpm dev`         |
| 4.1        | `feat(physics): Rapier desktop`               | PhysicsWorld.tsx         | `pnpm dev`         |
| 4.2        | `feat(physics): pre-baked mobile`             | PrebakedPath.tsx         | `pnpm dev`         |
| 5.1        | `feat(effects): GPU particles`                | Particles/\*             | `pnpm dev`         |
| 5.2        | `feat(text): OlympusCode reveal`              | RevealText.tsx           | `pnpm dev`         |
| 5.3        | `feat(effects): postprocessing`               | PostProcessing.tsx       | `pnpm dev`         |
| 5.4        | `feat(cta): animated button`                  | CTAButton.tsx            | `pnpm dev`         |
| 6.1        | `feat(audio): audio manager`                  | audioManager.ts          | `pnpm dev`         |
| 6.2        | `feat(audio): BGM`                            | useBGM.ts                | `pnpm dev`         |
| 6.3        | `feat(audio): SFX`                            | useSFX.ts                | `pnpm dev`         |
| 7.1        | `feat(performance): quality tiers`            | qualityTiers.ts          | `pnpm test`        |
| 7.2        | `feat(performance): LOD`                      | \*/LOD.tsx               | `pnpm dev`         |
| 7.3        | `perf(mobile): optimization pass`             | Various                  | Real device test   |
| 8.1        | `a11y: reduced-motion`                        | useReducedMotion.ts      | Browser test       |
| 8.2        | `a11y: WebGL fallback`                        | Fallback.tsx             | Disable WebGL test |
| 9.1        | `test: unit tests`                            | **tests**/\*             | `pnpm test`        |
| 9.2        | `test: E2E tests`                             | e2e/\*                   | `pnpm test:e2e`    |
| 10.1       | `deploy: Vercel config`                       | vercel.json              | `vercel deploy`    |

---

## Success Criteria

### Verification Commands

```bash
# Build verification
pnpm build  # Expected: success, no errors

# Unit tests
pnpm test  # Expected: all pass, coverage > 80%

# E2E tests
pnpm test:e2e  # Expected: all pass

# Lighthouse (desktop)
lighthouse http://localhost:3000 --preset=desktop
# Expected: Performance > 90

# Lighthouse (mobile)
lighthouse http://localhost:3000 --preset=mobile
# Expected: Performance > 70
```

### Final Checklist

- [ ] All "Must Have" features implemented
- [ ] All "Must NOT Have" guardrails respected
- [ ] Desktop: 120fps sustained
- [ ] Mobile (iPhone 12): 60fps sustained
- [ ] Lighthouse Desktop Performance ≥ 90
- [ ] Lighthouse Mobile Performance ≥ 70
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] prefers-reduced-motion works
- [ ] WebGL fallback works
- [ ] Audio plays after interaction only
- [ ] CTA button functional
- [ ] Vercel deployment successful
