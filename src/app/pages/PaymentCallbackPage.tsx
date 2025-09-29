// src/app/pages/PaymentCallbackPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PaymentStatus from '../components/payment/PaymentStatus';
import ToastService from '../services/ToastService';
import DynamicBreadcrumb from '../components/shared/DynamicBreadcrumb';

const PaymentCallbackPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [trackingId, setTrackingId] = useState<string>('');
  const [merchantReference, setMerchantReference] = useState<string>('');

  useEffect(() => {
    // Extract callback parameters from URL
    const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId') || '';
    const merchantRef = searchParams.get('OrderMerchantReference') || searchParams.get('merchantReference') || '';
    
    setTrackingId(orderTrackingId);
    setMerchantReference(merchantRef);

    // Simulate processing delay
    const timer = setTimeout(() => {
      setIsProcessing(false);
      
      // Show welcome back message
      ToastService.info('Welcome back! Checking your payment status...', { autoClose: 3000 });
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleStatusUpdate = (status: string, data: any) => {
    // Handle different payment statuses
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        // Don't auto-redirect, let user see success message and choose
        break;
      case 'FAILED':
      case 'INVALID':
      case 'ERROR':
        // Auto-show retry option after a delay
        setTimeout(() => {
          ToastService.error('Payment failed. You can try again or contact support.', { autoClose: 5000 });
        }, 3000);
        break;
      case 'PENDING':
        // Show manual check message for pending payments
        ToastService.info('Payment is still processing. Please use the "Check Payment Status" button to refresh.', { autoClose: 6000 });
        break;
    }
  };

  const handleRetryPayment = () => {
    navigate(`/payment/${orderId}`);
  };

  const handleViewOrders = () => {
    navigate('/account/orders');
  };

  const handleBackToHome = () => {
    navigate('/', { 
      state: { 
        orderSuccess: true, 
        orderId: orderId ? parseInt(orderId) : undefined 
      } 
    });
  };

  if (!orderId) {
    return (
      <div className="payment-callback-page min-vh-100 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} md={8}>
              <div className="text-center">
                <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                <h3>Invalid Payment Request</h3>
                <p className="text-muted mb-4">
                  The payment request is missing required information.
                </p>
                <Button variant="primary" onClick={() => navigate('/')}>
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="payment-callback-page">
      <Container className="py-4">
        <DynamicBreadcrumb />
        
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <div className="callback-header text-center mb-4">
              <h2>Payment Status</h2>
              <p className="text-muted">
                Checking the status of your payment for Order #{orderId}
              </p>
            </div>

            {/* Processing State */}
            {isProcessing ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <h4 className="mt-3">Processing Payment Response...</h4>
                <p className="text-muted">
                  Please wait while we verify your payment with our payment provider.
                </p>
              </div>
            ) : (
              <PaymentStatus
                orderId={parseInt(orderId)}
                trackingId={trackingId}
                onStatusUpdate={handleStatusUpdate}
                showActions={true}
                className="mb-4"
              />
            )}

            {/* Additional Actions */}
            {!isProcessing && (
              <div className="callback-actions">
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <Button
                    variant="outline-primary"
                    onClick={handleRetryPayment}
                    className="flex-fill"
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Try Payment Again
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={handleViewOrders}
                    className="flex-fill"
                  >
                    <i className="bi bi-list-check me-2"></i>
                    View All Orders
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={handleBackToHome}
                    className="flex-fill"
                  >
                    <i className="bi bi-house me-2"></i>
                    Back to Home
                  </Button>
                </div>
              </div>
            )}

            {/* Debug Info (Development Only) */}
            {import.meta.env.DEV && (
              <div className="debug-info mt-5">
                <details className="bg-light p-3 rounded">
                  <summary className="fw-bold text-muted">Debug Information</summary>
                  <div className="mt-2">
                    <small className="text-muted">
                      <div><strong>Order ID:</strong> {orderId}</div>
                      <div><strong>Tracking ID:</strong> {trackingId || 'Not provided'}</div>
                      <div><strong>Merchant Reference:</strong> {merchantReference || 'Not provided'}</div>
                      <div><strong>URL Params:</strong></div>
                      <pre className="bg-white p-2 rounded small">
                        {JSON.stringify(Object.fromEntries(searchParams), null, 2)}
                      </pre>
                    </small>
                  </div>
                </details>
              </div>
            )}

            {/* Help Section */}
            <div className="help-section mt-5 text-center">
              <h5>Need Help?</h5>
              <p className="text-muted">
                If you're experiencing issues with your payment, please contact our support team.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => window.open('tel:+256701070684', '_blank')}
                >
                  <i className="bi bi-telephone me-2"></i>
                  Call Support
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => window.open('https://wa.me/256701070684?text=I need help with my payment', '_blank')}
                >
                  <i className="bi bi-whatsapp me-2"></i>
                  WhatsApp
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style>{`
        .payment-callback-page {
          min-height: 100vh;
          background: var(--bs-body-bg, #fff);
        }

        .callback-header h2 {
          color: var(--bs-primary, #0d6efd);
          margin-bottom: 0.5rem;
        }

        .callback-actions {
          background: var(--bs-light, #f8f9fa);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .help-section {
          border-top: 1px solid var(--bs-border-color, #dee2e6);
          padding-top: 2rem;
        }

        .debug-info details[open] {
          border: 1px solid var(--bs-border-color, #dee2e6);
        }

        .debug-info summary {
          cursor: pointer;
          padding: 0.5rem 0;
        }

        .debug-info summary:hover {
          color: var(--bs-primary, #0d6efd);
        }

        @media (max-width: 768px) {
          .callback-actions .d-flex {
            flex-direction: column;
          }
          
          .callback-actions .flex-fill {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentCallbackPage;
