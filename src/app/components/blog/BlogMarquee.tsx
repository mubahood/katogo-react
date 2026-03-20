// src/app/components/blog/BlogMarquee.tsx (BLOG-02)
// Horizontally scrolling strip of featured/pinned posts
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import BlogV2Service, { BlogPost } from '../../services/v2/BlogV2Service';

const BlogMarquee: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    BlogV2Service.getMarquee()
      .then((data) => setPosts(data))
      .catch(() => { /* silently ignore */ });
  }, []);

  if (posts.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-[var(--ugflix-bg-secondary,#161616)] border-y border-[var(--ugflix-border,#1e1e1e)]">
      <div className="flex items-center gap-3 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 text-xs font-bold text-[var(--color-brand-red,#E50914)] uppercase tracking-wide">
          Latest
        </span>
        <div className="flex items-center gap-4 shrink-0">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="shrink-0 flex items-center gap-2 text-xs text-[var(--ugflix-text-secondary,#ccc)] hover:text-white transition-colors whitespace-nowrap"
            >
              {post.category && (
                <span className="bg-[var(--color-brand-red,#E50914)]/20 text-[var(--color-brand-red,#E50914)] text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {post.category}
                </span>
              )}
              {post.title}
            </Link>
          ))}
        </div>
        <Link to="/blog" className="shrink-0 flex items-center gap-0.5 text-xs text-[var(--ugflix-text-muted,#888)] hover:text-white ml-auto pl-2">
          View all <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default BlogMarquee;
