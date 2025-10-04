// src/app/components/Auth/SubscriptionRoute.tsx
/**
 * Subscription Route Guard
 * 
 * Protects routes that require an active subscription.
 * Redirects users without active subscriptions to the subscription plans page.
 * 
 * Usage:
 * <Route element={<ProtectedRoute><SubscriptionRoute><YourComponent /></SubscriptionRoute></ProtectedRoute>} />
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import SubscriptionService from '../../services/SubscriptionService';

interface SubscriptionRouteProps {
  children: React.ReactNode;
  allowGracePeriod?: boolean; // Allow access during grace period (default: true)
}

const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({ 
  children, 
  allowGracePeriod = true 
}) => {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const status = await SubscriptionService.getMySubscription();
      setSubscriptionStatus(status);
      
      // Check if user has active subscription
      if (allowGracePeriod) {
        // Allow access if active OR in grace period
        setHasSubscription(status.has_subscription || status.is_in_grace_period);
      } else {
        // Only allow if active (no grace period)
        setHasSubscription(status.has_subscription && !status.is_in_grace_period);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setHasSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Checking subscription status...</p>
      </div>
    );
  }

  if (!hasSubscription) {
    // User doesn't have active subscription, redirect to plans
    return (
      <Navigate 
        to="/subscription/plans" 
        state={{ 
          from: location,
          message: subscriptionStatus?.is_in_grace_period 
            ? 'Your subscription has expired. Please renew to continue accessing content.'
            : 'Active subscription required to access this content.',
          subscriptionStatus
        }} 
        replace 
      />
    );
  }

  // User has active subscription, render children
  return <>{children}</>;
};

export default SubscriptionRoute;
