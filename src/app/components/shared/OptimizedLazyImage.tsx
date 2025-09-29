// src/app/components/shared/OptimizedLazyImage.tsx
import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import ImageOptimization, { ImageOptimizationOptions } from '../../utils/imageOptimization';

interface OptimizedLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  options?: ImageOptimizationOptions;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * High-performance optimized lazy loading image component
 * Features:
 * - WebP format support with fallbacks
 * - Responsive image sizes
 * - Progressive loading with blur effect
 * - Automatic format detection
 * - Error handling with fallbacks
 */
const OptimizedLazyImage: React.FC<OptimizedLazyImageProps> = ({
  src,
  alt,
  className = '',
  width = '100%',
  height = 'auto',
  options = {},
  style,
  onClick,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  // Check WebP support on component mount
  useEffect(() => {
    ImageOptimization.supportsWebP().then(setSupportsWebP);
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Try fallback image
    e.currentTarget.src = '/media/svg/files/blank-image.svg';
    onError?.(e);
  };

  // Generate optimized image props
  const imageProps = ImageOptimization.createLazyImageProps(src, alt, {
    ...options,
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined
  });

  // Override with custom handlers and fix types
  const finalProps = {
    ...imageProps,
    effect: 'blur' as const, // Fix TypeScript typing for effect
    className: `optimized-lazy-image ${className} ${isLoaded ? 'loaded' : 'loading'}`,
    style,
    width,
    height,
    onClick,
    onLoad: handleLoad,
    onError: handleError
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .optimized-lazy-image {
            transition: opacity 0.3s ease, filter 0.3s ease;
          }
          
          .optimized-lazy-image.loading {
            filter: blur(5px);
            opacity: 0.8;
          }
          
          .optimized-lazy-image.loaded {
            filter: none;
            opacity: 1;
          }
          
          .optimized-lazy-image:hover {
            transition: transform 0.3s ease;
          }
        `
      }} />
      <LazyLoadImage {...finalProps} />
    </>
  );
};

export default React.memo(OptimizedLazyImage);