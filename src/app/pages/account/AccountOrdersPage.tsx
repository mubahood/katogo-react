// src/app/pages/account/AccountOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OrderModel } from '../../models/OrderModel';
import { formatPrice } from '../../utils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ToastService from '../../services/ToastService';

const AccountOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && user.id) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const fetchedOrders = await OrderModel.fetchItems();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      ToastService.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      '0': { text: 'Pending', color: 'var(--danger-color)' },
      '1': { text: 'Processing', color: 'var(--warning-color)' },
      '2': { text: 'Completed', color: 'var(--success-color)' },
      '3': { text: 'Canceled', color: 'var(--text-color-medium)' },
      '4': { text: 'Failed', color: 'var(--danger-color)' }
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'var(--text-color-medium)' };
    
    return (
      <span 
        style={{
          padding: 'var(--spacing-1) var(--spacing-2)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-medium)',
          borderRadius: 'var(--border-radius)',
          backgroundColor: statusInfo.color,
          color: 'var(--white)',
          display: 'inline-block'
        }}
      >
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseOrderItems = (itemsString: string) => {
    try {
      return JSON.parse(itemsString || '[]');
    } catch {
      return [];
    }
  };

  if (!user || !user.id) {
    return (
      <div className="acc-card" style={{
        backgroundColor: 'var(--warning-bg)',
        borderColor: 'var(--warning-border)',
        color: 'var(--warning-color)'
      }}>
        <div className="acc-card-body">
          <i className="bi bi-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          Please log in to view your orders.
        </div>
      </div>
    );
  }

  return (
    <div className="acc-orders-container">
      {/* Page Header */}
      <div className="acc-page-header">
        <div>
          <h1 className="acc-page-title">My Orders</h1>
          <p className="acc-page-subtitle">Track and manage your orders</p>
        </div>
        <button className="acc-btn acc-btn-outline" onClick={loadOrders}>
          <i className="bi bi-arrow-clockwise" style={{ marginRight: '8px' }}></i>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-12) var(--spacing-4)'
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid var(--border-color)',
            borderTop: '4px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: 'var(--spacing-3)',
            color: 'var(--text-color-medium)',
            fontSize: 'var(--font-size-base)'
          }}>Loading orders...</p>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <div className="acc-card">
              <div className="acc-card-body">
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-12) var(--spacing-4)'
                }}>
                  <i className="bi bi-bag-x" style={{
                    fontSize: '4rem',
                    color: 'var(--text-color-medium)',
                    marginBottom: 'var(--spacing-4)',
                    display: 'block'
                  }}></i>
                  <h3 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-color)',
                    marginBottom: 'var(--spacing-2)'
                  }}>No Orders Yet</h3>
                  <p style={{
                    color: 'var(--text-color-medium)',
                    marginBottom: 'var(--spacing-4)',
                    fontSize: 'var(--font-size-base)',
                    maxWidth: '400px',
                    margin: '0 auto var(--spacing-4)'
                  }}>
                    You haven't placed any orders yet. Start shopping to see your order history here.
                  </p>
                  <Link to="/products" className="acc-btn acc-btn-primary">
                    Start Shopping
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
              {orders.map((order) => {
                const orderItems = parseOrderItems(order.items);
                return (
                  <div key={order.id} className="acc-card">
                    <div className="acc-card-header">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                          <h4 style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 'var(--font-weight-semibold)',
                            margin: 0,
                            marginBottom: 'var(--spacing-1)'
                          }}>
                            Order #{order.id}
                          </h4>
                          <p style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-color-medium)',
                            margin: 0
                          }}>
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {getOrderStatusBadge(order.order_state)}
                          <div style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--text-color)',
                            marginTop: 'var(--spacing-1)'
                          }}>
                            {formatPrice(parseFloat(order.payable_amount || order.order_total || '0'))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="acc-card-body">
                      {/* Order Items */}
                      {orderItems && orderItems.length > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-4)' }}>
                          <h6 style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--text-color)',
                            marginBottom: 'var(--spacing-2)'
                          }}>
                            Items ({orderItems.length})
                          </h6>
                          <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                            {orderItems.slice(0, 3).map((item: any, index: number) => (
                              <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: 'var(--spacing-2)',
                                backgroundColor: 'var(--background-light)',
                                borderRadius: 'var(--border-radius)',
                                gap: 'var(--spacing-3)'
                              }}>
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  backgroundColor: 'var(--white)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 'var(--border-radius)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <i className="bi bi-box" style={{ color: 'var(--text-color-medium)' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <h6 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    margin: 0,
                                    marginBottom: 'var(--spacing-1)'
                                  }}>
                                    {item.product_name || item.name || 'Product'}
                                  </h6>
                                  <p style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-color-medium)',
                                    margin: 0
                                  }}>
                                    Qty: {item.quantity || 1} × {formatPrice(parseFloat(item.price || '0'))}
                                  </p>
                                </div>
                                <div style={{
                                  fontSize: 'var(--font-size-sm)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  color: 'var(--text-color)'
                                }}>
                                  {formatPrice(parseFloat(item.quantity || '1') * parseFloat(item.price || '0'))}
                                </div>
                              </div>
                            ))}
                            {orderItems.length > 3 && (
                              <div style={{
                                textAlign: 'center',
                                padding: 'var(--spacing-2)',
                                color: 'var(--text-color-medium)',
                                fontSize: 'var(--font-size-sm)'
                              }}>
                                +{orderItems.length - 3} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Actions */}
                      <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-2)',
                        paddingTop: 'var(--spacing-3)',
                        borderTop: '1px solid var(--border-color)',
                        flexWrap: 'wrap'
                      }}>
                        <Link 
                          to={`/account/orders/${order.id}`}
                          className="acc-btn acc-btn-outline acc-btn-sm"
                        >
                          View Details
                        </Link>
                        
                        {/* Payment button for unpaid orders */}
                        {!order.isPaid() && (order.order_state === '0' || order.order_state === '1') && (
                          <Link 
                            to={`/payment/${order.id}`}
                            className="acc-btn acc-btn-primary acc-btn-sm"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--spacing-1)',
                              textDecoration: 'none'
                            }}
                          >
                            <i className="bi bi-credit-card"></i>
                            Pay Now
                          </Link>
                        )}
                        
                        {order.order_state === '2' && (
                          <button className="acc-btn acc-btn-outline acc-btn-sm">
                            Reorder
                          </button>
                        )}
                        {(order.order_state === '0' || order.order_state === '1') && (
                          <button className="acc-btn acc-btn-outline acc-btn-sm">
                            Track Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Load More Button */}
      {orders.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)' }}>
          <button className="acc-btn acc-btn-outline">
            Load More Orders
          </button>
        </div>
      )}

      {/* Spinner animation styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AccountOrdersPage;