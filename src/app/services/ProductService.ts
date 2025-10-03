// src/app/services/ProductService.ts
/**
 * PRODUCT SERVICE
 * 
 * Centralized service for product management operations
 * Handles product CRUD, image uploads, and data synchronization
 * 
 * Features:
 * ✅ Create products with multiple images
 * ✅ Upload product images to backend
 * ✅ Fetch user's products
 * ✅ Delete products
 * ✅ Generate unique local_id for offline tracking
 * ✅ Handle FormData for file uploads
 * ✅ Error handling and validation
 */

import { http_post, http_get } from './Api';
import ToastService from './ToastService';

export interface ProductFormData {
  // Basic Info
  name: string;
  description: string;
  category: string;
  
  // Pricing
  price_1: string;
  price_2: string;
  p_type: 'Yes' | 'No'; // 'Yes' = tiered pricing, 'No' = simple pricing
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

export interface ProductImage {
  id?: number;
  src: string;
  thumbnail?: string;
  product_id?: number;
  parent_local_id?: string;
  type: 'Product';
}

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
  has_sizes: 'Yes' | 'No';
  has_colors: 'Yes' | 'No';
  sizes?: string;
  colors?: string;
  p_type: 'Yes' | 'No';
  keywords?: string;
  summary?: string;
  status: number;
  in_stock: number;
  rates: number;
  metric: number;
  currency: number;
  date_added: string;
  date_updated: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  images?: ProductImage[];
  category_text?: string;
  category_data?: any;
  user_data?: any;
}

class ProductServiceClass {
  /**
   * Generate unique local ID for product tracking
   * Format: timestamp + random string
   */
  generateLocalId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${random}`;
  }

  /**
   * Create a new product
   * @param productData Product form data
   * @returns Created product
   */
  async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      console.log('📦 Creating product:', productData.name);

      // Validate required fields
      if (!productData.name || productData.name.trim().length === 0) {
        throw new Error('Product name is required');
      }
      if (!productData.description || productData.description.trim().length < 20) {
        throw new Error('Description must be at least 20 characters');
      }
      if (!productData.category) {
        throw new Error('Category is required');
      }
      if (!productData.price_1 || parseFloat(productData.price_1) <= 0) {
        throw new Error('Selling price is required');
      }
      if (!productData.price_2 || parseFloat(productData.price_2) <= 0) {
        throw new Error('Original price is required');
      }

      // Ensure local_id exists
      if (!productData.local_id || productData.local_id.length < 6) {
        productData.local_id = this.generateLocalId();
      }

      console.log('📤 Submitting to product-create endpoint');
      console.log('🔑 Local ID:', productData.local_id);

      // Call backend API
      const response = await http_post('product-create', productData);

      console.log('✅ Product created successfully:', response);

      // Handle response format (mobile app compatibility)
      const product = response.data || response;

      ToastService.success('Product created successfully!');

      return product as Product;
    } catch (error: any) {
      console.error('❌ Failed to create product:', error);
      const errorMessage = error.message || 'Failed to create product';
      ToastService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload product image
   * @param file Image file to upload
   * @param local_id Product local ID
   * @param parent_id Product ID (optional, for editing)
   * @returns Uploaded image data
   */
  async uploadProductImage(
    file: File,
    local_id: string,
    parent_id: number = 0
  ): Promise<ProductImage> {
    try {
      console.log('🖼️ Uploading product image:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        local_id,
        parent_id,
      });

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parent_local_id', local_id);
      formData.append('parent_id', parent_id.toString());
      formData.append('type', 'Product');
      formData.append('parent_endpoint', 'Product');

      console.log('📤 Uploading to post-media-upload endpoint');

      // Upload via API (Content-Type will be set automatically by browser)
      const response = await http_post('post-media-upload', formData);

      console.log('✅ Image uploaded successfully:', response);

      const imageData = response.data || response;

      return imageData as ProductImage;
    } catch (error: any) {
      console.error('❌ Failed to upload image:', error);
      const errorMessage = error.message || 'Failed to upload image';
      ToastService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload multiple product images
   * @param files Array of image files
   * @param local_id Product local ID
   * @param parent_id Product ID (optional)
   * @returns Array of uploaded image data
   */
  async uploadProductImages(
    files: File[],
    local_id: string,
    parent_id: number = 0
  ): Promise<ProductImage[]> {
    try {
      console.log(`📸 Uploading ${files.length} images for product`);

      const uploadedImages: ProductImage[] = [];

      // Upload images sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading image ${i + 1}/${files.length}`);

        try {
          const imageData = await this.uploadProductImage(file, local_id, parent_id);
          uploadedImages.push(imageData);
          console.log(`✅ Image ${i + 1}/${files.length} uploaded successfully`);
        } catch (error) {
          console.error(`❌ Failed to upload image ${i + 1}:`, error);
          // Continue with other images even if one fails
        }
      }

      console.log(`✅ Uploaded ${uploadedImages.length}/${files.length} images`);

      if (uploadedImages.length === 0) {
        throw new Error('Failed to upload any images');
      }

      return uploadedImages;
    } catch (error: any) {
      console.error('❌ Failed to upload images:', error);
      throw error;
    }
  }

  /**
   * Get user's products
   * @param filters Optional filters
   * @returns Array of products
   */
  async getMyProducts(filters?: {
    search?: string;
    category?: string;
    status?: number;
  }): Promise<Product[]> {
    try {
      console.log('📦 Fetching my products');

      // Build query parameters
      const params: any = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.category) params.category = filters.category;
      if (filters?.status !== undefined) params.status = filters.status;

      // Call backend API (using products-1 endpoint for now)
      // TODO: Backend should implement a proper my-products endpoint
      const response = await http_get('products-1');

      console.log('✅ Products fetched successfully');

      // Handle response format
      const products = Array.isArray(response) ? response : response.data || [];

      return products as Product[];
    } catch (error: any) {
      console.error('❌ Failed to fetch products:', error);
      const errorMessage = error.message || 'Failed to fetch products';
      ToastService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a product
   * @param productId Product ID
   * @returns Success status
   */
  async deleteProduct(productId: number): Promise<boolean> {
    try {
      console.log('🗑️ Deleting product:', productId);

      // Call backend API
      const response = await http_post('products-delete', { id: productId });

      console.log('✅ Product deleted successfully');

      ToastService.success('Product deleted successfully!');

      return true;
    } catch (error: any) {
      console.error('❌ Failed to delete product:', error);
      const errorMessage = error.message || 'Failed to delete product';
      ToastService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate product data before submission
   * @param data Product form data
   * @returns Validation errors (empty object if valid)
   */
  validateProductData(data: Partial<ProductFormData>): Record<string, string> {
    const errors: Record<string, string> = {};

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Product name is required';
    } else if (data.name.trim().length < 3) {
      errors.name = 'Product name must be at least 3 characters';
    } else if (data.name.trim().length > 100) {
      errors.name = 'Product name must be less than 100 characters';
    }

    // Description validation
    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required';
    } else if (data.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    } else if (data.description.trim().length > 5000) {
      errors.description = 'Description must be less than 5000 characters';
    }

    // Category validation
    if (!data.category) {
      errors.category = 'Category is required';
    }

    // Price validation
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

    // Price comparison validation
    if (data.price_1 && data.price_2) {
      const price1 = parseFloat(data.price_1);
      const price2 = parseFloat(data.price_2);
      if (!isNaN(price1) && !isNaN(price2) && price1 > price2) {
        errors.price_1 = 'Selling price should not exceed original price';
      }
    }

    return errors;
  }

  /**
   * Format price for display
   * @param price Price value
   * @returns Formatted price string
   */
  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'UGX 0';
    return `UGX ${numPrice.toLocaleString()}`;
  }

  /**
   * Calculate discount percentage
   * @param originalPrice Original price
   * @param sellingPrice Selling price
   * @returns Discount percentage
   */
  calculateDiscount(originalPrice: string | number, sellingPrice: string | number): number {
    const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
    const selling = typeof sellingPrice === 'string' ? parseFloat(sellingPrice) : sellingPrice;

    if (isNaN(original) || isNaN(selling) || original === 0) return 0;

    const discount = ((original - selling) / original) * 100;
    return Math.round(discount);
  }
}

// Export singleton instance
const ProductService = new ProductServiceClass();
export default ProductService;
