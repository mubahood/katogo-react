# 🔍 Authentication Headers Debugging Guide

**Date**: October 1, 2025  
**Issue**: Headers not showing in browser Network tab  
**Status**: FIXED - Testing Required

---

## 🚨 Issue Identified

From your screenshots, the authentication headers (Authorization, authorization, Tok, tok, logged_in_user_id) were **NOT appearing** in the Network tab Request Headers.

### Root Cause

The axios interceptor was setting headers using **dot notation** which doesn't work reliably with AxiosHeaders in newer axios versions:

```typescript
// ❌ WRONG - May not work
config.headers.Authorization = `Bearer ${token}`;

// ✅ CORRECT - Always works
config.headers['Authorization'] = `Bearer ${token}`;
```

---

## ✅ Fix Applied

Updated `/katogo-react/src/app/services/Api.ts` interceptor to:

1. **Use bracket notation** for setting headers
2. **Add extensive logging** to debug token retrieval
3. **Check headers existence** before adding
4. **Verify token availability** from localStorage

### Changes Made:

```typescript
// BEFORE (dot notation)
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
  config.headers.authorization = `Bearer ${token}`;
  config.headers.Tok = `Bearer ${token}`;
  config.headers.tok = `Bearer ${token}`;
}

// AFTER (bracket notation + logging)
if (!config.headers) {
  config.headers = {} as any;
}

if (token) {
  config.headers['Authorization'] = `Bearer ${token}`;
  config.headers['authorization'] = `Bearer ${token}`;
  config.headers['Tok'] = `Bearer ${token}`;
  config.headers['tok'] = `Bearer ${token}`;
  console.log('✅ Added 4 token headers to request');
} else {
  console.warn('⚠️ NO TOKEN FOUND!');
}
```

---

## 🧪 Testing Steps

### Step 1: Clear Browser Cache & Restart Dev Server

```bash
# Stop the dev server (Ctrl+C)
cd /Users/mac/Desktop/github/katogo-react

# Clear node modules cache (optional but recommended)
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Step 2: Open Browser in Incognito Mode

1. Open Chrome/Edge in **Incognito/Private mode**
2. Navigate to `http://localhost:5173` (or your port)
3. Open DevTools (F12) → Console tab
4. Open DevTools → Network tab

### Step 3: Check Console Logs BEFORE Login

You should see this in console:
```
🔧 Axios request interceptor BEFORE adding headers:
  hasToken: false
  tokenPreview: "NO TOKEN"
  hasUser: false
  userId: "NO USER ID"

⚠️ NO TOKEN FOUND - Request will be sent without authentication headers!
⚠️ Check localStorage for ugflix_auth_token
```

This is **EXPECTED** before login.

### Step 4: Login

1. Go to login page
2. Enter credentials:
   - Email: `ssenyonjoalex08@gmail.com`
   - Password: `password`
3. Click Login

### Step 5: Check Console Logs AFTER Login

You should see:
```
🔧 Axios request interceptor BEFORE adding headers:
  hasToken: true
  tokenPreview: "eyJ0eXAiOiJKV1QiLCJh..."
  hasUser: true
  userId: 100

✅ Added 4 token headers to request
✅ Added logged_in_user_id header: 100

🔧 Axios request interceptor AFTER adding headers:
  allHeaders: ["Content-Type", "Accept", "Authorization", "authorization", "Tok", "tok", "logged_in_user_id"]
  Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJh..."
  authorization: "Bearer eyJ0eXAiOiJKV1QiLCJh..."
  Tok: "Bearer eyJ0eXAiOiJKV1QiLCJh..."
  tok: "Bearer eyJ0eXAiOiJKV1QiLCJh..."
  logged_in_user_id: "100"
```

### Step 6: Verify Headers in Network Tab

1. In Network tab, click on **any API request** (like `manifest` or `chat-heads`)
2. Look at **Request Headers** section
3. You should now see:

```
Request Headers:
  Accept: application/json
  Accept-Encoding: gzip, deflate, br, zstd
  Accept-Language: en-US,en;q=0.9
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbG...
  authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbG...
  Connection: keep-alive
  Content-Type: application/json
  Host: localhost:8888
  logged_in_user_id: 100
  Referer: http://localhost:5173/
  Tok: Bearer eyJ0eXAiOiJKV1QiLCJhbG...
  tok: Bearer eyJ0eXAiOiJKV1QiLCJhbG...
```

---

## 🔍 Troubleshooting

### Issue 1: Console shows "NO TOKEN FOUND" after login

**Cause**: Token not saved to localStorage during login

**Fix**: Check browser console during login for errors. Verify login response contains token.

**Verify**:
```javascript
// Paste in browser console after login:
console.log('Token:', localStorage.getItem('ugflix_auth_token'));
console.log('User:', localStorage.getItem('ugflix_user'));
```

Expected output:
```
Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
User: {"id":100,"name":"Alex Trevor","email":"ssenyonjoalex08@gmail.com",...}
```

### Issue 2: Headers still not showing in Network tab

**Cause**: Browser caching or CORS preflight stripping headers

**Fix**:
1. Clear browser cache completely
2. Use Incognito mode
3. Check if CORS is configured on backend

**Verify Backend CORS** (Check Laravel backend):
```php
// In app/Http/Middleware/Cors.php or config/cors.php
'allowed_headers' => ['*'],
'exposed_headers' => ['Authorization', 'authorization', 'Tok', 'tok', 'logged_in_user_id'],
```

### Issue 3: Only some headers showing

**Cause**: Case-sensitivity or header name conflicts

**Fix**: Already fixed with bracket notation. If still issues, check backend logs.

**Verify Backend Receives Headers**:
```php
// Add to ApiController.php temporarily:
public function manifest(Request $r) {
    \Log::info('Headers received:', [
        'Authorization' => $r->header('Authorization'),
        'authorization' => $r->header('authorization'),
        'Tok' => $r->header('Tok'),
        'tok' => $r->header('tok'),
        'logged_in_user_id' => $r->header('logged_in_user_id'),
    ]);
    // ... rest of code
}
```

Check Laravel logs at: `/Applications/MAMP/htdocs/katogo/storage/logs/laravel.log`

---

## 📋 Verification Checklist

After restarting dev server and logging in:

- [ ] Console shows token found: `hasToken: true`
- [ ] Console shows user found: `hasUser: true`
- [ ] Console shows "✅ Added 4 token headers"
- [ ] Console shows "✅ Added logged_in_user_id header"
- [ ] Network tab shows `Authorization` header
- [ ] Network tab shows `authorization` header (lowercase)
- [ ] Network tab shows `Tok` header
- [ ] Network tab shows `tok` header (lowercase)
- [ ] Network tab shows `logged_in_user_id` header
- [ ] API returns successful responses (code: 1)
- [ ] Manifest loads movies successfully
- [ ] Chat heads load (3 conversations)

---

## 🎯 Expected Result

### Console Output (Every API Request):
```
🔧 Axios request interceptor BEFORE adding headers:
  method: "GET"
  url: "/manifest"
  hasToken: true
  tokenPreview: "eyJ0eXAiOiJKV1QiLCJh..."
  hasUser: true
  userId: 100

✅ Added 4 token headers to request
✅ Added logged_in_user_id header: 100

🔧 Axios request interceptor AFTER adding headers:
  allHeaders: [... all header names ...]
  Authorization: "Bearer eyJ0eXAiOiJKV1Q..."
  authorization: "Bearer eyJ0eXAiOiJKV1Q..."
  Tok: "Bearer eyJ0eXAiOiJKV1Q..."
  tok: "Bearer eyJ0eXAiOiJKV1Q..."
  logged_in_user_id: "100"
```

### Network Tab (Request Headers):
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Tok: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
tok: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
logged_in_user_id: 100
```

---

## 🚀 Next Steps After Verification

Once headers are confirmed showing:

1. ✅ Test manifest loading (movies should appear)
2. ✅ Test chat functionality (3 conversations should show)
3. ✅ Test message sending
4. ✅ Remove debug logging (optional - can keep for production debugging)

---

## 📞 Still Having Issues?

If headers STILL don't show after all these steps:

1. **Share the console output** - Copy the interceptor logs
2. **Share localStorage content** - Run in console:
   ```javascript
   console.log({
     token: localStorage.getItem('ugflix_auth_token'),
     user: localStorage.getItem('ugflix_user')
   });
   ```
3. **Share Network tab screenshot** - Full Request Headers section
4. **Check backend logs** - Look for any CORS or authentication errors

---

**Status**: ✅ FIX APPLIED - READY FOR TESTING  
**Action Required**: Restart dev server and test with incognito browser  
**Expected Outcome**: All 5 authentication headers visible in Network tab
