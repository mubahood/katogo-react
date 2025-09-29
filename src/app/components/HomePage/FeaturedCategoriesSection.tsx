// src/app/components/HomePage/FeaturedCategoriesSection.tsx
import React, { useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useManifestCategories, useManifest } from "../../hooks/useManifest";
import { Category } from "../../store/slices/manifestSlice";
import Utils from "../../utils/imageUtils";
import "./FeaturedCategoriesSection.css";

const FeaturedCategoriesSection: React.FC = () => {
  const allCategories = useManifestCategories();
  const { isLoading, error } = useManifest();

  // Filter and slice categories using useMemo for performance
  const categories = useMemo(() => {
    if (!allCategories) return [];
     
    
    // Filter for categories with show_in_categories = "Yes"
    const featuredCategories = allCategories
      .filter(cat => cat.show_in_categories?.toLowerCase() === 'yes')
      .slice(0, 8); // Show top 8 categories 
    return featuredCategories;
  }, [allCategories]);
  if (isLoading) {
    return (
      <section className="featured-categories-section py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title text-uppercase fw-bold">Top Categories</h2>
          </div>
          <Row className="g-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Col key={i} xs={6} sm={4} md={3} lg={3}>
                <div className="category-card-skeleton">
                  <div className="placeholder-glow">
                    <div className="placeholder rounded-circle category-image-placeholder"></div>
                    <div className="placeholder w-75 mt-2"></div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="featured-categories-section py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title text-uppercase fw-bold">Top Categories</h2>
          </div>
          <div className="text-center py-4">
            <p className="text-muted">No categories available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-categories-section py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="section-title text-uppercase fw-bold">Top Categories</h2>
          <Link to="/categories" className="view-all-link text-decoration-none">
            <span className="text-uppercase fw-semibold text-primary">
              View All
            </span>
            <i className="bi bi-chevron-right ms-1"></i>
          </Link>
        </div>
        
        <Row className="g-3">
          {categories.slice(0, 8).map((category) => (
            <Col key={category.id} xs={6} sm={4} md={3} lg={3}>
              <CategoryCard category={category} />
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link 
      to={`/products?category=${category.id}`} 
      className="text-decoration-none category-card-link"
    >
      <Card className="category-card text-center h-100">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
          <div className="category-image-container mb-3">
            <img
              src={Utils.img(category.image || "")}
              alt={category.category}
              className="category-image rounded-circle"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/media/svg/files/blank-image.svg";
              }}
            />
          </div>
          <h6 className="category-name fw-semibold mb-0 text-truncate">
            {category.category.toUpperCase()}
          </h6>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default FeaturedCategoriesSection;
