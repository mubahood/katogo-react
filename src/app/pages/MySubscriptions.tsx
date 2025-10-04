import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService from '../services/SubscriptionService';
import './MySubscriptions-dark.css';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaSyncAlt,
  FaCrown,
  FaExclamationTriangle,
  FaCalendarAlt
} from 'react-icons/fa';

interface Subscription {
  id: number;
  plan: {
    name: string;
    currency: string;
    actual_price: number;
    duration_text: string;
    duration_days: number;
  };
  status: string;
  payment_status: string;
  start_date_time: string;
  end_date_time: string;
  days_remaining: number;
  is_active: boolean;
  is_in_grace_period: boolean;
  is_expired: boolean;
  merchant_reference: string;
  is_extension: boolean;
  created_at: string;
}

interface SubscriptionHistoryData {
  subscriptions: Subscription[];
  total_spent: number;
  currency: string;
}

/**
 * My Subscriptions Page
 * 
 * Comprehensive view of all user subscriptions with filtering and status checking
 */
const MySubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<{ [key: number]: boolean }>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('UGX');
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, subscriptions]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: SubscriptionHistoryData = await SubscriptionService.getHistory(50); // Get more subscriptions
      setSubscriptions(data.subscriptions || []);
      setTotalSpent(data.total_spent || 0);
      setCurrency(data.currency || 'UGX');
    } catch (err: any) {
      console.error('Failed to load subscriptions:', err);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = subscriptions;
    
    switch (filter) {
      case 'active':
        filtered = subscriptions.filter(sub => sub.is_active || sub.status === 'Active');
        break;
      case 'pending':
        filtered = subscriptions.filter(sub => sub.status === 'Pending');
        break;
      case 'expired':
        filtered = subscriptions.filter(sub => sub.is_expired || sub.status === 'Expired');
        break;
      default:
        filtered = subscriptions;
    }
    
    setFilteredSubscriptions(filtered);
  };

  const handleCheckPaymentStatus = async (subscriptionId: number) => {
    try {
      setCheckingStatus(prev => ({ ...prev, [subscriptionId]: true }));
      
      const updatedSubscription = await SubscriptionService.checkPaymentStatus({
        subscription_id: subscriptionId
      });

      // Update the subscription in the list
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, ...updatedSubscription } : sub
      );
      setSubscriptions(updatedSubscriptions);

      // Show success message
      if (updatedSubscription.status === 'Active') {
        alert('✅ Payment confirmed! Your subscription is now active.');
      } else if (updatedSubscription.payment_status === 'Failed') {
        alert('❌ Payment failed. Please try again or contact support.');
      } else {
        alert(`Status: ${updatedSubscription.status} | Payment: ${updatedSubscription.payment_status}`);
      }
    } catch (err: any) {
      console.error('Failed to check payment status:', err);
      alert('Failed to check payment status. Please try again.');
    } finally {
      setCheckingStatus(prev => ({ ...prev, [subscriptionId]: false }));
    }
  };

  const handleRetryPayment = async (subscriptionId: number) => {
    try {
      const result = await SubscriptionService.retryPayment({
        subscription_id: subscriptionId
      });
      
      // Redirect to payment gateway
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
      }
    } catch (err: any) {
      console.error('Failed to retry payment:', err);
      alert('Failed to retry payment. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <FaCheckCircle className="status-icon active" />;
      case 'Expired':
        return <FaTimesCircle className="status-icon expired" />;
      case 'Cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      case 'Pending':
        return <FaClock className="status-icon pending" />;
      case 'Failed':
        return <FaExclamationTriangle className="status-icon failed" />;
      default:
        return <FaClock className="status-icon" />;
    }
  };

  const getStatusClass = (status: string) => {
    return status.toLowerCase();
  };

  const getFilterCounts = () => {
    return {
      all: subscriptions.length,
      active: subscriptions.filter(sub => sub.is_active || sub.status === 'Active').length,
      pending: subscriptions.filter(sub => sub.status === 'Pending').length,
      expired: subscriptions.filter(sub => sub.is_expired || sub.status === 'Expired').length,
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="my-subscriptions-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-subscriptions-container">
        <div className="error-state">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
          <button onClick={loadSubscriptions} className="retry-btn">
            <FaSyncAlt /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-subscriptions-container">
      {/* Header */}
      <div className="subscriptions-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <FaCrown /> My Subscriptions
            </h1>
            <p className="page-subtitle">
              Manage all your subscriptions and check payment status
            </p>
          </div>
          <button 
            className="new-subscription-btn" 
            onClick={() => navigate('/subscription/plans')}
          >
            + New Subscription
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaCrown />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Subscriptions</p>
            <p className="stat-value">{subscriptions.length}</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <p className="stat-label">Active</p>
            <p className="stat-value">{counts.active}</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-info">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{counts.pending}</p>
          </div>
        </div>
        <div className="stat-card spent">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value">{currency} {Math.round(totalSpent).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({counts.active})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({counts.pending})
        </button>
        <button 
          className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
          onClick={() => setFilter('expired')}
        >
          Expired ({counts.expired})
        </button>
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="empty-state">
          <FaCrown className="empty-icon" />
          <h3>No subscriptions found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't subscribed yet. Start enjoying premium content!"
              : `No ${filter} subscriptions found.`
            }
          </p>
          <button 
            className="subscribe-btn" 
            onClick={() => navigate('/subscription/plans')}
          >
            View Subscription Plans
          </button>
        </div>
      ) : (
        <div className="subscriptions-grid">
          {filteredSubscriptions.map((sub) => (
            <div key={sub.id} className={`subscription-card ${getStatusClass(sub.status)}`}>
              {/* Card Header */}
              <div className="card-header">
                <div className="plan-info">
                  <h3 className="plan-name">{sub.plan.name}</h3>
                  <p className="plan-duration">{sub.plan.duration_text}</p>
                </div>
                <div className="status-badges">
                  <span className={`status-badge ${getStatusClass(sub.status)}`}>
                    {getStatusIcon(sub.status)}
                    <span>{sub.status}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">Amount Paid:</span>
                  <span className="info-value price">
                    {sub.plan.currency} {Math.round(sub.plan.actual_price).toLocaleString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Payment Status:</span>
                  <span className={`payment-status ${sub.payment_status.toLowerCase()}`}>
                    {sub.payment_status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Start Date:</span>
                  <span className="info-value">
                    {SubscriptionService.formatDate(sub.start_date_time)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">End Date:</span>
                  <span className="info-value">
                    {SubscriptionService.formatDate(sub.end_date_time)}
                  </span>
                </div>
                
                {sub.is_active && (
                  <div className="info-row highlight">
                    <span className="info-label">Days Remaining:</span>
                    <span className="info-value days">
                      {sub.days_remaining} {sub.days_remaining === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                )}

                {sub.is_in_grace_period && (
                  <div className="grace-period-notice">
                    <FaExclamationTriangle /> Grace Period Active
                  </div>
                )}

                {sub.merchant_reference && (
                  <div className="info-row">
                    <span className="info-label">Reference:</span>
                    <span className="info-value reference">
                      {sub.merchant_reference}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              {sub.status === 'Pending' && (
                <div className="card-actions">
                  <button 
                    className="action-btn check-status"
                    onClick={() => handleCheckPaymentStatus(sub.id)}
                    disabled={checkingStatus[sub.id]}
                  >
                    {checkingStatus[sub.id] ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <FaSyncAlt />
                        <span>Check Status</span>
                      </>
                    )}
                  </button>
                  {sub.payment_status === 'Failed' && (
                    <button 
                      className="action-btn retry-payment"
                      onClick={() => handleRetryPayment(sub.id)}
                    >
                      <FaSyncAlt />
                      <span>Retry Payment</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* History Link */}
      <div className="history-link-section">
        <button 
          className="history-link-btn"
          onClick={() => navigate('/subscription/history')}
        >
          View Detailed History →
        </button>
      </div>
    </div>
  );
};

export default MySubscriptions;
