// src/app/components/subscription/SubscriptionTimerWidget.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService from '../../services/SubscriptionService';
import { FaCrown, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import './SubscriptionTimerWidget.css';

interface SubscriptionStatus {
  has_subscription: boolean;
  is_active: boolean;
  days_remaining: number;
  hours_remaining?: number;
  is_in_grace_period: boolean;
  end_date_time?: string;
}

/**
 * Subscription Timer Widget
 * 
 * Strategic widget showing subscription time remaining
 * Positioned prominently in the header
 */
const SubscriptionTimerWidget: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await SubscriptionService.getMySubscription();
      
      // Calculate hours remaining if less than 2 days
      if (data.days_remaining <= 2 && data.end_date) {
        const endDate = new Date(data.end_date);
        const now = new Date();
        const hoursRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
        data.hours_remaining = hoursRemaining;
      }
      
      setStatus(data);
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    window.location.href = '/account/subscriptions';
  };

  // Don't show if no subscription or not active
  if (loading || !status?.has_subscription || !status.is_active) {
    return null;
  }

  const getWidgetClass = () => {
    if (status.is_in_grace_period) return 'subscription-timer-widget grace-period';
    if (status.days_remaining === 0) return 'subscription-timer-widget critical';
    if (status.days_remaining <= 1) return 'subscription-timer-widget warning';
    if (status.days_remaining <= 3) return 'subscription-timer-widget attention';
    return 'subscription-timer-widget normal';
  };

  const getTimeDisplay = () => {
    if (status.days_remaining === 0 && status.hours_remaining !== undefined) {
      return `${status.hours_remaining}h`;
    }
    
    if (status.days_remaining <= 2 && status.hours_remaining !== undefined) {
      return `${status.days_remaining}d ${status.hours_remaining % 24}h`;
    }
    
    return `${status.days_remaining}d`;
  };

  const getIcon = () => {
    if (status.is_in_grace_period || status.days_remaining <= 1) {
      return <FaExclamationTriangle />;
    }
    if (status.days_remaining <= 3) {
      return <FaClock />;
    }
    return <FaCrown />;
  };

  return (
    <div className={getWidgetClass()} onClick={handleClick} role="button" tabIndex={0} title="View subscription details">
      {getIcon()}
      <span className="time-display">{getTimeDisplay()}</span>
    </div>
  );
};

export default SubscriptionTimerWidget;
