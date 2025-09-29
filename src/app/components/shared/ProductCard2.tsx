// src/app/components/shared/ProductCard2.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import type { ProductCardProps } from "../../types";
import { 
  calculateDiscountPercent, 
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

// Inline CSS styles for ProductCard2 - Following app design system with square corners and no shadows
const productCard2Styles = `
  .pc2-card-container {
    background-color: var(--white);
    border-radius: var(--border-radius);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid var(--border-color-light);
    position: relative;
  }

  .pc2-card-container:hover {
    border-color: var(--primary-color);
  }

  .pc2-link-wrapper {
    display: block;
    color: inherit;
    text-decoration: none;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .pc2-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--background-light);
  }

  .pc2-product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
  }

  .pc2-product-image.pc2-loading {
    opacity: 0;
  }

  .pc2-product-image.pc2-loaded {
    opacity: 1;
  }

  .pc2-shimmer-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--background-light) 0%,
      var(--border-color-light) 50%,
      var(--background-light) 100%
    );
    background-size: 200% 100%;
    animation: pc2-shimmer 1.5s infinite;
    z-index: 1;
  }

  @keyframes pc2-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .pc2-discount-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    background: var(--accent-color);
    color: var(--white);
    padding: 2px 6px;
    border-radius: var(--border-radius);
    font-size: 10px;
    font-weight: 600;
    z-index: 3;
    line-height: 1;
  }

  .pc2-wishlist-button {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--text-color-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 3;
  }

  .pc2-wishlist-button:hover {
    background-color: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .pc2-wishlist-button.pc2-active {
    background-color: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .pc2-wishlist-button.pc2-loading {
    opacity: 0.7;
    cursor: not-allowed;
    animation: pc2-pulse 1.5s infinite;
  }

  .pc2-wishlist-button.pc2-loading:hover {
    background-color: var(--white);
    color: var(--text-color-medium);
    border-color: var(--border-color);
  }

  @keyframes pc2-pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  .pc2-content-area {
    padding: 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .pc2-product-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-color-dark);
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

  .pc2-pricing-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pc2-current-price {
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-color);
    margin: 0;
    line-height: 1.2;
  }

  .pc2-original-price {
    font-size: 11px;
    color: var(--text-color-light);
    text-decoration: line-through;
    margin: 0;
    line-height: 1.2;
  }

  .pc2-rating-section {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
  }

  .pc2-star-rating {
    display: flex;
    gap: 1px;
  }

  .pc2-rating-star {
    font-size: 10px;
    color: var(--warning-color);
  }

  .pc2-rating-star.pc2-empty {
    color: var(--border-color);
  }

  .pc2-review-count {
    font-size: 10px;
    color: var(--text-color-medium);
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 1199.98px) {
    .pc2-content-area {
      padding: 9px;
      gap: 5px;
    }
    
    .pc2-product-title {
      font-size: 11px;
    }
    
    .pc2-current-price {
      font-size: 12px;
    }
  }

  @media (max-width: 991.98px) {
    .pc2-content-area {
      padding: 8px;
      gap: 4px;
    }
    
    .pc2-product-title {
      font-size: 11px;
      height: 2.4em;
    }
    
    .pc2-current-price {
      font-size: 12px;
    }
    
    .pc2-original-price {
      font-size: 10px;
    }
    
    .pc2-discount-badge {
      font-size: 9px;
      padding: 2px 4px;
    }
    
    .pc2-wishlist-button {
      width: 24px;
      height: 24px;
      font-size: 11px;
    }
  }

  @media (max-width: 767.98px) {
    .pc2-content-area {
      padding: 7px;
      gap: 4px;
    }
    
    .pc2-product-title {
      font-size: 10px;
      height: 2.2em;
    }
    
    .pc2-current-price {
      font-size: 11px;
    }
    
    .pc2-original-price {
      font-size: 9px;
    }
    
    .pc2-star-rating {
      gap: 0;
    }
    
    .pc2-rating-star {
      font-size: 9px;
    }
    
    .pc2-review-count {
      font-size: 9px;
    }
    
    .pc2-discount-badge {
      top: 4px;
      left: 4px;
      font-size: 8px;
      padding: 1px 3px;
    }
    
    .pc2-wishlist-button {
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      font-size: 10px;
    }
  }

  @media (max-width: 480px) {
    .pc2-content-area {
      padding: 6px;
      gap: 3px;
    }
    
    .pc2-product-title {
      font-size: 9px;
      height: 2em;
    }
    
    .pc2-current-price {
      font-size: 10px;
    }
    
    .pc2-original-price {
      font-size: 8px;
    }
  }
`;

const ProductCard2: React.FC<ProductCardProps> = ({ 
  product, 
  className = "", 
  showStock = false // ProductCard2 doesn't show stock by default
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);

  // Redux state - Enhanced selectors that check both wishlist slice and manifest
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

  // Calculate price and discount
  const discountPercent = calculateDiscountPercent(product.price_2, product.price_1);
  const price1 = parseFloat(product.price_1);
  const price2 = parseFloat(product.price_2);
  
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

  // Optimized handlers with useCallback for performance
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/media/svg/files/blank-image.svg";
    e.currentTarget.onerror = null;
  }, []);

  const handleWishlistClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlistAPI(product.id)).unwrap();
      } else {
        await dispatch(addToWishlistAPI(product.id)).unwrap();
        // Success animation
        setWishlistAnimation(true);
        setTimeout(() => setWishlistAnimation(false), 400);
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
    }
  }, [dispatch, product.id, isInWishlist, wishlistLoading]);

  // Get the image URL - use ProductModel method if available
  let imageUrl: string;
  if (product && 'getMainImage' in product && typeof product.getMainImage === 'function') {
    imageUrl = product.getMainImage();
  } else {
    imageUrl = getProductImage(product);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: productCard2Styles }} />
      <div className={`pc2-card-container ${className}`}>
        <Link to={getProductUrl(product.id)} className="pc2-link-wrapper">
          <div className="pc2-image-wrapper">
            {/* Shimmer overlay for loading state */}
            {!isImageLoaded && <div className="pc2-shimmer-overlay" />}
            
            <LazyLoadImage
              src={imageUrl}
              alt={product.name}
              className={`pc2-product-image ${isImageLoaded ? 'pc2-loaded' : 'pc2-loading'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              effect="blur"
              placeholderSrc="/placeholder-product.svg"
              loading="lazy"
              width="100%"
              height="220"
            />
            
            {/* Discount badge */}
            {discountPercent > 0 && (
              <div className="pc2-discount-badge">
                -{discountPercent}%
              </div>
            )}

            {/* Wishlist button */}
            <button
              className={`pc2-wishlist-button ${isInWishlist ? 'pc2-active' : ''} ${
                wishlistLoading ? 'pc2-loading' : ''
              } ${wishlistAnimation ? 'pc2-success-animation' : ''}`}
              onClick={handleWishlistClick}
              disabled={wishlistLoading}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <i className={`bi ${isInWishlist ? 'bi-heart-fill' : 'bi-heart'}`} />
            </button>
          </div>
          
          <div className="pc2-content-area">
            <h3 className="pc2-product-title">{product.name}</h3>
            
            <div className="pc2-pricing-section">
              <div className="pc2-current-price">
                UGX {price1.toLocaleString()}
              </div>
              {price2 > price1 && (
                <div className="pc2-original-price">
                  UGX {price2.toLocaleString()}
                </div>
              )}
            </div>
            
            {product.rating && (
              <div className="pc2-rating-section">
                <div className="pc2-star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`pc2-rating-star ${
                        star <= (product.rating || 0) 
                          ? 'bi-star-fill' 
                          : 'bi-star pc2-empty'
                      }`}
                    />
                  ))}
                </div>
                {product.reviewCount && (
                  <span className="pc2-review-count">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>
    </>
  );
};

// Memoize ProductCard2 to prevent unnecessary re-renders
// Only re-render if product id, name, price_1, or wishlist status changes
export default memo(ProductCard2, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.name === nextProps.product.name &&
         prevProps.product.price_1 === nextProps.product.price_1 &&
         prevProps.className === nextProps.className;
});
