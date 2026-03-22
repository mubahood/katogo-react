// src/app/types/blog.ts
// Re-export from service (single source of truth)
export type {
  BlogPost,
  BlogComment,
  BlogPostsParams,
  BlogPagination,
  BlogMarqueeItem,
} from '../services/v2/BlogV2Service';
