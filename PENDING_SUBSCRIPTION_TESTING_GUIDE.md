# Pending Subscription Testing Guide

## Quick Test Instructions

### Test 1: View Pending Subscription Page
1. Navigate to: `http://localhost:5173/subscription/pending`
2. **Expected**: Page should load and either:
   - Show pending subscription details with 3 buttons, OR
   - Redirect to /subscription/plans (if no pending subscription)

### Test 2: Check Backend API
**Endpoint**: `GET http://localhost:8173/api/subscriptions/pending`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response**:
```json
{
  "code": 1,
  "status": 200,
  "data": {
    "has_pending": false,
    "pending_subscription": null
  }
}
```

### Test 3: Create Subscription & Test Flow
1. Go to: `http://localhost:5173/subscription/plans`
2. Click "Subscribe" on any plan
3. **Expected**: 
   - Payment opens in NEW TAB
   - You stay on platform, navigate to `/subscription/pending`
   - Pending page shows:
     - ⚠️ Warning banner (pulsing red)
     - Subscription details card
     - Instructions section
     - 3 buttons: Pay Now, Check Status, Cancel
     - Auto-check notice at bottom

### Test 4: Test Buttons

#### Button 1: Pay Now
- Click "Pay Now"
- **Expected**: Opens payment in new tab

#### Button 2: Check Status
- Click "Check Status"
- **Expected**: 
  - Button shows "Checking..." with spinner
  - Calls backend API
  - Shows alert with status

#### Button 3: Cancel
- Click "Cancel"
- **Expected**:
  - Shows confirmation modal
  - Click "Yes, Cancel"
  - Subscription canceled
  - Redirects to /subscription/plans

### Test 5: Auto-Checking
1. Stay on pending subscription page
2. Complete payment in the Pesapal tab
3. **Expected**:
   - Within 10 seconds, payment detected
   - Alert: "Payment successful! Your subscription is now active."
   - Redirects to /subscription/my-subscriptions

### Test 6: Duplicate Prevention
1. Have an active pending subscription
2. Try to access: `http://localhost:5173/subscription/plans`
3. **Expected**: Auto-redirects to `/subscription/pending`

## Troubleshooting

### Issue: Blank/Black Screen
**Cause**: Backend API not responding
**Fix**: Check backend server is running on port 8173

### Issue: "Failed to load pending subscription"
**Cause**: Backend endpoint not implemented or error
**Fix**: 
1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Verify routes are registered
3. Test API endpoint with Postman

### Issue: TypeScript Errors
**Cause**: Case sensitivity in status comparisons
**Fix**: Already fixed - 'Active' not 'active'

### Issue: Buttons Not Showing
**Cause**: CSS not loading
**Fix**: Check `PendingSubscription.css` is imported correctly

## Backend API Endpoints

### 1. Get Pending
```
GET /api/subscriptions/pending
Headers: Authorization: Bearer {token}
```

### 2. Initiate Payment
```
POST /api/subscriptions/{id}/initiate-payment
Headers: Authorization: Bearer {token}
Body: {}
```

### 3. Check Payment
```
POST /api/subscriptions/{id}/check-payment
Headers: Authorization: Bearer {token}
Body: {}
```

### 4. Cancel
```
POST /api/subscriptions/{id}/cancel
Headers: Authorization: Bearer {token}
Body: {}
```

## Expected UI

### Pending Subscription Page Layout
```
┌─────────────────────────────────────────────┐
│  UGFlix                           [Logout]  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ⚠️  Pending Subscription Payment            │
│     You have an unpaid subscription...      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🕐  Pending Subscription                    │
│                                             │
│  Plan: Premium Monthly                      │
│  Amount: UGX 10,000                         │
│  Status: ⏳ Pending Payment                 │
│  Order ID: ORDER-12345-ABCDE                │
│  Created: Oct 4, 2025 10:30 AM             │
│                                             │
│  What you need to do:                       │
│  1. Click "Pay Now" to complete payment     │
│  2. Complete payment in the new tab         │
│  3. Return here and click "Check Status"    │
│  4. Subscription activates immediately      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ✅ Pay Now                           │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  ✅ Check Payment Status              │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  ❌ Cancel Subscription               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  🔄 Automatically checking payment          │
│     status every 10 seconds...              │
└─────────────────────────────────────────────┘
```

## Success Criteria

- ✅ Pending page loads without errors
- ✅ All 3 buttons visible and clickable
- ✅ Warning banner shows with pulsing animation
- ✅ Subscription details display correctly
- ✅ Auto-checking notice shows at bottom
- ✅ Pay Now opens payment in new tab
- ✅ Check Status calls API and shows result
- ✅ Cancel shows confirmation modal
- ✅ Auto-detection works (redirects on payment success)
- ✅ Duplicate prevention works (redirects from plans if pending)

## Testing Checklist

### Frontend
- [ ] Navigate to /subscription/pending
- [ ] Page loads successfully (no black screen)
- [ ] Warning banner shows with correct styling
- [ ] Subscription details card displays
- [ ] All 3 buttons render correctly
- [ ] Auto-check notice displays
- [ ] Click "Pay Now" - opens new tab
- [ ] Click "Check Status" - shows loading, then alert
- [ ] Click "Cancel" - shows modal
- [ ] Confirm cancel - redirects to plans
- [ ] Dark theme styling correct (black, red, gold)

### Backend
- [ ] GET /subscriptions/pending returns 200
- [ ] POST /{id}/initiate-payment returns payment URL
- [ ] POST /{id}/check-payment queries Pesapal
- [ ] POST /{id}/cancel marks subscription as cancelled
- [ ] Authorization working (403 for other users)
- [ ] Authentication required (401 without token)

### Integration
- [ ] Create subscription from plans page
- [ ] Redirects to pending page
- [ ] Auto-checking starts
- [ ] Complete payment in Pesapal
- [ ] Auto-detection works within 10 seconds
- [ ] Redirects to my-subscriptions
- [ ] Subscription shown as Active

## Next Steps After Testing

1. ✅ Verify all features work
2. 📝 Document any bugs found
3. 🔧 Fix any issues
4. 🚀 Deploy to production
5. 📊 Monitor conversion rates
6. 🎉 Celebrate! 🎉
