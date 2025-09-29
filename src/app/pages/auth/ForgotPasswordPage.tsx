// src/app/pages/auth/ForgotPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner, Container, Row, Col, Card } from "react-bootstrap";
import { CheckCircle, Mail, ArrowLeft } from "react-bootstrap-icons";
import { APP_CONFIG } from "../../constants";
import AuthGuard from "../../components/Auth/AuthGuard";


const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic email validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5 text-center">
                <div className="mb-4">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "64px", height: "64px" }}>
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="h4 mb-3">Check Your Email</h2>
                  <p className="text-muted mb-4">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                <div className="mb-4">
                  <p className="small text-muted">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                  >
                    Try Different Email
                  </Button>
                  <Link to="/auth/login" className="btn btn-primary">
                    Back to Login
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "64px", height: "64px" }}>
                  <Mail size={32} />
                </div>
                <h1 className="h3 mb-2">Forgot Password?</h1>
                <p className="text-muted">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Form.Group>
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-control-lg"
                    />
                  </Form.Group>
                </div>

                <div className="d-grid gap-2 mb-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending Reset Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </div>
              </Form>

              {/* Back to Login */}
              <div className="text-center">
                <Link 
                  to="/auth/login" 
                  className="text-decoration-none d-inline-flex align-items-center"
                >
                  <ArrowLeft size={16} className="me-2" />
                  Back to Login
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* Help Section */}
          <div className="text-center mt-4">
            <p className="text-muted small">
              Need help? <Link to="/contact" className="text-decoration-none">Contact Support</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPasswordPage;
