// src/app/components/Movies/MovieCardSkeleton.tsx
import React, { memo } from 'react';

interface MovieCardSkeletonProps {
  variant?: 'default' | 'large' | 'compact' | 'list';
  className?: string;
}

const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({
  variant = 'default',
  className = ''
}) => {
  // Get card dimensions based on variant
  const getCardDimensions = () => {
    switch (variant) {
      case 'large':
        return { width: '280px', height: '420px' };
      case 'compact':
        return { width: '160px', height: '240px' };
      case 'list':
        return { width: '100%', height: '180px' };
      default:
        return { width: '200px', height: '300px' };
    }
  };

  const dimensions = getCardDimensions();
  const isListVariant = variant === 'list';

  return (
    <>
      <div 
        className={`movie-card-skeleton movie-card-skeleton-${variant} ${className}`}
        style={isListVariant ? {} : dimensions}
      >
        {/* Thumbnail Skeleton */}
        <div className="skeleton-thumbnail">
          <div className="skeleton-shimmer"></div>
        </div>

        {/* Info Skeleton */}
        <div className="skeleton-info">
          <div className="skeleton-title">
            <div className="skeleton-shimmer"></div>
          </div>
          <div className="skeleton-meta">
            <div className="skeleton-shimmer"></div>
          </div>
          {isListVariant && (
            <>
              <div className="skeleton-description">
                <div className="skeleton-shimmer"></div>
              </div>
              <div className="skeleton-description-short">
                <div className="skeleton-shimmer"></div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .movie-card-skeleton {
          position: relative;
          background: var(--ugflix-bg-card);
          border-radius: var(--ugflix-border-radius);
          overflow: hidden;
          flex-shrink: 0;
          animation: pulse 1.5s ease-in-out infinite alternate;
        }

        .movie-card-skeleton-list {
          display: flex;
          flex-direction: row;
          height: 180px;
          width: 100%;
        }

        .movie-card-skeleton-list .skeleton-thumbnail {
          width: 120px;
          flex-shrink: 0;
        }

        .movie-card-skeleton-list .skeleton-info {
          flex: 1;
          padding: 16px;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        .skeleton-thumbnail {
          position: relative;
          width: 100%;
          height: 70%;
          background: var(--ugflix-bg-tertiary);
          overflow: hidden;
        }

        .movie-card-skeleton-list .skeleton-thumbnail {
          height: 100%;
        }

        .skeleton-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .skeleton-info {
          padding: 12px;
          height: 30%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .movie-card-skeleton-list .skeleton-info {
          height: auto;
          padding: 16px;
          gap: 12px;
        }

        .skeleton-title {
          position: relative;
          height: 16px;
          background: var(--ugflix-bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .movie-card-skeleton-large .skeleton-title {
          height: 18px;
        }

        .movie-card-skeleton-compact .skeleton-title {
          height: 14px;
        }

        .movie-card-skeleton-list .skeleton-title {
          height: 18px;
        }

        .skeleton-meta {
          position: relative;
          height: 12px;
          width: 70%;
          background: var(--ugflix-bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .movie-card-skeleton-list .skeleton-meta {
          height: 14px;
          width: 60%;
        }

        .skeleton-description {
          position: relative;
          height: 12px;
          width: 100%;
          background: var(--ugflix-bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .skeleton-description-short {
          position: relative;
          height: 12px;
          width: 80%;
          background: var(--ugflix-bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        /* Compact variant adjustments */
        .movie-card-skeleton-compact .skeleton-info {
          padding: 8px;
          gap: 6px;
        }

        .movie-card-skeleton-compact .skeleton-meta {
          height: 10px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .movie-card-skeleton-default {
            width: 160px;
            height: 240px;
          }

          .movie-card-skeleton-large {
            width: 200px;
            height: 300px;
          }
        }

        @media (max-width: 480px) {
          .movie-card-skeleton-default {
            width: 140px;
            height: 210px;
          }

          .movie-card-skeleton-large {
            width: 180px;
            height: 270px;
          }

          .movie-card-skeleton-list {
            height: 160px;
          }

          .movie-card-skeleton-list .skeleton-thumbnail {
            width: 100px;
          }
        }
      `}</style>
    </>
  );
};

export default memo(MovieCardSkeleton);