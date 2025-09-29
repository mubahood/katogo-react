// src/app/types/User.ts

/**
 * Enhanced User interface for UgFlix streaming service
 * Includes all streaming-specific features and preferences
 */
export interface StreamingUser {
  // Basic user information
  id: number;
  name: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar?: string;
  
  // Account metadata
  created_at: string;
  updated_at: string;
  last_online_at?: string;
  email_verified_at?: string;
  
  // Subscription and billing
  subscription_tier: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
  subscription_status: 'active' | 'expired' | 'free';
  credits_balance: number;
  auto_renew_subscription: boolean;
  subscription_started_at?: string;
  last_subscription_renewal?: string;
  days_until_expiration: number;
  
  // Viewing preferences
  preferred_genres: string[];
  preferred_language: string;
  content_rating_preference: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  autoplay_enabled: boolean;
  default_video_quality: 'auto' | '480p' | '720p' | '1080p' | '4k';
  
  // User statistics and activity
  total_watch_minutes: number;
  movies_watched_count: number;
  series_watched_count: number;
  first_watch_date?: string;
  last_watch_date?: string;
  profile_completion_percentage: number;
  
  // Content lists and preferences
  watchlist_movie_ids: number[];
  favorite_movie_ids: number[];
  liked_movie_ids: number[];
  disliked_movie_ids: number[];
  
  // Parental controls
  parental_controls_enabled: boolean;
  parental_control_pin?: string;
  blocked_content_ratings: string[];
  blocked_genres: string[];
  
  // Notification preferences
  email_notifications: boolean;
  push_notifications: boolean;
  new_content_notifications: boolean;
  recommendation_notifications: boolean;
  subscription_notifications: boolean;
  
  // Device and streaming preferences
  preferred_platform?: 'web' | 'mobile' | 'tv';
  download_enabled: boolean;
  download_quality: '480p' | '720p' | '1080p';
  max_concurrent_streams: number;
  
  // Privacy and sharing settings
  profile_public: boolean;
  share_watch_activity: boolean;
  allow_friend_recommendations: boolean;
  
  // Security settings
  require_pin_for_premium: boolean;
  max_devices: number;
  registered_devices: DeviceInfo[];
  
  // Computed properties
  streaming_stats: StreamingStats;
  continue_watching: ContinueWatchingItem[];
  personalized_genres: string[];
}

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: 'web' | 'mobile' | 'tablet' | 'tv';
  platform: string;
  last_active: string;
  registered_at: string;
}

export interface StreamingStats {
  total_watch_time_hours: number;
  movies_watched: number;
  series_watched: number;
  subscription_status: string;
  days_until_expiration: number;
  profile_completion: number;
  watchlist_count: number;
  favorites_count: number;
  member_since?: string;
  last_watch?: string;
}

export interface ContinueWatchingItem {
  id: number;
  title: string;
  thumbnail_url: string;
  progress: number; // 0-100 percentage
  last_watched: string;
  duration_minutes: number;
  type: 'Movie' | 'Series';
  season?: number;
  episode?: number;
}

/**
 * User authentication and registration types
 */
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password: string;
  password_confirmation: string;
  preferred_language?: string;
  marketing_consent?: boolean;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    user: StreamingUser;
    token: string;
    expires_in: number;
    token_type: string;
  };
}

/**
 * User profile update types
 */
export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  preferred_genres?: string[];
  preferred_language?: string;
  content_rating_preference?: string;
  autoplay_enabled?: boolean;
  default_video_quality?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  download_enabled?: boolean;
  profile_public?: boolean;
  share_watch_activity?: boolean;
}

export interface UserPreferencesUpdate {
  preferred_genres?: string[];
  content_rating_preference?: string;
  autoplay_enabled?: boolean;
  default_video_quality?: string;
  parental_controls_enabled?: boolean;
  blocked_content_ratings?: string[];
  blocked_genres?: string[];
}

/**
 * Subscription management types
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'premium' | 'vip';
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_concurrent_streams: number;
  download_enabled: boolean;
  max_devices: number;
  ultra_hd_available: boolean;
}

export interface SubscriptionUpdate {
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  auto_renew: boolean;
  payment_method_id?: string;
}

/**
 * Watchlist and favorites management
 */
export interface WatchlistAction {
  movie_id: number;
  action: 'add' | 'remove';
}

export interface FavoriteAction {
  movie_id: number;
  action: 'add' | 'remove';
}

export interface MovieRating {
  movie_id: number;
  rating: 'like' | 'dislike' | 'neutral';
}

/**
 * User activity and progress tracking
 */
export interface ViewProgress {
  movie_id: number;
  progress_seconds: number;
  total_seconds: number;
  progress_percentage: number;
  last_watched_at: string;
  device_info?: DeviceInfo;
}

export interface WatchHistory {
  id: number;
  movie_id: number;
  movie_title: string;
  movie_thumbnail: string;
  watch_date: string;
  progress_percentage: number;
  duration_minutes: number;
  completed: boolean;
  type: 'Movie' | 'Series';
}

/**
 * User settings and configuration
 */
export interface UserSettings {
  // Playback settings
  autoplay_enabled: boolean;
  default_video_quality: string;
  subtitles_enabled: boolean;
  subtitle_language: string;
  audio_language: string;
  
  // Privacy settings
  profile_public: boolean;
  share_watch_activity: boolean;
  allow_friend_recommendations: boolean;
  
  // Notification settings
  email_notifications: boolean;
  push_notifications: boolean;
  new_content_notifications: boolean;
  recommendation_notifications: boolean;
  
  // Parental controls
  parental_controls_enabled: boolean;
  blocked_content_ratings: string[];
  blocked_genres: string[];
  require_pin_for_premium: boolean;
  
  // Device settings
  download_enabled: boolean;
  download_quality: string;
  max_concurrent_streams: number;
  offline_downloads_limit: number;
}

/**
 * User onboarding and profile setup
 */
export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface ProfileSetup {
  genres_selection: string[];
  content_rating: string;
  language_preference: string;
  notification_preferences: boolean[];
  avatar_upload?: File;
  parental_controls_setup?: boolean;
}

/**
 * Social features (if implemented)
 */
export interface UserProfile {
  id: number;
  display_name: string;
  avatar: string;
  bio?: string;
  public_watchlist: boolean;
  follower_count?: number;
  following_count?: number;
  favorite_genres: string[];
  member_since: string;
  total_watch_time: string;
}

export interface FriendRecommendation {
  id: number;
  from_user: UserProfile;
  movie_id: number;
  movie_title: string;
  movie_thumbnail: string;
  message?: string;
  recommended_at: string;
  viewed: boolean;
}

// Export type guards for runtime type checking
export const isStreamingUser = (obj: any): obj is StreamingUser => {
  return obj && typeof obj.id === 'number' && typeof obj.email === 'string';
};

export const isAuthResponse = (obj: any): obj is AuthResponse => {
  return obj && typeof obj.code === 'number' && obj.data && obj.data.user && obj.data.token;
};