# 🐛 DEBUG MODE - QUICK REFERENCE

## Status
- ✅ All automatic redirects: **DISABLED**
- ✅ Debug banner: **ACTIVE** (bottom of screen)
- ✅ Console logging: **VERBOSE**
- ✅ Manual controls: **AVAILABLE**

---

## What You'll See

### 1. Debug Banner (Bottom of Screen)
```
🐛 Subscription Debug Mode
Status: ✅ ACCESS GRANTED - Status: Active

has_active_subscription: ✅ true
require_subscription: ✅ false
subscription_status: Active
days_remaining: 5
hours_remaining: 68
is_in_grace_period: ✅ false
end_date: 2025-10-06 18:42:24

[🔄 Refresh Data] [📋 Copy Data] [🔀 Go to Plans (Manual)]

ℹ️ Debug Mode Active: All automatic redirects disabled
```

**Colors:**
- 🟢 Green = Access Granted
- 🔴 Red = Access Denied
- 🟠 Orange = Warning
- ⚫ Gray = Loading/Error

### 2. Console Logs
```
🔍 Debug Banner: Manifest fetched
🔍 useSubscriptionCheck: Checking access
✅ useSubscriptionCheck: Access granted
```

OR if would block:
```
❌ useSubscriptionCheck: Access WOULD BE denied (AUTO-REDIRECT DISABLED)
🐛 DEBUG MODE: Not redirecting. Check console.
```

---

## Quick Actions

### 1. Check Current Status
**Look at:** Bottom of screen → Debug banner color
- 🟢 Green? You have access
- 🔴 Red? No access (but won't redirect)

### 2. Refresh Data
**Click:** 🔄 Refresh Data button
**Result:** Fetches latest manifest from server

### 3. Copy Debug Data
**Click:** 📋 Copy Data button
**Result:** Copies subscription JSON to clipboard

### 4. Manual Navigate
**Click:** 🔀 Go to Plans (Manual) button
**Result:** Manually go to subscription plans

### 5. Minimize Banner
**Click:** ✕ button (top right)
**Result:** Collapses to small bubble in corner

---

## Console Commands (Advanced)

Open console (`F12` or `Cmd+Option+I`) and type:

### Get Subscription Data
```javascript
// Check localStorage
localStorage.getItem('manifest')

// Check redux store
window.store?.getState()?.auth?.subscriptionInfo
```

### Clear Cache
```javascript
// Clear manifest cache
localStorage.removeItem('manifest')

// Reload page
location.reload()
```

---

## If Still Redirecting

**Shouldn't happen!** But if it does:

1. Check console for redirect source:
   ```
   Look for: "redirecting", "navigate", "window.location"
   ```

2. Check if it's from a different component:
   ```
   Search logs for the pathname where redirect happens
   ```

3. Check browser Network tab:
   ```
   Look for 3xx redirect responses
   ```

4. Report findings with:
   - Console logs screenshot
   - Network tab screenshot
   - Debug banner screenshot

---

## Expected Behavior

### With Active Subscription:
- ✅ Green banner
- ✅ `has_active_subscription: true`
- ✅ `require_subscription: false`
- ✅ NO REDIRECT
- ✅ Can browse freely

### Without Active Subscription:
- 🔴 Red banner
- ❌ `has_active_subscription: false`
- ❌ `require_subscription: true`
- ⚠️ NO REDIRECT (manual button available)
- 📌 Use manual button if needed

---

## To Re-enable Redirects Later

After debugging is complete:

1. Uncomment redirect code in 3 files:
   - `useSubscriptionCheck.ts`
   - `SubscriptionMonitor.tsx`
   - `Api.ts`

2. Remove debug banner from `App.tsx`

3. Test thoroughly before deploying

---

**Page:** Any page  
**Banner:** Always visible when logged in  
**Refresh:** Every 10 seconds automatically  
**Updated:** October 4, 2025
