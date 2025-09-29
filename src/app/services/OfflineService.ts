// OfflineService.ts - Provides fallback data when API is unavailable
export class OfflineService {
  /**
   * Get default categories for offline mode
   */
  static getDefaultCategories() {
    return [
      {
        id: 1,
        name: 'Action',
        slug: 'action',
        description: 'Action movies and shows',
        icon: '💥',
        is_active: true,
        sort_order: 1,
        content_count: 0
      },
      {
        id: 2,
        name: 'Comedy',
        slug: 'comedy',
        description: 'Comedy movies and shows',
        icon: '😂',
        is_active: true,
        sort_order: 2,
        content_count: 0
      },
      {
        id: 3,
        name: 'Drama',
        slug: 'drama',
        description: 'Drama movies and shows',
        icon: '🎭',
        is_active: true,
        sort_order: 3,
        content_count: 0
      },
      {
        id: 4,
        name: 'Horror',
        slug: 'horror',
        description: 'Horror movies and shows',
        icon: '😱',
        is_active: true,
        sort_order: 4,
        content_count: 0
      },
      {
        id: 5,
        name: 'Romance',
        slug: 'romance',
        description: 'Romance movies and shows',
        icon: '💕',
        is_active: true,
        sort_order: 5,
        content_count: 0
      }
    ];
  }

  /**
   * Get default manifest for offline mode
   */
  static getDefaultManifest() {
    return {
      APP_VERSION: 20,
      platform_type: 'web',
      user_id: null,
      generated_at: new Date().toISOString(),
      top_movie: [{
        id: 1,
        title: 'Welcome to UgFlix',
        description: 'Your streaming platform for the best movies and shows.',
        thumbnail_url: '',
        url: '',
        genre: 'Entertainment',
        type: 'Movie',
        vj: '',
        is_premium: false,
        category_id: 1,
        category: 'Featured'
      }],
      lists: [
        {
          title: 'Featured Movies',
          movies: []
        },
        {
          title: 'Continue Watching',
          movies: []
        },
        {
          title: 'Trending Now',
          movies: []
        }
      ],
      genres: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi'],
      vj: [],
      UPDATE_NOTES: '🔧 Running in offline mode. Connect to server for full functionality.',
      WHATSAPP_CONTAT_NUMBER: '+256783204665'
    };
  }

  /**
   * Check if we're in offline mode (API not reachable)
   */
  static isOfflineMode(): boolean {
    // Simple check - could be enhanced with network status detection
    return !navigator.onLine;
  }
}