# Draft: OlympusCode Promotional Animation Website

## Requirements (confirmed)

### Core Concept

- **Theme**: 시지푸스 신화 기반 3D 애니메이션
- **Story Flow**:
  1. 시지푸스가 돌(boulder)을 언덕 위로 밀어올림
  2. 정상 도달 시 돌이 다시 굴러 떨어짐
  3. 시지푸스가 크게 좌절 (dramatic despair animation)
  4. 다시 돌을 밀기 시작
  5. 하늘에서 "OlympusCode" 텍스트가 내려옴 (promotional reveal)
- **Product**: OlympusCode = AI 코드 에이전트/툴 (Claude Code, Cursor 같은 AI 코딩 툴)

### Visual Style

- **3D 기반**: Full 3D scene with depth, lighting, shadows
- **Complexity**: 높은 난이도 요구 - "네 배는 더 어렵게"
- **Aesthetic**: 최대 미학 추구

### Technical Decisions

- **Framework**: Next.js + React Three Fiber (R3F)
  - SSR/SEO 최대화
  - 성능 + 복잡도 + 미학 모두 최대
- **Physics**: Rapier (modern, performant)
- **Text**: Troika-three-text (SDF-based, high quality)
- **Animation**: GSAP + R3F hooks
- **Deployment**: Vercel (정적 호스팅)

### Testing Strategy

- **E2E Tests**: Playwright (visual regression, animation flow)
- **Unit Tests**: Vitest (utilities, animation logic)
- **Architecture**: "강박적으로 모듈화" - extremely modular design

### Interaction

- 최고의 성능 + 최고의 UX
- TBD: 스크롤 기반 vs 자동 재생 vs 하이브리드

## Research Findings

### From Librarian (Three.js Best Practices 2026)

- **Character Animation**: GLTF skinned meshes recommended
- **Physics**: Rapier is 2-10x faster than cannon.js
- **Text**: troika-three-text (SDF-based) is industry standard
- **Setup**: Vite + R3F + TypeScript recommended
- **Performance**:
  - Use instancing for repeated objects
  - LOD for distant objects
  - On-demand rendering
  - Keep draw calls < 100/frame
  - Draco/Meshopt for model compression
  - KTX2 for textures

### Recommended Stack

```
Next.js 14/15 + React Three Fiber + TypeScript
├── @react-three/fiber (core)
├── @react-three/drei (helpers)
├── @react-three/rapier (physics)
├── troika-three-text (3D text)
├── gsap (scroll-driven animations)
├── framer-motion (UI animations)
├── Playwright (E2E tests)
└── Vitest (unit tests)
```

## Confirmed Decisions (Round 2)

### Character

- **Source**: Procedural 생성 (코드로 기하학적/스타일라이즈드 캐릭터)
- **Approach**: THREE.js geometry + custom shaders

### OlympusCode Reveal

- **Style**: "미친듯이 이펙트 팍 터지면서도 120fps 유지"
- **Technical Approach**:
  - GPU 파티클 시스템 (instanced rendering)
  - Shader-based effects (bloom, god rays)
  - Object pooling for particles
  - LOD for effects based on device capability

### Audio

- **Scope**: 전체 사운드 디자인
  - BGM (epic/dramatic)
  - 효과음: 돌 굴러가는 소리, 좌절, reveal 사운드
  - Web Audio API + Howler.js

### Animation Trigger

- **Method**: 스크롤 기반
- **Tech**: GSAP ScrollTrigger + R3F useScroll

## Confirmed Decisions (Round 3)

### CTA

- **Include**: CTA 버튼 포함 ("Try Now", "Get Started" 등)
- **Placement**: OlympusCode reveal 후 등장

### Mobile/Low-end

- **Strategy**: 동일한 경험 유지 + 극한 최적화
- **Technical Approach**:
  - Device capability detection
  - Dynamic LOD (Level of Detail)
  - Particle count scaling
  - Shadow quality adjustment
  - Texture resolution scaling

## Open Questions (Minor)

1. **OlympusCode 로고**: 텍스트만? 별도 로고 이미지도 포함?

## Scope Boundaries

### INCLUDE

- Full 3D 시지푸스 애니메이션 (밀기, 떨어짐, 좌절, 반복)
- OlympusCode 브랜딩 reveal
- SSR/SEO 최적화
- E2E + Unit 테스트
- Vercel 배포 설정

### EXCLUDE (TBD - 확인 필요)

- 사운드/오디오?
- 다국어 지원?
- 백엔드/데이터베이스?
- 사용자 인증?
