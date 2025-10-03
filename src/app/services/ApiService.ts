// src/app/services/ApiService.ts

import { http_get, http_post } from "./Api";
import ProductModel, { PaginatedResponse } from "../models/ProductModel";
import CategoryModel from "../models/CategoryModel";
import VendorModel from "../models/VendorModel";
import ToastService from "./ToastService";
import { VideoProgress, VideoProgressModel } from "../models/VideoProgressModel";

/**
 * Comprehensive API service that handles all backend endpoints
 */
export class ApiService {
  
  // ===== PRODUCTS =====
  
  /**
   * Fetch paginated products with filtering and search
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
      const { page = 1, in_stock, ...otherFilters } = params;
      const filters: Record<string, string | number> = { ...otherFilters };
      
      // Convert boolean to string for API
      if (in_stock !== undefined) {
        filters.in_stock = in_stock ? 1 : 0;
      }
      
      return await ProductModel.fetchProducts(page, filters);
    } catch (error) {
      ToastService.error("Failed to load products");
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(id: number): Promise<ProductModel> {
    try {
      return await ProductModel.fetchProductById(id);
    } catch (error) {
      ToastService.error("Product not found");
      throw error;
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    categoryId: number,
    page = 1,
    additionalParams: Record<string, any> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await ProductModel.fetchProductsByCategory(categoryId, page, additionalParams);
    } catch (error) {
      ToastService.error("Failed to load category products");
      throw error;
    }
  }

  /**
   * Search products
   */
  static async searchProducts(
    searchTerm: string,
    page = 1,
    additionalParams: Record<string, any> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await ProductModel.searchProducts(searchTerm, page, additionalParams);
    } catch (error) {
      ToastService.error("Search failed");
      throw error;
    }
  }

  // ===== CATEGORIES =====
  
  /**
   * Get all categories
   * ⚠️ This makes an API call! Categories should be cached in ManifestService
   */
  static async getCategories(): Promise<CategoryModel[]> {
    return [];
  }

  /**
   * Get categories for banner display
   */
  static async getBannerCategories(): Promise<CategoryModel[]> {
    try {
      return [];
    } catch (error) {
      ToastService.error("Failed to load banner categories");
      throw error;
    }
  }

  /**
   * Get categories for navigation/listing
   */
  static async getNavigationCategories(): Promise<CategoryModel[]> {
    try { 
      return [];
    } catch (error) {
      ToastService.error("Failed to load navigation categories");
      throw error;
    }
  }

  /**
   * Get a single category by ID
   */
  static async getCategory(id: number): Promise<CategoryModel> {
    try {
      return await CategoryModel.fetchCategoryById(id);
    } catch (error) {
      ToastService.error("Category not found");
      throw error;
    }
  }

  // ===== VENDORS =====
  
  /**
   * Get all vendors
   * Currently disabled - endpoint not available in streaming platform API
   */
  static async getVendors(): Promise<VendorModel[]> {
    console.warn('Vendors endpoint is not available in streaming platform API');
    return []; // Return empty array instead of making API call
  }

  /**
   * Get active vendors only
   */
  static async getActiveVendors(): Promise<VendorModel[]> {
    try {
      const vendors = await VendorModel.fetchVendors();
      return vendors.filter(vendor => vendor.isActive() && vendor.isApproved());
    } catch (error) {
      ToastService.error("Failed to load active vendors");
      throw error;
    }
  }

  /**
   * Get a single vendor by ID
   */
  static async getVendor(id: number): Promise<VendorModel> {
    try {
      return await VendorModel.fetchVendorById(id);
    } catch (error) {
      ToastService.error("Vendor not found");
      throw error;
    }
  }

  // ===== ORDERS =====
  
  /**
   * Get user orders (requires authentication) - uses mobile app compatible endpoint
   */
  static async getUserOrders(page = 1): Promise<any> {
    try {
      // Mobile app uses /orders endpoint without pagination - API will use api/{model} route
      const response = await http_get(`orders`);
      return response;
    } catch (error) {
      ToastService.error("Failed to load orders");
      throw error;
    }
  }

  /**
   * Get single order by ID - uses mobile app compatible endpoint
   */
  static async getOrder(id: number): Promise<any> {
    try {
      // For individual orders, we may need to filter client-side or use a different approach
      const response = await http_get(`orders`);
      // Filter to find the specific order
      const orders = response.data || response;
      const order = Array.isArray(orders) ? orders.find((o: any) => o.id == id) : null;
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      ToastService.error("Order not found");
      throw error;
    }
  }

  /**
   * Create a new order - uses mobile app compatible endpoint
   */
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
    try {
      // Mobile app likely uses api/{model} route for creation, but we may need a specific endpoint
      // For now, let's use the same pattern as products
      const response = await http_post("orders", orderData);
      ToastService.success("Order placed successfully!");
      return response;
    } catch (error) {
      ToastService.error("Failed to place order");
      throw error;
    }
  }

  /**
   * Update order status - this may need a custom endpoint
   */
  static async updateOrderStatus(orderId: number, status: string): Promise<any> {
    try {
      // This might need a custom endpoint since the mobile app doesn't seem to have this
      const response = await http_post(`orders/${orderId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // ===== CART & WISHLIST =====
  
  /**
   * Add to cart (server-side if needed, or localStorage)
   */
  static async addToCart(productId: number, quantity = 1, variant?: Record<string, string>): Promise<boolean> {
    try {
      // For now, we'll handle cart in localStorage, but this could sync with server
      const cartItems = JSON.parse(localStorage.getItem('CART_ITEMS') || '[]');
      const existingItemIndex = cartItems.findIndex((item: any) => 
        item.product_id === productId && JSON.stringify(item.variant || {}) === JSON.stringify(variant || {})
      );

      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({
          product_id: productId,
          quantity,
          variant: variant || {},
          added_at: new Date().toISOString()
        });
      }

      localStorage.setItem('CART_ITEMS', JSON.stringify(cartItems));
      ToastService.success("Added to cart");
      return true;
    } catch (error) {
      ToastService.error("Failed to add to cart");
      throw error;
    }
  }

  /**
   * Get cart items with product details
   */
  static async getCartItems(): Promise<Array<{
    product: ProductModel;
    quantity: number;
    variant: Record<string, string>;
  }>> {
    try {
      const cartItems = JSON.parse(localStorage.getItem('CART_ITEMS') || '[]');
      const detailedItems = [];

      for (const item of cartItems) {
        try {
          const product = await ProductModel.fetchProductById(item.product_id);
          detailedItems.push({
            product,
            quantity: item.quantity,
            variant: item.variant || {}
          });
        } catch (error) {
          console.warn(`Product ${item.product_id} not found in cart`);
        }
      }

      return detailedItems;
    } catch (error) {
      ToastService.error("Failed to load cart");
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(productId: number, quantity: number, variant?: Record<string, string>): Promise<boolean> {
    try {
      const cartItems = JSON.parse(localStorage.getItem('CART_ITEMS') || '[]');
      const itemIndex = cartItems.findIndex((item: any) => 
        item.product_id === productId && JSON.stringify(item.variant || {}) === JSON.stringify(variant || {})
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cartItems.splice(itemIndex, 1);
        } else {
          cartItems[itemIndex].quantity = quantity;
        }
        localStorage.setItem('CART_ITEMS', JSON.stringify(cartItems));
        ToastService.success("Cart updated");
        return true;
      }
      return false;
    } catch (error) {
      ToastService.error("Failed to update cart");
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(productId: number, variant?: Record<string, string>): Promise<boolean> {
    return this.updateCartItem(productId, 0, variant);
  }

  /**
   * Clear entire cart
   */
  static async clearCart(): Promise<boolean> {
    try {
      localStorage.removeItem('CART_ITEMS');
      ToastService.success("Cart cleared");
      return true;
    } catch (error) {
      ToastService.error("Failed to clear cart");
      throw error;
    }
  }

  // ===== WISHLIST =====

  /**
   * Add to wishlist
   */
  static async addToWishlist(productId: number): Promise<boolean> {
    try {
      const response = await http_post("wishlist_add", { product_id: productId });
      ToastService.success("Added to wishlist");
      return true;
    } catch (error) {
      ToastService.error("Failed to add to wishlist");
      throw error;
    }
  }

  /**
   * Remove from wishlist
   */
  static async removeFromWishlist(productId: number): Promise<boolean> {
    try {
      const response = await http_post("wishlist_remove", { product_id: productId });
      ToastService.success("Removed from wishlist");
      return true;
    } catch (error) {
      ToastService.error("Failed to remove from wishlist");
      throw error;
    }
  }

  /**
   * Get user wishlist
   */
  static async getWishlist(): Promise<any[]> {
    try {
      const response = await http_get("wishlist_get");
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      ToastService.error("Failed to load wishlist");
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  static async checkWishlist(productId: number): Promise<boolean> {
    try {
      const response = await http_post("wishlist_check", { product_id: productId });
      return response?.data?.in_wishlist || false;
    } catch (error) {
      console.warn("Failed to check wishlist status:", error);
      return false;
    }
  }

  // ===== MANIFEST =====

  /**
   * Get application manifest with essential data and counts
   * Delegates to the optimized ManifestService for better caching and request deduplication
   */
  static async getManifest(): Promise<any> {
    try {
      // Use the shop manifest service for categories and shop data
      const { default: shopManifestService } = await import('./ManifestService');
      const homepageManifest = await shopManifestService.loadHomepageManifest();
      
      // Also get categories directly for the dropdown
      const categories = await this.getCategories();
      
      // Convert CategoryModel instances to plain objects for Redux serialization
      const plainCategories = categories.map(cat => ({
        id: cat.id,
        category: cat.category,
        name: cat.category,
        category_text: cat.category_text,
        parent_id: cat.parent_id,
        parent_text: cat.parent_text,
        image: cat.image,
        banner_image: cat.banner_image,
        show_in_banner: cat.show_in_banner,
        show_in_categories: cat.show_in_categories,
        is_parent: cat.is_parent,
        attributes: cat.attributes,
        created_at: cat.created_at,
        updated_at: cat.updated_at
      }));
      
      // Build manifest in the format expected by the Redux slice
      const manifest = {
        app_info: {
          app_name: "UgFlix Shop",
          app_version: "1.0.0",
          support_email: "support@ugflix.com",
          support_phone: "+256700000000"
        },
        categories: plainCategories, // Categories as plain objects for Redux
        delivery_locations: [
          { id: 1, name: "Kampala", delivery_fee: 5000 },
          { id: 2, name: "Entebbe", delivery_fee: 8000 },
          { id: 3, name: "Jinja", delivery_fee: 12000 }
        ],
        settings: {
          app_theme: "light",
          currency: "UGX",
          language: "en",
          notifications_enabled: true
        },
        features: {
          shop_enabled: true,
          movies_enabled: true,
          job_seeker_enabled: true,
          vendor_registration_enabled: true
        },
        counts: {
          total_products: homepageManifest.topProducts.length,
          total_categories: categories.length,
          total_orders: 0,
          total_users: 0,
          total_vendors: 0,
          active_vendors: 0,
          total_delivery_locations: 3,
          active_promotions: 0,
          wishlist_count: 0,
          cart_count: 0,
          notifications_count: 0,
          unread_messages_count: 0,
          pending_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          processing_orders: 0,
          recent_orders_this_week: 0,
          orders_today: 0,
          orders_this_month: 0
        },
        user: null,
        is_authenticated: false,
        featured_products: homepageManifest.topProducts,
        recent_products: [],
        recent_orders: [],
        recent_search_suggestions: [],
        wishlist: []
      };
      
      return manifest;
    } catch (error: any) {
      // Use offline fallback for network errors
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        console.warn("🔧 API server not reachable, using offline manifest");
        const { OfflineService } = await import('./OfflineService');
        return OfflineService.getDefaultManifest();
      } else {
        console.error("Failed to load manifest:", error);
        throw error;
      }
    }
  }

  // ===== MOVIES =====

  /**
   * Get single movie by ID with related movies
   * Used for video watch page with smart related movies algorithm
   */
  static async getMovieById(movieId: string): Promise<any> {
    try {
      const response = await http_get(`movie/${movieId}`);
      
      if (!response || response.code !== 1) {
        throw new Error(response?.message || 'Failed to load movie');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      throw error;
    }
  }

  // ===== VIDEO PROGRESS & WATCH HISTORY =====

  /**
   * Save or update video playback progress
   */
  static async saveVideoProgress(data: {
    movie_id: number;
    progress: number;
    duration: number;
    device?: string;
    platform?: string;
    browser?: string;
  }): Promise<any> {
    try {
      const progressData = {
        movie_model_id: data.movie_id,
        progress: data.progress,
        max_progress: Math.max(data.progress, 0),
        duration: data.duration,
        percentage: Math.round((data.progress / data.duration) * 100),
        device: data.device || 'Unknown',
        platform: data.platform || 'Web',
        browser: data.browser || 'Unknown',
        status: data.progress / data.duration >= 0.9 ? 'Completed' : 'Active',
        last_watched_at: new Date().toISOString()
      };

      const response = await http_post('video-progress', progressData);
      
      if (response && response.code === 1) {
        console.log('📺 Video progress saved:', progressData);
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to save video progress');
      }
    } catch (error) {
      console.error('Error saving video progress:', error);
      // Don't throw error for progress saving to avoid interrupting playback
      return null;
    }
  }

  /**
   * Get video progress for a specific movie
   */
  static async getVideoProgress(movieId: number): Promise<any> {
    try {
      const response = await http_get(`video-progress/${movieId}`);
      
      if (response && response.code === 1) {
        return response.data;
      }
      
      return null; // No progress found
    } catch (error) {
      console.error('Error fetching video progress:', error);
      return null;
    }
  }

  /**
   * Get user's watch history
   */
  static async getWatchHistory(page = 1, limit = 100): Promise<any> {
    try {
      const response = await http_get(`account/watch-history?page=${page}&limit=${limit}`);
      
      if (response && response.code === 1) {
        return response.data;
      }
      
      return { items: [], total: 0, current_page: 1, last_page: 1, per_page: limit };
    } catch (error) {
      console.error('Error fetching watch history:', error);
      return { items: [], total: 0, current_page: 1, last_page: 1, per_page: limit };
    }
  }

  /**
   * Delete video progress (reset progress)
   */
  static async deleteVideoProgress(movieId: number): Promise<boolean> {
    try {
      const response = await http_post(`video-progress/${movieId}/delete`, {});
      return response && response.code === 1;
    } catch (error) {
      console.error('Error deleting video progress:', error);
      return false;
    }
  }

  /**
   * Mark video as completed
   */
  static async markVideoCompleted(movieId: number, duration: number): Promise<any> {
    return this.saveVideoProgress({
      movie_id: movieId,
      progress: duration * 0.95, // Mark as 95% to ensure completion
      duration: duration
    });
  }

  // ===== SEARCH & FILTERS =====

  /**
   * Live search for real-time movie/content search with suggestions
   */
  static async liveSearch(query: string, limit = 10): Promise<{
    products: ProductModel[];
    suggestions: string[];
    total: number;
    search_term: string;
  }> {
    try {
      // Use the movies endpoint with comprehensive search parameter
      // Add live_search=1 to enable 25 result limit on backend
      const response = await http_get(`movies?search=${encodeURIComponent(query)}&per_page=${limit}&live_search=1`);
      
      if (!response || response.code !== 1) {
        throw new Error('API request failed');
      }
      
      const responseData = response.data || {};
      
      // Handle the nested structure from Laravel response
      const movies = responseData.items || responseData.data || [];
      const pagination = responseData.pagination || {};
      
      // Transform movie data to match expected ProductModel structure
      const products = movies.map((movie: any) => {
        return ProductModel.fromJson({
          id: movie.id,
          name: movie.title || "",
          description: movie.description || null,
          feature_photo: movie.thumbnail_url || "", // Store complete thumbnail URL
          url: movie.url || null,
          summary: `${movie.type || "Movie"} • ${movie.year || "N/A"} • ${movie.vj || "Unknown VJ"}`,
          price_1: "0.00",
          price_2: "0.00",
          rating: movie.rating || 0,
          category_text: movie.category || "",
          // Store movie-specific data in fields that won't conflict
          tags: JSON.stringify({
            genre: movie.genre,
            year: movie.year,
            type: movie.type,
            vj: movie.vj,
            actor: movie.actor,
            is_premium: movie.is_premium,
            category: movie.category,
            thumbnail_url: movie.thumbnail_url // Store original thumbnail URL for direct access
          }),
          status: movie.is_premium === "Yes" ? 2 : 1 // 1 for free, 2 for premium, check for "Yes" string
        });
      });
      
      // Generate search suggestions based on movie titles and other fields
      const suggestions = movies
        .map((movie: any) => movie.title)
        .filter((title: string) => title && title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      
      return {
        products,
        suggestions,
        total: pagination.total || movies.length,
        search_term: query
      };
    } catch (error) {
      console.warn("Live search failed:", error);
      return {
        products: [],
        suggestions: [],
        total: 0,
        search_term: query
      };
    }
  }

  /**
   * Get user's search history
   */
  static async getSearchHistory(limit = 10): Promise<string[]> {
    try {
      const sessionId = this.getOrCreateSessionId();
      const response = await http_get(`search-history?limit=${limit}&session_id=${sessionId}`);
      return response?.data?.recent_searches || [];
    } catch (error) {
      console.warn("Failed to get search history:", error);
      return [];
    }
  }

  /**
   * Clear user's search history
   */
  static async clearSearchHistory(): Promise<boolean> {
    try {
      const sessionId = this.getOrCreateSessionId();
      await http_post("search-history/clear", { session_id: sessionId });
      return true;
    } catch (error) {
      console.warn("Failed to clear search history:", error);
      return false;
    }
  }

  /**
   * Get or create a session ID for guest users
   */
  private static getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('ugflix_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ugflix_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await http_get(`search/suggestions?q=${encodeURIComponent(query)}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn("Failed to get search suggestions:", error);
      return [];
    }
  }

  /**
   * Get filter options (price ranges, brands, etc.)
   */
  static async getFilterOptions(categoryId?: number): Promise<{
    priceRanges: Array<{ min: number; max: number; label: string }>;
    brands: string[];
    colors: string[];
    sizes: string[];
  }> {
    try {
      const params: Record<string, string> = {};
      if (categoryId) {
        params.category = String(categoryId);
      }
      const response = await http_get(`filters?${new URLSearchParams(params).toString()}`);
      return response?.data || {
        priceRanges: [],
        brands: [],
        colors: [],
        sizes: []
      };
    } catch (error) {
      console.warn("Failed to get filter options:", error);
      return {
        priceRanges: [],
        brands: [],
        colors: [],
        sizes: []
      };
    }
  }

  // ===== REVIEWS =====

  /**
   * Add product review
   */
  static async addReview(productId: number, reviewData: {
    rating: number;
    comment: string;
    title?: string;
  }): Promise<any> {
    try {
      const response = await http_post(`products/${productId}/reviews`, reviewData);
      ToastService.success("Review submitted successfully");
      return response;
    } catch (error) {
      ToastService.error("Failed to submit review");
      throw error;
    }
  }

  /**
   * Get product reviews
   */
  static async getProductReviews(productId: number, page = 1): Promise<any> {
    try {
      const response = await http_get(`products/${productId}/reviews?page=${page}`);
      return response;
    } catch (error) {
      console.warn("Failed to load reviews:", error);
      return { data: [], total: 0 };
    }
  }

  // ===== USER PROFILE =====

  /**
   * Update user profile
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
    try {
      // Prepare the data object, mapping frontend fields to backend expected fields
      const requestData: any = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number_1: profileData.phone_number, // Backend still expects phone_number_1
      };

      if (profileData.email) {
        requestData.email = profileData.email;
      }
      
      if (profileData.dob) {
        requestData.date_of_birth = profileData.dob; // Backend expects date_of_birth
      }
      
      if (profileData.sex) {
        requestData.gender = profileData.sex; // Backend expects 'gender'
      }
      
      if (profileData.intro) {
        requestData.bio = profileData.intro; // Backend expects 'bio'
      }
      
      if (profileData.address) {
        requestData.address = profileData.address;
      }

      console.log('Sending to backend:', requestData); // Debug log

      const response = await http_post("update-profile", requestData);
      
      if (response?.code === 1) {
        ToastService.success(response.message || "Profile updated successfully!");
        
        // Transform the response data to match frontend field names
        const transformedData = response.data ? {
          ...response.data,
          phone_number_1: response.data.phone_number || response.data.phone_number_1,
          date_of_birth: response.data.dob || response.data.date_of_birth
        } : response.data;
        
        return transformedData;
      } else {
        throw new Error(response?.message || "Failed to update profile");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update profile";
      ToastService.error(errorMessage);
      throw error;
    }
  }

  // ===== MOVIE LIKES =====

  /**
   * Toggle like/unlike for a movie
   * @param movieId - The ID of the movie to like/unlike
   * @returns Promise with like status and updated likes count
   */
  static async toggleMovieLike(movieId: number): Promise<{
    liked: boolean;
    action: 'liked' | 'unliked';
    likes_count: number;
    like_id?: number;
  }> {
    try {
      const response = await http_post("account/likes/toggle", {
        movie_id: movieId
      });

      if (response?.code === 1) {
        const data = response.data;
        
        // Show appropriate toast message
        if (data.action === 'liked') {
          ToastService.success("Added to your liked movies! ❤️");
        } else {
          ToastService.info("Removed from liked movies");
        }

        return {
          liked: data.liked,
          action: data.action,
          likes_count: data.likes_count,
          like_id: data.like_id
        };
      } else {
        throw new Error(response?.message || "Failed to toggle like");
      }
    } catch (error: any) {
      // Handle authentication errors
      if (error?.response?.status === 401) {
        ToastService.error("Please log in to like movies");
        throw new Error("Authentication required");
      }
      
      // Handle forbidden errors (guest users)
      if (error?.response?.status === 403) {
        const message = error?.response?.data?.message || "Guest users cannot like movies. Please create an account.";
        ToastService.warning(message);
        throw new Error(message);
      }
      
      // Show exact backend error message
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to toggle like";
      ToastService.error(errorMessage);
      throw error;
    }
  }

  /**
   * Get user's liked movies (requires authentication)
   * @param page - Page number for pagination
   * @param perPage - Number of items per page
   */
  static async getLikedMovies(page = 1, perPage = 20): Promise<any> {
    try {
      const response = await http_get("account/likes", {
        page,
        per_page: perPage
      });

      if (response?.code === 1) {
        return response.data;
      } else {
        throw new Error(response?.message || "Failed to fetch liked movies");
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        ToastService.error("Please log in to view liked movies");
        throw new Error("Authentication required");
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch liked movies";
      ToastService.error(errorMessage);
      throw error;
    }
  }

  /**
   * Toggle movie wishlist (add/remove from wishlist)
   * @param movieId - The ID of the movie to toggle wishlist
   * @returns Promise with wishlist status and count
   */
  static async toggleMovieWishlist(movieId: number): Promise<{
    wishlisted: boolean;
    action: 'added' | 'removed';
    wishlist_count: number;
    wishlist_id?: number;
  }> {
    try {
      const response = await http_post("account/wishlist/toggle", {
        movie_id: movieId
      });

      if (response?.code === 1) {
        const data = response.data;
        
        // Show appropriate toast message
        if (data.action === 'added') {
          ToastService.success("Added to your wishlist! 📌");
        } else {
          ToastService.info("Removed from wishlist");
        }

        return {
          wishlisted: data.wishlisted,
          action: data.action,
          wishlist_count: data.wishlist_count,
          wishlist_id: data.wishlist_id
        };
      } else {
        throw new Error(response?.message || "Failed to toggle wishlist");
      }
    } catch (error: any) {
      // Handle authentication errors (401)
      if (error?.response?.status === 401) {
        ToastService.error("Please log in to add movies to wishlist");
        throw new Error("Authentication required");
      }
      
      // Handle forbidden errors (403) - guest users
      if (error?.response?.status === 403) {
        const message = error?.response?.data?.message || 
          "Guest users cannot add to wishlist. Please create an account.";
        ToastService.warning(message);
        throw new Error(message);
      }
      
      // Show exact backend error message
      const errorMessage = error?.response?.data?.message || 
        error?.message || "Failed to toggle wishlist";
      ToastService.error(errorMessage);
      throw error;
    }
  }

  /**
   * Get user's wishlisted movies (requires authentication)
   * @param page - Page number for pagination
   * @param perPage - Number of items per page
   */
  static async getWishlistedMovies(page = 1, perPage = 20): Promise<any> {
    try {
      const response = await http_get("account/wishlist", {
        page,
        per_page: perPage
      });

      if (response?.code === 1) {
        return response.data;
      } else {
        throw new Error(response?.message || "Failed to fetch wishlisted movies");
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        ToastService.error("Please log in to view wishlist");
        throw new Error("Authentication required");
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch wishlist";
      ToastService.error(errorMessage);
      throw error;
    }
  }
}

export default ApiService;
