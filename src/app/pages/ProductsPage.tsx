// src/app/pages/ProductsPage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Pagination,
  Badge,
} from "react-bootstrap";
import { useGetProductsQuery } from "../services/realProductsApi";
import { useManifestCategories } from "../hooks/useManifest";
import ProductCard from "../components/shared/ProductCard";
import DynamicBreadcrumb from "../components/shared/DynamicBreadcrumb";
import { ProductModel } from "../models/ProductModel";
import { SEOHead, CategorySchema } from "../components/seo";
import { generateCategoryMetaTags, generateSearchMetaTags } from "../utils/seo";

// Optimized minimalistic styles using theme colors
const productsPageStyles = `
  .products-page {
    background: var(--background-light, #ffffff);
  }

  .products-header {
    padding: 0;
    margin-bottom: 12px;
  }

  .page-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: var(--text-color-dark, #212529);
    height: 20px;
  }

  .products-count {
    font-size: 13px;
    color: var(--text-color-medium, #6c757d);
    margin: 0;
  }

  .sort-dropdown {
    min-width: 180px;
    font-size: 13px;
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: var(--border-radius, 4px);
    color: var(--text-color-dark, #212529);
  }

  .sort-dropdown:focus {
    border-color: var(--primary-color, #007bff);
    box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb, 0, 123, 255), 0.25);
  }

  .filters-sidebar {
    padding: 0;
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px;
    border-bottom: 1px solid var(--border-color-light, #f1f3f4);
  }

  .filters-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--text-color-dark, #212529);
  }

  .filters-toggle-btn {
    background: var(--white, #ffffff);
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: var(--border-radius, 4px);
    color: var(--text-color-dark, #212529);
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
    display: none;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    white-space: nowrap;
  }

  .filters-toggle-btn:hover {
    background: var(--primary-color, #007bff);
    border-color: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
  }

  .filters-toggle-btn:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb, 0, 123, 255), 0.25);
  }

  .filters-content {
    padding: 0 16px 16px 16px;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
  }

  .filters-content.collapsed {
    max-height: 0;
    opacity: 0;
    padding: 0 16px;
  }

  .filter-group {
    margin-bottom: 16px;
  }

  .filter-label {
    font-size: 13px;
    font-weight: 500;
    margin: 0 0 6px 0;
    color: var(--text-color-dark, #212529);
    display: block;
  }

  .filter-select {
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: var(--border-radius, 4px);
    font-size: 13px;
    padding: 8px;
    color: var(--text-color-dark, #212529);
  }

  .filter-select:focus {
    border-color: var(--primary-color, #007bff);
    box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb, 0, 123, 255), 0.25);
  }

  .price-inputs {
    display: flex;
    gap: 8px;
    margin: 0 0 8px 0;
  }

  .price-input {
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: var(--border-radius, 4px);
    font-size: 13px;
    padding: 8px;
    color: var(--text-color-dark, #212529);
  }

  .price-input:focus {
    border-color: var(--primary-color, #007bff);
    box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb, 0, 123, 255), 0.25);
  }

  .price-separator {
    align-self: center;
    color: var(--text-color-medium, #6c757d);
    font-size: 13px;
  }

  .apply-price-btn {
    border: 1px solid var(--primary-color, #007bff);
    border-radius: var(--border-radius, 4px);
    background: var(--white, #ffffff);
    color: var(--primary-color, #007bff);
    font-size: 12px;
    padding: 12px;
    width: 100%;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .apply-price-btn:hover {
    background: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
    border-color: var(--primary-color, #007bff);
  }

  .clear-filters-btn {
    font-size: 12px;
    color: var(--text-color-medium, #6c757d);
    padding: 0;
    text-decoration: none;
    border: none;
    background: none;
  }

  .clear-filters-btn:hover {
    color: var(--primary-color, #007bff);
    text-decoration: underline;
  }

  .active-filters {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color-light, #f1f3f4);
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter-tag {
    cursor: pointer;
    font-size: 11px;
    background: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
    border: none;
    border-radius: var(--border-radius-sm, 2px);
    padding: 4px 8px;
    transition: all 0.2s ease;
  }

  .filter-tag:hover {
    background: var(--primary-color-dark, #0056b3);
  }

  .filter-tag-remove {
    margin-left: 4px;
    font-weight: normal;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin: 0;
  }

  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 16px;
    text-align: center;
    background: var(--white, #ffffff);
  }

  .empty-icon {
    font-size: 48px;
    color: var(--text-color-light, #adb5bd);
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 8px 0;
    color: var(--text-color-dark, #212529);
  }

  .empty-description {
    font-size: 14px;
    color: var(--text-color-medium, #6c757d);
    margin: 0 0 16px 0;
  }

  .empty-action-btn {
    border: 1px solid var(--primary-color, #007bff);
    border-radius: var(--border-radius, 4px);
    background: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
    font-size: 13px;
    padding: 8px 16px;
    transition: all 0.2s ease;
  }

  .empty-action-btn:hover {
    background: var(--primary-color-dark, #0056b3);
    border-color: var(--primary-color-dark, #0056b3);
  }

  .pagination-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding: 20px 0;
    background: var(--white, #ffffff);
    border-top: 1px solid var(--border-color-light, #f1f3f4);
  }

  .pagination-text {
    font-size: 13px;
    color: var(--text-color-medium, #6c757d);
    font-weight: 500;
  }

  .custom-pagination {
    margin: 0;
  }

  .custom-pagination .page-link {
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: var(--border-radius, 4px);
    color: var(--text-color-dark, #212529);
    background: var(--white, #ffffff);
    font-size: 13px;
    padding: 8px 12px;
    margin: 0 2px;
    font-weight: 500;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .custom-pagination .page-link:hover {
    background: var(--primary-color, #007bff);
    border-color: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
  }

  .custom-pagination .page-item.active .page-link {
    background: var(--primary-color, #007bff);
    border-color: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
  }

  .custom-pagination .page-item.disabled .page-link {
    color: var(--text-color-light, #adb5bd);
    background: var(--background-light, #f8f9fa);
    border-color: var(--border-color-light, #f1f3f4);
    cursor: not-allowed;
  }

  .custom-pagination .page-item.disabled .page-link:hover {
    background: var(--background-light, #f8f9fa);
    border-color: var(--border-color-light, #f1f3f4);
    color: var(--text-color-light, #adb5bd);
  }

  /* Enhanced pagination styles */
  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pagination-info {
    display: flex;
    align-items: center;
  }

  @media (max-width: 991px) {
    .products-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .pagination-section {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }

  @media (max-width: 767px) {
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .page-title {
      font-size: 18px;
    }

    .sort-dropdown {
      min-width: 140px;
    }

    .custom-pagination .page-link {
      padding: 6px 8px;
      font-size: 12px;
    }

    .filters-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .filters-header {
      margin-bottom: 0;
      padding-bottom: 16px;
    }

    .filters-content {
      padding-top: 0;
    }

    .filters-content.collapsed {
      padding-top: 0;
      padding-bottom: 0;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleId = "products-page-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = productsPageStyles;
    document.head.appendChild(styleElement);
  }
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false); // Mobile filter collapse state

  // Check if mobile screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
      // Auto-collapse on mobile, auto-expand on desktop
      setShowFilters(window.innerWidth > 767);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize state from URL params
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category");
    const sort_by = searchParams.get("sort_by") || "created_at";
    const sort_order = searchParams.get("sort_order") || "desc";
    const min_price = searchParams.get("min_price") || "";
    const max_price = searchParams.get("max_price") || "";

    setCurrentPage(page);
    setSortBy(sort_by);
    setSortOrder(sort_order);
    setSelectedCategory(category ? parseInt(category) : undefined);
    setPriceRange({ min: min_price, max: max_price });
  }, [searchParams]);

  // Fetch products with current filters
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsQuery({
    page: currentPage,
    limit: 24, // Changed to 24 for better grid layout (3x8 or 4x6)
    category: selectedCategory,
    sort_by: sortBy,
    sort_order: sortOrder,
    min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
    max_price: priceRange.max ? parseFloat(priceRange.max) : undefined,
    search: searchParams.get("search") || undefined,
  });

  // Fetch categories for filter from manifest
  const categories = useManifestCategories();

  const products = productsData?.data || [];
  const totalPages = productsData?.last_page || 1;

  // Update URL params when filters change
  const updateSearchParams = (
    updates: Record<string, string | number | undefined>
  ) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams({ page });
    // Smooth scroll to top of products section
    document.querySelector(".products-header")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    updateSearchParams({
      sort_by: newSortBy,
      sort_order: newSortOrder,
      page: 1,
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categoryId ? parseInt(categoryId) : undefined;
    setSelectedCategory(newCategory);
    setCurrentPage(1);
    updateSearchParams({ category: newCategory, page: 1 });
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);
    updateSearchParams({
      min_price: priceRange.min,
      max_price: priceRange.max,
      page: 1,
    });
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setPriceRange({ min: "", max: "" });
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
    setSearchParams({});
  };

  // Get page title based on filters
  const getPageTitle = () => {
    if (searchParams.get("deals")) return "Flash Deals";
    if (searchParams.get("search"))
      return `Search Results for "${searchParams.get("search")}"`;
    if (selectedCategory && categories) {
      const category = categories.find((c) => c.id === selectedCategory);
      return category ? `${category.category} Products` : "Products";
    }
    return "All Products";
  };

  // Generate SEO meta tags based on page type
  const generateSEOConfig = () => {
    const searchTerm = searchParams.get("search");
    
    if (searchTerm) {
      // Search results page SEO
      return generateSearchMetaTags(searchTerm, productsData?.total || 0);
    }
    
    if (selectedCategory && categories) {
      // Category page SEO
      const category = categories.find((c) => c.id === selectedCategory);
      if (category) {
        return generateCategoryMetaTags({
          name: category.category,
          description: `Shop ${category.category} products online in Uganda. Best prices and fast delivery at UgFlix.`,
          productCount: productsData?.total || 0
        });
      }
    }

    // Default products page SEO
    return generateCategoryMetaTags({
      name: "All Products",
      description: "Shop all products online in Uganda. Electronics, fashion, home & garden, and more with fast delivery and secure checkout.",
      productCount: productsData?.total || 0
    });
  };

  // Generate category schema data
  const getCategorySchemaData = () => {
    if (selectedCategory && categories) {
      const category = categories.find((c) => c.id === selectedCategory);
      if (category) {
        return {
          name: category.category,
          description: `Shop ${category.category} products online in Uganda. Best prices and fast delivery at UgFlix.`,
          productCount: productsData?.total || 0,
          url: window.location.href
        };
      }
    }
    
    return {
      name: "All Products",
      description: "Shop all products online in Uganda. Electronics, fashion, home & garden, and more with fast delivery and secure checkout.",
      productCount: productsData?.total || 0,
      url: window.location.href
    };
  };

  return (
    <>
      <SEOHead config={generateSEOConfig()} />
      <CategorySchema category={getCategorySchemaData()} />
      {/* Dynamic Breadcrumb */}
      <DynamicBreadcrumb
        context={{
          categories,
          selectedCategory,
          searchTerm: searchParams.get("search") || undefined,
        }}
        showBackground={true}
        showIcons={true}
      />

      <Container>
        <Row>
          {/* Filters Sidebar */}
          <Col md={3} className="my-0">
            <Card className="shadow-sm border-0">
              <Card.Body>
                <div className="filters-sidebar">
                  <div className="filters-header">
                    <h6 className="filters-title">
                      Product Filters
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      {(selectedCategory || priceRange.min || priceRange.max) && (
                        <Button
                          variant="link"
                          size="sm"
                          className="clear-filters-btn p-0"
                          onClick={clearFilters}
                        >
                          Clear All
                        </Button>
                      )}
                      {isMobile && (
                        <button
                          className="filters-toggle-btn"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <span>{showFilters ? 'Hide' : 'Show'}</span>
                          <span style={{ fontSize: '10px', marginLeft: '2px' }}>
                            {showFilters ? '▲' : '▼'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`filters-content ${!showFilters ? 'collapsed' : ''}`}>
                    {/* Category Filter */}
                    <div className="filter-group">
                      <label className="filter-label">Category</label>
                      <Form.Select
                        size="sm"
                        className="filter-select"
                        value={selectedCategory || ""}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category}
                          </option>
                        ))}
                      </Form.Select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="filter-group">
                      <label className="filter-label">Price Range</label>
                      <div className="price-inputs">
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder="Min"
                          className="price-input"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              min: e.target.value,
                            }))
                          }
                        />
                        <span className="price-separator">-</span>
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder="Max"
                          className="price-input"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        className="apply-price-btn mt-2"
                        onClick={handlePriceFilter}
                      >
                        Apply Filters
                      </Button>
                    </div>

                    {/* Active Filters */}
                    {(selectedCategory || priceRange.min || priceRange.max) && (
                      <div className="active-filters">
                        <label className="filter-label">Active Filters</label>
                        <div className="filter-tags">
                          {selectedCategory && categories && (
                            <Badge
                              bg="primary"
                              className="filter-tag"
                              onClick={() => handleCategoryChange("")}
                              role="button"
                            >
                              {
                                categories.find((c) => c.id === selectedCategory)
                                  ?.category
                              }
                              <span className="filter-tag-remove">×</span>
                            </Badge>
                          )}
                          {(priceRange.min || priceRange.max) && (
                            <Badge
                              bg="primary"
                              className="filter-tag"
                              onClick={() => {
                                setPriceRange({ min: "", max: "" });
                                updateSearchParams({
                                  min_price: undefined,
                                  max_price: undefined,
                                });
                              }}
                              role="button"
                            >
                              {priceRange.min && priceRange.max
                                ? `${priceRange.min} - ${priceRange.max}`
                                : priceRange.min
                                ? `From ${priceRange.min}`
                                : `Up to ${priceRange.max}`}
                              <span className="filter-tag-remove">×</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Products Grid */}
          <Col md={9} className="my-0">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="products-header mb-3">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <div className="page-title-section text-start">
                        <h1 className="page-title">
                          {getPageTitle()}
                        </h1>
                        {productsData && (
                          <p className="products-count">
                            {productsData.total.toLocaleString()} product
                            {productsData.total !== 1 ? "s" : ""} found
                          </p>
                        )}
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="sort-controls text-end">
                        <Form.Select
                          size="sm"
                          className="sort-dropdown"
                          value={`${sortBy}_${sortOrder}`}
                          onChange={(e) => {
                            const [newSortBy, newSortOrder] =
                              e.target.value.split("_");
                            handleSortChange(newSortBy, newSortOrder);
                          }}
                        >
                          <option value="created_at_desc">Newest First</option>
                          <option value="created_at_asc">Oldest First</option>
                          <option value="price_1_asc">
                            Price: Low to High
                          </option>
                          <option value="price_1_desc">
                            Price: High to Low
                          </option>
                          <option value="name_asc">Name: A to Z</option>
                          <option value="name_desc">Name: Z to A</option>
                        </Form.Select>
                      </div>
                    </Col>
                  </Row>
                </div>

                {isLoading && (
                  <div className="loading-state">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading products...</p>
                  </div>
                )}

                {error && (
                  <div className="error-state">
                    <Alert variant="danger" className="error-alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Error loading products. Please try again.
                    </Alert>
                  </div>
                )}

                {!isLoading && !error && products.length === 0 && (
                  <div className="empty-state">
                    <i className="bi bi-box-seam empty-icon"></i>
                    <h4 className="empty-title">No products found</h4>
                    <p className="empty-description">
                      Try adjusting your filters or search terms to find what
                      you're looking for.
                    </p>
                    <Button
                      variant="primary"
                      onClick={clearFilters}
                      className="empty-action-btn"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      View All Products
                    </Button>
                  </div>
                )}

                {!isLoading && !error && products.length > 0 && (
                  <>
                    <div className="products-grid">
                      {products.map((product: ProductModel) => (
                        <div key={product.id} className="product-item">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination-section">
                        <div className="pagination-info">
                          <span className="pagination-text">
                            Showing {(currentPage - 1) * 24 + 1} to{" "}
                            {Math.min(
                              currentPage * 24,
                              productsData?.total || 0
                            )}{" "}
                            of {productsData?.total || 0} products
                          </span>
                        </div>
                        <div className="pagination-controls">
                          <Pagination className="custom-pagination">
                            <Pagination.First
                              disabled={currentPage === 1}
                              onClick={() => handlePageChange(1)}
                            />
                            <Pagination.Prev
                              disabled={currentPage === 1}
                              onClick={() => handlePageChange(currentPage - 1)}
                            />

                            {/* Smart pagination logic */}
                            {(() => {
                              const delta = 2;
                              const range = [];
                              const rangeWithDots = [];

                              for (
                                let i = Math.max(2, currentPage - delta);
                                i <= Math.min(totalPages - 1, currentPage + delta);
                                i++
                              ) {
                                range.push(i);
                              }

                              if (currentPage - delta > 2) {
                                rangeWithDots.push(1, "...");
                              } else {
                                rangeWithDots.push(1);
                              }

                              rangeWithDots.push(...range);

                              if (currentPage + delta < totalPages - 1) {
                                rangeWithDots.push("...", totalPages);
                              } else if (totalPages > 1) {
                                rangeWithDots.push(totalPages);
                              }

                              return rangeWithDots.map((pageNum, index) => {
                                if (pageNum === "...") {
                                  return (
                                    <Pagination.Ellipsis
                                      key={`ellipsis-${index}`}
                                      disabled
                                    />
                                  );
                                }
                                return (
                                  <Pagination.Item
                                    key={pageNum}
                                    active={pageNum === currentPage}
                                    onClick={() =>
                                      handlePageChange(pageNum as number)
                                    }
                                  >
                                    {pageNum}
                                  </Pagination.Item>
                                );
                              });
                            })()}

                            <Pagination.Next
                              disabled={currentPage === totalPages}
                              onClick={() => handlePageChange(currentPage + 1)}
                            />
                            <Pagination.Last
                              disabled={currentPage === totalPages}
                              onClick={() => handlePageChange(totalPages)}
                            />
                          </Pagination>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ProductsPage;
