// src/app/pages/news/NewsDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Eye, Heart, Share2, Newspaper,
  Loader, AlertCircle,
} from 'lucide-react';
import NewsService from '../../services/v2/NewsService';
import type { NewsArticle } from '../../services/v2/NewsService';
import { getNewsImageUrl, getNewsCategoryName } from '../../services/v2/NewsService';

/* ── Shimmer ───────────────────────────────────────────────────────────── */
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/[0.04] rounded-lg ${className}`} />
);

const DetailSkeleton = () => (
  <div className="space-y-4">
    <Shimmer className="h-[260px] rounded-xl" />
    <Shimmer className="h-5 w-20" />
    <Shimmer className="h-7 w-full" />
    <Shimmer className="h-7 w-3/4" />
    <div className="flex gap-4">
      <Shimmer className="h-4 w-24" />
      <Shimmer className="h-4 w-24" />
    </div>
    <Shimmer className="h-12 w-full rounded-xl" />
    <Shimmer className="h-4 w-full" />
    <Shimmer className="h-4 w-full" />
    <Shimmer className="h-4 w-2/3" />
  </div>
);

/* ── Strip adsense / source-link junk from HTML ────────────────────────── */
function cleanContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<ins[\s\S]*?<\/ins>/gi, '')
    .replace(/<a[^>]*>Source link<\/a>/gi, '');
}

/* ── Related article card ──────────────────────────────────────────────── */
const RelatedCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const img = getNewsImageUrl(article);
  return (
    <Link
      to={`/news/${article.id}`}
      onClick={() => NewsService.interact(article.id, 'read')}
      className="group flex gap-3 py-3 border-b border-white/[0.04] last:border-0 no-underline"
    >
      <div className="shrink-0 w-[90px] aspect-[16/10] rounded-lg overflow-hidden bg-[#161630]">
        {img ? (
          <img
            src={img}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper size={16} className="text-white/10" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2 group-hover:text-[#FF9800] transition-colors">
          {article.title}
        </h4>
        <span className="text-[10px] text-gray-600 mt-1 block">
          {article.date_formatted || article.date}
        </span>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════════════ */
const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [related, setRelated] = useState<NewsArticle[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  /* ── Fetch article by loading page 1 and finding by id ────────────── */
  const fetchArticle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      // The WordPress API doesn't have a GET-by-id endpoint exposed;
      // we fetch paginated results and search. Try search by id first.
      const res = await NewsService.getNews({ page: 1, perPage: 50 });
      const found = res.posts.find(p => String(p.id) === id);
      if (found) {
        setArticle(found);
        setLikeCount(found.interactions.like);
        setReadCount(found.interactions.read);
        // Record read
        NewsService.interact(found.id, 'read');
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* ── Related articles ──────────────────────────────────────────────── */
  const fetchRelated = useCallback(async (art: NewsArticle) => {
    setLoadingRelated(true);
    try {
      const cat = getNewsCategoryName(art);
      // Try searching by title keywords
      const keywords = art.title.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' ');
      let posts: NewsArticle[] = [];
      if (keywords) {
        const res = await NewsService.searchNews(keywords, 1);
        posts = res.posts.filter(p => p.id !== art.id).slice(0, 5);
      }
      // Fallback: fetch latest and filter
      if (posts.length < 3) {
        const res = await NewsService.getNews({ page: 1, perPage: 10, sort: 'date_desc', category: cat || undefined });
        const extra = res.posts.filter(p => p.id !== art.id && !posts.some(pp => pp.id === p.id));
        posts = [...posts, ...extra].slice(0, 5);
      }
      setRelated(posts);
    } catch {
      // silent fail for related
    } finally {
      setLoadingRelated(false);
    }
  }, []);

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [fetchArticle]);

  useEffect(() => {
    if (article) fetchRelated(article);
  }, [article, fetchRelated]);

  /* ── Interactions ────────────────────────────────────────────────────── */
  const handleLike = () => {
    if (!article) return;
    const next = !liked;
    setLiked(next);
    setLikeCount(c => c + (next ? 1 : -1));
    NewsService.interact(article.id, 'like', next ? 'add' : 'remove');
  };

  const handleShare = async () => {
    if (!article) return;
    const url = article.link || `${window.location.origin}/news/${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
        NewsService.interact(article.id, 'share');
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      NewsService.interact(article.id, 'share');
    }
  };

  const img = article ? getNewsImageUrl(article) : null;
  const cat = article ? getNewsCategoryName(article) : null;

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <div className="max-w-2xl mx-auto pb-20">

        {loading ? (
          <div className="px-4 pt-6">
            <DetailSkeleton />
          </div>
        ) : error || !article ? (
          <div className="px-4 pt-6 text-center py-20">
            <AlertCircle size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">Article not found</p>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF9800]/10 border border-[#FF9800]/20 text-[#FF9800] text-sm hover:bg-[#FF9800]/20 transition-colors no-underline"
            >
              <ArrowLeft size={14} /> Back to News
            </Link>
          </div>
        ) : (
          <>
            {/* ── Hero image ─────────────────────────────────────────── */}
            <div className="relative">
              <div className="aspect-[16/9] sm:aspect-[2/1] bg-[#161630]">
                {img ? (
                  <img
                    src={img}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper size={48} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent" />
              </div>

              {/* Floating buttons */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Share"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* ── Article body ───────────────────────────────────────── */}
            <div className="px-4 -mt-6 relative z-10">
              {cat && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9800] bg-[#FF9800]/10 px-2 py-0.5 rounded mb-3 inline-block">
                  {cat}
                </span>
              )}

              <h1 className="text-white font-bold text-xl sm:text-2xl leading-tight mb-3">
                {article.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-5">
                {article.author.avatar && (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full"
                  />
                )}
                {article.author.name && (
                  <span className="text-gray-300">{article.author.name}</span>
                )}
                <span>{article.date_formatted || article.date}</span>
              </div>

              {/* ── Interaction bar ─────────────────────────────────── */}
              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2.5 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-auto">
                  <Eye size={13} /> <span>{readCount} reads</span>
                </div>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    liked
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-white/[0.03] text-gray-500 hover:text-red-400'
                  }`}
                >
                  <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
                  {likeCount}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FF9800]/8 text-[#FF9800] hover:bg-[#FF9800]/15 transition-all"
                >
                  <Share2 size={13} /> Share
                </button>
              </div>

              {/* ── Content ─────────────────────────────────────────── */}
              <article
                className="prose prose-invert prose-sm max-w-none
                  prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-sm
                  prose-a:text-[#FF9800] prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg prose-img:w-full
                  prose-headings:text-white prose-headings:font-semibold
                  prose-strong:text-white/90
                  prose-blockquote:border-l-[#FF9800] prose-blockquote:text-gray-400
                  mb-8"
                dangerouslySetInnerHTML={{ __html: cleanContent(article.content) }}
              />

              {/* ── Related stories ─────────────────────────────────── */}
              <div className="mt-8 mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Related Stories
                </h3>

                {loadingRelated ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Shimmer className="w-[90px] h-[56px] shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <Shimmer className="h-3 w-full" />
                          <Shimmer className="h-3 w-2/3" />
                          <Shimmer className="h-2 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : related.length > 0 ? (
                  <div className="divide-y divide-white/[0.04]">
                    {related.map(r => (
                      <RelatedCard key={r.id} article={r} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 text-xs">No related stories found</p>
                )}
              </div>

              {/* Back link */}
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[#FF9800] transition-colors no-underline mt-4"
              >
                <ArrowLeft size={12} /> All News
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPage;
