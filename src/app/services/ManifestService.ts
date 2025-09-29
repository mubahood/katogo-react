// src/app/services/ManifestService.ts

import { ApiService } from './ApiService';
import BannerModel from '../models/BannerModel';
import CategoryModel from '../models/CategoryModel';
import ProductModel from '../models/ProductModel';
import ToastService from './ToastService';
import VendorModel from '../models/VendorModel';

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
        title: 'Welcome to BlitXpress',
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
  private async loadCategories(): Promise<CategoryModel[]> {
    return await ApiService.getCategories();
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
  clearCache(): void {
    this.cachedManifest = null;
    this.lastCacheTime = 0;
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
}

// Export singleton instance
export default ManifestService.getInstance();
