// src/app/models/ProductModels.ts
/**
 * PRODUCT MODELS & INTERFACES
 * 
 * TypeScript interfaces for product management
 * Matches backend Product and ProductCategory models
 */

/**
 * Product Category Interface
 */
export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  parent_id?: number;
  status: number;
  attributes?: Record<string, any>;
  category_text?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Product Image Interface
 */
export interface ProductImage {
  id: number;
  src: string;
  thumbnail?: string;
  parent_id: number;
  product_id?: number;
  parent_local_id?: string;
  type: 'Product';
  size: number;
  note?: string;
  administrator_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Product Interface
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  feature_photo: string;
  price_1: string;
  price_2: string;
  category: string;
  user: number;
  supplier: number;
  local_id: string;
  
  // Pricing options
  p_type: 'Yes' | 'No'; // 'Yes' = tiered pricing, 'No' = simple pricing
  keywords?: string; // JSON string for tiered prices
  
  // Product options
  has_sizes: 'Yes' | 'No';
  has_colors: 'Yes' | 'No';
  sizes?: string;
  colors?: string;
  
  // Additional data
  summary?: string; // JSON string for category attributes
  url?: string;
  
  // Status & inventory
  status: number; // 0 = pending, 1 = approved
  in_stock: number; // 1 = in stock, 0 = out of stock
  rates: number;
  metric: number;
  currency: number;
  
  // Timestamps
  date_added: string;
  date_updated: string;
  created_at: string;
  updated_at: string;
  
  // Relationships (populated by backend)
  images?: ProductImage[];
  category_data?: ProductCategory;
  user_data?: any;
}

/**
 * Product Form Data (for creation/editing)
 */
export interface ProductFormData {
  // Basic Info
  name: string;
  description: string;
  category: string;
  
  // Pricing
  price_1: string;
  price_2: string;
  p_type: 'Yes' | 'No';
  keywords?: string; // JSON string for tiered prices
  
  // Options
  has_sizes: 'Yes' | 'No';
  has_colors: 'Yes' | 'No';
  sizes?: string;
  colors?: string;
  
  // System
  local_id: string;
  is_edit?: 'Yes' | 'No';
  id?: number;
  
  // Additional
  data?: string; // JSON string for category attributes
  url?: string;
}

/**
 * Tiered Price Structure
 */
export interface TieredPrice {
  price: string;
  min_qty: string;
  max_qty: string;
}

/**
 * Product Filters
 */
export interface ProductFilters {
  search?: string;
  category?: string;
  status?: number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort_by?: 'name' | 'price_1' | 'date_added' | 'date_updated';
  sort_dir?: 'asc' | 'desc';
}

/**
 * Body type options for product sizes
 */
export const BODY_TYPES = [
  'Slim',
  'Athletic',
  'Average',
  'Curvy',
  'Muscular',
  'Plus Size',
] as const;

/**
 * Common product categories (will be fetched from backend)
 */
export const DEFAULT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Food & Beverages',
  'Other',
] as const;

/**
 * Product status options
 */
export enum ProductStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

/**
 * Stock status
 */
export enum StockStatus {
  OutOfStock = 0,
  InStock = 1,
}

/**
 * Helper function to parse product images from API response
 */
export function parseProductImages(images: any): ProductImage[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

/**
 * Helper function to format product price
 */
export function formatProductPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return 'UGX 0';
  return `UGX ${numPrice.toLocaleString()}`;
}

/**
 * Helper function to calculate discount percentage
 */
export function calculateDiscount(originalPrice: string | number, sellingPrice: string | number): number {
  const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const selling = typeof sellingPrice === 'string' ? parseFloat(sellingPrice) : sellingPrice;

  if (isNaN(original) || isNaN(selling) || original === 0) return 0;

  const discount = ((original - selling) / original) * 100;
  return Math.round(discount);
}

/**
 * Helper function to get product status label
 */
export function getProductStatusLabel(status: number): string {
  switch (status) {
    case ProductStatus.Pending:
      return 'Pending Approval';
    case ProductStatus.Approved:
      return 'Approved';
    case ProductStatus.Rejected:
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

/**
 * Helper function to get product status color
 */
export function getProductStatusColor(status: number): string {
  switch (status) {
    case ProductStatus.Pending:
      return '#FFA500'; // Orange
    case ProductStatus.Approved:
      return '#10B981'; // Green
    case ProductStatus.Rejected:
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Helper function to get stock status label
 */
export function getStockStatusLabel(inStock: number): string {
  return inStock === StockStatus.InStock ? 'In Stock' : 'Out of Stock';
}

/**
 * Helper function to parse tiered prices
 */
export function parseTieredPrices(keywords?: string): TieredPrice[] {
  if (!keywords) return [];
  try {
    return JSON.parse(keywords);
  } catch {
    return [];
  }
}

/**
 * Helper function to validate product data
 */
export function validateProductData(data: Partial<ProductFormData>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Product name is required';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Product name must be at least 3 characters';
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.price_1) {
    errors.price_1 = 'Selling price is required';
  } else {
    const price1 = parseFloat(data.price_1);
    if (isNaN(price1) || price1 <= 0) {
      errors.price_1 = 'Selling price must be a positive number';
    }
  }

  if (!data.price_2) {
    errors.price_2 = 'Original price is required';
  } else {
    const price2 = parseFloat(data.price_2);
    if (isNaN(price2) || price2 <= 0) {
      errors.price_2 = 'Original price must be a positive number';
    }
  }

  if (data.price_1 && data.price_2) {
    const price1 = parseFloat(data.price_1);
    const price2 = parseFloat(data.price_2);
    if (!isNaN(price1) && !isNaN(price2) && price1 > price2) {
      errors.price_1 = 'Selling price should not exceed original price';
    }
  }

  return errors;
}
