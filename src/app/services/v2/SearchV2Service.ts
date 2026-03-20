// src/app/services/v2/SearchV2Service.ts
// Uses /api/v2/search/* endpoints
// 6-phase relevance-scored search: movies + series

import { http_get } from '../Api';
import { MovieV2, MoviesPagination } from './MoviesV2Service';

export interface SearchV2Result {
  items: MovieV2[];
  pagination: MoviesPagination;
}

export interface SearchSuggestion {
  type: 'movie' | 'series' | 'vj' | 'genre';
  id?: number;
  title: string;
  thumbnail_url?: string;
}

export interface SearchTrending {
  trending_terms: string[];
  popular_movies: MovieV2[];
  popular_series: MovieV2[];
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  searched_at: string;
}

class SearchV2Service {
  /**
   * Combined movies + series search — GET /api/v2/search/all
   * Minimum query length: 2 characters
   */
  static async searchAll(q: string, page = 1, per_page = 20): Promise<SearchV2Result> {
    const response = await http_get('v2/search/all', { q, page, per_page });
    return response.data;
  }

  /**
   * Live autocomplete suggestions — GET /api/v2/search/all/suggestions
   * Call debounced as user types (300ms recommended)
   */
  static async getSuggestions(q: string): Promise<SearchSuggestion[]> {
    const response = await http_get('v2/search/all/suggestions', { q });
    return response.data?.suggestions || response.data || [];
  }

  /**
   * Trending searches + popular content — GET /api/v2/search/all/trending
   */
  static async getTrending(): Promise<SearchTrending> {
    const response = await http_get('v2/search/all/trending');
    return response.data || { trending_terms: [], popular_movies: [], popular_series: [] };
  }

  /**
   * User's search history — GET /api/v2/search/history
   * Requires authentication
   */
  static async getSearchHistory(page = 1, per_page = 20): Promise<{
    items: SearchHistoryItem[];
    pagination: MoviesPagination;
  }> {
    const response = await http_get('v2/search/history', { page, per_page });
    return response.data;
  }

  /**
   * Delete a single search history entry — DELETE /api/v2/search/history/{id}
   */
  static async deleteHistoryItem(id: number): Promise<void> {
    // http_post with _method DELETE (Laravel convention)
    const { http_post } = await import('../Api');
    await http_post(`v2/search/history/${id}`, { _method: 'DELETE' });
  }

  /**
   * Clear all search history — DELETE /api/v2/search/history
   */
  static async clearSearchHistory(): Promise<void> {
    const { http_post } = await import('../Api');
    await http_post('v2/search/history', { _method: 'DELETE' });
  }
}

export default SearchV2Service;
