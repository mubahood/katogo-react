import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import AuthGuard from '../../components/Auth/AuthGuard';
import { APP_CONFIG } from '../../constants';
import { MovieBackground } from '../../components/MovieBackground';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  marketingConsent: boolean;
}

interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    marketingConsent: true,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
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
      console.log('🔐 Starting registration process...', {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email
      });

      // Step 1: Register the user
      const registerResponse = await authService.register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });

      if (registerResponse.success) {
        console.log('✅ Registration API call successful:', registerResponse.data.user);
        
        // Step 2: Now login the user with the same credentials
        console.log('🔐 Now logging in the newly registered user...');
        
        const loginResponse = await authService.login({
          email: formData.email,
          password: formData.password,
          remember: false,
        });

        if (loginResponse.success) {
          console.log('✅ Login after registration successful:', loginResponse.data.user);
          
          // Verify that the user is actually authenticated
          const isUserAuthenticated = authService.isAuthenticated();
          const currentUser = authService.getCurrentUser();
          const authToken = authService.getAuthToken();
          
          console.log('🔍 Final authentication verification:', {
            isAuthenticated: isUserAuthenticated,
            hasUser: !!currentUser,
            hasToken: !!authToken,
            userId: currentUser?.id,
            userEmail: currentUser?.email
          });

          if (isUserAuthenticated && currentUser && authToken) {
            console.log('🎉 User successfully registered and logged in:', currentUser.name);
            
            // Show a brief success message before redirecting
            setServerError("");
            
            // Small delay to let user see the success state
            setTimeout(() => {
              console.log('🚀 Redirecting authenticated user to home page...');
              navigate("/", { replace: true });
            }, 500);
            
          } else {
            console.error('❌ Login verification failed after successful login response');
            setServerError("Registration completed but login verification failed. Please try logging in manually.");
          }
        } else {
          console.error('❌ Login after registration failed:', loginResponse.message);
          setServerError("Registration completed but login failed. Please try logging in manually.");
        }
      } else {
        console.error('❌ Registration failed:', registerResponse.message);
        setServerError(registerResponse.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error('❌ Registration/Login exception:', error);
      if (error.message && error.message.includes('Registration completed')) {
        setServerError("Registration completed but login failed. Please try logging in manually.");
      } else {
        setServerError(error.message || "Registration failed. Please try again.");
      }
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
        <div className="auth-form-side register-form-side">
          <div className="auth-form-container register-container">
            {/* Form Content */}
            <div className="auth-form-content register-content">
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
                <h1 className="auth-form-title">Create Account</h1>
                <p className="auth-form-subtitle">
                  Join us today
                </p>
              </div>

              {serverError && (
                <Alert variant="danger" className="auth-alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {serverError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="auth-form register-form">
                {/* Name Fields */}
                <div className="form-row">
                  <Form.Group className="auth-form-group half-width">
                    <Form.Label className="auth-form-label">
                      <i className="bi bi-person-fill"></i>
                      First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      isInvalid={!!errors.firstName}
                      className="auth-form-input"
                      placeholder="First name"
                      required
                    />
                    <Form.Control.Feedback type="invalid" className="auth-form-error">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="auth-form-group half-width">
                    <Form.Label className="auth-form-label">
                      <i className="bi bi-person-fill"></i>
                      Last Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      isInvalid={!!errors.lastName}
                      className="auth-form-input"
                      placeholder="Last name"
                      required
                    />
                    <Form.Control.Feedback type="invalid" className="auth-form-error">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Email Field */}
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

                {/* Phone Field */}
                <Form.Group className="auth-form-group">
                  <Form.Label className="auth-form-label">
                    <i className="bi bi-phone-fill"></i>
                    Phone Number (Optional)
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.phoneNumber}
                    className="auth-form-input"
                    placeholder="Enter phone number"
                  />
                  <Form.Control.Feedback type="invalid" className="auth-form-error">
                    {errors.phoneNumber}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password Fields */}
                <div className="form-row">
                  <Form.Group className="auth-form-group half-width">
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
                        placeholder="Create password"
                        required
                        autoComplete="new-password"
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

                  <Form.Group className="auth-form-group half-width">
                    <Form.Label className="auth-form-label">
                      <i className="bi bi-lock-fill"></i>
                      Confirm Password
                    </Form.Label>
                    <div className="auth-password-input">
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        isInvalid={!!errors.confirmPassword}
                        className="auth-form-input"
                        placeholder="Confirm password"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    <Form.Control.Feedback type="invalid" className="auth-form-error">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Terms and Marketing */}
                <div className="auth-form-checkboxes">
                  <Form.Group className="auth-checkbox-group">
                    <Form.Check
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      isInvalid={!!errors.agreeToTerms}
                      className="auth-checkbox"
                      required
                      label={
                        <span className="checkbox-label">
                          I agree to the{" "}
                          <Link to="/terms" className="auth-link">Terms of Service</Link>
                          {" "}and{" "}
                          <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                        </span>
                      }
                    />
                    <Form.Control.Feedback type="invalid" className="auth-form-error">
                      {errors.agreeToTerms}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="auth-checkbox-group">
                    <Form.Check
                      type="checkbox"
                      id="marketingConsent"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleInputChange}
                      className="auth-checkbox"
                      label={
                        <span className="checkbox-label">
                          <i className="bi bi-bell-fill"></i>
                          Get updates about new movies and exclusive content
                        </span>
                      }
                    />
                  </Form.Group>
                </div>

                <Button
                  type="submit"
                  className="auth-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Creating Account & Signing In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill"></i>
                      Create My Account
                    </>
                  )}
                </Button>

                <div className="auth-form-footer">
                  <p>
                    Already have an account?{" "}
                    <Link to="/auth/login" className="auth-signup-link">
                      <i className="bi bi-box-arrow-in-right"></i>
                      Sign In
                    </Link>
                  </p>
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* Register-specific Styles */}
        <style>{`
          /* Base Auth Layout Styles (same as Login) */
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
            max-width: 500px;
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
          }          .auth-logo-text {
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
          
          .auth-checkbox {
            color: rgba(255, 255, 255, 0.8);
          }
          
          .auth-checkbox input[type="checkbox"] {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          
          .auth-checkbox input[type="checkbox"]:checked {
            background: #4ecdc4;
            border-color: #4ecdc4;
          }
          
          .auth-link {
            color: #4ecdc4;
            text-decoration: none;
          }
          
          .auth-link:hover {
            color: #42b8b1;
          }
          
          /* Register-specific Styles */
          .register-form-side {
            overflow-y: auto;
            max-height: 100vh;
          }
          
          .register-container {
            max-width: 500px;
            padding: 1rem 0;
          }
          
          .register-content {
            max-height: none;
            overflow: visible;
          }
          
          .register-form {
            max-width: none;
          }
          
          .form-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 0;
          }
          
          .half-width {
            flex: 1;
          }
          
          .auth-form-checkboxes {
            margin-bottom: 1.5rem;
          }
          
          .auth-checkbox-group {
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
          }
          
          .checkbox-label {
            font-size: 0.875rem;
            line-height: 1.4;
          }
          
          .checkbox-label i {
            margin-right: 0.5rem;
            color: #4ecdc4;
          }
          
          /* Desktop: Show split layout */
          @media (min-width: 1024px) {
            .auth-movie-side {
              display: block;
            }
            
            .auth-form-side {
              flex: 0 0 55%;
            }
          }
          
          /* Tablet adjustments */
          @media (max-width: 1023px) {
            .auth-form-side {
              padding: 1.5rem;
            }
            
            .auth-form-content {
              padding: 1.5rem 0;
            }
          }
          
          /* Mobile adjustments */
          @media (max-width: 768px) {
            .auth-form-side {
              padding: 1rem;
            }
            
            .auth-form-content {
              padding: 1rem 0;
            }
            
            .auth-form-title {
              font-size: 1.75rem;
            }
            
            .form-row {
              flex-direction: column;
              gap: 0;
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
            
            .checkbox-label {
              font-size: 0.8rem;
            }
          }
          
          /* Height adjustments for register form */
          @media (max-height: 800px) {
            .register-form-side {
              padding: 1rem;
            }
            
            .register-content {
              padding: 1.5rem;
            }
            
            .auth-form-group {
              margin-bottom: 1rem;
            }
            
            .auth-logo {
              height: 50px;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
};

export default RegisterPage;