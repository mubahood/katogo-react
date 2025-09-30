// src/app/pages/ProductsPage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
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

// Optimized minimalistic styles using UgFlix theme colors
const productsPageStyles = `
  /* Breadcrumb Wrapper */
  .breadcrumb-wrapper {
    background: var(--ugflix-bg-primary);
    border-bottom: 1px solid var(--ugflix-border);
    padding: 0px 0;
  }

  .products-page {
    background: var(--ugflix-bg-primary);
    color: var(--ugflix-text-primary);
  }

  /* Full width container override */
  .container-fluid {
    max-width: 100% !important;
    padding-left: 15px !important;
    padding-right: 15px !important;
  }

  .row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  /* Remove default column padding for full width effect */
  .col-md-3,
  .col-md-9 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* Enhanced spacing between sidebar and content */
  .col-md-3 {
    padding-right: 1rem;
  }

  .col-md-9 {
    padding-left: 1rem;
  }

  .products-header {
    padding: 12px 0;
    border-bottom: 1px solid var(--ugflix-border);
    background: transparent;
    margin-bottom: 12px;
  }

  .products-header .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--ugflix-text-primary);
  }

  .products-count {
    font-size: 13px;
    color: var(--ugflix-text-secondary);
    margin: 4px 0 0 0;
    font-weight: normal;
  }

  .sort-dropdown {
    min-width: 180px;
    font-size: 14px;
    border: 1px solid var(--ugflix-border);
    border-radius: 6px;
    background-color: var(--ugflix-bg-card);
    color: var(--ugflix-text-primary);
    padding: 8px 12px;
    transition: all 0.2s ease;
  }

  .sort-dropdown:focus {
    border-color: var(--ugflix-primary);
    box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
    background-color: var(--ugflix-bg-card);
    color: var(--ugflix-text-primary);
  }

  .sort-dropdown:hover {
    border-color: var(--ugflix-primary);
  }

  .filters-sidebar {
    padding: 0;
    background: transparent;
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--ugflix-border);
    background: transparent;
  }

  .filters-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--ugflix-text-primary);
  }

  .filters-toggle-btn {
    background: var(--ugflix-bg-card);
    border: 1px solid var(--ugflix-border);
    border-radius: var(--ugflix-border-radius);
    color: var(--ugflix-text-primary);
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    transition: var(--ugflix-transition-fast);
    display: none;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    white-space: nowrap;
  }

  .filters-toggle-btn:hover {
    background: var(--ugflix-primary);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
  }

  .filters-toggle-btn:focus {
    outline: none;
    box-shadow: var(--ugflix-shadow-focus);
  }

  .filters-content {
    padding: 0 0 16px 0;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
    background: transparent;
  }

  .filters-content.collapsed {
    max-height: 0;
    opacity: 0;
    padding: 0;
  }

  .products-content {
    background: transparent;
    border: none;
    padding: 0;
  }

  .filter-group {
    margin-bottom: 16px;
  }

  .filter-label {
    font-size: 13px;
    font-weight: 500;
    margin: 0 0 6px 0;
    color: var(--ugflix-text-primary);
    display: block;
  }

  .filter-select {
    border: 1px solid var(--ugflix-border);
    border-radius: var(--ugflix-border-radius);
    font-size: 13px;
    padding: 8px;
    background-color: var(--ugflix-bg-card);
    color: var(--ugflix-text-primary);
  }

  .filter-select:focus {
    border-color: var(--ugflix-primary);
    box-shadow: var(--ugflix-shadow-focus);
    background-color: var(--ugflix-bg-card);
  }

  .price-inputs {
    display: flex;
    gap: 8px;
    margin: 0 0 8px 0;
  }

  .price-input {
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    font-size: 13px;
    padding: 8px;
    color: var(--ugflix-text-primary);
    background-color: var(--ugflix-bg-input);
  }

  .price-input:focus {
    border-color: var(--ugflix-primary);
    box-shadow: var(--ugflix-shadow-focus);
  }

  .price-separator {
    align-self: center;
    color: var(--ugflix-text-secondary);
    font-size: 13px;
  }

  .apply-price-btn {
    border: 1px solid var(--ugflix-primary);
    border-radius: 0px;
    background: var(--ugflix-bg-secondary);
    color: var(--ugflix-primary);
    font-size: 12px;
    padding: 12px;
    width: 100%;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .apply-price-btn:hover {
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    border-color: var(--ugflix-primary);
  }

  .clear-filters-btn {
    font-size: 12px;
    color: var(--ugflix-text-secondary);
    padding: 0;
    text-decoration: none;
    border: none;
    background: none;
  }

  .clear-filters-btn:hover {
    color: var(--ugflix-primary);
    text-decoration: underline;
  }

  .active-filters {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--ugflix-border);
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter-tag {
    cursor: pointer;
    font-size: 11px;
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    border: none;
    border-radius: 0px;
    padding: 4px 8px;
    transition: all 0.2s ease;
  }

  .filter-tag:hover {
    background: var(--ugflix-primary-dark);
  }

  .filter-tag-remove {
    margin-left: 4px;
    font-weight: normal;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin: 0;
    padding: 12px 0;
  }

  .product-item {
    transition: transform 0.2s ease;
  }

  .product-item:hover {
    transform: translateY(-2px);
  }

  .products-listing-container {
    background: transparent;
    padding: 0;
    margin-top: 0;
  }

  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 16px;
    text-align: center;
    background: var(--ugflix-bg-primary);
  }

  .empty-icon {
    font-size: 48px;
    color: var(--ugflix-text-muted);
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 8px 0;
    color: var(--ugflix-text-primary);
  }

  .empty-description {
    font-size: 14px;
    color: var(--ugflix-text-secondary);
    margin: 0 0 16px 0;
  }

  .empty-action-btn {
    border: 1px solid var(--ugflix-primary);
    border-radius: 0px;
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    font-size: 13px;
    padding: 8px 16px;
    transition: all 0.2s ease;
  }

  .empty-action-btn:hover {
    background: var(--ugflix-primary-dark);
    border-color: var(--ugflix-primary-dark);
  }

  .pagination-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
    background: transparent;
    border-top: 1px solid var(--ugflix-border);
  }

  .pagination-text {
    font-size: 13px;
    color: var(--ugflix-text-secondary);
    font-weight: 500;
  }

  .custom-pagination {
    margin: 0;
  }

  .custom-pagination .page-link {
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    color: var(--ugflix-text-primary);
    background: var(--ugflix-bg-secondary);
    font-size: 13px;
    padding: 8px 12px;
    margin: 0 2px;
    font-weight: 500;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .custom-pagination .page-link:hover {
    background: var(--ugflix-primary);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
  }

  .custom-pagination .page-item.active .page-link {
    background: var(--ugflix-primary);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
  }

  .custom-pagination .page-item.disabled .page-link {
    color: var(--ugflix-text-muted);
    background: var(--ugflix-bg-disabled);
    border-color: var(--ugflix-border);
    cursor: not-allowed;
  }

  .custom-pagination .page-item.disabled .page-link:hover {
    background: var(--ugflix-bg-disabled);
    border-color: var(--ugflix-border);
    color: var(--ugflix-text-muted);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pagination-info {
    display: flex;
    align-items: center;
  }

  /* Responsive Grid Breakpoints - 5 items per row on large screens */
  @media (max-width: 1200px) {
    .products-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
  }

  @media (max-width: 992px) {
    .products-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .pagination-section {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  @media (max-width: 576px) {
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
  }

  @media (max-width: 480px) {
    .products-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
  }

  @media (max-width: 767.98px) {
    .products-page {
      padding: 5px;
    }

    .col-md-3,
    .col-md-9 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    .products-header .page-title {
      font-size: 1.25rem;
    }

    .products-grid {
      padding: 8px 0;
    }

    .sort-dropdown {
      min-width: 140px;
    }

    .filters-header {
      margin-bottom: 0;
      padding-bottom: 12px;
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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
          productCount: productsData?.total || 0,
        });
      }
    }

    // Default products page SEO
    return generateCategoryMetaTags({
      name: "All Products",
      description:
        "Shop all products online in Uganda. Electronics, fashion, home & garden, and more with fast delivery and secure checkout.",
      productCount: productsData?.total || 0,
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
          url: window.location.href,
        };
      }
    }

    return {
      name: "All Products",
      description:
        "Shop all products online in Uganda. Electronics, fashion, home & garden, and more with fast delivery and secure checkout.",
      productCount: productsData?.total || 0,
      url: window.location.href,
    };
  };

  return (
    <React.Fragment>
      <SEOHead config={generateSEOConfig()} />
      <CategorySchema category={getCategorySchemaData()} />
      <div className="breadcrumb-wrapper ">
        <DynamicBreadcrumb
          context={{
            categories,
            selectedCategory,
            searchTerm: searchParams.get("search") || undefined,
          }}
          showBackground={true}
          showIcons={true}
        />
      </div>

      <div className="products-page">
        <Container fluid>
          <Row>
            {/* Filters Sidebar */}
            <Col md={3} className="my-0">
              <div className="filters-sidebar">
                <div
                  className={`filters-content ${
                    !showFilters ? "collapsed" : ""
                  }`}
                >
                  {/* Category Filter */}
                  <div className="filter-group mt-3">
                    <label className="filter-label">Filter By Category</label>
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
            </Col>

            {/* Products Grid */}
            <Col md={9} className="my-0">
              <div className="products-content">
                {/* Enhanced Products Header */}
                <div className="products-header">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <div className="page-title-section text-start">
                        <h1 className="page-title">{getPageTitle()}</h1>
                        {productsData && (
                          <p className="products-count">
                            <i className="bi bi-grid-3x3-gap me-2"></i>
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
                    <div className="products-listing-container">
                      <div className="products-grid">
                        {products.map((product: ProductModel) => (
                          <div key={product.id} className="product-item">
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
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
                                i <=
                                Math.min(totalPages - 1, currentPage + delta);
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
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ProductsPage;
