// src/app/pages/news/NewsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper, Eye, Heart, Search, X,
  RefreshCw, Loader, AlertCircle,
} from 'lucide-react';
import NewsService from '../../services/v2/NewsService';
import type { NewsArticle, NewsPagination } from '../../services/v2/NewsService';
import { getNewsImageUrl, getNewsCategoryName } from '../../services/v2/NewsService';

/* ── Shimmer skeleton ──────────────────────────────────────────────────── */
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/[0.04] rounded-lg ${className}`} />
);

const ListSkeleton = () => (
  <div className="space-y-4">
    <Shimmer className="h-[240px] rounded-xl" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex gap-3">
        <Shimmer className="w-[130px] h-[85px] shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2 py-1">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Strip HTML from excerpt ───────────────────────────────────────────── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

/* ── Hero card (first post) ────────────────────────────────────────────── */
const HeroCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const img = getNewsImageUrl(article);
  const cat = getNewsCategoryName(article);

  return (
    <Link
      to={`/news/${article.id}`}
      onClick={() => NewsService.interact(article.id, 'read')}
      className="group relative block rounded-xl overflow-hidden mb-5 no-underline"
    >
      <div className="aspect-[16/9] sm:aspect-[2/1] bg-[#161630]">
        {img ? (
          <img
            src={img}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper size={48} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
        {cat && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF9800] text-black px-2 py-0.5 rounded mb-2 inline-block">
            {cat}
          </span>
        )}
        <h2 className="text-white font-bold text-lg sm:text-xl leading-tight line-clamp-3 mb-2">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-white/60 text-sm line-clamp-2 mb-3 hidden sm:block">
            {stripHtml(article.excerpt)}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-white/40">
          {article.author.name && <span>{article.author.name}</span>}
          <span>{article.date_formatted || article.date}</span>
          <span className="flex items-center gap-1"><Eye size={11} /> {article.interactions.read}</span>
          <span className="flex items-center gap-1"><Heart size={11} /> {article.interactions.like}</span>
        </div>
      </div>
    </Link>
  );
};

/* ── Compact list card ─────────────────────────────────────────────────── */
const CompactCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const img = getNewsImageUrl(article);
  const cat = getNewsCategoryName(article);

  return (
    <Link
      to={`/news/${article.id}`}
      onClick={() => NewsService.interact(article.id, 'read')}
      className="group flex gap-3 py-3 border-b border-white/[0.04] last:border-0 no-underline"
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-[120px] sm:w-[140px] aspect-[16/10] rounded-lg overflow-hidden bg-[#161630]">
        {img ? (
          <img
            src={img}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper size={20} className="text-white/10" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {cat && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF9800] mb-1 inline-block">
              {cat}
            </span>
          )}
          <h3 className="text-[13px] sm:text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-[#FF9800] transition-colors">
            {article.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
          <span>{article.date_formatted || article.date}</span>
          <span className="flex items-center gap-0.5"><Eye size={9} /> {article.interactions.read}</span>
          <span className="flex items-center gap-0.5"><Heart size={9} /> {article.interactions.like}</span>
        </div>
      </div>
    </Link>
  );
};

/* ── Sort tabs ─────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
] as const;
type SortKey = typeof SORT_OPTIONS[number]['key'];

/* ═══════════════════════════════════════════════════════════════════════ */
const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [pagination, setPagination] = useState<NewsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [page, setPage] = useState(1);

  // search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch ───────────────────────────────────────────────────────────── */
  const fetchArticles = useCallback(async (pg: number, reset: boolean, search?: string) => {
    reset ? setLoading(true) : setLoadingMore(true);
    setError(null);
    try {
      const res = await NewsService.getNews({
        page: pg,
        perPage: 15,
        sort,
        search: search || undefined,
      });
      setArticles(prev => reset ? res.posts : [...prev, ...res.posts]);
      setPagination(res.pagination);
      setPage(pg);
    } catch {
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchArticles(1, true, searchQuery || undefined);
  }, [fetchArticles, sort]);

  const handleRefresh = () => fetchArticles(1, true, searchQuery || undefined);
  const handleLoadMore = () => {
    if (!pagination || page >= pagination.total_pages || loadingMore) return;
    fetchArticles(page + 1, false, searchQuery || undefined);
  };

  const handleSort = (key: SortKey) => {
    if (key === sort) return;
    setSort(key);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      fetchArticles(1, true, q || undefined);
    }, 500));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
    fetchArticles(1, true);
  };

  const hasMore = pagination ? page < pagination.total_pages : false;
  const heroArticle = articles[0];
  const restArticles = articles.slice(1);

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-white text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Newspaper size={22} className="text-[#FF9800]" />
              Local News
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">Uganda entertainment news &amp; updates</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all disabled:opacity-40"
              aria-label="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Search bar ───────────────────────────────────────────────── */}
        {searchOpen && (
          <div className="flex items-center gap-2 mb-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search news..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* ── Sort tabs ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-5">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                sort === key
                  ? 'bg-[#FF9800] text-black'
                  : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
          {pagination && (
            <span className="text-[10px] text-gray-600 ml-auto">
              {pagination.total} article{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg bg-[#FF9800]/10 border border-[#FF9800]/20 text-[#FF9800] text-sm hover:bg-[#FF9800]/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchQuery ? `No results for "${searchQuery}"` : 'No news available yet'}
            </p>
            <p className="text-gray-700 text-xs mt-1">Check back later for updates</p>
          </div>
        ) : (
          <>
            {heroArticle && <HeroCard article={heroArticle} />}

            <div className="divide-y divide-white/[0.04]">
              {restArticles.map(article => (
                <CompactCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><Loader size={14} className="animate-spin" /> Loading…</>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
