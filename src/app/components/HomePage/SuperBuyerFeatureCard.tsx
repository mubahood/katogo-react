// src/app/components/HomePage/SuperBuyerFeatureCard.tsx
import React from 'react';
import { SuperBuyerCardData } from './SuperBuyerSection';
// No need for a separate CSS for this, we'll style within SuperBuyerSection.css

interface SuperBuyerFeatureCardProps {
  card: SuperBuyerCardData;
}

const SuperBuyerFeatureCard: React.FC<SuperBuyerFeatureCardProps> = ({ card }) => {
  return (
    <div className="superbuyer-feature-card">
      <h3 className="superbuyer-card-title">{card.title}</h3>
      <div className="superbuyer-mini-products">
        {card.products.map(product => (
          <a href={`/product/${product.id}`} key={product.id} className="superbuyer-mini-product-item">
            <div className="mini-product-image-wrapper">
              <img
                src={product.image}
                alt={`Product ${product.id}`}
                className="mini-product-image"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = "/media/svg/files/blank-image.svg";
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            <div className="mini-product-pricing">
              <span className="mini-product-price-new">UGX {product.price_new}</span>
              {product.price_old && (
                <span className="mini-product-price-old">UGX {product.price_old}</span>
              )}
            </div>
            {product.badge && <span className="mini-product-badge">{product.badge}</span>}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SuperBuyerFeatureCard;