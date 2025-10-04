import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http_get } from '../services/Api';
import './PaymentResult-dark.css';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaHome, FaRedo, FaInfoCircle } from 'react-icons/fa';

/**
 * Payment Result Page - COMPREHENSIVE IMPLEMENTATION
 * 
 * Handles Pesapal callback with robust edge case handling:
 * - Validates payment status from backend BEFORE showing any result
 * - Shows loading state until 100% sure from backend
 * - Handles network issues with retry logic
 * - Handles browser close/refresh gracefully
 * - Auto-retries status check for pending payments
 * - Comprehensive error handling and logging
 */
const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'checking' | 'verifying' | 'success' | 'failed' | 'pending' | 'error'>('checking');
  const [message, setMessage] = useState<string>('Loading payment information...');
  const [subscription, setSubscription] = useState<any>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [autoCheckInterval, setAutoCheckInterval] = useState<number | null>(null);
  
  const trackingIdRef = useRef<string | null>(null);
  const isVerifyingRef = useRef<boolean>(false);

  useEffect(() => {
    console.log('🔔 PaymentResult: Component mounted');
    console.log('📋 URL Params:', {
      status: searchParams.get('status'),
      tracking_id: searchParams.get('tracking_id'),
      message: searchParams.get('message'),
    });
    
    const urlStatus = searchParams.get('status');
    const trackingId = searchParams.get('tracking_id');
    
    if (trackingId) {
      trackingIdRef.current = trackingId;
      verifyPaymentStatus(trackingId);
    } else if (urlStatus === 'error') {
      const errorMsg = searchParams.get('message') || 'Payment verification failed';
      setStatus('error');
      setMessage('Payment Error');
      setError(errorMsg);
    } else {
      setStatus('error');
      setMessage('Invalid Payment Callback');
      setError('Missing payment tracking information. Please contact support if payment was deducted.');
    }

    // Cleanup auto-check interval on unmount
    return () => {
      if (autoCheckInterval) {
        clearInterval(autoCheckInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    if (status === 'success' && countdown === 0) {
      console.log('✅ Success countdown complete, redirecting to home with full reload');
      window.location.href = '/';
    }
  }, [status, countdown, navigate]);

  /**
   * Verify payment status from backend
   * This is the ONLY source of truth
   */
  const verifyPaymentStatus = async (trackingId: string, isRetry: boolean = false) => {
    // Prevent concurrent verification calls
    if (isVerifyingRef.current) {
      console.log('⏭️ Verification already in progress, skipping...');
      return;
    }

    try {
      isVerifyingRef.current = true;
      
      if (!isRetry) {
        setStatus('verifying');
        setMessage('Verifying your payment with backend...');
        console.log('🔍 Starting payment verification', { trackingId, isRetry });
      } else {
        console.log('🔄 Retrying payment verification', { trackingId, retryCount });
      }

      // Call backend API to get payment status
      const response = await http_get(`subscriptions/payment-status/${trackingId}`, {});

      console.log('📦 Backend Response:', response);

      if (response.code === 1 && response.data) {
        const { subscription: sub, manifest: man, is_active, is_paid } = response.data;
        
        console.log('✅ Payment status received from backend:', {
          subscription_id: sub.id,
          status: sub.status,
          payment_status: sub.payment_status,
          is_active,
          is_paid,
        });

        setSubscription(sub);
        setManifest(man);

        // Determine UI status based on BACKEND confirmation
        if (sub.payment_status === 'Completed' && sub.status === 'Active') {
          console.log('🎉 Payment CONFIRMED as COMPLETED by backend');
          setStatus('success');
          setMessage('Payment Successful!');
          setError(null);
          
          // Clear any stored pending subscription data
          localStorage.removeItem('pending_subscription');
          localStorage.removeItem('subscription_status_cache');
          
          // Stop auto-checking
          if (autoCheckInterval) {
            clearInterval(autoCheckInterval);
            setAutoCheckInterval(null);
          }
          
        } else if (sub.payment_status === 'Failed' || sub.status === 'Failed') {
          console.log('❌ Payment CONFIRMED as FAILED by backend');
          setStatus('failed');
          setMessage('Payment Failed');
          setError(sub.cancelled_reason || 'Your payment could not be processed. Please try again.');
          
          // Stop auto-checking
          if (autoCheckInterval) {
            clearInterval(autoCheckInterval);
            setAutoCheckInterval(null);
          }
          
        } else if (sub.payment_status === 'Processing' || sub.payment_status === 'Pending') {
          console.log('⏳ Payment still PENDING according to backend');
          setStatus('pending');
          setMessage('Payment Being Processed');
          setError('Your payment is being verified. This usually takes a few minutes.');
          
          // Start auto-checking every 10 seconds if not already started
          if (!autoCheckInterval && retryCount < 20) { // Max 20 auto-checks = ~3.3 minutes
            console.log('⏰ Starting auto-check interval');
            const intervalId = window.setInterval(() => {
              setRetryCount(prev => prev + 1);
              verifyPaymentStatus(trackingId, true);
            }, 10000); // Check every 10 seconds
            
            setAutoCheckInterval(intervalId);
          }
          
        } else {
          console.warn('⚠️ Unexpected payment status from backend:', sub.payment_status);
          setStatus('pending');
          setMessage('Payment Status Unknown');
          setError('Unable to determine payment status. Please refresh or contact support.');
        }
        
      } else {
        throw new Error('Invalid response from backend');
      }

    } catch (err: any) {
      console.error('💥 Payment verification error:', err);
      
      // Handle network errors with retry logic
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.warn('⏱️ Request timeout');
        setMessage('Request timeout. Retrying...');
        
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(retryCount + 1);
            verifyPaymentStatus(trackingId, true);
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Connection Timeout');
          setError('Unable to verify payment status due to network issues. Please try again or contact support if payment was deducted.');
        }
        
      } else if (err.response?.status === 404) {
        console.error('❌ Subscription not found');
        setStatus('error');
        setMessage('Subscription Not Found');
        setError('Could not find your subscription. Please contact support if payment was deducted.');
        
      } else {
        setStatus('error');
        setMessage('Verification Failed');
        setError(err.response?.data?.message || 'Unable to verify payment status. Please contact support if payment was deducted.');
      }
      
    } finally {
      isVerifyingRef.current = false;
    }
  };

  const handleManualCheck = () => {
    if (trackingIdRef.current) {
      console.log('🔄 Manual check requested');
      setRetryCount(0);
      verifyPaymentStatus(trackingIdRef.current, false);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retry payment flow');
    localStorage.removeItem('pending_subscription');
    window.location.href = '/subscription/plans';
  };

  const handleGoToDashboard = () => {
    console.log('🏠 Navigate to dashboard');
    navigate('/dashboard');
  };

  const handleGoToMySubscriptions = () => {
    console.log('📋 Navigate to my subscriptions with full reload');
    window.location.href = '/subscription/my-subscriptions';
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        
        {/* Checking/Loading Status */}
        {status === 'checking' && (
          <div className="payment-status checking">
            <FaSpinner className="status-icon spinning" />
            <h2>Loading Payment Information...</h2>
            <p>Initializing verification process</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        )}

        {/* Verifying Status */}
        {status === 'verifying' && (
          <div className="payment-status checking">
            <FaSpinner className="status-icon spinning" />
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment with our backend</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <div className="verification-info">
              <FaInfoCircle />
              <p>Do not close this page. Verification in progress...</p>
            </div>
          </div>
        )}

        {/* Success Status */}
        {status === 'success' && (
          <div className="payment-status success">
            <FaCheckCircle className="status-icon" />
            <h2>🎉 Payment Successful!</h2>
            <p className="success-message">Your subscription is now active and ready to use!</p>
            
            {subscription && (
              <div className="subscription-details">
                <h3>Subscription Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Plan:</span>
                  <span className="detail-value">{subscription.plan?.name || 'Premium Plan'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value success-badge">{subscription.status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value success-badge">{subscription.payment_status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount Paid:</span>
                  <span className="detail-value">
                    {subscription.currency} {Math.round(subscription.amount_paid).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Valid From:</span>
                  <span className="detail-value">
                    {formatDate(subscription.start_date_time)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Valid Until:</span>
                  <span className="detail-value">
                    {formatDate(subscription.end_date_time)}
                  </span>
                </div>
                
                {subscription.payment_method && (
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{subscription.payment_method}</span>
                  </div>
                )}
              </div>
            )}

            <div className="countdown-message">
              Redirecting in {countdown} seconds...
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={handleGoToMySubscriptions}>
                <FaCheckCircle />
                <span>View My Subscriptions</span>
              </button>
              <button className="btn-secondary" onClick={handleGoToDashboard}>
                <FaHome />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* Failed Status */}
        {status === 'failed' && (
          <div className="payment-status failed">
            <FaTimesCircle className="status-icon" />
            <h2>❌ Payment Failed</h2>
            <p className="error-message">{message}</p>
            
            {error && (
              <div className="error-details">
                <p>{error}</p>
              </div>
            )}

            {subscription && (
              <div className="subscription-details">
                <h3>Transaction Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value error-badge">{subscription.status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value error-badge">{subscription.payment_status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tracking ID:</span>
                  <span className="detail-value">{subscription.pesapal_tracking_id}</span>
                </div>
              </div>
            )}

            <div className="failed-actions">
              <button className="btn-retry" onClick={handleRetry}>
                <FaRedo />
                <span>Try Again</span>
              </button>
              <button className="btn-secondary" onClick={handleGoToDashboard}>
                <FaHome />
                <span>Go to Dashboard</span>
              </button>
            </div>

            <div className="support-message">
              <p>Need help? Contact our support team:</p>
              <a href="https://wa.me/16479686445" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                💬 WhatsApp: +1 (647) 968-6445
              </a>
            </div>
          </div>
        )}

        {/* Pending Status */}
        {status === 'pending' && (
          <div className="payment-status pending">
            <FaSpinner className="status-icon spinning" />
            <h2>⏳ Payment Processing</h2>
            <p className="pending-message">{message}</p>
            
            {error && (
              <div className="pending-details">
                <p>{error}</p>
              </div>
            )}

            {subscription && (
              <div className="subscription-details">
                <h3>Transaction Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value pending-badge">{subscription.status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value pending-badge">{subscription.payment_status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">
                    {subscription.currency} {Math.round(subscription.amount_paid).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {autoCheckInterval && (
              <div className="auto-check-info">
                <FaInfoCircle />
                <p>Auto-checking status every 10 seconds... (Check {retryCount + 1}/20)</p>
              </div>
            )}

            <div className="pending-actions">
              <button 
                className="btn-primary" 
                onClick={handleManualCheck}
                disabled={status === 'verifying'}
              >
                <FaRedo />
                <span>Check Status Now</span>
              </button>
              <button className="btn-secondary" onClick={handleGoToDashboard}>
                <FaHome />
                <span>Go to Dashboard</span>
              </button>
            </div>

            <div className="info-message">
              <p>💡 Tip: Mobile Money payments may take up to 5 minutes to process.</p>
              <p>You can safely close this page - you'll receive a notification when payment is confirmed.</p>
            </div>
          </div>
        )}

        {/* Error Status */}
        {status === 'error' && (
          <div className="payment-status failed">
            <FaTimesCircle className="status-icon" />
            <h2>⚠️ {message}</h2>
            
            {error && (
              <div className="error-details">
                <p>{error}</p>
              </div>
            )}

            <div className="failed-actions">
              {trackingIdRef.current && (
                <button className="btn-retry" onClick={handleManualCheck}>
                  <FaRedo />
                  <span>Retry Verification</span>
                </button>
              )}
              <button className="btn-secondary" onClick={handleGoToDashboard}>
                <FaHome />
                <span>Go to Dashboard</span>
              </button>
            </div>

            <div className="support-message">
              <p>Need help? Contact our support team:</p>
              <a href="https://wa.me/16479686445" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                💬 WhatsApp: +1 (647) 968-6445
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentResult;
