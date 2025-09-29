// src/app/pages/auth/MinimalLogin.tsx
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { loginUser } from "../../store/slices/authSlice";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const MinimalLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  // Get the intended destination after login
  const from = (location.state as any)?.from?.pathname || "/";

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
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
      console.log('🔐 Attempting login...', { email: formData.email });
      
      // Use real authentication
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }) as any);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error?.message || error || "Login failed. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, var(--primary-color), var(--primary-color-dark))`,
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
    background: `linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%)`
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
                // Fallback to logo.png if white version doesn't exist
                e.currentTarget.src = '/media/logos/logo.png';
                e.currentTarget.style.filter = 'brightness(0) invert(1)';
              }}
            />
          </Link>
          
          <h1 style={{ 
            fontSize: 'var(--font-size-3xl)', 
            marginBottom: 'var(--spacing-lg)',
            fontWeight: 'var(--font-weight-bold)'
          }}>
            Welcome to {APP_CONFIG.NAME}
          </h1>
          <p style={{ 
            fontSize: 'var(--font-size-lg)', 
            opacity: 0.9,
            marginBottom: 'var(--spacing-xl)'
          }}>
            Your premier destination for quality products at unbeatable prices.
            Join thousands of satisfied customers worldwide!
          </p>
          
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-shield-check" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>100% Secure Shopping Experience</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-truck" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Fast & Free Worldwide Delivery</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-headset" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>24/7 Premium Customer Support</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-award" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Best Price Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
            <h2 className="h3 fw-bold" style={{ color: 'var(--primary-color)' }}>Sign In</h2>
            <p className="text-muted">Welcome back! Please sign in to your account</p>
          </div>

          {serverError && (
            <Alert variant="danger" className="mb-4">
              {serverError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
                placeholder="Enter your email"
                autoComplete="email"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between">
                <Form.Label>Password</Form.Label>
                <Link 
                  to="/auth/forgot-password" 
                  className="small text-decoration-none"
                >
                  Forgot password?
                </Link>
              </div>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                isInvalid={!!errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                label="Remember me"
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-100 mb-4"
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                borderRadius: 'var(--border-radius)'
              }}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center mb-3">
              <span className="text-muted">Don't have an account? </span>
              <Link 
                to="/auth/register" 
                className="text-decoration-none fw-semibold"
                style={{ color: 'var(--accent-color)' }}
              >
                Sign up
              </Link>
            </div>

            <div className="text-center">
              <Link 
                to="/auth/forgot-password" 
                className="text-muted text-decoration-none"
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                Forgot your password?
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

export default MinimalLogin;
