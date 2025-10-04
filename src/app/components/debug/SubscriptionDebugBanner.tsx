/**
 * Subscription Debug Banner
 * 
 * Shows current subscription status using the SAME manifest data
 * that's loaded by the app on every page - NO separate API calls!
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManifest } from '../../hooks/useManifest';
import './SubscriptionDebugBanner.css';

interface ManifestSubscription {
  has_active_subscription: boolean;
  days_remaining: number;
  hours_remaining: number;
  is_in_grace_period: boolean;
  subscription_status: string;
  end_date: string | null;
  require_subscription: boolean;
}

export const SubscriptionDebugBanner: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // ✅ USE THE SAME MANIFEST HOOK THAT THE APP USES EVERYWHERE!
  // This ensures we're reading the exact same data that's loaded on page load
  const { manifest, isLoading: loading, error } = useManifest();
  const subscription = manifest?.subscription;

  // Debug logging to console (only in development)
  console.log('🐛 Debug Banner - Using App Manifest:', { 
    hasManifest: !!manifest, 
    hasSubscription: !!subscription,
    subscriptionData: subscription,
    manifestSource: 'useManifest() hook - same as entire app'
  });

  const getStatusColor = () => {
    if (!subscription) return 'gray';
    
    const { has_active_subscription, require_subscription } = subscription;
    
    // Green: Has access
    if (has_active_subscription && !require_subscription) return 'green';
    
    // Red: No access
    if (!has_active_subscription || require_subscription) return 'red';
    
    return 'orange';
  };

  const getStatusText = () => {
    if (loading) return 'Loading manifest...';
    if (error) return `Error: ${error}`;
    if (!manifest) return 'Manifest not loaded yet';
    if (!subscription) return 'No subscription data in manifest';
    
    const { has_active_subscription, require_subscription, subscription_status } = subscription;
    
    if (has_active_subscription && !require_subscription) {
      return `✅ ACCESS GRANTED - Status: ${subscription_status}`;
    }
    
    if (!has_active_subscription) {
      return `❌ NO ACTIVE SUBSCRIPTION - Status: ${subscription_status}`;
    }
    
    if (require_subscription) {
      return `🔒 SUBSCRIPTION REQUIRED - Status: ${subscription_status}`;
    }
    
    return `⚠️ UNKNOWN STATE - Status: ${subscription_status}`;
  };

  const handleGoToPlans = () => {
    console.log('🔀 Debug Banner: Manual navigation to subscription plans');
    navigate('/subscription/plans');
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleCopyData = () => {
    if (subscription) {
      const data = JSON.stringify(subscription, null, 2);
      navigator.clipboard.writeText(data);
      console.log('📋 Copied subscription data to clipboard:', data);
      alert('Subscription data copied to clipboard!');
    }
  };

  const handleCopyFullManifest = () => {
    const data = JSON.stringify({ subscription, manifest }, null, 2);
    navigator.clipboard.writeText(data);
    console.log('📋 Copied full manifest to clipboard');
    alert('Full manifest data copied to clipboard!');
  };

  if (!isVisible) {
    return (
      <div className="debug-banner-collapsed" onClick={handleToggle}>
        🐛 Debug (Click to expand)
      </div>
    );
  }

  return (
    <div className={`debug-banner debug-banner-${getStatusColor()}`}>
      <div className="debug-banner-header">
        <h4>🐛 Subscription Debug Mode (Using App's Manifest)</h4>
        <button className="debug-banner-close" onClick={handleToggle}>
          ✕
        </button>
      </div>

      <div className="debug-banner-content">
        <div className="debug-info-box" style={{ 
          background: '#e3f2fd', 
          padding: '8px', 
          marginBottom: '10px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>� Data Source:</strong> useManifest() hook (same as app) | 
          <strong> Manifest:</strong> {manifest ? '✅ Loaded' : '❌ Not Loaded'} | 
          <strong> Loading:</strong> {loading ? '⏳ Yes' : '✅ No'} | 
          <strong> Subscription:</strong> {subscription ? '✅ Found' : '❌ Missing'}
        </div>

        <div className="debug-status">
          <strong>Status:</strong> {getStatusText()}
        </div>

        {subscription && (
          <div className="debug-details">
            <div className="debug-row">
              <span className="debug-label">has_active_subscription:</span>
              <span className={`debug-value ${subscription.has_active_subscription ? 'success' : 'error'}`}>
                {subscription.has_active_subscription ? '✅ true' : '❌ false'}
              </span>
            </div>

            <div className="debug-row">
              <span className="debug-label">require_subscription:</span>
              <span className={`debug-value ${!subscription.require_subscription ? 'success' : 'error'}`}>
                {subscription.require_subscription ? '🔒 true' : '✅ false'}
              </span>
            </div>

            <div className="debug-row">
              <span className="debug-label">subscription_status:</span>
              <span className="debug-value">{subscription.subscription_status}</span>
            </div>

            <div className="debug-row">
              <span className="debug-label">days_remaining:</span>
              <span className="debug-value">{subscription.days_remaining}</span>
            </div>

            <div className="debug-row">
              <span className="debug-label">hours_remaining:</span>
              <span className="debug-value">{subscription.hours_remaining}</span>
            </div>

            <div className="debug-row">
              <span className="debug-label">is_in_grace_period:</span>
              <span className="debug-value">
                {subscription.is_in_grace_period ? '⚠️ true' : '✅ false'}
              </span>
            </div>

            {subscription.end_date && (
              <div className="debug-row">
                <span className="debug-label">end_date:</span>
                <span className="debug-value">
                  {new Date(subscription.end_date).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="debug-actions">
          <button 
            className="debug-btn debug-btn-secondary" 
            onClick={handleCopyData}
            disabled={!subscription}
          >
            📋 Copy Subscription
          </button>

          <button 
            className="debug-btn debug-btn-secondary" 
            onClick={handleCopyFullManifest}
            disabled={!subscription || loading}
            title="Copy complete manifest data"
          >
            📦 Copy Full Manifest
          </button>

          <button 
            className="debug-btn debug-btn-warning" 
            onClick={handleGoToPlans}
          >
            🔀 Go to Plans (Manual)
          </button>
        </div>

        <div className="debug-note">
          ℹ️ <strong>Debug Mode Active:</strong> Reading from the SAME manifest that loads on every page.
          No separate API calls - using the app's existing useManifest() hook.
          Check browser console for detailed logs.
        </div>
      </div>
    </div>
  );
};
