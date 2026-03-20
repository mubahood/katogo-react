// src/app/types/subscription.ts
// Subscription and payment types

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
  features: string;
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
  start_date: string;
  end_date: string;
  grace_period_end: string | null;
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
  has_active_subscription: boolean;
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

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  last_four?: string;
  brand?: string;
  expires_at?: string;
  is_default: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  plan_name: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  due_date: string;
  paid_at?: string;
  download_url?: string;
}
