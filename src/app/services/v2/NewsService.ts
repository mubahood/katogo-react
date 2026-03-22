// src/app/services/v2/NewsService.ts
// WordPress REST API at ugnews24.info — Local News (separate from Blog)

const NEWS_BASE_URL = 'https://ugnews24.info';
const REST_BASE = '/muhindo/v1';

function apiUrl(path: string): string {
  return `${NEWS_BASE_URL}/index.php?rest_route=${REST_BASE}${path}`;
}

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface NewsAuthor {
  id: number;
  name: string;
  avatar: string;
}

export interface NewsThumbnail {
  medium: string;
  full: string;
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

export interface NewsInteractions {
  read: number;
  like: number;
  share: number;
  comment: number;
}

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  date_formatted: string;
  modified: string;
  link: string;
  author: NewsAuthor;
  thumbnail: NewsThumbnail;
  categories: NewsCategory[];
  tags: { id: number; name: string; slug: string }[];
  comment_count: number;
  interactions: NewsInteractions;
  media: string[];
  trending_reads: number;
}

export interface NewsPagination {
  total: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  has_more: boolean;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function parseArticle(j: Record<string, any>): NewsArticle {
  return {
    id: Number(j.id) || 0,
    slug: j.slug ?? '',
    title: j.title ?? '',
    excerpt: j.excerpt ?? '',
    content: j.content ?? '',
    date: j.date ?? '',
    date_formatted: j.date_formatted ?? '',
    modified: j.modified ?? '',
    link: j.link ?? '',
    author: {
      id: Number(j.author?.id) || 0,
      name: j.author?.name ?? '',
      avatar: j.author?.avatar ?? '',
    },
    thumbnail: {
      medium: j.thumbnail?.medium ?? '',
      full: j.thumbnail?.full ?? '',
    },
    categories: Array.isArray(j.categories)
      ? j.categories.map((c: any) => ({ id: Number(c.id) || 0, name: c.name ?? '', slug: c.slug ?? '' }))
      : [],
    tags: Array.isArray(j.tags)
      ? j.tags.map((t: any) => ({ id: Number(t.id) || 0, name: t.name ?? '', slug: t.slug ?? '' }))
      : [],
    comment_count: Number(j.comment_count) || 0,
    interactions: {
      read: Number(j.interactions?.read) || 0,
      like: Number(j.interactions?.like) || 0,
      share: Number(j.interactions?.share) || 0,
      comment: Number(j.interactions?.comment) || 0,
    },
    media: Array.isArray(j.media) ? j.media.map(String) : [],
    trending_reads: Number(j.trending_reads) || 0,
  };
}

function parsePagination(j: Record<string, any> | null): NewsPagination {
  if (!j) return { total: 0, total_pages: 0, current_page: 1, per_page: 10, has_more: false };
  return {
    total: Number(j.total) || 0,
    total_pages: Number(j.total_pages) || 0,
    current_page: Number(j.current_page) || 1,
    per_page: Number(j.per_page) || 10,
    has_more: j.has_more === true,
  };
}

/** Best available image for an article */
export function getNewsImageUrl(article: NewsArticle): string {
  if (article.thumbnail.medium) return article.thumbnail.medium;
  if (article.thumbnail.full) return article.thumbnail.full;
  if (article.media.length > 0) return article.media[0];
  return '';
}

/** First category name */
export function getNewsCategoryName(article: NewsArticle): string {
  return article.categories.length > 0 ? article.categories[0].name : '';
}

/* ── Service ───────────────────────────────────────────────────────────── */

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

class NewsService {
  /**
   * Paginated news listing with filters
   * GET /muhindo/v1/news
   */
  static async getNews(params: {
    page?: number;
    perPage?: number;
    sort?: string;
    category?: string;
    search?: string;
  } = {}): Promise<{ posts: NewsArticle[]; pagination: NewsPagination }> {
    const url = new URL(apiUrl('/news'));
    url.searchParams.set('page', String(params.page || 1));
    url.searchParams.set('per_page', String(params.perPage || 15));
    url.searchParams.set('sort', params.sort || 'date_desc');
    if (params.category) url.searchParams.set('category', params.category);
    if (params.search) url.searchParams.set('search', params.search);

    const data = await fetchJson(url.toString());

    let rawPosts: any[] = [];
    let rawPagination: any = null;

    if (data && typeof data === 'object') {
      if (Array.isArray(data.posts)) {
        rawPosts = data.posts;
        rawPagination = data.pagination ?? null;
      } else if (Array.isArray(data)) {
        rawPosts = data;
      }
    }

    return {
      posts: rawPosts.map(parseArticle),
      pagination: parsePagination(rawPagination),
    };
  }

  /**
   * Search news articles
   */
  static async searchNews(query: string, page = 1): Promise<{ posts: NewsArticle[]; pagination: NewsPagination }> {
    return NewsService.getNews({ search: query, page, perPage: 15 });
  }

  /**
   * Record an interaction (fire-and-forget)
   * POST /muhindo/v1/news/{id}/interact
   */
  static interact(postId: number, type: 'read' | 'like' | 'share', action: 'add' | 'remove' = 'add'): void {
    fetch(apiUrl(`/news/${postId}/interact`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, action }),
    }).catch(() => {});
  }
}

export default NewsService;
