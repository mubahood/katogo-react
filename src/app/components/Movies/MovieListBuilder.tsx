// src/app/components/Movies/MovieListBuilder.tsx
import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, RotateCcw } from 'react-feather';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';
import type { Movie } from '../../services/manifest.service';

interface MovieListBuilderProps {
  title: string;
  movies: Movie[] | Record<string, Movie>;
  loading?: boolean;
  error?: string | null;
  variant?: 'default' | 'large' | 'compact';
  showViewAll?: boolean;
  showProgress?: boolean;
  maxItems?: number;
  className?: string;
  onMovieClick?: (movie: Movie) => void;
  onMoviePlay?: (movie: Movie) => void;
  onAddToWatchlist?: (movie: Movie) => void;
  onViewAll?: (title: string) => void;
  onRetry?: () => void;
}

const MovieListBuilder: React.FC<MovieListBuilderProps> = ({
  title,
  movies,
  loading = false,
  error = null,
  variant = 'default',
  showViewAll = true,
  showProgress = false,
  maxItems,
  className = '',
  onMovieClick,
  onMoviePlay,
  onAddToWatchlist,
  onViewAll,
  onRetry
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Convert movies to array if it's an object, then get displayed movies
  const moviesArray = Array.isArray(movies) ? movies : Object.values(movies);
  const displayedMovies = maxItems ? moviesArray.slice(0, maxItems) : moviesArray;

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Scroll left
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = variant === 'compact' ? 160 : variant === 'large' ? 280 : 200;
    const scrollAmount = cardWidth * 3; // Scroll 3 cards at a time
    
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    
    setTimeout(updateScrollButtons, 300);
  }, [variant, updateScrollButtons]);

  // Scroll right
  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = variant === 'compact' ? 160 : variant === 'large' ? 280 : 200;
    const scrollAmount = cardWidth * 3; // Scroll 3 cards at a time
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    setTimeout(updateScrollButtons, 300);
  }, [variant, updateScrollButtons]);

  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return; // Only when no specific element is focused
      
      if (e.key === 'ArrowLeft' && canScrollLeft) {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === 'ArrowRight' && (canScrollRight || displayedMovies.length > 4)) {
        e.preventDefault();
        scrollRight();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canScrollLeft, canScrollRight, displayedMovies.length, scrollLeft, scrollRight]);

  // Handle view all click
  const handleViewAll = useCallback(() => {
    onViewAll?.(title);
  }, [title, onViewAll]);

  // Handle retry click
  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  // Show loading state
  if (loading) {
    return (
      <div className={`movie-list-builder ${className}`}>
        <div className="container-fluid">
          <div className="section-header">
            <div className="section-title-skeleton">
              <div className="skeleton-shimmer"></div>
            </div>
          </div>
          
          <div className="movie-scroll-container">
            <div className="movie-list">
              {Array.from({ length: 6 }).map((_, index) => (
                <MovieCardSkeleton key={index} variant={variant} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`movie-list-builder error-state ${className}`}>
        <div className="container-fluid">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-accent"></span>
              {title}
            </h2>
          </div>
          
          <div className="error-content">
            <div className="error-icon">📺</div>
            <h3>Unable to load {title.toLowerCase()}</h3>
            <p>{error}</p>
            {onRetry && (
              <button className="btn-retry" onClick={handleRetry}>
                <RotateCcw size={16} />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!loading && displayedMovies.length === 0) {
    return (
      <div className={`movie-list-builder empty-state ${className}`}>
        <div className="container-fluid">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-accent"></span>
              {title}
            </h2>
          </div>
          
          <div className="empty-content">
            <div className="empty-icon">🎬</div>
            <h3>No movies in {title.toLowerCase()} yet</h3>
            <p>Check back soon for new content!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`movie-list-builder ${className}`}>
        <div className="container-fluid">
          {/* Section Header */}
          <div className="section-header">
            <div className="section-title-container">
              <h2 className="section-title">
                <span className="title-accent"></span>
                {title}
              </h2>
              {displayedMovies.length > 4 && (
                <span className="scroll-instruction">
                  Swipe or scroll horizontally to browse more →
                </span>
              )}
            </div>
            
            {showViewAll && onViewAll && displayedMovies.length > 0 && (
              <button className="view-all-btn" onClick={handleViewAll}>
                <span>View All</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* Movie List Container */}
          <div className="movie-scroll-container">
            {/* Scroll Left Button */}
            {canScrollLeft && (
              <button 
                className="scroll-btn scroll-btn-left"
                onClick={scrollLeft}
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Left Scroll Hint Gradient */}
            <div className="scroll-hint scroll-hint-left" style={{ opacity: canScrollLeft ? 0 : 0.6 }}></div>
            
            {/* Right Scroll Hint Gradient */}
            <div className="scroll-hint scroll-hint-right" style={{ opacity: canScrollRight || !canScrollLeft ? 0.8 : 0 }}></div>

            {/* Movie List */}
            <div 
              ref={scrollContainerRef}
              className="movie-list"
              onScroll={updateScrollButtons}
            >
              {displayedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  variant={variant}
                  showProgress={showProgress}
                  onClick={onMovieClick}
                  onPlay={onMoviePlay}
                  onAddToWatchlist={onAddToWatchlist}
                />
              ))}
            </div>

            {/* Scroll Right Button - Show initially for sections with many movies */}
            {(canScrollRight || displayedMovies.length > 4) && (
              <button 
                className={`scroll-btn scroll-btn-right ${!canScrollRight ? 'scroll-btn-hint' : ''}`}
                onClick={scrollRight}
                aria-label="Scroll right"
                style={{ opacity: canScrollRight ? 1 : 0.7 }}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .container-fluid {
          width: 100%;
          max-width: none;
          padding: 0 60px;
          margin: 0 auto;
        }

        @media (max-width: 1400px) {
          .container-fluid {
            padding: 0 40px;
          }
        }

        @media (max-width: 1200px) {
          .container-fluid {
            padding: 0 30px;
          }
        }

        .movie-list-builder {
          margin-bottom: 48px;
          position: relative;
        }

        .movie-list-builder.empty-state,
        .movie-list-builder.error-state {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 0;
        }
        
        .section-title-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--ugflix-text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .scroll-instruction {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--ugflix-text-secondary);
          opacity: 0.8;
          animation: fadeInOut 6s ease-in-out infinite;
        }
        
        @keyframes fadeInOut {
          0%, 20%, 80%, 100% { opacity: 0.4; }
          40%, 60% { opacity: 0.8; }
        }

        .title-accent {
          width: 4px;
          height: 28px;
          background: linear-gradient(135deg, var(--ugflix-primary), var(--ugflix-secondary), var(--ugflix-accent));
          border-radius: 2px;
          flex-shrink: 0;
        }

        .section-title-skeleton {
          width: 200px;
          height: 28px;
          background: var(--ugflix-bg-tertiary);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
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

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--ugflix-text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 20px;
          transition: var(--ugflix-transition);
        }

        .view-all-btn:hover {
          color: var(--ugflix-primary);
          background: rgba(255, 107, 53, 0.1);
          transform: translateX(2px);
        }

        .movie-scroll-container {
          position: relative;
          padding: 0;
        }

        .movie-list {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 8px;
          
          /* Hide scrollbar */
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .movie-list::-webkit-scrollbar {
          display: none;
        }

        .scroll-hint {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 5;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        .scroll-hint-left {
          left: 0;
          background: linear-gradient(90deg, 
            rgba(10, 10, 10, 0.8) 0%, 
            rgba(10, 10, 10, 0.4) 50%, 
            transparent 100%);
        }
        
        .scroll-hint-right {
          right: 0;
          background: linear-gradient(-90deg, 
            rgba(10, 10, 10, 0.8) 0%, 
            rgba(10, 10, 10, 0.4) 50%, 
            transparent 100%);
        }
        
        .scroll-hint-right::after {
          content: '⟩⟩';
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--ugflix-primary);
          font-size: 18px;
          font-weight: bold;
          animation: scrollHint 2s ease-in-out infinite;
        }

        @keyframes scrollHint {
          0%, 100% { opacity: 0.3; transform: translateY(-50%) translateX(0); }
          50% { opacity: 1; transform: translateY(-50%) translateX(5px); }
        }

        .scroll-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: rgba(26, 26, 26, 0.9);
          backdrop-filter: blur(10px);
          color: var(--ugflix-text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--ugflix-transition);
          z-index: 10;
          box-shadow: var(--ugflix-shadow);
        }

        .scroll-btn:hover {
          background: rgba(255, 107, 53, 0.9);
          transform: translateY(-50%) scale(1.1);
        }
        
        .scroll-btn-hint {
          animation: pulseHint 3s ease-in-out infinite;
        }
        
        @keyframes pulseHint {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.05); box-shadow: 0 0 20px rgba(255, 107, 53, 0.3); }
        }

        .scroll-btn-left {
          left: -8px;
        }

        .scroll-btn-right {
          right: -8px;
        }

        .empty-content,
        .error-content {
          text-align: center;
          padding: 40px 20px;
          color: var(--ugflix-text-secondary);
        }

        .empty-icon,
        .error-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-content h3,
        .error-content h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--ugflix-text-primary);
          margin: 0 0 8px 0;
        }

        .empty-content p,
        .error-content p {
          font-size: 14px;
          margin: 0 0 20px 0;
          opacity: 0.8;
        }

        .btn-retry {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--ugflix-primary);
          color: var(--ugflix-text-primary);
          border: none;
          padding: 12px 20px;
          border-radius: 24px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--ugflix-transition);
        }

        .btn-retry:hover {
          background: var(--ugflix-primary-dark);
          transform: translateY(-1px);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .scroll-btn {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .container-fluid {
            padding: 0 20px;
          }

          .section-title {
            font-size: 1.3rem;
          }

          .movie-list {
            gap: 12px;
          }

          .view-all-btn {
            font-size: 13px;
            padding: 6px 10px;
          }
        }

        @media (max-width: 480px) {
          .container-fluid {
            padding: 0 16px;
          }

          .section-title {
            font-size: 1.2rem;
          }

          .title-accent {
            width: 3px;
            height: 24px;
          }

          .movie-list {
            gap: 8px;
          }

          .empty-content,
          .error-content {
            padding: 30px 15px;
          }

          .empty-icon,
          .error-icon {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default memo(MovieListBuilder);