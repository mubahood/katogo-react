// SUBSCRIPTION ROUTES INTEGRATION
// Add these imports and routes to your AppRoutes.tsx file

// ============================================
// STEP 1: Add imports at the top of the file
// ============================================

// Subscription Pages
const SubscriptionPlans = React.lazy(() => import("../pages/SubscriptionPlans"));
const PaymentResult = React.lazy(() => import("../pages/PaymentResult"));
const SubscriptionHistory = React.lazy(() => import("../pages/SubscriptionHistory"));


// ============================================
// STEP 2: Add routes in the appropriate section
// ============================================

// Add these routes inside the MainLayout or as standalone routes:

{/* Subscription Routes */}
{/* Public - Anyone can view subscription plans */}
<Route 
  path="subscription/plans" 
  element={<SubscriptionPlans />} 
/>

{/* Public - Pesapal redirects here after payment (no auth required) */}
<Route 
  path="subscription/callback" 
  element={<PaymentResult />} 
/>

{/* Protected - Requires authentication */}
<Route 
  path="subscription/history" 
  element={
    <ProtectedRoute>
      <SubscriptionHistory />
    </ProtectedRoute>
  } 
/>


// ============================================
// FULL EXAMPLE - Where to place in AppRoutes.tsx
// ============================================

/*
<Routes>
  <Route path="/" element={<MainLayout />}>
    
    // ... existing routes ...
    
    {/* Subscription Routes - Add after account routes *\/}
    <Route 
      path="subscription/plans" 
      element={<SubscriptionPlans />} 
    />
    
    <Route 
      path="subscription/callback" 
      element={<PaymentResult />} 
    />
    
    <Route 
      path="subscription/history" 
      element={
        <ProtectedRoute>
          <SubscriptionHistory />
        </ProtectedRoute>
      } 
    />
    
    // ... rest of your routes ...
  </Route>
</Routes>
*/


// ============================================
// STEP 3: Add SubscriptionWidget to Dashboard
// ============================================

// In AccountDashboard.tsx or AccountDashboardNew.tsx:

import SubscriptionWidget from "../components/subscription/SubscriptionWidget";

function AccountDashboard() {
  return (
    <div className="account-dashboard">
      {/* Add at the top of dashboard */}
      <div className="dashboard-section">
        <SubscriptionWidget />
      </div>
      
      {/* Your existing dashboard content */}
      {/* ... */}
    </div>
  );
}


// ============================================
// STEP 4: Optional - Create Subscription Guard
// ============================================

// Create a new file: src/app/components/Auth/SubscriptionRoute.tsx

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import SubscriptionService from '../../services/SubscriptionService';

interface SubscriptionRouteProps {
  children: React.ReactNode;
}

const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({ children }) => {
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
      console.error('Failed to check subscription:', error);
      setHasSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking subscription...</span>
        </div>
      </div>
    );
  }

  if (!hasSubscription) {
    return <Navigate to="/subscription/plans" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default SubscriptionRoute;


// ============================================
// STEP 5: Usage - Protect Movie Streaming Routes
// ============================================

// In AppRoutes.tsx, wrap movie/video routes with SubscriptionRoute:

import SubscriptionRoute from "../components/Auth/SubscriptionRoute";

<Route 
  path="watch/:id" 
  element={
    <ProtectedRoute>
      <SubscriptionRoute>
        <WatchPage />
      </SubscriptionRoute>
    </ProtectedRoute>
  } 
/>

<Route 
  path="movies" 
  element={
    <ProtectedRoute>
      <SubscriptionRoute>
        <MoviesPage contentType="Movie" />
      </SubscriptionRoute>
    </ProtectedRoute>
  } 
/>


// ============================================
// STEP 6: Add WhatsApp Button to Key Pages
// ============================================

// In any page where users might need help (e.g., WatchPage, MoviePage, etc.):

import WhatsAppButton from "../components/WhatsAppButton";

function WatchPage() {
  return (
    <div className="watch-page">
      {/* Your page content */}
      
      {/* Add WhatsApp button */}
      <WhatsAppButton />
    </div>
  );
}


// ============================================
// STEP 7: Add Subscription Link to Navigation
// ============================================

// In your navigation component (e.g., Header.tsx or MainLayout.tsx):

import { useEffect, useState } from 'react';
import SubscriptionService from '../services/SubscriptionService';

// Inside your component:
const [hasSubscription, setHasSubscription] = useState<boolean>(false);

useEffect(() => {
  checkSubscription();
}, []);

const checkSubscription = async () => {
  try {
    const hasActive = await SubscriptionService.hasActiveSubscription();
    setHasSubscription(hasActive);
  } catch (error) {
    setHasSubscription(false);
  }
};

// In your navigation JSX:
{!hasSubscription && (
  <a href="/subscription/plans" className="btn btn-primary">
    Subscribe Now
  </a>
)}

{hasSubscription && (
  <a href="/subscription/history" className="nav-link">
    My Subscription
  </a>
)}


// ============================================
// QUICK REFERENCE: All Subscription URLs
// ============================================

/*
Frontend Routes:
- /subscription/plans          - View and select subscription plans
- /subscription/callback       - Payment result page (Pesapal redirect)
- /subscription/history        - View subscription history

Backend API Endpoints:
- GET  /api/subscription-plans              - List all plans
- POST /api/subscriptions/create            - Create subscription
- GET  /api/subscriptions/my-subscription   - Get current status
- GET  /api/subscriptions/history           - Get history
- POST /api/subscriptions/retry-payment     - Retry failed payment
- POST /api/subscriptions/check-status      - Check payment status
- GET  /api/subscriptions/pesapal/callback  - Pesapal callback
- POST /api/subscriptions/pesapal/ipn       - Pesapal IPN
*/


// ============================================
// TESTING THE INTEGRATION
// ============================================

/*
1. Start your React app: npm start
2. Navigate to: http://localhost:3000/subscription/plans
3. You should see 3 subscription plans with:
   - Quick Start (3 days - UGX 1,000)
   - Two Weeks Special (14 days - UGX 5,000)
   - Monthly Premium (30 days - UGX 8,000)
4. Click "Subscribe Now" on any plan
5. Should redirect to Pesapal payment page
6. Complete test payment
7. Should redirect back to /subscription/callback
8. Should show success message and redirect to dashboard
9. Dashboard should show SubscriptionWidget with active status
*/


// ============================================
// TROUBLESHOOTING
// ============================================

/*
Issue: Routes not working
Solution: Make sure lazy imports are added at the top

Issue: 404 on subscription pages
Solution: Clear cache and restart dev server

Issue: SubscriptionWidget not showing
Solution: Check if it's imported correctly in dashboard

Issue: Payment callback fails
Solution: Check browser console and Laravel logs

Issue: Subscription status not updating
Solution: Clear localStorage cache: SubscriptionService.clearCache()
*/
