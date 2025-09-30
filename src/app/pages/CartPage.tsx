// src/app/pages/CartPage.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import { Container, Row, Col, Button, Image, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { CartItemModel } from "../models/CartItemModel";
import { OrderModel } from "../models/OrderModel";
import { formatPrice } from "../utils";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import ToastService from "../services/ToastService";
import DynamicBreadcrumb from "../components/shared/DynamicBreadcrumb";

// Inline styles following the same design patterns as ProductsPage and ProductDetailPage
const cartPageStyles = `
  .cart-page {
    background: var(--ugflix-bg-primary);
  }

  .cart-header {
    padding: 0;
    margin-bottom: 12px;
  }

  .cart-page-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: var(--ugflix-text-primary);
    height: 20px;
  }

  .cart-items-count {
    font-size: 13px;
    color: var(--ugflix-text-secondary);
    margin: 0;
  }

  .clear-cart-btn {
    font-size: 12px;
    color: var(--ugflix-text-secondary);
    padding: 0;
    text-decoration: none;
    border: none;
    background: none;
  }

  .clear-cart-btn:hover {
    color: var(--ugflix-primary);
    text-decoration: underline;
  }

  .clear-cart-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Empty Cart State */
    .empty-cart-container {
    text-align: center;
    padding: 60px 20px;
    background-color: var(--ugflix-bg-secondary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
  }

  .empty-cart-icon {
    width: 80px;
    height: 80px;
    background: var(--ugflix-bg-card);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--ugflix-spacing-lg, 1.5rem);
  }

  .empty-cart-icon i {
    font-size: 2rem;
    color: var(--ugflix-text-muted);
  }

  .empty-cart-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--ugflix-text-primary);
    margin-bottom: var(--ugflix-spacing-md, 1rem);
  }

  .empty-cart-subtitle {
    font-size: 14px;
    color: var(--ugflix-text-secondary);
    margin-bottom: var(--ugflix-spacing-lg, 1.5rem);
  }

  .btn-start-shopping {
    border: 1px solid var(--ugflix-primary);
    border-radius: 0px;
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    font-size: 14px;
    padding: 12px 24px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-start-shopping:hover {
    background: var(--ugflix-primary-dark);
    border-color: var(--ugflix-primary-dark);
    color: var(--ugflix-text-primary);
    text-decoration: none;
    transform: translateY(-1px);
  }

  .cart-items-container {
    background-color: var(--ugflix-bg-secondary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    padding: 16px;
  }

  /* Cart Items */
  .cart-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--ugflix-border);
    transition: background-color 0.2s ease;
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .cart-item:hover {
    background: var(--ugflix-bg-card);
  }

  .cart-item-image {
    width: 80px;
    height: 80px;
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    object-fit: contain;
    margin-right: 16px;
    background: var(--ugflix-bg-secondary);
  }

  .cart-item-details {
    flex: 1;
    margin-right: 16px;
  }

  .cart-item-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--ugflix-text-primary);
    text-decoration: none;
    display: block;
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .cart-item-name:hover {
    color: var(--ugflix-primary);
    text-decoration: none;
  }

  .cart-item-variant {
    font-size: 12px;
    color: var(--ugflix-text-secondary);
    margin-bottom: 4px;
  }

  .cart-item-price {
    font-size: 13px;
    font-weight: 500;
    color: var(--ugflix-text-primary);
  }

  /* Quantity Control */
  .quantity-control {
    display: flex;
    align-items: center;
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    margin-right: 16px;
  }

  .quantity-btn {
    background: none;
    border: none;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ugflix-text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quantity-btn:hover:not(:disabled) {
    background: var(--ugflix-bg-card);
    color: var(--ugflix-primary);
  }

  .quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .quantity-display {
    min-width: 40px;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    color: var(--ugflix-text-primary);
    border-left: 1px solid var(--ugflix-border);
    border-right: 1px solid var(--ugflix-border);
    padding: 0 8px;
    line-height: 30px;
  }

  /* Item Total and Remove */
  .cart-item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .cart-item-total {
    font-size: 14px;
    font-weight: 600;
    color: var(--ugflix-text-primary);
  }

  .remove-item-btn {
    background: none;
    border: none;
    color: var(--ugflix-text-muted);
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 0px;
    transition: all 0.2s ease;
  }

  .remove-item-btn:hover:not(:disabled) {
    color: var(--ugflix-primary);
    background: var(--ugflix-bg-card);
  }

  .remove-item-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Continue Shopping */
  .continue-shopping {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--ugflix-border);
  }

  .btn-continue-shopping {
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    background: var(--ugflix-bg-secondary);
    color: var(--ugflix-text-primary);
    font-size: 13px;
    padding: 10px 16px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-continue-shopping:hover {
    background: var(--ugflix-bg-card);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-primary);
    text-decoration: none;
  }

  /* Order Summary */
  .order-summary-container {
    background-color: var(--ugflix-bg-secondary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    padding: 16px;
  }

  .order-summary {
    position: sticky;
    top: 20px;
  }

  .summary-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--ugflix-text-primary);
  }

  .summary-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
  }

  .summary-line:not(:last-child) {
    border-bottom: 1px solid var(--ugflix-border);
  }

  .summary-line span:first-child {
    color: var(--ugflix-text-secondary);
  }

  .summary-line span:last-child {
    color: var(--ugflix-text-primary);
    font-weight: 500;
  }

  .summary-total {
    padding: 12px 0;
    margin-top: 8px;
    border-top: 2px solid var(--ugflix-border) !important;
    font-size: 14px !important;
    font-weight: 600 !important;
  }

  .summary-total span {
    color: var(--ugflix-text-primary) !important;
    font-weight: 600 !important;
  }

  .summary-free {
    color: var(--ugflix-accent) !important;
    font-weight: 500 !important;
  }

  /* Delivery Info */
  .delivery-info {
    margin: 16px 0;
    padding: 12px;
    background: var(--ugflix-bg-card);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delivery-info:hover {
    border-color: var(--ugflix-primary);
    background: var(--ugflix-bg-secondary);
  }

  .delivery-info-icon {
    color: var(--ugflix-primary);
    font-size: 16px;
  }

  .delivery-info-content {
    flex: 1;
  }

  .delivery-info-title {
    font-size: 13px;
    font-weight: 500;
    margin: 0 0 2px 0;
    color: var(--ugflix-text-primary);
  }

  .delivery-info-subtitle {
    font-size: 12px;
    color: var(--ugflix-text-secondary);
    margin: 0;
  }

  .delivery-info-arrow {
    color: var(--ugflix-text-muted);
    font-size: 12px;
  }

  /* Checkout Button */
  .btn-checkout {
    width: 100%;
    border: 1px solid var(--ugflix-primary);
    border-radius: 0px;
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    font-size: 14px;
    padding: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .btn-checkout:hover:not(:disabled) {
    background: var(--ugflix-primary-dark);
    border-color: var(--ugflix-primary-dark);
    color: var(--ugflix-text-primary);
    text-decoration: none;
    transform: translateY(-1px);
  }

  .btn-checkout:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* Trust Indicators */
  .trust-indicators {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--ugflix-text-secondary);
  }

  .trust-item i {
    color: var(--ugflix-accent);
    font-size: 14px;
  }

  /* Responsive Design */
  @media (max-width: 767px) {
    .cart-page-title {
      font-size: 18px;
    }

    .cart-item {
      padding: 12px;
    }

    .cart-item-image {
      width: 60px;
      height: 60px;
      margin-right: 12px;
    }

    .cart-item-name {
      font-size: 13px;
    }

    .quantity-control {
      margin-right: 8px;
    }

    .quantity-btn {
      width: 28px;
      height: 28px;
    }

    .quantity-display {
      min-width: 32px;
      line-height: 26px;
    }

    .order-summary {
      position: static;
      margin-top: 20px;
    }

    .trust-indicators {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 575px) {
    .cart-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .cart-item-image {
      align-self: center;
      margin-right: 0;
    }

    .cart-item-details {
      margin-right: 0;
      text-align: center;
      width: 100%;
    }

    .cart-item-actions {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .quantity-control {
      margin-right: 0;
    }
  }
`;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount, 
    isEmpty, 
    isLoading,
    updateQuantity, 
    removeFromCart,
    clearCart,
    getFormattedTotal 
  } = useCart();
  
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Order state to track delivery method and info
  const [order, setOrder] = useState<OrderModel>(() => {
    const newOrder = new OrderModel();
    newOrder.delivery_method = "delivery"; // Default to delivery as per Dart code
    return newOrder;
  });

  // Initialize order with user info when user is available
  useEffect(() => {
    if (user) {
      const updatedOrder = new OrderModel();
      Object.assign(updatedOrder, order);
      updatedOrder.mail = user.email || "";
      updatedOrder.customer_name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      updatedOrder.customer_phone_number_1 = user.phone_number_1 || "";
      updatedOrder.customer_phone_number_2 = user.phone_number_2 || "";
      updatedOrder.delivery_method = "delivery";
      setOrder(updatedOrder);
    }
  }, [user]);

  // Optimized handlers with useCallback for better performance
  const handleQuantityChange = useCallback(async (item: CartItemModel, newQuantity: number) => {
    await updateQuantity(item.product_id, newQuantity, item.variant);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback(async (item: CartItemModel) => {
    await removeFromCart(item.product_id, item.variant);
  }, [removeFromCart]);

  const handleClearCart = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    // Validate user is logged in
    if (!user || !user.id) {
      ToastService.error('Please login to continue');
      navigate('/auth/login');
      return;
    }

    // Validate cart is not empty
    if (isEmpty) {
      ToastService.error('Your cart is empty, Please add items to your cart');
      return;
    }

    // For delivery method, proceed to delivery address page
    navigate('/delivery-address', { state: { order } });
  }, [user, isEmpty, navigate, order]);

  // Optimized individual quantity handlers for better performance
  const handleQuantityDecrease = useCallback((item: CartItemModel) => {
    const newQuantity = Math.max(1, item.product_quantity - 1);
    handleQuantityChange(item, newQuantity);
  }, [handleQuantityChange]);

  const handleQuantityIncrease = useCallback((item: CartItemModel) => {
    const newQuantity = item.product_quantity + 1;
    handleQuantityChange(item, newQuantity);
  }, [handleQuantityChange]);

  if (isEmpty) {
    return (
      <>
        <style>{cartPageStyles}</style>
        
        {/* Dynamic Breadcrumb */}
        <DynamicBreadcrumb
          context={{
            currentPage: "Shopping Cart"
          }}
          showBackground={true}
          showIcons={true}
        />

        <Container fluid>
          <div className="cart-page">
            <div className="empty-cart-container">
              <div className="empty-cart-icon">
                <i className="bi bi-cart-x"></i>
              </div>
              <h2 className="empty-cart-title">Your cart is empty</h2>
              <p className="empty-cart-subtitle">
                Discover amazing products and add them to your cart
              </p>
              <Link to="/products" className="btn-start-shopping">
                <i className="bi bi-shop"></i>
                Start Shopping
              </Link>
            </div>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <style>{cartPageStyles}</style>
      
      {/* Dynamic Breadcrumb */}
      <DynamicBreadcrumb
        context={{
          currentPage: "Shopping Cart"
        }}
        showBackground={true}
        showIcons={true}
      />

      <Container fluid>
        <div className="cart-page">
          <Row>
            {/* Cart Items */}
            <Col lg={8} className="my-0">
              <div className="cart-items-container">
                  <div className="cart-header mb-3">
                    <Row className="align-items-center">
                      <Col md={8}>
                        <div className="text-start">
                          <h1 className="cart-page-title">Shopping Cart</h1>
                          <p className="cart-items-count">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-end">
                          <Button 
                            variant="link" 
                            className="clear-cart-btn"
                            onClick={handleClearCart}
                            disabled={isLoading}
                          >
                            <i className="bi bi-trash3 me-1"></i>
                            Clear All
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Cart Items List */}
                  <div className="cart-items">
                    {cartItems.map((item: CartItemModel) => (
                      <div key={item.id} className="cart-item">
                        <Image 
                          src={item.getImageUrl()}
                          alt={item.product_name}
                          className="cart-item-image"
                          onError={(e) => {
                            e.currentTarget.src = '/media/svg/files/blank-image.svg';
                          }}
                        />

                        <div className="cart-item-details">
                          <Link 
                            to={`/product/${item.product_id}`}
                            className="cart-item-name"
                          >
                            {item.product_name}
                          </Link>
                          
                          {item.hasVariant() && (
                            <div className="cart-item-variant">
                              {item.getVariantDisplay()}
                            </div>
                          )}
                          
                          <div className="cart-item-price">
                            {formatPrice(item.product_price_1)}
                          </div>
                        </div>

                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityDecrease(item)}
                            disabled={isLoading || item.product_quantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          
                          <span className="quantity-display">
                            {item.product_quantity}
                          </span>
                          
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityIncrease(item)}
                            disabled={isLoading}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>

                        <div className="cart-item-actions">
                          <div className="cart-item-total">
                            {formatPrice((item.getSubtotal()).toString())}
                          </div>
                          <button
                            className="remove-item-btn"
                            onClick={() => handleRemoveItem(item)}
                            disabled={isLoading}
                            title="Remove item"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Continue Shopping */}
                  <div className="continue-shopping">
                    <Link to="/products" className="btn-continue-shopping">
                      <i className="bi bi-arrow-left"></i>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
            </Col>

            {/* Order Summary Sidebar */}
            <Col lg={4} className="my-0">
              <div className="order-summary-container">
                  <div className="order-summary">
                    <h3 className="summary-title">Order Summary</h3>
                    
                    <div className="summary-details">
                      <div className="summary-line">
                        <span>Subtotal ({cartCount} items)</span>
                        <span>{getFormattedTotal()}</span>
                      </div>
                      
                      <div className="summary-line">
                        <span>Shipping</span>
                        <span className="summary-free">Calculated at checkout</span>
                      </div>
                      
                      <div className="summary-line summary-total">
                        <span>Total</span>
                        <span>{getFormattedTotal()}</span>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="delivery-info">
                      <div className="delivery-info-icon">
                        <i className="bi bi-geo-alt-fill"></i>
                      </div>
                      <div className="delivery-info-content">
                        <h6 className="delivery-info-title">Delivery Information</h6>
                        <p className="delivery-info-subtitle">
                          {order.delivery_amount ? 
                            `${formatPrice(order.delivery_amount)}` : 
                            'Select delivery address'
                          }
                        </p>
                      </div>
                      <div className="delivery-info-arrow">
                        <i className="bi bi-chevron-right"></i>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button 
                      className="btn-checkout"
                      onClick={handleCheckout}
                      disabled={isLoading}
                    >
                      <i className="bi bi-shield-check"></i>
                      Checkout
                    </Button>

                    {/* Trust Indicators */}
                    <div className="trust-indicators">
                      <div className="trust-item">
                        <i className="bi bi-shield-fill-check"></i>
                        <span>Secure Payment</span>
                      </div>
                      <div className="trust-item">
                        <i className="bi bi-truck"></i>
                        <span>Fast Delivery</span>
                      </div>
                      <div className="trust-item">
                        <i className="bi bi-arrow-clockwise"></i>
                        <span>Easy Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
};

export default memo(CartPage);
