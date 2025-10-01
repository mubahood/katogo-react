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
          <div className="auth-form-container">
            {/* Form Content */}
            <div className="auth-form-content">
              <div className="auth-form-header">
                <div className="auth-logo-container">
                  <Link to="/" className="auth-logo-link">
                    <img 
                      src={APP_CONFIG.LOGO}
                      alt={APP_CONFIG.NAME}
                      className="auth-logo"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                        if (textLogo) textLogo.style.display = 'block';
                      }}
                    />
                    <h2 className="auth-logo-text" style={{ display: 'none' }}>
                      {APP_CONFIG.NAME}
                    </h2>
                  </Link>
                </div>
                <h1 className="auth-form-title">Login</h1>
                <p className="auth-form-subtitle">
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
            max-width: 400px;
            position: relative;
          }
          
          .auth-form-content {
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 2rem 0;
            box-shadow: none;
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
            color: #4ecdc4;
            margin: 0;
          }
          
          .auth-form-title {
            font-size: 2rem;
            font-weight: 700;
            color: #4ecdc4;
            margin-bottom: 0.5rem;
          }
          
          .auth-form-subtitle {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1rem;
            margin: 0;
          }
          
          .auth-alert {
            background: rgba(220, 53, 69, 0.15);
            border: none;
            border-left: 4px solid #ff6b6b;
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
            margin-bottom: 1.5rem;
          }
          
          .auth-form-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
          
          .auth-form-input {
            background: rgba(255, 255, 255, 0.05);
            border: none;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 0;
            padding: 1rem 0;
            color: white;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          
                    .auth-form-input:focus {
            background: rgba(255, 255, 255, 0.08);
            border-bottom-color: #4ecdc4;
            box-shadow: none;
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
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: color 0.3s ease;
          }
          
          .password-toggle:hover {
            color: rgba(255, 255, 255, 0.9);
          }
          
          .auth-form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
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
            background: #4ecdc4;
            border-color: #4ecdc4;
          }
          
          .auth-forgot-link {
            color: #4ecdc4;
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.3s ease;
          }
          
          .auth-forgot-link:hover {
            color: #42b8b1;
          }
          
          .auth-submit-button {
            background: #4ecdc4;
            border: none;
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
            background: #42b8b1;
            transform: none;
            box-shadow: none;
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
            color: #4ecdc4;
            text-decoration: none;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            transition: color 0.3s ease;
          }
          
          .auth-signup-link:hover {
            color: #42b8b1;
          }
          
          .auth-form-error {
            color: #ff6b6b;
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
              padding: 1.5rem;
              border-radius: 15px;
            }
            
            .auth-form-title {
              font-size: 1.75rem;
            }
            
            .auth-back-link {
              top: -2.5rem;
            }
            
            .back-button {
              font-size: 0.8rem;
              padding: 0.4rem 0.8rem;
            }
          }
          
          /* Small mobile */
          @media (max-width: 480px) {
            .auth-form-content {
              padding: 1.25rem;
            }
            
            .auth-form-title {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
};

export default LoginPage;