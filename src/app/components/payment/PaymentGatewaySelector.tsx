// src/app/components/payment/PaymentGatewaySelector.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { OrderModel } from '../../models/OrderModel';
import PesapalService, { PesapalPaymentGateway } from '../../services/PesapalService';
import ToastService from '../../services/ToastService';

interface PaymentGatewaySelectorProps {
  order: OrderModel;
  onPaymentInitialized?: (paymentData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  order,
  onPaymentInitialized,
  onError,
  className = ''
}) => {
  const [gateways, setGateways] = useState<PesapalPaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadPaymentGateways();
  }, []);

  const loadPaymentGateways = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const availableGateways = await PesapalService.getPaymentGateways();
      const enabledGateways = availableGateways.filter(gateway => gateway.enabled);
      
      setGateways(enabledGateways);
      
      // Auto-select first gateway if only one available
      if (enabledGateways.length === 1) {
        setSelectedGateway(enabledGateways[0].id);
      }
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load payment options';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGatewaySelect = (gatewayId: string) => {
    setSelectedGateway(gatewayId);
    setError('');
  };

  const handleProceedToPayment = async () => {
    if (!selectedGateway) {
      const errorMsg = 'Please select a payment method';
      setError(errorMsg);
      ToastService.error(errorMsg);
      return;
    }

    if (!order || !order.id) {
      const errorMsg = 'Invalid order information';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Check if order is already paid
    if (order.payment_confirmation === 'PAID' || order.order_state === 'confirmed') {
      const successMsg = 'This order has already been paid successfully!';
      ToastService.success(successMsg);
      setError('');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      // Prepare payment request
      const paymentRequest = {
        order_id: order.id,
        amount: parseFloat(order.payable_amount || order.amount || '0'),
        currency: 'UGX',
        customer_name: order.customer_name || 'Customer',
        customer_email: '', // OrderModel doesn't have email field
        customer_phone: order.customer_phone_number_1 || '',
        callback_url: PesapalService.createCallbackUrl(order.id),
        description: `Payment for Order #${order.id}`
      };

      // Initialize payment with Pesapal
      const response = await PesapalService.initializePayment(paymentRequest);

      if (response.success && response.data) {
        
        // Notify parent component
        onPaymentInitialized?.(response.data);
        
        // Redirect to payment page
        PesapalService.redirectToPayment(response.data.redirect_url);
        
      } else {
        const errorMsg = response.message || 'Failed to initialize payment';
        setError(errorMsg);
        onError?.(errorMsg);
        ToastService.paymentError(errorMsg);
      }

    } catch (error: any) {
      const errorMsg = error.message || 'Failed to process payment';
      setError(errorMsg);
      onError?.(errorMsg);
      ToastService.paymentError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`payment-gateway-selector ${className}`}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0 text-muted">Loading payment options...</p>
        </Card.Body>
      </Card>
    );
  }

  if (gateways.length === 0) {
    return (
      <Card className={`payment-gateway-selector ${className}`}>
        <Card.Body className="text-center py-4">
          <i className="bi bi-exclamation-triangle fs-2 text-warning mb-3"></i>
          <h5>No Payment Options Available</h5>
          <p className="text-muted mb-3">
            Payment gateways are currently unavailable. Please contact support.
          </p>
          <Button variant="outline-primary" onClick={loadPaymentGateways}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Retry
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`payment-gateway-selector ${className}`}>
      <Card.Body>
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-credit-card fs-4 text-primary me-3"></i>
          <div>
            <h5 className="mb-1">Choose Payment Method</h5>
            <small className="text-muted">
              Select your preferred payment option to continue
            </small>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Row className="g-3 mb-4">
          {gateways.map((gateway) => (
            <Col key={gateway.id} xs={12}>
              <div 
                className={`payment-gateway-option ${selectedGateway === gateway.id ? 'selected' : ''}`}
                onClick={() => handleGatewaySelect(gateway.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleGatewaySelect(gateway.id)}
              >
                <div className="d-flex align-items-center">
                  <div className="gateway-radio me-3">
                    <input
                      type="radio"
                      name="paymentGateway"
                      value={gateway.id}
                      checked={selectedGateway === gateway.id}
                      onChange={() => handleGatewaySelect(gateway.id)}
                      className="form-check-input"
                    />
                  </div>
                  <div className="gateway-icon me-3">
                    <i className={`bi ${gateway.icon || 'bi-credit-card'} fs-3 text-primary`}></i>
                  </div>
                  <div className="gateway-info flex-grow-1">
                    <h6 className="mb-1">{gateway.name}</h6>
                    <small className="text-muted">{gateway.description}</small>
                  </div>
                  <div className="gateway-arrow">
                    <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Payment Summary */}
        <div className="payment-summary mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Total Amount:</span>
            <span className="fs-5 fw-bold text-primary">
              {PesapalService.formatAmount(parseFloat(order.payable_amount || order.amount || '0'))}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {order.payment_confirmation === 'PAID' || order.order_state === 'confirmed' ? (
          <Alert variant="success" className="text-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Payment Completed Successfully!</strong>
            <div className="mt-2">
              <small>This order has already been paid for.</small>
            </div>
          </Alert>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-100"
            onClick={handleProceedToPayment}
            disabled={!selectedGateway || isProcessing}
          >
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right me-2"></i>
                Proceed to Payment
              </>
            )}
          </Button>
        )}

        {/* Trust Indicators */}
        <div className="trust-indicators mt-4">
          <Row className="g-2 text-center">
            <Col xs={4}>
              <div className="trust-item">
                <i className="bi bi-shield-check text-success"></i>
                <small className="d-block text-muted">Secure</small>
              </div>
            </Col>
            <Col xs={4}>
              <div className="trust-item">
                <i className="bi bi-clock text-primary"></i>
                <small className="d-block text-muted">Fast</small>
              </div>
            </Col>
            <Col xs={4}>
              <div className="trust-item">
                <i className="bi bi-check-circle text-success"></i>
                <small className="d-block text-muted">Reliable</small>
              </div>
            </Col>
          </Row>
        </div>
      </Card.Body>

      <style>{`
        .payment-gateway-option {
          border: 2px solid var(--border-color, #e0e0e0);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
          background: var(--white, white);
        }

        .payment-gateway-option:hover {
          border-color: var(--primary-color, #007bff);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
        }

        .payment-gateway-option.selected {
          border-color: var(--primary-color, #007bff);
          background: rgba(0, 123, 255, 0.05);
          box-shadow: 0 2px 12px rgba(0, 123, 255, 0.15);
        }

        .payment-summary {
          background: var(--background-light, #f8f9fa);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid var(--border-color, #e0e0e0);
        }

        .trust-indicators .trust-item {
          padding: 8px;
        }

        .trust-indicators .trust-item i {
          font-size: 1.2rem;
          margin-bottom: 4px;
        }

        .gateway-radio input[type="radio"] {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </Card>
  );
};

export default PaymentGatewaySelector;
