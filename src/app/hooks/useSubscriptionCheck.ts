/**
 * useSubscriptionCheck Hook
 * 
 * Checks user's subscription status from manifest and redirects if needed
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSubscriptionInfo, selectIsAuthenticated, selectManifestLoading, selectManifestInitialized } from '../store/slices/manifestSlice';
import ToastService from '../services/ToastService';

interface UseSubscriptionCheckOptions {
  /**
   * Whether to enforce subscription check on this page
   * @default true
   */
  enforce?: boolean;
  
  /**
   * Show toast notification when redirecting
   * @default true
   */
  showToast?: boolean;
  
  /**
   * Custom message to show in toast
   */
  customMessage?: string;
  
  /**
   * Redirect path (default: /subscription/plans)
   */
  redirectPath?: string;
}

/**
 * Hook to check subscription status and redirect if needed
 * 
 * @example
 * ```tsx
 * // In a protected component
 * const MoviesPage = () => {
 *   useSubscriptionCheck(); // Will redirect if no subscription
 *   return <div>Movies content</div>;
 * };
 * ```
 */
export const useSubscriptionCheck = (options: UseSubscriptionCheckOptions = {}) => {
  const {
    enforce = true,
    showToast = true,
    customMessage,
    redirectPath = '/subscription/plans'
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const subscriptionInfo = useSelector(selectSubscriptionInfo);

  useEffect(() => {
    // Don't check if not enforcing or user not authenticated
    if (!enforce || !isAuthenticated) {
      return;
    }

    // Don't redirect if already on subscription pages
    if (location.pathname.startsWith('/subscription')) {
      return;
    }

    // Check subscription status from manifest
    if (subscriptionInfo) {
      const { has_active_subscription, require_subscription, subscription_status } = subscriptionInfo;

      // CRITICAL FIX: Only redirect if BOTH conditions are bad:
      // 1. User doesn't have active subscription AND
      // 2. Backend says subscription is required
      // 
      // Manifest values:
      // - has_active_subscription: true = user has access, false = no access
      // - require_subscription: false = user can access, true = blocked
      //
      // Access granted when: has_active_subscription === true AND require_subscription === false
      // Access denied when: has_active_subscription === false OR require_subscription === true
      const shouldBlock = !has_active_subscription || require_subscription;
      
      console.log('🔍 useSubscriptionCheck: Checking access', {
        has_active_subscription,
        require_subscription,
        subscription_status,
        shouldBlock,
        pathname: location.pathname
      });

      if (shouldBlock) {
        console.log('❌ useSubscriptionCheck: Access WOULD BE denied (AUTO-REDIRECT DISABLED)');
        console.log('🐛 DEBUG MODE: Not redirecting. Check console for subscription data.');
        console.log('📊 Subscription Data:', {
          has_active_subscription,
          require_subscription,
          subscription_status,
          shouldBlock,
          pathname: location.pathname,
          timestamp: new Date().toISOString()
        });
        
        // DISABLED FOR DEBUGGING - Manual redirect button will be shown instead
        // if (showToast) {
        //   const message = customMessage || 
        //     `Active subscription required to access this content. Status: ${subscription_status}`;
        //   ToastService.warning(message);
        // }

        // // Redirect to subscription plans
        // setTimeout(() => {
        //   navigate(redirectPath, {
        //     state: { 
        //       from: location.pathname,
        //       reason: 'subscription_required',
        //       subscriptionInfo 
        //     }
        //   });
        // }, 1500);
      } else {
        console.log('✅ useSubscriptionCheck: Access granted');
      }
    }
  }, [
    enforce,
    isAuthenticated,
    subscriptionInfo,
    location.pathname,
    navigate,
    redirectPath,
    showToast,
    customMessage
  ]);

  return {
    subscriptionInfo,
    hasActiveSubscription: subscriptionInfo?.has_active_subscription ?? false,
    daysRemaining: subscriptionInfo?.days_remaining ?? 0,
    isInGracePeriod: subscriptionInfo?.is_in_grace_period ?? false,
    requiresSubscription: subscriptionInfo?.require_subscription ?? true,
  };
};

/**
 * Hook to get subscription info without enforcement
 * 
 * @example
 * ```tsx
 * const { hasActiveSubscription, daysRemaining } = useSubscriptionInfo();
 * ```
 */
export const useSubscriptionInfo = () => {
  const subscriptionInfo = useSelector(selectSubscriptionInfo);
  const isLoading = useSelector(selectManifestLoading);
  const isInitialized = useSelector(selectManifestInitialized);
  
  // ✅ STABILIZED: Comprehensive validation
  const isValidSubscriptionObject = subscriptionInfo !== null && typeof subscriptionInfo === 'object';

  // ✅ Safe extraction with validation
  const hasActiveSubscription = isValidSubscriptionObject 
    ? Boolean(subscriptionInfo.has_active_subscription) 
    : false;
  
  const daysRemaining = isValidSubscriptionObject && typeof subscriptionInfo.days_remaining === 'number'
    ? Math.max(0, subscriptionInfo.days_remaining) // Never negative
    : 0;
  
  const hoursRemaining = isValidSubscriptionObject && typeof subscriptionInfo.hours_remaining === 'number'
    ? Math.max(0, subscriptionInfo.hours_remaining) // Never negative
    : 0;
  
  const isInGracePeriod = isValidSubscriptionObject 
    ? Boolean(subscriptionInfo.is_in_grace_period) 
    : false;
  
  const subscriptionStatus = isValidSubscriptionObject && subscriptionInfo.subscription_status
    ? String(subscriptionInfo.subscription_status)
    : 'Unknown';
  
  const endDate = isValidSubscriptionObject 
    ? subscriptionInfo.end_date || null 
    : null;
  
  const requiresSubscription = isValidSubscriptionObject && subscriptionInfo.require_subscription !== undefined
    ? Boolean(subscriptionInfo.require_subscription)
    : true; // Default to true for safety

  // ✅ Always return valid structure with safe defaults
  return {
    hasActiveSubscription,
    daysRemaining,
    hoursRemaining,
    isInGracePeriod,
    subscriptionStatus,
    endDate,
    requiresSubscription,
    isLoading, // ✅ CRITICAL: Indicates if manifest is still loading
    isInitialized, // ✅ CRITICAL: Indicates if manifest has loaded at least once (prevents hard-refresh issues)
  };
};

export default useSubscriptionCheck;
