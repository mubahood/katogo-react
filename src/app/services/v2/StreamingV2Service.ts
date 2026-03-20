// src/app/services/v2/StreamingV2Service.ts
// Uses /api/v2/streaming/* endpoints
// Handles Live TV & Radio stations

import { http_get } from '../Api';

export interface Station {
  id: number;
  name: string;
  slug: string;
  type: 'TV' | 'Radio';
  category: string;
  frequency?: string;
  logo_url: string;
  language: string;
  region?: string;
  votes: number;
  listeners_count: number;
  is_featured: boolean;
  sort_order: number;
  description?: string;
  country: string;
  website_url?: string;
  stream_url?: string;
  created_at: string;
}

export interface StreamingCategory {
  id: number;
  name: string;
  slug: string;
  stations_count?: number;
}

export interface StationsParams {
  type?: 'TV' | 'Radio';
  category?: string;
  featured?: boolean;
  q?: string;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface StreamingHomeData {
  featured_stations?: Station[];
  tv_stations?: Station[];
  radio_stations?: Station[];
  categories?: StreamingCategory[];
}

class StreamingV2Service {
  /**
   * Streaming home page data — GET /api/v2/streaming/home
   */
  static async getHome(): Promise<StreamingHomeData> {
    const response = await http_get('v2/streaming/home');
    return response.data || {};
  }

  /**
   * List stations with filters — GET /api/v2/streaming/stations
   */
  static async getStations(params: StationsParams = {}): Promise<{ items: Station[]; pagination: any }> {
    const query: Record<string, any> = {
      page: params.page || 1,
      per_page: params.per_page || 20,
    };
    if (params.type) query.type = params.type;
    if (params.category) query.category = params.category;
    if (params.featured !== undefined) query.featured = params.featured ? 1 : 0;
    if (params.q) query.q = params.q;
    if (params.sort) query.sort = params.sort;

    const response = await http_get('v2/streaming/stations', query);
    return response.data;
  }

  /**
   * Single station detail — GET /api/v2/streaming/stations/{id}
   */
  static async getStation(id: number): Promise<Station> {
    const response = await http_get(`v2/streaming/stations/${id}`);
    return response.data?.station || response.data;
  }

  /**
   * Available station categories — GET /api/v2/streaming/categories
   */
  static async getCategories(): Promise<StreamingCategory[]> {
    const response = await http_get('v2/streaming/categories');
    return response.data?.categories || response.data || [];
  }
}

export default StreamingV2Service;
