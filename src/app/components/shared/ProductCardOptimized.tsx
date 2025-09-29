// src/app/components/shared/ProductCard.tsx
import React, { useState } from "react";
import type { ProductCardProps } from "../../types";
import { 
  calculateDiscountPercent, 
  calculateStockProgress, 
  getStockStatus, 
  getProductUrl,
  getProductImage 
} from "../../utils";

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  className = "", 
  showStock = true 
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Calculate price and discount
  const discountPercent = calculateDiscountPercent(product.price_2, product.price_1);
  const price1 = parseFloat(product.price_1);
  const price2 = parseFloat(product.price_2);
  
  // Calculate stock progress if available
  const stockProgress = product.stock && showStock
    ? calculateStockProgress(product.stock.items_sold, product.stock.total_items)
    : 0;
  
  const stockStatus = getStockStatus(stockProgress);
  
  // Handlers
  const handleImageLoad = () => setIsImageLoaded(true);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/media/svg/files/blank-image.svg";
    e.currentTarget.onerror = null;
  };

  return (
    <div className={`product-card ${className}`}>
      <a href={getProductUrl(product.id)} className="product-image-link">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className={`product-image ${isImageLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {discountPercent > 0 && (
          <div className="product-discount-badge">
            -{discountPercent}%
          </div>
        )}
        
        <div className="product-quick-view">
          <i className="bi bi-eye"></i>
        </div>
      </a>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-pricing">
          <div className="product-price-new">
            UGX {price1.toLocaleString()}
          </div>
          {price2 > price1 && (
            <div className="product-price-old">
              UGX {price2.toLocaleString()}
            </div>
          )}
        </div>
        
        {product.stock && showStock && (
          <div className="product-stock-section">
            <div className="stock-progress">
              <div className={`progress-bar ${stockStatus}`}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${stockProgress}%` }}
                />
              </div>
            </div>
            <div className="items-sold">
              {product.stock.items_sold}/{product.stock.total_items} Sold
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
