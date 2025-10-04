// src/app/services/CacheApiService.ts
/**
 * CacheApiService - Cache-first wrapper for existing ApiService
 * 
 * This service     try {
      // Re-enable caching with proper error handling      
      // For products, we'll be selective about caching
      // Only cache simple queries without complex parameters
      const isSimpleQuery = !params.search && !params.min_price && !params.max_price && 
                            (params.page || 1) === 1 && !params.sort_by;e existing ApiService with cache-first logic.
 * It's designed to be a drop-in replacement that:
 * 1. Checks cache first
 * 2. Falls back to existing ApiService methods
 * 3. Caches the results for future use
 * 4. Maintains 100% backward compatibility
 * 
 * SAFETY: All existing ApiService functionality remains unchanged
 */

import ApiService from './ApiService';
import { CacheUtils } from './CacheUtils';
import { CacheKey } from './CacheService';
import ProductModel, { PaginatedResponse } from '../models/ProductModel';
import CategoryModel from '../models/CategoryModel';
import VendorModel from '../models/VendorModel';
import { DEBUG_CONFIG } from '../constants';

/**
 * Cache-enhanced API service with fallback to original ApiService
 */
export class CacheApiService {
  
  // ===== CATEGORIES =====
  
  /**
   * Get all categories with cache-first strategy
   * Falls back to ApiService.getCategories() if cache miss
   */
  static async getCategories(): Promise<CategoryModel[]> {
    return CacheUtils.getWithFallback(
      'CATEGORIES',
      () => ApiService.getCategories(),
      {
        storageType: 'localStorage',
        validateData: CacheUtils.validators.categories
      }
    );
  }

  /**
   * Get banner categories with cache-first strategy
   */
  static async getBannerCategories(): Promise<CategoryModel[]> {
    return CacheUtils.getWithFallback(
      'BANNER_CATEGORIES',
      () => ApiService.getBannerCategories(),
      {
        storageType: 'localStorage',
        validateData: CacheUtils.validators.categories
      }
    );
  }

  /**
   * Get navigation categories with cache-first strategy
   */
  static async getNavigationCategories(): Promise<CategoryModel[]> {
    return CacheUtils.getWithFallback(
      'CATEGORIES', // Reuse same cache key as getCategories
      async () => {
        const allCategories = await ApiService.getCategories();
        return allCategories.filter(cat => cat.isShownInCategories() && !cat.isParentCategory());
      },
      {
        storageType: 'localStorage',
        validateData: CacheUtils.validators.categories
      }
    );
  }

  /**
   * Get single category by ID (with cache)
   */
  static async getCategory(id: number): Promise<CategoryModel> {
    // For single categories, we'll use the existing method directly
    // but trigger a background refresh of all categories
    const result = await ApiService.getCategory(id);
    
    // Background refresh of categories cache
    CacheUtils.refreshInBackground(
      'CATEGORIES',
      () => ApiService.getCategories(),
      {
        storageType: 'localStorage'
      }
    );

    return result;
  }

  // ===== MANIFEST =====
  
  /**
   * Get application manifest with cache-first strategy
   */
  static async getManifest(): Promise<any> {
    return CacheUtils.getWithFallback(
      'MANIFEST',
      () => ApiService.getManifest(),
      {
        storageType: 'localStorage',
        validateData: CacheUtils.validators.manifest
      }
    );
  }

  // ===== PRODUCTS =====
  
  /**
   * Get paginated products with smart caching
   * Note: We cache based on parameters for better hit rates
   */
  static async getProducts(params: {
    page?: number;
    category?: number;
    search?: string;
    vendor?: number;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: 'name' | 'price_1' | 'date_added' | 'metric';
    sort_order?: 'asc' | 'desc';
    limit?: number;
  } = {}): Promise<PaginatedResponse<ProductModel>> {
    try {
      // Re-enable caching with proper error handling
      if (DEBUG_CONFIG.ENABLE_API_LOGS) {
        console.log('� CacheApiService.getProducts: Processing request with caching', params);
      }
      
      // For products, we'll be selective about caching
      // Only cache simple queries without complex parameters
      const isSimpleQuery = !params.search && !params.min_price && !params.max_price && 
                            (params.page || 1) === 1 && !params.sort_by;

      if (isSimpleQuery && params.category) {
        // Cache products by category
        return CacheUtils.getWithFallback(
          'PRODUCTS',
          () => ApiService.getProducts(params),
          {
            storageType: 'sessionStorage', // Use session storage for product lists
            customDuration: 2 * 60 * 60 * 1000, // 2 hours
            validateData: (data) => data && Array.isArray(data.data)
          }
        );
      }

      // For complex queries, go direct to API (no caching)
      return ApiService.getProducts(params);
    } catch (error) {
      console.error('❌ CacheApiService.getProducts: Error occurred:', error);
      // Fallback to direct API call if caching fails
      return ApiService.getProducts(params);
    }
  }

  /**
   * Get products by category with cache
   */
  static async getProductsByCategory(
    categoryId: number,
    page = 1,
    additionalParams: Record<string, any> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    // Only cache first page without additional params
    if (page === 1 && Object.keys(additionalParams).length === 0) {
      return CacheUtils.getWithFallback(
        'PRODUCTS',
        () => ApiService.getProductsByCategory(categoryId, page, additionalParams),
        {
          storageType: 'sessionStorage',
          customDuration: 2 * 60 * 60 * 1000, // 2 hours
          validateData: (data) => data && Array.isArray(data.data)
        }
      );
    }

    // For other pages/params, go direct to API
    return ApiService.getProductsByCategory(categoryId, page, additionalParams);
  }

  /**
   * Get single product with cache
   */
  static async getProduct(id: number): Promise<ProductModel> {
    // For product details, bypass the predefined cache system since we need unique cache per product ID
    // Use direct API call to ensure each product loads correctly
    try {
      const result = await ApiService.getProduct(id);
      return result;
    } catch (error) {
      console.error('❌ CacheApiService: Error getting product:', error);
      throw error;
    }
  }

  /**
   * Search products (no caching for search - too dynamic)
   */
  static async searchProducts(
    searchTerm: string,
    page = 1,
    additionalParams: Record<string, any> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    // Search results are too dynamic to cache effectively
    return ApiService.searchProducts(searchTerm, page, additionalParams);
  }

  // ===== VENDORS =====
  // Note: Vendor endpoints currently disabled - not available in streaming API
  
  /**
   * Get all vendors with cache
   * Currently disabled - endpoint not available
   */
  static async getVendors(): Promise<VendorModel[]> {
    // Return empty array since vendors endpoint is not available
    console.warn('Vendors endpoint is not available in streaming platform API');
    return [];
  }

  /**
   * Get active vendors with cache
   * Currently disabled - endpoint not available  
   */
  static async getActiveVendors(): Promise<VendorModel[]> {
    // Return empty array since vendors endpoint is not available
    console.warn('Active vendors endpoint is not available in streaming platform API');
    return [];
  }  /**
   * Get single vendor (no caching for individual items)
   */
  static async getVendor(id: number): Promise<VendorModel> {
    return ApiService.getVendor(id);
  }

  // ===== METHODS THAT SHOULD NOT BE CACHED =====
  
  /**
   * Live search - too dynamic for caching
   */
  static async liveSearch(query: string, limit = 10): Promise<{
    products: ProductModel[];
    suggestions: string[];
    total: number;
    search_term: string;
  }> {
    return ApiService.liveSearch(query, limit);
  }

  /**
   * Cart operations - should not be cached
   */
  static async addToCart(productId: number, quantity = 1, variant?: Record<string, string>): Promise<boolean> {
    return ApiService.addToCart(productId, quantity, variant);
  }

  static async getCartItems(): Promise<Array<{
    product: ProductModel;
    quantity: number;
    variant: Record<string, string>;
  }>> {
    return ApiService.getCartItems();
  }

  static async updateCartItem(productId: number, quantity: number, variant?: Record<string, string>): Promise<boolean> {
    return ApiService.updateCartItem(productId, quantity, variant);
  }

  static async removeFromCart(productId: number, variant?: Record<string, string>): Promise<boolean> {
    return ApiService.removeFromCart(productId, variant);
  }

  static async clearCart(): Promise<boolean> {
    return ApiService.clearCart();
  }

  /**
   * Wishlist operations - should not be cached
   */
  static async addToWishlist(productId: number): Promise<boolean> {
    return ApiService.addToWishlist(productId);
  }

  static async removeFromWishlist(productId: number): Promise<boolean> {
    return ApiService.removeFromWishlist(productId);
  }

  static async getWishlist(): Promise<any[]> {
    return ApiService.getWishlist();
  }

  static async checkWishlist(productId: number): Promise<boolean> {
    return ApiService.checkWishlist(productId);
  }

  /**
   * Order operations - should not be cached
   */
  static async getUserOrders(page = 1): Promise<any> {
    return ApiService.getUserOrders(page);
  }

  static async getOrder(id: number): Promise<any> {
    return ApiService.getOrder(id);
  }

  static async createOrder(orderData: {
    products: Array<{
      id: number;
      quantity: number;
      price: number;
    }>;
    shipping_address: string;
    payment_method: string;
    total_amount: number;
  }): Promise<any> {
    return ApiService.createOrder(orderData);
  }

  static async updateOrderStatus(orderId: number, status: string): Promise<any> {
    return ApiService.updateOrderStatus(orderId, status);
  }

  /**
   * Review operations - should not be cached
   */
  static async addReview(productId: number, reviewData: {
    rating: number;
    comment: string;
    title?: string;
  }): Promise<any> {
    return ApiService.addReview(productId, reviewData);
  }

  static async getProductReviews(productId: number, page = 1): Promise<any> {
    return ApiService.getProductReviews(productId, page);
  }

  /**
   * Clear user's search history - no caching for user actions
   */
  static async clearSearchHistory(): Promise<boolean> {
    return ApiService.clearSearchHistory();
  }

  /**
   * User profile operations - should not be cached
   */
  static async updateProfile(profileData: {
    first_name: string;
    last_name: string;
    email?: string;
    phone_number: string;
    dob?: string;
    sex?: string;
    intro?: string;
    address?: string;
  }): Promise<any> {
    return ApiService.updateProfile(profileData);
  }

  // ===== CACHE MANAGEMENT METHODS =====
  
  /**
   * Preload essential data for faster app startup
   * Gracefully handles network errors during development
   */
  static async preloadEssentialData(): Promise<void> {
    try {
      // Check if server is reachable first
      const isServerReachable = await this.checkServerHealth();
      if (!isServerReachable) {
        console.warn('🔧 Server is not reachable, skipping data preloading');
        return;
      }

      await CacheUtils.warmUpCache([
        {
          key: 'CATEGORIES',
          dataFn: async () => {
            try {
              return await ApiService.getCategories();
            } catch (error) {
              console.warn('Categories preload failed, returning empty array');
              return [];
            }
          },
          priority: 'high',
          storageType: 'localStorage'
        },
        {
          key: 'MANIFEST',
          dataFn: async () => {
            try {
              return await ApiService.getManifest();
            } catch (error) {
              console.warn('Manifest preload failed, returning default');
              return { lists: [], genres: [], vj: [] };
            }
          },
          priority: 'high',
          storageType: 'localStorage'
        }
      ]);
    } catch (error) {
      console.warn('Preload failed gracefully:', error);
    }
  }

  /**
   * Check if server is reachable
   */
  private static async checkServerHealth(): Promise<boolean> {
    try {
      // Use centralized http_get with a lightweight existing endpoint
      // Using chat-heads as it's a simple GET endpoint that exists
      const { http_get } = await import('./Api');
      await http_get('chat-heads');
      return true;
    } catch (error) {
      // Server unreachable or user not authenticated
      return false;
    }
  }

  /**
   * Refresh cached data in background
   */
  static async refreshBackgroundData(): Promise<void> {
    // Refresh categories
    CacheUtils.refreshInBackground(
      'CATEGORIES',
      () => ApiService.getCategories(),
      { storageType: 'localStorage' }
    );

    // Refresh manifest
    CacheUtils.refreshInBackground(
      'MANIFEST',
      () => ApiService.getManifest(),
      { storageType: 'localStorage' }
    );

    // Note: Vendors endpoint removed - no longer available in API
  }

  /**
   * Force refresh specific data type
   */
  static async forceRefresh(dataType: 'categories' | 'manifest' | 'all'): Promise<void> {
    switch (dataType) {
      case 'categories':
        await CacheUtils.getWithFallback(
          'CATEGORIES',
          () => ApiService.getCategories(),
          { skipCache: true, storageType: 'localStorage' }
        );
        break;
      case 'manifest':
        await CacheUtils.getWithFallback(
          'MANIFEST',
          () => ApiService.getManifest(),
          { skipCache: true, storageType: 'localStorage' }
        );
        break;
      case 'all':
        await Promise.all([
          this.forceRefresh('categories'),
          this.forceRefresh('manifest')
        ]);
        break;
    }
  }
}

export default CacheApiService;