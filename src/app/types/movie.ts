// src/app/types/movie.ts
// Canonical Movie types — all API v2 movie fields

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
  // Detail-only fields (returned on single movie fetch)
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
  movies: MovieV2[];
  category_type?: string;
  genre?: string;
  priority?: number;
}

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

export interface VideoProgress {
  movie_id: number;
  progress_seconds: number;
  duration_seconds?: number;
  percentage?: number;
  last_watched_at?: string;
}

export interface PlaybackFailure {
  movie_id: number;
  error_message: string;
  timestamp?: string;
}
