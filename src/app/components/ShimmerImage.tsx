import React, { useState, useEffect } from "react";

interface ShimmerImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  // Use these for the container dimensions as well
  width?: number | string; // Allow string like '100%'
  height?: number | string; // Allow string like '100%'
  // Loader dimensions (can differ if needed, but usually same as container)
  loaderWidth?: number;
  loaderHeight?: number;
  loaderBackgroundColor?: string;
  loaderForegroundColor?: string;
  loaderSpeed?: number;
  objectFit?: React.CSSProperties['objectFit']; // Add object-fit prop
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void; // Add onError prop
}

const ShimmerImage: React.FC<ShimmerImageProps> = ({
  src,
  alt = "",
  className,
  style = {},
  width = "100%", // Default to 100%
  height = "auto", // Default to auto or a specific aspect ratio height
  loaderWidth = 400, // Default loader internal width
  loaderHeight = 300, // Default loader internal height
  loaderBackgroundColor = "#e0e0e0",
  loaderForegroundColor = "#c0c0c0",
  loaderSpeed = 1.5,
  objectFit = "cover", // Default object-fit
  onError, // Pass onError down
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset loaded/error state if src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setImageLoading(true);
    
    // Pre-load the image to ensure it exists
    if (src) {
      const img = new Image();
      img.onload = () => {
        setImageLoading(false);
      };
      img.onerror = () => {
        setError(true);
        setImageLoading(false);
      };
      img.src = src;
    } else {
      setError(true);
      setImageLoading(false);
    }
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    setError(false); // Ensure error state is cleared on successful load
    setImageLoading(false);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    setLoaded(false); // Don't treat error as loaded
    setImageLoading(false);
    if (onError) {
      onError(event); // Propagate error event if handler is provided
    }
    console.error("Image failed to load:", src); // Log error
  };

  // Determine container dimensions
  const containerWidth = typeof width === 'number' ? `${width}px` : width;
  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  // CSS-based shimmer keyframes
  const shimmerKeyframes = `
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }
    
    @keyframes shimmerGlow {
      0% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.5;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      <div
        className={className}
        style={{
          position: "relative", // Keep relative positioning
          display: "flex", // Use flex for better centering in modal
          alignItems: "center",
          justifyContent: "center",
          width: containerWidth, // Apply width prop
          height: containerHeight, // Apply height prop
          minHeight: typeof height === 'string' && height.includes('%') ? '300px' : containerHeight, // Ensure minimum height for percentage heights
          overflow: "hidden", // Keep overflow hidden
          backgroundColor: (!loaded && !error) ? loaderBackgroundColor : 'transparent', // Background while loading
          ...style, // Allow overriding styles
        }}
      >
        {(!loaded && !error && imageLoading) && ( // Show loader only if not loaded, no error, and image is loading
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%", // Loader fills the container
                height: "100%", // Loader fills the container
                background: `linear-gradient(90deg, ${loaderBackgroundColor} 0%, ${loaderForegroundColor} 50%, ${loaderBackgroundColor} 100%)`,
                backgroundSize: "200px 100%",
                animation: `shimmer ${loaderSpeed}s ease-in-out infinite`,
                minHeight: "200px", // Ensure shimmer is visible
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: `radial-gradient(circle, ${loaderForegroundColor} 0%, transparent 70%)`,
                animation: `shimmerGlow ${loaderSpeed * 1.5}s ease-in-out infinite`,
                minHeight: "200px", // Ensure shimmer is visible
              }}
            />
          </>
        )}

        {/* Conditionally render an error placeholder if needed */}
        {error && (
           <div style={{ /* Basic error state indicator */
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#f0f0f0', color: '#888'
           }}>
              <span>Error</span>
           </div>
        )}

        {/* Render image tag only if src is valid and no error initially,
            control visibility via opacity */}
        {src && !error && (
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              display: 'block', // Prevents extra space below image
              maxWidth: "100%", // Responsive image
              maxHeight: "100%", // Responsive image
              width: "auto", // Maintain aspect ratio
              height: "auto", // Maintain aspect ratio
              objectFit: objectFit, // Use object-fit prop
              opacity: loaded ? 1 : 0, // Fade in only if loaded
              transition: "opacity 0.4s ease-in-out",
              visibility: loaded ? 'visible' : 'hidden', // Ensure it's visible once loaded
              zIndex: 1, // Ensure image is above shimmer
              margin: 'auto', // Center the image within flex container
            }}
          />
         )}
      </div>
    </>
  );
};

export default ShimmerImage;