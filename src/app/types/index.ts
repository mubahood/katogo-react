// src/app/types/index.ts

/**
 * Centralized type definitions for the entire application
 */

// ===================================================================
// PRODUCT TYPES
// ===================================================================

export interface Stock {
  items_sold: number;
  total_items: number;
}

export interface Specification {
  label: string;
  value: string;
}

export type VariantOptions = Record<string, string[]>;

export interface ProductBase {
  id: number;
  name: string;
  price_1: string;
  price_2: string;
  feature_photo: string;
  description?: string | null;
  summary?: string | null;
  category?: number | null;
  category_text?: string;
  colors?: string;
  sizes?: string;
  in_stock?: number;
  status?: number;
  created_at?: string;
  // Backend API fields for tags and attributes
  tags?: string;
  tags_array?: string[];
  attributes_array?: { name: string; value: string }[];
  category_attributes?: { 
    name: string; 
    is_required: boolean; 
    attribute_type: string; 
    possible_values?: string; 
  }[];
}

export interface ProductWithExtras extends ProductBase {
  stock?: Stock;
  rating?: number;
  reviewCount?: number;
  freeShipping?: boolean;
  fastDelivery?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
}

// ===================================================================
// API RESPONSE TYPES
// ===================================================================

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ===================================================================
// COMPONENT PROP TYPES
// ===================================================================

export interface ProductCardProps {
  product: ProductWithExtras;
  className?: string;
  showStock?: boolean;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

// ===================================================================
// FORM TYPES
// ===================================================================

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
}

// ===================================================================
// CART TYPES
// ===================================================================

export interface CartItem {
  id: number;
  product: ProductBase;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ===================================================================
// USER & AUTH TYPES
// ===================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ===================================================================
// NOTIFICATION TYPES
// ===================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// ===================================================================
// UTILITY TYPES
// ===================================================================

export type Loading<T> = T & { loading?: boolean };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ===================================================================
// CONSTANTS
// ===================================================================

export const PRODUCT_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
} as const;

export const STOCK_STATUS = {
  IN_STOCK: 1,
  OUT_OF_STOCK: 0,
} as const;

export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
} as const;
