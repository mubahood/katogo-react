// src/app/components/shared/ProductCard2Optimized.tsx
import React, { useState } from "react";
import type { ProductCardProps } from "../../types";
import { 
  calculateDiscountPercent, 
  getProductUrl,
  getProductImage 
} from "../../utils";

const ProductCard2: React.FC<ProductCardProps> = ({ 
  product, 
  className = "", 
  showStock = false // ProductCard2 doesn't show stock by default
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Calculate price and discount
  const discountPercent = calculateDiscountPercent(product.price_2, product.price_1);
  const price1 = parseFloat(product.price_1);
  const price2 = parseFloat(product.price_2);
  
  // Handlers
  const handleImageLoad = () => setIsImageLoaded(true);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/media/svg/files/blank-image.svg";
    e.currentTarget.onerror = null;
  };

  return (
    <div className={`product-card2 ${className}`}>
      <a href={getProductUrl(product.id)} className="product-card2-info-link">
        <div className="product-card2-image-wrapper">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className={`product-card2-image ${isImageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {discountPercent > 0 && (
            <div className="product-card2-discount-badge">
              -{discountPercent}%
            </div>
          )}
        </div>
        
        <div className="product-card2-info">
          <h3 className="product-card2-name">{product.name}</h3>
          
          <div className="product-card2-pricing">
            <div className="product-card2-price-new">
              UGX {price1.toLocaleString()}
            </div>
            {price2 > price1 && (
              <div className="product-card2-price-old">
                UGX {price2.toLocaleString()}
              </div>
            )}
          </div>
          
          {product.rating && (
            <div className="product-card2-rating">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`bi ${
                      star <= (product.rating || 0) 
                        ? 'bi-star-fill' 
                        : 'bi-star'
                    }`}
                  />
                ))}
              </div>
              {product.reviewCount && (
                <span className="review-count">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </a>
    </div>
  );
};

export default ProductCard2;
