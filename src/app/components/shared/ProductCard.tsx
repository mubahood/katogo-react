// src/app/components/shared/ProductCard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { ProductCardProps } from "../../types";
import { 
  calculateDiscountPercent, 
  calculateStockProgress, 
  getStockStatus, 
  getProductUrl,
  getProductImage 
} from "../../utils";
import { 
  addToWishlistAPI, 
  removeFromWishlistAPI, 
  selectIsInWishlist,
  selectWishlistLoading,
  loadWishlistFromAPI,
  syncFromManifest
} from "../../store/slices/wishlistSlice";
import { RootState, AppDispatch } from "../../store/store";
import { selectManifest, selectIsAuthenticated } from "../../store/slices/manifestSlice";

// Inline CSS styles for ProductCard - Following ProductsPage design with 4px border-radius
const productCardStyles = `
  .product-card {
    background-color: var(--white, #ffffff);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 1px solid transparent;
    position: relative;
  }

  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--border-color-light, #f1f3f4);
  }

  .product-card-image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--background-light, #f8f9fa);
  }

  .product-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .product-card-image.loading {
    opacity: 0;
  }

  .product-card-image.loaded {
    opacity: 1;
  }

  .product-card:hover .product-card-image {
    transform: scale(1.03);
  }

  .product-card-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--background-light, #f8f9fa) 0%,
      var(--border-color-light, #f1f3f4) 50%,
      var(--background-light, #f8f9fa) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    z-index: 1;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .product-card-discount-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background-color: var(--accent-color, #dc3545);
    color: var(--white, #ffffff);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    z-index: 3;
    line-height: 1;
  }

  .product-card-wishlist-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--text-color-medium, #6c757d);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 3;
  }

  .product-card-wishlist-btn:hover {
    background-color: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
    transform: scale(1.1);
  }

  .product-card-wishlist-btn.active {
    background-color: var(--primary-color, #007bff);
    color: var(--white, #ffffff);
  }

  .product-card-wishlist-btn.loading {
    opacity: 0.7;
    cursor: not-allowed;
    animation: pulse 1.5s infinite;
  }

  .product-card-wishlist-btn.loading:hover {
    transform: none;
    background-color: rgba(255, 255, 255, 0.9);
    color: var(--text-color-medium, #6c757d);
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  @keyframes wishlistSuccess {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .product-card-wishlist-btn.success-animation {
    animation: wishlistSuccess 0.4s ease;
  }

  .product-card-info {
    padding: 12px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .product-card-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-color-dark, #212529);
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 2.6em;
    text-decoration: none;
  }

  .product-card-pricing {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .product-card-price-new {
    font-size: 15px;
    font-weight: 600;
    color: var(--primary-color, #007bff);
    margin: 0;
    line-height: 1.2;
  }

  .product-card-price-old {
    font-size: 12px;
    color: var(--text-color-light, #adb5bd);
    text-decoration: line-through;
    margin: 0;
    line-height: 1.2;
  }

  .product-card-reviews {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  .product-card-review-stars {
    display: flex;
    gap: 1px;
  }

  .product-card-review-star {
    font-size: 12px;
    color: var(--warning-color, #ffc107);
  }

  .product-card-review-star.empty {
    color: var(--border-color, #dee2e6);
  }

  .product-card-review-count {
    font-size: 11px;
    color: var(--text-color-medium, #6c757d);
  }

  /* Responsive Design */
  @media (max-width: 991px) {
    .product-card-image-container {
      aspect-ratio: 1.1;
    }
    
    .product-card-info {
      padding: 10px;
      gap: 6px;
    }
    
    .product-card-name {
      font-size: 12px;
      height: 2.4em;
    }
    
    .product-card-price-new {
      font-size: 14px;
    }
    
    .product-card-price-old {
      font-size: 11px;
    }
    
    .product-card-discount-badge {
      font-size: 9px;
      padding: 3px 6px;
    }
    
    .product-card-wishlist-btn {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
  }

  @media (max-width: 767px) {
    .product-card-image-container {
      aspect-ratio: 1;
    }
    
    .product-card-info {
      padding: 8px;
      gap: 5px;
    }
    
    .product-card-name {
      font-size: 11px;
      height: 2.2em;
    }
    
    .product-card-price-new {
      font-size: 13px;
    }
    
    .product-card-price-old {
      font-size: 10px;
    }
    
    .product-card-review-stars {
      gap: 0;
    }
    
    .product-card-review-star {
      font-size: 10px;
    }
    
    .product-card-review-count {
      font-size: 10px;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleId = "product-card-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = productCardStyles;
    document.head.appendChild(styleElement);
  }
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  className = "", 
  showStock = true 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Enhanced Redux selectors that check both wishlist slice and manifest
  const isInWishlist = useSelector((state: RootState) => {
    const wishlistItems = state.wishlist.items;
    const inWishlistSlice = wishlistItems.some(item => item.product_id === product.id);
    
    const manifestWishlist = state.manifest.data?.wishlist || [];
    const inManifestWishlist = manifestWishlist.some((item: any) => 
      item.product_id === product.id || item.id === product.id
    );
    
    return inWishlistSlice || inManifestWishlist;
  });
  
  const wishlistLoading = useSelector((state: RootState) => 
    selectWishlistLoading(state)
  );
  const manifestData = useSelector((state: RootState) => selectManifest(state));
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));

  // Load wishlist data if user is authenticated and wishlist isn't loaded
  useEffect(() => {
    if (isAuthenticated && manifestData) {
      if (manifestData.wishlist && manifestData.wishlist.length > 0) {
        dispatch(syncFromManifest(manifestData.wishlist));
      } else if (!manifestData.wishlist) {
        dispatch(loadWishlistFromAPI());
      }
    }
  }, [dispatch, isAuthenticated, manifestData]);
  
  // Calculate price and discount
  const discountPercent = calculateDiscountPercent(product.price_2, product.price_1);
  const price1 = parseFloat(product.price_1);
  const price2 = parseFloat(product.price_2);
  
  // Get review data from product (with fallbacks)
  const productRating = Number((product as any).rating) || Number((product as any).average_rating) || 0;
  const productReviewCount = Number((product as any).reviewsCount) || Number((product as any).review_count) || 0;
  
  // Handlers
  const handleImageLoad = () => setIsImageLoaded(true);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/media/svg/files/blank-image.svg";
    e.currentTarget.onerror = null;
    setIsImageLoaded(true);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessingWishlist || wishlistLoading) return;
    
    setIsProcessingWishlist(true);
    
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlistAPI(product.id)).unwrap();
      } else {
        await dispatch(addToWishlistAPI(product.id)).unwrap();
      }
      
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 400);
      
    } catch (error) {
      console.error('Wishlist operation failed:', error);
    } finally {
      setIsProcessingWishlist(false);
    }
  };

  // Get the image URL
  let imageUrl: string;
  if (product && 'getMainImage' in product && typeof product.getMainImage === 'function') {
    imageUrl = product.getMainImage();
  } else {
    imageUrl = getProductImage(product);
  }

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="product-card-review-star">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="product-card-review-star">★</span>);
      } else {
        stars.push(<span key={i} className="product-card-review-star empty">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className={`product-card ${className}`}>
      <Link to={getProductUrl(product.id)} className="product-card-image-container">
        {!isImageLoaded && <div className="product-card-shimmer" />}
        
        <img
          src={imageUrl}
          alt={product.name}
          className={`product-card-image ${isImageLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {discountPercent > 0 && (
          <div className="product-card-discount-badge">
            -{discountPercent}%
          </div>
        )}
        
        <button
          className={`product-card-wishlist-btn ${isInWishlist ? 'active' : ''} ${
            isProcessingWishlist || wishlistLoading ? 'loading' : ''
          } ${showSuccessAnimation ? 'success-animation' : ''}`}
          onClick={handleWishlistClick}
          disabled={isProcessingWishlist || wishlistLoading}
          title={
            isProcessingWishlist 
              ? 'Processing...' 
              : isInWishlist 
                ? 'Remove from wishlist' 
                : 'Add to wishlist'
          }
        >
          {isProcessingWishlist || wishlistLoading ? '⟳' : isInWishlist ? '♥' : '♡'}
        </button>
      </Link>
      
      <div className="product-card-info">
        <Link to={getProductUrl(product.id)} style={{ textDecoration: 'none' }}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        
        <div className="product-card-pricing">
          <div className="product-card-price-new">
            UGX {price1.toLocaleString()}
          </div>
          {price2 > price1 && (
            <div className="product-card-price-old">
              UGX {price2.toLocaleString()}
            </div>
          )}
        </div>
        
        <div className="product-card-reviews">
          {productRating > 0 && (
            <>
              <div className="product-card-review-stars">
                {renderStars(productRating)}
              </div>
              <span className="product-card-review-count">
                ({productReviewCount})
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
