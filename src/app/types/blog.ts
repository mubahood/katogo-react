// src/app/types/blog.ts
// Blog and comment types

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

export interface BlogPostDetail {
  post: BlogPost;
  comments: BlogComment[];
}
