// src/app/pages/OrderSuccessPage.tsx
import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const OrderSuccessPage: React.FC = () => {
  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  return (
    <div className="order-success-page">
      <Container>
        <div className="success-content text-center py-5">
          <div className="success-icon mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
          </div>
          
          <h1 className="h2 mb-3">Order Placed Successfully!</h1>
          <p className="lead text-muted mb-4">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
          
          <Card className="mx-auto mb-4" style={{ maxWidth: "500px" }}>
            <Card.Body>
              <h5>Order Details</h5>
              <div className="d-flex justify-content-between">
                <span>Order Number:</span>
                <strong>{orderNumber}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Estimated Delivery:</span>
                <strong>3-5 business days</strong>
              </div>
            </Card.Body>
          </Card>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/account/orders" className="btn btn-primary">
              View Order Details
            </Link>
            <Link to="/products" className="btn btn-outline-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OrderSuccessPage;
