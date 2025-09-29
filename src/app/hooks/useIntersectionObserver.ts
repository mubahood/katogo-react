// src/app/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
}

interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
  ref: RefObject<HTMLDivElement>;
}

/**
 * Custom hook for Intersection Observer API
 * Provides efficient lazy loading and viewport detection
 * 
 * @param options - Intersection Observer configuration
 * @returns Object with intersection state and ref
 */
export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '50px',
    triggerOnce = true,
    skip = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    
    // Skip if disabled or no element
    if (skip || !element) return;

    // Check if browser supports Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // Fallback: assume visible for older browsers
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setEntry(entry);
        
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          
          // If triggerOnce is true, stop observing after first intersection
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          // Allow re-triggering if triggerOnce is false
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce, skip]);

  return {
    isIntersecting,
    entry,
    ref: elementRef
  };
};

/**
 * Hook for lazy loading components when they enter viewport
 * Simplified version focused on component lazy loading
 */
export const useLazyLoad = (
  threshold: number = 0.1,
  rootMargin: string = '100px'
): UseIntersectionObserverReturn => {
  return useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });
};

/**
 * Hook for infinite scroll implementations
 * Triggers when element is near the viewport
 */
export const useInfiniteScroll = (
  onLoadMore: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
    disabled?: boolean;
  } = {}
): RefObject<HTMLDivElement> => {
  const { threshold = 1.0, rootMargin = '100px', disabled = false } = options;
  
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: false,
    skip: disabled
  });

  useEffect(() => {
    if (isIntersecting && !disabled) {
      onLoadMore();
    }
  }, [isIntersecting, onLoadMore, disabled]);

  return ref;
};

export default useIntersectionObserver;