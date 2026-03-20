// src/app/services/v2/MoviesV2Service.ts
// Uses /api/v2/movies endpoints — optimized slim payloads, server-side pagination

import { http_get, http_post } from '../Api';

export interface MoviesV2Params {
  type?: 'Movie' | 'Series' | 'Episode';
  genre?: string;
  language?: string;
  vj?: string;
  year?: number;
  status?: 'Active' | 'Inactive';
  sort?: 'newest' | 'oldest' | 'popular' | 'rating';
  page?: number;
  per_page?: number;
}

export interface MovieV2 {
  id: number;
  title: string;
  url: string;
  image_url: string;
  thumbnail_url: string;
  year: number;
  rating: number;
  duration: string;
  genre: string;
  language: string;
  type: 'Movie' | 'Series' | 'Episode';
  status: 'Active' | 'Inactive';
  vj: string;
  is_premium: 'Yes' | 'No';
  category_id: number;
  views_count: number;
  likes_count: number;
  episode_number?: string;
  season_number?: string;
  series_title?: string;
  is_first_episode?: 'Yes' | 'No';
  description: string;
  country: string;
  // Detail fields (only on single movie fetch)
  size?: string;
  director?: string;
  stars?: string;
  actor?: string;
  external_url?: string;
  poster_url?: string;
  imdb_rating?: number;
  munowatch_id?: string;
  is_muno?: 'Yes' | 'No';
  content_type?: 'video' | 'audio';
  content_is_video?: boolean;
  episode_title?: string;
}

export interface MoviesPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface MoviesV2Response {
  items: MovieV2[];
  pagination: MoviesPagination;
}

class MoviesV2Service {
  /**
   * List movies/series with filters — GET /api/v2/movies
   */
  static async getMovies(params: MoviesV2Params = {}): Promise<MoviesV2Response> {
    const query: Record<string, any> = {
      page: params.page || 1,
      per_page: params.per_page || 20,
    };
    if (params.type) query.type = params.type;
    if (params.genre) query.genre = params.genre;
    if (params.language) query.language = params.language;
    if (params.vj) query.vj = params.vj;
    if (params.year) query.year = params.year;
    if (params.status) query.status = params.status;
    if (params.sort) query.sort = params.sort;

    const response = await http_get('v2/movies', query);
    return response.data;
  }

  /**
   * Search movies — GET /api/v2/movies/search
   */
  static async searchMovies(q: string, page = 1, per_page = 20): Promise<MoviesV2Response> {
    const response = await http_get('v2/movies/search', { q, page, per_page });
    return response.data;
  }

  /**
   * Single movie detail — GET /api/v2/movies/{id}
   */
  static async getMovie(id: number): Promise<MovieV2> {
    const response = await http_get(`v2/movies/${id}`);
    return response.data?.movie || response.data;
  }

  /**
   * Related movies — GET /api/v2/movies/{id}/related
   */
  static async getRelatedMovies(id: number): Promise<MovieV2[]> {
    const response = await http_get(`v2/movies/${id}/related`);
    return response.data?.items || response.data || [];
  }

  /**
   * Report playback event — POST /api/v2/movies/{id}/playback
   */
  static async reportPlayback(id: number): Promise<void> {
    await http_post(`v2/movies/${id}/playback`, {});
  }
}

export default MoviesV2Service;
