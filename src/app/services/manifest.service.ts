import { API_ENDPOINTS } from '../config/api.config';

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
  private cachedResponse: ManifestResponse | null = null;
  private readonly MIN_REQUEST_INTERVAL = 10000; // 10 seconds minimum between requests
  private readonly RATE_LIMIT_BACKOFF = 30000; // 30 seconds backoff for 429 errors

  /**
   * Get streaming manifest with movies and categories
   */
  async getManifest(): Promise<ManifestResponse> {
    // Prevent concurrent requests
    if (this.isRequesting) {
      console.log('🔄 Manifest request already in progress, using cached response');
      if (this.cachedResponse) {
        return this.cachedResponse;
      }
      // Wait for ongoing request to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (this.cachedResponse) {
        return this.cachedResponse;
      }
    }

    // Throttle requests - enforce minimum interval
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      console.log(`🚦 Throttling manifest request - ${Math.ceil((this.MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000)}s remaining`);
      if (this.cachedResponse) {
        return this.cachedResponse;
      }
      // Wait for throttle period if no cached response
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    this.isRequesting = true;
    this.lastRequestTime = now;

    try {
      const token = localStorage.getItem('ugflix_auth_token');
      const user = localStorage.getItem('ugflix_user');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Parse user data to get user ID
      const userData = user ? JSON.parse(user) : null;
      
      // Use same authentication headers as mobile app
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Tok': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      // Add user ID header if available
      if (userData?.id) {
        headers['logged_in_user_id'] = userData.id.toString();
      }

      const response = await fetch(`${this.baseUrl}/manifest`, {
        method: 'GET',
        headers,
      });

      // Handle rate limiting specifically
      if (response.status === 429) {
        console.warn('🚦 Rate limited - implementing exponential backoff');
        this.lastRequestTime = now + this.RATE_LIMIT_BACKOFF; // Block requests for 30 seconds
        throw new Error('Rate limited - please wait before retrying');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.code !== 1) {
        throw new Error(data.message || 'Failed to load manifest');
      }

      // Cache successful response
      this.cachedResponse = data;
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
    } finally {
      this.isRequesting = false;
    }
  }

  /**
   * Get movies by category
   */
  async getMoviesByCategory(category: string, page: number = 1, limit: number = 20): Promise<Movie[]> {
    try {
      const token = localStorage.getItem('ugflix_auth_token');
      const user = localStorage.getItem('ugflix_user');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const userData = user ? JSON.parse(user) : null;
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Tok': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      if (userData?.id) {
        headers['logged_in_user_id'] = userData.id.toString();
      }

      // Use the movies endpoint from API routes
      const response = await fetch(`${this.baseUrl}/movies?category=${category}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
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
      const token = localStorage.getItem('ugflix_auth_token');
      const user = localStorage.getItem('ugflix_user');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const userData = user ? JSON.parse(user) : null;
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Tok': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      if (userData?.id) {
        headers['logged_in_user_id'] = userData.id.toString();
      }

      const response = await fetch(`${this.baseUrl}/movies?search=${encodeURIComponent(query)}&page=${page}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
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
    const userString = localStorage.getItem('ugflix_user');
    return userString ? JSON.parse(userString) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('ugflix_auth_token');
    const user = localStorage.getItem('ugflix_user');
    return !!(token && user);
  }
}

// Export singleton instance
export const manifestService = new ManifestService();
export default manifestService;