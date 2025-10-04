/**
 * useSubscription Hook
 * 
 * CRITICAL: This is the ONLY way components should check subscription status
 * This hook provides subscription data from the centralized ManifestService
 * 
 * Usage:
 *   const { hasActiveSubscription, isLoading, subscriptionDetails } = useSubscription();
 *   
 *   if (isLoading) return <Loading />;
 *   if (!hasActiveSubscription) return <SubscriptionRequired />;
 *   return <ProtectedContent />;
 */

import { useState, useEffect } from 'react';
import ManifestService, { ManifestSubscription } from '../services/ManifestService';

interface UseSubscriptionReturn {
  /**
   * CRITICAL: True if user has active subscription
   * This is the ONLY source of truth for subscription status
   */
  hasActiveSubscription: boolean;

  /**
   * Loading state - true while fetching from server
   * NEVER check subscription status while loading is true
   */
  isLoading: boolean;

  /**
   * Error if fetch failed
   */
  error: string | null;

  /**
   * Full subscription details from manifest
   */
  subscriptionDetails: ManifestSubscription | null;

  /**
   * True if subscription is expiring soon (within 7 days)
   */
  isExpiringSoon: boolean;

  /**
   * True if user is in grace period
   */
  isInGracePeriod: boolean;

  /**
   * Days remaining in subscription
   */
  daysRemaining: number;

  /**
   * Hours remaining in subscription
   */
  hoursRemaining: number;

  /**
   * Subscription status (Active, Expired, Cancelled, etc.)
   */
  status: string;

  /**
   * Force refresh subscription data from server
   */
  refresh: () => Promise<void>;

  /**
   * Redirect to subscription plans page
   */
  redirectToSubscription: (reason?: string) => void;
}

/**
 * CENTRALIZED Subscription Hook
 * 
 * CRITICAL: This is the ONLY hook that should be used to check subscription status
 * DO NOT create custom subscription checking logic in components
 * 
 * @param autoFetch - Automatically fetch on mount (default: true)
 * @returns UseSubscriptionReturn
 */
export function useSubscription(autoFetch: boolean = true): UseSubscriptionReturn {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<ManifestSubscription | null>(null);

  /**
   * Fetch subscription data from server
   */
  const fetchSubscription = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎣 useSubscription: Fetching subscription data', { forceRefresh });

      // Get manifest (will use cache if available)
      const manifest = await ManifestService.getSubscriptionManifest(forceRefresh);

      if (!manifest || !manifest.subscription) {
        throw new Error('Invalid manifest data received');
      }

      // Check subscription status
      const hasAccess = await ManifestService.hasActiveSubscription();

      // Update state
      setHasActiveSubscription(hasAccess);
      setSubscriptionDetails(manifest.subscription);

      console.log('✅ useSubscription: Data fetched', {
        hasAccess,
        status: manifest.subscription.subscription_status,
        daysRemaining: manifest.subscription.days_remaining,
      });

    } catch (err: any) {
      console.error('💥 useSubscription: Error fetching subscription', err);
      setError(err.message || 'Failed to fetch subscription data');
      setHasActiveSubscription(false);
      setSubscriptionDetails(null);

    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh subscription data from server (bypass cache)
   */
  const refresh = async () => {
    console.log('🔄 useSubscription: Refreshing subscription data');
    await fetchSubscription(true);
  };

  /**
   * Redirect to subscription plans page
   */
  const redirectToSubscription = (reason?: string) => {
    ManifestService.redirectToSubscription(reason);
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchSubscription();
    }
  }, [autoFetch]);

  // Computed properties from subscription details
  const isExpiringSoon = subscriptionDetails?.has_active_subscription && 
                         subscriptionDetails?.days_remaining > 0 && 
                         subscriptionDetails?.days_remaining <= 7;

  const isInGracePeriod = subscriptionDetails?.is_in_grace_period === true;
  const daysRemaining = subscriptionDetails?.days_remaining || 0;
  const hoursRemaining = subscriptionDetails?.hours_remaining || 0;
  const status = subscriptionDetails?.subscription_status || 'Unknown';

  return {
    hasActiveSubscription,
    isLoading,
    error,
    subscriptionDetails,
    isExpiringSoon: isExpiringSoon || false,
    isInGracePeriod,
    daysRemaining,
    hoursRemaining,
    status,
    refresh,
    redirectToSubscription,
  };
}

/**
 * useSubscriptionGuard Hook
 * 
 * CRITICAL: Use this hook in protected components/routes
 * Automatically redirects to subscription page if user doesn't have access
 * 
 * @param autoRedirect - Automatically redirect if no subscription (default: true)
 * @returns UseSubscriptionReturn
 */
export function useSubscriptionGuard(autoRedirect: boolean = true): UseSubscriptionReturn {
  const subscription = useSubscription();

  useEffect(() => {
    // Only check after loading is complete
    if (!subscription.isLoading && !subscription.hasActiveSubscription && autoRedirect) {
      console.log('🛡️ useSubscriptionGuard: Access denied, redirecting');
      subscription.redirectToSubscription('Access denied - subscription required');
    }
  }, [subscription.isLoading, subscription.hasActiveSubscription, autoRedirect]);

  return subscription;
}
