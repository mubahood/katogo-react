// src/app/components/Account/AccountDashboardContent.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useAppCounts, useRecentOrders } from '../../hooks/useManifest';
import AccountApiService, { DashboardStats, RecentActivity } from '../../services/AccountApiService';

const AccountDashboardContent: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const appCounts = useAppCounts();
  const recentOrders = useRecentOrders();
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Ensure recentOrders is always an array to prevent null reference errors
  const safeRecentOrders = Array.isArray(recentOrders) ? recentOrders : [];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load dashboard stats
      setIsLoadingStats(true);
      const stats = await AccountApiService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Fallback to mock data if API fails
      setDashboardStats({
        total_watch_time: 24.5,
        movies_watched: 156,
        total_orders: appCounts.total_orders || 23,
        active_subscriptions: 3,
        watchlist_items: appCounts.wishlist_count || 47,
        liked_content: 89,
        chat_messages: 12,
        my_products: 5
      });
    } finally {
      setIsLoadingStats(false);
    }

    try {
      // Load recent activity
      setIsLoadingActivity(true);
      const activity = await AccountApiService.getRecentActivity(4);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      // Fallback to mock data if API fails
      setRecentActivity([
        {
          id: '1',
          type: 'watch',
          title: 'Watched "Inception"',
          description: 'Completed watching 2h 28m',
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          type: 'order',
          title: 'Order Delivered',
          description: 'iPhone 15 Pro Max - Order #12345',
          timestamp: '1 day ago'
        },
        {
          id: '3',
          type: 'like',
          title: 'Liked "Avatar 2"',
          description: 'Added to your liked content',
          timestamp: '2 days ago'
        },
        {
          id: '4',
          type: 'subscription',
          title: 'New Subscription',
          description: 'Subscribed to Premium Movies',
          timestamp: '3 days ago'
        }
      ]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Comprehensive quick actions matching new account sections
  const quickActions = [
    {
      title: 'My Watchlist',
      description: 'Manage saved movies & shows',
      icon: 'bi-bookmark-heart',
      link: '/account/watchlist',
      color: 'primary',
      badge: dashboardStats?.watchlist_items || appCounts.wishlist_count || 0
    },
    {
      title: 'Watch History',
      description: 'Recently watched content',
      icon: 'bi-clock-history',
      link: '/account/history',
      color: 'info'
    },
    {
      title: 'Subscriptions',
      description: 'Manage your subscriptions',
      icon: 'bi-collection-play',
      link: '/account/subscriptions',
      color: 'success'
    },
    {
      title: 'My Likes',
      description: 'Content you liked',
      icon: 'bi-heart-fill',
      link: '/account/likes',
      color: 'danger'
    },
    {
      title: 'My Products',
      description: 'Products you\'re selling',
      icon: 'bi-bag',
      link: '/account/products',
      color: 'warning'
    },
    {
      title: 'My Chats',
      description: 'Messages & conversations',
      icon: 'bi-chat-dots',
      link: '/account/chats',
      color: 'secondary',
      badge: dashboardStats?.chat_messages || 0
    },
    {
      title: 'View Orders',
      description: 'Track your recent orders',
      icon: 'bi-bag-check',
      link: '/account/orders',
      color: 'primary',
      badge: dashboardStats?.total_orders || appCounts.total_orders || safeRecentOrders.length || 0
    },
    {
      title: 'Update Profile',
      description: 'Manage your account information',
      icon: 'bi-person-gear',
      link: '/account/profile',
      color: 'success'
    }
  ];

  // Enhanced account stats with entertainment & marketplace metrics
  const accountStats = [
    {
      label: 'Total Orders',
      value: dashboardStats?.total_orders?.toString() || appCounts.total_orders?.toString() || '0',
      icon: 'bi-bag-check',
      color: 'primary'
    },
    {
      label: 'Watchlist Items',
      value: dashboardStats?.watchlist_items?.toString() || appCounts.wishlist_count?.toString() || '0',
      icon: 'bi-bookmark-heart',
      color: 'info'
    },
    {
      label: 'Movies Watched',
      value: dashboardStats?.movies_watched?.toString() || '0',
      icon: 'bi-play-circle',
      color: 'success'
    },
    {
      label: 'Total Watch Time',
      value: dashboardStats ? `${dashboardStats.total_watch_time}h` : '0h',
      icon: 'bi-clock-history',
      color: 'warning'
    },
    {
      label: 'Liked Content',
      value: dashboardStats?.liked_content?.toString() || '0',
      icon: 'bi-heart-fill',
      color: 'danger'
    },
    {
      label: 'Active Subscriptions',
      value: dashboardStats?.active_subscriptions?.toString() || '0',
      icon: 'bi-collection-play',
      color: 'secondary'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watch': return 'bi-play-circle';
      case 'order': return 'bi-box-seam';
      case 'like': return 'bi-heart-fill';
      case 'chat': return 'bi-chat-dots';
      case 'product': return 'bi-bag';
      case 'subscription': return 'bi-collection-play';
      default: return 'bi-circle';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'watch': return 'success';
      case 'order': return 'primary';
      case 'like': return 'danger';
      case 'chat': return 'info';
      case 'product': return 'warning';
      case 'subscription': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="acc-dashboard-container">
      {/* Enhanced Page Header */}
      <div className="acc-page-header">
        <div>
          <h1 className="acc-page-title">
            Welcome back, {user?.first_name || 'Customer'}! 👋
          </h1>
          <p className="acc-page-subtitle">
            Here's what's happening with your account and entertainment today
          </p>
        </div>
      </div>

      {/* Enhanced Account Stats Grid */}
      <div className="acc-stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'var(--spacing-4)', 
        marginBottom: 'var(--spacing-6)' 
      }}>
        {accountStats.map((stat, index) => (
          <div key={index} className="acc-stat-card" style={{
            background: 'var(--bg-color-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            padding: 'var(--spacing-4)',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}>
            <div className={`acc-stat-icon bi ${stat.icon}`} style={{
              fontSize: '2rem',
              marginBottom: 'var(--spacing-2)',
              color: `var(--color-${stat.color})`
            }}></div>
            <div className="acc-stat-value" style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-color)',
              marginBottom: 'var(--spacing-1)'
            }}>{stat.value}</div>
            <div className="acc-stat-label" style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-color-medium)'
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h3 style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-color)',
          marginBottom: 'var(--spacing-4)'
        }}>
          Quick Actions
        </h3>
        <div className="acc-actions-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-4)'
        }}>
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="acc-action-card" style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--spacing-4)',
              background: 'var(--bg-color-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              textDecoration: 'none',
              color: 'var(--text-color)',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}>
              <div className={`acc-action-icon bi ${action.icon}`} style={{
                fontSize: '1.5rem',
                marginRight: 'var(--spacing-3)',
                color: `var(--color-${action.color})`,
                minWidth: '24px'
              }}></div>
              <div className="acc-action-content" style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--text-color)'
                }}>{action.title}</h4>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-color-medium)',
                  margin: 0
                }}>{action.description}</p>
              </div>
              {action.badge && action.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: `var(--color-${action.color})`,
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {action.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="acc-card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="acc-card-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-4)'
        }}>
          <h3 className="acc-card-title" style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-color)',
            margin: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            <i className="bi-activity" style={{ marginRight: 'var(--spacing-2)' }}></i>
            Recent Activity
          </h3>
        </div>
        <div className="acc-card-body">
          {recentActivity && recentActivity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-3)',
                  background: 'var(--bg-color-secondary)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    background: `var(--color-${getActivityColor(activity.type)})`,
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 'var(--spacing-3)',
                    fontSize: '1.2rem'
                  }}>
                    <i className={getActivityIcon(activity.type)}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h6 style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-1)',
                      color: 'var(--text-color)'
                    }}>{activity.title}</h6>
                    <p style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-color-medium)',
                      margin: 0
                    }}>{activity.description}</p>
                  </div>
                  <small style={{
                    color: 'var(--text-color-medium)',
                    fontSize: 'var(--font-size-xs)'
                  }}>{activity.timestamp}</small>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-8)',
              textAlign: 'center'
            }}>
              <div>
                <i className="bi bi-inbox" style={{
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
                }}>No Recent Activity</h5>
                <p style={{
                  color: 'var(--text-color-medium)',
                  marginBottom: 'var(--spacing-4)',
                  fontSize: 'var(--font-size-base)'
                }}>Start watching movies or shopping to see your activity here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Recent Orders */}
      <div className="acc-card">
        <div className="acc-card-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-4)'
        }}>
          <h3 className="acc-card-title" style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-color)',
            margin: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            <i className="bi-clock-history" style={{ marginRight: 'var(--spacing-2)' }}></i>
            Recent Orders
          </h3>
          {safeRecentOrders && safeRecentOrders.length > 0 && (
            <Link to="/account/orders" className="acc-link-subtle" style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              alignItems: 'center'
            }}>
              View All Orders <i className="bi-arrow-right" style={{ marginLeft: 'var(--spacing-1)' }}></i>
            </Link>
          )}
        </div>
        <div className="acc-card-body">
          {safeRecentOrders && safeRecentOrders.length > 0 ? (
            <div className="acc-recent-orders-list">
              {(safeRecentOrders || []).slice(0, 5).map((order: any, index: number) => (
                <div key={order.id || index} className="acc-recent-order-item" style={{
                  padding: 'var(--spacing-4)',
                  background: 'var(--bg-color-secondary)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  marginBottom: index < Math.min((safeRecentOrders || []).length, 5) - 1 ? 'var(--spacing-3)' : 0
                }}>
                  <div className="acc-recent-order-main" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div className="acc-recent-order-info">
                      <div className="acc-recent-order-header" style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-2)'
                      }}>
                        <span className="acc-recent-order-id" style={{
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text-color)',
                          marginRight: 'var(--spacing-3)'
                        }}>
                          Order #{order.id || 'N/A'}
                        </span>
                        <span className={`acc-order-status acc-order-status-${order.order_state || '0'}`} style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                          background: order.order_state === '2' ? 'var(--color-success)' : 
                                     order.order_state === '1' ? 'var(--color-warning)' :
                                     order.order_state === '3' ? 'var(--color-danger)' : 'var(--color-secondary)',
                          color: 'white'
                        }}>
                          {order.order_state === '0' && 'Pending'}
                          {order.order_state === '1' && 'Processing'}
                          {order.order_state === '2' && 'Completed'}
                          {order.order_state === '3' && 'Cancelled'}
                          {order.order_state === '4' && 'Failed'}
                          {!order.order_state && 'Unknown'}
                        </span>
                      </div>
                      <div className="acc-recent-order-details" style={{
                        display: 'flex',
                        gap: 'var(--spacing-4)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-color-medium)'
                      }}>
                        <span className="acc-recent-order-date">
                          {order.date_created ? new Date(order.date_created).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="acc-recent-order-items">
                          {order.items && typeof order.items === 'string' ? `${order.items.split(',').length} item(s)` : 'No items'}
                        </span>
                      </div>
                    </div>
                    <div className="acc-recent-order-amount" style={{
                      textAlign: 'right'
                    }}>
                      <span className="acc-recent-order-total" style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--text-color)',
                        display: 'block'
                      }}>
                        ${order.order_total || '0.00'}
                      </span>
                      {order.payment_confirmation === 'PAID' ? (
                        <span className="acc-payment-status acc-payment-paid" style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end'
                        }}>
                          <i className="bi-check-circle" style={{ marginRight: '4px' }}></i> Paid
                        </span>
                      ) : (
                        <span className="acc-payment-status acc-payment-pending" style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-warning)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end'
                        }}>
                          <i className="bi-clock" style={{ marginRight: '4px' }}></i> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="acc-recent-orders-footer" style={{
                marginTop: 'var(--spacing-4)',
                textAlign: 'center'
              }}>
                <Link to="/account/orders" className="acc-btn acc-btn-outline" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-3) var(--spacing-6)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  transition: 'all 0.2s ease'
                }}>
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
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-3) var(--spacing-6)',
                    background: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 'var(--border-radius)',
                    textDecoration: 'none',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    border: 'none'
                  }}
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