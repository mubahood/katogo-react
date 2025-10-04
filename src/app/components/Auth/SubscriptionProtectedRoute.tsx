// src/app/components/Auth/SubscriptionProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import SubscriptionService from '../../services/SubscriptionService';
import { FaCrown, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import './SubscriptionProtectedRoute.css';

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * SubscriptionProtectedRoute Component
 * 
 * Protects routes that require an active subscription
 * - Checks authentication first
 * - Verifies active subscription status
 * - Enforces grace period rules
 * - Redirects to subscription plans if no active subscription
 */
const SubscriptionProtectedRoute: React.FC<SubscriptionProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [checking, setChecking] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // ✅ STABILIZED: Wrap in try-catch to prevent crashes
    try {
      checkSubscriptionStatus();
    } catch (err) {
      console.error('❌ SubscriptionProtectedRoute: Error in useEffect:', err);
      setError('Unexpected error checking subscription');
      setChecking(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      setChecking(true);
      setError(null);

      // ✅ STABILIZED: Validate authentication state
      if (!isAuthenticated || !user) {
        console.log('⚠️ SubscriptionProtectedRoute: User not authenticated');
        setHasActiveSubscription(false);
        setChecking(false);
        return;
      }

      // ✅ STABILIZED: Get current subscription status with error handling
      const status = await SubscriptionService.getMySubscription();
      
      // ✅ STABILIZED: Comprehensive validation of response
      if (!status || typeof status !== 'object') {
        console.error('❌ Invalid subscription status response:', status);
        throw new Error('Invalid subscription data received');
      }

      console.log('🔒 Subscription Status Check:', {
        has_subscription: Boolean(status.has_subscription),
        is_active: Boolean(status.is_active),
        subscription: status.subscription || null,
        is_in_grace_period: Boolean(status.is_in_grace_period),
        days_remaining: typeof status.days_remaining === 'number' ? status.days_remaining : 0
      });

      setSubscriptionData(status);
      setRetryCount(0); // Reset retry count on success

      // ✅ STABILIZED: Strict enforcement with safe validation
      const hasValidSubscription = Boolean(status.has_subscription && status.is_active);
      setHasActiveSubscription(hasValidSubscription);

    } catch (err: any) {
      console.error('❌ Subscription check failed:', err);
      
      // ✅ STABILIZED: Retry logic for network errors
      if (retryCount < MAX_RETRIES && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK')) {
        console.log(`🔄 Retrying subscription check (${retryCount + 1}/${MAX_RETRIES})...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => checkSubscriptionStatus(), 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      // ✅ STABILIZED: User-friendly error messages
      const errorMessage = err.response?.data?.message || err.message || 'Failed to verify subscription status';
      setError(errorMessage);
      setHasActiveSubscription(false);
    } finally {
      setChecking(false);
    }
  };

  // Show loading state while checking
  if (checking) {
    return (
      <div className="subscription-checking">
        <div className="checking-spinner"></div>
        <p>Verifying subscription...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Block access if no active subscription
  if (!hasActiveSubscription) {
    return (
      <div className="subscription-required-page">
        <div className="subscription-required-card">
          <div className="icon-container">
            <FaLock className="lock-icon" />
          </div>
          
          <h1 className="title">Subscription Required</h1>
          
          <p className="message">
            You need an active subscription to access this content.
          </p>

          {subscriptionData?.subscription && (
            <div className="subscription-info">
              <div className="info-item">
                <span className="label">Status:</span>
                <span className="value expired">{subscriptionData.subscription.status}</span>
              </div>
              {subscriptionData.subscription.end_date && (
                <div className="info-item">
                  <span className="label">Expired:</span>
                  <span className="value">{new Date(subscriptionData.subscription.end_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {subscriptionData?.is_in_grace_period && (
            <div className="grace-period-notice">
              <FaExclamationTriangle />
              <span>Grace period expired. Please renew your subscription.</span>
            </div>
          )}

          <div className="actions">
            <button 
              className="subscribe-btn"
              onClick={() => navigate('/subscription/plans')}
            >
              <FaCrown />
              <span>View Subscription Plans</span>
            </button>
            
            {subscriptionData?.subscription && (
              <button 
                className="history-btn"
                onClick={() => navigate('/subscription/history')}
              >
                View Subscription History
              </button>
            )}
          </div>

          {error && (
            <div className="error-notice">
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={() => {
                  setRetryCount(0);
                  checkSubscriptionStatus();
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Allow access - user has active subscription
  return <>{children}</>;
};

export default SubscriptionProtectedRoute;
