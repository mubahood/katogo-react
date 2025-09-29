// src/app/components/HomePage/TopProductsSection.tsx
import React, { useEffect, useState } from "react";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BiChevronRight } from "react-icons/bi";
import ProductCardSimple from "../shared/ProductCardSimple";
import ProductModel from "../../models/ProductModel";
import { useGetProductsQuery } from "../../services/realProductsApi";

// Inline styles for TopProductsSection following the unified design system
const topProductsSectionStyles = `
  .top-products-section-wrapper {
    background: var(--white);
    border-radius: var(--border-radius);
    margin: 2rem 0;
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
  }

  .top-products-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .top-products-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color-dark);
    margin: 0;
  }

  .view-all-top-products-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .view-all-top-products-link:hover {
    color: var(--primary-color-dark);
    text-decoration: none;
  }

  .top-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  /* Mobile responsiveness fixes */
  @media (max-width: 767.98px) {
    .top-products-section-wrapper {
      margin-top: 10px !important; /* Add horizontal margin on mobile */
      padding: 10px!important; /* Reduce padding on mobile */
    }
    
    .top-products-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    
    .top-products-header {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    
    .top-products-title {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 575.98px) {
    .top-products-section-wrapper {
      margin-top: 10; /* Horizontal margin for small mobile */
      padding: 1rem;
    }
    
    .top-products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .top-products-header {
      margin-bottom: 1rem;
    }
  }
`;

const TopProductsSection: React.FC = () => {
  // Fetch products for Top Products section
  const { data: productsResponse, isLoading, error } = useGetProductsQuery({
    page: 1,
    limit: 24,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const products = productsResponse?.data || [];
  
  // Validate products array structure
  if (productsResponse && !Array.isArray(products)) {
    console.error('❌ TopProductsSection: Products data is not an array:', products);
  }
  
  // Error state handling
  if (error) {
    console.error('❌ TopProductsSection: RTK Query error:', error);
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: topProductsSectionStyles }} />
        <section className="top-products-section-wrapper my-0 px-0 pt-0 pt-md-4">
          <Container className="px-4">
            <div className="top-products-header mb-1">
              <h2 className="top-products-title text-color-dark">
                Top 24 Products
              </h2>
              <Link to="/products" className="view-more-link">
                View More <BiChevronRight className="view-more-icon" />
              </Link>
            </div>
            <div className="error-state text-center py-4">
              <p className="text-muted">
                Unable to load products at the moment. Please try again later.
              </p>
            </div>
          </Container>
        </section>
      </>
    );
  }
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: topProductsSectionStyles }} />
      <section className="top-products-section-wrapper my-0 px-0 pt-0 pt-md-4">
        <Container className="px-4">
          <div className="top-products-header mb-1">
            <h2 className="top-products-title text-color-dark">
              Top 24 Products
            </h2>
            <Link
              to="/products?sort_by=rating&sort_order=desc"
              className="view-all-top-products-link text-primary fw-600"
            >
              View More <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
          <div className="top-products-grid">
            {isLoading && (
              <div className="d-flex justify-content-center p-4">
                <Spinner animation="border" />
                <span className="ms-2">Loading products...</span>
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                <h6>Error loading products:</h6>
                <small>{JSON.stringify(error)}</small>
              </div>
            )}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">No top products available at the moment.</p>
                <small className="text-muted">API Response: {JSON.stringify(productsResponse)}</small>
              </div>
            )}
            {!isLoading && !error && products.length > 0 && products.map((product) => (
              <ProductCardSimple key={product.id} product={product} />
            ))}
          </div>
          {/* Optional: Load More button or pagination */}
          {!isLoading && products.length > 0 && (
            <div className="text-center mt-5">
              <Link to="/products" className="btn btn-outline-primary btn-lg">
                View All Products
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
};

export default React.memo(TopProductsSection);
