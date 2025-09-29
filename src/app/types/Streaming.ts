// src/app/types/Streaming.ts

import { StreamingUser } from './User';

/**
 * Movie and content types for streaming service
 */
export interface Movie {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  url: string;
  year?: number;
  genre?: string;
  duration?: number;
  duration_minutes?: number;
  rating_star?: number;
  views_count: number;
  downloads_count?: number;
  vj?: string;
  country?: string;
  platform_type?: string;
  status: 'Active' | 'Inactive';
  type: 'Movie' | 'Series';
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
  
  // User-specific fields (when authenticated)
  watched_movie?: 'Yes' | 'No';
  watch_progress?: number;
  max_progress?: number;
  watch_status?: string;
  user_rating?: 'like' | 'dislike' | null;
  in_watchlist?: boolean;
  in_favorites?: boolean;
}

export interface MovieCategoryList {
  title: string;
  movies: Movie[];
  category_type?: string;
  genre?: string;
  priority?: number;
}

export interface ManifestData {
  // App metadata
  APP_VERSION: number;
  UPDATE_NOTES: string;
  WHATSAPP_CONTACT_NUMBER: string;
  platform_type: string;
  user_id: number;
  generated_at: string;
  
  // Content data
  top_movie: Movie[];
  hero_content: Movie;
  lists: MovieCategoryList[];
  genres: string[];
  vj: string[];
  
  // User-specific data
  user_stats: UserStreamingStats;
  content_summary: ContentSummary;
}

export interface UserStreamingStats {
  total_watched: number;
  watch_time_minutes: number;
  last_active: string;
  member_since: string;
}

export interface ContentSummary {
  total_movies: number;
  total_series: number;
  total_hours: number;
  latest_added?: string;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  code: number; // 1 = success, 0 = error
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from?: number;
    to?: number;
  };
}

export interface MoviesResponse extends PaginatedResponse<Movie> {}

/**
 * Video player and streaming types
 */
export interface VideoPlayerConfig {
  autoplay: boolean;
  controls: boolean;
  fluid: boolean;
  responsive: boolean;
  quality: 'auto' | '480p' | '720p' | '1080p' | '4k';
  subtitles_enabled: boolean;
  volume: number;
  playback_rate: number;
}

export interface PlaybackSession {
  id: string;
  movie_id: number;
  user_id: number;
  session_start: string;
  last_heartbeat: string;
  current_time: number;
  duration: number;
  quality: string;
  device_info: DeviceInfo;
  bandwidth_kbps?: number;
}

export interface DeviceInfo {
  device_id: string;
  device_type: 'web' | 'mobile' | 'tablet' | 'tv';
  platform: string;
  browser?: string;
  screen_resolution?: string;
  user_agent: string;
}

/**
 * Search and filtering types
 */
export interface SearchFilters {
  query?: string;
  type?: 'Movie' | 'Series' | 'All';
  genre?: string;
  year?: number;
  year_from?: number;
  year_to?: number;
  rating_min?: number;
  is_premium?: boolean;
  duration_min?: number;
  duration_max?: number;
  sort_by?: 'title' | 'year' | 'rating' | 'views' | 'created_at';
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface SearchSuggestion {
  type: 'movie' | 'genre' | 'actor' | 'director';
  text: string;
  movie_id?: number;
  thumbnail?: string;
  year?: number;
}

/**
 * Content discovery and recommendations
 */
export interface RecommendationEngine {
  user_based: Movie[];
  content_based: Movie[];
  trending: Movie[];
  similar_to: Movie[];
  because_you_watched: {
    reference_movie: Movie;
    recommendations: Movie[];
  }[];
}

export interface ContentRating {
  movie_id: number;
  user_id: number;
  rating: number; // 1-5 stars
  review?: string;
  created_at: string;
}

/**
 * Download and offline viewing
 */
export interface DownloadItem {
  id: string;
  movie_id: number;
  movie_title: string;
  movie_thumbnail: string;
  download_url: string;
  quality: string;
  file_size: number;
  downloaded_at: string;
  expires_at?: string;
  local_path?: string;
  download_progress?: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'expired';
}

export interface OfflineStorageInfo {
  used_space_mb: number;
  available_space_mb: number;
  total_downloads: number;
  active_downloads: number;
  expired_downloads: number;
}

/**
 * Subscription and billing types
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'vip';
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: PlanFeature[];
  limits: PlanLimits;
  popular?: boolean;
  trial_days?: number;
}

export interface PlanFeature {
  key: string;
  name: string;
  description: string;
  included: boolean;
}

export interface PlanLimits {
  concurrent_streams: number;
  download_limit: number;
  max_devices: number;
  ultra_hd: boolean;
  ads_free: boolean;
  offline_downloads: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  last_four?: string;
  brand?: string;
  expires_at?: string;
  is_default: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  plan_name: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  due_date: string;
  paid_at?: string;
  download_url?: string;
}

/**
 * Analytics and insights
 */
export interface ViewingAnalytics {
  total_watch_time: number;
  favorite_genres: GenreStats[];
  watch_patterns: {
    hourly_distribution: number[];
    daily_distribution: number[];
    monthly_distribution: number[];
  };
  device_usage: {
    device_type: string;
    usage_percentage: number;
    total_hours: number;
  }[];
  completion_rates: {
    movies: number;
    series: number;
    overall: number;
  };
}

export interface GenreStats {
  genre: string;
  watch_count: number;
  total_minutes: number;
  average_rating: number;
}

/**
 * Social and sharing features
 */
export interface UserActivity {
  type: 'watched' | 'liked' | 'added_to_watchlist' | 'rated' | 'shared';
  movie_id: number;
  movie_title: string;
  movie_thumbnail: string;
  timestamp: string;
  visibility: 'public' | 'friends' | 'private';
}

export interface SharedContent {
  id: string;
  movie_id: number;
  shared_by: StreamingUser;
  shared_with?: StreamingUser[];
  message?: string;
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link';
  created_at: string;
  view_count: number;
}

/**
 * Notifications and alerts
 */
export interface NotificationPreferences {
  new_releases: boolean;
  personalized_recommendations: boolean;
  subscription_reminders: boolean;
  watch_progress_reminders: boolean;
  friend_activity: boolean;
  promotional_offers: boolean;
  system_updates: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  read: boolean;
  created_at: string;
  expires_at?: string;
  image_url?: string;
}

/**
 * Error handling and API states
 */
export interface ApiError {
  code: number;
  message: string;
  details?: any;
  field_errors?: { [key: string]: string[] };
}

export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
  lastUpdated?: string;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

/**
 * Form validation and input types
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  placeholder?: string;
  value: any;
  error?: string;
  rules?: ValidationRule[];
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

// Export commonly used type guards
export const isMovie = (obj: any): obj is Movie => {
  return obj && typeof obj.id === 'number' && typeof obj.title === 'string';
};

export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return obj && typeof obj.code === 'number' && typeof obj.message === 'string';
};

export const isApiError = (obj: any): obj is ApiError => {
  return obj && typeof obj.code === 'number' && typeof obj.message === 'string';
};