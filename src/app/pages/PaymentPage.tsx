// src/app/pages/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Nav } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderModel } from '../models/OrderModel';
import { http_get } from '../services/Api';
import PaymentGatewaySelector from '../components/payment/PaymentGatewaySelector';
import PaymentStatus from '../components/payment/PaymentStatus';
import ToastService from '../services/ToastService';
import DynamicBreadcrumb from '../components/shared/DynamicBreadcrumb';
import './PaymentPage.css';

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'payment' | 'status' | 'contact'>('payment');
  const [paymentData, setPaymentData] = useState<any>(null);

  const contactNumber = "+256 701 070684"; // Same as original

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      setError('Order ID is required');
      setIsLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await http_get(`orders/${orderId}`);
      
      if (response.code === 1 && response.data) {
        const orderData = Array.isArray(response.data) ? response.data[0] : response.data;
        setOrder(orderData);
        
        // Check if payment is already completed
        if (orderData.payment_confirmation === 'PAID') {
          setActiveTab('status');
          ToastService.success('This order has already been paid for!');
        }
      } else {
        setError(response.message || 'Failed to load order details');
      }

    } catch (error: any) {
      setError(error.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentInitialized = (data: any) => {
    setPaymentData(data);
    setActiveTab('status');
    ToastService.info('Redirecting to payment gateway...', { autoClose: 3000 });
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
    ToastService.paymentError(errorMsg);
  };

  const handleCallToPay = () => {
    const telUrl = `tel:${contactNumber}`;
    window.location.href = telUrl;
  };

  const handleWhatsApp = () => {
    const message = `Hello, I would like to pay for order #${orderId}. Please assist me with the payment process.`;
    const whatsappUrl = `https://wa.me/${contactNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="payment-page">
        <Container className="py-4">
          <Row className="justify-content-center">
            <Col lg={6} md={8}>
              <Card className="payment-card">
                <Card.Body className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <h5 className="mt-3">Loading Order Details</h5>
                  <p className="text-muted mb-0">
                    Please wait while we fetch your order information...
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="payment-page">
        <Container className="py-4">
          <Row className="justify-content-center">
            <Col lg={6} md={8}>
              <Card className="payment-card">
                <Card.Body className="text-center p-5">
                  <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                  <h4>Unable to Load Order</h4>
                  <p className="text-muted mb-4">{error}</p>
                  <div className="d-grid gap-2">
                    <Button variant="primary" onClick={() => window.location.reload()}>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Try Again
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/account/orders')}>
                      <i className="bi bi-list-check me-2"></i>
                      View Orders
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Container className="py-4">
        <DynamicBreadcrumb />
        
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            {/* Header */}
            <div className="payment-header text-center mb-4">
              <h2>Complete Your Payment</h2>
              <p className="text-muted">
                Order #{orderId} • {order?.customer_name}
              </p>
            </div>

            {/* Order Summary Card */}
            {order && (
              <Card className="order-summary-card mb-4">
                <Card.Body>
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-receipt me-2"></i>
                    Order Summary
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Order Total:</span>
                    <span className="fw-semibold">{parseFloat(order.order_total || '0').toLocaleString('en-UG', { style: 'currency', currency: 'UGX' })}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Delivery Fee:</span>
                    <span className="fw-semibold">{parseFloat(order.delivery_amount || '0').toLocaleString('en-UG', { style: 'currency', currency: 'UGX' })}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Amount to Pay:</span>
                    <span className="fw-bold text-primary fs-5">
                      {parseFloat(order.payable_amount || order.amount || '0').toLocaleString('en-UG', { style: 'currency', currency: 'UGX' })}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Payment Tabs */}
            <Card className="payment-main-card">
              <Card.Header className="bg-white">
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
                  <Nav.Item>
                    <Nav.Link eventKey="payment">
                      <i className="bi bi-credit-card me-2"></i>
                      Online Payment
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="status">
                      <i className="bi bi-clock-history me-2"></i>
                      Payment Status
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="contact">
                      <i className="bi bi-telephone me-2"></i>
                      Contact Payment
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {/* Online Payment Tab */}
                {activeTab === 'payment' && order && (
                  <div className="payment-tab">
                    <div className="payment-intro mb-4">
                      <h5>Secure Online Payment</h5>
                      <p className="text-muted">
                        Pay safely with Mobile Money, Credit Card, or Bank Transfer through our secure payment gateway.
                      </p>
                    </div>
                    
                    <PaymentGatewaySelector
                      order={order}
                      onPaymentInitialized={handlePaymentInitialized}
                      onError={handlePaymentError}
                    />
                  </div>
                )}

                {/* Payment Status Tab */}
                {activeTab === 'status' && orderId && (
                  <div className="status-tab">
                    <div className="status-intro mb-4">
                      <h5>Payment Status</h5>
                      <p className="text-muted">
                        Check the current status of your payment and get real-time updates.
                      </p>
                    </div>

                    <PaymentStatus
                      orderId={parseInt(orderId)}
                      trackingId={paymentData?.order_tracking_id}
                      onStatusUpdate={(status, data) => {
                        if (status.toUpperCase() === 'COMPLETED') {
                          // Reload order details to update payment confirmation
                          loadOrderDetails();
                        }
                      }}
                      showActions={true}
                      className="mb-4"
                    />
                  </div>
                )}

                {/* Contact Payment Tab */}
                {activeTab === 'contact' && (
                  <div className="contact-tab">
                    <div className="contact-intro text-center mb-4">
                      <h5>Alternative Payment Methods</h5>
                      <p className="text-muted">
                        For assistance with payment or alternative payment methods, contact us directly.
                      </p>
                    </div>

                    {/* Contact Number */}
                    <div className="contact-number text-center mb-4">
                      <div className="contact-label">Contact Number</div>
                      <div className="contact-value">{contactNumber}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="payment-actions">
                      <div className="d-grid gap-3">
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={handleCallToPay}
                          className="payment-btn"
                        >
                          <i className="bi bi-telephone-fill me-2"></i>
                          Call to Pay
                        </Button>

                        <Button 
                          variant="success" 
                          size="lg" 
                          onClick={handleWhatsApp}
                          className="payment-btn"
                        >
                          <i className="bi bi-whatsapp me-2"></i>
                          WhatsApp Us
                        </Button>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="trust-indicators mt-4">
                      <div className="trust-item">
                        <i className="bi bi-shield-fill-check"></i>
                        <span>Secure Payment</span>
                      </div>
                      <div className="trust-item">
                        <i className="bi bi-headset"></i>
                        <span>24/7 Support</span>
                      </div>
                      <div className="trust-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Instant Processing</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Back Button */}
            <div className="text-center mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/account/orders')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Orders
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaymentPage;
