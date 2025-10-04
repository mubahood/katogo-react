import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService, { SubscriptionStatus } from '../../services/SubscriptionService';
import './SubscriptionWidget.css';
import { FaCrown, FaExclamationTriangle, FaCheckCircle, FaHistory, FaRedo } from 'react-icons/fa';

/**
 * Subscription Status Widget
 * 
 * Displays current subscription status in user dashboard
 */
const SubscriptionWidget: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatus();
    
    // Refresh status every 5 minutes
    const interval = setInterval(loadStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      setError(null);
      const data = await SubscriptionService.getMySubscription();
      setStatus(data);
    } catch (err: any) {
      console.error('Failed to load subscription status:', err);
      setError('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    window.location.href = '/subscription/plans';
  };

  const handleViewHistory = () => {
    window.location.href = '/subscription/history';
  };

  const getStatusColor = (): string => {
    if (!status?.has_active_subscription) return 'expired';
    if (status.is_in_grace_period) return 'grace';
    if (status.days_remaining <= 3) return 'expiring';
    return 'active';
  };

  const getStatusIcon = () => {
    const statusColor = getStatusColor();
    
    switch (statusColor) {
      case 'active':
        return <FaCheckCircle className="widget-icon active" />;
      case 'expiring':
      case 'grace':
        return <FaExclamationTriangle className="widget-icon warning" />;
      case 'expired':
        return <FaRedo className="widget-icon expired" />;
      default:
        return <FaCrown className="widget-icon" />;
    }
  };

  const getStatusMessage = (): string => {
    if (!status) return '';
    
    if (!status.has_active_subscription) {
      return 'No active subscription';
    }
    
    if (status.is_in_grace_period) {
      return 'Grace period - Renew now!';
    }
    
    if (status.days_remaining <= 3) {
      return `Expires in ${status.days_remaining} day${status.days_remaining !== 1 ? 's' : ''}`;
    }
    
    return 'Active subscription';
  };

  if (loading) {
    return (
      <div className="subscription-widget loading">
        <div className="widget-spinner"></div>
        <p>Loading subscription...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-widget error">
        <p>{error}</p>
        <button onClick={loadStatus} className="retry-btn">
          <FaRedo /> Retry
        </button>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const statusColor = getStatusColor();

  return (
    <div className={`subscription-widget ${statusColor}`}>
      <div className="widget-header">
        {getStatusIcon()}
        <div className="widget-header-text">
          <h3 className="widget-title">Subscription Status</h3>
          <p className="widget-status">{getStatusMessage()}</p>
        </div>
      </div>

      {status.has_active_subscription && status.current_plan && (
        <div className="widget-details">
          <div className="widget-plan">
            <FaCrown className="plan-icon" />
            <div className="plan-info">
              <p className="plan-name">{status.current_plan.name}</p>
              <p className="plan-duration">{status.current_plan.duration_text}</p>
            </div>
          </div>

          <div className="widget-stats">
            <div className="stat-item">
              <span className="stat-label">Days Remaining</span>
              <span className="stat-value">{status.days_remaining}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Expires On</span>
              <span className="stat-value">
                {SubscriptionService.formatDate(status.end_date_time)}
              </span>
            </div>
          </div>

          {status.is_in_grace_period && (
            <div className="grace-period-warning">
              <FaExclamationTriangle />
              <p>Your subscription has expired. Renew now to continue watching!</p>
            </div>
          )}

          {status.days_remaining <= 3 && !status.is_in_grace_period && (
            <div className="expiring-warning">
              <FaExclamationTriangle />
              <p>Your subscription is expiring soon. Renew to avoid interruption!</p>
            </div>
          )}
        </div>
      )}

      {!status.has_active_subscription && (
        <div className="widget-no-subscription">
          <p>Subscribe now to enjoy unlimited movies and HD streaming!</p>
        </div>
      )}

      <div className="widget-actions">
        {status.has_active_subscription ? (
          <>
            <button className="widget-btn renew" onClick={handleSubscribe}>
              <FaRedo />
              <span>Renew</span>
            </button>
            <button className="widget-btn history" onClick={() => window.location.href = '/subscription/my-subscriptions'}>
              <FaCrown />
              <span>My Subscriptions</span>
            </button>
          </>
        ) : (
          <button className="widget-btn subscribe" onClick={handleSubscribe}>
            <FaCrown />
            <span>Subscribe Now</span>
          </button>
        )}
      </div>

      {status.has_pending_subscription && (
        <div className="pending-subscription-notice">
          <p>⏳ You have a pending payment. Please complete it to activate your subscription.</p>
          <button className="check-payment-btn" onClick={handleSubscribe}>
            Check Payment Status
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionWidget;
