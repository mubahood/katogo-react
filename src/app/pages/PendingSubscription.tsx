// src/app/pages/PendingSubscription.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService from '../services/SubscriptionService';
import { useSubscriptionInfo } from '../hooks/useSubscriptionCheck';
import { FaClock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import './PendingSubscription.css';

interface PendingSubscriptionData {
  id: number;
  plan: {
    name: string;
    currency: string;
    price: number;
  };
  amount: number;
  status: string;
  order_tracking_id: string;
  merchant_reference: string;
  created_at: string;
  expires_at: string | null;
  payment_url?: string;
}

/**
 * Pending Subscription Page
 * 
 * Critical page for managing unpaid subscriptions
 * - Shows pending subscription details
 * - Allows payment initiation/retry
 * - Checks payment status with Pesapal
 * - Allows cancellation with confirmation
 */
const PendingSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { hasActiveSubscription, subscriptionStatus } = useSubscriptionInfo();
  const [loading, setLoading] = useState(true);
  const [pendingSubscription, setPendingSubscription] = useState<PendingSubscriptionData | null>(null);
  const [checking, setChecking] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [autoCheckCount, setAutoCheckCount] = useState(0);
  const [failedCheckCount, setFailedCheckCount] = useState(0);
  const MAX_AUTO_CHECKS = 180; // 30 minutes (180 * 10 seconds)
  const MAX_FAILED_CHECKS = 5; // Circuit breaker

  // ✅ CRITICAL: If user has active subscription, redirect to home (not plans!)
  useEffect(() => {
    if (hasActiveSubscription) {
      console.log('✅ PendingSubscription: User has active subscription, redirecting to main site');
      console.log('📊 Subscription Status:', subscriptionStatus);
      console.log('🔄 Forcing full page reload to main site (/)...');
      // Use window.location.href to force full page reload and refresh subscription state
      window.location.href = '/';
      return;
    }
  }, [hasActiveSubscription, subscriptionStatus]);

  // Load pending subscription on mount
  useEffect(() => {
    loadPendingSubscription();
  }, []);

  // ✅ STABILIZED: Set up automatic payment status checking with circuit breaker
  useEffect(() => {
    if (!pendingSubscription) return;

    // ✅ Circuit breaker: Stop if too many checks or too many failures
    if (autoCheckCount >= MAX_AUTO_CHECKS) {
      console.log('⚠️ Auto-check limit reached (30 minutes). Stopping auto-checks.');
      return;
    }

    if (failedCheckCount >= MAX_FAILED_CHECKS) {
      console.log('❌ Too many failed checks. Stopping auto-checks. Please refresh the page.');
      setError('Unable to verify payment status. Please refresh the page or contact support.');
      return;
    }

    console.log('🔄 Setting up auto-check interval (every 10 seconds)...');
    console.log(`📊 Auto-check count: ${autoCheckCount}/${MAX_AUTO_CHECKS}, Failed: ${failedCheckCount}/${MAX_FAILED_CHECKS}`);
    
    const interval = setInterval(() => {
      // ✅ STABILIZED: Only check if not already checking, paying, or canceling
      if (!checking && !paying && !canceling) {
        console.log(`⏰ Auto-checking payment status (${autoCheckCount + 1}/${MAX_AUTO_CHECKS})...`);
        checkPaymentStatusSilently();
        setAutoCheckCount(prev => prev + 1);
      } else {
        console.log('⏸️ Skipping auto-check (operation in progress)');
      }
    }, 10000); // Check every 10 seconds

    // ✅ CRITICAL: Cleanup on unmount
    return () => {
      console.log('🛑 Clearing auto-check interval');
      clearInterval(interval);
    };
  }, [pendingSubscription, checking, paying, canceling, autoCheckCount, failedCheckCount]);

  const loadPendingSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ STABILIZED: Validate response
      const response = await SubscriptionService.getPendingSubscription();
      
      if (!response || typeof response !== 'object') {
        console.error('❌ Invalid response from getPendingSubscription:', response);
        throw new Error('Invalid response format');
      }

      if (response.pending_subscription) {
        // ✅ STABILIZED: Validate subscription object
        const sub = response.pending_subscription;
        if (sub && sub.id && sub.plan) {
          setPendingSubscription(sub);
        } else {
          console.error('❌ Invalid subscription data:', sub);
          throw new Error('Invalid subscription data structure');
        }
      } else {
        // No pending subscription, redirect to plans
        console.log('ℹ️ No pending subscription found, redirecting to plans');
        navigate('/subscription/plans', { replace: true });
      }
    } catch (err: any) {
      console.error('❌ Failed to load pending subscription:', err);
      
      // ✅ STABILIZED: Handle different error scenarios
      if (err.response?.status === 404 || err.response?.status === 500) {
        // Backend endpoint not implemented yet - redirect to plans
        console.log('⚠️ Backend endpoint not ready, redirecting to plans...');
        setTimeout(() => navigate('/subscription/plans', { replace: true }), 1000);
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError('Network error. Please check your connection and try again.');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load pending subscription';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!pendingSubscription) return;

    try {
      setPaying(true);
      setError(null);

      // Check if payment URL already exists
      if (pendingSubscription.payment_url) {
        // Open existing payment URL in new tab
        window.open(pendingSubscription.payment_url, '_blank');
        setPaying(false);
        return;
      }

      // Initialize new payment
      const response = await SubscriptionService.initiatePendingPayment(pendingSubscription.id);

      if (response.redirect_url) {
        // Store subscription info
        localStorage.setItem('pending_subscription_check', JSON.stringify({
          subscription_id: pendingSubscription.id,
          order_tracking_id: response.order_tracking_id || pendingSubscription.order_tracking_id,
          started_at: new Date().toISOString()
        }));

        // Open payment in new tab
        window.open(response.redirect_url, '_blank');
        
        // Start checking payment status
        startPaymentStatusCheck();
      }

    } catch (err: any) {
      console.error('❌ Payment initiation failed:', err);
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const startPaymentStatusCheck = () => {
    // Check payment status every 5 seconds
    const checkInterval = setInterval(async () => {
      const result = await checkPaymentStatusSilently();
      if (result === 'success') {
        clearInterval(checkInterval);
      }
    }, 5000);

    // Stop checking after 10 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 600000);
  };

  const checkPaymentStatusSilently = async (): Promise<'success' | 'pending' | 'failed'> => {
    // ✅ STABILIZED: Validate pending subscription exists
    if (!pendingSubscription || !pendingSubscription.id) {
      console.log('⚠️ No valid pending subscription to check');
      setFailedCheckCount(prev => prev + 1);
      return 'failed';
    }

    try {
      console.log('🔍 Checking payment status for subscription ID:', pendingSubscription.id);
      
      // ✅ STABILIZED: Add timeout to prevent hanging requests
      const response = await SubscriptionService.checkPendingPaymentStatus(pendingSubscription.id);

      // ✅ STABILIZED: Validate response structure
      if (!response || typeof response !== 'object') {
        console.error('❌ Invalid response from payment status check:', response);
        setFailedCheckCount(prev => prev + 1);
        return 'failed';
      }

      console.log('📊 Payment status response:', {
        status: response.status,
        payment_status: response.payment_status,
        is_active: response.is_active
      });

      // ✅ STABILIZED: Reset failed count on successful check
      setFailedCheckCount(0);

      if (response.status === 'Active' || response.is_active === true) {
        // Payment successful! Clean up and redirect to main site
        console.log('✅ Payment successful! Subscription is now active - redirecting to main site');
        
        try {
          localStorage.removeItem('pending_subscription_check');
        } catch (e) {
          console.warn('⚠️ Failed to clear localStorage:', e);
        }
        
        // ✅ CRITICAL: Use window.location.href to force full page reload
        // This ensures the entire app refreshes with the new subscription state
        console.log('🔄 Forcing full page reload to main site (/)...');
        window.location.href = '/';
        
        return 'success';
      }

      console.log('⏳ Payment still pending, will check again in 10 seconds');
      return 'pending';
    } catch (err: any) {
      console.error('❌ Failed to check payment status:', err);
      
      // ✅ STABILIZED: Track failed checks
      setFailedCheckCount(prev => prev + 1);
      
      // ✅ STABILIZED: Log detailed error info
      console.error('🐛 Error details:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        failedCount: failedCheckCount + 1
      });
      
      return 'failed';
    }
  };

  const handleCheckStatus = async () => {
    if (!pendingSubscription) return;

    try {
      setChecking(true);
      setError(null);

      const response = await SubscriptionService.checkPendingPaymentStatus(pendingSubscription.id);

      if (response.status === 'Active') {
        // Payment successful! Redirect to main site
        localStorage.removeItem('pending_subscription_check');
        
        // ✅ CRITICAL: Use window.location.href to force full page reload
        console.log('🔄 Manual check: Payment successful! Redirecting to main site...');
        window.location.href = '/';
      } else if (response.status === 'Pending') {
        alert('⏳ Payment is still pending. Please complete the payment or try again later.');
      } else {
        alert('❌ Payment verification failed. Please try paying again or contact support.');
      }

    } catch (err: any) {
      console.error('❌ Status check failed:', err);
      setError(err.response?.data?.message || 'Failed to check payment status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleCancel = async () => {
    if (!pendingSubscription) return;

    try {
      setCanceling(true);
      setError(null);

      await SubscriptionService.cancelPendingSubscription(pendingSubscription.id);

      // Clean up
      localStorage.removeItem('pending_subscription_check');
      
      // Show success message
      alert('Subscription canceled successfully.');
      
      // Redirect to plans
      navigate('/subscription/plans');

    } catch (err: any) {
      console.error('❌ Cancellation failed:', err);
      setError(err.response?.data?.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
      setShowCancelConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="pending-subscription-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading pending subscription...</p>
        </div>
      </div>
    );
  }

  if (!pendingSubscription) {
    return null;
  }

  return (
    <div className="pending-subscription-page">
      <div className="pending-container">
        {/* Warning Banner */}
        <div className="warning-banner">
          <FaExclamationTriangle className="warning-icon" />
          <div className="warning-content">
            <h3>Pending Subscription Payment</h3>
            <p>You have an unpaid subscription that needs your attention</p>
          </div>
        </div>

        {/* Subscription Details Card */}
        <div className="pending-card">
          <div className="card-header">
            <FaClock className="clock-icon" />
            <h2>Pending Subscription</h2>
          </div>

          <div className="subscription-details">
            <div className="detail-row">
              <span className="label">Plan:</span>
              <span className="value plan-name">{pendingSubscription.plan.name}</span>
            </div>

            <div className="detail-row">
              <span className="label">Amount:</span>
              <span className="value amount">
                {pendingSubscription.plan.currency} {Math.round(pendingSubscription.amount).toLocaleString()}
              </span>
            </div>

            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-pending">
                <FaClock /> Pending Payment
              </span>
            </div>

            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value order-id">{pendingSubscription.order_tracking_id}</span>
            </div>

            <div className="detail-row">
              <span className="label">Created:</span>
              <span className="value">{new Date(pendingSubscription.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <h3>What you need to do:</h3>
            <ol>
              <li>Click "Pay Now" to complete your payment via Pesapal</li>
              <li>Complete the payment in the new tab that opens</li>
              <li>Return here and click "Check Payment Status" to verify</li>
              <li>Your subscription will activate immediately after successful payment</li>
            </ol>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <FaTimesCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn-pay-now"
              onClick={handlePayNow}
              disabled={paying || checking || canceling}
            >
              {paying ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  <span>Opening Payment...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Pay Now</span>
                </>
              )}
            </button>

            <button
              className="btn-check-status"
              onClick={handleCheckStatus}
              disabled={checking || paying || canceling}
            >
              {checking ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Check Payment Status</span>
                </>
              )}
            </button>

            <button
              className="btn-cancel"
              onClick={() => setShowCancelConfirm(true)}
              disabled={canceling || checking || paying}
            >
              <FaTimesCircle />
              <span>Cancel Subscription</span>
            </button>
          </div>

          {/* Auto-checking notice */}
          <div className="auto-check-notice">
            <FaSpinner className="spinner-small" />
            <span>Automatically checking payment status every 10 seconds...</span>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Cancel Subscription?</h3>
              <p>Are you sure you want to cancel this pending subscription?</p>
              <p className="warning-text">This action cannot be undone.</p>
              
              <div className="modal-actions">
                <button
                  className="btn-confirm-cancel"
                  onClick={handleCancel}
                  disabled={canceling}
                >
                  {canceling ? 'Canceling...' : 'Yes, Cancel'}
                </button>
                <button
                  className="btn-keep"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={canceling}
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingSubscription;
