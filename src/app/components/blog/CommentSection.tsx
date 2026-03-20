// src/app/components/blog/CommentSection.tsx (BLOG-03)
import React, { useState } from 'react';
import { Heart, Flag, Send, Loader } from 'lucide-react';
import BlogV2Service, { BlogComment } from '../../services/v2/BlogV2Service';

interface CommentSectionProps {
  postId: number;
  initialComments: BlogComment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments }) => {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<number>>(
    new Set(initialComments.filter((c) => c.is_liked).map((c) => c.id))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const added = await BlogV2Service.commentOnPost(postId, newComment.trim());
      setComments((prev) => [added, ...prev]);
      setNewComment('');
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      const result = await BlogV2Service.likeComment(commentId);
      setLikedComments((prev) => {
        const next = new Set(prev);
        result.liked ? next.add(commentId) : next.delete(commentId);
        return next;
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes_count: result.likes_count } : c))
      );
    } catch {
      // silently fail
    }
  };

  const handleReportComment = async (commentId: number) => {
    const reason = prompt('Reason for reporting this comment?');
    if (!reason) return;
    try {
      await BlogV2Service.reportComment(commentId, reason);
      alert('Comment reported. Thank you.');
    } catch {
      alert('Failed to report comment. Please try again.');
    }
  };

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-UG', { day: 'numeric', month: 'short' });
  }

  return (
    <section className="mt-8">
      <h3 className="text-base font-semibold text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="flex-1 bg-[var(--ugflix-bg-secondary,#161616)] border border-[var(--ugflix-border,#1e1e1e)] focus:border-[var(--color-brand-red,#E50914)] rounded-lg text-sm text-white placeholder:text-[var(--ugflix-text-muted,#888)] px-3 py-2 outline-none resize-none transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="shrink-0 px-3 py-2 rounded-lg bg-[var(--color-brand-red,#E50914)] text-white disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--ugflix-bg-secondary,#161616)] overflow-hidden">
              {comment.user?.avatar ? (
                <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--ugflix-text-muted,#888)]">
                  {(comment.user?.name ?? 'U')[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-white">{comment.user?.name ?? 'Anonymous'}</span>
                <span className="text-[10px] text-[var(--ugflix-text-muted,#888)]">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-[var(--ugflix-text-secondary,#ccc)] leading-relaxed">{comment.content}</p>

              {/* Comment actions */}
              <div className="flex items-center gap-3 mt-1.5">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 text-[11px] transition-colors ${
                    likedComments.has(comment.id)
                      ? 'text-[var(--color-brand-red,#E50914)]'
                      : 'text-[var(--ugflix-text-muted,#888)] hover:text-white'
                  }`}
                >
                  <Heart size={11} fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} />
                  {comment.likes_count}
                </button>
                <button
                  onClick={() => handleReportComment(comment.id)}
                  className="flex items-center gap-1 text-[11px] text-[var(--ugflix-text-muted,#888)] hover:text-red-400 transition-colors"
                  title="Report comment"
                >
                  <Flag size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-[var(--ugflix-text-muted,#888)] text-center py-4">
            No comments yet. Be the first!
          </p>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
