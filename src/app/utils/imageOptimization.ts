// src/app/utils/imageOptimization.ts
import Utils from './imageUtils';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  placeholder?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

export interface ResponsiveImageData {
  src: string;
  srcSet: string;
  webpSrcSet?: string;
  placeholder: string;
  sizes: string;
  width?: number;
  height?: number;
}

/**
 * Enhanced image utility for modern performance optimization
 * Supports WebP format, responsive images, and optimized loading
 */
export class ImageOptimization {
  
  /**
   * Check if browser supports WebP format
   */
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Generate optimized image URL with format detection and fallbacks
   */
  static getOptimizedImageUrl(
    imagePath: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    const {
      width,
      height,
      quality = 85,
      format = 'auto'
    } = options;

    // Check if this is a frontend asset path (starts with /media or /public)
    // If so, use it directly without Utils.img() which adds backend storage path
    let optimizedUrl = (imagePath.startsWith('/media/') || imagePath.startsWith('/public/')) 
      ? imagePath 
      : Utils.img(imagePath);
    
    // For now, return the original URL as the backend doesn't support WebP conversion yet
    // This method provides the foundation for future backend integration
    return optimizedUrl;
  }

  /**
   * Generate responsive image data with multiple sizes and formats
   */
  static generateResponsiveImageData(
    imagePath: string,
    options: ImageOptimizationOptions = {}
  ): ResponsiveImageData {
    const {
      width = 800,
      height = 600,
      placeholder = '/placeholder-product.svg',
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    } = options;

    // Check if this is a frontend asset path (starts with /media or /public)
    // If so, use it directly without Utils.img() which adds backend storage path
    const baseUrl = (imagePath.startsWith('/media/') || imagePath.startsWith('/public/')) 
      ? imagePath 
      : Utils.img(imagePath);
    
    // Generate different sizes for responsive images
    const sizes_array = [
      { width: Math.round(width * 0.5), descriptor: '0.5x' },
      { width: width, descriptor: '1x' },
      { width: Math.round(width * 1.5), descriptor: '1.5x' },
      { width: Math.round(width * 2), descriptor: '2x' }
    ];

    // For now, create srcSet with original URL (future backend integration)
    const srcSet = sizes_array
      .map(size => `${baseUrl} ${size.descriptor}`)
      .join(', ');

    return {
      src: baseUrl,
      srcSet,
      placeholder,
      sizes,
      width,
      height
    };
  }

  /**
   * Generate WebP image URL with fallback
   */
  static getWebPImageUrl(imagePath: string, fallback?: string): { webp: string; fallback: string } {
    const originalUrl = Utils.img(imagePath);
    
    // For future implementation when backend supports WebP
    const webpUrl = originalUrl; // Would be: originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    
    return {
      webp: webpUrl,
      fallback: fallback || originalUrl
    };
  }

  /**
   * Create optimized image props for LazyLoadImage component
   */
  static createLazyImageProps(
    imagePath: string,
    alt: string,
    options: ImageOptimizationOptions = {}
  ) {
    const {
      width,
      height,
      placeholder = '/placeholder-product.svg',
      loading = 'lazy'
    } = options;

    const imageData = this.generateResponsiveImageData(imagePath, options);

    return {
      src: imageData.src,
      srcSet: imageData.srcSet,
      sizes: imageData.sizes,
      alt,
      loading,
      placeholderSrc: placeholder,
      effect: 'blur',
      width: width || '100%',
      height: height || 'auto',
      className: 'optimized-image',
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/media/svg/files/blank-image.svg';
      }
    };
  }

  /**
   * Preload critical images for better performance
   */
  static preloadImage(imagePath: string, options: ImageOptimizationOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${imagePath}`));
      
      // Add responsive preloading
      const imageData = this.generateResponsiveImageData(imagePath, options);
      img.src = imageData.src;
      
      if (imageData.srcSet) {
        img.srcset = imageData.srcSet;
      }
    });
  }

  /**
   * Batch preload multiple images
   */
  static async preloadImages(imagePaths: string[], options: ImageOptimizationOptions = {}): Promise<void> {
    const preloadPromises = imagePaths.map(path => 
      this.preloadImage(path, options).catch(() => {
        // Don't fail entire batch if one image fails
        console.warn(`Failed to preload image: ${path}`);
      })
    );
    
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Calculate optimal image dimensions based on container and screen density
   */
  static calculateOptimalDimensions(
    containerWidth: number,
    containerHeight: number,
    pixelRatio: number = window.devicePixelRatio || 1
  ): { width: number; height: number } {
    return {
      width: Math.round(containerWidth * pixelRatio),
      height: Math.round(containerHeight * pixelRatio)
    };
  }

  /**
   * Generate blur data URL for placeholder
   */
  static generateBlurPlaceholder(width: number = 10, height: number = 10): string {
    // Simple gradient blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmOGY5ZmEiLz48L3N2Zz4=';
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL();
  }
}

export default ImageOptimization;