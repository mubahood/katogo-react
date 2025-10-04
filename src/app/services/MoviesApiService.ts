// src/app/services/MoviesApiService.ts
import { Movie, ApiResponse, SearchFilters } from '../types/Streaming';
import { http_get } from './Api';

/**
 * Movies API Service - 100% Centralized HTTP
 * All HTTP calls use http_get() from Api.ts
 * Authentication handled automatically by interceptor
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
  private static moviesEndpoint = 'movies';

  static async getMovies(params: MoviesApiParams = {}): Promise<ApiResponse<MoviesResponse>> {
    try {
      console.log('🎬 MoviesApiService: Fetching movies with params:', params);
      
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        per_page: params.per_page || 20,
      };

      if (params.search) queryParams.search = params.search;
      if (params.genre) queryParams.genre = params.genre;
      if (params.vj) queryParams.vj = params.vj;
      if (params.type && params.type !== 'All') queryParams.type = params.type;
      if (params.year) queryParams.year = params.year;
      if (params.is_premium !== undefined) queryParams.is_premium = params.is_premium ? 1 : 0;
      if (params.is_first_episode) queryParams.is_first_episode = params.is_first_episode;
      if (params.category) queryParams.category = params.category;
      if (params.language) queryParams.language = params.language;
      
      queryParams.sort_by = params.sort_by || 'created_at';
      queryParams.sort_dir = params.sort_dir || 'desc';

      const response = await http_get(this.moviesEndpoint, queryParams);

      console.log('✅ MoviesApiService: Movies fetched successfully');
      return response;
    } catch (error: any) {
      console.error('❌ MoviesApiService: Error fetching movies:', error);
      throw error;
    }
  }

  static async searchMovies(
    searchQuery: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    return await this.getMovies({ search: searchQuery, page, per_page: perPage });
  }

  static async getMoviesByType(
    type: 'Movie' | 'Series',
    page: number = 1,
    perPage: number = 20,
    additionalParams: Partial<MoviesApiParams> = {}
  ): Promise<ApiResponse<MoviesResponse>> {
    const params: MoviesApiParams = { type, page, per_page: perPage, ...additionalParams };
    if (type === 'Series') params.is_first_episode = 'Yes';
    return await this.getMovies(params);
  }

  static async getMoviesByGenre(
    genre: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    return await this.getMovies({ genre, page, per_page: perPage });
  }

  static async getMoviesByVJ(
    vj: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    return await this.getMovies({ vj, page, per_page: perPage });
  }

  static async getPremiumMovies(
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<MoviesResponse>> {
    return await this.getMovies({ is_premium: true, page, per_page: perPage });
  }

  static async getRandomMovie(): Promise<Movie | null> {
    try {
      const response = await http_get('random-movie', {});
      if (response.code === 1 && response.data?.movie) {
        return response.data.movie;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching random movie:', error);
      return null;
    }
  }

  static async getMovieById(movieId: number): Promise<Movie | null> {
    try {
      const response = await http_get(`movies/${movieId}`, {});
      if (response.code === 1 && response.data?.movie) {
        return response.data.movie;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching movie:', error);
      return null;
    }
  }

  static buildQueryString(filters: SearchFilters): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return params.toString();
  }

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
