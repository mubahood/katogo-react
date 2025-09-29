// src/app/hooks/usePopoverPosition.ts
import { useState, useEffect, useCallback } from 'react';

interface PopoverPosition {
  left: number;
  top: number;
  arrowPosition: 'top' | 'bottom';
}

interface UsePopoverPositionProps {
  targetRect: DOMRect | null;
  popoverWidth: number;
  popoverHeight: number;
  gap?: number;
  arrowSize?: number;
}

export const usePopoverPosition = ({
  targetRect,
  popoverWidth,
  popoverHeight,
  gap = 10,
  arrowSize = 6
}: UsePopoverPositionProps): PopoverPosition | null => {
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const calculatePosition = useCallback(() => {
    if (!targetRect) {
      setPosition(null);
      return;
    }

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };

    // Calculate initial position (centered below target)
    let left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
    let top = targetRect.bottom + gap + arrowSize;
    let arrowPosition: 'top' | 'bottom' = 'top';

    // Horizontal adjustments
    const padding = 10;
    if (left < padding) {
      left = padding;
    } else if (left + popoverWidth > viewport.width - padding) {
      left = viewport.width - popoverWidth - padding;
    }

    // Vertical adjustments - flip to top if no space below
    if (top + popoverHeight > viewport.height - padding) {
      const topSpace = targetRect.top;
      const bottomSpace = viewport.height - targetRect.bottom;
      
      if (topSpace > bottomSpace && topSpace > popoverHeight + gap + arrowSize) {
        top = targetRect.top - popoverHeight - gap - arrowSize;
        arrowPosition = 'bottom';
      }
    }

    setPosition({ left, top, arrowPosition });
  }, [targetRect, popoverWidth, popoverHeight, gap, arrowSize]);

  useEffect(() => {
    calculatePosition();
    
    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [calculatePosition]);

  return position;
};

export default usePopoverPosition;