// src/app/services/MoviesApiService.ts
import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from '../constants';
import { Movie, ApiResponse, PaginatedResponse, SearchFilters } from '../types/Streaming';
import { ugflix_auth_token } from '../../Constants';

/**
 * Movies API Service
 * Handles all movie-related API calls with pagination, search, and filtering
 * Mobile-first design approach
 */

export interface MoviesApiParams {
  page?: number;
  per_page?: number;
  search?: string;
  genre?: string;
  vj?: string;
  type?: 'Movie' | 'Series' | 'All';
  year?: number;
  is_premium?: boolean;
  is_first_episode?: 'Yes' | 'No';
  sort_by?: 'title' | 'year' | 'rating' | 'created_at' | 'views_count';
  sort_dir?: 'asc' | 'desc';
  category?: string;
  language?: string;
}

export interface MoviesResponse {
  items: Movie[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from?: number;
    to?: number;
  };
}

class MoviesApiService {
  private static baseUrl = BASE_URL;
  private static moviesEndpoint = '/api/movies';

  // Get auth headers
  private static getHeaders() {
    const token = localStorage.getItem(ugflix_auth_token);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Get movies with pagination and filters
   * Supports search, genre, vj, type filters
   */
  static async getMovies(params: MoviesApiParams = {}): Promise<ApiResponse<MoviesResponse>> {
    try {
      console.log('🎬 MoviesApiService: Fetching movies with params:', params);
      
      // Build query parameters
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        per_page: params.per_page || 20,
      };

      // Add filters if provided
      if (params.search) queryParams.search = params.search;
      if (params.genre) queryParams.genre = params.genre;
      if (params.vj) queryParams.vj = params.vj;
      if (params.type && params.type !== 'All') queryParams.type = params.type;
      if (params.year) queryParams.year = params.year;
      if (params.is_premium !== undefined) queryParams.is_premium = params.is_premium ? 1 : 0;
      if (params.is_first_episode) queryParams.is_first_episode = params.is_first_episode;
      if (params.category) queryParams.category = params.category;
      if (params.language) queryParams.language = params.language;
      
      // Add sorting
      queryParams.sort_by = params.sort_by || 'created_at';
      queryParams.sort_dir = params.sort_dir || 'desc';

      const response: AxiosResponse<ApiResponse<MoviesResponse>> = await axios.get(
        `${this.baseUrl}${this.moviesEndpoint}`,
        {
          params: queryParams,
          headers: this.getHeaders(),
        }
      );

      console.log('✅ MoviesApiService: Movies fetched successfully', {
        total: response.data.data.pagination.total,
        page: response.data.data.pagination.current_page,
        items: response.data.data.items.length
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error fetching movies:', error);
      
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch movies');
      } else if (error.request) {
        throw new Error('Network error: Please check your connection');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Search movies with debouncing support
   * Searches across title, description, genre, category, actor, vj
   */
  static async searchMovies(
    searchQuery: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    try {
      console.log('🔍 MoviesApiService: Searching movies:', searchQuery);
      
      return await this.getMovies({
        search: searchQuery,
        page,
        per_page: perPage,
      });
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error searching movies:', error);
      throw error;
    }
  }

  /**
   * Get movies by type (Movie or Series)
   * For series, only returns first episodes
   */
  static async getMoviesByType(
    type: 'Movie' | 'Series',
    page: number = 1,
    perPage: number = 20,
    additionalParams: Partial<MoviesApiParams> = {}
  ): Promise<ApiResponse<MoviesResponse>> {
    try {
      console.log(`🎬 MoviesApiService: Fetching ${type}s, page ${page}`);
      
      const params: MoviesApiParams = {
        type,
        page,
        per_page: perPage,
        ...additionalParams,
      };

      // For series, only get first episodes to avoid repetition
      if (type === 'Series') {
        params.is_first_episode = 'Yes';
      }

      return await this.getMovies(params);
    } catch (error: any) {
      console.error(`❌ MoviesApiService: Error fetching ${type}s:`, error);
      throw error;
    }
  }

  /**
   * Get movies by genre
   */
  static async getMoviesByGenre(
    genre: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    try {
      console.log('🎬 MoviesApiService: Fetching movies by genre:', genre);
      
      return await this.getMovies({
        genre,
        page,
        per_page: perPage,
      });
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error fetching movies by genre:', error);
      throw error;
    }
  }

  /**
   * Get movies by VJ
   */
  static async getMoviesByVJ(
    vj: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    try {
      console.log('🎬 MoviesApiService: Fetching movies by VJ:', vj);
      
      return await this.getMovies({
        vj,
        page,
        per_page: perPage,
      });
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error fetching movies by VJ:', error);
      throw error;
    }
  }

  /**
   * Get premium movies only
   */
  static async getPremiumMovies(
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    try {
      console.log('🎬 MoviesApiService: Fetching premium movies');
      
      return await this.getMovies({
        is_premium: true,
        page,
        per_page: perPage,
      });
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error fetching premium movies:', error);
      throw error;
    }
  }

  /**
   * Get random movie for hero/background
   */
  static async getRandomMovie(): Promise<Movie | null> {
    try {
      console.log('🎲 MoviesApiService: Fetching random movie');
      
      const response: AxiosResponse<ApiResponse<{ movie: Movie }>> = await axios.get(
        `${this.baseUrl}/api/random-movie`,
        {
          headers: this.getHeaders(),
        }
      );

      if (response.data.code === 1 && response.data.data.movie) {
        console.log('✅ MoviesApiService: Random movie fetched:', response.data.data.movie.title);
        return response.data.data.movie;
      }

      return null;
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error fetching random movie:', error);
      return null;
    }
  }

  /**
   * Get single movie by ID
   */
  static async getMovieById(movieId: number): Promise<Movie | null> {
    try {
      console.log('🎬 MoviesApiService: Fetching movie by ID:', movieId);
      
      const response: AxiosResponse<ApiResponse<{ movie: Movie }>> = await axios.get(
        `${this.baseUrl}/api/movies/${movieId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (response.data.code === 1 && response.data.data.movie) {
        console.log('✅ MoviesApiService: Movie fetched:', response.data.data.movie.title);
        return response.data.data.movie;
      }

      return null;
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error fetching movie:', error);
      return null;
    }
  }

  /**
   * Helper: Build query string from filters
   */
  static buildQueryString(filters: SearchFilters): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return params.toString();
  }

  /**
   * Helper: Get default filters
   */
  static getDefaultFilters(): MoviesApiParams {
    return {
      page: 1,
      per_page: 20,
      sort_by: 'created_at',
      sort_dir: 'desc',
    };
  }
}

export default MoviesApiService;
