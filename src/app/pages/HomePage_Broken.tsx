// src/app/pages/HomePage.tsx - UgFlix Streaming Platform Dashboard
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { SEOHead } from "../components/seo";
import ToastService from "../services/ToastService";
import { manifestService, Movie } from "../services/manifest.service";

// Streaming platform styles
const streamingStyles = `
  .ugflix-home {
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    min-height: 100vh;
    color: white;
    padding-top: 0;
  }

  .hero-banner {
    position: relative;
    height: 70vh;
    background: linear-gradient(
      rgba(0, 0, 0, 0.4),
      rgba(0, 0, 0, 0.7)
    ), url('https://images.unsplash.com/photo-1489599808821-cb6b1e5d2ab7?w=1920&h=1080&fit=crop') center/cover;
    display: flex;
    align-items: center;
    margin-bottom: 3rem;
  }

  .hero-content {
    max-width: 600px;
    z-index: 2;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 900;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .hero-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .movie-section {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #ff6b35;
    display: flex;
    align-items: center;
  }

  .section-title::before {
    content: '';
    width: 4px;
    height: 30px;
    background: linear-gradient(135deg, #ff6b35, #ffd700);
    margin-right: 15px;
    border-radius: 2px;
  }

  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0 15px;
  }

  .movie-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .movie-card:hover { 
  }

  .movie-poster {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }


  .movie-info {
    padding: 1rem;
  }

  .movie-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .movie-genre {
    font-size: 0.9rem;
    color: #ffd700;
    margin-bottom: 0.5rem;
  }

  .movie-description {
    font-size: 0.85rem;
    opacity: 0.8;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .error-message {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.3);
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    margin: 2rem 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    opacity: 0.7;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn-primary-ugflix {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    color: white;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .btn-primary-ugflix:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
    color: white;
  }

  .btn-outline-ugflix {
    background: transparent;
    border: 2px solid #ff6b35;
    padding: 10px 28px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    color: #ff6b35;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .btn-outline-ugflix:hover {
    background: #ff6b35;
    color: white;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }
    
    .movie-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      padding: 0 10px;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
  }

  /* Additional responsive styles */
  .homepage-container {
    margin: 0 auto;
    padding-left: 20px;
    padding-right: 20px;
  }

  /* Mobile responsiveness fixes - reduce gaps and center content */
  @media (max-width: 767.98px) {
    .homepage-container {
      padding-top: 0.25rem;
    }
    
    .homepage-container .container {
      margin-top: 0 !important;
      padding-top: 0 !important;
      padding-left: 10px;
      padding-right: 10px;
    }
    
    .hero-section-fullwidth {
      margin: 0 auto 0.25rem auto;
      max-width: 100%;
      padding: 0;
    }
    
    .hero-section-fullwidth .hero-section {
      margin: 0;
    }
    
    .homepage-section {
      padding: 0; /* Complete removal of section padding on mobile */
      margin: 0 !important; /* Force remove all margins */
    }
    
    .homepage-section:first-child {
      padding-top: 0;
      margin-top: 0 !important;
    }
    
    .homepage-section:last-child {
      padding-bottom: 1rem; /* Only add padding to last section */
      margin-bottom: 0 !important;
    }
    
    .hero-section-fullwidth {
      margin-bottom: 0; /* Remove all margin after hero section */
    }
    
    /* Force remove gaps between hero and deals - more aggressive */
    .homepage-section:nth-child(1),
    .homepage-section:first-of-type {
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    
    .homepage-section:nth-child(2),
    .homepage-section:nth-of-type(2) {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Target specific sections by component */
    .hero-section {
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    
    .deals-section-wrapper {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
  }

  @media (max-width: 575.98px) {
    .homepage-section {
      padding: 0; /* Ensure no padding on small mobile */
    }
    
    .homepage-section:first-child {
      padding-top: 0;
    }
    
    .hero-section-fullwidth {
      margin: 0 auto 0.25rem auto;
      width: 100%;
      max-width: 100%;
      padding: 0 5px;
    }
    
    .homepage-container .container {
      padding-left: 5px;
      padding-right: 5px;
    }
  }
`;

// Lazy loaded section components with performance optimization
const LazyDealsSection = memo(() => {
  const { isIntersecting, ref } = useLazyLoad(0.1, '200px');
  
  return (
    <div ref={ref} className="homepage-section">
      {isIntersecting ? <DealsSection /> : (
        <div style={{ height: '300px' }} className="d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading deals...</span>
          </div>
        </div>
      )}
    </div>
  );
});

const LazySuperBuyerSection = memo(() => {
  const { isIntersecting, ref } = useLazyLoad(0.1, '200px');
  
  return (
    <div ref={ref} className="homepage-section">
      {isIntersecting ? <SuperBuyerSection /> : (
        <div style={{ height: '400px' }} className="d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading super buyer deals...</span>
          </div>
        </div>
      )}
    </div>
  );
});

const LazyTopProductsSection = memo(() => {
  const { isIntersecting, ref } = useLazyLoad(0.1, '200px');
  
  return (
    <div ref={ref} className="homepage-section">
      {isIntersecting ? <TopProductsSection /> : (
        <div style={{ height: '400px' }} className="d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading top products...</span>
          </div>
        </div>
      )}
    </div>
  );
});

interface LocationState {
  orderSuccess?: boolean;
  orderId?: number;
  paymentUrl?: string;
}

const HomePage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Authentication state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthLoading = useSelector(selectAuthLoading);

  // Show loading while authentication state is being restored
  if (isAuthLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', margin: 0 }}>Loading UgFlix...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  // Optimized success message handler with useCallback
  const handleOrderSuccess = useCallback(() => {
    if (state?.orderSuccess && state?.orderId) {
      ToastService.success(
        `🎉 Order #${state.orderId} placed successfully! Thank you for your purchase.`,
        { autoClose: 6000 }
      );
      
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state?.orderSuccess, state?.orderId]);

  // Optimized payment navigation handler with useCallback
  const handlePaymentNavigation = useCallback((orderId: number) => {
    window.location.href = `/payment/${orderId}`;
  }, []);

  // Optimized orders navigation handler with useCallback
  const handleOrdersNavigation = useCallback(() => {
    window.location.href = "/account/orders";
  }, []);

  useEffect(() => {
    handleOrderSuccess();
  }, [handleOrderSuccess]);

  return (
    <>
      <SEOHead config={generateHomePageMetaTags()} />
      <style dangerouslySetInnerHTML={{ __html: homePageStyles }} />
      <div className="homepage-container">
        <div className="container">
          {/* Order Success Alert */}
          {state?.orderSuccess && state?.orderId && (
            <Alert variant="success" className="mb-4">
              <Alert.Heading>🎉 Order Placed Successfully!</Alert.Heading>
              <p>
                Your order <strong>#{state.orderId}</strong> has been confirmed and is being processed.
                You will receive a confirmation email shortly.
              </p>
              <hr />
              <div className="d-flex justify-content-between">
                <button 
                  onClick={handleOrdersNavigation}
                  className="btn btn-outline-success"
                  type="button"
                >
                  <i className="bi bi-list-ul me-2"></i>
                  View My Orders
                </button>
                {state.paymentUrl && (
                  <button 
                    onClick={() => handlePaymentNavigation(state.orderId!)}
                    className="btn btn-success"
                    type="button"
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Complete Payment
                  </button>
                )}
              </div>
            </Alert>
          )}

          {/* Hero Section - Always load immediately for LCP */}
          <div className="homepage-section hero-section-fullwidth">
            <HeroSection />
          </div>
          
          {/* Lazy loaded sections for improved performance */}
          <LazyDealsSection />
          <LazySuperBuyerSection />
          <LazyTopProductsSection />
        </div>
      </div>
    </>
  );
};

export default memo(HomePage);
