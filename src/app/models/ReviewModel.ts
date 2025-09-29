// src/app/models/ReviewModel.ts

export interface ReviewModel {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  title?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: {
    [key: number]: number; // rating: count
  };
}

export interface ReviewFormData {
  rating: number;
  comment: string;
  title?: string;
}

export interface ReviewsResponse {
  data: ReviewModel[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
