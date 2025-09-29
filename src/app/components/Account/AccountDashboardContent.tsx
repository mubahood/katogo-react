// src/app/components/Account/AccountDashboardContent.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useAppCounts, useRecentOrders } from '../../hooks/useManifest';

const AccountDashboardContent: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const appCounts = useAppCounts();
  const recentOrders = useRecentOrders();

  // Simplified quick actions - only essential ones
  const quickActions = [
    {
      title: 'View Orders',
      description: 'Track your recent orders',
      icon: 'bi-bag-check',
      link: '/account/orders',
      color: 'primary'
    },
    {
      title: 'Update Profile',
      description: 'Manage your account information',
      icon: 'bi-person-gear',
      link: '/account/profile',
      color: 'success'
    },
    {
      title: 'My Wishlist',
      description: 'View saved items',
      icon: 'bi-heart',
      link: '/account/wishlist',
      color: 'danger'
    }
  ];

  // Simplified account stats - only relevant ones
  const accountStats = [
    {
      label: 'Total Orders',
      value: appCounts.total_orders.toString(),
      icon: 'bi-bag-check',
      color: 'primary'
    },
    {
      label: 'Wishlist Items',
      value: appCounts.wishlist_count.toString(),
      icon: 'bi-heart',
      color: 'danger'
    },
    {
      label: 'Account Status',
      value: 'Active',
      icon: 'bi-shield-check',
      color: 'success'
    }
  ];

  return (
    <div className="acc-dashboard-container">
      {/* Page Header */}
      <div className="acc-page-header">
        <div>
          <h1 className="acc-page-title">
            Welcome back, {user?.first_name || 'Customer'}!
          </h1>
          <p className="acc-page-subtitle">
            Manage your account, track orders, and update your preferences
          </p>
        </div>
      </div>

      {/* Account Stats */}
      <div className="acc-stats-grid">
        {accountStats.map((stat, index) => (
          <div key={index} className="acc-stat-card">
            <div className={`acc-stat-icon bi ${stat.icon}`}></div>
            <div className="acc-stat-value">{stat.value}</div>
            <div className="acc-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h3 style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-color)',
          marginBottom: 'var(--spacing-4)'
        }}>
          Quick Actions
        </h3>
        <div className="acc-actions-grid">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="acc-action-card">
              <div className={`acc-action-icon bi ${action.icon}`}></div>
              <div className="acc-action-content">
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="acc-card">
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <i className="bi-clock-history"></i>
            Recent Orders
          </h3>
          {recentOrders && recentOrders.length > 0 && (
            <Link to="/account/orders" className="acc-link-subtle">
              View All Orders <i className="bi-arrow-right"></i>
            </Link>
          )}
        </div>
        <div className="acc-card-body">
          {recentOrders && recentOrders.length > 0 ? (
            <div className="acc-recent-orders-list">
              {recentOrders.slice(0, 5).map((order: any, index: number) => (
                <div key={order.id || index} className="acc-recent-order-item">
                  <div className="acc-recent-order-main">
                    <div className="acc-recent-order-info">
                      <div className="acc-recent-order-header">
                        <span className="acc-recent-order-id">
                          Order #{order.id || 'N/A'}
                        </span>
                        <span className={`acc-order-status acc-order-status-${order.order_state || '0'}`}>
                          {order.order_state === '0' && 'Pending'}
                          {order.order_state === '1' && 'Processing'}
                          {order.order_state === '2' && 'Completed'}
                          {order.order_state === '3' && 'Cancelled'}
                          {order.order_state === '4' && 'Failed'}
                          {!order.order_state && 'Unknown'}
                        </span>
                      </div>
                      <div className="acc-recent-order-details">
                        <span className="acc-recent-order-date">
                          {order.date_created ? new Date(order.date_created).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="acc-recent-order-items">
                          {order.items ? `${order.items.split(',').length} item(s)` : 'No items'}
                        </span>
                      </div>
                    </div>
                    <div className="acc-recent-order-amount">
                      <span className="acc-recent-order-total">
                        ${order.order_total || '0.00'}
                      </span>
                      {order.payment_confirmation === 'PAID' ? (
                        <span className="acc-payment-status acc-payment-paid">
                          <i className="bi-check-circle"></i> Paid
                        </span>
                      ) : (
                        <span className="acc-payment-status acc-payment-pending">
                          <i className="bi-clock"></i> Pending
                        </span>
                      )}
                    </div>
                  </div>
                  {index < Math.min(recentOrders.length, 5) - 1 && (
                    <div className="acc-recent-order-divider"></div>
                  )}
                </div>
              ))}
              <div className="acc-recent-orders-footer">
                <Link to="/account/orders" className="acc-btn acc-btn-outline">
                  View All Orders
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-12) var(--spacing-4)',
              textAlign: 'center'
            }}>
              <div>
                <i className="bi bi-bag-x" style={{
                  color: 'var(--text-color-medium)',
                  fontSize: '3rem',
                  marginBottom: 'var(--spacing-3)',
                  display: 'block'
                }}></i>
                <h5 style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-2)'
                }}>No Recent Orders</h5>
                <p style={{
                  color: 'var(--text-color-medium)',
                  marginBottom: 'var(--spacing-4)',
                  fontSize: 'var(--font-size-base)'
                }}>You haven't placed any orders yet. Start shopping to see your order history here.</p>
                <Link 
                  to="/products" 
                  className="acc-btn acc-btn-primary"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDashboardContent;