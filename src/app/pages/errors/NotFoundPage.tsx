// src/app/pages/errors/NotFoundPage.tsx
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const popularCategories = [
    { name: "Electronics", link: "/category/electronics" },
    { name: "Clothing", link: "/category/clothing" },
    { name: "Home & Garden", link: "/category/home-garden" },
    { name: "Sports", link: "/category/sports" }
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6} className="text-center">
            {/* 404 Illustration */}
            <div className="mb-5">
              <div className="display-1 fw-bold text-primary mb-3">404</div>
              <div className="position-relative d-inline-block">
                <img 
                  src="/media/auth/404-error.png" 
                  alt="404 Error"
                  className="img-fluid"
                  style={{ maxHeight: "300px" }}
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback content */}
                <div className="text-muted" style={{ fontSize: "4rem" }}>
                  🔍
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-5">
              <h1 className="h2 mb-3">Oops! Page Not Found</h1>
              <p className="text-muted lead mb-4">
                The page you're looking for doesn't exist or has been moved. 
                Don't worry, let's get you back on track!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mb-5">
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="d-flex align-items-center justify-content-center"
                >
                  <ArrowLeft size={20} className="me-2" />
                  Go Back
                </Button>
                <Link to="/" className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center">
                  <Home size={20} className="me-2" />
                  Home Page
                </Link>
                <Link to="/products" className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center">
                  <ShoppingBag size={20} className="me-2" />
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Search Section */}
            <div className="mb-5">
              <h5 className="mb-3">Looking for something specific?</h5>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const query = formData.get('search') as string;
                  if (query) {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                  }
                }}
                className="d-flex gap-2 justify-content-center"
              >
                <div className="position-relative flex-grow-1" style={{ maxWidth: "400px" }}>
                  <input
                    type="text"
                    name="search"
                    className="form-control form-control-lg ps-5"
                    placeholder="Search for products..."
                  />
                  <Search 
                    size={20} 
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg">
                  Search
                </Button>
              </form>
            </div>

            {/* Popular Categories */}
            <div className="text-start">
              <h6 className="text-center mb-3">Popular Categories</h6>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {popularCategories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.link}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-5 pt-5 border-top">
              <h6 className="mb-3">Need Help?</h6>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Link to="/contact" className="text-decoration-none">
                  Contact Support
                </Link>
                <span className="d-none d-sm-inline text-muted">•</span>
                <Link to="/faq" className="text-decoration-none">
                  FAQ
                </Link>
                <span className="d-none d-sm-inline text-muted">•</span>
                <Link to="/about" className="text-decoration-none">
                  About Us
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFoundPage;
