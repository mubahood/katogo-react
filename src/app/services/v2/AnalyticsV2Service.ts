// src/app/services/v2/AnalyticsV2Service.ts
// Uses /api/v2/safemode/* and /api/v2/downloads/* endpoints
// Track playback, progress, downloads

import { http_get, http_post } from '../Api';

export type SafemodeAction = 'view' | 'play' | 'like' | 'mylist';

export interface TrackActionParams {
  external_video_id: string | number;
  action: SafemodeAction;
  video_title?: string;
  category?: string;
  genre?: string;
}

export interface ProgressParams {
  external_video_id: string | number;
  progress_seconds: number;
  duration_seconds?: number;
  video_title?: string;
}

export interface DownloadParams {
  movie_model_id: number;
  download_type: 'gallery' | 'in_app';
  title?: string;
  genre?: string;
  vj?: string;
  url?: string;
}

class AnalyticsV2Service {
  /**
   * Track a user action on a video — POST /api/v2/safemode/track
   */
  static async trackAction(params: TrackActionParams): Promise<void> {
    try {
      await http_post('v2/safemode/track', params);
    } catch {
      // Analytics failures should never break the user experience
    }
  }

  /**
   * Save watch progress — POST /api/v2/safemode/progress
   */
  static async saveProgress(params: ProgressParams): Promise<void> {
    try {
      await http_post('v2/safemode/progress', params);
    } catch {
      // Silently fail — non-critical
    }
  }

  /**
   * Get progress for a video — GET /api/v2/safemode/progress/{external_video_id}
   */
  static async getProgress(externalVideoId: string | number): Promise<{
    progress_seconds: number;
    duration_seconds?: number;
  } | null> {
    try {
      const response = await http_get(`v2/safemode/progress/${externalVideoId}`);
      return response.data || null;
    } catch {
      return null;
    }
  }

  /**
   * Get SafeMode watch history — GET /api/v2/safemode/history
   */
  static async getHistory(page = 1, per_page = 20): Promise<any> {
    const response = await http_get('v2/safemode/history', { page, per_page });
    return response.data;
  }

  /**
   * Record a download event — POST /api/v2/downloads/record
   */
  static async recordDownload(params: DownloadParams): Promise<void> {
    try {
      await http_post('v2/downloads/record', params);
    } catch {
      // Silently fail
    }
  }

  /**
   * Get download stats — GET /api/v2/downloads/stats
   */
  static async getStats(movieModelId?: number, days = 30): Promise<any> {
    const query: Record<string, any> = { days };
    if (movieModelId) query.movie_model_id = movieModelId;
    const response = await http_get('v2/downloads/stats', query);
    return response.data;
  }

  /**
   * Delete a single progress entry — POST /api/video-progress/{movie_id}/delete
   */
  static async deleteProgress(movieId: number): Promise<void> {
    await http_post(`video-progress/${movieId}/delete`, { _method: 'DELETE' });
  }

  /**
   * Clear all watch history — POST /api/video-progress/clear-all
   */
  static async clearAllHistory(): Promise<void> {
    await http_post('video-progress/clear-all', {});
  }
}

export default AnalyticsV2Service;
