import { API_ENDPOINTS } from '../config/api.config';
import { http_get } from './Api';
import Utils from './Utils';
import { ugflix_auth_token, ugflix_user } from '../../Constants';

export interface Movie {
  id: number;
  title: string;
  url: string;
  thumbnail_url: string;
  description: string;
  genre: string;
  type: string;
  vj: string;
  is_premium: boolean;
  category_id: number;
  category: string;
  views_time_count?: number;
  has_wishlisted?: boolean;
  wishlist_count?: number;
  has_liked?: boolean;
  likes_count?: number;
}

export interface MovieCategory {
  id: string;
  name: string;
  movies: Movie[];
}

export interface MovieList {
  title: string;
  movies: Movie[];
}

export interface ManifestResponse {
  code: number;
  message: string;
  data: {
    top_movie?: Movie[];
    lists?: MovieList[];
    genres?: string[];
    vj?: string[];
    platform_type?: string;
    APP_VERSION?: number;
    UPDATE_NOTES?: string;
    WHATSAPP_CONTAT_NUMBER?: string;
    [key: string]: any;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

class ManifestService {
  private baseUrl = API_ENDPOINTS.BASE_URL;
  private lastRequestTime = 0;
  private isRequesting = false;
  private pendingRequest: Promise<ManifestResponse> | null = null;
  private cachedResponse: ManifestResponse | null = null;
  private readonly MIN_REQUEST_INTERVAL = 3000; // Reduced to 3 seconds
  private readonly RATE_LIMIT_BACKOFF = 30000; // 30 seconds backoff for 429 errors
  private readonly CACHE_DURATION = 60000; // 1 minute cache duration

  /**
   * Get streaming manifest with movies and categories
   */
  async getManifest(): Promise<ManifestResponse> {
    // Return cached response if still valid
    const now = Date.now();
    if (this.cachedResponse && (now - this.lastRequestTime) < this.CACHE_DURATION) {
      console.log('� Using cached manifest response');
      return this.cachedResponse;
    }

    // Return pending request if one is already in progress
    if (this.pendingRequest) {
      console.log('🔄 Manifest request already in progress, waiting for completion');
      return this.pendingRequest;
    }

    // Throttle requests - enforce minimum interval
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL && this.cachedResponse) {
      console.log(`🚦 Using cached response due to throttling - ${Math.ceil((this.MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000)}s remaining`);
      return this.cachedResponse;
    }

    // Create and store the pending request
    this.pendingRequest = this.executeManifestRequest();
    this.lastRequestTime = now;

    try {
      const result = await this.pendingRequest;
      this.cachedResponse = result;
      return result;
    } finally {
      this.pendingRequest = null;
    }
  }

  /**
   * Execute the actual manifest request
   */
  private async executeManifestRequest(): Promise<ManifestResponse> {

    try {
      // Use centralized http_get method - it handles authentication automatically
      const data = await http_get('manifest', {});

      if (data.code !== 1) {
        throw new Error(data.message || 'Failed to load manifest');
      }

      return data;
    } catch (error: any) {
      console.error('Manifest error:', error);
      
      // For rate limiting, use cached response if available
      if (error.message?.includes('Rate limited') && this.cachedResponse) {
        console.log('🔄 Using cached manifest due to rate limiting');
        return this.cachedResponse;
      }

      // Return empty manifest on error to prevent app crash
      return {
        code: 0,
        message: error.message || 'Failed to load content',
        data: {
          top_movie: [],
          lists: [],
          genres: [],
          vj: [],
          platform_type: '',
          APP_VERSION: 18,
          UPDATE_NOTES: '',
          WHATSAPP_CONTAT_NUMBER: ''
        }
      };
    }
  }

  /**
   * Clear cache to force fresh request
   */
  clearCache(): void {
    this.cachedResponse = null;
    this.lastRequestTime = 0;
    this.pendingRequest = null;
  }

  /**
   * Get movies by category
   */
  async getMoviesByCategory(category: string, page: number = 1, limit: number = 20): Promise<Movie[]> {
    try {
      // Use centralized http_get method - it handles authentication automatically
      const data = await http_get('movies', {
        category,
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (data.code === 1 && data.data) {
        return data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Movies fetch error:', error);
      return [];
    }
  }

  /**
   * Search movies
   */
  async searchMovies(query: string, page: number = 1): Promise<Movie[]> {
    try {
      // Use centralized http_get method - it handles authentication automatically
      const data = await http_get('movies', {
        search: query,
        page: page.toString()
      });
      
      if (data.code === 1 && data.data) {
        return data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): any | null {
    return Utils.loadFromDatabase(ugflix_user);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = Utils.loadFromDatabase(ugflix_auth_token);
    const user = Utils.loadFromDatabase(ugflix_user);
    return !!(token && user);
  }
}

// Export singleton instance
export const manifestService = new ManifestService();
export default manifestService;