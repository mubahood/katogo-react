// src/app/components/reviews/StarRating.tsx
import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  disabled = false,
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'star-rating-sm';
      case 'lg': return 'star-rating-lg';
      default: return 'star-rating-md';
    }
  };

  const handleStarClick = (newRating: number) => {
    if (interactive && !disabled && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      const isHalfFilled = rating > i - 1 && rating < i;
      
      stars.push(
        <span
          key={i}
          className={`star ${interactive ? 'star-interactive' : ''} ${disabled ? 'star-disabled' : ''}`}
          onClick={() => handleStarClick(i)}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive && !disabled ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleStarClick(i);
            }
          }}
        >
          {isFilled ? (
            <i className="bi bi-star-fill" />
          ) : isHalfFilled ? (
            <i className="bi bi-star-half" />
          ) : (
            <i className="bi bi-star" />
          )}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={`star-rating ${getSizeClass()}`}>
      {renderStars()}
      <style>{`
        .star-rating {
          display: inline-flex;
          gap: 2px;
          align-items: center;
        }

        .star {
          color: #ffd700;
          transition: all 0.2s ease;
        }

        .star-interactive {
          cursor: pointer;
        }

        .star-interactive:hover {
          transform: scale(1.1);
        }

        .star-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .star-rating-sm .star {
          font-size: 0.875rem;
        }

        .star-rating-md .star {
          font-size: 1rem;
        }

        .star-rating-lg .star {
          font-size: 1.25rem;
        }

        .star i {
          color: inherit;
        }
      `}</style>
    </div>
  );
};

export default StarRating;
