// src/app/services/v2/BlogV2Service.ts
// Uses /api/v2/blog/* endpoints

import { http_get, http_post } from '../Api';

/* ── Types matching actual backend response ─────────────────────────────── */

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author_name: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
  is_pinned: boolean;
  comments_enabled: boolean;
  time_ago: string;
  created_at: string;
  updated_at?: string;
}

export interface BlogComment {
  id: number;
  blog_post_id: number;
  user_id: number;
  user_name: string;
  content: string;
  likes_count: number;
  has_liked: boolean;
  time_ago: string;
  created_at: string;
}

export interface BlogPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BlogMarqueeItem {
  id: number;
  title: string;
  category: string;
  time_ago: string;
}

export interface BlogPostsParams {
  category?: string;
  page?: number;
  per_page?: number;
}

class BlogV2Service {
  /**
   * List blog posts — GET /api/v2/blog
   */
  static async getPosts(params: BlogPostsParams = {}): Promise<{
    posts: BlogPost[];
    pagination: BlogPagination;
  }> {
    const query: Record<string, any> = {
      page: params.page || 1,
      per_page: params.per_page || 20,
    };
    if (params.category) query.category = params.category;

    const response = await http_get('v2/blog', query);
    return response.data;
  }

  /**
   * Single post with comments — GET /api/v2/blog/{id}
   */
  static async getPost(id: number, commentsPage = 1): Promise<{
    post: BlogPost;
    comments: BlogComment[];
    comments_pagination: BlogPagination;
  }> {
    const response = await http_get(`v2/blog/${id}`, { comments_page: commentsPage });
    return response.data;
  }

  /**
   * Featured/pinned posts for marquee — GET /api/v2/blog/marquee
   */
  static async getMarquee(seenIds: number[] = []): Promise<BlogMarqueeItem[]> {
    const query: Record<string, any> = {};
    if (seenIds.length) query.seen_ids = seenIds.join(',');
    const response = await http_get('v2/blog/marquee', query);
    return response.data?.posts || [];
  }

  /**
   * Toggle like on a post — POST /api/v2/blog/{id}/like
   */
  static async likePost(id: number): Promise<{ liked: boolean; likes_count: number }> {
    const response = await http_post(`v2/blog/${id}/like`, {});
    return response.data;
  }

  /**
   * Add comment to a post — POST /api/v2/blog/{id}/comment
   */
  static async commentOnPost(id: number, content: string): Promise<BlogComment> {
    const response = await http_post(`v2/blog/${id}/comment`, { content });
    return response.data;
  }

  /**
   * Toggle like on a comment — POST /api/v2/blog/comment/{id}/like
   */
  static async likeComment(commentId: number): Promise<{ liked: boolean; likes_count: number }> {
    const response = await http_post(`v2/blog/comment/${commentId}/like`, {});
    return response.data;
  }

  /**
   * Report a comment — POST /api/v2/blog/comment/{id}/report
   */
  static async reportComment(commentId: number, reason: string): Promise<void> {
    await http_post(`v2/blog/comment/${commentId}/report`, { reason });
  }
}

export default BlogV2Service;
