# Authentication Debug Guide

## The Issue
1. **"No authentication token received from server"** - Login response doesn't contain expected token field
2. **"User not found"** - API calls fail because no authenticated user data

## Debug Tools Available

Open browser console and use these commands:

### 1. Check Current Auth Status
```javascript
debugAuth()
```

### 2. Test Raw Login API Response
```javascript
debugLogin("your-email@example.com", "your-password")
```

### 3. Manual Authentication (if needed)
```javascript
manualAuth("your-email@example.com", "your-password")
```

### 4. Test Login Function
```javascript
testLogin("your-email@example.com", "your-password")
```

## Steps to Debug

1. **First, check what the login API actually returns:**
   ```javascript
   debugLogin("your-email", "your-password")
   ```
   This will show you the exact API response structure.

2. **Look for the token field:**
   The response should contain one of:
   - `remember_token`
   - `token` 
   - `access_token`

3. **If token exists but login still fails:**
   Try manual authentication:
   ```javascript
   manualAuth("your-email", "your-password")
   ```

4. **Verify auth status after successful login:**
   ```javascript
   debugAuth()
   ```
   Should show token and user info.

5. **Test order submission:**
   Only after successful authentication, try the checkout flow.

## Expected Response Format

The login API should return:
```json
{
  "code": 1,
  "message": "success",
  "data": {
    "id": 123,
    "name": "User Name",
    "email": "user@example.com",
    "remember_token": "abc123..." // or "token" or "access_token"
  }
}
```

## Common Issues

- **Token field name mismatch**: API returns `token` but code expects `remember_token`
- **Missing user ID**: User data doesn't contain `id` field
- **Invalid token format**: Token too short or empty
- **API response format**: Response structure doesn't match expected format
