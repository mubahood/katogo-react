// src/app/components/blog/BlogMarquee.tsx
// Horizontally scrolling ticker of recent blog posts
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ChevronRight } from 'lucide-react';
import BlogV2Service from '../../services/v2/BlogV2Service';
import type { BlogMarqueeItem } from '../../services/v2/BlogV2Service';

const SEEN_KEY = 'blog_marquee_seen';
const SCROLL_SPEED = 0.5; // px per frame

const BlogMarquee: React.FC = () => {
  const [posts, setPosts] = useState<BlogMarqueeItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const seen: number[] = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    BlogV2Service.getMarquee(seen)
      .then((data) => setPosts(data))
      .catch(() => {});
  }, []);

  // auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || posts.length === 0) return;
    let pos = 0;
    const tick = () => {
      pos += SCROLL_SPEED;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [posts]);

  const markSeen = (id: number) => {
    const seen: number[] = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    if (!seen.includes(id)) {
      seen.push(id);
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-200)));
    }
  };

  if (posts.length === 0) return null;

  // duplicate items for infinite scroll illusion
  const items = [...posts, ...posts];

  return (
    <div className="relative overflow-hidden bg-white/[0.02] border-y border-white/[0.04]">
      <div className="flex items-center">
        {/* Label */}
        <Link
          to="/blog"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#FF9800]/10 text-[#FF9800] text-[10px] font-bold uppercase tracking-wider no-underline hover:bg-[#FF9800]/15 transition-colors"
        >
          <Newspaper size={12} />
          NEWS
        </Link>

        {/* Scrolling strip */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-6 overflow-hidden py-2 px-3"
          style={{ scrollBehavior: 'auto' }}
        >
          {items.map((post, i) => (
            <Link
              key={`${post.id}-${i}`}
              to={`/blog/${post.id}`}
              onClick={() => markSeen(post.id)}
              className="shrink-0 flex items-center gap-2 text-[12px] text-gray-400 hover:text-white transition-colors whitespace-nowrap no-underline"
            >
              <span className="w-1 h-1 rounded-full bg-[#FF9800] shrink-0" />
              {post.title}
            </Link>
          ))}
        </div>

        {/* View all */}
        <Link
          to="/blog"
          className="shrink-0 flex items-center gap-0.5 px-3 py-2 text-[10px] text-gray-600 hover:text-white transition-colors no-underline"
        >
          All <ChevronRight size={10} />
        </Link>
      </div>
    </div>
  );
};

export default BlogMarquee;
