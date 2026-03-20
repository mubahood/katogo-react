// src/app/pages/blog/BlogPage.tsx — BLOG-02
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, User } from 'lucide-react';

// Placeholder posts — replace with API when blog service is wired
const SAMPLE_POSTS = [
  { id: 1, title: 'Top 10 Ugandan Movies to Watch in 2025', excerpt: 'A curated list of the best locally produced Ugandan films this year.', author: 'Katogo Team', date: '2025-01-10', image: '', category: 'Movies', read_time: 5 },
  { id: 2, title: 'Behind the Scenes: Filming in Kampala', excerpt: 'A look at the growing film industry in Uganda\'s capital city.', author: 'Reporter', date: '2025-01-08', image: '', category: 'Industry', read_time: 3 },
  { id: 3, title: 'New Series Alert: Watch List for January', excerpt: 'Don\'t miss these exciting new series dropping this month on Katogo.', author: 'Editorial', date: '2025-01-05', image: '', category: 'Series', read_time: 4 },
  { id: 4, title: 'How to Watch Live TV on Any Device', excerpt: 'A step by step guide to accessing live Ugandan television via the Katogo app.', author: 'Tech Support', date: '2024-12-30', image: '', category: 'Guide', read_time: 2 },
];

const BlogCard: React.FC<{ post: typeof SAMPLE_POSTS[0] }> = ({ post }) => (
  <Link to={`/blog/${post.id}`} className="group block bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors">
    {/* Thumbnail */}
    <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
      {post.image ? (
        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <BookOpen size={40} className="text-gray-600" />
      )}
    </div>
    <div className="p-4">
      <span className="text-brand-red text-xs font-semibold uppercase tracking-wider">{post.category}</span>
      <h3 className="text-white font-semibold mt-1 mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">{post.title}</h3>
      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
      <div className="flex items-center gap-3 text-gray-500 text-xs">
        <span className="flex items-center gap-1"><User size={12} />{post.author}</span>
        <span className="flex items-center gap-1"><Clock size={12} />{post.read_time} min read</span>
      </div>
    </div>
  </Link>
);

const BlogPage: React.FC = () => (
  <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-8">
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold font-heading mb-2">Blog</h1>
        <p className="text-gray-400">Stories, guides, and updates from the Katogo team</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SAMPLE_POSTS.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  </div>
);

export default BlogPage;
