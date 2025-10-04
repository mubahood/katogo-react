/**
 * Subscription Service
 * 
 * Handles all subscription-related API calls
 */

import { http_get, http_post } from './Api';

// ========================================
// INTERFACES & TYPES
// ========================================

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  actual_price: number;
  formatted_price: string;
  currency: string;
  duration_days: number;
  duration_text: string;
  daily_cost: number;
  features: string; // HTML
  features_array: string[];
  is_featured: boolean;
  is_popular: boolean;
  is_trial: boolean;
  discount_percentage: number;
  max_downloads: number | null;
  max_watchlist: number | null;
  ad_free: boolean;
  hd_streaming: boolean;
  status: 'Active' | 'Inactive';
  active_subscriptions: number;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan: SubscriptionPlan | null;
  status: 'Pending' | 'Active' | 'Expired' | 'Cancelled' | 'Failed';
  payment_status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Refunded';
  start_date: string; // ISO 8601
  end_date: string; // ISO 8601
  grace_period_end: string | null; // ISO 8601
  days_remaining: number;
  hours_remaining: number;
  is_active: boolean;
  is_in_grace_period: boolean;
  is_expired: boolean;
  amount_paid: number;
  currency: string;
  payment_method: string;
  auto_renew: boolean;
  is_extension: boolean;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  created_at: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  has_active_subscription: boolean; // Backend returns this key
  status: string;
  is_active: boolean;
  days_remaining: number;
  hours_remaining?: number;
  end_date: string | null;
  formatted_end_date?: string;
  is_in_grace_period: boolean;
  plan?: SubscriptionPlan | null;
  subscription?: Subscription | null;
}

export interface CreateSubscriptionRequest {
  plan_id: number;
  callback_url?: string;
}

export interface CreateSubscriptionResponse {
  subscription_id: number;
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
}

export interface SubscriptionHistory {
  subscriptions: Subscription[];
  total_spent: number;
  currency: string;
}

export interface RetryPaymentRequest {
  subscription_id: number;
  callback_url?: string;
}

export interface CheckStatusRequest {
  subscription_id: number;
}

export interface CancelSubscriptionRequest {
  subscription_id: number;
  reason?: string;
}

// ========================================
// SUBSCRIPTION SERVICE
// ========================================

class SubscriptionService {
  private static readonly BASE_PATH = '';

  /**
   * Get pending subscription for current user
   * Checks if user has any unpaid subscription
   * 
   * @returns Promise with pending_subscription or null
   */
  static async getPendingSubscription(): Promise<{
    has_pending: boolean;
    pending_subscription: any | null;
  }> {
    try {
      const response = await http_get('subscriptions/pending');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending subscription:', error);
      throw error;
    }
  }

  /**
   * Initiate payment for a pending subscription
   * 
   * @param subscriptionId Pending subscription ID
   * @returns Promise<CreateSubscriptionResponse>
   */
  static async initiatePendingPayment(subscriptionId: number): Promise<CreateSubscriptionResponse> {
    try {
      const response = await http_post(
        `subscriptions/${subscriptionId}/initiate-payment`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Failed to initiate pending payment:', error);
      throw error;
    }
  }

  /**
   * Check payment status for a pending subscription via Pesapal API
   * This makes a backend call which queries Pesapal
   * 
   * @param subscriptionId Pending subscription ID
   * @returns Promise<Subscription>
   */
  static async checkPendingPaymentStatus(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await http_post(
        `subscriptions/${subscriptionId}/check-payment`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Failed to check pending payment status:', error);
      throw error;
    }
  }

  /**
   * Cancel a pending subscription
   * 
   * @param subscriptionId Pending subscription ID
   * @returns Promise<{ success: boolean, message: string }>
   */
  static async cancelPendingSubscription(subscriptionId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await http_post(
        `subscriptions/${subscriptionId}/cancel`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Failed to cancel pending subscription:', error);
      throw error;
    }
  }

  /**
   * Get all available subscription plans
   * 
   * @param lang Language code: 'en', 'lg' (Luganda), 'sw' (Swahili)
   * @returns Promise<SubscriptionPlan[]>
   */
  static async getPlans(lang: 'en' | 'lg' | 'sw' = 'en'): Promise<SubscriptionPlan[]> {
    try {
      const response = await http_get(
        `subscription-plans?lang=${lang}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      throw error;
    }
  }

  /**
   * Create a new subscription and initialize payment
   * 
   * @param request CreateSubscriptionRequest
   * @returns Promise<CreateSubscriptionResponse>
   */
  static async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> {
    try {
      const response = await http_post(
        'subscriptions/create',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Get current user's subscription status
   * 
   * @returns Promise<SubscriptionStatus>
   */
  static async getMySubscription(): Promise<SubscriptionStatus> {
    try {
      const response = await http_get(
        'subscriptions/my-subscription'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      throw error;
    }
  }

  /**
   * Get subscription history
   * 
   * @param limit Number of records to fetch (default: 10)
   * @returns Promise<SubscriptionHistory>
   */
  static async getHistory(limit: number = 10): Promise<SubscriptionHistory> {
    try {
      const response = await http_get(
        `subscriptions/history?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription history:', error);
      throw error;
    }
  }

  /**
   * Retry payment for a failed/pending subscription
   * 
   * @param request RetryPaymentRequest
   * @returns Promise<CreateSubscriptionResponse>
   */
  static async retryPayment(
    request: RetryPaymentRequest
  ): Promise<CreateSubscriptionResponse> {
    try {
      const response = await http_post(
        'subscriptions/retry-payment',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to retry payment:', error);
      throw error;
    }
  }

  /**
   * Manually check payment status for a subscription
   * 
   * @param request CheckStatusRequest
   * @returns Promise<Subscription>
   */
  static async checkPaymentStatus(request: CheckStatusRequest): Promise<Subscription> {
    try {
      const response = await http_post(
        'subscriptions/check-status',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to check payment status:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   * 
   * @param request CancelSubscriptionRequest
   * @returns Promise<Subscription>
   */
  static async cancelSubscription(request: CancelSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await http_post(
        'subscriptions/cancel',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Check if user has an active subscription (client-side cache)
   * Useful for quick checks without API call
   * 
   * @returns Promise<boolean>
   */
  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const status = await this.getMySubscription();
      return status.has_subscription && status.is_active;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Redirect to payment gateway
   * 
   * @param redirectUrl Pesapal payment URL
   */
  static redirectToPayment(redirectUrl: string): void {
    console.log('SubscriptionService: Redirecting to payment gateway');
    window.location.href = redirectUrl;
  }

  /**
   * Get subscription status color for UI
   * 
   * @param status Subscription status
   * @returns Color name for styling
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Expired':
        return 'danger';
      case 'Cancelled':
        return 'secondary';
      case 'Failed':
        return 'danger';
      default:
        return 'info';
    }
  }

  /**
   * Get payment status color for UI
   * 
   * @param status Payment status
   * @returns Color name for styling
   */
  static getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Failed':
        return 'danger';
      case 'Refunded':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Format subscription end date
   * 
   * @param dateString ISO 8601 date string
   * @returns Formatted date string
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Get relative time (e.g., "3 days left", "expired 2 days ago")
   * 
   * @param endDate End date string
   * @returns Human-readable time
   */
  static getRelativeTime(endDate: string): string {
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffMs = end.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffDays > 0) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} left`;
      } else if (diffDays === 0 && diffHours === 0) {
        return 'Expiring soon';
      } else {
        const absDays = Math.abs(diffDays);
        return `Expired ${absDays} day${absDays === 1 ? '' : 's'} ago`;
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Calculate daily cost from total price and duration
   * 
   * @param price Total price
   * @param days Duration in days
   * @returns Daily cost
   */
  static calculateDailyCost(price: number, days: number): number {
    return Math.round((price / days) * 100) / 100;
  }

  /**
   * Get plan recommendation badge text
   * 
   * @param plan Subscription plan
   * @returns Badge text or null
   */
  static getPlanBadge(plan: SubscriptionPlan): string | null {
    if (plan.is_featured) return 'RECOMMENDED';
    if (plan.is_popular) return 'MOST POPULAR';
    if (plan.is_trial) return 'TRIAL';
    if (plan.discount_percentage > 0) return `${plan.discount_percentage}% OFF`;
    return null;
  }

  /**
   * Parse callback URL parameters
   * Used in payment result pages
   * 
   * @returns Object with status, message, subscription_id
   */
  static parseCallbackParams(): {
    status: 'success' | 'failed' | 'error' | null;
    message: string | null;
    subscription_id: number | null;
  } {
    const params = new URLSearchParams(window.location.search);
    return {
      status: params.get('status') as any,
      message: params.get('message'),
      subscription_id: params.get('subscription_id') 
        ? parseInt(params.get('subscription_id')!) 
        : null
    };
  }

  /**
   * Store subscription data in localStorage for offline access
   * 
   * @param status SubscriptionStatus
   */
  static cacheSubscriptionStatus(status: SubscriptionStatus): void {
    try {
      localStorage.setItem('subscription_status', JSON.stringify(status));
      localStorage.setItem('subscription_cached_at', new Date().toISOString());
    } catch (error) {
      console.error('Failed to cache subscription status:', error);
    }
  }

  /**
   * Get cached subscription status
   * Returns null if cache is older than 5 minutes
   * 
   * @returns SubscriptionStatus | null
   */
  static getCachedSubscriptionStatus(): SubscriptionStatus | null {
    try {
      const cachedStatus = localStorage.getItem('subscription_status');
      const cachedAt = localStorage.getItem('subscription_cached_at');

      if (!cachedStatus || !cachedAt) return null;

      const cacheAge = Date.now() - new Date(cachedAt).getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (cacheAge > fiveMinutes) {
        // Cache expired
        localStorage.removeItem('subscription_status');
        localStorage.removeItem('subscription_cached_at');
        return null;
      }

      return JSON.parse(cachedStatus);
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear subscription cache
   */
  static clearCache(): void {
    localStorage.removeItem('subscription_status');
    localStorage.removeItem('subscription_cached_at');
  }
}

export default SubscriptionService;
