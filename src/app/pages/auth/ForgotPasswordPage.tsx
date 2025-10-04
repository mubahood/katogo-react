// src/app/pages/auth/ForgotPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { APP_CONFIG, COMPANY_INFO } from "../../constants";
import AuthGuard from "../../components/Auth/AuthGuard";
import { MovieBackground } from "../../components/MovieBackground";

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

  // Remove body padding for auth pages
  useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
    };
  }, []);

  if (isSubmitted) {
    return (
      <AuthGuard requireAuth={false}>
        <div className="fullscreen-auth-layout">
          {/* Full Background Video */}
          <div className="auth-background-video">
            <MovieBackground 
              showOverlay={true}
              overlayOpacity={0.75}
              showMovieInfo={false}
              muted={false}
              showControls={false}
            />
          </div>

          {/* Centered Form Overlay */}
          <div className="auth-form-overlay">
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
                  <div className="success-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h1 className="auth-form-title">Check Your Email</h1>
                  <p className="auth-form-subtitle">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                <div className="auth-form-info">
                  <p>
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>

                <div className="auth-form-actions">
                  <Button
                    variant="outline-primary"
                    className="auth-outline-button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                  >
                    <i className="bi bi-arrow-repeat"></i>
                    Try Different Email
                  </Button>
                  
                  <Link to="/auth/login" className="auth-submit-button">
                    <i className="bi bi-box-arrow-in-right"></i>
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Help Button */}
          <a 
            href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-help-button"
            title="Need help? Chat with us on WhatsApp"
          >
            <i className="bi bi-whatsapp"></i>
            <span className="help-text">Help</span>
          </a>

          {/* Styles */}
          <style>{`
            /* Full Screen Background Video Layout */
            .fullscreen-auth-layout {
              position: relative;
              min-height: 100vh;
              width: 100%;
              overflow: hidden;
              background: #000;
            }
            
            .auth-background-video {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 1;
            }
            
            .auth-form-overlay {
              position: relative;
              z-index: 10;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem 1rem;
            }
            
            .auth-form-container {
              width: 100%;
              max-width: 400px;
              position: relative;
            }
            
            .auth-form-content {
              background: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(183, 28, 28, 0.3);
              border-radius: 8px;
              padding: 2.5rem 2rem;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
            }
            
            /* WhatsApp Help Button */
            .whatsapp-help-button {
              position: fixed;
              bottom: 24px;
              right: 24px;
              z-index: 1000;
              display: flex;
              align-items: center;
              gap: 8px;
              background: #25D366;
              color: white;
              padding: 14px 20px;
              border-radius: 50px;
              text-decoration: none;
              font-weight: 600;
              font-size: 1rem;
              box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
              transition: all 0.3s ease;
              border: none;
            }
            
            .whatsapp-help-button:hover {
              background: #20BA5A;
              color: white;
              transform: translateY(-2px);
              box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
            }
            
            .whatsapp-help-button i {
              font-size: 1.5rem;
            }
            
            .whatsapp-help-button .help-text {
              display: inline-block;
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
            
            .success-icon {
              font-size: 3rem;
              color: #4ecdc4;
              margin-bottom: 1rem;
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
            
            .auth-form-info {
              text-align: center;
              margin-bottom: 2rem;
            }
            
            .auth-form-info p {
              color: rgba(255, 255, 255, 0.6);
              font-size: 0.875rem;
              margin: 0;
            }
            
            .auth-form-actions {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            
            .auth-submit-button {
              background: #B71C1C;
              border: 2px solid rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              padding: 1.2rem;
              width: 100%;
              font-weight: 600;
              font-size: 1rem;
              color: white;
              text-decoration: none;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .auth-submit-button:hover {
              background: #8B0000;
              color: white;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(183, 28, 28, 0.4);
            }
            
            .auth-outline-button {
              background: transparent;
              border: none;
              border-bottom: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 0;
              padding: 1rem 0;
              width: 100%;
              font-weight: 600;
              font-size: 1rem;
              color: rgba(255, 255, 255, 0.8);
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
            }
            
            .auth-outline-button:hover {
              background: rgba(255, 255, 255, 0.05);
              border-bottom-color: rgba(255, 255, 255, 0.5);
              color: white;
            }
            
            /* Tablet adjustments */
            @media (max-width: 1023px) {
              .auth-form-overlay {
                padding: 1.5rem;
              }
              
              .auth-form-content {
                padding: 2rem;
              }
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
              .auth-form-overlay {
                padding: 1rem;
              }
              
              .whatsapp-help-button {
                bottom: 20px;
                right: 20px;
                padding: 12px 16px;
              }
              
              .whatsapp-help-button .help-text {
                display: none;
              }
              
              .whatsapp-help-button i {
                font-size: 1.75rem;
              }
              
              .auth-form-content {
                padding: 2rem 1.5rem;
              }
              
              .auth-form-title {
                font-size: 1.75rem;
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
              
              .whatsapp-help-button {
                bottom: 16px;
                right: 16px;
                padding: 12px;
              }
            }
          `}</style>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="fullscreen-auth-layout">
        {/* Full Background Video */}
        <div className="auth-background-video">
          <MovieBackground 
            showOverlay={true}
            overlayOpacity={0.75}
            showMovieInfo={false}
            muted={false}
            showControls={false}
          />
        </div>

        {/* Centered Form Overlay */}
        <div className="auth-form-overlay">
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
                <div className="forgot-icon">
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <h1 className="auth-form-title">Forgot Password?</h1>
                <p className="auth-form-subtitle">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="auth-alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {error}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-form-input"
                    placeholder="Enter your email address"
                    required
                    autoComplete="email"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="auth-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill"></i>
                      Send Reset Link
                    </>
                  )}
                </Button>

                <div className="auth-form-footer">
                  <p>
                    Remember your password?{" "}
                    <Link to="/auth/login" className="auth-signup-link">
                      <i className="bi bi-arrow-left"></i>
                      Back to Login
                    </Link>
                  </p>
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* WhatsApp Help Button */}
        <a 
          href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-help-button"
          title="Need help? Chat with us on WhatsApp"
        >
          <i className="bi bi-whatsapp"></i>
          <span className="help-text">Help</span>
        </a>

        {/* Styles */}
        <style>{`
          /* Full Screen Background Video Layout */
          .fullscreen-auth-layout {
            position: relative;
            min-height: 100vh;
            width: 100%;
            overflow: hidden;
            background: #000;
          }
          
          .auth-background-video {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
          
          .auth-form-overlay {
            position: relative;
            z-index: 10;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
          }
          
          .auth-form-container {
            width: 100%;
            max-width: 450px;
            position: relative;
          }
          
          .auth-form-content {
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(183, 28, 28, 0.3);
            border-radius: 8px;
            padding: 2.5rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          }
          
          /* WhatsApp Help Button */
          .whatsapp-help-button {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            background: #25D366;
            color: white;
            padding: 14px 20px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
            transition: all 0.3s ease;
            border: none;
          }
          
          .whatsapp-help-button:hover {
            background: #20BA5A;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
          }
          
          .whatsapp-help-button i {
            font-size: 1.5rem;
          }
          
          .whatsapp-help-button .help-text {
            display: inline-block;
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
          
          .auth-back-link {
            position: absolute;
            top: -1rem;
            left: 0;
            z-index: 10;
          }
          
          .back-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }
          
          .back-button:hover {
            color: white;
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateX(-2px);
          }
          
          .auth-form-content {
            background: #2a2a2a;
            border: 1px solid #404040;
            border-radius: 12px;
            padding: 2.5rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          }
          
          .auth-form-header {
            text-align: center;
            margin-bottom: 2rem;
          }
          
          .auth-logo-container {
            margin-bottom: 1.5rem;
          }
          
          .auth-logo {
            height: 60px;
            width: auto;
            margin-bottom: 0.5rem;
          }
          
          .auth-logo-text {
            font-size: 1.8rem;
            font-weight: 700;
            color: #4ecdc4;
            margin: 0;
          }
          
          .forgot-icon {
            font-size: 3rem;
            color: #4ecdc4;
            margin-bottom: 1rem;
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
          
          .auth-submit-button {
            background: #4ecdc4;
            border: none;
            border-radius: 10px;
            padding: 1rem;
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
          }
          
          .auth-submit-button:hover:not(:disabled) {
            background: #42b8b1;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(78, 205, 196, 0.3);
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
            color: #8B0000;
          }
          
          /* Tablet adjustments */
          @media (max-width: 1023px) {
            .auth-form-overlay {
              padding: 1.5rem;
            }
            
            .auth-form-content {
              padding: 2rem;
            }
          }
          
          /* Mobile adjustments */
          @media (max-width: 768px) {
            .auth-form-overlay {
              padding: 1rem;
            }
            
            .auth-form-content {
              padding: 2rem 1.5rem;
            }
            
            .auth-form-title {
              font-size: 1.75rem;
            }
            
            .whatsapp-help-button {
              bottom: 20px;
              right: 20px;
              padding: 12px 16px;
            }
            
            .whatsapp-help-button .help-text {
              display: none;
            }
            
            .whatsapp-help-button i {
              font-size: 1.75rem;
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
            
            .whatsapp-help-button {
              bottom: 16px;
              right: 16px;
              padding: 12px;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
};

export default ForgotPasswordPage;
