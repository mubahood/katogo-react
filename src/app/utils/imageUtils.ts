// src/app/utils/imageUtils.ts

import { API_CONFIG } from '../constants';

/**
 * Image utility functions for handling product and category images
 * Based on the Flutter implementation's Utils.img() and Utils.getImageUrl() methods
 */

/**
 * Get the full image URL for a given image path
 * Equivalent to Flutter's Utils.img() and Utils.getImageUrl()
 */
export const getImageUrl = (img: string | null | undefined): string => {
  let img0 = "logo.png"; // Default fallback image
  
  if (img != null && img !== undefined) {
    const imgStr = img.toString();
    if (imgStr.length > 0) {
      img0 = imgStr;
    }
  }
  
  // If the image path starts with 'media/', it's from the public directory
  if (img0.startsWith('media/')) {
    return `/${img0}`; // Serve from public directory
  }
  
  // Remove /images prefix if present (similar to Flutter implementation)
  img0 = img0.replace('/images', '');
  
  // Construct full URL for storage images
  return `${API_CONFIG.BASE_URL}/storage/${img0}`;
};

/**
 * Get image URL specifically for product images
 */
export const getProductImageUrl = (img: string | null | undefined): string => {
  return getImageUrl(img);
};

/**
 * Get image URL specifically for category images
 */
export const getCategoryImageUrl = (img: string | null | undefined): string => {
  return getImageUrl(img);
};

/**
 * Get image URL specifically for banner images
 */
export const getBannerImageUrl = (img: string | null | undefined): string => {
  return getImageUrl(img);
};

/**
 * Get image URL specifically for vendor images
 */
export const getVendorImageUrl = (img: string | null | undefined): string => {
  return getImageUrl(img);
};

/**
 * Get a fallback image URL for when images fail to load
 */
export const getFallbackImageUrl = (): string => {
  return `${API_CONFIG.BASE_URL}/storage/default.png`;
};

/**
 * Check if an image URL is valid (not empty or null)
 */
export const isValidImageUrl = (img: string | null | undefined): boolean => {
  if (!img || img.length === 0) return false;
  if (img === 'null' || img === 'undefined') return false;
  return true;
};

/**
 * Get optimized image URL with size parameters if supported
 */
export const getOptimizedImageUrl = (
  img: string | null | undefined, 
  width?: number, 
  height?: number
): string => {
  const baseUrl = getImageUrl(img);
  
  // Add size parameters if provided (for future optimization)
  if (width && height) {
    return `${baseUrl}?w=${width}&h=${height}&fit=crop`;
  } else if (width) {
    return `${baseUrl}?w=${width}`;
  } else if (height) {
    return `${baseUrl}?h=${height}`;
  }
  
  return baseUrl;
};

// Export a shorthand function similar to Flutter's Utils.img()
export const img = getImageUrl;

export default {
  getImageUrl,
  getProductImageUrl,
  getCategoryImageUrl,
  getBannerImageUrl,
  getVendorImageUrl,
  getFallbackImageUrl,
  isValidImageUrl,
  getOptimizedImageUrl,
  img
};
