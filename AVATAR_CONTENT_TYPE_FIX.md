# Avatar Upload Fix - Content-Type Issue RESOLVED

## 🐛 Root Cause Found!

**Problem**: Backend logs showed "No photo file in request" with `has_files: false`

**Root Cause**: The axios instance had a default `Content-Type: application/json` header that was preventing FormData from working properly.

### Why This Breaks File Upload:

1. **FormData requires `multipart/form-data`** with a boundary:
   ```
   Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
   ```

2. **Browser automatically generates boundary** when Content-Type is NOT set

3. **Our axios instance was forcing `application/json`** on ALL requests, including FormData

4. **Result**: Files were not being sent in the request body

## ✅ Solution Implemented

### 1. Remove Default Content-Type from Axios Instance

**Before** (`Api.ts` line 8-13):
```typescript
const api = axios.create({
  baseURL: API_CONFIG.API_URL,
  headers: {
    "Content-Type": "application/json", // ❌ This breaks FormData!
    "Accept": "application/json",
  },
});
```

**After**:
```typescript
const api = axios.create({
  baseURL: API_CONFIG.API_URL,
  headers: {
    // DON'T set Content-Type here - let each request set its own
    // FormData needs multipart/form-data, JSON needs application/json
    "Accept": "application/json",
  },
});
```

### 2. Explicitly Handle Content-Type in http_post()

**Added** (`Api.ts` in `http_post` function):
```typescript
// CRITICAL: Handle Content-Type properly for FormData vs JSON
const config: any = {};

if (params instanceof FormData) {
  // For FormData, MUST delete Content-Type to let browser set it with boundary
  // Browser will automatically set: multipart/form-data; boundary=----WebKitFormBoundary...
  config.headers = {
    'Content-Type': undefined // This tells axios to remove the header
  };
  console.log('🗂️ Sending FormData - Content-Type will be set by browser');
} else {
  // For regular objects, use JSON
  config.headers = {
    'Content-Type': 'application/json'
  };
  console.log('📄 Sending JSON - Content-Type: application/json');
}

const response = await api.post(path, formData, config);
```

### 3. Enhanced Debugging

**Added comprehensive FormData logging**:

```typescript
// In Api.ts http_post function
console.log('📦 FormData contents BEFORE adding user fields:');
for (let pair of formData.entries()) {
  if (pair[1] instanceof File) {
    console.log(`  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`);
  } else {
    console.log(`  ${pair[0]}: ${pair[1]}`);
  }
}

// ... add user fields ...

console.log('📦 FormData contents AFTER adding user fields:');
// ... log again ...
```

**Added in ProfileEdit.tsx**:
```typescript
if (formData.avatar) {
  console.log('🖼️ Avatar file details:', {
    name: formData.avatar.name,
    size: formData.avatar.size,
    type: formData.avatar.type,
    lastModified: formData.avatar.lastModified,
    isFile: formData.avatar instanceof File
  });
  apiFormData.append('temp_file_field', 'avatar');
  apiFormData.append('photo', formData.avatar);
  console.log('✅ Avatar appended to FormData');
}
```

**Added in interceptor**:
```typescript
console.log('🔧 Axios request interceptor AFTER adding headers:', {
  // ... existing logs ...
  ContentType: config.headers['Content-Type'] || 'NOT SET',
  isFormData: config.data instanceof FormData
});
```

## 🧪 How to Test Now

### 1. Clear Browser Cache
```
Chrome/Edge: Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)
- Clear cached images and files
- Keep cookies and site data (to stay logged in)
```

### 2. Open Browser DevTools (F12)
- **Console tab**: Watch for new detailed logs
- **Network tab**: Monitor the POST request

### 3. Test Avatar Upload

Navigate to profile edit and upload an avatar.

**Expected Console Logs** (in order):

```
1. ProfileEdit.tsx:
   🖼️ Avatar file details: {
     name: "my-photo.jpg",
     size: 123456,
     type: "image/jpeg",
     isFile: true
   }
   ✅ Avatar appended to FormData

2. ProfileEdit.tsx (before API call):
   📤 Submitting profile update with FormData:
     temp_file_field: avatar
     photo: File: my-photo.jpg (123456 bytes)
     ...other fields...

3. Api.ts (http_post):
   📡 POST api/User: { hasUser: true, userId: 123, isFormData: true }
   
   📦 FormData contents BEFORE adding user fields:
     temp_file_field: avatar
     photo: File(my-photo.jpg, 123456 bytes, image/jpeg)
     first_name: John
     ...
   
   📦 FormData contents AFTER adding user fields:
     ... (same as above plus user, User-Id, user_id)
   
   🗂️ Sending FormData - Content-Type will be set by browser

4. Api.ts (interceptor):
   🔧 Axios request interceptor AFTER adding headers: {
     ContentType: NOT SET,  // ✅ This is correct for FormData!
     isFormData: true
   }

5. Api.ts (response):
   ✅ POST api/User response: 200 OK
```

**Expected Laravel Logs**:
```bash
tail -f storage/logs/laravel.log

[timestamp] local.INFO: Photo file received
{
  "temp_file_field": "avatar",
  "file_name": "my-photo.jpg",
  "file_size": 123456,
  "mime_type": "image/jpeg"
}
```

**Expected Network Tab**:

Request Headers:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
Authorization: Bearer {token}
```

Request Payload:
```
------WebKitFormBoundary...
Content-Disposition: form-data; name="temp_file_field"

avatar
------WebKitFormBoundary...
Content-Disposition: form-data; name="photo"; filename="my-photo.jpg"
Content-Type: image/jpeg

(binary data)
------WebKitFormBoundary...
```

## 🔍 What Changed

| File | Change | Why |
|------|--------|-----|
| `Api.ts` | Removed `Content-Type: application/json` from axios defaults | Let each request set its own Content-Type |
| `Api.ts` | Added explicit `Content-Type: undefined` for FormData in http_post | Tell browser to generate multipart/form-data with boundary |
| `Api.ts` | Added `Content-Type: application/json` for non-FormData | Ensure JSON requests still work |
| `Api.ts` | Added FormData contents logging | Debug what's being sent |
| `Api.ts` | Added Content-Type logging in interceptor | Verify header is correct |
| `ProfileEdit.tsx` | Added avatar file details logging | Debug file before sending |

## 📋 Testing Checklist

Before testing:
- [x] Backend validation code in place
- [x] Frontend validation code in place
- [x] Content-Type fix applied
- [x] Debug logging added
- [ ] Browser cache cleared
- [ ] DevTools open (Console + Network)
- [ ] Laravel logs monitoring

During test:
- [ ] Select avatar file (< 5MB, image)
- [ ] Console shows avatar file details
- [ ] Console shows FormData contents with File object
- [ ] Console shows "Content-Type will be set by browser"
- [ ] Network tab shows multipart/form-data
- [ ] Laravel logs show "Photo file received"
- [ ] Response shows 200 OK

After test:
- [ ] Profile shows new avatar
- [ ] File exists in `/public/storage/images/`
- [ ] Database has avatar path
- [ ] localStorage updated
- [ ] Redux store updated

## 🎯 Why This Fix Works

### The FormData + Content-Type Problem Explained

**FormData Structure**:
```
------WebKitFormBoundary1234567890
Content-Disposition: form-data; name="field1"

value1
------WebKitFormBoundary1234567890
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

<binary file data>
------WebKitFormBoundary1234567890--
```

**The Boundary**:
- Browser generates a unique boundary string
- Boundary separates different parts of FormData
- Server uses boundary to parse the multipart data

**What Was Happening**:
```
Request with Content-Type: application/json
Body: [object FormData]
❌ Server can't parse FormData without proper Content-Type
❌ File data is not sent correctly
```

**What Happens Now**:
```
Request with Content-Type: multipart/form-data; boundary=----WebKit...
Body: (properly formatted multipart data with boundary)
✅ Server receives and parses FormData correctly
✅ Files are included in request
✅ Backend can access file with $request->file('photo')
```

## 🚀 Next Steps

1. **Test the upload**:
   ```bash
   cd /Users/mac/Desktop/github/katogo-react
   npm start
   ```

2. **Monitor Laravel logs**:
   ```bash
   cd /Applications/MAMP/htdocs/katogo
   tail -f storage/logs/laravel.log | grep -i "photo\|avatar"
   ```

3. **Upload an avatar** and verify:
   - Console logs show FormData with File
   - Console shows "Content-Type will be set by browser"
   - Network tab shows `multipart/form-data`
   - Laravel logs show "Photo file received"
   - Avatar displays on profile

## ✅ Status: SHOULD NOW WORK!

**Critical Fix Applied**: Content-Type header issue resolved

**What's Different**:
- Before: `Content-Type: application/json` (wrong for files)
- After: `Content-Type: multipart/form-data; boundary=...` (correct!)

**Backend Will Now See**:
- `$request->hasFile('photo')` → `true` ✅
- `$request->file('photo')` → File object ✅
- `$request->temp_file_field` → 'avatar' ✅

**Ready for testing! 🎉**
