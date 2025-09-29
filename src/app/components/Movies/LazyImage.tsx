// src/app/components/Movies/LazyImage.tsx
import React, { useState, useCallback, memo } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  width,
  height,
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Use intersection observer to load image when in view
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  // Load image when intersecting
  React.useEffect(() => {
    if (isIntersecting && !imageSrc && !imageError) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, imageSrc, imageError]);

  // Handle successful image load
  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error with fallback
  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
    
    // Set fallback image
    const fallbackImage = placeholder || 'https://images.unsplash.com/photo-1489599808821-cb6b1e5d2ab7?w=400&h=600&fit=crop';
    if (imageSrc !== fallbackImage) {
      setImageSrc(fallbackImage);
      setImageError(false);
    } else {
      onError?.();
    }
  }, [placeholder, imageSrc, onError]);

  return (
    <div ref={intersectionRef} className={`lazy-image-container ${className}`}>
      {/* Show skeleton while loading */}
      {!imageLoaded && (
        <div className="lazy-image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
      
      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`lazy-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
      
      <style>{`
        .lazy-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .lazy-image-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--ugflix-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skeleton-shimmer {
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
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .lazy-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
          opacity: 0;
        }

        .lazy-image.loaded {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default memo(LazyImage);