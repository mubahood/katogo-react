# Centralized Subscription Checking System

## ⚠️ CRITICAL RULES

### 1. SINGLE SOURCE OF TRUTH
**NEVER check subscription status manually. ALWAYS use the centralized system.**

```typescript
// ❌ WRONG - Don't do this
const subscription = localStorage.getItem('subscription');
if (subscription?.status === 'active') { ... }

// ❌ WRONG - Don't do this
const hasSubscription = user?.has_active_subscription;
if (hasSubscription) { ... }

// ✅ CORRECT - Use centralized checker
const { hasActiveSubscription } = useSubscription();
if (hasActiveSubscription) { ... }
```

### 2. ALWAYS WAIT FOR LOADING
**NEVER check subscription status while loading is true.**

```typescript
// ❌ WRONG - Checking while loading
const { hasActiveSubscription } = useSubscription();
if (hasActiveSubscription) { ... }  // Might be wrong if loading

// ✅ CORRECT - Wait for loading
const { hasActiveSubscription, isLoading } = useSubscription();
if (isLoading) return <Loading />;
if (hasActiveSubscription) { ... }
```

### 3. USE GUARD HOOK FOR PROTECTED ROUTES
**Protected routes should use useSubscriptionGuard().**

```typescript
// ❌ WRONG - Manual redirect logic
const { hasActiveSubscription } = useSubscription();
if (!hasActiveSubscription) {
  window.location.href = '/subscription';
}

// ✅ CORRECT - Use guard hook
const { hasActiveSubscription, isLoading } = useSubscriptionGuard();
// Automatically redirects if no subscription
```

---

## 📚 Usage Guide

### Basic Usage in Components

```typescript
import { useSubscription } from '@/app/hooks/useSubscription';

function MyComponent() {
  const { hasActiveSubscription, isLoading, subscriptionDetails } = useSubscription();

  // ALWAYS handle loading state
  if (isLoading) {
    return <div>Loading subscription...</div>;
  }

  // Check subscription status
  if (!hasActiveSubscription) {
    return <div>Subscription required</div>;
  }

  // Show subscription details
  return (
    <div>
      <p>Status: {subscriptionDetails?.subscription_status}</p>
      <p>Days Remaining: {subscriptionDetails?.days_remaining}</p>
    </div>
  );
}
```

### Protected Routes/Components

```typescript
import { useSubscriptionGuard } from '@/app/hooks/useSubscription';

function ProtectedVideo() {
  // Automatically redirects if no subscription
  const { hasActiveSubscription, isLoading } = useSubscriptionGuard();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // At this point, we know user has active subscription
  return <VideoPlayer />;
}
```

### Manual Access Control

```typescript
import { SubscriptionChecker } from '@/app/services/SubscriptionChecker';

async function playVideo(videoId: string) {
  // Check access before playing
  const hasAccess = await SubscriptionChecker.checkAccessAndRedirect();
  
  if (!hasAccess) {
    return; // User was redirected
  }

  // User has access, play video
  startVideoPlayback(videoId);
}
```

### Subscription Status Display

```typescript
import { useSubscription } from '@/app/hooks/useSubscription';

function SubscriptionBadge() {
  const { 
    hasActiveSubscription, 
    isLoading,
    isExpiringSoon,
    isInGracePeriod,
    daysRemaining,
    status 
  } = useSubscription();

  if (isLoading) return null;

  if (isInGracePeriod) {
    return (
      <div className="badge grace-period">
        Grace Period - {daysRemaining} days remaining
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="badge expiring">
        Expiring Soon - {daysRemaining} days remaining
      </div>
    );
  }

  if (hasActiveSubscription) {
    return (
      <div className="badge active">
        Active - {daysRemaining} days remaining
      </div>
    );
  }

  return (
    <div className="badge inactive">
      No Active Subscription
    </div>
  );
}
```

### After Payment Success

```typescript
import { SubscriptionChecker } from '@/app/services/SubscriptionChecker';

function PaymentResult() {
  const handlePaymentSuccess = async () => {
    console.log('Payment successful, refreshing subscription data');
    
    // Clear cache and refresh from server
    await SubscriptionChecker.refresh();
    
    // Check new subscription status
    const hasAccess = await SubscriptionChecker.hasActiveSubscription();
    
    if (hasAccess) {
      console.log('Subscription activated successfully');
      navigate('/dashboard');
    }
  };

  return <div>Processing payment...</div>;
}
```

### Checking Before Expensive Operations

```typescript
import { SubscriptionChecker } from '@/app/services/SubscriptionChecker';

async function downloadVideo(videoId: string) {
  // Check access before starting download
  const hasAccess = await SubscriptionChecker.hasActiveSubscription();
  
  if (!hasAccess) {
    toast.error('Subscription required to download videos');
    SubscriptionChecker.redirectToSubscription('Download requires subscription');
    return;
  }

  // User has access, start download
  startDownload(videoId);
}
```

---

## 🔧 API Reference

### SubscriptionChecker Service

```typescript
import { SubscriptionChecker } from '@/app/services/SubscriptionChecker';

// Check if user has active subscription
const hasAccess = await SubscriptionChecker.hasActiveSubscription();

// Get full subscription details
const details = await SubscriptionChecker.getSubscriptionDetails();

// Check if subscription is expiring soon (within 7 days by default)
const expiring = await SubscriptionChecker.isExpiringSoon(7);

// Check if user is in grace period
const inGrace = await SubscriptionChecker.isInGracePeriod();

// Redirect to subscription plans page
SubscriptionChecker.redirectToSubscription('Reason for redirect');

// Clear cached manifest (after subscription changes)
SubscriptionChecker.clearCache();

// Force refresh from server
await SubscriptionChecker.refresh();

// Guard function with auto-redirect
const hasAccess = await SubscriptionChecker.checkAccessAndRedirect(true);
```

### useSubscription Hook

```typescript
import { useSubscription } from '@/app/hooks/useSubscription';

const {
  hasActiveSubscription,  // true if user has active subscription
  isLoading,              // true while fetching from server
  error,                  // error message if fetch failed
  subscriptionDetails,    // full subscription details from manifest
  isExpiringSoon,         // true if expiring within 7 days
  isInGracePeriod,        // true if in grace period
  daysRemaining,          // days remaining in subscription
  hoursRemaining,         // hours remaining in subscription
  status,                 // subscription status (Active, Expired, etc.)
  refresh,                // force refresh from server
  redirectToSubscription, // redirect to subscription page
} = useSubscription();
```

### useSubscriptionGuard Hook

```typescript
import { useSubscriptionGuard } from '@/app/hooks/useSubscription';

// Automatically redirects if no subscription
const { hasActiveSubscription, isLoading } = useSubscriptionGuard();
```

---

## 🎯 Common Patterns

### Pattern 1: Protected Route Component

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasActiveSubscription, isLoading } = useSubscriptionGuard();

  if (isLoading) {
    return <FullPageLoading />;
  }

  // If we reach here, user has subscription (guard redirected if not)
  return <>{children}</>;
}
```

### Pattern 2: Conditional Feature Access

```typescript
function VideoCard({ video }: { video: Video }) {
  const { hasActiveSubscription, isLoading } = useSubscription();

  const handlePlay = async () => {
    if (isLoading) {
      toast.info('Loading subscription status...');
      return;
    }

    if (!hasActiveSubscription) {
      toast.error('Subscription required');
      SubscriptionChecker.redirectToSubscription('Video playback requires subscription');
      return;
    }

    // Play video
    playVideo(video.id);
  };

  return (
    <div>
      <img src={video.thumbnail} />
      <button onClick={handlePlay} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Play'}
      </button>
    </div>
  );
}
```

### Pattern 3: Subscription Status Banner

```typescript
function SubscriptionBanner() {
  const { isExpiringSoon, isInGracePeriod, daysRemaining, isLoading } = useSubscription();

  if (isLoading) return null;

  if (isInGracePeriod) {
    return (
      <div className="banner warning">
        ⚠️ Your subscription expired. You're in grace period ({daysRemaining} days remaining).
        <Link to="/subscription/renew">Renew Now</Link>
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="banner info">
        ℹ️ Your subscription expires in {daysRemaining} days.
        <Link to="/subscription/renew">Renew Early</Link>
      </div>
    );
  }

  return null;
}
```

---

## 🚨 Common Mistakes to Avoid

### Mistake 1: Checking Local State

```typescript
// ❌ WRONG
const user = JSON.parse(localStorage.getItem('user'));
if (user.has_subscription) { ... }

// ✅ CORRECT
const { hasActiveSubscription } = useSubscription();
if (hasActiveSubscription) { ... }
```

### Mistake 2: Multiple Subscription Checks

```typescript
// ❌ WRONG - Multiple checks in different places
function Component1() {
  const hasAccess = localStorage.getItem('has_subscription');
}

function Component2() {
  const hasAccess = await checkSubscription();
}

// ✅ CORRECT - Single centralized check
function Component1() {
  const { hasActiveSubscription } = useSubscription();
}

function Component2() {
  const { hasActiveSubscription } = useSubscription();
}
```

### Mistake 3: Ignoring Loading State

```typescript
// ❌ WRONG - Not handling loading
const { hasActiveSubscription } = useSubscription();
return hasActiveSubscription ? <Content /> : <NoAccess />;

// ✅ CORRECT - Handle loading
const { hasActiveSubscription, isLoading } = useSubscription();
if (isLoading) return <Loading />;
return hasActiveSubscription ? <Content /> : <NoAccess />;
```

### Mistake 4: Not Refreshing After Payment

```typescript
// ❌ WRONG - Not refreshing after payment
function PaymentSuccess() {
  navigate('/dashboard');
}

// ✅ CORRECT - Refresh subscription data
function PaymentSuccess() {
  await SubscriptionChecker.refresh();
  navigate('/dashboard');
}
```

---

## 🔄 Cache Behavior

The system uses intelligent caching to reduce server load:

- **Cache Duration**: 1 minute
- **Auto-refresh**: After payment, cancellation, or subscription changes
- **Manual Refresh**: Call `SubscriptionChecker.refresh()` or `refresh()` from hook

```typescript
// Clear cache and refresh
await SubscriptionChecker.refresh();

// Just clear cache (next request will fetch fresh)
SubscriptionChecker.clearCache();
```

---

## 🎭 Testing

### Testing Protected Components

```typescript
import { render } from '@testing-library/react';
import { SubscriptionChecker } from '@/app/services/SubscriptionChecker';

describe('ProtectedComponent', () => {
  it('should show content when subscription is active', async () => {
    // Mock subscription checker
    jest.spyOn(SubscriptionChecker, 'hasActiveSubscription').mockResolvedValue(true);

    const { getByText } = render(<ProtectedComponent />);
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when subscription is inactive', async () => {
    // Mock subscription checker
    jest.spyOn(SubscriptionChecker, 'hasActiveSubscription').mockResolvedValue(false);
    const redirectSpy = jest.spyOn(SubscriptionChecker, 'redirectToSubscription');

    render(<ProtectedComponent />);
    
    expect(redirectSpy).toHaveBeenCalled();
  });
});
```

---

## 📊 Logging

The system logs all subscription checks:

```
🔍 SubscriptionChecker: Checking subscription status
🌐 SubscriptionChecker: Fetching manifest from server
✅ SubscriptionChecker: Manifest fetched successfully
📊 SubscriptionChecker: Subscription status {has_active: true, status: "Active"}
✅ SubscriptionChecker: Access granted
```

All logs are prefixed with emoji for easy filtering in console.

---

## 🎯 Summary

### DO:
✅ Always use `useSubscription()` or `useSubscriptionGuard()` hooks
✅ Always handle loading state before checking subscription
✅ Use `SubscriptionChecker.refresh()` after payment/subscription changes
✅ Use centralized redirect: `SubscriptionChecker.redirectToSubscription()`

### DON'T:
❌ Never check subscription from localStorage or local state
❌ Never create custom subscription checking logic
❌ Never ignore loading state
❌ Never have multiple subscription checking methods

---

## 🚀 Migration Checklist

If migrating existing code:

- [ ] Find all subscription checks (`has_subscription`, `activeSubscription`, etc.)
- [ ] Replace with `useSubscription()` hook
- [ ] Add loading state handling
- [ ] Use `SubscriptionChecker.redirectToSubscription()` for redirects
- [ ] Call `SubscriptionChecker.refresh()` after payment success
- [ ] Remove custom subscription checking logic
- [ ] Test all protected routes
- [ ] Test payment flow end-to-end
