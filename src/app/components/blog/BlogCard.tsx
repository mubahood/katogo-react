// src/app/components/blog/BlogCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Pin, Newspaper } from 'lucide-react';
import type { BlogPost } from '../../services/v2/BlogV2Service';
import { getImageUrl } from '../../utils/imageUtils';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Link
      to={`/blog/${post.id}`}
      className="group block rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04] hover:border-[#FF9800]/30 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(255,152,0,0.08)] no-underline"
    >
      {/* Cover Image */}
      <div className="relative aspect-video bg-[#0d0d0d] overflow-hidden">
        {post.image_url ? (
          <img
            src={getImageUrl(post.image_url)}
            alt={post.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper size={32} className="text-white/10" />
          </div>
        )}
        {post.category && (
          <span className="absolute top-2 left-2 bg-[#FF9800] text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            {post.category}
          </span>
        )}
        {post.is_pinned && (
          <span className="absolute top-2 right-2 bg-[var(--color-brand-gold,#F5A623)] text-black text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Pin size={8} /> Pinned
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-[13px] font-semibold text-white leading-tight mb-1.5 line-clamp-2 group-hover:text-[#FF9800] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
            {post.excerpt.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-gray-600">{post.time_ago}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
              <Eye size={9} /> {post.views_count}
            </span>
            <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
              <Heart size={9} /> {post.likes_count}
            </span>
            <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
              <MessageCircle size={9} /> {post.comments_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
