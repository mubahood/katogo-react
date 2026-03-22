// src/app/services/v2/ManifestV2Service.ts
// Uses /api/v2/manifest — cached 15 minutes on backend
// Returns: featured, sections[], genres[], vjs[], config, subscription, stats

import { http_get } from '../Api';

/** Slim movie returned inside manifest sections (14 core fields) */
export interface ManifestMovie {
  id: number;
  title: string;
  url: string;
  thumbnail_url: string;
  genre: string;
  type: 'Movie' | 'Series' | 'Episode';
  vj: string;
  is_premium: 'Yes' | 'No';
  year: number | string;
  duration: string;
  rating: number;
  views: number;
  category_id: number | null;
  is_first_episode: string | null;
  // Continue-watching extras
  progress?: number;
  last_position?: number;
  watched_at?: string;
}

/** One horizontal row in the home screen */
export interface ManifestSection {
  key: string;
  title: string;
  icon: string;
  filter_params: Record<string, string>;
  items: ManifestMovie[];
}

export interface ManifestSubscription {
  has_active_subscription: boolean;
  days_remaining: number;
  hours_remaining: number;
  is_in_grace_period: boolean;
  subscription_status: string;
  end_date: string | null;
  require_subscription: boolean;
}

export interface ManifestConfig {
  app_version: number;
  update_notes: string;
  whatsapp_number: string;
  ios_link: string;
  android_link: string;
}

export interface ManifestStats {
  watchlist_count: number;
  watch_history_count: number;
  liked_movies_count: number;
  active_chats_count: number;
}

export interface ManifestV2Response {
  featured?: ManifestMovie;
  sections: ManifestSection[];
  genres: string[];
  vjs: string[];
  config?: ManifestConfig;
  subscription?: ManifestSubscription;
  stats?: ManifestStats;
}

class ManifestV2Service {
  static async getManifest(): Promise<ManifestV2Response> {
    const response = await http_get('v2/manifest');
    return response.data || { sections: [], genres: [], vjs: [] };
  }
}

export default ManifestV2Service;
