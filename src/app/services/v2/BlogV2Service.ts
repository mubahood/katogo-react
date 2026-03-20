// src/app/services/v2/BlogV2Service.ts
// Uses /api/v2/blog/* endpoints

import { http_get, http_post } from '../Api';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category?: string;
  author?: { id: number; name: string; avatar?: string };
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_pinned?: boolean;
  published_at: string;
  created_at: string;
}

export interface BlogComment {
  id: number;
  post_id: number;
  user?: { id: number; name: string; avatar?: string };
  content: string;
  likes_count: number;
  is_liked?: boolean;
  created_at: string;
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
    items: BlogPost[];
    pagination: any;
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
  static async getPost(id: number): Promise<{ post: BlogPost; comments: BlogComment[] }> {
    const response = await http_get(`v2/blog/${id}`);
    return response.data;
  }

  /**
   * Featured/pinned posts for marquee — GET /api/v2/blog/marquee
   */
  static async getMarquee(): Promise<BlogPost[]> {
    const response = await http_get('v2/blog/marquee');
    return response.data?.posts || response.data || [];
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
