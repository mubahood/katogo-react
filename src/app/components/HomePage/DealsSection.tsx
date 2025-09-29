// src/app/components/HomePage/DealsSection.tsx
import React, { useRef, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import Countdown from "./Countdown";
import ProductCard2 from "../shared/ProductCard2";
import { useGetProductsQuery } from "../../services/realProductsApi";
import { Spinner, Alert } from "react-bootstrap";

// Inline styles for DealsSection following the unified design system
const dealsSectionStyles = `
  .deals-section-wrapper {
    background: var(--white);
    border-radius: var(--border-radius);
    margin: 2rem 0;
    padding: 1.5rem;
    border: 1px solid var(--border-color-light);
  }

  .deals-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .deals-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .deals-title i {
    font-size: 1.25rem;
    color: var(--accent-color);
  }

  .deals-title h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin: 0;
  }

  .view-all-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    transition: color 0.2s;
  }

  .view-all-link:hover {
    color: var(--primary-color-dark);
    text-decoration: none;
  }

  .deals-carousel-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    width: 100%;
  }

  .carousel-control-btn {
    background: var(--background-light);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 3;
    flex-shrink: 0;
  }

  .carousel-control-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .carousel-control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--background-light);
  }

  .carousel-control-btn i {
    font-size: 0.9rem;
  }

  .deals-container {
    flex: 1;
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0.5rem 0;
    margin: 0 0.5rem;
  }

  .deals-container::-webkit-scrollbar {
    display: none;
  }

  .deals-container .pc2-card-container {
    min-width: 180px;
    max-width: 180px;
    flex-shrink: 0;
  }

  .deals-loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    flex: 1;
  }

  .deals-error-container {
    padding: 1rem;
    text-align: center;
    flex: 1;
  }

  .deals-no-products {
    text-align: center;
    padding: 2rem;
    color: var(--text-color-medium);
    flex: 1;
  }

  @media (max-width: 1199.98px) {
    .deals-container .pc2-card-container {
      min-width: 170px;
      max-width: 170px;
    }
  }

  @media (max-width: 991.98px) {
    .deals-container .pc2-card-container {
      min-width: 160px;
      max-width: 160px;
    }
  }

  @media (max-width: 767.98px) {
    .deals-section-wrapper {
      margin: 0 0rem !important; /* Add horizontal margin on mobile */
      padding: 1rem;
      margin-top: 0px !important; /* Increased negative margin to eliminate remaining gap */
      position: relative;
      z-index: 10;
    }
    
    .deals-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .deals-title h2 {
      font-size: 1.1rem;
    }
    
    .carousel-control-btn {
      display: none;
    }
    
    .deals-carousel-controls {
      gap: 0;
    }
    
    .deals-container {
      margin: 0;
      gap: 0.5rem;
    }
    
    .deals-container .pc2-card-container {
      min-width: 140px;
      max-width: 140px;
    }
  }

  @media (max-width: 480px) {
    .deals-container .pc2-card-container {
      min-width: 130px;
      max-width: 130px;
    }
  }
`;

const DealsSection: React.FC = () => {
  // Set the target date for the countdown to 24 hours from now
  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 24);

  // Create a ref for the deals container
  const dealsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch products for Flash Sales section
  const { data: productsResponse, isLoading, error } = useGetProductsQuery({
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const products = productsResponse?.data || [];

  // Optimized scroll functions with useCallback for better performance
  const scrollLeft = useCallback(() => {
    if (dealsContainerRef.current) {
      // Scroll by 5 cards width + gaps (180px * 5 + 12px * 4 = 948px)
      dealsContainerRef.current.scrollBy({
        left: -948, // Scroll 5 cards worth
        behavior: "smooth",
      });
    }
  }, []);

  // Function to scroll right
  const scrollRight = useCallback(() => {
    if (dealsContainerRef.current) {
      dealsContainerRef.current.scrollBy({
        left: 948, // Scroll 5 cards worth
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dealsSectionStyles }} />
      <section className="deals-section-wrapper">
        <div className="deals-header">
          <div className="deals-title">
            <i className="bi bi-lightning-charge-fill"></i>
            <h2>Flash Deals</h2>
          </div>

          {/* The Live Countdown Component */}
          <Countdown targetDate={targetDate} />

          <Link to="/products?deals=true" className="view-all-link">
            View All &rarr;
          </Link>
        </div>

        {/* Navigation and Product Container */}
        <div className="deals-carousel-controls">
          <button 
            className="carousel-control-btn prev" 
            onClick={scrollLeft}
            disabled={isLoading || !!error}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          {/* The Horizontally Scrolling Product Cards */}
          <div className="deals-container" ref={dealsContainerRef}>
            {isLoading && (
              <div className="deals-loading-container">
                <Spinner animation="border" variant="primary" />
              </div>
            )}
            {error && (
              <div className="deals-error-container">
                <Alert variant="danger" className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error loading flash deals. Please try again later.
                </Alert>
              </div>
            )}
            {!isLoading && !error && products.length === 0 && (
              <div className="deals-no-products">
                <i className="bi bi-box-seam mb-3" style={{ fontSize: '3rem', color: 'var(--text-color-light)' }}></i>
                <p>No flash deals available at the moment.</p>
              </div>
            )}
            {!isLoading && !error && products.length > 0 && products.map((product) => (
              <ProductCard2 key={product.id} product={product} />
            ))}
          </div>

          <button 
            className="carousel-control-btn next" 
            onClick={scrollRight}
            disabled={isLoading || !!error}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </section>
    </>
  );
};

export default memo(DealsSection);