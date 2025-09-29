// src/app/components/Layout/AuthLayout.tsx
import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { APP_CONFIG } from "../../constants";

const AuthLayout: React.FC = () => {
  useEffect(() => {
    // Add class to body and html to override main layout styles
    document.body.classList.add('auth-active');
    document.documentElement.classList.add('auth-active');
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('auth-active');
      document.documentElement.classList.remove('auth-active');
    };
  }, []);

  const authLayoutStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    zIndex: 1040,
    backgroundColor: '#f8f9fa',
    display: 'flex'
  };

  const brandingPanelStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, #007bff, #0056b3)',
    flex: 1,
    height: '100vh',
    overflow: 'hidden',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    minHeight: '100vh'
  };

  const formPanelStyles: React.CSSProperties = {
    backgroundColor: 'white',
    flex: 1,
    height: '100vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  };

  return (
    <div style={authLayoutStyles}>
      {/* Left Side - Branding Panel */}
      <div style={brandingPanelStyles} className="d-none d-lg-block">
        <div>
          <Link to="/" className="text-white text-decoration-none">
            <img
              src="/media/logos/logo-white.png"
              alt={APP_CONFIG.NAME}
              style={{ maxHeight: '60px', marginBottom: '20px' }}
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>
          
          <h2>Welcome to {APP_CONFIG.NAME}</h2>
          <p className="lead">
            Your premier destination for quality products at unbeatable prices.
            Join thousands of satisfied customers worldwide!
          </p>
          
          {/* Enhanced Features */}
          <div style={{ marginTop: '30px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <i className="bi bi-shield-check"></i>
              <span>100% Secure Shopping Experience</span>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <i className="bi bi-truck"></i>
              <span>Fast & Free Worldwide Delivery</span>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <i className="bi bi-headset"></i>
              <span>24/7 Premium Customer Support</span>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <i className="bi bi-award"></i>
              <span>Best Price Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms Panel */}
      <div style={formPanelStyles}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          {/* Mobile Logo */}
          <div className="auth-mobile-logo d-lg-none" style={{ textAlign: 'center', marginBottom: '30px' }}>
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
          
          {/* Auth Form Content */}
          <div>
            <Outlet />
          </div>
          
          {/* Back to Home Link */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
              <i className="bi bi-arrow-left"></i>
              {' '}Back to Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
