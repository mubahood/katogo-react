// src/app/pages/blog/BlogPostPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Eye, Heart, Share2, MessageCircle, Pin,
  Newspaper, Loader, AlertCircle,
} from 'lucide-react';
import BlogV2Service from '../../services/v2/BlogV2Service';
import type { BlogPost, BlogComment } from '../../services/v2/BlogV2Service';
import CommentSection from '../../components/blog/CommentSection';
import { getImageUrl } from '../../utils/imageUtils';

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

/* ═══════════════════════════════════════════════════════════════════════ */
const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    BlogV2Service.getPost(Number(id))
      .then(({ post: p, comments: c }) => {
        setPost(p);
        setComments(c);
        setLiked(p.has_liked ?? false);
        setLikesCount(p.likes_count);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    // optimistic
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    try {
      const result = await BlogV2Service.likePost(post.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch {
      setLiked(prev => !prev);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = () => {
    if (!post) return;
    const url = `${window.location.origin}/blog/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  /* ── Loading / Error states ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">Post not found</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-[#FF9800] text-sm hover:underline no-underline"
          >
            <ArrowLeft size={14} /> Back to Local News
          </Link>
        </div>
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      {/* ── Hero image ─────────────────────────────────────────────────── */}
      {post.image_url && (
        <div className="relative w-full aspect-[2/1] sm:aspect-[5/2] max-h-[360px] bg-[#161630]">
          <img
            src={getImageUrl(post.image_url)}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-black/30" />
          {/* Floating back & share buttons */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Link
              to="/blog"
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors no-underline"
            >
              <ArrowLeft size={18} />
            </Link>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-20" style={{ marginTop: post.image_url ? '-2rem' : '1.5rem' }}>
        {/* Back link if no hero image */}
        {!post.image_url && (
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-5 no-underline transition-colors"
          >
            <ArrowLeft size={14} /> Local News
          </Link>
        )}

        {/* ── Article header ───────────────────────────────────────────── */}
        <article className="relative">
          <div className="flex items-center gap-2 mb-2">
            {post.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF9800] text-black px-2 py-0.5 rounded">
                {post.category}
              </span>
            )}
            {post.is_pinned && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-gold,#F5A623)] flex items-center gap-0.5">
                <Pin size={9} /> Pinned
              </span>
            )}
          </div>

          <h1 className="text-white text-xl sm:text-2xl font-bold leading-tight mb-3">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
            <span>{post.author_name}</span>
            <span>{post.time_ago}</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {post.views_count} views</span>
          </div>

          {/* ── Interaction bar ─────────────────────────────────────────── */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 mb-6">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                liked
                  ? 'bg-red-500/10 text-red-400'
                  : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              {likesCount}
            </button>

            {/* Comments */}
            <a
              href="#comments"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-white/[0.04] hover:text-white transition-all no-underline"
            >
              <MessageCircle size={14} />
              {post.comments_count}
            </a>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-white/[0.04] hover:text-white transition-all ml-auto"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>

          {/* ── Article content ─────────────────────────────────────────── */}
          <div
            className="text-gray-300 text-[15px] leading-[1.75] prose prose-invert max-w-none
              [&_img]:w-full [&_img]:rounded-lg [&_img]:my-4
              [&_a]:text-[#FF9800] [&_a]:no-underline [&_a:hover]:underline
              [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
              [&_h3]:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
              [&_blockquote]:border-l-2 [&_blockquote]:border-[#FF9800] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400
              [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* ── Comments ─────────────────────────────────────────────────── */}
        <div id="comments">
          <CommentSection
            postId={post.id}
            initialComments={comments}
            commentsEnabled={post.comments_enabled}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
