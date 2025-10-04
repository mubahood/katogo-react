// src/app/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { authService } from "../../services/auth.service";
import AuthGuard from "../../components/Auth/AuthGuard";
import { MovieBackground } from "../../components/MovieBackground";


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
      <div className="split-auth-layout">
        {/* Movie Background Side */}
        <div className="auth-movie-side">
          <MovieBackground 
            showOverlay={true}
            overlayOpacity={0.8}
            showMovieInfo={false}
            muted={true}
            showControls={false}
          />
        </div>

        {/* Form Side */}
        <div className="auth-form-side">
          <div className="auth-form-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 1rem' }}>
            {/* Form Content */}
            <div className="auth-form-content" style={{ width: '100%', maxWidth: '450px' }}>
              <div className="auth-form-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div className="auth-logo-container" style={{ marginBottom: '1.5rem' }}>
                  <Link to="/" className="auth-logo-link">
                    <img 
                      src={APP_CONFIG.LOGO}
                      alt={APP_CONFIG.NAME}
                      className="auth-logo"
                      style={{ height: '50px', width: 'auto' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                        if (textLogo) textLogo.style.display = 'block';
                      }}
                    />
                    <h2 className="auth-logo-text" style={{ display: 'none', color: '#B71C1C', fontSize: '1.75rem', fontWeight: 'bold' }}>
                      {APP_CONFIG.NAME}
                    </h2>
                  </Link>
                </div>
                <h1 className="auth-form-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Login</h1>
                <p className="auth-form-subtitle" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                  Welcome back
                </p>
              </div>

              {serverError && (
                <Alert variant="danger" className="auth-alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {serverError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="auth-form-group">
                  <Form.Label className="auth-form-label">
                    <i className="bi bi-envelope-fill"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    className="auth-form-input"
                    placeholder="Enter your email address"
                    required
                    autoComplete="email"
                  />
                  <Form.Control.Feedback type="invalid" className="auth-form-error">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="auth-form-group">
                  <Form.Label className="auth-form-label">
                    <i className="bi bi-lock-fill"></i>
                    Password
                  </Form.Label>
                  <div className="auth-password-input">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      isInvalid={!!errors.password}
                      className="auth-form-input"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <Form.Control.Feedback type="invalid" className="auth-form-error">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="auth-form-options">
                  <Form.Group className="auth-checkbox-group">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="auth-checkbox"
                      label="Remember me"
                    />
                  </Form.Group>
                  
                  <Link to="/auth/forgot-password" className="auth-forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="auth-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right"></i>
                      Sign In
                    </>
                  )}
                </Button>

                <div className="auth-form-footer">
                  <p>
                    Don't have an account?{" "}
                    <Link to="/auth/register" className="auth-signup-link">
                      <i className="bi bi-person-plus-fill"></i>
                      Create Account
                    </Link>
                  </p>
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* Styles */}
        <style>{`
          .split-auth-layout {
            display: flex;
            min-height: 100vh;
            background: #000;
          }
          
          .auth-movie-side {
            flex: 1;
            position: relative;
            min-height: 100vh;
            display: none;
          }
          
          .auth-form-side {
            flex: 1;
            min-height: 100vh;
            background: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          
          .auth-form-container {
            width: 100%;
            max-width: 450px;
            position: relative;
          }
          
          .auth-form-content {
            background: rgba(0,0,0,0.3);
            border: 2px solid rgba(183, 28, 28, 0.3);
            border-radius: 0;
            padding: 2.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
          }
          
          .auth-form-header {
            text-align: center;
            margin-bottom: 2rem;
          }
          
          .auth-logo-container {
            margin-bottom: 1.5rem;
          }
          
          .auth-logo-link {
            display: block;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          
          .auth-logo-link:hover {
            transform: scale(1.05);
          }
          
          .auth-logo {
            height: 60px;
            width: auto;
            margin-bottom: 0.5rem;
            transition: all 0.3s ease;
          }
          
          .auth-logo-text {
            font-size: 1.8rem;
            font-weight: 700;
            color: #B71C1C;
            margin: 0;
          }
          
          .auth-form-title {
            font-size: 2rem;
            font-weight: 700;
            color: #B71C1C;
            margin-bottom: 0.5rem;
          }
          
          .auth-form-subtitle {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1rem;
            margin: 0;
          }
          
          .auth-alert {
            background: rgba(220, 53, 69, 0.15);
            border: 2px solid #B71C1C;
            border-radius: 0;
            padding: 1rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .auth-form {
            width: 100%;
          }
          
          .auth-form-group {
            margin-bottom: 1.25rem;
          }
          
          .auth-form-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            margin-bottom: 0.75rem;
            font-size: 0.9rem;
          }
          
          .auth-form-input {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 0;
            padding: 1rem;
            color: white;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          
                    .auth-form-input:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: #B71C1C;
            box-shadow: 0 0 0 2px rgba(183, 28, 28, 0.2);
            color: white;
            outline: none;
          }
          
          .auth-form-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          
          .auth-password-input {
            position: relative;
          }
          
          .password-toggle {
          .password-toggle {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0;
            transition: color 0.3s ease;
          }
          
          .password-toggle:hover {
            color: #B71C1C;
          }
          .auth-form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            margin-top: 0.5rem;
          }
          
          .auth-checkbox-group {
            margin: 0;
            display: flex;
            align-items: center;
          }
          
          .auth-checkbox {
            color: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .auth-checkbox input[type="checkbox"] {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            margin-right: 0.5rem;
            margin-top: 0;
          }
          
          .auth-checkbox input[type="checkbox"]:checked {
            background: #B71C1C;
            border-color: #B71C1C;
          }
          
          .auth-forgot-link {
            color: #B71C1C;
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.3s ease;
          }
          
          .auth-forgot-link:hover {
            color: #8B0000;
          }
          
          .auth-submit-button {
            background: #B71C1C;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 0;
            padding: 1.2rem;
            width: 100%;
            font-weight: 600;
            font-size: 1rem;
            color: white;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .auth-submit-button:hover:not(:disabled) {
            background: #8B0000;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(183, 28, 28, 0.4);
          }
          
          .auth-submit-button:disabled {
            opacity: 0.7;
          }
          
          .auth-form-footer {
            text-align: center;
          }
          
          .auth-form-footer p {
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
          }
          
          .auth-signup-link {
            color: #B71C1C;
            text-decoration: none;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            transition: color 0.3s ease;
          }
          
          .auth-signup-link:hover {
            color: #8B0000;
          }
          
          .auth-form-error {
            color: #B71C1C;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
          
          /* Desktop: Show split layout */
          @media (min-width: 1024px) {
            .auth-movie-side {
              display: block;
            }
            
            .auth-form-side {
              flex: 0 0 45%;
            }
            
            .auth-back-link {
              position: fixed;
              top: 2rem;
              right: 2rem;
            }
          }
          
          /* Tablet adjustments */
          @media (max-width: 1023px) {
            .auth-form-side {
              padding: 1.5rem;
            }
            
            .auth-form-content {
              padding: 2rem;
            }
            
            .auth-back-link {
              top: -2rem;
            }
          }
          
          /* Mobile adjustments */
          @media (max-width: 768px) {
            .auth-form-side {
              padding: 1rem;
            }
            
            .auth-form-content {
              padding: 2rem 1.5rem;
              border-radius: 0;
            }
            
            .auth-form-title {
              font-size: 1.75rem;
            }
            
            .auth-form-container {
              padding: 1rem !important;
            }
            
            .back-button {
              font-size: 0.8rem;
              padding: 0.4rem 0.8rem;
            }
          }
          
          /* Small mobile */
          @media (max-width: 480px) {
            .auth-form-content {
              padding: 1.5rem 1.25rem;
            }
            
            .auth-form-title {
              font-size: 1.5rem;
            }
            
            .auth-form-header {
              margin-bottom: 1.5rem;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
};

export default LoginPage;