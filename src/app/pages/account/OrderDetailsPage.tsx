// src/app/pages/account/OrderDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderModel } from '../../models/OrderModel';
import { formatPrice } from '../../utils';
import ToastService from '../../services/ToastService';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      // For now, we'll get all orders and find the specific one
      // In a real app, you'd have an API endpoint for single order
      const orders = await OrderModel.fetchItems();
      const foundOrder = orders.find(o => o.id.toString() === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        ToastService.error('Order not found');
        navigate('/account/orders');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      ToastService.error('Failed to load order details');
      navigate('/account/orders');
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
      month: 'long',
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

  const getOrderNotes = (orderDetails: string) => {
    if (!orderDetails) return '';
    
    // If it's already a simple string (not JSON), return it
    if (!orderDetails.trim().startsWith('{') && !orderDetails.trim().startsWith('[')) {
      return orderDetails.trim();
    }
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(orderDetails);
      
      // If it's an object, extract the order_details field
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.order_details || '';
      }
      
      // If it's not an object, return the original string
      return orderDetails.trim();
    } catch {
      // If parsing fails, return the original string
      return orderDetails.trim();
    }
  };



  const handlePayOrder = () => {
    // Check if order is already paid
    if (order?.isPaid && order.isPaid()) {
      ToastService.warning('This order has already been paid for!');
      return;
    }
    
    // Redirect to integrated payment page
    navigate(`/payment/${order?.id}`);
  };

  if (isLoading) {
    return (
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
        }}>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="acc-card" style={{
        backgroundColor: 'var(--warning-bg)',
        borderColor: 'var(--warning-border)',
        color: 'var(--warning-color)'
      }}>
        <div className="acc-card-body">
          <i className="bi bi-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          Order not found. 
          <button 
            onClick={() => navigate('/account/orders')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
          >
            Return to orders
          </button>
        </div>
      </div>
    );
  }

  const orderItems = parseOrderItems(order.items);

  return (
    <div className="acc-order-details-container">
      {/* Page Header */}
      <div className="acc-page-header">
        <div>
          <h1 className="acc-page-title">Order Details</h1>
          <p className="acc-page-subtitle">
            Invoice #{order.id} - {formatDate(order.created_at)}
          </p>
        </div>
        <button 
          className="acc-btn acc-btn-outline"
          onClick={() => navigate('/account/orders')}
        >
          <i className="bi bi-arrow-left" style={{ marginRight: '8px' }}></i>
          Back to Orders
        </button>
      </div>

      {/* Order Summary Card */}
      <div className="acc-card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="acc-card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--spacing-6)',
            alignItems: 'center'
          }}>
            {/* Order Amount */}
            <div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-color)',
                marginBottom: 'var(--spacing-2)'
              }}>
                {formatPrice(parseFloat(order.payable_amount || order.order_total || '0'))}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color-medium)'
                }}>
                  PAYMENT STATUS:
                </span>
                <span style={{
                  padding: 'var(--spacing-1) var(--spacing-2)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: order.isPaid() ? 'var(--success-color)' : 'var(--danger-color)',
                  color: 'var(--white)'
                }}>
                  {order.isPaid() ? 'Paid' : 'Not Paid'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)'
              }}>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color-medium)'
                }}>
                  ORDER STATUS:
                </span>
                {getOrderStatusBadge(order.order_state)}
              </div>
            </div>

                        {/* Pay Button */}
            {!order.isPaid() && (
              <div>
                <button 
                  className="acc-btn acc-btn-primary acc-btn-lg"
                  onClick={handlePayOrder}
                  style={{
                    padding: 'var(--spacing-3) var(--spacing-6)',
                    fontSize: 'var(--font-size-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-2)',
                    margin: '0 auto'
                  }}
                >
                  <i className="bi bi-credit-card"></i>
                  PAY NOW
                </button>
                <p style={{
                  textAlign: 'center',
                  marginTop: 'var(--spacing-2)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-color-medium)'
                }}>
                  Secure payment with Pesapal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
        
        {/* Order Items */}
        {orderItems && orderItems.length > 0 && (
          <div className="acc-card">
            <div className="acc-card-header">
              <h3 className="acc-card-title">
                <i className="bi bi-bag-check"></i>
                Order Items ({orderItems.length})
              </h3>
            </div>
            <div className="acc-card-body">
              <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
                {orderItems.map((item: any, index: number) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--background-light)',
                    borderRadius: 'var(--border-radius)',
                    gap: 'var(--spacing-3)'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: 'var(--white)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="bi bi-box" style={{ 
                        color: 'var(--text-color-medium)',
                        fontSize: '1.5rem' 
                      }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h6 style={{
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        margin: 0,
                        marginBottom: 'var(--spacing-1)'
                      }}>
                        {item.product_name || item.name || 'Product'}
                      </h6>
                      <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-color-medium)',
                        margin: 0
                      }}>
                        Quantity: {item.quantity || 1} × {formatPrice(parseFloat(item.price || '0'))}
                      </p>
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-color)'
                    }}>
                      {formatPrice(parseFloat(item.quantity || '1') * parseFloat(item.price || '0'))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div style={{
                marginTop: 'var(--spacing-4)',
                paddingTop: 'var(--spacing-4)',
                borderTop: '1px solid var(--border-color)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  <span>Order Items Total:</span>
                  <span>{formatPrice(parseFloat(order.order_total || '0'))}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  <span>Delivery Cost:</span>
                  <span>{formatPrice(parseFloat(order.delivery_amount || '0'))}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 'var(--spacing-2)',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-bold)'
                }}>
                  <span>Total:</span>
                  <span>{formatPrice(parseFloat(order.payable_amount || order.order_total || '0'))}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Information */}
        <div className="acc-card">
          <div className="acc-card-header">
            <h3 className="acc-card-title">
              <i className="bi bi-geo-alt"></i>
              Delivery Information
            </h3>
          </div>
          <div className="acc-card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Delivery Address:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {order.delivery_address_text || order.customer_address || 'Not specified'}
                  {order.delivery_address_details && (
                    <><br />{order.delivery_address_details}</>
                  )}
                </p>
              </div>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Delivery Method:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0
                }}>
                  {order.delivery_method || 'Standard Delivery'}
                </p>
              </div>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Delivery Cost:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0,
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  {formatPrice(parseFloat(order.delivery_amount || '0'))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="acc-card">
          <div className="acc-card-header">
            <h3 className="acc-card-title">
              <i className="bi bi-person-lines-fill"></i>
              Contact Information
            </h3>
          </div>
          <div className="acc-card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Customer Name:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0
                }}>
                  {order.customer_name || 'Not specified'}
                </p>
              </div>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Email:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0
                }}>
                  {order.mail || 'Not specified'}
                </p>
              </div>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Phone:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0
                }}>
                  {order.customer_phone_number_1 || 'Not specified'}
                  {order.customer_phone_number_2 && (
                    <><br />Alt: {order.customer_phone_number_2}</>
                  )}
                </p>
              </div>
              {(() => {
                const notes = getOrderNotes(order.order_details || '');
                return notes && notes.trim() ? (
                  <div>
                    <h6 style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text-color)',
                      marginBottom: 'var(--spacing-1)'
                    }}>
                      Order Notes:
                    </h6>
                    <p style={{
                      color: 'var(--text-color-medium)',
                      margin: 0,
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--background-light)',
                      borderRadius: 'var(--border-radius)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {notes}
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="acc-card">
          <div className="acc-card-header">
            <h3 className="acc-card-title">
              <i className="bi bi-file-earmark-text"></i>
              Invoice Information
            </h3>
          </div>
          <div className="acc-card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Invoice Number:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: 'var(--font-size-lg)'
                }}>
                  INVOICE-{order.id}
                </p>
              </div>
              <div>
                <h6 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-color)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Invoice Date:
                </h6>
                <p style={{
                  color: 'var(--text-color-medium)',
                  margin: 0
                }}>
                  {formatDate(order.created_at)}
                </p>
              </div>
              {order.date_updated && order.date_updated !== order.created_at && (
                <div>
                  <h6 style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text-color)',
                    marginBottom: 'var(--spacing-1)'
                  }}>
                    Last Updated:
                  </h6>
                  <p style={{
                    color: 'var(--text-color-medium)',
                    margin: 0
                  }}>
                    {formatDate(order.date_updated)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default OrderDetailsPage;
