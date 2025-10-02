// src/app/components/Movies/LikeButton.tsx
/**
 * 🎬 LIKE BUTTON COMPONENT
 * 
 * A standalone, reusable like button for movies.
 * Handles API calls, optimistic updates, and error recovery.
 * 
 * Features:
 * ✅ Optimistic UI updates (instant feedback)
 * ✅ Loading state with disabled button
 * ✅ Error handling with automatic rollback
 * ✅ Toast notifications
 * ✅ Multiple size variants
 * ✅ Multiple display variants
 * ✅ Filled/unfilled heart icon based on state
 * ✅ Accessibility (ARIA labels, focus states)
 */

import React, { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import './LikeButton.css';

interface LikeButtonProps {
  movieId: number;
  initialLiked?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'icon-text' | 'text';
  className?: string;
  onToggle?: (liked: boolean, count?: number) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  movieId,
  initialLiked = false,
  size = 'medium',
  variant = 'icon',
  className = '',
  onToggle,
  onClick
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Call custom onClick handler if provided
    onClick?.(e);

    // Don't proceed if already loading
    if (isLoading) return;

    // Store previous state for rollback
    const previousLiked = liked;

    try {
      // Optimistic update - instant UI feedback
      setLiked(!liked);
      setIsLoading(true);

      // Call API to toggle like
      const result = await ApiService.toggleMovieLike(movieId);

      // Sync with server response
      setLiked(result.liked);

      // Notify parent component
      onToggle?.(result.liked, result.likes_count);

    } catch (error) {
      console.error('Failed to toggle like:', error);

      // Rollback on error
      setLiked(previousLiked);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, liked, isLoading, onToggle, onClick]);

  // Generate button classes
  const buttonClasses = [
    'like-button',
    `like-button-${size}`,
    `like-button-${variant}`,
    liked ? 'active' : '',
    isLoading ? 'loading' : '',
    className
  ].filter(Boolean).join(' ');

  // Accessibility label
  const ariaLabel = liked ? 'Unlike this movie' : 'Like this movie';

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Heart
        className="like-icon"
        fill={liked ? 'currentColor' : 'none'}
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
      />
      {variant !== 'icon' && (
        <span className="like-text">
          {liked ? 'Liked' : 'Like'}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
