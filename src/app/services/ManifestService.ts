// src/app/services/ManifestService.ts

import { ApiService } from './ApiService';
import { http_get } from './Api';
import BannerModel from '../models/BannerModel';
import CategoryModel from '../models/CategoryModel';
import ProductModel from '../models/ProductModel';
import ToastService from './ToastService';
import VendorModel from '../models/VendorModel';

/**
 * Subscription information from manifest API
 */
export interface ManifestSubscription {
  has_active_subscription: boolean;
  days_remaining: number;
  hours_remaining: number;
  is_in_grace_period: boolean;
  subscription_status: string;
  end_date: string | null;
  require_subscription: boolean;
}

/**
 * Complete manifest data structure from API
 */
export interface ManifestData {
  subscription?: ManifestSubscription;
  top_movie?: any[];
  lists?: any[];
  [key: string]: any;
}

/**
 * Manifest interface matching the Flutter app's structure
 */
export interface HomepageManifest {
  banners: BannerModel[];
  categories: CategoryModel[];
  topProducts: ProductModel[];
  featuredCategories: CategoryModel[];
  isLoading: boolean;
  lastUpdated: Date;
}

/**
 * Manifest Service that harmonizes homepage data loading
 * Inspired by the Flutter app's manifest logic
 */
export class ManifestService {
  private static instance: ManifestService;
  private cachedManifest: HomepageManifest | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheTime: number = 0;

  // Subscription-specific cache (shorter duration for more frequent updates)
  private cachedSubscriptionManifest: ManifestData | null = null;
  private subscriptionCacheExpiry: number = 60 * 1000; // 1 minute
  private lastSubscriptionCacheTime: number = 0;
  private isLoadingSubscription: boolean = false;
  private subscriptionLoadingPromise: Promise<ManifestData> | null = null;

  private constructor() {}

  static getInstance(): ManifestService {
    if (!ManifestService.instance) {
      ManifestService.instance = new ManifestService();
    }
    return ManifestService.instance;
  }

  /**
   * Load homepage manifest with all required data
   * This mirrors the Flutter app's manifest loading approach
   */
  async loadHomepageManifest(forceRefresh = false): Promise<HomepageManifest> {
    const now = Date.now();
    
    // Return cached data if valid and not forcing refresh
    if (
      !forceRefresh &&
      this.cachedManifest &&
      (now - this.lastCacheTime) < this.cacheExpiry
    ) {
      return this.cachedManifest;
    }

    try {
      const manifest: HomepageManifest = {
        banners: [],
        categories: [],
        topProducts: [],
        featuredCategories: [],
        isLoading: true,
        lastUpdated: new Date(),
      };

      // Load all data concurrently like the Flutter app
      const [
        bannersData,
        categoriesData,
        vendorsData,
        topProductsData,
      ] = await Promise.allSettled([
        this.loadBanners(),
        this.loadCategories(),
        this.loadVendors(),
        this.loadTopProducts(),
      ]);

      // Process banners
      if (bannersData.status === 'fulfilled') {
        manifest.banners = bannersData.value;
      } else {
        console.warn('Failed to load banners:', bannersData.reason);
      }

      // Process categories
      if (categoriesData.status === 'fulfilled') {
        manifest.categories = categoriesData.value;
        manifest.featuredCategories = this.getFeaturedCategories(categoriesData.value);
      } else {
        console.warn('Failed to load categories:', categoriesData.reason);
      }

      // Process top products
      if (topProductsData.status === 'fulfilled') {
        manifest.topProducts = topProductsData.value;
      } else {
        console.warn('Failed to load top products:', topProductsData.reason);
      }

      manifest.isLoading = false;

      // Cache the result
      this.cachedManifest = manifest;
      this.lastCacheTime = now;

      return manifest;
    } catch (error) {
      console.error('Failed to load homepage manifest:', error);
      ToastService.error('Failed to load homepage data');
      
      // Return a fallback manifest
      return {
        banners: [],
        categories: [],
        topProducts: [],
        featuredCategories: [],
        isLoading: false,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Load banners for carousel
   * This matches the Flutter implementation exactly:
   * - Get all categories from API
   * - Filter categories where show_in_banner.toLowerCase() == 'yes'
   * - Convert these categories to banner models
   */
  private async loadBanners(): Promise<BannerModel[]> {
    try {
      console.log('🎠 Loading banners from API...');
      
      // Use the existing getBannerCategories method which filters by show_in_banner
      const bannerCategories = await ApiService.getBannerCategories();

      console.log('🎠 Banner categories found:', bannerCategories.length);
      console.log('🎠 Banner categories data:', bannerCategories.map(cat => ({
        id: cat.id,
        name: cat.category,
        show_in_banner: cat.show_in_banner,
        banner_image: cat.banner_image
      })));
      
      // Convert banner categories to banner models
      const categoryBanners = bannerCategories
        .filter(cat => {
          const hasImage = cat.banner_image && cat.banner_image.trim() !== '';
          console.log(`🎠 Category "${cat.category}" has banner image:`, hasImage, cat.banner_image);
          return hasImage;
        })
        .map((cat, index) => {
          const banner = BannerModel.fromApiData({
            id: cat.id,
            title: cat.category,
            subtitle: `Shop ${cat.category}`,
            description: `Discover amazing ${cat.category.toLowerCase()} products`,
            image: cat.banner_image,
            action_type: 'category',
            action_value: cat.id.toString(),
            is_active: 'Yes',
            position: index,
          });
          console.log(`🎠 Created banner for "${cat.category}":`, banner.getImageUrl());
          return banner;
        });

      // If no category banners found, return empty array (no fallback dummy data)
      if (categoryBanners.length === 0) {
        console.log('🎠 No category banners found - returning empty array (no dummy data)');
        return [];
      }

      console.log('🎠 Successfully created banners from categories:', categoryBanners.length);
      return BannerModel.sortByPosition(categoryBanners);
    } catch (error) {
      console.error('🎠 Failed to load banners from categories:', error);
      return []; // Return empty array instead of fallback dummy data
    }
  }

  /**
   * Create fallback promotional banners
   */
  private createFallbackBanners(): BannerModel[] {
    const fallbackBanners = [
      {
        id: 1,
        title: 'Welcome to UgFlix',
        subtitle: 'Your one-stop shop',
        description: 'Discover amazing products at unbeatable prices',
        image: 'media/auth/bg1.jpg',
        action_type: 'url' as const,
        action_value: '/products',
        is_active: 'Yes' as const,
        position: 1,
      },
      {
        id: 2,
        title: 'Super Deals',
        subtitle: 'Up to 50% Off',
        description: 'Limited time offers on selected items',
        image: 'media/auth/bg2.jpg',
        action_type: 'url' as const,
        action_value: '/products?sort_by=price_1',
        is_active: 'Yes' as const,
        position: 2,
      },
      {
        id: 3,
        title: 'New Arrivals',
        subtitle: 'Fresh Products',
        description: 'Check out our latest additions',
        image: 'media/auth/bg3.jpg',
        action_type: 'url' as const,
        action_value: '/products?sort_by=date_added',
        is_active: 'Yes' as const,
        position: 3,
      },
    ];

    console.log('🎠 Created fallback banners:', fallbackBanners.length);
    return fallbackBanners.map(data => BannerModel.fromApiData(data));
  }

  /**
   * Load categories for display
   */
  private cachedCategories: CategoryModel[] | null = null;
  
  private async loadCategories(): Promise<CategoryModel[]> {
    // Return cached categories if available
    if (this.cachedCategories && this.cachedCategories.length > 0) {
      console.log('📦 Using cached categories from ManifestService');
      return this.cachedCategories;
    }
    
    console.log('🔄 Loading categories from API (first time only)');
    this.cachedCategories = await ApiService.getCategories();
    return this.cachedCategories;
  }

  /**
   * Load vendors for display
   */
  private async loadVendors(): Promise<VendorModel[]> {
    const vendors = await ApiService.getVendors();
    return vendors.slice(0, 12); // Limit to 12 vendors
  }

  /**
   * Load top/featured products
   */
  private async loadTopProducts(): Promise<ProductModel[]> {
    const response = await ApiService.getProducts({
      page: 1,
      limit: 12,
      sort_by: 'metric',
      sort_order: 'desc',
      in_stock: true,
    });
    return response.data;
  }

  /**
   * Get featured categories for special display
   * This matches the Flutter implementation:
   * - Filter categories where show_in_categories == 'Yes'
   * - Limit to 8 categories (like Flutter)
   */
  private getFeaturedCategories(categories: CategoryModel[]): CategoryModel[] {
    console.log('📂 Total categories received:', categories.length);
    
    const featuredCats = categories
      .filter(cat => {
        const isShown = cat.isShownInCategories();
        console.log(`📂 Category "${cat.category}" shown in categories:`, isShown, cat.show_in_categories);
        return isShown;
      })
      .slice(0, 8); // Show top 8 categories like Flutter
    
    console.log('📂 Featured categories found:', featuredCats.length);
    console.log('📂 Featured categories:', featuredCats.map(cat => cat.category));
    return featuredCats;
  }

  /**
   * Clear cache to force refresh
   */
  public clearCache(): void {
    this.cachedManifest = null;
    this.cachedCategories = null;
    this.lastCacheTime = 0;
    this.cachedSubscriptionManifest = null;
    this.lastSubscriptionCacheTime = 0;
    console.log('🧹 ManifestService cache cleared');
  }

  /**
   * Get cached manifest if available
   */
  getCachedManifest(): HomepageManifest | null {
    const now = Date.now();
    if (
      this.cachedManifest &&
      (now - this.lastCacheTime) < this.cacheExpiry
    ) {
      return this.cachedManifest;
    }
    return null;
  }

  // ==================== SUBSCRIPTION METHODS ====================

  /**
   * Check if user has an active subscription
   * This is the ONLY source of truth for subscription status
   * 
   * @returns Promise<boolean> - True if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      console.log('🔍 ManifestService: Checking subscription status');

      const manifest = await this.getSubscriptionManifest();
      
      if (!manifest || !manifest.subscription) {
        console.warn('⚠️ ManifestService: No subscription data in manifest');
        return false;
      }

      const hasAccess = manifest.subscription.has_active_subscription === true;

      console.log('📊 ManifestService: Subscription status', {
        hasAccess,
        status: manifest.subscription.subscription_status,
        daysRemaining: manifest.subscription.days_remaining,
        hoursRemaining: manifest.subscription.hours_remaining,
        isInGracePeriod: manifest.subscription.is_in_grace_period,
      });

      return hasAccess;

    } catch (error) {
      console.error('💥 ManifestService: Error checking subscription', error);
      return false;
    }
  }

  /**
   * Get the full manifest data including subscription info
   * Uses caching to prevent redundant API calls (1 minute cache)
   * 
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns Promise<ManifestData> - Complete manifest data
   */
  async getSubscriptionManifest(forceRefresh: boolean = false): Promise<ManifestData> {
    const now = Date.now();

    // Return cached data if valid and not forcing refresh
    if (
      !forceRefresh &&
      this.cachedSubscriptionManifest &&
      (now - this.lastSubscriptionCacheTime) < this.subscriptionCacheExpiry
    ) {
      console.log('📦 ManifestService: Using cached subscription manifest');
      return this.cachedSubscriptionManifest;
    }

    // If already loading, wait for that promise
    if (this.isLoadingSubscription && this.subscriptionLoadingPromise) {
      console.log('⏳ ManifestService: Waiting for existing subscription request');
      return this.subscriptionLoadingPromise;
    }

    // Start new fetch
    this.isLoadingSubscription = true;
    this.subscriptionLoadingPromise = this.fetchSubscriptionManifestFromServer();

    try {
      const manifest = await this.subscriptionLoadingPromise;
      this.cachedSubscriptionManifest = manifest;
      this.lastSubscriptionCacheTime = now;
      return manifest;
    } finally {
      this.isLoadingSubscription = false;
      this.subscriptionLoadingPromise = null;
    }
  }

  /**
   * Fetch manifest from server (private method)
   * Handles API call and error handling
   */
  private async fetchSubscriptionManifestFromServer(): Promise<ManifestData> {
    try {
      console.log('🌐 ManifestService: Fetching subscription manifest from server');

      const response = await http_get('manifest', {});

      // Parse response - http_get already unwraps to { code, data: { subscription, top_movie, lists } }
      if (response.code === 1 && response.data) {
        const manifest = response.data; // Get the data object directly

        console.log('✅ ManifestService: Subscription manifest fetched successfully', {
          hasSubscription: !!manifest.subscription,
          subscriptionStatus: manifest.subscription?.subscription_status,
          topMovies: manifest.top_movie?.length || 0,
          lists: manifest.lists?.length || 0,
        });

        return manifest;
      } else {
        console.error('❌ ManifestService: Invalid manifest response structure', {
          hasCode: !!response.code,
          hasData: !!response.data,
          actualStructure: Object.keys(response || {}),
        });
        throw new Error('Invalid manifest response structure');
      }

    } catch (error: any) {
      console.error('💥 ManifestService: Failed to fetch subscription manifest', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Get subscription details from manifest
   * @returns ManifestSubscription | null
   */
  async getSubscriptionDetails(): Promise<ManifestSubscription | null> {
    try {
      const manifest = await this.getSubscriptionManifest();
      return manifest.subscription || null;
    } catch (error) {
      console.error('💥 ManifestService: Error getting subscription details', error);
      return null;
    }
  }

  /**
   * Check if subscription is expiring soon
   * @param days - Number of days to check (default: 7)
   * @returns Promise<boolean>
   */
  async isExpiringSoon(days: number = 7): Promise<boolean> {
    const subscription = await this.getSubscriptionDetails();
    if (!subscription || !subscription.has_active_subscription) {
      return false;
    }
    return subscription.days_remaining > 0 && subscription.days_remaining <= days;
  }

  /**
   * Check if user is in grace period
   * @returns Promise<boolean>
   */
  async isInGracePeriod(): Promise<boolean> {
    const subscription = await this.getSubscriptionDetails();
    return subscription?.is_in_grace_period === true;
  }

  /**
   * Redirect to subscription plans page
   * @param reason - Optional reason for redirect (for logging/analytics)
   */
  redirectToSubscription(reason?: string): void {
    console.log('🔀 ManifestService: Redirecting to subscription', { reason });
    
    const redirectUrl = '/subscription/plans';
    
    if (reason) {
      // Store reason in session storage for display on subscription page
      sessionStorage.setItem('subscriptionRedirectReason', reason);
    }
    
    window.location.href = redirectUrl;
  }

  /**
   * Clear subscription cache
   * Useful when subscription status changes (e.g., after payment)
   */
  clearSubscriptionCache(): void {
    console.log('🗑️ ManifestService: Clearing subscription cache');
    this.cachedSubscriptionManifest = null;
    this.lastSubscriptionCacheTime = 0;
  }

  /**
   * Force refresh subscription data from server
   * @returns Promise<ManifestData>
   */
  async refreshSubscription(): Promise<ManifestData> {
    console.log('🔄 ManifestService: Forcing subscription refresh');
    return this.getSubscriptionManifest(true);
  }

  /**
   * Check access and optionally redirect if no subscription
   * Useful for route guards and protected components
   * 
   * @param autoRedirect - Automatically redirect if no subscription (default: true)
   * @returns Promise<boolean> - True if has access, false otherwise
   */
  async checkAccessAndRedirect(autoRedirect: boolean = true): Promise<boolean> {
    console.log('🛡️ ManifestService: Checking access');

    const hasAccess = await this.hasActiveSubscription();

    if (!hasAccess && autoRedirect) {
      console.log('❌ ManifestService: Access denied');
      this.redirectToSubscription('Access denied - subscription required');
      return false;
    }

    if (hasAccess) {
      console.log('✅ ManifestService: Access granted');
    } else {
      console.log('❌ ManifestService: Access denied');
    }

    return hasAccess;
  }
}

// Export singleton instance
export default ManifestService.getInstance();
