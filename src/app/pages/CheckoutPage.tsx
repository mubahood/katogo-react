// src/app/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { OrderModel } from '../models/OrderModel';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils';
import ToastService from '../services/ToastService';
import { http_post } from '../services/Api';
import { OrderModelUtils } from '../utils/OrderModelUtils';
import DynamicBreadcrumb from '../components/shared/DynamicBreadcrumb';

// Inline styles for CheckoutPage following the unified design system
const checkoutPageStyles = `
  .checkout-page {
    min-height: 100vh;
    background: var(--background-body);
    position: relative;
  }

  .checkout-card {
    width: 100%;
    min-height: 60vh;
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0;
    border: none;
    transition: all 0.3s ease;
  }

  .checkout-card.loading {
    pointer-events: none;
    opacity: 0.7;
  }

  .checkout-header {
    padding: 32px 32px 0 32px;
    text-align: center;
    background: none;
    border: none;
  }

  .checkout-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-color-dark);
    margin-bottom: 0.25rem;
  }

  .checkout-subtitle {
    font-size: 1rem;
    color: var(--text-color-medium);
    margin-bottom: 0;
  }

  .checkout-content {
    padding: 32px;
    background: none;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    position: relative;
  }

  .summary-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 0;
    background: none;
    border: none;
    animation: fadeInSlide 0.4s ease;
  }

  @keyframes fadeInSlide {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .summary-item-content {
    flex: 1;
  }

  .summary-item-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 2px;
  }

  .summary-item-subtitle {
    font-size: 0.92rem;
    color: var(--text-color-medium);
    margin-bottom: 0;
  }

  .summary-item-amount {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-color-dark);
    min-width: 90px;
    text-align: right;
  }

  .summary-divider, .summary-divider-bold {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: 8px 0;
    opacity: 0.5;
  }

  .summary-divider-bold {
    height: 2px;
    background: var(--primary-color);
    opacity: 0.3;
    margin: 16px 0;
  }

  .summary-total {
    background: var(--background-light);
    border-radius: var(--border-radius);
    padding: 16px;
    border: 2px solid var(--primary-color);
    animation: pulseGlow 2s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(13, 110, 253, 0.2); }
    50% { box-shadow: 0 0 15px rgba(13, 110, 253, 0.4); }
  }

  .summary-total-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0;
  }

  .summary-total-amount {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--primary-color);
    min-width: 90px;
    text-align: right;
  }

  .checkout-error {
    margin-top: 12px;
    margin-bottom: 0;
    text-align: center;
    animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .checkout-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 32px;
    background: none;
    border: none;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }

  .btn-back-checkout {
    font-size: 1rem;
    color: var(--primary-color);
    background: var(--white);
    border: 1px solid var(--primary-color);
    border-radius: var(--border-radius);
    min-width: 160px;
    font-weight: 500;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .btn-back-checkout:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--white);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
  }

  .btn-back-checkout:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  .btn-submit-order {
    font-size: 1rem;
    font-weight: 600;
    border-radius: var(--border-radius);
    background: var(--primary-color);
    color: var(--white);
    border: none;
    min-width: 180px;
    min-height: 42px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-submit-order:hover:not(:disabled) {
    background: var(--primary-color-dark);
    color: var(--white);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
  }

  .btn-submit-order:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    pointer-events: none;
  }

  .btn-submit-order.loading {
    pointer-events: none;
  }

  .loading-spinner {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeInOverlay 0.3s ease;
  }

  @keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .loading-content {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    text-align: center;
    min-width: 320px;
    animation: slideInUp 0.3s ease;
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .loading-spinner-large {
    width: 50px;
    height: 50px;
    margin-bottom: 20px;
    color: var(--primary-color);
  }

  .loading-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 8px;
  }

  .loading-subtext {
    font-size: 1rem;
    color: var(--text-color-medium);
    margin: 0;
  }

  .modal-order-summary {
    font-size: 1rem;
    color: var(--primary-color);
    margin-top: 12px;
    margin-bottom: 12px;
    text-align: center;
    background: var(--background-light);
    padding: 12px;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
  }

  .modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    border-bottom: 1px solid var(--border-color);
    padding: 20px 24px;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    border-top: 1px solid var(--border-color);
    padding: 20px 24px;
  }

  .modal-title {
    font-weight: 600;
    color: var(--text-color-dark);
  }

  @media (max-width: 575.98px) {
    .checkout-card, .checkout-content, .checkout-header, .checkout-actions {
      padding: 16px !important;
    }
    .checkout-title {
      font-size: 1.3rem;
    }
    .summary-total-title, .summary-total-amount {
      font-size: 1.1rem;
    }
    .checkout-actions {
      flex-direction: column;
    }
    .btn-back-checkout, .btn-submit-order {
      width: 100%;
      min-width: auto;
    }
    .loading-content {
      margin: 20px;
      min-width: auto;
      width: calc(100% - 40px);
    }
  }
`;

interface LocationState {
  order: OrderModel;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order: initialOrder } = (location.state as LocationState) || {};
  const { cartItems, getFormattedTotal, clearCart } = useCart();

  // Early validation to prevent crashes
  useEffect(() => {
    if (!initialOrder || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [initialOrder, cartItems.length, navigate]);

  const [order, setOrder] = useState<OrderModel>(() => {
    // Create order with proper initialization and safety checks
    if (initialOrder && typeof initialOrder === 'object') {
      return OrderModelUtils.ensureOrderModel(initialOrder);
    }
    return new OrderModel();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Calculate totals with safety checks
  const cartTotal = parseFloat(getFormattedTotal().replace(/[^0-9.-]+/g, '')) || 0;
  const deliveryAmount = parseFloat(order?.delivery_amount || '0') || 0;
  const payableAmount = parseFloat(order?.payable_amount || '0') || 0;
  const finalTotal = cartTotal + deliveryAmount;

  useEffect(() => {
    if (!initialOrder || cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Update order amounts exactly like Dart: widget.order.payable_amount = (mainController.tot + Utils.int_parse(widget.order.delivery_amount)).toString();
    setOrder(prevOrder => {
      // Ensure proper OrderModel instance with all methods
      const currentOrder = OrderModelUtils.ensureOrderModel(prevOrder);
      
      // Update calculated values
      currentOrder.order_total = cartTotal.toString();
      currentOrder.payable_amount = (cartTotal + deliveryAmount).toString(); // Items total + delivery (before tax)
      
      return currentOrder;
    });
  }, [cartTotal, deliveryAmount, initialOrder, cartItems.length, navigate]);

  const submitOrder = async () => {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      setErrorMessage('');

      // Small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate order data
      if (!order || typeof order !== 'object') {
        setErrorMessage('Order information is invalid. Please restart the checkout process.');
        navigate('/cart');
        return;
      }

      if (!order.customer_name || !order.customer_phone_number_1) {
        setErrorMessage('Order information is incomplete. Please go back and fill all required fields.');
        return;
      }

      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        setErrorMessage('Your cart is empty. Please add items before checkout.');
        navigate('/cart');
        return;
      }

      // Prepare delivery data exactly like Dart implementation
      const deliveryData = OrderModelUtils.toJson(order);
      
      // Handle phone numbers exactly like Dart code
      deliveryData.phone_number_2 = order.customer_phone_number_2 || order.customer_phone_number_1;
      deliveryData.phone_number_1 = order.customer_phone_number_1;
      deliveryData.phone_number = deliveryData.phone_number_1;

      // Submit order to API with exact same structure as Dart
      const response = await http_post('orders-create', {
        items: JSON.stringify(cartItems),
        delivery: JSON.stringify(deliveryData),
      });

      if (response.code !== 1) {
        setErrorMessage(response.message || 'Failed to submit order');
        ToastService.error(`Failed ${response.message || 'to submit order'}`);
        return;
      }

      // Parse the created order from response
      let createdOrder: OrderModel;
      try {
        if (response.data && typeof OrderModel.fromJson === 'function') {
          createdOrder = OrderModel.fromJson(response.data);
        } else {
          // Fallback: use utility to ensure proper OrderModel
          createdOrder = OrderModelUtils.ensureOrderModel(response.data);
        }
      } catch (error) {
        setErrorMessage('Failed to process order response');
        ToastService.error('Failed to process order response');
        return;
      }
      
      if (!createdOrder || createdOrder.id < 1) {
        setErrorMessage(response.message || 'Invalid order response');
        ToastService.error('Failed to submit order');
        return;
      }

      // Clear cart after successful order submission (like Dart: await CartItem.deleteAll())
      await clearCart();

      ToastService.success('Order submitted successfully!', { autoClose: 4000 });

      // Navigate to payment page for immediate payment processing
      navigate(`/payment/${createdOrder.id}`, { 
        state: { 
          orderSuccess: true, 
          orderId: createdOrder.id,
          order: createdOrder,
          paymentUrl: OrderModelUtils.getPaymentLink(createdOrder)
        } 
      });

    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to submit order');
      ToastService.error('Failed to submit order: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  if (!initialOrder || cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Your cart is empty or order information is missing. Please start from the cart.
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: checkoutPageStyles }} />
      <DynamicBreadcrumb showBackground={true} showIcons={true} />
      <div className="checkout-page">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="loading-overlay">
            <div className="loading-content">
              <Spinner animation="border" variant="primary" className="loading-spinner" />
              <div className="loading-text">
                <h4>Submitting Your Order</h4>
                <p>Please wait while we process your order...</p>
              </div>
            </div>
          </div>
        )}
        
        <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="checkout-card w-100" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="checkout-header">
              <h2 className="checkout-title">Order Summary</h2>
              <p className="checkout-subtitle">
                Please confirm your order details below before proceeding to payment
              </p>
            </div>
            <div className="checkout-content">
              {/* Order Items Total */}
              <div className="summary-item">
                <div className="summary-item-content">
                  <h4 className="summary-item-title">Order Items Total</h4>
                  <p className="summary-item-subtitle">
                    Total amount of all items in your cart
                  </p>
                </div>
                <div className="summary-item-amount">
                  {formatPrice(cartTotal.toString())}
                </div>
              </div>
              <div className="summary-divider"></div>
              {/* Delivery Cost */}
              <div className="summary-item">
                <div className="summary-item-content">
                  <h4 className="summary-item-title">Delivery Cost</h4>
                  <p className="summary-item-subtitle">
                    {`${order?.delivery_address_text || 'Delivery address'}, ${order?.delivery_address_details || ''}`}
                  </p>
                </div>
                <div className="summary-item-amount">
                  {formatPrice(order?.delivery_amount || "0")}
                </div>
              </div>
              <div className="summary-divider-bold"></div>
              {/* Total */}
              <div className="summary-item summary-total">
                <div className="summary-item-content">
                  <h3 className="summary-total-title">Total</h3>
                  <p className="summary-item-subtitle">
                    Final amount including all charges
                  </p>
                </div>
                <div className="summary-total-amount">
                  {formatPrice(finalTotal.toString())}
                </div>
              </div>
              {/* Error Message */}
              {errorMessage && (
                <Alert variant="danger" className="checkout-error">
                  {errorMessage}
                </Alert>
              )}
            </div>
            {/* Submit Button */}
            <div className="checkout-actions">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/delivery-address', { state: { order } })}
                className="btn-back-checkout"
                disabled={isSubmitting || isLoading}
              >
                Back to Delivery Info
              </Button>
              <Button
                onClick={handleSubmitClick}
                disabled={isSubmitting || isLoading}
                className="btn-submit-order"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {isSubmitting ? 'Submitting Order...' : 'Loading...'}
                  </>
                ) : (
                  'Submit Order'
                )}
              </Button>
            </div>
          </div>
          {/* Confirmation Modal */}
          <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Order Submission</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to submit this order?</p>
              <div className="modal-order-summary">
                <strong>Total Amount: {formatPrice(finalTotal.toString())}</strong>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={submitOrder}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {isSubmitting ? 'Submitting...' : 'Loading...'}
                  </>
                ) : (
                  'Confirm Order'
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default CheckoutPage;
