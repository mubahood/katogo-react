// src/app/components/shared/CustomShimmer.tsx
import React from 'react';

interface CustomShimmerProps {
  height?: number;
  width?: number | string;
  className?: string;
  rounded?: boolean;
}

const customShimmerStyles = `
  .custom-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--border-radius, 4px);
  }

  .custom-shimmer.rounded {
    border-radius: 50%;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const CustomShimmer: React.FC<CustomShimmerProps> = ({ 
  height = 220, 
  width = '100%', 
  className = '', 
  rounded = false 
}) => {
  const shimmerStyle: React.CSSProperties = {
    height: `${height}px`,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customShimmerStyles }} />
      <div 
        className={`custom-shimmer ${rounded ? 'rounded' : ''} ${className}`}
        style={shimmerStyle}
        aria-label="Loading..."
      />
    </>
  );
};

export default CustomShimmer;