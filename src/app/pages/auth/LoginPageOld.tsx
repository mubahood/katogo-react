// src/app/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { authService } from "../../services/auth.service";
import "../../styles/ugflix-theme.css";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

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
    } else if (formData.password.length < 1) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    setServerError(""); // Clear server error
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        remember: formData.rememberMe,
      });

      if (response.success) {
        // Success - redirect to requested page or home
        console.log('Login successful:', response.data.user);
        navigate(from, { replace: true });
      } else {
        setServerError(response.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
    <div className="ugflix-auth-page">
      {/* Cinematic Background */}
      <div className="ugflix-auth-background">
        <div className="ugflix-auth-overlay"></div>
      </div>
      
      <div className="container-fluid h-100">
        <div className="row h-100 align-items-center justify-content-center">
          {/* UgFlix Branding */}
          <div className="col-12 text-center mb-4 ugflix-brand-header">
            <h1 className="ugflix-logo">UgFlix</h1>
            <p className="ugflix-tagline">Welcome Back to Premium Streaming</p>
          </div>
          
          {/* Login Form */}
          <div className="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-4">
            <div className="ugflix-auth-card">
              <div className="ugflix-card-content">
                <div className="text-center mb-4">
                  <h2 className="ugflix-card-title">Sign In</h2>
                  <p className="ugflix-card-subtitle">Access your streaming dashboard</p>
                </div>

                {serverError && (
                  <Alert variant="danger" className="mb-4 ugflix-alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {serverError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
        left: 0,
        right: 0,
        bottom: 0,
        background: `url('https://images.unsplash.com/photo-1489599904323-b1ff8516e206?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80') center/cover`,
        filter: 'brightness(0.3) blur(1px)',
        zIndex: 1
      }} />
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(231,9,20,0.1))',
        zIndex: 2
      }} />

      <Container style={{ position: 'relative', zIndex: 10 }}>
        <Row className="justify-content-center">
          <Col lg={5} md={7} sm={9}>
            {/* Login Card */}
            <div className="ugflix-card ugflix-fade-in" style={{
              padding: 'var(--ugflix-space-8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--ugflix-shadow-2xl)'
            }}>
              
              {/* Header */}
              <div className="text-center mb-5">
                {/* Logo */}
                <div className="mb-4">
                  <img 
                    src={APP_CONFIG.LOGO}
                    alt={APP_CONFIG.NAME}
                    style={{ 
                      height: '60px', 
                      maxWidth: '200px',
                      filter: 'brightness(1.1)'
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
                      margin: 0
                    }}
                  >
                    {APP_CONFIG.NAME}
                  </h1>
                </div>

                <h2 style={{
                  fontSize: 'var(--ugflix-text-2xl)',
                  fontWeight: 'var(--ugflix-font-bold)',
                  color: 'var(--ugflix-text-primary)',
                  marginBottom: 'var(--ugflix-space-2)'
                }}>
                  Welcome Back
                </h2>
                <p style={{
                  color: 'var(--ugflix-text-secondary)',
                  fontSize: 'var(--ugflix-text-base)',
                  margin: 0
                }}>
                  Sign in to continue your streaming experience
                </p>
              </div>

              {/* Error Alert */}
              {serverError && (
                <Alert 
                  variant="danger" 
                  className="mb-4"
                  style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    color: '#ff6b6b'
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {serverError}
                </Alert>
              )}

              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-4">
                  <Form.Label style={{
                    color: 'var(--ugflix-text-primary)',
                    fontWeight: 'var(--ugflix-font-medium)',
                    marginBottom: 'var(--ugflix-space-2)'
                  }}>
                    <i className="bi bi-envelope me-2"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter your email"
                    autoComplete="email"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'var(--ugflix-text-primary)',
                      padding: 'var(--ugflix-space-3)',
                      borderRadius: 'var(--ugflix-radius-md)',
                      fontSize: 'var(--ugflix-text-base)'
                    }}
                  />
                  <Form.Control.Feedback type="invalid" style={{
                    color: 'var(--ugflix-error)',
                    fontSize: 'var(--ugflix-text-sm)',
                    marginTop: 'var(--ugflix-space-1)'
                  }}>
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label style={{
                      color: 'var(--ugflix-text-primary)',
                      fontWeight: 'var(--ugflix-font-medium)',
                      margin: 0
                    }}>
                      <i className="bi bi-lock me-2"></i>
                      Password
                    </Form.Label>
                    <Link 
                      to="/auth/forgot-password" 
                      style={{
                        color: 'var(--ugflix-primary)',
                        textDecoration: 'none',
                        fontSize: 'var(--ugflix-text-sm)',
                        fontWeight: 'var(--ugflix-font-medium)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      isInvalid={!!errors.password}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'var(--ugflix-text-primary)',
                        padding: 'var(--ugflix-space-3)',
                        paddingRight: '3rem',
                        borderRadius: 'var(--ugflix-radius-md)',
                        fontSize: 'var(--ugflix-text-base)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--ugflix-text-muted)',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ugflix-text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ugflix-text-muted)'}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  <Form.Control.Feedback type="invalid" style={{
                    color: 'var(--ugflix-error)',
                    fontSize: 'var(--ugflix-text-sm)',
                    marginTop: 'var(--ugflix-space-1)'
                  }}>
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Remember Me */}
                <Form.Group className="mb-5">
                  <Form.Check
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    label="Keep me signed in"
                    style={{ color: 'var(--ugflix-text-secondary)' }}
                  />
                </Form.Group>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="ugflix-btn ugflix-btn-primary w-100 mb-4"
                  disabled={isLoading}
                  style={{
                    padding: 'var(--ugflix-space-4)',
                    fontSize: 'var(--ugflix-text-lg)',
                    fontWeight: 'var(--ugflix-font-bold)'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Sign In to {APP_CONFIG.NAME}
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="text-center mb-4">
                  <hr style={{
                    border: 'none',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    margin: 'var(--ugflix-space-4) 0'
                  }} />
                  <span style={{
                    background: 'var(--ugflix-background)',
                    color: 'var(--ugflix-text-muted)',
                    padding: '0 var(--ugflix-space-4)',
                    fontSize: 'var(--ugflix-text-sm)',
                    position: 'relative',
                    top: '-12px'
                  }}>
                    New to {APP_CONFIG.NAME}?
                  </span>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <Link 
                    to="/auth/register"
                    className="ugflix-btn ugflix-btn-outline w-100"
                    style={{
                      padding: 'var(--ugflix-space-3)',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Create New Account
                  </Link>
                </div>

                {/* Footer Links */}
                <div className="text-center mt-4 pt-4" style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--ugflix-space-6)',
                    flexWrap: 'wrap'
                  }}>
                    <Link to="/help" style={{
                      color: 'var(--ugflix-text-muted)',
                      textDecoration: 'none',
                      fontSize: 'var(--ugflix-text-sm)'
                    }}>
                      Help Center
                    </Link>
                    <Link to="/terms" style={{
                      color: 'var(--ugflix-text-muted)',
                      textDecoration: 'none',
                      fontSize: 'var(--ugflix-text-sm)'
                    }}>
                      Terms
                    </Link>
                    <Link to="/privacy" style={{
                      color: 'var(--ugflix-text-muted)',
                      textDecoration: 'none',
                      fontSize: 'var(--ugflix-text-sm)'
                    }}>
                      Privacy
                    </Link>
                  </div>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
