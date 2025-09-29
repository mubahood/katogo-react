// src/app/pages/auth/ForgotPassword.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import { requestPasswordResetAction, resetPasswordAction } from "../../store/slices/authSlice";

interface ForgotPasswordFormData {
  email: string;
}

interface ResetPasswordFormData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  
  const [forgotFormData, setForgotFormData] = useState<ForgotPasswordFormData>({
    email: ""
  });
  
  const [resetFormData, setResetFormData] = useState<ResetPasswordFormData>({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Remove body padding for auth pages
  React.useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (step === 'request') {
      setForgotFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setResetFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
    
    // Clear messages when user starts typing
    if (serverError) setServerError("");
    if (successMessage) setSuccessMessage("");
  };

  const validateForgotForm = (): boolean => {
    const newErrors: any = {};

    if (!forgotFormData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(forgotFormData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = (): boolean => {
    const newErrors: any = {};

    if (!resetFormData.code) {
      newErrors.code = "Reset code is required";
    } else if (resetFormData.code.length < 3) {
      newErrors.code = "Please enter a valid reset code";
    }

    if (!resetFormData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (resetFormData.newPassword.length < 4) {
      newErrors.newPassword = "Password must be at least 4 characters";
    }

    if (!resetFormData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForgotForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
    
    try {
      console.log('🔐 Requesting password reset...', { email: forgotFormData.email });
      
      const result = await dispatch(requestPasswordResetAction(forgotFormData.email) as any);
      
      if (result.success) {
        console.log('✅ Password reset request successful');
        setSuccessMessage(result.message || 'Password reset code sent to your email');
        setEmail(forgotFormData.email);
        setResetFormData(prev => ({ ...prev, email: forgotFormData.email }));
        setStep('reset');
      } else {
        throw new Error(result.error || 'Failed to send password reset email');
      }
    } catch (error: any) {
      console.error('❌ Password reset request error:', error);
      const errorMessage = error?.message || error || "Failed to send password reset email. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
    
    try {
      console.log('🔐 Resetting password...', { email: resetFormData.email });
      
      const result = await dispatch(resetPasswordAction(
        resetFormData.email,
        resetFormData.code,
        resetFormData.newPassword
      ) as any);
      
      if (result.success) {
        console.log('✅ Password reset successful');
        setSuccessMessage(result.message || 'Password reset successfully');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      const errorMessage = error?.message || error || "Failed to reset password. Please try again.";
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
            {step === 'request' ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p style={{ 
            fontSize: 'var(--font-size-lg)', 
            opacity: 0.9,
            marginBottom: 'var(--spacing-xl)',
            lineHeight: 1.6
          }}>
            {step === 'request' 
              ? "Don't worry! It happens. Please enter your email address and we'll send you a reset code."
              : "Enter the reset code sent to your email along with your new password."
            }
          </p>
          
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-shield-check" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Secure Password Recovery</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-envelope" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Email Verification Required</span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <i className="bi bi-clock" style={{ fontSize: 'var(--font-size-xl)' }}></i>
              <span>Quick & Easy Process</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
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
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          <div className="text-center mb-4">
            <h2 className="h3 fw-bold">
              {step === 'request' ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <p className="text-muted">
              {step === 'request' 
                ? "Enter your email to receive a reset code"
                : `Enter the code sent to ${email}`
              }
            </p>
          </div>

          {serverError && (
            <Alert variant="danger" className="mb-4">
              {serverError}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="mb-4">
              {successMessage}
            </Alert>
          )}

          {step === 'request' ? (
            <Form onSubmit={handleRequestReset}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={forgotFormData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
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
                    Sending reset code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>

              <div className="text-center">
                <span className="text-muted">Remember your password? </span>
                <Link 
                  to="/auth/login" 
                  className="text-decoration-none fw-semibold"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Sign in
                </Link>
              </div>
            </Form>
          ) : (
            <Form onSubmit={handlePasswordReset}>
              <Form.Group className="mb-3">
                <Form.Label>Reset Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={resetFormData.code}
                  onChange={handleInputChange}
                  isInvalid={!!errors.code}
                  placeholder="Enter the reset code from your email"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={resetFormData.newPassword}
                  onChange={handleInputChange}
                  isInvalid={!!errors.newPassword}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={resetFormData.confirmPassword}
                  onChange={handleInputChange}
                  isInvalid={!!errors.confirmPassword}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
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
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center">
                <span className="text-muted">Need a new code? </span>
                <Link 
                  to="#" 
                  className="text-decoration-none fw-semibold"
                  style={{ color: 'var(--primary-color)' }}
                  onClick={(e) => {
                    e.preventDefault();
                    setStep('request');
                    setErrors({});
                    setServerError("");
                    setSuccessMessage("");
                  }}
                >
                  Request again
                </Link>
              </div>
            </Form>
          )}

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

export default ForgotPassword;
