// src/app/pages/SearchResultsPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, Button, Dropdown, Pagination } from "react-bootstrap";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/shared/ProductCard";
import { dealsData, topProductsData } from "../data/optimized/products";
import type { ProductWithExtras } from "../types";
import { formatPrice } from "../utils";

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Combine all products for searching
  const allProducts: ProductWithExtras[] = useMemo(() => {
    return [...dealsData, ...topProductsData];
  }, []);

  // Filter products based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    let filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.category_text && product.category_text.toLowerCase().includes(query))
    );

    // Sort results
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price_1) - parseFloat(b.price_1));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price_1) - parseFloat(a.price_1));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [allProducts, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = searchResults.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="search-results-page">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="my-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item active">
              Search Results
            </li>
          </ol>
        </nav>

        {/* Search Header */}
        <div className="search-header mb-4">
          <h1 className="h3 mb-2">
            Search Results {searchQuery && `for "${searchQuery}"`}
          </h1>
          <p className="text-muted">
            {searchResults.length > 0 
              ? `Found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''}`
              : 'No products found'
            }
          </p>
        </div>

        {searchResults.length > 0 ? (
          <>
            {/* Results Header */}
            <div className="results-header d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
              <div>
                <span className="text-muted">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, searchResults.length)} of {searchResults.length} results
                </span>
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">Sort by:</span>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    {sortBy === "relevance" && "Relevance"}
                    {sortBy === "price-low" && "Price: Low to High"}
                    {sortBy === "price-high" && "Price: High to Low"}
                    {sortBy === "name" && "Name"}
                    {sortBy === "rating" && "Rating"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleSortChange("relevance")}>
                      Relevance
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortChange("price-low")}>
                      Price: Low to High
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortChange("price-high")}>
                      Price: High to Low
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortChange("name")}>
                      Name
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortChange("rating")}>
                      Rating
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            {/* Results Grid */}
            <Row>
              {paginatedResults.map(product => (
                <Col sm={6} lg={3} key={product.id} className="mb-4">
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="no-results text-center py-5">
            <i className="bi bi-search fs-1 text-muted mb-4 d-block"></i>
            <h3>No products found</h3>
            <p className="text-muted mb-4">
              {searchQuery 
                ? `We couldn't find any products matching "${searchQuery}"`
                : "Enter a search term to find products"
              }
            </p>
            <div className="suggestions">
              <h5>Try:</h5>
              <ul className="list-unstyled">
                <li>• Checking your spelling</li>
                <li>• Using more general terms</li>
                <li>• Browsing our categories</li>
              </ul>
            </div>
            <Link to="/products" className="btn btn-primary mt-3">
              Browse All Products
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SearchResultsPage;
