// src/app/components/shared/CartBadge.tsx
import React from 'react';
import { useCart } from '../../hooks/useCart';
import './CartBadge.css';

interface CartBadgeProps {
  className?: string;
  showCount?: boolean;
}

const CartBadge: React.FC<CartBadgeProps> = ({ 
  className = "", 
  showCount = true 
}) => {
  const { cartCount } = useCart();

  if (!showCount && cartCount === 0) {
    return null;
  }

  return (
    <span className={`cart-badge ${className} ${cartCount > 0 ? 'has-items' : ''}`}>
      {showCount ? cartCount : ''}
    </span>
  );
};

export default CartBadge;
