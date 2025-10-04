import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService, { SubscriptionPlan } from '../services/SubscriptionService';
import WhatsAppButton from '../components/WhatsAppButton';
import './SubscriptionPlans-dark.css';
import { FaCheck, FaCrown, FaFire, FaStar } from 'react-icons/fa';

/**
 * Subscription Plans Page
 * 
 * Displays all available subscription plans with features and pricing
 */
const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingPending, setCheckingPending] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'lg' | 'sw'>('en');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check for pending subscription FIRST before loading plans
    checkPendingSubscription();
  }, []);

  useEffect(() => {
    // Only load plans if pending check is complete
    if (!checkingPending) {
      loadPlans();
    }
  }, [language, checkingPending]);

  /**
   * Check if user has a pending subscription
   * If yes, redirect to pending subscription page
   * This prevents users from creating multiple pending subscriptions
   */
  const checkPendingSubscription = async () => {
    try {
      setCheckingPending(true);
      console.log('🔍 Checking for pending subscriptions...');
      
      const response = await SubscriptionService.getPendingSubscription();
      
      if (response.has_pending && response.pending_subscription) {
        console.log('⚠️ User has pending subscription, redirecting to pending page...');
        console.log('Pending subscription:', response.pending_subscription);
        
        // Force redirect with full page reload - user should not see plans
        window.location.href = '/subscription/pending';
        return; // Stop execution
      }
      
      console.log('✅ No pending subscription found, allowing access to plans');
    } catch (err: any) {
      console.error('❌ Failed to check pending subscription:', err);
      
      // If backend error, still allow showing plans (graceful degradation)
      if (err.response?.status === 404 || err.response?.status === 500) {
        console.log('⚠️ Backend endpoint not ready, continuing to show plans...');
      }
    } finally {
      setCheckingPending(false);
    }
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPlans = await SubscriptionService.getPlans(language);
      setPlans(fetchedPlans);
    } catch (err: any) {
      console.error('Failed to load plans:', err);
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    try {
      setSubscribing(true);
      setSelectedPlanId(planId);
      setError(null);

      // Double-check for pending subscription before creating new one
      const pendingCheck = await SubscriptionService.getPendingSubscription();
      if (pendingCheck.has_pending && pendingCheck.pending_subscription) {
        console.log('⚠️ Pending subscription detected during subscribe, redirecting...');
        window.location.href = '/subscription/pending';
        return;
      }

      // Create subscription
      const response = await SubscriptionService.createSubscription({
        plan_id: planId,
        callback_url: `${window.location.origin}/subscription/callback`,
      });

      // Store subscription info for tracking
      localStorage.setItem('pending_subscription_check', JSON.stringify({
        subscription_id: response.subscription_id,
        order_tracking_id: response.order_tracking_id,
        started_at: new Date().toISOString()
      }));

      // Open payment in new tab
      window.open(response.redirect_url, '_blank');

      // Redirect to pending subscription page with full reload for fresh state
      window.location.href = '/subscription/pending';
      
    } catch (err: any) {
      console.error('Failed to create subscription:', err);
      setError(err.response?.data?.message || 'Failed to create subscription. Please try again.');
      setSubscribing(false);
      setSelectedPlanId(null);
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.is_featured) return <FaCrown className="plan-badge-icon" />;
    if (plan.is_popular) return <FaFire className="plan-badge-icon" />;
    if (plan.is_trial) return <FaStar className="plan-badge-icon" />;
    return null;
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    const badge = SubscriptionService.getPlanBadge(plan);
    if (!badge) return null;

    return (
      <div className={`plan-badge ${plan.is_featured ? 'featured' : plan.is_popular ? 'popular' : 'trial'}`}>
        {getPlanIcon(plan)}
        <span>{badge}</span>
      </div>
    );
  };

  // Show loader while checking for pending subscriptions
  if (checkingPending) {
    return (
      <div className="subscription-container">
        <div className="subscription-loading">
          <div className="spinner"></div>
          <p>Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show loader while loading plans
  if (loading) {
    return (
      <div className="subscription-container">
        <div className="subscription-loading">
          <div className="spinner"></div>
          <p>Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      {/* Hero Section */}
      <div className="subscription-hero">
        <h1 className="subscription-title">
          Choose Your Subscription Plan
        </h1>
        <p className="subscription-subtitle">
          Unlimited movies, HD streaming, and ad-free experience
        </p>
        
        {/* Language Selector */}
        <div className="language-selector">
          <button
            className={language === 'en' ? 'active' : ''}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <button
            className={language === 'lg' ? 'active' : ''}
            onClick={() => setLanguage('lg')}
          >
            Luganda
          </button>
          <button
            className={language === 'sw' ? 'active' : ''}
            onClick={() => setLanguage('sw')}
          >
            Swahili
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Plans Grid */}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.is_featured ? 'featured' : ''} ${selectedPlanId === plan.id ? 'selected' : ''}`}
          >
            {getPlanBadge(plan)}

            <div className="plan-header">
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-pricing">
              {plan.discount_percentage > 0 && (
                <div className="plan-original-price">
                  {plan.currency} {Math.round(plan.price).toLocaleString()}
                </div>
              )}
              <div className="plan-price">
                <span className="currency">{plan.currency}</span>
                <span className="amount">{Math.round(plan.actual_price).toLocaleString()}</span>
              </div>
              <div className="plan-duration">{plan.duration_text}</div>
              <div className="plan-daily-cost">
                {plan.currency} {Math.round(plan.daily_cost)} per day
              </div>
            </div>

            <div className="plan-features">
              {plan.features_array.map((feature, index) => (
                <div key={index} className="plan-feature">
                  <FaCheck className="feature-check" />
                  <span dangerouslySetInnerHTML={{ __html: feature }} />
                </div>
              ))}
            </div>

            <button
              className="subscribe-btn"
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribing}
            >
              {subscribing && selectedPlanId === plan.id ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Subscribe Now</span>
              )}
            </button>

          </div>
        ))}
      </div>

      {/* WhatsApp Support */}
      <div className="whatsapp-container">
        <p>Need help? Contact us on WhatsApp</p>
        <WhatsAppButton />
      </div>
    </div>
  );
};

export default SubscriptionPlans;
