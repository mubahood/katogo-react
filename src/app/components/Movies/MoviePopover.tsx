// src/app/components/Movies/MoviePopover.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Plus, Clock, Star, Eye } from 'react-feather';
import type { Movie } from '../../services/manifest.service';

interface MoviePopoverProps {
  movie: Movie;
  isVisible: boolean;
  targetRect: DOMRect | null;
  onClose: () => void;
  onPlay?: (movie: Movie) => void;
  onAddToWatchlist?: (movie: Movie) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const MoviePopover: React.FC<MoviePopoverProps> = ({
  movie,
  isVisible,
  targetRect,
  onClose,
  onPlay,
  onAddToWatchlist,
  onMouseEnter,
  onMouseLeave
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Sound enabled by default
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Start video at 10% when visible
  useEffect(() => {
    if (isVisible && movie.url && videoRef.current) {
      const video = videoRef.current;
      setIsLoading(true);
      setHasError(false);

      const handleLoadedData = () => {
        if (video.duration) {
          video.currentTime = video.duration * 0.1; // Start at 10%
          video.muted = isMuted; // Apply mute state
          video.volume = isMuted ? 0 : 0.3; // Lower volume for preview
          video.play().then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          }).catch(() => {
            setHasError(true);
            setIsLoading(false);
          });
        }
      };

      const handleError = () => {
        setHasError(true);
        setIsLoading(false);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      video.load();

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.pause();
        setIsPlaying(false);
      };
    }
  }, [isVisible, movie.url]);

  // Calculate popover position with callout pointer
  const getPopoverStyle = () => {
    if (!targetRect) return { 
      opacity: 0, 
      transform: 'scale(0.9)',
      '--pointer-left': '50%'
    };

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
    
    // Smaller popover on mobile
    const popoverWidth = isMobile ? Math.min(280, window.innerWidth - 40) : isTablet ? 300 : 320;
    const popoverHeight = isMobile ? 180 : isTablet ? 200 : 220;
    const gap = isMobile ? 8 : 12; // Gap for callout pointer
    const margin = isMobile ? 10 : 20;

    // Try to position to the right of the card on desktop
    let left, top;
    let showPointerBelow = false;
    let showPointerOnSide = false;

    if (!isMobile) {
      // Desktop: Try to position to the right first, then left, then above/below
      const rightSpace = window.innerWidth - targetRect.right;
      const leftSpace = targetRect.left;
      
      if (rightSpace > popoverWidth + margin) {
        // Position to the right
        left = targetRect.right + gap;
        top = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
        showPointerOnSide = true;
      } else if (leftSpace > popoverWidth + margin) {
        // Position to the left
        left = targetRect.left - popoverWidth - gap;
        top = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
        showPointerOnSide = true;
      } else {
        // Position above or below
        left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
        if (targetRect.top > popoverHeight + gap + margin) {
          top = targetRect.top - popoverHeight - gap;
          showPointerBelow = true;
        } else {
          top = targetRect.bottom + gap;
          showPointerBelow = false;
        }
      }
    } else {
      // Mobile: Always position near the card, centered horizontally
      left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
      
      // Check if we have more space above or below
      const spaceAbove = targetRect.top;
      const spaceBelow = window.innerHeight - targetRect.bottom;
      
      if (spaceAbove > popoverHeight + gap && spaceAbove > spaceBelow) {
        // Position above
        top = targetRect.top - popoverHeight - gap;
        showPointerBelow = true;
      } else {
        // Position below
        top = targetRect.bottom + gap;
        showPointerBelow = false;
      }
    }
    
    // Adjust horizontal position if needed
    if (left < margin) {
      left = margin;
    }
    if (left + popoverWidth > window.innerWidth - margin) {
      left = window.innerWidth - popoverWidth - margin;
    }
    
    // Adjust vertical position if needed
    if (top < margin) {
      top = margin;
    }
    if (top + popoverHeight > window.innerHeight - margin) {
      top = window.innerHeight - popoverHeight - margin;
    }
    
    // Calculate pointer position relative to popover
    const cardCenter = targetRect.left + (targetRect.width / 2);
    const popoverLeft = left;
    const pointerLeft = ((cardCenter - popoverLeft) / popoverWidth) * 100;

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${popoverWidth}px`,
      height: `${popoverHeight}px`,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'scale(1)' : 'scale(0.9)',
      '--pointer-left': `${Math.max(10, Math.min(90, pointerLeft))}%`,
      '--show-pointer-below': showPointerBelow ? '1' : '0',
      '--show-pointer-side': showPointerOnSide ? '1' : '0'
    } as React.CSSProperties;
  };

  // Handle play/pause toggle
  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  // Handle mute toggle
  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Handle main play button
  const handleMainPlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.(movie);
    onClose();
  }, [movie, onPlay, onClose]);

  // Handle add to watchlist
  const handleAddToWatchlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.(movie);
  }, [movie, onAddToWatchlist]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="popover-backdrop"
        onClick={onClose}
        onMouseEnter={(e) => {
          e.stopPropagation();
          onMouseEnter?.();
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          onMouseLeave?.();
        }}
      />
      
      {/* Popover */}
      <div
        ref={popoverRef}
        className="movie-popover"
        style={getPopoverStyle()}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={(e) => {
          e.stopPropagation();
          onMouseEnter?.();
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          onMouseLeave?.();
        }}
      >
        {/* Callout Pointer */}
        <div className="popover-pointer"></div>
        {/* Arrow pointing to the card */}
        
        
        {/* Video Preview Only */}
        <div className="popover-media">
          {movie.url && !hasError ? (
            <video
              ref={videoRef}
              className="popover-video"
              muted={isMuted}
              loop
              playsInline
              poster={movie.thumbnail_url}
            >
              <source src={movie.url} type="video/mp4" />
            </video>
          ) : (
            <img 
              src={movie.thumbnail_url || ''} 
              alt={movie.title}
              className="popover-image"
            />
          )}
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          
          {/* Control buttons on top of video */}
          <div className="control-overlay">
            <button 
              className="control-btn play-btn"
              onClick={handleMainPlay}
              aria-label={`Play ${movie.title}`}
            >
              <Play size={20} fill="currentColor" />
            </button>
            
            <button 
              className="control-btn add-btn"
              onClick={handleAddToWatchlist}
              aria-label={`Add ${movie.title} to watchlist`}
            >
              <Plus size={18} />
            </button>
            
            {movie.url && !hasError && (
              <button 
                className="control-btn mute-btn"
                onClick={handleMuteToggle}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .popover-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999;
          background: transparent;
        }

        .movie-popover {
          position: fixed;
          width: 320px;
          height: 220px;
          background: #111;
          border-radius: 0;
          border: 1px solid rgba(255, 107, 53, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          z-index: 1000;
          overflow: hidden;
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: auto;
        }

                .popover-pointer {\n          position: absolute;\n          bottom: -8px;\n          left: var(--pointer-left, 50%);\n          transform: translateX(-50%);\n          width: 0;\n          height: 0;\n          border-left: 8px solid transparent;\n          border-right: 8px solid transparent;\n          border-top: 8px solid #111;\n          opacity: var(--show-pointer-below, 1);\n          z-index: 1001;\n        }\n\n        .popover-pointer::before {\n          content: '';\n          position: absolute;\n          top: -9px;\n          left: -9px;\n          width: 0;\n          height: 0;\n          border-left: 9px solid transparent;\n          border-right: 9px solid transparent;\n          border-top: 9px solid rgba(255, 107, 53, 0.3);\n          z-index: 1000;\n        }

        

        .popover-media {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .popover-video,
        .popover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ff6b35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .control-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .movie-popover:hover .control-overlay {
          opacity: 1;
        }

        .control-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .play-btn {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .add-btn {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }

        .mute-btn {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .control-btn:hover {
          transform: translateY(-1px);
        }

        .play-btn:hover {
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
          background: linear-gradient(135deg, #f7931e, #ff6b35);
        }

        .add-btn:hover {
          background: white;
          transform: translateY(-2px);
        }

        .mute-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        /* Removed content styles - only video preview now */

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .movie-popover {
            width: calc(100vw - 20px);
            max-width: 320px;
          }
        }
      `}</style>
    </>
  );
};

export default MoviePopover;