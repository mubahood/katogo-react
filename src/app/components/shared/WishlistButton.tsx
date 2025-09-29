// src/app/components/shared/WishlistButton.tsx
import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Heart } from 'lucide-react';
import { AppDispatch } from '../../store/store';
import { addToWishlistAPI, removeFromWishlistAPI } from '../../store/slices/wishlistSlice';
import { CacheApiService } from '../../services/CacheApiService';
import ToastService from '../../services/ToastService';

interface WishlistButtonProps {
  productId: number;
  productName?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showToast?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  productName = 'Product',
  variant = 'icon',
  size = 'md',
  className = '',
  showToast = true
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        setIsCheckingStatus(true);
        const status = await CacheApiService.checkWishlist(productId);
        setIsInWishlist(status);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    if (productId) {
      checkWishlistStatus();
    }
  }, [productId]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();

    if (isLoading || isCheckingStatus) return;

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await dispatch(removeFromWishlistAPI(productId)).unwrap();
        setIsInWishlist(false);
        if (showToast) {
          ToastService.success(`${productName} removed from wishlist`);
        }
      } else {
        // Add to wishlist
        try {
          await dispatch(addToWishlistAPI(productId)).unwrap();
          setIsInWishlist(true);
          if (showToast) {
            ToastService.success(`${productName} added to wishlist`);
          }
        } catch (error: any) {
          if (error.message && error.message.includes('already in wishlist')) {
            setIsInWishlist(true);
            if (showToast) {
              ToastService.info(`${productName} is already in your wishlist`);
            }
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      const errorMessage = error.message || 'Failed to update wishlist';
      if (showToast) {
        ToastService.error(`Failed to update wishlist: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 24;
      case 'lg': return 40;
      default: return 32;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 20;
      default: return 16;
    }
  };

  if (variant === 'button') {
    return (
      <Button
        variant={isInWishlist ? "primary" : "outline-primary"}
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : undefined}
        onClick={handleToggleWishlist}
        disabled={isLoading || isCheckingStatus}
        className={className}
      >
        {isLoading || isCheckingStatus ? (
          <Spinner size="sm" className="me-2" />
        ) : (
          <Heart 
            size={getIconSize()} 
            className="me-2" 
            fill={isInWishlist ? "currentColor" : "none"}
          />
        )}
        {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </Button>
    );
  }

  // Icon variant
  return (
    <Button
      variant={isInWishlist ? "primary" : "outline-primary"}
      size="sm"
      className={`p-0 ${className}`}
      onClick={handleToggleWishlist}
      disabled={isLoading || isCheckingStatus}
      title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      style={{
        width: getButtonSize(),
        height: getButtonSize(),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: isInWishlist ? "none" : "1px solid currentColor"
      }}
    >
      {isLoading || isCheckingStatus ? (
        <Spinner size="sm" />
      ) : (
        <Heart 
          size={getIconSize()} 
          fill={isInWishlist ? "currentColor" : "none"}
        />
      )}
    </Button>
  );
};

export default WishlistButton;
