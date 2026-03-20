// src/app/services/v2/ManifestV2Service.ts
// Uses /api/v2/manifest — cached 15 minutes on backend
// Returns home screen sections: featured, continue_watching, trending, popular,
// recommendations, categories, subscription_status, genres, vjs

import { http_get } from '../Api';
import { MovieV2 } from './MoviesV2Service';

export interface ManifestSection {
  title: string;
  items: MovieV2[];
}

export interface ManifestV2Response {
  featured?: MovieV2;
  continue_watching?: MovieV2[];
  trending?: MovieV2[];
  popular?: MovieV2[];
  recommendations?: MovieV2[];
  categories?: Array<{ id: number; name: string; slug: string }>;
  genres?: string[];
  vjs?: string[];
  subscription_status?: {
    is_active: boolean;
    days_remaining: number;
    plan_name?: string;
    end_date?: string;
  };
}

class ManifestV2Service {
  /**
   * Get home screen manifest — GET /api/v2/manifest
   * Cached 15 minutes on the backend
   */
  static async getManifest(): Promise<ManifestV2Response> {
    const response = await http_get('v2/manifest');
    return response.data || {};
  }
}

export default ManifestV2Service;
