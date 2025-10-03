# Avatar Upload - Quick Reference

## 🎯 What Was Fixed

**Issue**: Avatar not uploading when user updates profile

**Solution**: Enhanced backend validation + added debugging logs

## 🔧 Changes Made

### Backend (`ApiController.php`)
```php
// ✅ Added file validation
- File type check (JPEG, PNG, GIF, WebP only)
- File size check (max 5MB)
- File validity check
- Proper error messages

// ✅ Added debug logging
- Log when file is received
- Log file details (name, size, type)
- Log when no file in request
```

### Frontend (`ProfileEdit.tsx`)
```typescript
// ✅ Added debug logging
- Log FormData contents before sending
- Show file name and size in console
- Track upload flow
```

## 🧪 How to Test

### Quick Test (5 minutes)

1. **Run test script**:
   ```bash
   cd /Users/mac/Desktop/github/katogo-react
   ./test-avatar-upload.sh
   ```

2. **Open two terminal windows**:
   
   **Terminal 1 - Laravel Logs**:
   ```bash
   cd /Applications/MAMP/htdocs/katogo
   tail -f storage/logs/laravel.log | grep -i "photo\|avatar\|file"
   ```
   
   **Terminal 2 - React App** (if not running):
   ```bash
   cd /Users/mac/Desktop/github/katogo-react
   npm start
   ```

3. **Open browser with DevTools (F12)**:
   - Console tab: See frontend logs
   - Network tab: See API requests
   
4. **Test upload**:
   - Go to: `http://localhost:3000/account/profile/edit`
   - Click avatar preview
   - Select image (< 5MB)
   - Click "Save Profile"

5. **Verify**:
   
   **✅ Frontend Console should show**:
   ```
   📤 Submitting profile update with FormData:
     temp_file_field: avatar
     photo: File: my-image.jpg (123456 bytes)
   ✅ Profile updated successfully
   ```
   
   **✅ Laravel logs should show**:
   ```
   Photo file received
   {
     "temp_file_field": "avatar",
     "file_name": "my-image.jpg",
     "file_size": 123456,
     "mime_type": "image/jpeg"
   }
   ```
   
   **✅ Network tab should show**:
   - POST api/User → 200 OK
   - Response includes avatar URL

## 📋 Validation Rules

### Frontend (Client-Side)
| Check | Rule | Message |
|-------|------|---------|
| File Type | image/* | "Please select an image file" |
| File Size | ≤ 5MB | "Image size must be less than 5MB" |

### Backend (Server-Side)
| Check | Rule | Message |
|-------|------|---------|
| File Valid | isValid() | "Invalid file upload." |
| File Type | JPEG, JPG, PNG, GIF, WebP | "Invalid file type. Only images allowed..." |
| File Size | ≤ 5MB | "File too large. Maximum size is 5MB." |
| Upload OK | path length > 3 | "File upload failed. Please try again." |

## 🐛 Troubleshooting

### Issue: "No photo file in request"

**Check**:
1. Is file selected? → Check `formData.avatar`
2. Is it a File object? → `formData.avatar instanceof File`
3. Is FormData correct? → Log `apiFormData.entries()`

**Solution**:
```typescript
// Add this before ApiService call
console.log('Avatar:', formData.avatar);
console.log('Is File?', formData.avatar instanceof File);
```

### Issue: "Invalid file type"

**Allowed Types**:
- JPEG (image/jpeg)
- JPG (image/jpg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

**Solution**: Use an image editor to convert file to JPEG or PNG

### Issue: "File too large"

**Limit**: 5MB (5,242,880 bytes)

**Solution**: 
1. Use image compression tool (TinyPNG, Squoosh)
2. Resize image (e.g., 1000x1000px)
3. Convert to optimized JPEG

### Issue: File uploads but avatar doesn't show

**Check**:
1. **File saved?**
   ```bash
   ls -lh /Applications/MAMP/htdocs/katogo/public/storage/images/
   ```

2. **Database updated?**
   Check `admin_users` table → `avatar` column

3. **Storage link exists?**
   ```bash
   cd /Applications/MAMP/htdocs/katogo
   php artisan storage:link
   ```

4. **Profile synced?**
   Check localStorage → `ugflix_user` → `avatar` field

## 📁 File Locations

### Backend
- **Controller**: `/Applications/MAMP/htdocs/katogo/app/Http/Controllers/ApiController.php`
- **Upload Handler**: `/Applications/MAMP/htdocs/katogo/app/Models/Utils.php` (file_upload method)
- **Uploads Folder**: `/Applications/MAMP/htdocs/katogo/public/storage/images/`
- **Logs**: `/Applications/MAMP/htdocs/katogo/storage/logs/laravel.log`

### Frontend
- **Upload Component**: `/Users/mac/Desktop/github/katogo-react/src/app/pages/account/ProfileEdit.tsx`
- **API Service**: `/Users/mac/Desktop/github/katogo-react/src/app/services/ApiService.ts`
- **HTTP Client**: `/Users/mac/Desktop/github/katogo-react/src/app/services/Api.ts`

### Documentation
- **Complete Guide**: `AVATAR_UPLOAD_FIX_COMPLETE.md`
- **Test Script**: `test-avatar-upload.sh`
- **This Reference**: `AVATAR_UPLOAD_QUICK_REFERENCE.md`

## 🎯 Expected Behavior

### User Flow
```
1. User clicks avatar preview
   ↓
2. File picker opens
   ↓
3. User selects image
   ↓
4. Frontend validates (type, size)
   ↓
5. Preview shows selected image
   ↓
6. User fills other fields
   ↓
7. User clicks "Save Profile"
   ↓
8. Frontend sends FormData with file
   ↓
9. Backend validates file
   ↓
10. Backend uploads to storage
    ↓
11. Backend saves path to database
    ↓
12. Profile synced (localStorage + Redux)
    ↓
13. User sees new avatar ✅
```

### Technical Flow
```typescript
// Frontend
FormData {
  temp_file_field: 'avatar',  // Which DB field to update
  photo: File,                // The actual file
  first_name: 'John',
  // ... other fields
}
↓
POST /api/User
↓
// Backend
$file = $request->file('photo')
$field = $request->temp_file_field  // 'avatar'
$path = Utils::file_upload($file)   // 'images/123_456.jpg'
$user->$field = $path               // $user->avatar = 'images/123_456.jpg'
$user->save()
↓
Response {
  code: 1,
  data: { avatar: 'images/123_456.jpg', ... }
}
↓
// Frontend
ProfileService.fetchAndSyncProfile()
→ localStorage updated
→ Redux updated
→ UI updated ✅
```

## ✅ Checklist

Before testing:
- [ ] Backend running (MAMP)
- [ ] Frontend running (npm start)
- [ ] Browser DevTools open (F12)
- [ ] Laravel logs monitoring
- [ ] Test image ready (< 5MB)

During test:
- [ ] Avatar preview shows selected image
- [ ] Console logs show FormData with file
- [ ] Laravel logs show file received
- [ ] Network tab shows 200 OK
- [ ] Profile page shows new avatar

After test:
- [ ] File exists in `/public/storage/images/`
- [ ] Database has avatar path
- [ ] localStorage has avatar URL
- [ ] Redux store has avatar URL
- [ ] Page refresh maintains avatar

## 🚀 Ready to Test!

Run this command to start testing:
```bash
cd /Users/mac/Desktop/github/katogo-react && ./test-avatar-upload.sh
```

**All code is complete and ready for testing! 🎉**
