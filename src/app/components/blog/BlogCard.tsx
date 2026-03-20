// src/app/components/blog/BlogCard.tsx (BLOG-01)
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import type { BlogPost } from '../../services/v2/BlogV2Service';

interface BlogCardProps {
  post: BlogPost;
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Link
      to={`/blog/${post.id}`}
      className="group block rounded-xl overflow-hidden bg-[var(--ugflix-bg-secondary,#161616)] border border-[var(--ugflix-border,#1e1e1e)] hover:border-[var(--color-brand-red,#E50914)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(229,9,20,0.15)]"
    >
      {/* Cover Image */}
      <div className="relative aspect-video bg-[var(--ugflix-bg-primary,#0d0d0d)] overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <span className="text-4xl opacity-20">📝</span>
          </div>
        )}
        {post.category && (
          <span className="absolute top-2 left-2 bg-[var(--color-brand-red,#E50914)] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            {post.category}
          </span>
        )}
        {post.is_pinned && (
          <span className="absolute top-2 right-2 bg-[var(--color-brand-gold,#F5A623)] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white leading-tight mb-1.5 line-clamp-2 group-hover:text-[var(--color-brand-red,#E50914)] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[11px] text-[var(--ugflix-text-muted,#888)] line-clamp-2 mb-2">
            {post.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-[var(--ugflix-text-muted,#888)]">
            {formatDate(post.published_at || post.created_at)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--ugflix-text-muted,#888)] flex items-center gap-0.5">
              <Clock size={10} /> {readingTime(post.content ?? post.excerpt ?? '')} min
            </span>
            <span className="text-[10px] text-[var(--ugflix-text-muted,#888)] flex items-center gap-0.5">
              <Heart size={10} /> {post.likes_count}
            </span>
            <span className="text-[10px] text-[var(--ugflix-text-muted,#888)] flex items-center gap-0.5">
              <MessageCircle size={10} /> {post.comments_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
