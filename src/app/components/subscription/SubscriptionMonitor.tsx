/**
 * Global Subscription Monitor
 * 
 * PRODUCTION VERSION:
 * - Monitors subscription status from centralized manifest
 * - Shows warning banner for expiring/expired subscriptions
 * - Auto-redirects to /subscription/plans if no active subscription
 * - Comprehensive logging for debugging without UI clutter
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubscriptionInfo } from '../../hooks/useSubscriptionCheck';
import { FaCrown, FaExclamationTriangle } from 'react-icons/fa';
import './SubscriptionMonitor.css';

// Routes that don't require subscription check
const EXCLUDED_ROUTES = [
  '/subscription/plans',
  '/subscription/callback',
  '/subscription/history',
  '/subscription/my-subscriptions',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth',
];

const SubscriptionMonitor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ STABILIZED: Get subscription info with comprehensive validation
  const {
    hasActiveSubscription,
    daysRemaining,
    isInGracePeriod,
    requiresSubscription,
    subscriptionStatus,
    isLoading, // ✅ CRITICAL: Wait for manifest to load before checking
    isInitialized, // ✅ CRITICAL: Wait for first load after hard refresh
  } = useSubscriptionInfo();

  const [showBanner, setShowBanner] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // ✅ CRITICAL: Type validation to prevent runtime errors
  const safeHasActiveSubscription = Boolean(hasActiveSubscription);
  const safeDaysRemaining = typeof daysRemaining === 'number' ? Math.max(0, daysRemaining) : 0;
  const safeIsInGracePeriod = Boolean(isInGracePeriod);
  const safeRequiresSubscription = Boolean(requiresSubscription);
  const safeSubscriptionStatus = String(subscriptionStatus || 'Unknown');

  useEffect(() => {
    // ✅ STABILIZED: Safe route checking with validation
    try {
      const currentPath = String(location?.pathname || '/');
      const isExcluded = EXCLUDED_ROUTES.some(route => {
        try {
          return currentPath.startsWith(route);
        } catch (err) {
          console.warn('⚠️ Error checking excluded route:', route, err);
          return false;
        }
      });

      if (isExcluded) {
        setShowBanner(false);
        console.log('✅ SubscriptionMonitor: Excluded route, no check needed:', currentPath);
        return;
      }

      // ✅ CRITICAL FIX: Wait for manifest to initialize (first load after hard refresh)
      if (!isInitialized) {
        console.log('⏳ SubscriptionMonitor: Waiting for manifest to initialize (first load)...');
        return;
      }

      // ✅ CRITICAL FIX: Wait for manifest to load before checking subscription
      if (isLoading) {
        console.log('⏳ SubscriptionMonitor: Waiting for manifest to load...');
        return;
      }

      console.log('🔍 SubscriptionMonitor: Checking subscription status', {
        pathname: currentPath,
        requiresSubscription: safeRequiresSubscription,
        hasActiveSubscription: safeHasActiveSubscription,
        daysRemaining: safeDaysRemaining,
        isInGracePeriod: safeIsInGracePeriod,
        subscriptionStatus: safeSubscriptionStatus
      });
      
      console.log('📊 RAW subscription info (validated):', {
        requiresSubscription: safeRequiresSubscription,
        hasActiveSubscription: safeHasActiveSubscription,
        type_requiresSubscription: typeof requiresSubscription,
        type_hasActiveSubscription: typeof hasActiveSubscription,
        validated: true
      });

      

      // Show banner for expiring subscriptions
      if (daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 3) {
        setShowBanner(true);
        return;
      }

      if (isInGracePeriod) {
        setShowBanner(true);
        return;
      }

      // Allow access if subscription is NOT required
      if (!requiresSubscription) {
        setShowBanner(false);
        return;
      }

      // ✅ AUTOMATIC REDIRECT ENABLED (Production Mode)
      // Redirect to plans if no active subscription and subscription is required
      if (safeRequiresSubscription && !safeHasActiveSubscription && !hasRedirected) {
      console.log('🔒 SubscriptionMonitor: No active subscription detected');
      console.log('� AUTO-REDIRECTING to /subscription/plans in 2 seconds...');
      console.log('📊 Redirect Context:', {
        from: location.pathname,
        reason: 'no_active_subscription',
        subscriptionStatus,
        requiresSubscription,
        hasActiveSubscription
      });
      
      setHasRedirected(true);
      
      // Auto-redirect after 2 seconds to allow page to render and show message
      setTimeout(() => {
        console.log('🚀 Executing redirect to /subscription/plans');
        window.location.href = '/subscription/plans';
      }, 2000);
    }
    } catch (error) {
      console.error('❌ SubscriptionMonitor error:', error);
      // Don't crash the app - just log the error
    }
  }, [
    hasActiveSubscription,
    daysRemaining,
    isInGracePeriod,
    requiresSubscription,
    location.pathname,
    navigate,
    hasRedirected,
    isLoading, // ✅ CRITICAL: Re-check when loading completes
    isInitialized // ✅ CRITICAL: Re-check when manifest initializes (hard refresh fix)
  ]);

  const handleRenew = () => {
    window.location.href = '/subscription/plans';
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  // ✅ STABILIZED: Determine banner type with safe values
  let bannerClass = 'subscription-banner';
  let icon = <FaCrown />;
  let message = '';
  let actionText = 'Renew Now';

  if (safeIsInGracePeriod) {
    bannerClass += ' grace-period';
    icon = <FaExclamationTriangle />;
    message = 'Your subscription has expired but you are in a grace period. Please renew to continue accessing content.';
  } else if (safeDaysRemaining <= 3 && safeDaysRemaining > 0) {
    bannerClass += ' expiring-soon';
    icon = <FaExclamationTriangle />;
    message = `Your subscription expires in ${safeDaysRemaining} day${safeDaysRemaining !== 1 ? 's' : ''}. Renew now to avoid interruption.`;
  } else if (!safeHasActiveSubscription) {
    bannerClass += ' no-subscription';
    icon = <FaExclamationTriangle />;
    message = 'Active subscription required. Subscribe now to access movies and content.';
    actionText = 'Subscribe Now';
  }

  return (
    <div className={bannerClass}>
      <div className="banner-content">
        <div className="banner-icon">{icon}</div>
        <div className="banner-message">
          <p>{message}</p>
          <small>Status: {safeSubscriptionStatus}</small>
        </div>
        <div className="banner-actions">
          <button className="banner-btn primary" onClick={handleRenew}>
            {actionText}
          </button>
          <button className="banner-btn secondary" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionMonitor;
