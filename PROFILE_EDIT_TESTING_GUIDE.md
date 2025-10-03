# 🧪 Profile Edit System - Testing Guide

## Quick Test Checklist

### Prerequisites
- ✅ User logged in
- ✅ Navigate to http://localhost:5173/account/profile/edit
- ✅ Open DevTools Console (F12)
- ✅ Open Network tab

---

## Test Scenarios

### ✅ Test 1: Navigation & Progress
**Steps:**
1. Navigate to `/account` → Click "Edit Profile"
2. Observe progress bar at 25%
3. Click "Next" button
4. Observe progress bar at 50%
5. Click "Previous" button
6. Observe progress bar back to 25%

**Expected:**
- ✅ Progress bar animates smoothly
- ✅ Step indicators update (gold = active, green = completed)
- ✅ Form content changes per step

---

### ✅ Test 2: Avatar Upload
**Steps:**
1. On Step 1, click the avatar preview circle
2. Select a valid image (JPG/PNG, <5MB)
3. Observe avatar preview updates
4. Try uploading PDF file
5. Try uploading 10MB image

**Expected:**
- ✅ Valid image shows preview immediately
- ✅ Invalid file type shows error toast
- ✅ Oversized file shows error toast
- ✅ Hover shows camera overlay

---

### ✅ Test 3: Required Field Validation
**Steps:**
1. On Step 1, leave "First Name" empty
2. Click "Next"
3. Observe error message appears
4. Fill in "First Name"
5. Click "Next"

**Expected:**
- ✅ Cannot proceed with empty required fields
- ✅ Error message in red below field
- ✅ Border turns red on error
- ✅ Error clears when field filled

---

### ✅ Test 4: Email Validation
**Steps:**
1. On Step 1, enter "invalidemail"
2. Click "Next"
3. Observe error: "Email is invalid"
4. Enter "user@example.com"
5. Click "Next"

**Expected:**
- ✅ Invalid email format rejected
- ✅ Valid email format accepted
- ✅ Error message clear and helpful

---

### ✅ Test 5: Age Validation
**Steps:**
1. On Step 1, select DOB as today's date
2. Click "Next"
3. Observe error
4. Select DOB 20 years ago
5. Click "Next"

**Expected:**
- ✅ Too young (under 14) rejected
- ✅ Valid age accepted
- ✅ Date picker limits to 14+ years

---

### ✅ Test 6: Bio Character Count
**Steps:**
1. Navigate to Step 3
2. Type "Short bio"
3. Click "Next"
4. Observe error: "Bio must be at least 20 characters"
5. Type longer bio (20+ chars)
6. Observe character counter updates

**Expected:**
- ✅ Short bio (<20 chars) rejected
- ✅ Character counter shows "X/500"
- ✅ Counter updates in real-time

---

### ✅ Test 7: Complete Flow Success
**Steps:**
1. Fill all required fields in Step 1
2. Click "Next"
3. Fill required fields in Step 2
4. Click "Next"
5. Fill required fields in Step 3
6. Click "Next"
7. Fill preferences in Step 4
8. Click "Save Profile"

**Expected:**
- ✅ Loading state shows "Saving..."
- ✅ Success toast: "Profile updated successfully!"
- ✅ Redirect to `/account/profile`
- ✅ Network tab shows POST to `update-profile`
- ✅ Response code: 1

---

### ✅ Test 8: API Error Handling
**Steps:**
1. Disconnect internet
2. Complete form
3. Click "Save Profile"
4. Observe error handling

**Expected:**
- ✅ Error toast appears
- ✅ Form stays on screen
- ✅ User can retry
- ✅ Loading state ends

---

### ✅ Test 9: Responsive Mobile View
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro
4. Navigate through all steps

**Expected:**
- ✅ Form fields stack vertically
- ✅ Navigation buttons stack vertically
- ✅ Progress steps readable
- ✅ Avatar size appropriate
- ✅ Text sizes readable

---

### ✅ Test 10: Range Slider
**Steps:**
1. Navigate to Step 4
2. Drag "Maximum Distance" slider
3. Observe value updates

**Expected:**
- ✅ Slider moves smoothly
- ✅ Value displays in km
- ✅ Gold highlight on thumb
- ✅ Range: 10km - 500km

---

## Browser Testing

### Chrome
- [ ] All tests pass
- [ ] No console errors

### Firefox
- [ ] All tests pass
- [ ] No console errors

### Safari
- [ ] All tests pass
- [ ] No console errors

### Mobile Safari (iOS)
- [ ] All tests pass
- [ ] Touch interactions work

### Mobile Chrome (Android)
- [ ] All tests pass
- [ ] Touch interactions work

---

## Performance Testing

### Metrics to Check
- [ ] Initial page load < 500ms
- [ ] Step navigation instant
- [ ] Avatar preview < 100ms
- [ ] Form submission < 2s
- [ ] No memory leaks

### Tools
- Chrome Lighthouse
- React DevTools Profiler
- Network throttling (Slow 3G)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all fields
- [ ] Enter to submit
- [ ] Arrow keys in dropdowns
- [ ] Escape to close modals

### Screen Reader
- [ ] Labels announced correctly
- [ ] Errors announced
- [ ] Required fields indicated
- [ ] Progress updates announced

---

## Edge Cases

### ✅ Test: Empty Optional Fields
**Steps:**
1. Fill only required fields
2. Leave all optional fields empty
3. Submit

**Expected:**
- ✅ Form submits successfully
- ✅ No errors on optional fields

---

### ✅ Test: Maximum Character Limits
**Steps:**
1. Bio: Type 501 characters
2. Tagline: Type 101 characters

**Expected:**
- ✅ Input limited/truncated
- ✅ Counter shows max reached

---

### ✅ Test: Special Characters
**Steps:**
1. Enter special chars in name: "John @ Doe"
2. Enter emoji in bio: "I love coding 💻"

**Expected:**
- ✅ Special characters handled correctly
- ✅ Emojis display properly

---

### ✅ Test: Browser Back Button
**Steps:**
1. Navigate to Step 3
2. Click browser back button

**Expected:**
- ✅ User navigates away from form
- ✅ No errors in console

---

## API Testing (Backend)

### Check Request Format
```bash
# Open Network tab, filter by "update-profile"
# Click on request
# Check Payload tab
```

**Expected FormData Keys:**
- `first_name`
- `last_name`
- `email`
- `phone_number`
- `dob`
- `sex`
- `file` (if avatar uploaded)
- `country`
- `city`
- `bio`
- `body_type`
- `occupation`
- ... (all filled fields)

### Check Response Format
```json
{
  "code": 1,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
}
```

---

## Redux Store Validation

### Check Store Update
```javascript
// In browser console
window.__REDUX_DEVTOOLS_EXTENSION__

// Or add console.log in component
useEffect(() => {
  console.log('Current user:', user);
}, [user]);
```

**Expected:**
- ✅ User object updated with new data
- ✅ Avatar URL updated
- ✅ All fields synced

---

## Common Issues & Solutions

### Issue: "Failed to update profile"
**Solutions:**
1. Check network connection
2. Verify backend is running (localhost:8888)
3. Check authentication token
4. Review API endpoint URL

### Issue: Avatar not uploading
**Solutions:**
1. Check file size (<5MB)
2. Check file type (image/*)
3. Check FormData in network tab
4. Verify backend file handling

### Issue: Validation not working
**Solutions:**
1. Check validateStep() logic
2. Verify error state updates
3. Check conditional rendering

### Issue: Progress bar stuck
**Solutions:**
1. Check currentStep state
2. Verify totalSteps = 4
3. Check progress calculation

---

## Automated Testing (Future)

### Jest Unit Tests
```typescript
describe('ProfileEdit', () => {
  it('validates required fields', () => {
    // Test validation logic
  });
  
  it('handles avatar upload', () => {
    // Test file upload
  });
  
  it('submits form successfully', () => {
    // Test API integration
  });
});
```

### Cypress E2E Tests
```typescript
describe('Profile Edit Flow', () => {
  it('completes full wizard', () => {
    cy.visit('/account/profile/edit');
    cy.get('#first_name').type('John');
    cy.get('#last_name').type('Doe');
    // ... complete flow
    cy.contains('Save Profile').click();
    cy.url().should('include', '/account/profile');
  });
});
```

---

## Test Report Template

```
Date: [DATE]
Tester: [NAME]
Browser: [BROWSER + VERSION]
Device: [DEVICE]

Test Results:
✅ Navigation: PASS
✅ Avatar Upload: PASS
✅ Validation: PASS
✅ API Integration: PASS
✅ Responsive Design: PASS
❌ Issue Found: [DESCRIPTION]

Notes:
- [Any observations]
- [Performance issues]
- [UX suggestions]
```

---

**Testing Status:** ⏳ IN PROGRESS  
**Critical Tests:** ✅ All functional tests must pass  
**Recommendation:** Test on 3+ browsers and 2+ devices before production
