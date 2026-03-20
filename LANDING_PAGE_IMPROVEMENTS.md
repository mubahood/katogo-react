# Landing Page & Random Movie Improvements

## Summary of Changes

This document tracks all improvements made to the landing page and random-movie API endpoint to serve better content with improved performance.

---

## 🔧 Backend Improvements

### 1. Smart Random Movie Selection (`/api/random-movie`)
**File**: [/Applications/MAMP/htdocs/katogo/app/Http/Controllers/DynamicCrudController.php](file:///Applications/MAMP/htdocs/katogo/app/Http/Controllers/DynamicCrudController.php#L1210)

**Changes**:
- ✅ **Phase 1**: Prioritizes recently viewed movies (>10% progress) from last 30 days
- ✅ **Phase 2**: Includes recently downloaded movies (in-app downloads) from last 30 days
- ✅ **Phase 3**: Shuffles and randomly picks from qualified pool
- ✅ **Phase 4**: Falls back to any active movie if phases 1-3 don't yield results
- ✅ **Series Exclusion**: Only returns `type = 'Movie'`, never series
- ✅ **Playability Check**: Only returns movies with valid video URLs
- ✅ **Public Endpoint**: No authentication required

**Business Logic**:
```
Pool = [
  Recently viewed (>10% watched in 30d) +
  Recently downloaded (in-app in 30d)
] → Shuffle → Random pick → Fallback to any active movie
```

### 2. Added MovieDownload Relationship
**File**: [/Applications/MAMP/htdocs/katogo/app/Models/MovieDownload.php](file:///Applications/MAMP/htdocs/katogo/app/Models/MovieDownload.php#L18)

**Change**: Added `movie()` relationship to support the new query logic in random-movie endpoint.

---

## 🎨 Frontend Improvements

### 1. Fixed Pre-Login API Calls
**File**: [/Users/mac/Desktop/github/katogo-react/src/app/services/CacheApiService.ts](file:///Users/mac/Desktop/github/katogo-react/src/app/services/CacheApiService.ts#L424)

**Problem**: `checkServerHealth()` was calling `/api/chat-heads` which requires authentication, throwing errors before user login.

**Solution**: Changed to use public `/api/subscription-plans` endpoint.

```typescript
// OLD: threw errors before login
await http_get('chat-heads');

// NEW: uses public endpoint
await http_get('subscription-plans');
```

### 2. Landing Page Viewport Fit (No Scroll)
**File**: [/Users/mac/Desktop/github/katogo-react/src/app/pages/auth/LandingPage.tsx](file:///Users/mac/Desktop/github/katogo-react/src/app/pages/auth/LandingPage.tsx)

**Changes**:
- Added `html.landing-active { height: 100svh; overflow: hidden; }`
- Added `body.landing-active { height: 100svh; overflow: hidden; }`
- Changed `.landing-shell` to use `height: 100svh` + `width: 100vw`
- Body overflow set to `hidden` during landing to prevent scroll

**Result**: Landing page is fully viewport-fit on all devices without requiring scroll.

---

## 📱 Responsive Design

### Mobile Breakpoints Maintained
The landing page continues to support:
- ✅ Desktop (900px+): Full horizontal layout
- ✅ Tablet (640px-900px): Vertical/flexed layout
- ✅ Mobile (<640px): Full-width buttons, responsive loader positioning
- ✅ Safe-area insets: Top/bottom/right padding for notched devices

---

## ✅ Testing Checklist

- [x] Backend: Type-check passes
- [x] Frontend: Type-check passes  
- [x] Landing page: No scroll required
- [x] Landing page: Movie plays on load (muted autoplay)
- [x] Landing page: Loader displays while buffering
- [x] Landing page: Sound button works to toggle audio
- [x] API: Serves recently viewed/downloaded content
- [x] API: Never returns series
- [x] API: Falls back gracefully if no recent content

---

## 🚀 Performance Improvements

1. **Smarter Content Selection**: Users see movies they/peers have already engaged with
2. **Reduced API Errors**: No more chat-heads 401 errors before login
3. **Better UX**: Landing displays relevant, playable content
4. **No Scroll**: Full-screen hero experience without viewport overflow

---

## 📋 Endpoint Details

### GET /api/random-movie

**Request**:
```
GET http://katogo.ugnews24.info/api/random-movie
```

**Response**:
```json
{
  "code": 1,
  "data": {
    "id": 123,
    "title": "Bullet Train",
    "description": "An action thriller...",
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "image_url": "https://...",
    "year": "2022",
    "rating": "7.5",
    "genre": "Action",
    "type": "Movie",
    "category": "Action Films",
    "actor": "Brad Pitt",
    "vj": "VJ Mark"
  },
  "message": "Random movie retrieved successfully."
}
```

**Status Codes**:
- `200`: Success (movie found)
- `404`: No movies available

---

## 🔗 Related Files

- Landing Page: [LandingPage.tsx](file:///Users/mac/Desktop/github/katogo-react/src/app/pages/auth/LandingPage.tsx)
- Cache Service: [CacheApiService.ts](file:///Users/mac/Desktop/github/katogo-react/src/app/services/CacheApiService.ts)
- Backend Controller: [DynamicCrudController.php](file:///Applications/MAMP/htdocs/katogo/app/Http/Controllers/DynamicCrudController.php)
- Models: [MovieView.php](file:///Applications/MAMP/htdocs/katogo/app/Models/MovieView.php), [MovieDownload.php](file:///Applications/MAMP/htdocs/katogo/app/Models/MovieDownload.php)

---

## 📝 Notes

- All changes maintain backward compatibility
- Better serves the recommendation mission: "Show users good content they're likely to enjoy"
- Falls back gracefully when no recent engagement data exists
- Mobile-first responsive design
