// src/app/services/v2/SeriesV2Service.ts
// Uses /api/v2/series endpoints

import { http_get } from '../Api';
import { MovieV2, MoviesPagination } from './MoviesV2Service';

export interface SeriesV2Params {
  page?: number;
  per_page?: number;
  sort?: string;
  genre?: string;
  language?: string;
  year?: number;
}

export interface SeriesV2Response {
  items: MovieV2[];
  pagination: MoviesPagination;
}

class SeriesV2Service {
  /**
   * List all series (first episodes only) — GET /api/v2/series
   */
  static async getSeries(params: SeriesV2Params = {}): Promise<SeriesV2Response> {
    const query: Record<string, any> = {
      page: params.page || 1,
      per_page: params.per_page || 20,
    };
    if (params.sort) query.sort = params.sort;
    if (params.genre) query.genre = params.genre;
    if (params.language) query.language = params.language;
    if (params.year) query.year = params.year;

    const response = await http_get('v2/series', query);
    return response.data;
  }

  /**
   * Get all episodes for a series — GET /api/v2/series/{id}/episodes
   */
  static async getEpisodes(seriesId: number): Promise<MovieV2[]> {
    const response = await http_get(`v2/series/${seriesId}/episodes`);
    return response.data?.episodes || response.data || [];
  }
}

export default SeriesV2Service;
