# Katogo React — Frontend Update Task Tracker

> All tasks are to align the frontend with the current Katogo backend API v2, add missing features, modernize the design, and improve performance.
> Games module is intentionally excluded (backend returns 503).
> Status: `[ ]` = Pending | `[~]` = In Progress | `[x]` = Done

---

## SECTION 1 — Authentication & API Alignment

### 1.1 Fix Auth Endpoints
- [x] **[AUTH-01]** Update `AuthService.ts`: change login URL from `/api/users/login` → `/api/auth/login`
  - File: `src/app/services/AuthService.ts`
  - Change POST target, keep payload `{ email, password }` the same
  - Response shape: `{ code: 1, data: { token, user } }`

- [x] **[AUTH-02]** Update `AuthService.ts`: change register URL from `/api/users/register` → `/api/auth/register`
  - File: `src/app/services/AuthService.ts`
  - Payload: `{ email, password, name, phone_number }`

- [x] **[AUTH-03]** Fix 2-step password reset flow
  - File: `src/app/pages/auth/ForgotPasswordPage.tsx`
  - Step 1: user enters email → `POST /api/auth/request-password-reset-code` — shows "check your email" message
  - Step 2: user enters code + new password → `POST /api/auth/password-reset` — logs in on success
  - Update the page UI to show both steps sequentially
  - Add validation: code must be non-empty, passwords must match

- [x] **[AUTH-04]** Add Google OAuth login button
  - Install package: `@react-oauth/google`
  - Add `GoogleOAuthProvider` wrapper in `main.tsx` (use `VITE_GOOGLE_CLIENT_ID` env var)
  - Add "Continue with Google" button to `LoginPage.tsx` and `RegisterPage.tsx`
  - On Google token received: `POST /api/auth/google` with `{ google_token }`
  - Handle response same as regular login (save token, dispatch Redux)

- [x] **[AUTH-05]** Add proper env variable for `VITE_GOOGLE_CLIENT_ID` to `.env.example`

### 1.2 Fix API Base Configuration

- [x] **[API-01]** Update `src/app/services/Api.ts`: load `BASE_URL` from `import.meta.env.VITE_API_BASE_URL` instead of hardcoded string
  - Fallback to `https://katogo.schooldynamics.ug` if env var not set
  - Add a 401 interceptor: on 401 response → dispatch `logout()` from Redux, redirect to `/auth/login`
  - Add a 503 interceptor: on 503 response → show a maintenance mode toast

- [x] **[API-02]** Create `.env.example` file at project root with all required env vars:
  ```
  VITE_API_BASE_URL=https://katogo.schooldynamics.ug
  VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
  VITE_SENTRY_DSN=your_sentry_dsn
  VITE_APP_VERSION=3.0.0
  VITE_ENABLE_ANALYTICS=true
  ```

### 1.3 Create V2 Services

- [x] **[SVC-01]** Create `src/app/services/v2/MoviesV2Service.ts`
  - `getMovies(params)` → `GET /api/v2/movies` with filters: type, genre, language, vj, year, status, sort, page, per_page
  - `getMovie(id)` → `GET /api/v2/movies/{id}`
  - `getRelatedMovies(id)` → `GET /api/v2/movies/{id}/related`
  - `reportPlayback(id)` → `POST /api/v2/movies/{id}/playback`
  - `searchMovies(q, page, per_page)` → `GET /api/v2/movies/search`

- [x] **[SVC-02]** Create `src/app/services/v2/SeriesV2Service.ts`
  - `getSeries(params)` → `GET /api/v2/series` with filters: page, per_page, sort, genre, language, year
  - `getSeriesEpisodes(id)` → `GET /api/v2/series/{id}/episodes`

- [x] **[SVC-03]** Create `src/app/services/v2/ManifestV2Service.ts`
  - `getManifest()` → `GET /api/v2/manifest`
  - Returns sections: featured, continue_watching, trending, popular, recommendations, categories, subscription_status, genres, vjs

- [x] **[SVC-04]** Create `src/app/services/v2/SearchV2Service.ts`
  - `searchAll(q, page, per_page)` → `GET /api/v2/search/all`
  - `getSuggestions(q)` → `GET /api/v2/search/all/suggestions`
  - `getTrending()` → `GET /api/v2/search/all/trending`
  - `getSearchHistory(page, per_page)` → `GET /api/v2/search/history`
  - `deleteHistoryItem(id)` → `DELETE /api/v2/search/history/{id}`
  - `clearSearchHistory()` → `DELETE /api/v2/search/history`

- [x] **[SVC-05]** Create `src/app/services/v2/StreamingV2Service.ts`
  - `getStreamingHome()` → `GET /api/v2/streaming/home`
  - `getStations(params)` → `GET /api/v2/streaming/stations` (filters: type, category, featured, q, sort, per_page)
  - `getStation(id)` → `GET /api/v2/streaming/stations/{id}`
  - `getCategories()` → `GET /api/v2/streaming/categories`

- [x] **[SVC-06]** Create `src/app/services/v2/BlogV2Service.ts`
  - `getPosts(params)` → `GET /api/v2/blog` (category, page, per_page)
  - `getPost(id)` → `GET /api/v2/blog/{id}` — returns post + comments
  - `getMarquee()` → `GET /api/v2/blog/marquee`
  - `likePost(id)` → `POST /api/v2/blog/{id}/like`
  - `commentOnPost(id, content)` → `POST /api/v2/blog/{id}/comment`
  - `likeComment(id)` → `POST /api/v2/blog/comment/{id}/like`
  - `reportComment(id, reason)` → `POST /api/v2/blog/comment/{id}/report`

- [x] **[SVC-07]** Create `src/app/services/v2/AnalyticsV2Service.ts`
  - `trackAction(params)` → `POST /api/v2/safemode/track` (external_video_id, action, video_title, category, genre)
  - `saveProgress(params)` → `POST /api/v2/safemode/progress`
  - `getProgress(external_video_id)` → `GET /api/v2/safemode/progress/{external_video_id}`
  - `getHistory(page, per_page)` → `GET /api/v2/safemode/history`
  - `recordDownload(params)` → `POST /api/v2/downloads/record`

- [x] **[SVC-08]** Create `src/app/services/v2/ModerationService.ts`
  - `reportContent(params)` → `POST /api/moderation/report-content` (reported_content_type, reported_content_id, report_type, description)
  - `blockUser(params)` → `POST /api/moderation/block-user` (blocked_user_id, reason, block_type)
  - `unblockUser(blocked_user_id)` → `POST /api/moderation/unblock-user`
  - `getBlockedUsers(page, per_page)` → `GET /api/moderation/blocked-users`
  - `getMyReports(page, per_page)` → `GET /api/moderation/my-reports`
  - `submitLegalConsent(consent_agreed)` → `POST /api/moderation/legal-consent`
  - `getLegalConsentStatus()` → `GET /api/moderation/legal-consent-status`

- [x] **[SVC-09]** Verify and fix `SubscriptionService.ts` endpoint paths match backend:
  - `POST /api/subscriptions/create`
  - `GET /api/subscriptions/my-subscription`
  - `GET /api/subscriptions/history`
  - `GET /api/subscriptions/pending`
  - `POST /api/subscriptions/{id}/initiate-payment`
  - `POST /api/subscriptions/{id}/check-payment`
  - `POST /api/subscriptions/{id}/cancel`
  - `POST /api/subscriptions/retry-payment`
  - `GET /api/subscription-plans`

- [x] **[SVC-10]** Verify and fix `AccountApiService.ts` paths:
  - `GET /api/account/dashboard`
  - `GET /api/account/watchlist`, `POST /api/account/watchlist/add`, `DELETE /api/account/watchlist/{movie_id}`
  - `GET /api/account/watch-history`
  - `POST /api/account/likes/toggle`, `GET /api/account/likes`
  - `POST /api/account/wishlist/toggle`, `GET /api/account/wishlist`
  - `POST /api/video-progress`, `GET /api/video-progress/{movie_id}`, `DELETE /api/video-progress/{movie_id}/delete`

### 1.4 TypeScript Types
- [x] **[TYPES-01]** Create `src/app/types/movie.ts` — TypeScript interface for Movie (all fields from API)
- [x] **[TYPES-02]** Create `src/app/types/user.ts` — TypeScript interface for User
- [x] **[TYPES-03]** Create `src/app/types/subscription.ts` — interfaces for SubscriptionPlan, UserSubscription
- [x] **[TYPES-04]** Create `src/app/types/blog.ts` — interfaces for BlogPost, BlogComment
- [x] **[TYPES-05]** Create `src/app/types/streaming.ts` — interfaces for Station, StreamingCategory
- [x] **[TYPES-06]** Create `src/app/types/api.ts` — generic `ApiResponse<T>` wrapper type: `{ code: number, status: number, message: string, data: T }`

---

## SECTION 2 — Design System & Layout

### 2.1 Tailwind CSS Setup
- [x] **[STYLE-01]** Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [x] **[STYLE-02]** Configure Tailwind theme:
  - Tailwind v4 installed — config is CSS-based in `@theme {}` block in `src/app/styles/index.css`
  - Brand colors `brand-red` and `brand-gold` defined, Inter + Plus Jakarta Sans fonts set
  - No `tailwind.config.ts` needed in v4 (v4 uses `@theme` CSS directive instead)
- [ ] **[STYLE-03]** Install shadcn/ui: `npx shadcn-ui@latest init` — configure with Tailwind, dark mode
- [ ] **[STYLE-04]** Add shadcn/ui components needed: Button, Card, Dialog, DropdownMenu, Select, Tabs, Input, Badge, Skeleton, Avatar, Tooltip
- [x] **[STYLE-05]** Update `src/app/styles/globals.css`: add Tailwind directives (`@tailwind base/components/utilities`), define CSS custom properties for brand colors and dark/light themes
- [x] **[STYLE-06]** Import Google Fonts (Inter + Plus Jakarta Sans) in `index.html` with `font-display: swap`

### 2.2 Dark/Light Mode
- [x] **[THEME-01]** Create `src/app/store/slices/themeSlice.ts`: state `{ mode: 'dark' | 'light' }`, persist to localStorage key `katogo_theme`
- [x] **[THEME-02]** Create `src/app/hooks/useTheme.ts`: returns `{ theme, toggleTheme }`, applies `dark` class to `<html>` element
- [x] **[THEME-03]** Remove the hardcoded light-mode override in `App.tsx` (the MutationObserver that forces `data-bs-theme='light'`)
- [x] **[THEME-04]** Initialize theme from localStorage on app load (before first render to prevent flash)

### 2.3 Main Layout Redesign
- [x] **[LAYOUT-01]** Redesign `MainLayout.tsx`:
  - Wrap content with `ThemeProvider`
  - Pass dark class to root element
  - Full-height layout: sticky header, scrollable main, footer
  - Remove Bootstrap container dependencies

- [x] **[LAYOUT-02]** Redesign `Header.tsx` (new component `MainNavV2.tsx`):
  - Sticky, blur backdrop when scrolled (`backdrop-blur-md`)
  - Transparent on hero pages, solid on scroll (via `IntersectionObserver` or scroll listener)
  - Logo on left
  - Nav links: Home | Movies | Series | Live TV | Blog | Shop
  - Expandable search bar (icon → full bar on click, with live suggestions)
  - Notification bell icon (shows unread count)
  - User avatar with dropdown: Profile, Watch History, My Subscriptions, Settings, Logout
  - Unauthenticated state: Login | Register buttons
  - Movie/Series links: hover opens genre mega-dropdown

- [x] **[LAYOUT-03]** Redesign `MobileBottomNav.tsx`:
  - 5 tabs: Home (house icon) | Movies (film icon) | Live TV (radio icon) | Shop (bag icon) | Account (user icon)
  - Active tab highlight in brand red
  - Badge on Shop tab for cart count
  - Badge on Account tab for notifications

- [x] **[LAYOUT-04]** Create `Footer.tsx`:
  - Brand logo + tagline
  - Column links: Watch (Movies, Series, Live TV) | Shop | Info (About, Blog, Help, Contact)
  - Legal links: Terms, Privacy
  - App download badges (iOS/Android)
  - Social icons (Facebook, Twitter/X, Instagram, WhatsApp)
  - Copyright line

- [~] **[LAYOUT-05]** Delete old nav variants — PARTIALLY DONE: `ModernMainNav.tsx`, `ModernMainNav.css`, `TopUtilityBar.tsx`, `MainNav.tsx` deleted. `HeaderWrapper.tsx` retained (still used by `MainLayout.tsx`).

---

## SECTION 3 — Core Content Pages

### 3.1 Home Page — V2 Manifest
- [x] **[HOME-01]** Create RTK Query slice `src/app/store/api/manifestApi.ts`:
  - `getManifest` query → `GET /api/v2/manifest`, cache for 15 minutes
  - TypeScript return type using manifest section interfaces

- [x] **[HOME-02]** Rebuild `StreamingHomePage.tsx`:
  - Fetch from `manifestApi.getManifest`
  - **Hero Banner**: full-width featured movie (title, description, year, rating, type badge), two CTAs: "Watch Now" (→ `/watch/:id`) and "Add to Watchlist", background is movie poster with gradient overlay
  - **Continue Watching row**: horizontal scroll Swiper, each card shows progress bar (% from `video-progress`), Resume button
  - **Trending Now row**: Swiper with MovieCards
  - **Popular row**: Swiper with MovieCards
  - **Recommendations row**: Swiper with MovieCards, "Recommended for you" label
  - **Genre rows**: one row per genre from `categories`, title = genre name, each links to `/movies?genre=...`
  - **Live TV teaser**: static section with 3–4 station cards and "View All" button
  - Show skeleton loaders (pulse) for all rows while loading
  - Empty state if no data for a section (hide the section, don't show blank)

- [x] **[HOME-03]** Create reusable `ContentRow.tsx` component:
  - Props: `title`, `items`, `seeAllLink`, `isLoading`
  - Renders Swiper horizontal scroll with navigation arrows
  - Renders `MovieCard` for each item
  - Shows `ContentRowSkeleton` while `isLoading` is true

- [x] **[HOME-04]** Create/redesign `MovieCard.tsx`:
  - Shows poster image (16:9 or 2:3 ratio), lazy-loaded
  - Title, year, genre badge, language badge
  - Rating badge (gold star)
  - Hover overlay: Play button, Add to Watchlist icon, More Info icon
  - Premium badge if `is_premium === 'Yes'`
  - Episode/series label if type is Episode

### 3.2 Movies Page — V2 API
- [x] **[MOVIES-01]** Update RTK Query slice `src/app/store/api/moviesApi.ts`:
  - Endpoint: `GET /api/v2/movies` with all filter params
  - TypeScript params: `{ type?, genre?, language?, vj?, year?, status?, sort?, page, per_page }`

- [x] **[MOVIES-02]** Rebuild `MoviesPage.tsx`:
  - Filters: Type (Movie/Series/Episode), Genre (dropdown), Language (dropdown), VJ (dropdown), Year (dropdown), Sort (dropdown: newest/oldest/popular/rating)
  - All filters sync to URL query params (so links are shareable)
  - Filter state initialized from URL params on page load
  - Responsive grid: 6 cols xl, 4 cols lg, 3 cols md, 2 cols sm
  - Pagination component at bottom
  - "X results found" count
  - Empty state: illustration + "No movies found. Try different filters."
  - Skeleton grid while loading

- [x] **[MOVIES-03]** Create `MovieDetailPage.tsx` — DONE: `src/app/pages/Movies/MovieDetailPage.tsx` created with RTK Query, backdrop hero, metadata, Watch Now / Watchlist / Like / Share actions, ReportContentModal, related movies row. Route: `/movie/:id`.
  - Movie detail from `GET /api/v2/movies/{id}`
  - Full metadata: title, year, genre, language, VJ, rating, IMDB rating, director, stars, country, description
  - Poster + backdrop images
  - Watch Now button (if subscribed) or Subscribe CTA
  - Like / Watchlist / Wishlist toggle buttons
  - Related movies row from `GET /api/v2/movies/{id}/related`
  - Share buttons (react-share)

### 3.3 Series Detail Page — NEW
- [x] **[SERIES-01]** Create `src/app/pages/content/SeriesDetailPage.tsx`:
  - Series info header: title, description, genre, year, language, total episodes
  - Episodes list from `GET /api/v2/series/{id}/episodes`
  - Each episode: thumbnail, episode number, title, duration, description
  - "Play" button per episode (→ `/watch/:episodeId`)
  - Mark episodes as watched (toggle via likes or watch-history endpoint)
  - Group by season if `season_number` is present
  - Add to Watchlist button for the whole series

- [x] **[SERIES-02]** Add `/series/:id` route to `AppRoutes.tsx` pointing to `SeriesDetailPage`

### 3.4 Watch Page Improvements
- [x] **[WATCH-01]** On playback start: call `POST /api/v2/movies/{id}/playback`
- [x] **[WATCH-02]** On page load: check `GET /api/video-progress/{movie_id}` → if progress exists, show "Resume from X:XX" prompt
- [x] **[WATCH-03]** Every 30 seconds during playback: save progress via `POST /api/video-progress` with `{ movie_id, progress_seconds, timestamp }`
- [x] **[WATCH-04]** On playback error: call `POST /api/video-playback-failures` with `{ movie_id, error_message }`
- [x] **[WATCH-05]** Track playback via `POST /api/v2/safemode/track` with `action: 'play'`
- [x] **[WATCH-06]** Show "Related Movies" section below player from `GET /api/v2/movies/{id}/related`
- [x] **[WATCH-07]** Like toggle and Watchlist toggle buttons visible on WatchPage
- [x] **[WATCH-08]** Report Content button (opens moderation modal)
- [x] **[WATCH-09]** Download tracking: when user clicks download → `POST /api/v2/downloads/record`

### 3.5 Search Experience Redesign
- [x] **[SEARCH-01]** Redesign search bar in Header — DONE: keyboard navigation (ArrowUp/Down/Enter/Escape) added to `LiveSearchBox.tsx`.
  - Debounced input (300ms) calls `GET /api/v2/search/all/suggestions`
  - Dropdown shows: movie suggestions, series suggestions, VJ names, genres
  - Keyboard navigation (arrow keys, Enter to select, Escape to close)
  - Click suggestion → navigate to `/watch/:id` (movies) or `/series/:id` (series)
  - Recent searches shown when search bar opens with no query

- [x] **[SEARCH-02]** Rebuild `SearchResultsPage.tsx`:
  - URL: `/search?q=...`
  - Tabs: All | Movies | Series
  - Results from `GET /api/v2/search/all`
  - Shows total count per tab
  - When query is empty: show Trending section from `GET /api/v2/search/all/trending`
  - Recent search history from `GET /api/v2/search/history` with delete buttons
  - Clear all history button → `DELETE /api/v2/search/history`

- [x] **[SEARCH-03]** Sync search query to URL param `?q=` so results page is shareable

---

## SECTION 4 — New Feature Modules

### 4.1 Live TV & Radio — NEW
- [x] **[LIVE-01]** Create `src/app/services/v2/StreamingV2Service.ts` (already in SVC-05, link here)

- [x] **[LIVE-02]** Install `hls.js` for HLS stream playback: `npm install hls.js`

- [x] **[LIVE-03]** Create `src/app/components/liveTV/StationCard.tsx`:
  - Station logo, name, type badge (TV/Radio), language, region
  - "Tune In" button
  - Hover: show brief description

- [x] **[LIVE-04]** Create `src/app/components/liveTV/LivePlayer.tsx`:
  - Accepts `stream_url`
  - If URL is HLS (`.m3u8`): use hls.js
  - Otherwise: use standard `<video>` or iframe
  - Controls: play/pause, volume, fullscreen

- [x] **[LIVE-05]** Create `src/app/pages/liveTV/LiveTVPage.tsx` (placeholder, full API wiring in LIVE-03/04):
  - Hero section "Live Now" with gradient background
  - Home data from `GET /api/v2/streaming/home`
  - Category filter tabs from `GET /api/v2/streaming/categories`
  - Station grid (responsive) with `StationCard` — filters by selected category + type (TV/Radio toggle)
  - Search bar for stations (calls `GET /api/v2/streaming/stations?q=...`)
  - Skeleton grid while loading

- [x] **[LIVE-06]** Create `src/app/pages/liveTV/LiveStationPage.tsx` (placeholder, player in LIVE-04):
  - Station detail from `GET /api/v2/streaming/stations/{id}`
  - `LivePlayer` component with station stream URL
  - Station info: name, frequency, type, language, region, website link
  - Related stations in same category

- [x] **[LIVE-07]** Add `/live` and `/live/:id` routes to `AppRoutes.tsx`

- [x] **[LIVE-08]** Add "Live TV" tab to main navigation and mobile bottom nav

- [x] **[LIVE-09]** Add Live TV teaser section to Home page

### 4.2 Blog / News — NEW
- [x] **[BLOG-01]** Create `src/app/components/blog/BlogCard.tsx`:
  - Cover image, category badge, title, excerpt, date, read time estimate
  - Like count
  - "Read More" button

- [x] **[BLOG-02]** Create `src/app/components/blog/BlogMarquee.tsx`:
  - Horizontal scrolling featured posts strip from `/api/v2/blog/marquee`
  - Bold headline style cards

- [x] **[BLOG-03]** Create `src/app/components/blog/CommentSection.tsx`:
  - List comments with author avatar, name, date, body
  - Like button per comment (toggle, show count)
  - Report button per comment (opens reason modal → `POST /api/v2/blog/comment/{id}/report`)
  - Add comment form at bottom (requires auth)

- [x] **[BLOG-04]** Create `src/app/pages/blog/BlogPage.tsx` (placeholder with sample data):
  - Marquee/featured posts at top from `GET /api/v2/blog/marquee`
  - Category filter tabs
  - Post grid from `GET /api/v2/blog`
  - Pagination
  - Skeleton loaders

- [x] **[BLOG-05]** Create `src/app/pages/blog/BlogPostPage.tsx` (placeholder):
  - Post detail from `GET /api/v2/blog/{id}`
  - Full post content rendered (HTML or Markdown)
  - Cover image (full-width hero)
  - Author info, date, category
  - Like button (toggle) with count
  - Share buttons (react-share)
  - `CommentSection` component below post

- [x] **[BLOG-06]** Add `/blog` and `/blog/:id` routes to `AppRoutes.tsx` (public, no subscription required)

- [x] **[BLOG-07]** Add Blog link to Footer and main navigation

### 4.3 Content Moderation UI — NEW
- [x] **[MOD-01]** Create `src/app/components/moderation/ReportContentModal.tsx`:
  - Modal trigger: "Report" button (flag icon)
  - Dropdown: select report type (Inappropriate, Spam, Copyright, Other)
  - Text area: description
  - Submit → `POST /api/moderation/report-content`
  - Close on success with toast: "Report submitted"

- [x] **[MOD-02]** Create `src/app/components/moderation/BlockUserButton.tsx`:
  - Shows on user profile cards and in chat header
  - Confirm dialog: "Block [username]? They won't be able to contact you."
  - On confirm → `POST /api/moderation/block-user`
  - Show "Unblock" variant if user is already blocked → `POST /api/moderation/unblock-user`

- [x] **[MOD-03]** Add `ReportContentModal` to: `MovieCard.tsx`, `WatchPage.tsx`, `BlogPostPage.tsx`

- [~] **[MOD-04]** Add `BlockUserButton` to: Connect/Discover user cards, Chat header — PARTIALLY DONE: added to Connect/Discover user cards via `pages/connect/components/UserCard.tsx`. Chat header integration is still pending because the active chat header UI is not implemented.

- [x] **[MOD-05]** Create `src/app/pages/account/AccountBlockedUsersPage.tsx`:
  - List from `GET /api/moderation/blocked-users` (paginated)
  - Each item: user avatar, name, block date
  - Unblock button per item
  - Empty state: "You haven't blocked anyone"

- [x] **[MOD-06]** Create `src/app/pages/account/AccountMyReportsPage.tsx`:
  - List from `GET /api/moderation/my-reports`
  - Shows: what was reported, type, status, date
  - Empty state: "No reports submitted"

- [x] **[MOD-07]** Add `/account/blocked-users` and `/account/my-reports` routes and sidebar links

### 4.4 Legal Consent Flow — NEW
- [x] **[LEGAL-01]** Create `src/app/components/auth/LegalConsentModal.tsx`:
  - Full-screen modal shown on first login or when `GET /api/moderation/legal-consent-status` returns not consented
  - Summary of Terms & Privacy policy
  - Checkbox: "I agree to the Terms of Service and Privacy Policy"
  - Submit → `POST /api/moderation/legal-consent` with `{ consent_agreed: true }`
  - Cannot be dismissed without agreeing
  - On success: close modal and let user continue

- [x] **[LEGAL-02]** In `AppAuthWrapper.tsx`: after login, check consent status and show `LegalConsentModal` if needed

---

## SECTION 5 — Account & Profile

### 5.1 Account Dashboard
- [x] **[ACCT-01]** Consolidate to single `AccountDashboard.tsx` — delete `AccountDashboardNew.tsx` and any `NewAccountDashboard.tsx` variant
- [x] **[ACCT-02]** Connect to `GET /api/account/dashboard` for stats
- [x] **[ACCT-03]** Stats cards: Total Watch Hours, Movies Liked, Watchlist Size, Subscription Status (with expiry date)
- [x] **[ACCT-04]** Quick actions row: Resume Watching (last item from history), Browse Movies, Manage Subscription
- [x] **[ACCT-05]** Add sidebar links to new pages: Blocked Users, My Reports

### 5.2 Watch History Enhancements
- [x] **[HIST-01]** Show progress percentage bar on each watch history item (from `GET /api/video-progress/{movie_id}`)
- [x] **[HIST-02]** Add "Resume" button per item (navigates to `/watch/:id?t={progress_seconds}`)
- [x] **[HIST-03]** Add per-item "Remove from history" button → `DELETE /api/video-progress/{movie_id}/delete`
- [x] **[HIST-04]** Add "Clear All History" button at top of page

### 5.3 Account Settings Additions
- [x] **[SETTINGS-01]** Add dark/light mode toggle to Account Settings (saves preference)
- [x] **[SETTINGS-02]** Add "Delete Account" button (calls `POST /api/disable-account` with confirm dialog)
- [x] **[SETTINGS-03]** Legal consent status display: show whether user has consented, with "View Terms" link

---

## SECTION 6 — Code Quality & Cleanup

### 6.1 Delete Dead/Duplicate Files
- [x] **[CLEAN-01]** Delete duplicate auth pages — DONE: `PlainLogin.tsx`, `TestLogin.tsx`, `SimpleLoginTest.tsx` deleted. `MinimalLogin.tsx` and `MinimalRegister.tsx` were already gone.

- [x] **[CLEAN-02]** Delete duplicate account dashboard variants:
  - `src/app/pages/account/AccountDashboardNew.tsx`
  - Any `NewAccountDashboard.tsx` file

- [x] **[CLEAN-03]** Delete old chat backup:
  - `src/app/components/old_chat_backup/` entire directory

- [x] **[CLEAN-04]** Delete debug/development artifacts — DONE: removed `ApiTestPage.tsx`, `ApiIntegrationStatusPage.tsx`, and their routes from `AppRoutes.tsx`.

- [x] **[CLEAN-05]** Delete root-level debug scripts:
  - `cache-debug.js`
  - `test-livesearch-styles.js`

- [x] **[CLEAN-06]** Delete the 60+ markdown documentation files from root — DONE: pruned root markdown files down to `README.md` and `TASKS.md`.

- [~] **[CLEAN-07]** Delete old nav variants — PARTIALLY DONE: `ModernMainNav.tsx`, `ModernMainNav.css`, `TopUtilityBar.tsx`, `MainNav.tsx` deleted. `HeaderWrapper.tsx` kept (used by `MainLayout.tsx`).

- [x] **[CLEAN-08]** Consolidate ProductCard variants — DONE: switched callers to `ProductCard.tsx`, deleted `ProductCard2.tsx`, `ProductCard2Optimized.tsx`, `ProductCardSimple.tsx`, `ProductCardOptimized.tsx`, related variant CSS files, and the backup folder.

### 6.2 TypeScript Strictness
- [~] **[TS-01]** Enable `noUnusedLocals: true` in `tsconfig.json` — BLOCKED: tested, causes 240 violations across codebase. Needs dedicated cleanup pass before enabling.
- [~] **[TS-02]** Enable `noUnusedParameters: true` in `tsconfig.json` — BLOCKED: same issue as TS-01, 240 combined violations.
- [x] **[TS-03]** Run `npm run type-check` and fix all resulting TypeScript errors
- [ ] **[TS-04]** Replace all `any` types with proper interfaces (use the types created in TYPES-01 through TYPES-06)

### 6.3 Error Handling & Monitoring
- [x] **[ERR-01]** Install Sentry: `npm install @sentry/react`
- [x] **[ERR-02]** Initialize Sentry in `main.tsx` using `VITE_SENTRY_DSN` env var, wrap app in `Sentry.ErrorBoundary`
- [x] **[ERR-03]** Set Sentry user context on login: `Sentry.setUser({ id, email })`
- [x] **[ERR-04]** Clear Sentry user context on logout
- [x] **[ERR-05]** Improve `ErrorBoundary.tsx` fallback UI: show user-friendly message, "Go Home" button, report button
- [x] **[ERR-06]** Add global 401 axios interceptor (auto-logout + redirect to `/auth/login`)
- [x] **[ERR-07]** Add global 503 axios interceptor (show maintenance mode banner/toast)
- [x] **[ERR-08]** Add offline detection: show a dismissable top banner "You are offline. Some features may not be available."

### 6.4 Package Updates
- [x] **[PKG-01]** Run `npm outdated` to identify outdated packages
- [x] **[PKG-02]** Update TypeScript: `5.5.4` → latest `5.6+` — installed: `typescript@5.9.3`
- [x] **[PKG-03]** Update Vite: `5.3.5` → latest `5.4+` — installed: `vite@5.4.21`
- [x] **[PKG-04]** Update Framer Motion to latest patch — installed: `framer-motion@12.38.0`
- [x] **[PKG-05]** Update React Router to latest `6.x` patch — installed: `react-router-dom@6.30.3`
- [x] **[PKG-06]** Update TanStack Query to latest `5.x` — installed: `@tanstack/react-query@5.91.2`
- [ ] **[PKG-07]** Remove Bootstrap (`bootstrap`, `react-bootstrap`) after Tailwind migration is complete
- [x] **[PKG-08]** Remove icon libraries replaced by lucide-react: `@fortawesome/fontawesome-free`, `@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`, `react-feather` — DONE: migrated remaining `react-feather` imports to `lucide-react` and uninstalled the replaced packages.
- [~] **[PKG-09]** Add new packages: `tailwindcss`, `@radix-ui/react-*`, `@react-oauth/google`, `hls.js`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@sentry/react`, `date-fns`

### 6.5 Performance
- [x] **[PERF-01]** Verify every route in `AppRoutes.tsx` uses `React.lazy()` + `Suspense` with fallback skeleton — converted all account + connect page imports from eager to `React.lazy()`
- [~] **[PERF-02]** Add `ContentRowSkeleton` and `MovieCardSkeleton` for every async content section — PARTIALLY DONE: created reusable `ContentRowSkeleton.tsx` and updated `ContentRow.tsx` to use it. Additional non-`ContentRow` async sections still need dedicated skeleton coverage.
- [ ] **[PERF-03]** Replace standard `<img>` tags with lazy-loaded images using `loading="lazy"` and proper `srcSet`
- [~] **[PERF-04]** Run `npm run build` and analyze bundle — PARTIALLY DONE: build passes. Oversized outputs identified and still need splitting, including `LiveStationPage` (~521 kB), main `index` bundle (~315 kB), and `index.css` (~509 kB).

---

## SECTION 7 — Testing

### 7.1 Setup
- [x] **[TEST-01]** Install Vitest: `npm install -D vitest @vitest/ui jsdom`
- [x] **[TEST-02]** Install Testing Library: `npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom`
- [x] **[TEST-03]** Configure `vitest.config.ts` with jsdom environment
- [~] **[TEST-04]** Install Playwright: `npm install -D @playwright/test` and run `npx playwright install` — PARTIALLY DONE: `@playwright/test` installed. Browser binaries have not been downloaded yet.
- [x] **[TEST-05]** Add test scripts to `package.json`: `"test": "vitest"`, `"test:ui": "vitest --ui"`, `"test:e2e": "playwright test"`

### 7.2 Unit Tests
- [ ] **[UNIT-01]** `AuthService.test.ts` — test login, register, token save/restore
- [ ] **[UNIT-02]** `authSlice.test.ts` — test Redux state: loginSuccess, loginFailure, logout, restoreAuthState
- [ ] **[UNIT-03]** `SearchV2Service.test.ts` — test search functions with mocked axios
- [ ] **[UNIT-04]** `themeSlice.test.ts` — test dark/light mode toggle
- [ ] **[UNIT-05]** Utility functions in `Utils.ts` — test all exported functions

### 7.3 Integration Tests
- [ ] **[INT-01]** Login flow: form submit → API call → Redux state update → redirect to home
- [ ] **[INT-02]** Movie browse: filter change → API call → grid updates with new results
- [ ] **[INT-03]** Add to Watchlist: button click → API call → button state updates

### 7.4 E2E Tests (Playwright)
- [ ] **[E2E-01]** User can register a new account
- [ ] **[E2E-02]** User can log in and see home page
- [ ] **[E2E-03]** User can search for a movie and see results
- [ ] **[E2E-04]** User can add a movie to watchlist
- [ ] **[E2E-05]** User can navigate to Live TV page and see stations
- [ ] **[E2E-06]** User can read a blog post and like it
- [ ] **[E2E-07]** Unauthenticated user is redirected to login when accessing /account

---

## SECTION 8 — Documentation

- [ ] **[DOC-01]** Update `README.md`: project overview, prerequisites, setup steps, available scripts, env vars reference
- [x] **[DOC-02]** Create `.env.example` with all required and optional env vars documented
- [ ] **[DOC-03]** Add JSDoc comments to all service functions (describe params, return shape, endpoint hit)
- [ ] **[DOC-04]** Update `package.json` version to `3.0.0` when all tasks are complete

---

## Task Summary

| Section | Total Tasks | Done | Remaining |
|---------|------------|------|-----------|
| 1 — Auth & API | 23 | 23 | 0 |
| 2 — Design & Layout | 15 | 12 | 3 |
| 3 — Core Pages | 21 | 21 | 0 |
| 4 — New Modules | 25 | 24 | 1 |
| 5 — Account | 12 | 12 | 0 |
| 6 — Code Quality | 33 | 24 | 9 |
| 7 — Testing | 20 | 4 | 16 |
| 8 — Docs | 4 | 1 | 3 |
| **Total** | **153** | **121** | **32** |
