# Pending Subscription Management - Backend API Specification

## Overview
This document specifies the backend API endpoints required for the pending subscription management system. This feature prevents payment loss and improves the subscription journey by allowing users to track and complete pending payments.

---

## Critical Requirements

### 1. Payment Flow
- When user clicks "Subscribe" on a plan → Create subscription with status "Pending"
- Open payment in new tab (frontend handles this)
- User stays on pending subscription page
- Auto-check payment status every 10 seconds
- Manual check via "Check Payment Status" button
- Activate subscription immediately upon successful payment

### 2. Data Integrity
- **NO duplicate subscriptions**: User cannot have multiple pending subscriptions
- **NO payment loss**: All transactions tracked until completion or cancellation
- **Accurate status**: Real-time synchronization with Pesapal payment status
- **Atomic operations**: Payment verification and subscription activation must be atomic

---

## API Endpoints

### 1. Get Pending Subscription
**Endpoint**: `GET /api/subscriptions/pending`

**Description**: Check if the authenticated user has any pending (unpaid) subscription.

**Authentication**: Required (Bearer token)

**Response Success (200)**:
```json
{
  "success": true,
  "has_pending": true,
  "pending_subscription": {
    "id": 123,
    "user_id": 456,
    "plan": {
      "id": 1,
      "name": "Premium Monthly",
      "currency": "UGX",
      "price": 10000,
      "duration_days": 30
    },
    "amount": 10000,
    "currency": "UGX",
    "status": "Pending",
    "payment_status": "Pending",
    "order_tracking_id": "ORDER-12345-ABCDE",
    "merchant_reference": "UGFLIX-SUB-123",
    "payment_url": "https://pesapal.com/pay/...",
    "created_at": "2025-10-04T10:30:00Z",
    "expires_at": "2025-10-04T22:30:00Z"
  }
}
```

**Response No Pending (200)**:
```json
{
  "success": true,
  "has_pending": false,
  "pending_subscription": null
}
```

**Business Logic**:
1. Query subscriptions table for user's subscriptions with:
   - `status = 'Pending'`
   - `payment_status IN ('Pending', 'Processing')`
   - Order by `created_at DESC`
   - Return the most recent one
2. Include plan details (JOIN with subscription_plans table)
3. Include payment_url if Pesapal order was initiated

**Database Query Example**:
```sql
SELECT s.*, sp.*
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.user_id = ? 
  AND s.status = 'Pending'
  AND s.payment_status IN ('Pending', 'Processing')
ORDER BY s.created_at DESC
LIMIT 1
```

---

### 2. Initiate Pending Payment
**Endpoint**: `POST /api/subscriptions/{subscription_id}/initiate-payment`

**Description**: Initialize or re-initialize Pesapal payment for a pending subscription.

**Authentication**: Required (Bearer token)

**Path Parameters**:
- `subscription_id`: Integer (the pending subscription ID)

**Request Body**: Empty `{}`

**Response Success (200)**:
```json
{
  "success": true,
  "subscription_id": 123,
  "order_tracking_id": "ORDER-12345-ABCDE",
  "merchant_reference": "UGFLIX-SUB-123",
  "redirect_url": "https://pesapal.com/pay/...",
  "amount": 10000,
  "currency": "UGX"
}
```

**Business Logic**:
1. Verify subscription belongs to authenticated user
2. Verify subscription status is "Pending"
3. Check if Pesapal order already exists:
   - If yes: Return existing payment URL
   - If no: Create new Pesapal order
4. Update subscription with order details
5. Return payment URL

**Security**:
- Must verify `subscription.user_id === authenticated_user_id`
- Only allow for subscriptions with status "Pending"

**Pesapal Integration**:
- Call Pesapal API to submit order
- Store `order_tracking_id` in subscription record
- Set `payment_url` for future reference

---

### 3. Check Pending Payment Status
**Endpoint**: `POST /api/subscriptions/{subscription_id}/check-payment`

**Description**: Query Pesapal API to verify payment status and update subscription accordingly.

**Authentication**: Required (Bearer token)

**Path Parameters**:
- `subscription_id`: Integer (the pending subscription ID)

**Request Body**: Empty `{}`

**Response Success - Payment Completed (200)**:
```json
{
  "success": true,
  "status": "Active",
  "payment_status": "Completed",
  "subscription": {
    "id": 123,
    "status": "Active",
    "payment_status": "Completed",
    "start_date": "2025-10-04T10:45:00Z",
    "end_date": "2025-11-03T10:45:00Z",
    "days_remaining": 30,
    "is_active": true
  },
  "message": "Payment successful! Subscription activated."
}
```

**Response Still Pending (200)**:
```json
{
  "success": true,
  "status": "Pending",
  "payment_status": "Pending",
  "message": "Payment is still pending. Please complete the payment."
}
```

**Response Payment Failed (200)**:
```json
{
  "success": true,
  "status": "Failed",
  "payment_status": "Failed",
  "message": "Payment failed. Please try again."
}
```

**Business Logic - CRITICAL**:
1. Verify subscription belongs to authenticated user
2. Verify subscription has `order_tracking_id`
3. **Query Pesapal API** with order tracking ID
4. **Based on Pesapal response**:
   
   **If Payment Successful**:
   - Update subscription:
     ```sql
     UPDATE subscriptions SET
       status = 'Active',
       payment_status = 'Completed',
       start_date = NOW(),
       end_date = DATE_ADD(NOW(), INTERVAL plan.duration_days DAY),
       payment_confirmed_at = NOW()
     WHERE id = subscription_id
     ```
   - Create subscription activation record
   - Send confirmation email (optional but recommended)
   - Return active subscription details
   
   **If Payment Failed**:
   - Update subscription:
     ```sql
     UPDATE subscriptions SET
       status = 'Failed',
       payment_status = 'Failed',
       failed_at = NOW()
     WHERE id = subscription_id
     ```
   - Return failure message
   
   **If Payment Still Pending**:
   - No database update needed
   - Return pending message

5. **Transaction**: Wrap status update in database transaction

**Pesapal API Call**:
```php
// Example Pesapal status check
$pesapal = new PesapalService();
$status = $pesapal->getTransactionStatus($order_tracking_id);

if ($status->payment_status === 'COMPLETED') {
    // Activate subscription
} elseif ($status->payment_status === 'FAILED') {
    // Mark as failed
} else {
    // Still pending
}
```

**Security**:
- Rate limiting: Max 10 checks per minute per user
- Must verify subscription ownership
- Idempotent: Multiple checks should not create duplicate activations

---

### 4. Cancel Pending Subscription
**Endpoint**: `POST /api/subscriptions/{subscription_id}/cancel`

**Description**: Cancel a pending subscription that hasn't been paid yet.

**Authentication**: Required (Bearer token)

**Path Parameters**:
- `subscription_id`: Integer (the pending subscription ID)

**Request Body**: Empty `{}`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Subscription canceled successfully."
}
```

**Business Logic**:
1. Verify subscription belongs to authenticated user
2. Verify subscription status is "Pending"
3. Update subscription:
   ```sql
   UPDATE subscriptions SET
     status = 'Cancelled',
     cancelled_at = NOW(),
     cancelled_reason = 'User cancelled pending subscription'
   WHERE id = subscription_id
   ```
4. Optionally notify Pesapal to cancel the order
5. Return success message

**Security**:
- Only allow cancellation of "Pending" subscriptions
- Must verify subscription ownership
- Cannot cancel active or completed subscriptions

---

## Database Schema Updates

### Subscriptions Table
Ensure the `subscriptions` table has these columns:

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  
  -- Status fields
  status ENUM('Pending', 'Active', 'Expired', 'Cancelled', 'Failed') DEFAULT 'Pending',
  payment_status ENUM('Pending', 'Processing', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
  
  -- Payment tracking
  order_tracking_id VARCHAR(255) NULL,
  merchant_reference VARCHAR(255) NULL,
  payment_url TEXT NULL,
  payment_method VARCHAR(50) NULL,
  
  -- Dates
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  grace_period_end DATETIME NULL,
  payment_confirmed_at DATETIME NULL,
  failed_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  
  -- Amounts
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'UGX',
  
  -- Other
  cancelled_reason TEXT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  is_extension BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_status (user_id, status),
  INDEX idx_order_tracking (order_tracking_id),
  INDEX idx_payment_status (payment_status),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Important Indexes
```sql
-- Find pending subscriptions efficiently
CREATE INDEX idx_pending_subscriptions 
ON subscriptions (user_id, status, payment_status);

-- Check for duplicates
CREATE UNIQUE INDEX idx_user_pending 
ON subscriptions (user_id) 
WHERE status = 'Pending';
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required."
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "This subscription does not belong to you."
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Subscription not found."
}
```

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Subscription is not in pending status."
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Failed to process request. Please try again."
}
```

---

## Security Considerations

### 1. Authorization
- **Always verify** `subscription.user_id === authenticated_user_id`
- Use middleware to check authentication before any subscription operation

### 2. Rate Limiting
- Payment status checks: Max 10 per minute per user
- Payment initiation: Max 5 per hour per user
- Cancellation: Max 3 per hour per user

### 3. Idempotency
- Multiple status checks should not duplicate subscription activation
- Use database transactions for critical operations
- Check current subscription status before activation

### 4. Data Integrity
- **Prevent duplicate pending subscriptions**: User should have max 1 pending subscription
- Use database constraints or application-level checks
- Lock rows during critical updates:
  ```sql
  SELECT * FROM subscriptions WHERE id = ? FOR UPDATE
  ```

---

## Testing Checklist

### Manual Testing
- [ ] Create subscription → Check pending subscription page appears
- [ ] Complete payment in new tab → Verify auto-detection works
- [ ] Click "Check Status" → Verify manual check works
- [ ] Cancel pending subscription → Verify cancellation works
- [ ] Try creating 2nd subscription while one pending → Should redirect to pending page
- [ ] Complete payment → Verify subscription activates with correct start/end dates

### API Testing
- [ ] Test GET /api/subscriptions/pending with no pending subscription
- [ ] Test GET /api/subscriptions/pending with pending subscription
- [ ] Test POST initiate-payment with valid subscription
- [ ] Test POST initiate-payment with already initiated payment
- [ ] Test POST check-payment before payment completion
- [ ] Test POST check-payment after successful payment
- [ ] Test POST check-payment after failed payment
- [ ] Test POST cancel with pending subscription
- [ ] Test POST cancel with active subscription (should fail)

### Security Testing
- [ ] Try to check/cancel another user's subscription (should fail)
- [ ] Test rate limiting on status checks
- [ ] Test concurrent payment checks (prevent race conditions)
- [ ] Test duplicate subscription prevention

---

## Frontend Integration Notes

### LocalStorage Keys Used
```typescript
// After creating subscription
localStorage.setItem('pending_subscription_check', JSON.stringify({
  subscription_id: 123,
  order_tracking_id: 'ORDER-12345',
  started_at: '2025-10-04T10:30:00Z'
}));

// After successful payment or cancellation
localStorage.removeItem('pending_subscription_check');
```

### Polling Strategy
- Check payment status every 10 seconds automatically
- Stop after 10 minutes (600 seconds)
- Manual check available anytime
- Show visual indicator during auto-checking

### User Flow
1. Select plan → Create subscription → Open payment in new tab
2. Redirect to `/subscription/pending`
3. Show pending subscription details
4. Auto-check every 10 seconds
5. On success: Alert + redirect to `/subscription/my-subscriptions`
6. On failure: Show error + allow retry or cancel

---

## Implementation Priority

### Phase 1: Core Functionality (Required)
1. ✅ GET /api/subscriptions/pending
2. ✅ POST /api/subscriptions/{id}/initiate-payment
3. ✅ POST /api/subscriptions/{id}/check-payment
4. ✅ POST /api/subscriptions/{id}/cancel

### Phase 2: Enhancements (Recommended)
- Email notification on payment success
- SMS notification (optional)
- Webhook from Pesapal for instant updates
- Analytics tracking for pending → completed conversion rate

### Phase 3: Advanced (Optional)
- Auto-expire pending subscriptions after 12 hours
- Reminder emails for incomplete payments
- Discount codes for failed attempts
- Admin dashboard for pending subscription monitoring

---

## Support & Troubleshooting

### Common Issues

**Issue**: Payment completed but subscription not activated
- **Check**: Pesapal webhook received?
- **Check**: Order tracking ID matches in database?
- **Fix**: Call check-payment endpoint manually

**Issue**: User has duplicate pending subscriptions
- **Check**: Database constraints on pending subscriptions
- **Fix**: Add unique constraint or application-level check

**Issue**: Payment URL expired
- **Check**: Pesapal URL validity period (usually 24 hours)
- **Fix**: Call initiate-payment to generate new URL

---

## Contact
For questions or issues with backend implementation, contact the development team.

**Last Updated**: October 4, 2025
**Version**: 1.0
