// src/app/components/Demo/ToastDemo.tsx
import React from "react";
import { Button, Card, Row, Col, Container } from "react-bootstrap";
import ToastService from "../../services/ToastService";

const ToastDemo: React.FC = () => {
  const demoScenarios = [
    {
      title: "Authentication",
      actions: [
        { label: "Login Success", action: () => ToastService.loginSuccess("John Doe") },
        { label: "Login Error", action: () => ToastService.loginError("Invalid credentials") },
        { label: "Register Success", action: () => ToastService.registerSuccess("Jane Smith") },
        { label: "Register Error", action: () => ToastService.registerError("Email already exists") },
        { label: "Logout", action: () => ToastService.logoutSuccess() },
      ]
    },
    {
      title: "E-commerce Actions",
      actions: [
        { label: "Add to Cart", action: () => ToastService.addToCart("Wireless Headphones") },
        { label: "Remove from Cart", action: () => ToastService.removeFromCart("Laptop Stand") },
        { label: "Add to Wishlist", action: () => ToastService.addToWishlist("Smart Watch") },
        { label: "Remove from Wishlist", action: () => ToastService.removeFromWishlist("Phone Case") },
      ]
    },
    {
      title: "Orders & Payments",
      actions: [
        { label: "Order Success", action: () => ToastService.orderSuccess("ORD-2024-001") },
        { label: "Order Error", action: () => ToastService.orderError("Payment method declined") },
        { label: "Payment Success", action: () => ToastService.paymentSuccess() },
        { label: "Payment Error", action: () => ToastService.paymentError("Card expired") },
      ]
    },
    {
      title: "Profile & Account",
      actions: [
        { label: "Profile Updated", action: () => ToastService.profileUpdated() },
        { label: "Profile Error", action: () => ToastService.profileError("Failed to upload image") },
        { label: "Password Changed", action: () => ToastService.passwordChanged() },
        { label: "Password Error", action: () => ToastService.passwordError("Current password incorrect") },
      ]
    },
    {
      title: "System & Network",
      actions: [
        { label: "Network Error", action: () => ToastService.networkError() },
        { label: "Server Error", action: () => ToastService.serverError() },
        { label: "API Error", action: () => ToastService.apiError("Product not found") },
        { label: "Validation Error", action: () => ToastService.validationError("Please fill all required fields") },
      ]
    },
    {
      title: "General Actions",
      actions: [
        { label: "Action Success", action: () => ToastService.actionSuccess("Export data") },
        { label: "Action Error", action: () => ToastService.actionError("Import data") },
        { label: "Copied", action: () => ToastService.copied("Product link") },
        { label: "Shared", action: () => ToastService.shared("Product") },
      ]
    },
    {
      title: "Basic Toast Types",
      actions: [
        { label: "Success", action: () => ToastService.success("Operation completed successfully!") },
        { label: "Error", action: () => ToastService.error("Something went wrong!") },
        { label: "Warning", action: () => ToastService.warning("Please check your input!") },
        { label: "Info", action: () => ToastService.info("New feature available!") },
        { label: "Default", action: () => ToastService.default("This is a default message") },
      ]
    },
    {
      title: "Loading & Advanced",
      actions: [
        { 
          label: "Loading Toast", 
          action: () => {
            const toastId = ToastService.loading("Processing your order...");
            setTimeout(() => {
              ToastService.updateLoading(toastId, 'success', 'Order processed successfully!');
            }, 3000);
          }
        },
        { label: "Dismiss All", action: () => ToastService.dismissAll() },
      ]
    }
  ];

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="h2 fw-bold">Toast Notification Demo</h1>
        <p className="text-muted">Test all the different toast notification types and scenarios</p>
      </div>

      <Row>
        {demoScenarios.map((scenario, index) => (
          <Col lg={6} xl={4} key={index} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{scenario.title}</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {scenario.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="outline-primary"
                      size="sm"
                      onClick={action.action}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-5">
        <Button
          variant="danger"
          size="lg"
          onClick={() => ToastService.dismissAll()}
        >
          Clear All Toasts
        </Button>
      </div>
    </Container>
  );
};

export default ToastDemo;
