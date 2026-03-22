// src/app/pages/blog/BlogPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Newspaper, Eye, Heart, MessageCircle, Pin,
  RefreshCw, Loader, AlertCircle,
} from 'lucide-react';
import BlogV2Service from '../../services/v2/BlogV2Service';
import type { BlogPost, BlogPagination } from '../../services/v2/BlogV2Service';
import { getImageUrl } from '../../utils/imageUtils';

/* ── Shimmer skeleton ──────────────────────────────────────────────────── */
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/[0.04] rounded-lg ${className}`} />
);

const ListSkeleton = () => (
  <div className="space-y-4">
    <Shimmer className="h-[260px] rounded-xl" />
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

/* ── Hero card (first/pinned post) ─────────────────────────────────────── */
const HeroCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <Link
    to={`/blog/${post.id}`}
    className="group relative block rounded-xl overflow-hidden mb-5 no-underline"
  >
    <div className="aspect-[16/9] sm:aspect-[2/1] bg-[#161630]">
      {post.image_url ? (
        <img
          src={getImageUrl(post.image_url)}
          alt={post.title}
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
      <div className="flex items-center gap-2 mb-2">
        {post.category && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF9800] text-black px-2 py-0.5 rounded">
            {post.category}
          </span>
        )}
        {post.is_pinned && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--color-brand-gold,#F5A623)] text-black px-2 py-0.5 rounded flex items-center gap-0.5">
            <Pin size={8} /> Pinned
          </span>
        )}
      </div>
      <h2 className="text-white font-bold text-lg sm:text-xl leading-tight line-clamp-3 mb-2">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="text-white/60 text-sm line-clamp-2 mb-3 hidden sm:block">
          {post.excerpt.replace(/<[^>]*>/g, '')}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>{post.author_name}</span>
        <span>{post.time_ago}</span>
        <span className="flex items-center gap-1"><Eye size={11} /> {post.views_count}</span>
        <span className="flex items-center gap-1"><Heart size={11} /> {post.likes_count}</span>
      </div>
    </div>
  </Link>
);

/* ── Compact list card ─────────────────────────────────────────────────── */
const CompactCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <Link
    to={`/blog/${post.id}`}
    className="group flex gap-3 py-3 border-b border-white/[0.04] last:border-0 no-underline"
  >
    {/* Thumbnail */}
    <div className="shrink-0 w-[120px] sm:w-[140px] aspect-[16/10] rounded-lg overflow-hidden bg-[#161630]">
      {post.image_url ? (
        <img
          src={getImageUrl(post.image_url)}
          alt={post.title}
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
        <div className="flex items-center gap-2 mb-1">
          {post.category && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF9800]">
              {post.category}
            </span>
          )}
          {post.is_pinned && (
            <Pin size={10} className="text-[var(--color-brand-gold,#F5A623)]" />
          )}
        </div>
        <h3 className="text-[13px] sm:text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-[#FF9800] transition-colors">
          {post.title}
        </h3>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
        <span>{post.time_ago}</span>
        <span className="flex items-center gap-0.5"><Eye size={9} /> {post.views_count}</span>
        <span className="flex items-center gap-0.5"><Heart size={9} /> {post.likes_count}</span>
        <span className="flex items-center gap-0.5"><MessageCircle size={9} /> {post.comments_count}</span>
      </div>
    </div>
  </Link>
);

/* ── Sort tabs ─────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
] as const;
type SortKey = typeof SORT_OPTIONS[number]['key'];

/* ═══════════════════════════════════════════════════════════════════════ */
const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<BlogPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('latest');
  const [page, setPage] = useState(1);

  /* ── Fetch posts ─────────────────────────────────────────────────────── */
  const fetchPosts = useCallback(async (pg: number, reset: boolean) => {
    reset ? setLoading(true) : setLoadingMore(true);
    setError(null);
    try {
      const res = await BlogV2Service.getPosts({ page: pg, per_page: 15 });
      const sorted = sort === 'popular'
        ? [...res.posts].sort((a, b) => b.views_count - a.views_count)
        : res.posts;
      setPosts(prev => reset ? sorted : [...prev, ...sorted]);
      setPagination(res.pagination);
      setPage(pg);
    } catch {
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort]);

  useEffect(() => { fetchPosts(1, true); }, [fetchPosts]);

  const handleRefresh = () => fetchPosts(1, true);
  const handleLoadMore = () => {
    if (!pagination || page >= pagination.last_page || loadingMore) return;
    fetchPosts(page + 1, false);
  };

  const handleSort = (key: SortKey) => {
    if (key === sort) return;
    setSort(key);
  };

  const hasMore = pagination ? page < pagination.last_page : false;
  const heroPost = posts[0];
  const restPosts = posts.slice(1);

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-white text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BookOpen size={22} className="text-[#FF9800]" />
              Blog
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">Stories, updates &amp; behind the scenes</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all disabled:opacity-40"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

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
              {pagination.total} post{pagination.total !== 1 ? 's' : ''}
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
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No news available yet</p>
            <p className="text-gray-700 text-xs mt-1">Check back later for updates</p>
          </div>
        ) : (
          <>
            {heroPost && <HeroCard post={heroPost} />}

            <div className="divide-y divide-white/[0.04]">
              {restPosts.map(post => (
                <CompactCard key={post.id} post={post} />
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

export default BlogPage;
