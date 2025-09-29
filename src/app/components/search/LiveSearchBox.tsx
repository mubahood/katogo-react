// src/app/components/search/LiveSearchBox.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, Button, ListGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useManifest } from "../../hooks/useManifest";
import { CacheApiService } from "../../services/CacheApiService";
import { ProductModel } from "../../models/ProductModel";
import { API_CONFIG } from "../../constants";

// Inline CSS styles for LiveSearchBox
const inlineStyles = `
  /* LiveSearchBox - Light Mode Minimalistic */
  .live-search-box {
    position: relative;
    width: 100%;
  }

  .live-search-box .search-form {
    margin: 0;
  }

  .live-search-box .search-input-wrapper {
    width: 100%;
  }

  .live-search-box .search-input-group {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--ugflix-border-color, #2a2a2a);
    border-radius: 3px;
    overflow: hidden;
    background: var(--ugflix-bg-secondary, #1a1a1a);
    transition: all 0.2s ease;
    height: 32px;
  }

  .live-search-box .search-input-group:focus-within {
    border-color: var(--ugflix-primary, #ff6b35);
    box-shadow: 0 0 0 1px rgba(255, 107, 53, 0.2);
  }

  .live-search-box .search-input-group-sm {
    height: 28px;
  }

  .live-search-box .search-input-group-lg {
    height: 36px;
  }

  .live-search-box .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 0 8px;
    font-size: 13px;
    color: var(--ugflix-text-primary, #ffffff);
    height: 100%;
  }

  .live-search-box .search-input::placeholder {
    color: var(--ugflix-text-secondary, #cccccc);
  }

  .live-search-box .btn-search {
    background: var(--ugflix-primary, #ff6b35);
    color: var(--ugflix-text-primary, #ffffff);
    border: none;
    width: 40px; /* Slightly wider for desktop */
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    border-radius: 0;
  }

  .live-search-box .btn-search:hover {
    background: var(--ugflix-primary-hover, #e55a2b);
  }

  .live-search-box .btn-search:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .live-search-box .btn-search svg {
    width: 16px;
    height: 16px;
    transition: all 0.2s ease;
    stroke-width: 2.5;
    flex-shrink: 0;
  }

  .live-search-box .btn-search:hover svg {
    transform: scale(1.05);
  }

  .live-search-box .btn-search i {
    font-size: 14px; /* Slightly larger for better visibility */
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  /* Movie search result styling */
  .live-search-box .livesearch-product-info small {
    font-size: 11px;
    margin-top: 2px;
  }

  .live-search-box .livesearch-item-action.bi-play-circle {
    color: var(--ugflix-primary, #ff6b35);
    font-size: 18px;
  }

  /* Search Dropdown - Ultra Compact */
  .livesearch-dropdown {
    position: absolute;
    top: calc(100% + 1px);
    left: 0;
    right: 0;
    background: var(--ugflix-bg-secondary, #1a1a1a);
    border: 1px solid var(--ugflix-border-color, #2a2a2a);
    border-radius: 3px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    z-index: 1050;
    max-height: 260px;
    overflow-y: auto;
    animation: slideDown 0.1s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .livesearch-dropdown-section {
    border-bottom: 1px solid var(--ugflix-border-color, #2a2a2a);
  }

  .livesearch-dropdown-section:last-child {
    border-bottom: none;
  }

  .livesearch-dropdown-header {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px 8px 2px;
    font-size: 10px;
    font-weight: 600;
    color: var(--ugflix-text-secondary, #cccccc);
    text-transform: uppercase;
    letter-spacing: 0.2px;
    background: var(--ugflix-bg-primary, #0a0a0a);
    border-bottom: 1px solid var(--ugflix-border-color, #2a2a2a);
  }

  .livesearch-dropdown-header i {
    font-size: 10px;
    color: #9ca3af;
  }

  .livesearch-dropdown-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    cursor: pointer;
    transition: all 0.1s ease;
    border-bottom: 1px solid var(--ugflix-border-color, #2a2a2a);
    position: relative;
  }

  .livesearch-dropdown-item:last-child {
    border-bottom: none;
  }

  .livesearch-dropdown-item:hover {
    background: var(--ugflix-primary, #ff6b35);
  }

  .livesearch-dropdown-item i {
    color: var(--ugflix-text-secondary, #cccccc);
    font-size: 12px;
    flex-shrink: 0;
  }

  .livesearch-dropdown-item span {
    flex: 1;
    font-size: 12px;
    color: var(--ugflix-text-primary, #ffffff);
  }

  .livesearch-item-action {
    opacity: 0.3;
    transition: opacity 0.1s ease;
    color: var(--ugflix-text-secondary, #cccccc);
    font-size: 11px;
  }

  .livesearch-dropdown-item:hover .livesearch-item-action {
    opacity: 0.8;
    color: var(--ugflix-text-primary, #ffffff);
  }

  /* Product Items - Ultra Compact */
  .livesearch-dropdown-item.livesearch-product-item {
    align-items: flex-start;
    padding: 5px 8px;
    gap: 6px;
  }

  .livesearch-product-image {
    width: 40px;
    height: 56px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--ugflix-bg-tertiary, #2a2a2a);
    border: 1px solid var(--ugflix-border-color, #404040);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    animation: shimmer 2s infinite;
    pointer-events: none;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .livesearch-product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .livesearch-product-name {
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .livesearch-product-price {
    font-size: 10px;
    font-weight: 600;
    color: #d7152a;
  }

  /* Loading State */
  .livesearch-dropdown-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    color: #9ca3af;
    font-size: 12px;
  }

  /* No Results */
  .livesearch-no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 8px;
    text-align: center;
    color: #9ca3af;
  }

  .livesearch-no-results i {
    font-size: 16px;
    opacity: 0.4;
  }

  .livesearch-no-results span {
    font-size: 12px;
  }

  /* Footer */
  .livesearch-dropdown-footer {
    padding: 4px 8px;
    text-align: center;
    background: #f9fafb;
  }

  .livesearch-dropdown-footer .btn-link {
    color: #d7152a;
    text-decoration: none;
    font-size: 11px;
    font-weight: 500;
  }

  .livesearch-dropdown-footer .btn-link:hover {
    text-decoration: underline;
  }

  /* Responsive - Mobile Ultra Compact */
  @media (max-width: 576px) {
    .livesearch-dropdown {
      max-height: 200px;
    }
    
    .livesearch-dropdown-item {
      padding: 3px 6px;
    }
    
    .livesearch-dropdown-item.livesearch-product-item {
      padding: 4px 6px;
      gap: 4px;
    }
    
    .livesearch-product-image {
      width: 32px;
      height: 44px;
    }
    
    .livesearch-product-name {
      font-size: 10px;
      line-height: 1.0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .livesearch-product-price {
      font-size: 9px;
    }
    
    .livesearch-dropdown-header {
      padding: 3px 6px 2px;
      font-size: 9px;
    }

    .live-search-box .search-input {
      padding: 0 6px;
      font-size: 12px;
    }

    .live-search-box .search-input-group {
      height: 28px;
    }

    .live-search-box .btn-search {
      width: 32px; /* Appropriate size for mobile */
      flex-shrink: 0;
    }

    .live-search-box .btn-search i {
      font-size: 13px;
    }
  }
`;

// Simple debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface LiveSearchBoxProps {
  placeholder?: string;
  className?: string;
  size?: "sm" | "lg";
  showRecentSearches?: boolean;
  onProductSelect?: (product: ProductModel) => void;
  onSearchSubmit?: (query: string) => void;
}

interface SearchResults {
  products: ProductModel[];
  suggestions: string[];
  total: number;
  search_term: string;
}

const LiveSearchBox: React.FC<LiveSearchBoxProps> = ({
  placeholder = "Search for products, brands, categories...",
  className = "",
  size,
  showRecentSearches = true,
  onProductSelect,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get recent search suggestions from manifest
  const { manifest } = useManifest();

  // Inject inline styles into the document head
  useEffect(() => {
    const styleId = "live-search-box-styles";

    // Check if styles are already injected
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = inlineStyles;
      document.head.appendChild(style);
    }

    // Cleanup function to remove styles when component unmounts
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Load recent searches on component mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        // Only use manifest data - don't make API calls
        const manifestSuggestions = manifest?.recent_search_suggestions || [];
        setRecentSearches(manifestSuggestions);
      } catch (error) {
        console.warn("Failed to load recent searches:", error);
      }
    };

    if (showRecentSearches && manifest) {
      loadRecentSearches();
    }
  }, [manifest, showRecentSearches]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setSearchResults(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("🔍 Performing live search for:", searchQuery);
        const results = await CacheApiService.liveSearch(searchQuery, 6);
        console.log("🔍 Live search results:", results);
        setSearchResults(results);
      } catch (error) {
        console.error("❌ Live search failed:", error);
        setSearchResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length === 0) {
      setSearchResults(null);
      setShowDropdown(showRecentSearches && recentSearches.length > 0);
    } else {
      setShowDropdown(true);
      debouncedSearch(value);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (
      query.trim().length === 0 &&
      showRecentSearches &&
      recentSearches.length > 0
    ) {
      setShowDropdown(true);
    } else if (query.trim().length >= 2) {
      setShowDropdown(true);
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding dropdown to allow clicking on items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setShowDropdown(false);
      }
    }, 200);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  // Perform search and navigation
  const performSearch = (searchQuery: string) => {
    setShowDropdown(false);
    setQuery(searchQuery);

    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    } else {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    performSearch(suggestion);
  };

  // Handle product/movie click
  const handleProductClick = (product: ProductModel) => {
    setShowDropdown(false);

    if (onProductSelect) {
      onProductSelect(product);
    } else {
      // Check if this is a movie (has movie data in tags)
      let isMovie = false;
      try {
        const movieData = JSON.parse(product.tags || '{}');
        isMovie = movieData.genre || movieData.vj || movieData.type;
      } catch {
        // If tags parsing fails, check other movie indicators
        isMovie = product.summary?.includes('•') || false;
      }
      
      if (isMovie) {
        // Navigate to movie page
        navigate(`/movies/${product.id}`);
      } else {
        // Navigate to product page
        navigate(`/product/${product.id}`);
      }
    }
  };

  // Clear search history
  const handleClearHistory = async () => {
    try {
      await CacheApiService.clearSearchHistory();
      setRecentSearches([]);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  return (
    <div className={`live-search-box ${className}`}>
      <Form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper position-relative">
          <div
            className={`search-input-group ${
              size ? `search-input-group-${size}` : ""
            }`}
          >
            <input
              ref={searchRef}
              type="search"
              className="search-input form-control"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoComplete="off"
            />
            <button
              className="btn btn-search"
              type="submit"
              disabled={!query.trim()}
              aria-label="Search"
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              )}
            </button>
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="livesearch-dropdown"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
            >
              {/* Loading State */}
              {isLoading && (
                <div className="livesearch-dropdown-section">
                  <div className="livesearch-dropdown-loading">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Searching...</span>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchResults && !isLoading && (
                <>
                  {/* Movies */}
                  {searchResults.products.length > 0 && (
                    <div className="livesearch-dropdown-section">
                      <div className="livesearch-dropdown-header">
                        <i className="bi bi-film"></i>
                        <span>Movies & Series</span>
                      </div>
                      {searchResults.products.map((product) => {
                        // Parse movie data from tags field
                        let movieData;
                        try {
                          movieData = JSON.parse(product.tags || '{}');
                        } catch {
                          movieData = {};
                        }
                        
                        return (
                          <div
                            key={product.id}
                            className="livesearch-dropdown-item livesearch-product-item"
                            onClick={() => handleProductClick(product)}
                          >
                            <div 
                              className="livesearch-product-image"
                              style={{
                                backgroundImage: `url(${product.feature_photo || "/placeholder-image.jpg"})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                            >
                              <div className="image-shimmer"></div>
                            </div>
                            <div className="livesearch-product-info">
                              <div className="livesearch-product-name">
                                {product.name}
                              </div>
                              <div className="livesearch-product-price">
                                {product.summary && (
                                  <small className="text-muted d-block">
                                    {product.summary}
                                  </small>
                                )}
                              </div>
                            </div>
                            <i className="bi bi-play-circle livesearch-item-action"></i>
                          </div>
                        );
                      })}
                      {searchResults.total > searchResults.products.length && (
                        <div className="livesearch-dropdown-footer">
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => performSearch(query)}
                          >
                            View all {searchResults.total} results
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search Suggestions */}
                  {searchResults.suggestions.length > 0 && (
                    <div className="livesearch-dropdown-section">
                      <div className="livesearch-dropdown-header">
                        <i className="bi bi-search"></i>
                        <span>Suggestions</span>
                      </div>
                      {searchResults.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="livesearch-dropdown-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <i className="bi bi-search"></i>
                          <span>{suggestion}</span>
                          <i className="bi bi-arrow-up-left livesearch-item-action"></i>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchResults.products.length === 0 &&
                    searchResults.suggestions.length === 0 && (
                      <div className="livesearch-dropdown-section">
                        <div className="livesearch-no-results">
                          <i className="bi bi-search"></i>
                          <span>No results found for "{query}"</span>
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => performSearch(query)}
                          >
                            Search anyway
                          </button>
                        </div>
                      </div>
                    )}
                </>
              )}

              {/* Recent Searches */}
              {!searchResults &&
                !isLoading &&
                showRecentSearches &&
                recentSearches.length > 0 && (
                  <div className="livesearch-dropdown-section">
                    <div className="livesearch-dropdown-header">
                      <i className="bi bi-clock-history"></i>
                      <span>Recent Searches</span>
                      <button
                        className="btn btn-link btn-sm ms-auto"
                        onClick={handleClearHistory}
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="livesearch-dropdown-item"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        <i className="bi bi-clock"></i>
                        <span>{search}</span>
                        <i className="bi bi-arrow-up-left livesearch-item-action"></i>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </Form>
    </div>
  );
};

export default LiveSearchBox;
