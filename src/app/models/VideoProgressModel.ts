// src/app/models/VideoProgressModel.ts

export interface VideoProgress {
  id?: number;
  movie_model_id: number;
  user_id?: number;
  progress: number; // Current playback position in seconds
  max_progress: number; // Furthest point watched in seconds
  duration: number; // Total video duration in seconds
  percentage: number; // Percentage watched (progress/duration * 100)
  last_watched_at: string; // ISO timestamp
  device: string; // Device identifier
  platform: string; // Web, Android, iOS
  browser: string; // Browser information
  ip_address?: string;
  country?: string;
  city?: string;
  status: 'Active' | 'Completed' | 'Paused';
  created_at?: string;
  updated_at?: string;
}

export interface VideoResumeInfo {
  canResume: boolean;
  progress: number;
  duration: number;
  percentage: number;
  lastWatchedAt: string;
  formattedProgress: string;
  formattedDuration: string;
}

export interface UserPreferences {
  volume: number; // 0.0 to 1.0
  muted: boolean;
  playbackRate: number; // 0.5, 0.75, 1, 1.25, 1.5, 2
  autoplay: boolean;
  quality?: string; // '720p', '1080p', 'auto'
  subtitles?: boolean;
  language?: string;
}

export interface WatchHistoryItem {
  id: number;
  movie_id: number;
  movie_title: string;
  movie_thumbnail: string;
  progress: number;
  duration: number;
  percentage: number;
  last_watched_at: string;
  device: string;
  status: string;
}

export class VideoProgressModel {
  /**
   * Format time in seconds to HH:MM:SS or MM:SS format
   */
  static formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate percentage watched
   */
  static calculatePercentage(progress: number, duration: number): number {
    if (duration <= 0) return 0;
    return Math.round((progress / duration) * 100);
  }

  /**
   * Determine if video should be marked as completed
   */
  static isCompleted(progress: number, duration: number): boolean {
    const percentage = this.calculatePercentage(progress, duration);
    return percentage >= 90; // Consider 90%+ as completed
  }

  /**
   * Determine if user can resume (watched more than 2 minutes and less than 90%)
   */
  static canResume(progress: number, duration: number): boolean {
    const minResumeTime = 120; // 2 minutes
    return progress >= minResumeTime && !this.isCompleted(progress, duration);
  }

  /**
   * Create resume info object
   */
  static createResumeInfo(progress: VideoProgress): VideoResumeInfo {
    return {
      canResume: this.canResume(progress.progress, progress.duration),
      progress: progress.progress,
      duration: progress.duration,
      percentage: progress.percentage,
      lastWatchedAt: progress.last_watched_at,
      formattedProgress: this.formatTime(progress.progress),
      formattedDuration: this.formatTime(progress.duration)
    };
  }

  /**
   * Get device information
   */
  static getDeviceInfo(): { device: string; platform: string; browser: string } {
    const userAgent = navigator.userAgent;
    
    // Detect platform
    let platform = 'Web';
    if (/Android/i.test(userAgent)) platform = 'Android';
    else if (/iPhone|iPad|iPod/i.test(userAgent)) platform = 'iOS';
    else if (/Windows/i.test(userAgent)) platform = 'Windows';
    else if (/Mac/i.test(userAgent)) platform = 'macOS';
    else if (/Linux/i.test(userAgent)) platform = 'Linux';

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Generate device ID
    const device = `${platform}-${browser}-${Date.now()}`;

    return { device, platform, browser };
  }
}