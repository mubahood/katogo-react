// API Configuration for UgFlix Streaming Platform
export const API_ENDPOINTS = {
  // Base URL for Laravel backend API
  BASE_URL: import.meta.env.VITE_API_URL || 'https://katogo.schooldynamics.ug',
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    USER_PROFILE: '/auth/user',
  },

  // Streaming manifest endpoints
  MANIFEST: {
    GET: '/manifest',
    CATEGORIES: '/manifest/categories',
    FEATURED: '/manifest/featured',
    TRENDING: '/manifest/trending',
    CONTINUE_WATCHING: '/manifest/continue-watching',
    RECOMMENDATIONS: '/manifest/recommendations',
    SEARCH: '/manifest/search',
  },

  // Movie/Content endpoints
  MOVIES: {
    LIST: '/movies',
    DETAILS: '/movies/:id',
    WATCH_PROGRESS: '/movies/:id/progress',
    EPISODES: '/movies/:id/episodes',
    SIMILAR: '/movies/:id/similar',
    REVIEWS: '/movies/:id/reviews',
    RATING: '/movies/:id/rate',
  },

  // User profile and preferences
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    WATCHLIST: '/user/watchlist',
    ADD_TO_WATCHLIST: '/user/watchlist',
    REMOVE_FROM_WATCHLIST: '/user/watchlist/:id',
    FAVORITES: '/user/favorites',
    ADD_TO_FAVORITES: '/user/favorites',
    REMOVE_FROM_FAVORITES: '/user/favorites/:id',
    VIEWING_HISTORY: '/user/history',
    PREFERENCES: '/user/preferences',
    UPDATE_PREFERENCES: '/user/preferences',
  },

  // Subscription management
  SUBSCRIPTION: {
    PLANS: '/subscription/plans',
    CURRENT: '/subscription/current',
    SUBSCRIBE: '/subscription/subscribe',
    CANCEL: '/subscription/cancel',
    UPGRADE: '/subscription/upgrade',
    DOWNGRADE: '/subscription/downgrade',
    BILLING_HISTORY: '/subscription/billing',
  },

  // Content search and discovery
  SEARCH: {
    GLOBAL: '/search',
    MOVIES: '/search/movies',
    SHOWS: '/search/shows',
    ACTORS: '/search/actors',
    SUGGESTIONS: '/search/suggestions',
  },

  // Admin endpoints (if user has admin privileges)
  ADMIN: {
    MOVIES: '/admin/movies',
    USERS: '/admin/users',
    SUBSCRIPTIONS: '/admin/subscriptions',
    ANALYTICS: '/admin/analytics',
    CONTENT_MODERATION: '/admin/moderation',
  }
};

// API request configuration
export const API_CONFIG = {
  // Default headers for all API requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 1000,
  },

  // Token storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'ugflix_auth_token',
    USER_DATA: 'ugflix_user',
    REFRESH_TOKEN: 'ugflix_refresh_token',
    PREFERENCES: 'ugflix_user_preferences',
  },
};

// Helper function to build API URLs with parameters
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = API_ENDPOINTS.BASE_URL + endpoint;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export default API_ENDPOINTS;