# PWA Setup Guide for UgFlix

## 🎉 Features Implemented

### 1. **Web App Manifest** (`public/manifest.json`)
- Defines app name, icons, colors, and display mode
- Enables "Add to Home Screen" functionality
- Includes shortcuts for quick access to Movies, Products, and Account

### 2. **Service Worker** (`public/service-worker.js`)
- Offline caching for core app files
- Network-first strategy for API calls
- Cache-first strategy for static assets
- Background sync support
- Push notification handling

### 3. **Install Prompt Component** (`src/app/components/PWA/PWAInstallPrompt.tsx`)
- Beautiful native-looking install prompt
- Shows after 30 seconds of browsing
- Remember user's dismiss choice for 7 days
- Displays app benefits and features

### 4. **Service Worker Registration** (`src/app/utils/serviceWorkerRegistration.ts`)
- Automatic service worker registration
- Update detection and prompts
- Notification permission handling
- PWA detection utilities

---

## 📱 How It Works

### For Users:
1. **Visit the site** in a compatible browser (Chrome, Edge, Safari on iOS 16.4+)
2. **Browse for 30 seconds** - the install prompt will appear
3. **Click "Install App"** - the app will be added to their home screen
4. **Launch from home screen** - opens in full-screen mode like a native app

### Supported Browsers:
- ✅ Chrome (Android & Desktop)
- ✅ Edge (Windows & Android)
- ✅ Safari (iOS 16.4+ & macOS)
- ✅ Samsung Internet
- ✅ Firefox (Android)

---

## 🎨 Icon Requirements

### Current Status: ⚠️ **Icons Needed**

You need to create PNG icons in the following sizes and place them in `public/icons/`:

```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

### Design Guidelines:
- Use the UgFlix logo with brand color (#B71C1C)
- Make icons **maskable** (safe zone in center 80%)
- Use transparent or solid background
- Keep design simple and recognizable at small sizes

### Quick Icon Generation:
You can use online tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Favicon.io](https://favicon.io/)

Or use this command with ImageMagick:
```bash
# Install ImageMagick first: brew install imagemagick
convert your-logo.png -resize 512x512 public/icons/icon-512x512.png
convert your-logo.png -resize 384x384 public/icons/icon-384x384.png
convert your-logo.png -resize 192x192 public/icons/icon-192x192.png
convert your-logo.png -resize 152x152 public/icons/icon-152x152.png
convert your-logo.png -resize 144x144 public/icons/icon-144x144.png
convert your-logo.png -resize 128x128 public/icons/icon-128x128.png
convert your-logo.png -resize 96x96 public/icons/icon-96x96.png
convert your-logo.png -resize 72x72 public/icons/icon-72x72.png
```

---

## 🚀 Testing PWA Functionality

### Local Testing:
1. **Build the production version:**
   ```bash
   npm run build:prod
   ```

2. **Serve the build:**
   ```bash
   npm run preview
   ```

3. **Open in Chrome:**
   - Navigate to the preview URL
   - Open DevTools → Application → Manifest
   - Check for errors
   - Click "Add to home screen" in Chrome menu

### Chrome DevTools Audits:
1. Open DevTools → Lighthouse
2. Select "Progressive Web App" category
3. Run audit
4. Fix any issues reported

### Test on Real Devices:
- **Android:** Chrome → Menu → "Install app"
- **iOS:** Safari → Share → "Add to Home Screen"
- **Desktop:** Chrome → Address bar → Install icon

---

## 📊 PWA Checklist

- [x] Web app manifest configured
- [x] Service worker implemented
- [x] HTTPS enabled (required for PWA)
- [x] Install prompt component created
- [x] Offline support enabled
- [ ] Icons generated and added
- [ ] Screenshots for app stores (optional)
- [ ] Push notifications configured (optional)
- [ ] Background sync tested (optional)

---

## 🔧 Configuration Options

### Customize Install Prompt Timing:
Edit `src/app/components/PWA/PWAInstallPrompt.tsx`:
```typescript
// Show prompt after 30 seconds (change as needed)
setTimeout(() => {
  setShowPrompt(true);
}, 30000); // 30000ms = 30 seconds
```

### Customize Dismiss Duration:
```typescript
// Show again after 7 days (change as needed)
if (daysSinceDismissal < 7) {
  return;
}
```

### Update Cache Version:
When deploying updates, change the cache name in `public/service-worker.js`:
```javascript
const CACHE_NAME = 'ugflix-v2.0.1'; // Increment version
```

---

## 📈 Analytics & Monitoring

### Track Install Events:
The PWA automatically logs install events. You can add custom analytics:

```typescript
// In PWAInstallPrompt.tsx
if (choiceResult.outcome === 'accepted') {
  // Add your analytics here
  AnalyticsService.track('pwa_installed');
}
```

### Track PWA Usage:
```typescript
import { isPWA } from './utils/serviceWorkerRegistration';

if (isPWA()) {
  // User is using installed PWA
  AnalyticsService.track('pwa_session');
}
```

---

## 🐛 Troubleshooting

### Install Button Not Showing:
- Ensure HTTPS is enabled
- Check browser console for errors
- Verify manifest.json is accessible
- Check DevTools → Application → Manifest

### Service Worker Not Registering:
- Build production version (SW only works in production)
- Clear browser cache and hard reload
- Check DevTools → Application → Service Workers
- Verify service-worker.js is in public folder

### Icons Not Loading:
- Verify icon paths in manifest.json
- Ensure icons folder exists in public/
- Check file permissions
- Clear cache and test again

### App Not Installing on iOS:
- iOS requires HTTPS
- Icons must be PNG format
- Apple touch icons must be specified in index.html (already done)
- Test on iOS 16.4+ (earlier versions have limited PWA support)

---

## 🎯 Next Steps

1. **Generate Icons** - Create all required icon sizes
2. **Test on Devices** - Test install flow on Android, iOS, and desktop
3. **Add Screenshots** - Optional but improves app store appearance
4. **Configure Push Notifications** - Set up OneSignal or Firebase Cloud Messaging
5. **Monitor Metrics** - Track install rate and PWA usage
6. **Optimize Performance** - Ensure good Lighthouse PWA score (90+)

---

## 📚 Resources

- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [iOS PWA Support](https://firt.dev/notes/pwa-ios/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Built with ❤️ for UgFlix v2.0.0**
