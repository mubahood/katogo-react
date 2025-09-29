// src/app/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { authService } from "../../services/auth.service";
import AuthGuard from "../../components/Auth/AuthGuard";
import "../../styles/auth-theme.css";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination or default to home
  const from = location.state?.from?.pathname || "/";
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
      console.log('🔐 Login form submitting with:', { 
        email: formData.email, 
        password: '[HIDDEN]',
        remember: formData.rememberMe 
      });
      
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        remember: formData.rememberMe,
      });

      console.log('🔐 Auth service response:', response);

      if (response.success) {
        // Success - redirect to requested page or home
        console.log('✅ Login successful, redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        console.error('❌ Login failed with response:', response);
        setServerError(response.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error('❌ Login exception caught:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setServerError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove body padding for auth pages
  useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
    };
  }, []);

  return (
    <AuthGuard requireAuth={false}>
      <div className="ugflix-auth-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            {/* Back to Home Link */}
            <div className="position-absolute" style={{ top: '2rem', left: '2rem', zIndex: 100 }}>
              <Link 
                to="/" 
                className="ugflix-btn ugflix-btn-ghost"
                style={{
                  padding: 'var(--ugflix-space-2) var(--ugflix-space-3)',
                  fontSize: 'var(--ugflix-text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ugflix-space-2)'
                }}
              >
                <i className="bi bi-arrow-left"></i>
                Back to Home
              </Link>
            </div>

            <Col xs={12} sm={10} md={8} lg={6} xl={4}>
              {/* UgFlix Branding */}
              <div className="text-center mb-4">
                <img 
                  src={APP_CONFIG.LOGO}
                  alt={APP_CONFIG.NAME}
                  style={{ 
                    height: '60px',
                    marginBottom: 'var(--ugflix-space-4)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                    if (textLogo) textLogo.style.display = 'block';
                  }}
                />
                <h1 
                  className="ugflix-text-gradient"
                  style={{
                    display: 'none',
                    fontSize: 'var(--ugflix-text-3xl)',
                    fontWeight: 'var(--ugflix-font-bold)',
                    marginBottom: 'var(--ugflix-space-4)'
                  }}
                >
                  {APP_CONFIG.NAME}
                </h1>
                <p style={{
                  color: 'var(--ugflix-text-secondary)',
                  fontSize: 'var(--ugflix-text-lg)',
                  marginBottom: 0
                }}>
                  Welcome back to premium streaming
                </p>
              </div>
              
              {/* Login Form */}
              <div className="ugflix-card">
                <div className="text-center mb-4">
                  <h2 style={{
                    fontSize: 'var(--ugflix-text-2xl)',
                    fontWeight: 'var(--ugflix-font-semibold)',
                    color: 'var(--ugflix-text-primary)',
                    marginBottom: 'var(--ugflix-space-2)'
                  }}>
                    Sign In
                  </h2>
                  <p style={{
                    color: 'var(--ugflix-text-secondary)',
                    fontSize: 'var(--ugflix-text-base)',
                    margin: 0
                  }}>
                    Access your streaming dashboard
                  </p>
                </div>

                {serverError && (
                  <Alert 
                    variant="danger" 
                    className="ugflix-alert"
                    style={{ marginBottom: 'var(--ugflix-space-4)' }}
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {serverError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group style={{ marginBottom: 'var(--ugflix-space-4)' }}>
                    <Form.Label className="ugflix-form-label">
                      <i className="bi bi-envelope-fill" style={{ marginRight: 'var(--ugflix-space-2)' }}></i>
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      isInvalid={!!errors.email}
                      className="ugflix-form-input"
                      placeholder="Enter your email address"
                      required
                      autoComplete="email"
                    />
                    <Form.Control.Feedback type="invalid" className="ugflix-form-error">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group style={{ marginBottom: 'var(--ugflix-space-4)' }}>
                    <Form.Label className="ugflix-form-label">
                      <i className="bi bi-lock-fill" style={{ marginRight: 'var(--ugflix-space-2)' }}></i>
                      Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        isInvalid={!!errors.password}
                        className="ugflix-form-input"
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        style={{ paddingRight: '3rem' }}
                      />
                      <button
                        type="button"
                        className="ugflix-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        style={{
                          position: 'absolute',
                          right: 'var(--ugflix-space-3)',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--ugflix-text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    <Form.Control.Feedback type="invalid" className="ugflix-form-error">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 'var(--ugflix-space-6)' }}>
                    <Form.Group className="mb-0">
                      <Form.Check
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="ugflix-form-checkbox"
                        label="Remember me"
                      />
                    </Form.Group>
                    
                    <Link 
                      to="/auth/forgot-password" 
                      className="ugflix-link"
                      style={{
                        fontSize: 'var(--ugflix-text-sm)',
                        color: 'var(--ugflix-primary)',
                        textDecoration: 'none'
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="ugflix-btn ugflix-btn-primary w-100"
                    disabled={isLoading}
                    style={{ marginBottom: 'var(--ugflix-space-4)' }}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          style={{ marginRight: 'var(--ugflix-space-2)' }}
                        />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right" style={{ marginRight: 'var(--ugflix-space-2)' }}></i>
                        Sign In to {APP_CONFIG.NAME}
                      </>
                    )}
                  </Button>
                </Form>

                {/* Register Link */}
                <div className="text-center">
                  <p style={{
                    color: 'var(--ugflix-text-secondary)',
                    fontSize: 'var(--ugflix-text-sm)',
                    marginBottom: 0
                  }}>
                    Don't have an account?{" "}
                    <Link 
                      to="/auth/register" 
                      className="ugflix-link"
                      style={{
                        color: 'var(--ugflix-primary)',
                        textDecoration: 'none',
                        fontWeight: 'var(--ugflix-font-semibold)'
                      }}
                    >
                      <i className="bi bi-person-plus-fill" style={{ marginRight: 'var(--ugflix-space-1)' }}></i>
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </AuthGuard>
  );
};

export default LoginPage;