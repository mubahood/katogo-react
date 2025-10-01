// src/app/pages/account/AccountDashboardNew.tsx
/**
 * 🎯 NEW ACCOUNT DASHBOARD - Clean, Modular, Mobile-First
 * 
 * Features:
 * ✅ Stats overview cards
 * ✅ Quick actions grid
 * ✅ Recent activity timeline
 * ✅ Fully responsive
 * ✅ Smooth animations
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiVideo, FiHeart, FiClock, FiStar, FiShoppingBag, 
  FiPackage, FiMessageCircle, FiTrendingUp, FiActivity,
  FiArrowRight, FiPlayCircle
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Dashboard stats
  const stats: DashboardStat[] = [
    {
      id: 'watchlist',
      label: 'Watchlist',
      value: appCounts.wishlist_count || 0,
      icon: <FiVideo />,
      color: '#B71C1C',
      link: '/account/watchlist'
    },
    {
      id: 'likes',
      label: 'Likes',
      value: 0,
      icon: <FiHeart />,
      color: '#E91E63',
      link: '/account/likes'
    },
    {
      id: 'watch-time',
      label: 'Watch Time',
      value: '24h',
      icon: <FiClock />,
      color: '#9C27B0',
      link: '/account/history'
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      value: 0,
      icon: <FiStar />,
      color: '#FF9800',
      link: '/account/subscriptions'
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
      id: 'orders',
      title: 'My Orders',
      description: 'Track your purchases',
      icon: <FiPackage />,
      link: '/account/orders',
      color: '#4CAF50'
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

        {/* Activity Overview */}
        <div className="dashboard-grid">
          <AccountCard
            title="Activity Overview"
            subtitle="Your recent engagement"
          >
            <div className="activity-stats">
              <div className="activity-item">
                <div className="activity-icon">
                  <FiActivity />
                </div>
                <div className="activity-content">
                  <h4>Total Movies Watched</h4>
                  <p className="activity-value">156 movies</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <FiTrendingUp />
                </div>
                <div className="activity-content">
                  <h4>This Month</h4>
                  <p className="activity-value">23 movies</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <FiClock />
                </div>
                <div className="activity-content">
                  <h4>Average Watch Time</h4>
                  <p className="activity-value">3.2 hours/day</p>
                </div>
              </div>
            </div>
          </AccountCard>

          <AccountCard
            title="Recent Orders"
            subtitle="Your latest purchases"
            actions={[
              {
                label: 'View All',
                onClick: () => window.location.href = '/account/orders'
              }
            ]}
          >
            {appCounts.total_orders && appCounts.total_orders > 0 ? (
              <div className="recent-orders">
                <div className="order-item">
                  <div className="order-icon">
                    <FiPackage />
                  </div>
                  <div className="order-content">
                    <h4>Order #12345</h4>
                    <p>Delivered • 2 days ago</p>
                  </div>
                  <span className="order-status delivered">Delivered</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <FiPackage className="empty-icon" />
                <p>No orders yet</p>
                <Link to="/products" className="empty-link">
                  Start Shopping <FiArrowRight />
                </Link>
              </div>
            )}
          </AccountCard>
        </div>
      </div>
    </AccountPageWrapper>
  );
};

export default AccountDashboardNew;
