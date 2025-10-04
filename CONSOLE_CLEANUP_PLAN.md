# Console Log Cleanup Plan

## Goal
Remove all unnecessary console.log statements and keep only errors and warnings.

## Strategy
1. Keep only console.error() and console.warn()
2. Remove all informational console.log() statements
3. Remove all success/debug console.log() statements
4. Keep critical initialization logs (can be commented out for production)

## Priority Files (From Console Output)

### High Priority (Lots of Output)
1. **Api.ts** - Auth headers, request interceptors, response interceptors
2. **LiveSearchBox.tsx** - Render checks, dropdown state
3. **SubscriptionMonitor.tsx** - Subscription checks
4. **ApiService.ts** - Manifest loading, subscription validation
5. **ManifestService.ts** - Banner loading, categories
6. **HomePage.tsx** - Manifest loading
7. **ContentSections.tsx** - Rendering info
8. **authSlice.ts** - Auth restoration
9. **App.tsx** - App initialization
10. **manifest.service.ts** - Request throttling

### Medium Priority
- useManifest.ts
- ModernMainNav.tsx  
- ProtectedRoute.tsx
- AppAuthWrapper.tsx
- PerformanceService.ts
- NetflixHeroSection.tsx

### Approach
- Convert informational logs to comments
- Keep error/warning logs
- Add development-only flag where needed
