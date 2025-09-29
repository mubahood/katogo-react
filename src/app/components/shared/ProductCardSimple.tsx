// src/app/components/shared/ProductCardSimple.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import CustomShimmer from "./CustomShimmer";
import type { ProductCardProps } from "../../types";
import { 
  calculateDiscountPercent, 
  getProductUrl,
  getProductImage,
  formatPrice 
} from "../../utils";
import "./ProductCardSimple.css";

const ProductCardSimple: React.FC<ProductCardProps> = ({ 
  product, 
  className = ""
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Calculate price and discount
  const discountPercent = calculateDiscountPercent(product.price_2, product.price_1);
  const price1 = parseFloat(product.price_1);
  const price2 = parseFloat(product.price_2);
  const hasDiscount = discountPercent > 0;
  
  // Get the image URL
  let imageUrl: string;
  if (product && 'getMainImage' in product && typeof product.getMainImage === 'function') {
    imageUrl = product.getMainImage();
  } else {
    imageUrl = getProductImage(product);
  }
  
  // Handlers
  const handleImageLoad = () => setIsImageLoaded(true);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/media/svg/files/blank-image.svg";
    e.currentTarget.onerror = null;
    setIsImageLoaded(true);
  };

  return (
    <Link to={getProductUrl(product.id)} className={`product-card-simple ${className}`}>
      {/* Image Container */}
      <div className="product-image-container">
        {!isImageLoaded && (
          <div className="shimmer-container">
            <CustomShimmer 
              height={220} 
              className="shimmer-image"
            />
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={product.name}
          className={`product-image ${isImageLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="discount-badge">
            -{discountPercent}%
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        {/* Price Section */}
        <div className="price-section">
          <div className="current-price">
            {formatPrice(product.price_1)}
          </div>
          {hasDiscount && (
            <div className="original-price">
              {formatPrice(product.price_2)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Memoize ProductCardSimple to prevent unnecessary re-renders
export default React.memo(ProductCardSimple, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.name === nextProps.product.name &&
         prevProps.className === nextProps.className;
});
