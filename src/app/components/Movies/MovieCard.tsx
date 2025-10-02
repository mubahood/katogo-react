// src/app/components/Movies/MovieCard.tsx
import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Play, Plus, Award } from 'react-feather';
import LazyImage from './LazyImage';
import MoviePopover from './MoviePopover';
import type { Movie } from '../../services/manifest.service';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'large' | 'compact' | 'list';
  showPlayButton?: boolean;
  showAddButton?: boolean;
  showProgress?: boolean;
  className?: string;
  onClick?: (movie: Movie) => void;
  onPlay?: (movie: Movie) => void;
  onAddToWatchlist?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  variant = 'default',
  showPlayButton = true,
  showAddButton = true,
  showProgress = false,
  className = '',
  onClick,
  onPlay,
  onAddToWatchlist
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [isInHoverZone, setIsInHoverZone] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverZoneRef = useRef<boolean>(false);

  // Handle movie card click
  const handleCardClick = useCallback(() => {
    onClick?.(movie);
  }, [movie, onClick]);

  // Handle play button click
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.(movie);
  }, [movie, onPlay]);

  // Handle add to watchlist click
  const handleAddClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.(movie);
  }, [movie, onAddToWatchlist]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Handle mouse enter - enter the hover zone
  const handleMouseEnter = useCallback(() => {
    hoverZoneRef.current = true;
    setIsHovered(true);
    setIsInHoverZone(true);
    
    // Clear any existing leave timeout immediately
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    
    // Clear any existing hover timeout to prevent duplicates
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Only show popover if not already visible - 2 second delay
    if (!showPopover && cardRef.current) {
      hoverTimeoutRef.current = setTimeout(() => {
        // Double-check we're still in hover zone
        if (hoverZoneRef.current && cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          setCardRect(rect);
          setShowPopover(true);
        }
      }, 2000);
    }
  }, [showPopover]);

  // Handle mouse leave - only hide if truly leaving the hover zone
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as Element;
    
    // Check if moving to popover, backdrop, or any child of the popover
    if (relatedTarget && (
      relatedTarget.closest('.movie-popover') || 
      relatedTarget.closest('.popover-backdrop') ||
      relatedTarget.classList.contains('movie-popover') ||
      relatedTarget.classList.contains('popover-backdrop')
    )) {
      // Still in hover zone, don't hide
      return;
    }
    
    // We're leaving the hover zone
    hoverZoneRef.current = false;
    setIsHovered(false);
    setIsInHoverZone(false);
    
    // Clear hover timeout if still pending
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Hide popover with longer delay to prevent flickering
    leaveTimeoutRef.current = setTimeout(() => {
      // Only hide if we're still not in hover zone
      if (!hoverZoneRef.current) {
        setShowPopover(false);
        setCardRect(null);
      }
    }, 200);
  }, []);

  // Handle when mouse enters popover area
  const handlePopoverEnter = useCallback(() => {
    hoverZoneRef.current = true;
    setIsInHoverZone(true);
    
    // Clear any leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  // Handle when mouse leaves popover area  
  const handlePopoverLeave = useCallback(() => {
    hoverZoneRef.current = false;
    setIsInHoverZone(false);
    
    // Hide popover after delay
    leaveTimeoutRef.current = setTimeout(() => {
      if (!hoverZoneRef.current) {
        setShowPopover(false);
        setCardRect(null);
        setIsHovered(false);
      }
    }, 200);
  }, []);

  // Handle popover close (external close)
  const handlePopoverClose = useCallback(() => {
    hoverZoneRef.current = false;
    setShowPopover(false);
    setCardRect(null);
    setIsHovered(false);
    setIsInHoverZone(false);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

    // Get card dimensions for vertical movie card design
  const getCardDimensions = () => {
    const baseWidth = {
      large: 200,
      default: 180,
      compact: 160,
      list: 220
    }[variant];

    // Use 3:4 aspect ratio for classic movie poster look
    const aspectRatio = 3/4;
    const baseHeight = baseWidth / aspectRatio;

    return {
      width: baseWidth,
      height: baseHeight
    };
  };

  const { width, height } = getCardDimensions();

  // Calculate progress percentage
  const progressPercentage = showProgress && movie.views_time_count
    ? Math.min((movie.views_time_count / 100) * 100, 100)
    : 0;

  return (
    <>
      <div 
        ref={cardRef}
        className={`movie-card movie-card-${variant} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          width: `${width}px`,
          height: `${height}px`
        } as React.CSSProperties}
      >
      {/* Movie Poster Container */}
      <div className="movie-poster">
        <LazyImage
          src={movie.thumbnail_url || ''}
          alt={movie.title}
          placeholder="https://images.unsplash.com/photo-1489599808821-cb6b1e5d2ab7?w=400&h=600&fit=crop"
          className="movie-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Add to Watchlist Button */}
        <button 
          className="watchlist-btn"
          onClick={handleAddClick}
          aria-label="Add to watchlist"
        >
          <Plus size={16} />
        </button>
        
        {/* Progress Bar */}
        {showProgress && progressPercentage > 0 && (
          <div className="progress-container">
            <div 
              className="progress-bar"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        

      </div>
      
      {/* Movie Info Overlay at Bottom */}
      <div className="movie-info-overlay">
        <div className="overlay-gradient"></div>
        <div className="movie-info-content">
          <h3 className="movie-title">{movie.title}</h3>
          <div className="movie-meta">
            <span className="movie-type">{movie.type}</span>
            {movie.genre && <span className="movie-genre">{movie.genre}</span>}
          </div>
          {movie.vj && (
            <div className="movie-vj">
              <span>VJ {movie.vj}</span>
            </div>
          )}
        </div>
      </div>
    </div>

      <style>{`
        .movie-card {
          display: flex;
          flex-direction: column;
          background: #1a1a1a;
          border-radius: 0;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

                .movie-card::before {\n          content: '';\n          position: absolute;\n          top: -15px;\n          left: -15px;\n          right: -15px;\n          bottom: -15px;\n          z-index: -1;\n          pointer-events: none;\n        }


        .movie-poster {
          position: relative;
          flex: 1;
          overflow: hidden;
        }

        .movie-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .watchlist-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 5;
          backdrop-filter: blur(10px);
        }

        .watchlist-btn:hover {
          background: var(--ugflix-primary, #ff6b35);
          border-color: var(--ugflix-primary, #ff6b35);
          transform: scale(1.1);
        }

        .progress-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(0, 0, 0, 0.5);
          z-index: 3;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff6b35, #f7931e);
          transition: width 0.3s ease;
        }

        

        .movie-info-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 3;
        }

        .overlay-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 80px;
          background: linear-gradient(
            transparent 0%,
            rgba(0, 0, 0, 0.5) 40%,
            rgba(0, 0, 0, 0.85) 100%
          );
        }

        .movie-info-content {
          position: relative;
          padding: 10px 12px;
          z-index: 4;
        }

        .movie-title {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px 0;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        }

        .movie-meta {
          display: flex;
          gap: 6px;
          margin-bottom: 2px;
          font-size: 10px;
        }

        .movie-type {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          padding: 2px 6px;
          border-radius: 0;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 9px;
        }

        .movie-genre {
          color: #f0f0f0;
          text-transform: capitalize;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        }

        .movie-vj {
          font-size: 9px;
          color: #ddd;
          margin-top: 1px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        }

        .movie-vj span {
          color: #ff6b35;
          font-weight: 500;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .movie-title {
            font-size: 13px;
          }
          
          .movie-meta {
            font-size: 10px;
          }
          
          .action-btn {
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 480px) {
          .movie-info {
            padding: 10px;
          }
          
          .movie-title {
            font-size: 12px;
          }
        }
      `}</style>
      
      {/* Movie Popover */}
      <MoviePopover 
        movie={movie}
        isVisible={showPopover}
        targetRect={cardRect}
        onClose={handlePopoverClose}
        onPlay={onPlay}
        onAddToWatchlist={onAddToWatchlist}
        onMouseEnter={handlePopoverEnter}
        onMouseLeave={handlePopoverLeave}
      />
    </>
  );
};

export default memo(MovieCard);