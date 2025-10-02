// src/app/components/Movies/WishlistButton.tsx
import React, { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import './WishlistButton.css';

interface WishlistButtonProps {
  movieId: number;
  initialWishlisted?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'icon-text' | 'text';
  className?: string;
  onToggle?: (wishlisted: boolean, wishlistCount: number) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  movieId,
  initialWishlisted = false,
  size = 'medium',
  variant = 'icon',
  className = '',
  onToggle,
  onClick
}) => {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Call parent onClick if provided
    onClick?.(e);
    
    if (isLoading) return;
    
    // Optimistic update
    const previousWishlisted = wishlisted;
    setWishlisted(!wishlisted);
    setIsLoading(true);
    
    try {
      const result = await ApiService.toggleMovieWishlist(movieId);
      
      // Update with server response
      setWishlisted(result.wishlisted);
      
      // Notify parent component
      onToggle?.(result.wishlisted, result.wishlist_count);
      
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      
      // Revert optimistic update on error
      setWishlisted(previousWishlisted);
      
      // Error toast is already shown by ApiService
    } finally {
      setIsLoading(false);
    }
  }, [movieId, wishlisted, isLoading, onToggle, onClick]);

  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <button
      className={`wishlist-button wishlist-button-${size} wishlist-button-${variant} ${wishlisted ? 'active' : ''} ${isLoading ? 'loading' : ''} ${className}`}
      onClick={handleClick}
      disabled={isLoading}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Star 
        size={iconSize} 
        fill={wishlisted ? 'currentColor' : 'none'}
        className="wishlist-icon"
      />
      {variant === 'icon-text' && (
        <span className="wishlist-text">
          {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
      {variant === 'text' && (
        <span className="wishlist-text">
          {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
