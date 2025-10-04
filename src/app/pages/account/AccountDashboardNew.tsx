// src/app/pages/account/AccountDashboardNew.tsx
/**
 * 🎯 ACCOUNT DASHBOARD - Production Ready with Real Data
 * 
 * Features:
 * ✅ Real statistics from backend API
 * ✅ Squared UgFlix design (border-radius: 0)
 * ✅ Small padding (8-16px)
 * ✅ Subscription status tracking
 * ✅ User activity summaries
 * ✅ Fully responsive
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiVideo, FiHeart, FiClock, FiStar, FiShoppingBag, 
  FiPackage, FiMessageCircle, FiPlayCircle, FiEye,
  FiArrowRight
} from 'react-icons/fi';
import { RootState } from '../../store/store';
import AccountPageWrapper from '../../components/Account/AccountPageWrapper';
import AccountCard from '../../components/Account/AccountCard';
import { useAppCounts } from '../../hooks/useManifest';
import './AccountDashboardNew.css';

interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

const AccountDashboardNew: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const appCounts = useAppCounts();
  const manifestData = useSelector((state: RootState) => state.manifest.data);

  // Get dashboard statistics from manifest
  const dashboardStats = manifestData?.dashboard_stats || {
    watchlist_count: 0,
    watch_history_count: 0,
    liked_movies_count: 0,
    products_count: 0,
    active_chats_count: 0,
    total_orders_count: 0,
  };

  // Get subscription information
  const subscriptionInfo = manifestData?.subscription || {
    has_active_subscription: false,
    days_remaining: 0,
    subscription_status: 'No Active Subscription',
  };

  // Dashboard stats with real data
  const stats: DashboardStat[] = [
    {
      id: 'watchlist',
      label: 'Watchlist',
      value: dashboardStats.watchlist_count,
      icon: <FiVideo />,
      color: '#B71C1C',
      link: '/account/watchlist'
    },
    {
      id: 'likes',
      label: 'Liked Movies',
      value: dashboardStats.liked_movies_count,
      icon: <FiHeart />,
      color: '#E91E63',
      link: '/account/likes'
    },
    {
      id: 'history',
      label: 'Watch History',
      value: dashboardStats.watch_history_count,
      icon: <FiEye />,
      color: '#9C27B0',
      link: '/account/history'
    },
    {
      id: 'products',
      label: 'My Products',
      value: dashboardStats.products_count,
      icon: <FiShoppingBag />,
      color: '#2196F3',
      link: '/account/products'
    },
    {
      id: 'chats',
      label: 'Active Chats',
      value: dashboardStats.active_chats_count,
      icon: <FiMessageCircle />,
      color: '#FF5722',
      link: '/account/chats'
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: dashboardStats.total_orders_count,
      icon: <FiPackage />,
      color: '#4CAF50',
      link: '/account/orders'
    }
  ];

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'browse-movies',
      title: 'Browse Movies',
      description: 'Discover new content',
      icon: <FiPlayCircle />,
      link: '/movies',
      color: '#B71C1C'
    },
    {
      id: 'my-products',
      title: 'My Products',
      description: 'Manage your listings',
      icon: <FiShoppingBag />,
      link: '/account/products',
      color: '#2196F3'
    }, 
    {
      id: 'messages',
      title: 'Messages',
      description: 'Check your chats',
      icon: <FiMessageCircle />,
      link: '/account/chats',
      color: '#FF5722'
    }
  ];

  return (
    <AccountPageWrapper
      title={`Welcome back, ${user?.name || 'User'}!`}
      subtitle="Here's what's happening with your account"
      isLoading={false}
    >
      <div className="dashboard-container">
        {/* Subscription Status Card */}
        {subscriptionInfo.has_active_subscription ? (
          <div className="subscription-card active">
            <div className="subscription-icon">
              <FiStar />
            </div>
            <div className="subscription-content">
              <h3 className="subscription-status">Active Subscription</h3>
              <p className="subscription-details">
                {subscriptionInfo.days_remaining} days remaining
              </p>
            </div>
            <Link to="/account/subscriptions" className="subscription-action">
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="subscription-card inactive">
            <div className="subscription-icon">
              <FiStar />
            </div>
            <div className="subscription-content">
              <h3 className="subscription-status">No Active Subscription</h3>
              <p className="subscription-details">
                Subscribe to watch unlimited movies
              </p>
            </div>
            <Link to="/account/subscriptions" className="subscription-action">
              <FiArrowRight />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <Link
              key={stat.id}
              to={stat.link}
              className="stat-card"
              style={{ '--stat-color': stat.color } as React.CSSProperties}
            >
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
              <div className="stat-arrow">
                <FiArrowRight />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <AccountCard
          title="Quick Actions"
          subtitle="Frequently used features"
        >
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.link}
                className="quick-action-card"
              >
                <div
                  className="action-icon-wrapper"
                  style={{ '--action-color': action.color } as React.CSSProperties}
                >
                  {action.icon}
                </div>
                <div className="action-content">
                  <h4 className="action-title">{action.title}</h4>
                  <p className="action-description">{action.description}</p>
                </div>
                <FiArrowRight className="action-arrow" />
              </Link>
            ))}
          </div>
        </AccountCard>
      </div>
    </AccountPageWrapper>
  );
};

export default AccountDashboardNew;
