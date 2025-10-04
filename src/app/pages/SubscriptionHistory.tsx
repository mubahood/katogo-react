import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService from '../services/SubscriptionService';
import './SubscriptionHistory-dark.css';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock, FaDownload } from 'react-icons/fa';

interface SubscriptionHistoryData {
  subscriptions: any[];
  total_spent: number;
  currency: string;
}

/**
 * Subscription History Page
 * 
 * Displays user's subscription payment history
 */
const SubscriptionHistory: React.FC = () => {
  const [history, setHistory] = useState<SubscriptionHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SubscriptionService.getHistory();
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError('Failed to load subscription history');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPaymentStatus = async (subscriptionId: number) => {
    try {
      setCheckingStatus(prev => ({ ...prev, [subscriptionId]: true }));
      
      const updatedSubscription = await SubscriptionService.checkPaymentStatus({
        subscription_id: subscriptionId
      });

      // Update the subscription in the history
      if (history && history.subscriptions) {
        const updatedSubscriptions = history.subscriptions.map(sub => 
          sub.id === subscriptionId ? updatedSubscription : sub
        );
        setHistory({ ...history, subscriptions: updatedSubscriptions });
      }

      // Show success message
      alert(`Payment status checked successfully. Status: ${updatedSubscription.status}, Payment: ${updatedSubscription.payment_status}`);
    } catch (err: any) {
      console.error('Failed to check payment status:', err);
      alert('Failed to check payment status. Please try again.');
    } finally {
      setCheckingStatus(prev => ({ ...prev, [subscriptionId]: false }));
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
      default:
        return <FaClock className="status-icon" />;
    }
  };

  const getStatusClass = (status: string) => {
    return status.toLowerCase();
  };

  const getPaymentStatusClass = (status: string) => {
    return status.toLowerCase();
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSubscribeAgain = () => {
    navigate('/subscription/plans');
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="history-error">
          <p>{error}</p>
          <button onClick={loadHistory} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!history) {
    return null;
  }

  return (
    <div className="history-container">
      {/* Header */}
      <div className="history-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="history-title">Subscription History</h1>
        <p className="history-subtitle">View your past subscriptions and payments</p>
      </div>

      {/* Summary Card */}
      <div className="history-summary">
        <div className="summary-stat">
          <span className="summary-label">Total Subscriptions</span>
          <span className="summary-value">{history.subscriptions?.length || 0}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Total Spent</span>
          <span className="summary-value">
            {history.currency || 'UGX'} {Math.round(history.total_spent || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* History List */}
      {!history.subscriptions || history.subscriptions.length === 0 ? (
        <div className="history-empty">
          <p>You haven't subscribed yet</p>
          <button className="subscribe-btn" onClick={handleSubscribeAgain}>
            Subscribe Now
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.subscriptions?.map((sub) => (
            <div key={sub.id} className={`history-item ${getStatusClass(sub.status)}`}>
              <div className="history-item-header">
                <div className="history-item-title">
                  <h3>{sub.plan.name}</h3>
                  <div className="history-item-badges">
                    <span className={`status-badge ${getStatusClass(sub.status)}`}>
                      {getStatusIcon(sub.status)}
                      <span>{sub.status}</span>
                    </span>
                    <span className={`payment-badge ${getPaymentStatusClass(sub.payment_status)}`}>
                      {sub.payment_status}
                    </span>
                  </div>
                </div>
                <div className="history-item-amount">
                  <span className="amount-label">Amount Paid</span>
                  <span className="amount-value">
                    {sub.plan.currency} {Math.round(sub.plan.actual_price).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="history-item-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{sub.plan.duration_text}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method</span>
                    <span className="detail-value">{sub.payment_method || 'Pesapal'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Start Date</span>
                    <span className="detail-value">
                      {SubscriptionService.formatDate(sub.start_date_time)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">End Date</span>
                    <span className="detail-value">
                      {SubscriptionService.formatDate(sub.end_date_time)}
                    </span>
                  </div>
                </div>

                {sub.merchant_reference && (
                  <div className="reference-info">
                    <span className="reference-label">Reference:</span>
                    <span className="reference-value">{sub.merchant_reference}</span>
                  </div>
                )}

                {sub.is_extension && (
                  <div className="extension-badge">
                    Extended from previous subscription
                  </div>
                )}

                {sub.cancelled_at && (
                  <div className="cancelled-info">
                    <p>Cancelled on {SubscriptionService.formatDate(sub.cancelled_at)}</p>
                    {sub.cancelled_reason && <p>Reason: {sub.cancelled_reason}</p>}
                  </div>
                )}

                {/* Check Payment Status Button */}
                {sub.status === 'Pending' && sub.payment_status === 'Pending' && (
                  <div className="subscription-actions">
                    <button 
                      className="check-status-btn"
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
                          <FaCheckCircle />
                          <span>Check Payment Status</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      {history.subscriptions && history.subscriptions.length > 0 && (
        <div className="history-footer">
          <button className="subscribe-again-btn" onClick={handleSubscribeAgain}>
            Subscribe Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionHistory;
