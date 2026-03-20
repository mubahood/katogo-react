// src/app/pages/blog/BlogPostPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Heart, Flag, Loader } from 'lucide-react';
import BlogV2Service, { BlogPost, BlogComment } from '../../services/v2/BlogV2Service';
import CommentSection from '../../components/blog/CommentSection';
import ReportContentModal from '../../components/moderation/ReportContentModal';

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    BlogV2Service.getPost(Number(id))
      .then(({ post: p, comments: c }) => {
        setPost(p);
        setComments(c);
        setLiked(p.is_liked ?? false);
        setLikesCount(p.likes_count);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const result = await BlogV2Service.likePost(post.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader className="animate-spin text-[var(--color-brand-red,#E50914)]" size={32} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Post not found.</p>
          <Link to="/blog" className="text-[var(--color-brand-red,#E50914)] hover:underline text-sm">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <article>
          {post.category && (
            <span className="text-[var(--color-brand-red,#E50914)] text-xs font-semibold uppercase tracking-wider">
              {post.category}
            </span>
          )}
          <h1 className="text-white text-2xl sm:text-3xl font-bold mt-2 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-6">
            {post.author && (
              <span className="flex items-center gap-1">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User size={14} />
                )}
                {post.author.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {readingTime(post.content)} min read
            </span>
            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {post.cover_image && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gray-800">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Post actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? 'text-[var(--color-brand-red,#E50914)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            {likesCount}
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors ml-auto"
          >
            <Flag size={15} />
            Report
          </button>
        </div>

        {/* Comments (BLOG-03) */}
        <CommentSection postId={post.id} initialComments={comments} />
      </div>

      <ReportContentModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        contentType="blog_post"
        contentId={post.id}
      />
    </div>
  );
};

export default BlogPostPage;
