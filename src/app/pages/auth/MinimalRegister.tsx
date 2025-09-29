// src/app/pages/auth/MinimalRegister.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { registerUser } from "../../store/slices/authSlice";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  newsletter: boolean;
}

interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

const MinimalRegister: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    newsletter: false,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Remove body padding for auth pages
  React.useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setServerError("");
    
    try {
      console.log('🔐 Attempting registration...', { email: formData.email });
      
      // Use real registration
      const result = await dispatch(registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        newsletter: formData.newsletter
      }) as any);
      
      if (result.success) {
        console.log('✅ Registration successful, redirecting...');
        navigate("/");
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const errorMessage = error?.message || error || "Registration failed. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, var(--accent-color), var(--accent-color-dark, #b01424))`,
    display: 'flex',
    margin: 0,
    padding: 0
  };

  const brandingStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: 'var(--spacing-6)',
    textAlign: 'center',
    background: `linear-gradient(135deg, var(--accent-color) 0%, var(--accent-color-dark, #b01424) 100%)`
  };

  const formPanelStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-white)',
    padding: 'var(--spacing-6)',
    margin: 0
  };

  return (
    <div style={containerStyles}>
      {/* Left Panel - Branding */}
      <div style={brandingStyles} className="d-none d-lg-flex">
        <div>
          <Link to="/" className="text-white text-decoration-none mb-4 d-block">
            <img
              src="/media/logos/logo-white.png"
              alt={APP_CONFIG.NAME}
              style={{ maxHeight: '60px', marginBottom: 'var(--spacing-lg)' }}
              onError={(e) => {
                e.currentTarget.src = "/media/logos/logo.png";
                e.currentTarget.style.filter = "brightness(0) invert(1)";
              }}
            />
          </Link>
          <h1 style={{ 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'bold', 
            marginBottom: 'var(--spacing-lg)',
            color: 'white'
          }}>
            Join BlitXpress
          </h1>
          <p style={{ 
            fontSize: 'var(--font-size-lg)', 
            opacity: 0.9,
            marginBottom: 'var(--spacing-xl)',
            lineHeight: 1.6
          }}>
            Create your account and discover amazing products at unbeatable prices.
            Join thousands of satisfied customers worldwide!
          </p>
          
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-shield-check" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Secure Registration Process</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-gift" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Exclusive Member Discounts</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-heart" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Wishlist & Favorites</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-box-seam" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Order Tracking & History</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div style={formPanelStyles}>
        <div style={{ width: '100%', maxWidth: '400px', padding: 0 }}>
          {/* Mobile Logo */}
          <div className="text-center mb-4 d-lg-none">
            <Link to="/">
              <img
                src="/media/logos/logo.png"
                alt={APP_CONFIG.NAME}
                style={{ maxHeight: '50px' }}
                onError={(e) => {
                  // Fallback if logo doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          <div className="text-center mb-4">
            <h2 className="h3 fw-bold">Create Account</h2>
            <p className="text-muted">Join us and start your shopping journey</p>
          </div>

          {serverError && (
            <Alert variant="danger" className="mb-4">
              {serverError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.firstName}
                    placeholder="Enter your first name"
                    autoComplete="given-name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.lastName}
                    placeholder="Enter your last name"
                    autoComplete="family-name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
                placeholder="Enter your email address"
                autoComplete="email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                isInvalid={!!errors.password}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                isInvalid={!!errors.confirmPassword}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                isInvalid={!!errors.agreeToTerms}
                label={
                  <>
                    I agree to the{" "}
                    <Link to="/terms" className="text-decoration-none">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-decoration-none">
                      Privacy Policy
                    </Link>
                  </>
                }
              />
              <Form.Control.Feedback type="invalid">
                {errors.agreeToTerms}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleInputChange}
                label="Subscribe to newsletter for exclusive deals and updates"
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-100 mb-4"
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--accent-color)',
                borderColor: 'var(--accent-color)',
                borderRadius: 'var(--border-radius)'
              }}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center">
              <span className="text-muted">Already have an account? </span>
              <Link 
                to="/auth/login" 
                className="text-decoration-none fw-semibold"
                style={{ color: 'var(--accent-color)' }}
              >
                Sign in
              </Link>
            </div>
          </Form>

          <div className="text-center mt-4">
            <Link 
              to="/" 
              className="text-muted text-decoration-none"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              <i className="bi bi-arrow-left"></i>
              {' '}Back to Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalRegister;
