// src/app/components/blog/CommentSection.tsx
import React, { useState } from 'react';
import { Heart, Flag, Send, Loader, MessageCircle } from 'lucide-react';
import BlogV2Service from '../../services/v2/BlogV2Service';
import type { BlogComment } from '../../services/v2/BlogV2Service';

interface CommentSectionProps {
  postId: number;
  initialComments: BlogComment[];
  commentsEnabled?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments, commentsEnabled = true }) => {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<number>>(
    new Set(initialComments.filter((c) => c.has_liked).map((c) => c.id))
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
    // optimistic update
    const wasLiked = likedComments.has(commentId);
    setLikedComments((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    setComments((prev) =>
      prev.map((c) => c.id === commentId
        ? { ...c, likes_count: c.likes_count + (wasLiked ? -1 : 1) }
        : c
      )
    );
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
      // revert
      setLikedComments((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(commentId) : next.delete(commentId);
        return next;
      });
      setComments((prev) =>
        prev.map((c) => c.id === commentId
          ? { ...c, likes_count: c.likes_count + (wasLiked ? 1 : -1) }
          : c
        )
      );
    }
  };

  const handleReportComment = async (commentId: number) => {
    const reason = prompt('Why are you reporting this comment?');
    if (!reason?.trim()) return;
    try {
      await BlogV2Service.reportComment(commentId, reason.trim());
      alert('Comment reported. Thank you.');
    } catch {
      alert('Failed to report. Please try again.');
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-white/[0.06]">
      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
        <MessageCircle size={15} className="text-gray-500" />
        Comments ({comments.length})
      </h3>

      {/* ── Add comment ────────────────────────────────────────────────── */}
      {commentsEnabled ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              maxLength={1000}
              className="flex-1 bg-white/[0.03] border border-white/[0.06] focus:border-[#FF9800]/50 rounded-xl text-sm text-white placeholder:text-gray-600 px-3 py-2.5 outline-none resize-none transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-[#FF9800] text-black disabled:opacity-30 hover:bg-[#FF9800]/90 transition-all flex items-center justify-center self-end"
            >
              {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        </form>
      ) : (
        <p className="text-xs text-gray-600 mb-6 py-3 px-4 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          Comments are disabled for this post.
        </p>
      )}

      {/* ── Comments list ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
              {(comment.user_name ?? 'U')[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-white">{comment.user_name ?? 'Anonymous'}</span>
                <span className="text-[10px] text-gray-600">{comment.time_ago}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{comment.content}</p>

              {/* Comment actions */}
              <div className="flex items-center gap-3 mt-1.5">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 text-[11px] transition-colors ${
                    likedComments.has(comment.id)
                      ? 'text-red-400'
                      : 'text-gray-600 hover:text-white'
                  }`}
                >
                  <Heart size={11} fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} />
                  {comment.likes_count || ''}
                </button>
                <button
                  onClick={() => handleReportComment(comment.id)}
                  className="text-[11px] text-gray-600 hover:text-red-400 transition-colors"
                  title="Report"
                >
                  <Flag size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-gray-600 text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
