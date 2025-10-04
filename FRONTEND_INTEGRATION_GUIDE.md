# Frontend Integration Guide

## Overview
This guide explains how to integrate the subscription system into your React application's routing and components.

## Created Frontend Components

### Pages
1. **SubscriptionPlans.tsx** - Plan selection page (`/subscription/plans`)
2. **PaymentResult.tsx** - Payment callback handler (`/subscription/callback`)
3. **SubscriptionHistory.tsx** - Subscription history (`/subscription/history`)

### Components
1. **SubscriptionWidget.tsx** - Dashboard widget to show subscription status
2. **WhatsAppButton.tsx** - Floating WhatsApp support button

### Services
1. **SubscriptionService.ts** - Complete API integration service

---

## Step 1: Add Routes to Your Router

Add these routes to your React router configuration file (usually `App.tsx` or `routes.tsx`):

```typescript
import SubscriptionPlans from './app/pages/SubscriptionPlans';
import PaymentResult from './app/pages/PaymentResult';
import SubscriptionHistory from './app/pages/SubscriptionHistory';

// Inside your Routes component:
<Routes>
  {/* Public Routes */}
  <Route path="/subscription/plans" element={<SubscriptionPlans />} />
  
  {/* Payment Callback - No auth required (Pesapal redirects here) */}
  <Route path="/subscription/callback" element={<PaymentResult />} />
  
  {/* Protected Routes (require authentication) */}
  <Route element={<ProtectedRoute />}>
    <Route path="/subscription/history" element={<SubscriptionHistory />} />
    <Route path="/dashboard" element={<Dashboard />} />
    {/* Other protected routes */}
  </Route>
</Routes>
```

---

## Step 2: Add Subscription Widget to Dashboard

In your dashboard component, import and add the SubscriptionWidget:

```typescript
import SubscriptionWidget from '../components/subscription/SubscriptionWidget';

function Dashboard() {
  return (
    <div className="dashboard">
      {/* Add subscription widget at the top */}
      <SubscriptionWidget />
      
      {/* Other dashboard content */}
      <div className="dashboard-content">
        {/* Your existing dashboard content */}
      </div>
    </div>
  );
}
```

---

## Step 3: Add WhatsApp Button to Key Pages

Add the WhatsApp support button to pages where users might need help:

```typescript
import WhatsAppButton from '../components/WhatsAppButton';

function YourPage() {
  return (
    <div>
      {/* Your page content */}
      
      {/* Add WhatsApp button (it's fixed position, so placement doesn't matter) */}
      <WhatsAppButton />
    </div>
  );
}
```

The WhatsApp button is already configured with the number: **+1 (647) 968-6445**

---

## Step 4: Implement Subscription Enforcement

### Option A: Route-Level Protection (Recommended)

Create a subscription-protected route wrapper:

```typescript
// components/SubscriptionRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import SubscriptionService from '../services/SubscriptionService';
import { useEffect, useState } from 'react';

function SubscriptionRoute({ children }) {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const status = await SubscriptionService.getMySubscription();
      setHasSubscription(status.has_active_subscription);
    } catch (error) {
      setHasSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Checking subscription...</div>;
  }

  if (!hasSubscription) {
    return <Navigate to="/subscription/plans" state={{ from: location }} replace />;
  }

  return children;
}

// Usage in routes:
<Route element={<SubscriptionRoute><ProtectedRoute /></SubscriptionRoute>}>
  <Route path="/movies/:id" element={<MoviePage />} />
  <Route path="/watchlist" element={<Watchlist />} />
</Route>
```

### Option B: API Interceptor (Automatic)

Add subscription check to your API service interceptor:

```typescript
// In ApiService.ts or similar
import SubscriptionService from './SubscriptionService';

// Add response interceptor
axios.interceptors.response.use(
  response => response,
  async error => {
    // Check if error is subscription-related (403 with subscription flag)
    if (error.response?.status === 403 && 
        error.response?.data?.data?.require_subscription) {
      
      // Clear cached subscription status
      SubscriptionService.clearCache();
      
      // Redirect to subscription plans
      window.location.href = '/subscription/plans';
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);
```

---

## Step 5: Add Subscription Status to Navigation

Show subscription status in your navigation/header:

```typescript
import { useEffect, useState } from 'react';
import SubscriptionService from '../services/SubscriptionService';

function Navigation() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await SubscriptionService.getMySubscription();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to load subscription status');
    }
  };

  return (
    <nav>
      {/* Other nav items */}
      
      {subscriptionStatus && !subscriptionStatus.has_active_subscription && (
        <a href="/subscription/plans" className="subscribe-now-btn">
          Subscribe Now
        </a>
      )}
      
      {subscriptionStatus?.has_active_subscription && (
        <div className="subscription-indicator">
          <span>Active</span>
          <span className="days-left">{subscriptionStatus.days_remaining} days</span>
        </div>
      )}
    </nav>
  );
}
```

---

## Step 6: Handle Movie/Video Access

Before playing a video, check subscription status:

```typescript
async function playVideo(movieId: number) {
  try {
    // Check subscription status
    const hasSubscription = await SubscriptionService.hasActiveSubscription();
    
    if (!hasSubscription) {
      // Show subscription required modal or redirect
      showSubscriptionRequiredModal();
      // or
      window.location.href = '/subscription/plans';
      return;
    }
    
    // Play video
    startVideoPlayback(movieId);
    
  } catch (error) {
    console.error('Error checking subscription:', error);
  }
}
```

---

## Backend Middleware Usage

The backend middleware is already registered and can be used in routes:

### Laravel Routes (routes/api.php)

```php
// Add 'subscription' middleware to protected routes
Route::middleware([JwtMiddleware::class, 'subscription'])->group(function () {
    // These routes require active subscription
    Route::get('movies/{id}/stream', [MovieController::class, 'stream']);
    Route::get('movies/{id}/download', [MovieController::class, 'download']);
    Route::post('watchlist/add', [WatchlistController::class, 'add']);
});
```

The middleware will automatically:
- Check if user has active subscription
- Return 403 with subscription details if no subscription
- Allow access if subscription is active

---

## Testing Checklist

### Frontend Tests
- [ ] Navigate to `/subscription/plans` - Should show 3 plans
- [ ] Language switcher works (English, Luganda, Swahili)
- [ ] Click "Subscribe Now" - Should create subscription and redirect to Pesapal
- [ ] After payment, callback page should show success/failure
- [ ] Dashboard shows subscription widget with correct status
- [ ] Subscription history page shows past subscriptions
- [ ] WhatsApp button appears and opens WhatsApp chat

### Backend Tests
- [ ] Access protected route without subscription - Should return 403
- [ ] Access protected route with active subscription - Should work
- [ ] Access protected route in grace period - Should work (if enabled)
- [ ] Payment callback updates subscription status correctly
- [ ] IPN notification updates subscription status

### Integration Tests
- [ ] Complete subscription flow: Select plan → Pay → Activate
- [ ] Try to access content without subscription - Should be blocked
- [ ] Subscribe and access content - Should work
- [ ] Let subscription expire - Should enter grace period
- [ ] After grace period - Should be blocked again
- [ ] Extend/renew subscription - Should add days to existing subscription

---

## Environment Variables

Ensure these are set in your `.env` file:

```env
# Pesapal Configuration
PESAPAL_CONSUMER_KEY=your_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_consumer_secret_here
PESAPAL_PRODUCTION_URL=https://pay.pesapal.com/v3
PESAPAL_IPN_URL=https://yourdomain.com/api/subscriptions/pesapal/ipn
PESAPAL_CALLBACK_URL=https://yourdomain.com/api/subscriptions/pesapal/callback
```

---

## Scheduled Commands

The following commands are scheduled to run automatically:

1. **Check Expired Subscriptions** (Daily at midnight)
   ```bash
   php artisan subscriptions:check-expired
   ```

2. **Send Expiry Notifications** (Daily at 9 AM)
   ```bash
   php artisan subscriptions:send-expiry-notifications --days=3
   ```

3. **Check Pending Payments** (Hourly)
   ```bash
   php artisan subscriptions:check-pending-payments --age=15 --limit=50
   ```

To run manually:
```bash
php artisan schedule:run
```

Or set up cron job:
```cron
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## API Endpoints Reference

### Public Endpoints
- `GET /api/subscription-plans?lang={en|lg|sw}` - List all plans
- `GET /api/subscriptions/pesapal/callback?...` - Pesapal payment callback
- `POST /api/subscriptions/pesapal/ipn` - Pesapal IPN notification

### Authenticated Endpoints (Require JWT)
- `POST /api/subscriptions/create` - Create new subscription
  ```json
  {
    "plan_id": 1,
    "callback_url": "https://yoursite.com/subscription/callback"
  }
  ```

- `GET /api/subscriptions/my-subscription` - Get current subscription status

- `GET /api/subscriptions/history?limit=20` - Get subscription history

- `POST /api/subscriptions/retry-payment` - Retry failed payment
  ```json
  {
    "subscription_id": 123
  }
  ```

- `POST /api/subscriptions/check-status` - Manually check payment status
  ```json
  {
    "order_tracking_id": "abc123",
    "merchant_reference": "SUB-1-1234567890"
  }
  ```

---

## Troubleshooting

### Subscription Not Activating After Payment
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check if IPN callback was received
3. Manually check payment status:
   ```bash
   php artisan tinker
   $service = new \App\Services\SubscriptionPesapalService();
   $status = $service->getTransactionStatus('ORDER_TRACKING_ID');
   ```

### Frontend Can't Load Subscription Status
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check JWT token is valid
4. Clear localStorage cache:
   ```javascript
   SubscriptionService.clearCache();
   ```

### Middleware Blocking Access Incorrectly
1. Check user's subscription status in database
2. Verify grace_period_end is set correctly
3. Test with different grace period settings:
   ```php
   // In route definition
   ->middleware('subscription:false') // Don't allow grace period
   ->middleware('subscription:true')  // Allow grace period (default)
   ```

---

## Next Steps

1. **Add to Router** - Integrate subscription routes
2. **Add Widget** - Place SubscriptionWidget in dashboard
3. **Add Protection** - Implement subscription checks on protected routes
4. **Test Flow** - Complete end-to-end subscription test
5. **Configure Cron** - Set up scheduled commands
6. **Monitor Logs** - Watch for any payment or subscription issues

---

## Support

For issues or questions:
- WhatsApp: +1 (647) 968-6445
- Check logs: `storage/logs/laravel.log`
- Review planning doc: `SUBSCRIPTION_SYSTEM_PLAN.md`
