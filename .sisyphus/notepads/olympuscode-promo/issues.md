## [2026-01-21 01:08] Mobile Performance Below Target

### Issue
Lighthouse mobile performance score: 64/100 (target: ≥70)

### Metrics
- LCP: 8.8s (target: <2.5s)
- TTI: 8.8s  
- TBT: 450ms (target: <200ms)

### Impact
- Mobile users experience slow initial load
- May affect bounce rate on mobile devices

### Potential Solutions
1. **Immediate**:
   - Add loading screen with progress indicator
   - Lazy load Rapier physics bundle
   - Code split Three.js dependencies

2. **Future Optimization**:
   - Implement service worker for asset caching
   - Reduce shader complexity for mobile
   - Use lower-poly models on mobile detection
   - Progressive enhancement: show 2D fallback first, upgrade to 3D

### Status
- DOCUMENTED - Not blocking deployment
- Desktop performance exceeds target (94/100)
- Core functionality works on mobile, just slow initial load

## [2026-01-21 01:10] Vercel CLI Deployment Error

### Issue
Vercel CLI deployment fails with "Invalid file size" error during file upload phase.

### Error Details
```
Error: Invalid file size
POST https://api.vercel.com/v2/files
```

### Attempted Fixes
1. ✅ Removed .gitkeep files (zero-byte files)
2. ✅ Added .gitkeep to .vercelignore
3. ✅ Removed .vercel directory and re-linked
4. ❌ All attempts failed with same error

### Root Cause (Suspected)
- Vercel CLI bug with file upload API
- Possibly related to audio files or file hashing
- Not related to file size limits (total: 1.4MB well under limit)

### Workarounds

#### Option 1: GitHub Integration (RECOMMENDED)
1. Push code to GitHub
2. Connect repository to Vercel dashboard
3. Enable automatic deployments
4. Vercel builds from GitHub (more reliable than CLI)

#### Option 2: Manual Dashboard Upload
1. Go to vercel.com/new
2. Import project from Git
3. Configure build settings
4. Deploy

#### Option 3: Try Different Vercel CLI Version
```bash
npm install -g vercel@latest
vercel deploy
```

### Impact
- CLI deployment blocked
- Alternative deployment methods available
- No blocker for production deployment
- Build verification already passed

### Status
- BLOCKED (CLI method)
- WORKAROUND AVAILABLE (GitHub integration)

