// src/app/utils/index.ts

/**
 * Centralized utility functions
 */

import { APP_CONFIG, PRODUCT_CONFIG } from '../constants';
import type { ProductBase, ProductWithExtras } from '../types';
import Utils from '../services/Utils';

// ===================================================================
// FORMATTING UTILITIES
// ===================================================================

/**
 * Format price with currency
 */
export const formatPrice = (price: string | number, currency = APP_CONFIG.CURRENCY): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${currency} ${numPrice.toLocaleString()}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

// ===================================================================
// PRODUCT UTILITIES
// ===================================================================

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercent = (originalPrice: string, salePrice: string): number => {
  const original = parseFloat(originalPrice);
  const sale = parseFloat(salePrice);
  
  if (original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
};

/**
 * Calculate stock progress percentage
 */
export const calculateStockProgress = (itemsSold: number, totalItems: number): number => {
  if (totalItems <= 0) return 0;
  return Math.min((itemsSold / totalItems) * 100, 100);
};

/**
 * Get stock status
 */
export const getStockStatus = (progress: number): 'normal' | 'low' | 'critical' => {
  if (progress >= PRODUCT_CONFIG.CRITICAL_STOCK_PERCENTAGE) return 'critical';
  if (progress >= PRODUCT_CONFIG.LOW_STOCK_PERCENTAGE) return 'low';
  return 'normal';
};

/**
 * Check if product has discount
 */
export const hasDiscount = (product: ProductBase): boolean => {
  return calculateDiscountPercent(product.price_2, product.price_1) > 0;
};

/**
 * Get product main image with fallback
 */
export const getProductImage = (product: ProductBase): string => {
  // Use getMainImage method if available (ProductModel instances)
  if (product && 'getMainImage' in product && typeof product.getMainImage === 'function') {
    try {
      return product.getMainImage();
    } catch (error) {
    }
  }
  
  // Fallback: construct the URL manually using the same logic as ProductModel
  if (product?.feature_photo) {
    return Utils.img(product.feature_photo);
  }
  
  // Final fallback
  return PRODUCT_CONFIG.DEFAULT_IMAGE;
};

/**
 * Generate product URL
 */
export const getProductUrl = (productId: number): string => {
  return `/product/${productId}`;
};

// ===================================================================
// VALIDATION UTILITIES
// ===================================================================

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if string is not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

// ===================================================================
// ARRAY UTILITIES
// ===================================================================

/**
 * Chunk array into smaller arrays
 */
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Remove duplicates from array by key
 */
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

/**
 * Shuffle array randomly
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ===================================================================
// DOM UTILITIES
// ===================================================================

/**
 * Smooth scroll to element
 */
export const scrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

// ===================================================================
// RESPONSIVE UTILITIES
// ===================================================================

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  return window.innerWidth <= 767.98;
};

/**
 * Check if device is tablet
 */
export const isTablet = (): boolean => {
  return window.innerWidth > 767.98 && window.innerWidth <= 991.98;
};

/**
 * Check if device is desktop
 */
export const isDesktop = (): boolean => {
  return window.innerWidth > 991.98;
};

// ===================================================================
// DEBOUNCE & THROTTLE
// ===================================================================

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===================================================================
// LOCAL STORAGE UTILITIES
// ===================================================================

/**
 * Set item in localStorage with error handling
 */
export const setLocalStorage = (key: string, value: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get item from localStorage with error handling
 */
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 */
export const removeLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
};

// ===================================================================
// ERROR HANDLING
// ===================================================================

/**
 * Safe async function wrapper
 */
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  defaultValue: T
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
