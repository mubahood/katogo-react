// src/app/pages/account/AccountSubscriptionManagement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService, { 
  Subscription, 
  SubscriptionStatus 
} from '../../services/SubscriptionService';
import { 
  FaCrown, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaSyncAlt,
  FaHistory,
  FaPlus
} from 'react-icons/fa';
import './AccountSubscriptionManagement.css';

/**
 * Account Subscription Management Page
 * 
 * Comprehensive subscription management under account layout
 * Following dark mode design protocols
 */
const AccountSubscriptionManagement: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both status and history
      const [statusData, historyData] = await Promise.all([
        SubscriptionService.getMySubscription(),
        SubscriptionService.getHistory(10)
      ]);
      
      setStatus(statusData);
      setSubscriptions(historyData.subscriptions || []);
    } catch (err: any) {
      console.error('Failed to load subscription data:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeNow = () => {
    window.location.href = '/subscription/plans';
  };

  const handleRenewSubscription = () => {
    window.location.href = '/subscription/plans';
  };

  const getFilteredSubscriptions = () => {
    switch (filter) {
      case 'active':
        return subscriptions.filter(sub => sub.is_active);
      case 'expired':
        return subscriptions.filter(sub => sub.is_expired);
      default:
        return subscriptions;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadgeClass = (subscription: Subscription) => {
    if (subscription.is_active) return 'status-badge status-active';
    if (subscription.is_in_grace_period) return 'status-badge status-grace';
    if (subscription.is_expired) return 'status-badge status-expired';
    return 'status-badge status-pending';
  };

  const getStatusIcon = (subscription: Subscription) => {
    if (subscription.is_active) return <FaCheckCircle />;
    if (subscription.is_in_grace_period) return <FaExclamationTriangle />;
    if (subscription.is_expired) return <FaTimesCircle />;
    return <FaClock />;
  };

  if (loading) {
    return (
      <div className="subscription-management-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-management-container">
        <div className="error-state">
          <FaTimesCircle className="error-icon" />
          <h3>Error Loading Subscriptions</h3>
          <p>{error}</p>
          <button onClick={loadData} className="btn-retry">
            <FaSyncAlt /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredSubs = getFilteredSubscriptions();

  return (
    <div className="subscription-management-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <FaCrown className="header-icon" />
          <div>
            <h1>My Subscriptions</h1>
            <p className="header-subtitle">Manage your UgFlix subscription plans</p>
          </div>
        </div>
      </div>

      {/* Current Status Card */}
      <div className="current-status-card">
        {status?.has_subscription && status.is_active ? (
          <>
            <div className="status-header">
              <FaCheckCircle className="status-icon active" />
              <h2>Active Subscription</h2>
            </div>
            
            <div className="status-details">
              <div className="status-info-grid">
                <div className="info-item">
                  <label>Plan</label>
                  <div className="info-value">
                    <FaCrown /> {status.plan?.name || 'Premium'}
                  </div>
                </div>
                
                <div className="info-item">
                  <label>Duration</label>
                  <div className="info-value">
                    {status.plan?.duration_text || 'N/A'}
                  </div>
                </div>
                
                <div className="info-item">
                  <label>Days Remaining</label>
                  <div className={`info-value ${status.days_remaining <= 3 ? 'expiring' : ''}`}>
                    <FaCalendarAlt /> {status.days_remaining} days
                  </div>
                </div>
                
                <div className="info-item">
                  <label>Expires On</label>
                  <div className="info-value">
                    {formatDate(status.end_date || '')}
                  </div>
                </div>
              </div>

              {status.is_in_grace_period && (
                <div className="grace-period-alert">
                  <FaExclamationTriangle />
                  <div>
                    <strong>Grace Period Active</strong>
                    <p>Your subscription has expired. Renew now to continue watching!</p>
                  </div>
                </div>
              )}

              {status.days_remaining <= 3 && !status.is_in_grace_period && (
                <div className="expiring-alert">
                  <FaExclamationTriangle />
                  <div>
                    <strong>Expiring Soon</strong>
                    <p>Your subscription expires in {status.days_remaining} day{status.days_remaining !== 1 ? 's' : ''}. Renew to avoid interruption!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="status-actions">
              <button onClick={handleRenewSubscription} className="btn-primary">
                <FaSyncAlt /> Renew Subscription
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="status-header no-subscription">
              <FaTimesCircle className="status-icon inactive" />
              <h2>No Active Subscription</h2>
            </div>
            
            <div className="no-subscription-content">
              <p>You don't have an active subscription. Subscribe now to enjoy:</p>
              <ul className="benefits-list">
                <li><FaCheckCircle /> Unlimited streaming of movies and series</li>
                <li><FaCheckCircle /> HD quality on all devices</li>
                <li><FaCheckCircle /> Exclusive content and early access</li>
                <li><FaCheckCircle /> Download for offline viewing</li>
              </ul>
              
              <button onClick={handleSubscribeNow} className="btn-subscribe">
                <FaPlus /> Subscribe Now
              </button>
            </div>
          </>
        )}
      </div>

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <div className="subscription-history-section">
          <div className="section-header">
            <h2>
              <FaHistory /> Subscription History
            </h2>
            
            <div className="filter-tabs">
              <button 
                className={filter === 'all' ? 'filter-tab active' : 'filter-tab'}
                onClick={() => setFilter('all')}
              >
                All ({subscriptions.length})
              </button>
              <button 
                className={filter === 'active' ? 'filter-tab active' : 'filter-tab'}
                onClick={() => setFilter('active')}
              >
                Active ({subscriptions.filter(s => s.is_active).length})
              </button>
              <button 
                className={filter === 'expired' ? 'filter-tab active' : 'filter-tab'}
                onClick={() => setFilter('expired')}
              >
                Expired ({subscriptions.filter(s => s.is_expired).length})
              </button>
            </div>
          </div>

          <div className="subscriptions-list">
            {filteredSubs.length > 0 ? (
              filteredSubs.map((subscription) => (
                <div key={subscription.id} className="subscription-card">
                  <div className="subscription-card-header">
                    <div className="plan-info">
                      <FaCrown className="plan-icon" />
                      <div>
                        <h3>{subscription.plan?.name || 'Subscription'}</h3>
                        <p className="plan-duration">{subscription.plan?.duration_text || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className={getStatusBadgeClass(subscription)}>
                      {getStatusIcon(subscription)}
                      <span>{subscription.status}</span>
                    </div>
                  </div>

                  <div className="subscription-card-body">
                    <div className="subscription-details">
                      <div className="detail-row">
                        <span className="detail-label">Amount Paid:</span>
                        <span className="detail-value">
                          {subscription.plan?.currency || 'UGX'} {subscription.amount_paid?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">
                          {formatDate(subscription.start_date)}
                        </span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">
                          {formatDate(subscription.end_date)}
                        </span>
                      </div>
                      
                      {subscription.is_active && (
                        <div className="detail-row highlight">
                          <span className="detail-label">Days Remaining:</span>
                          <span className={`detail-value ${subscription.days_remaining <= 3 ? 'expiring' : ''}`}>
                            {subscription.days_remaining} days
                          </span>
                        </div>
                      )}
                      
                      <div className="detail-row">
                        <span className="detail-label">Payment Status:</span>
                        <span className="detail-value">
                          {subscription.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaHistory className="empty-icon" />
                <p>No {filter !== 'all' ? filter : ''} subscriptions found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSubscriptionManagement;
