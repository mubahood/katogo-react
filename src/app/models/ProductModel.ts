// src/models/ProductModel.ts

import { http_get, http_post } from "../services/Api";
import Utils from "../services/Utils";

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

export interface Stock {
  items_sold: number;
  total_items: number;
}

export interface Specification {
  label: string;
  value: string;
}

export type VariantOptions = Record<string, string[]>;

export class ProductModel {
  // API Fields from Laravel backend
  id: number = 0;
  name: string = "";
  metric: number = 0;
  currency: number = 1;
  description: string | null = null;
  summary: string | null = null;
  price_1: string = "0.00";
  price_2: string = "0.00";
  feature_photo: string = "";
  rates: string = "[]";
  date_added: string = "";
  date_updated: string = "";
  user: number = 1;
  category: number | null = null;
  sub_category: number | null = null;
  supplier: number = 1;
  url: string | null = null;
  status: number = 1;
  in_stock: number = 1;
  keywords: string = "[]";
  p_type: string = "No";
  local_id: string = "";
  updated_at: string = "";
  created_at: string = "";
  stripe_id: string | null = null;
  stripe_price: string | null = null;
  has_colors: string = "No";
  colors: string = "";
  has_sizes: string = "No";
  sizes: string = "";
  category_text: string = "";

  // Backend API fields for tags and attributes
  tags: string = "";
  tags_array: string[] = [];
  attributes_array: { name: string; value: string }[] = [];
  category_attributes: { 
    name: string; 
    is_required: boolean; 
    attribute_type: string; 
    possible_values?: string; 
  }[] = [];

  // Review fields from backend
  review_count: number = 0;
  average_rating: number = 0;

  // Frontend-specific fields for compatibility
  variants: VariantOptions = {};
  images: string[] = [];
  stock: Stock = { items_sold: 0, total_items: 0 };
  rating: number = 0;
  reviewsCount: number = 0;
  specifications: Specification[] = [];

  /**
   * Update fields with provided partial data.
   * @param data Partial data to update the product fields.
   */
  updateProfile(data: Partial<ProductModel>): void {
    Object.assign(this, data);
  }

  /**
   * Converts this instance to a plain JS object.
   */
  toJSON(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        result[key] = (this as any)[key];
      }
    }
    return result;
  }

  /**
   * Creates a ProductModel instance from a plain object or JSON string.
   * @param data The plain object or JSON string containing product data.
   */
  static fromJson(data: string | Record<string, any>): ProductModel {
    const model = new ProductModel();
    let obj: Record<string, any> = {};

    if (typeof data === "string") {
      try {
        obj = JSON.parse(data);
      } catch (error) {
        return model;
      }
    } else {
      obj = data;
    }

    const modelKeys = Object.keys(model);
    for (const key of Object.keys(obj)) {
      if (modelKeys.includes(key)) {
        (model as any)[key] = obj[key];
      }
    }

    // Map review fields for backward compatibility
    if (obj.review_count !== undefined) {
      model.reviewsCount = Number(obj.review_count) || 0;
    }
    if (obj.average_rating !== undefined) {
      model.rating = Number(obj.average_rating) || 0;
    }

    return model;
  }

  /**
   * Helper: Returns the main image URL if `feature_photo` exists,
   * else returns a fallback placeholder.
   */
  getMainImage(): string {
    return this.feature_photo
      ? Utils.img(this.feature_photo)
      : "/media/svg/files/blank-image.svg";
  }

  /**
   * Helper: Parses `rates` JSON to get a second/hover image, if available.
   */
  getHoverImage(): string | null {
    try {
      const parsed = JSON.parse(this.rates || "[]");
      if (Array.isArray(parsed) && parsed[1]?.src) {
        return Utils.img(parsed[1].src);
      }
    } catch (err) {
    }
    return null;
  }

  /**
   * Helper: Returns array of all product images from rates JSON.
   */
  getAllImages(): string[] {
    try {
      console.log("🖼️ Raw rates:", this.rates);
      const parsed = JSON.parse(this.rates || "[]");
      console.log("🖼️ Parsed data:", parsed);
      
      if (Array.isArray(parsed)) {
        const images = parsed.map((item, index) => {
          if (item.src) {
            console.log(`🖼️ [${index}] Original src:`, item.src);
            console.log(`🖼️ [${index}] Original thumbnail:`, item.thumbnail);
            
            // Clean up escaped slashes and normalize the path
            let cleanSrc = item.src
              .replace(/\\\//g, '/') // Remove escaped slashes
              .replace(/\\/g, '/') // Convert backslashes to forward slashes
              .trim();
            
            // Remove duplicate slashes
            cleanSrc = cleanSrc.replace(/\/+/g, '/');
            
            // Utils.img() expects just the filename and will add the full path
            // So we need to extract just the filename from paths like "images/filename.jpg"
            if (cleanSrc.includes('/')) {
              cleanSrc = cleanSrc.split('/').pop() || cleanSrc;
            }
            
            console.log(`🖼️ [${index}] Cleaned filename for Utils.img():`, cleanSrc);
            return cleanSrc;
          }
          return null;
        }).filter(Boolean);
        
        console.log("🖼️ All cleaned filenames:", images);
        
        const processedImages = images.map((img, index) => {
          const finalUrl = Utils.img(img);
          console.log(`� [${index}] Input to Utils.img():`, img);
          console.log(`🔗 [${index}] Final URL from Utils.img():`, finalUrl);
          return finalUrl;
        });
        
        console.log("🔗 All final URLs:", processedImages);
        
        return processedImages;
      }
    } catch (err) {
      console.error("getAllImages() - Parse error:", err);
    }
    return [this.getMainImage()];
  }

  /**
   * Helper: Returns price_1 formatted to 2 decimals with UGX as currency.
   */
  getFormattedPrice(): string {
    return Utils.moneyFormat(this.price_1);
  }

  /**
   * Helper: Returns price_2 formatted to 2 decimals with UGX as currency.
   */
  getFormattedPrice2(): string {
    return Utils.moneyFormat(this.price_2);
  }

  /**
   * Helper: Check if product is in stock.
   */
  isInStock(): boolean {
    return this.in_stock === 1;
  }

  /**
   * Helper: Check if product is active.
   */
  isActive(): boolean {
    return this.status === 1;
  }

  /**
   * Helper: Check if product has colors.
   */
  hasColors(): boolean {
    return this.has_colors === "Yes" && this.colors.length > 0;
  }

  /**
   * Helper: Get array of available colors.
   */
  getColors(): string[] {
    if (!this.hasColors()) return [];
    return this.colors.split(",").map(color => color.trim()).filter(Boolean);
  }

  /**
   * Helper: Check if product has sizes.
   */
  hasSizes(): boolean {
    return this.has_sizes === "Yes" && this.sizes.length > 0;
  }

  /**
   * Helper: Get array of available sizes.
   */
  getSizes(): string[] {
    if (!this.hasSizes()) return [];
    return this.sizes.split(",").map(size => size.trim()).filter(Boolean);
  }

  /**
   * Helper: Parse keywords JSON.
   */
  getKeywords(): Array<{id: string, min_qty: number, max_qty: number, price: string}> {
    try {
      const parsed = JSON.parse(this.keywords || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Helper: Check if product is premium type.
   */
  isPremiumType(): boolean {
    return this.p_type === "Yes";
  }

  /** Fetch a paginated list of products (GET /products-1). */
  static async fetchProducts(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      // Mobile app uses /products-1 which returns up to 1000 products without pagination
      const response = await http_get(`products-1`);
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        console.error('❌ ProductModel: Invalid response structure:', response);
        throw new Error('Invalid API response structure');
      }

      // Handle mobile app response format {code, message, data}
      const productsArray = response.data || response;
      
      // Validate products array
      if (!Array.isArray(productsArray)) {
        console.error('❌ ProductModel: Invalid products data:', productsArray);
        throw new Error('Invalid products data structure');
      }

      // Convert to ProductModel instances with validation
      const products: ProductModel[] = [];
      for (const item of productsArray) {
        try {
          const product = ProductModel.fromJson(item);
          products.push(product);
        } catch (error) {
          console.warn('⚠️ ProductModel: Skipping invalid product:', item, error);
        }
      }

      // Client-side filtering since the endpoint doesn't support it
      let filteredProducts = products;

      // Apply client-side filters
      if (params.category) {
        filteredProducts = filteredProducts.filter(p => p.category == params.category);
      }
      if (params.search) {
        const searchTerm = String(params.search).toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm) ||
          p.keywords.toLowerCase().includes(searchTerm)
        );
      }
      if (params.price_min) {
        const minPrice = Number(params.price_min);
        filteredProducts = filteredProducts.filter(p => Number(p.price_1) >= minPrice);
      }
      if (params.price_max) {
        const maxPrice = Number(params.price_max);
        filteredProducts = filteredProducts.filter(p => Number(p.price_1) <= maxPrice);
      }

      // Client-side pagination
      const perPage = 20;
      const currentPage = Number(page) || 1;
      const offset = (currentPage - 1) * perPage;
      const paginatedProducts = filteredProducts.slice(offset, offset + perPage);
      const totalPages = Math.ceil(filteredProducts.length / perPage);

      // Create pagination response to match expected format
      const paginatedResponse: PaginatedResponse<ProductModel> = {
        current_page: currentPage,
        data: paginatedProducts,
        first_page_url: `products-1?page=1`,
        from: offset + 1,
        last_page: totalPages,
        last_page_url: `products-1?page=${totalPages}`,
        links: [],
        next_page_url: currentPage < totalPages ? `products-1?page=${currentPage + 1}` : null,
        path: 'products-1',
        per_page: perPage,
        prev_page_url: currentPage > 1 ? `products-1?page=${currentPage - 1}` : null,
        to: Math.min(offset + perPage, filteredProducts.length),
        total: filteredProducts.length
      };

      console.log('✅ ProductModel.fetchProducts: Success', {
        requestedPage: page,
        totalProducts: products.length,
        filteredProducts: filteredProducts.length,
        returnedProducts: paginatedProducts.length,
        filters: params
      });

      return paginatedResponse;
    } catch (error) {
      console.error('❌ ProductModel.fetchProducts: API request failed:', error);
      
      // Return empty pagination structure on error to prevent app crashes
      return {
        current_page: 1,
        data: [],
        first_page_url: '',
        from: null,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        per_page: 20,
        prev_page_url: null,
        to: null,
        total: 0
      };
    }
  }

  /** Fetch a single product by ID (GET /products-1 and filter by ID). */
  static async fetchProductById(id: string | number): Promise<ProductModel> {
    try {
      console.log(`🔍 ProductModel.fetchProductById: Fetching product ID ${id}`);
      
      // Use the working products-1 endpoint and filter by ID
      const response = await http_get(`products-1`);
      console.log(`📦 ProductModel.fetchProductById: Response received:`, response);
      
      // Handle the response structure {code, message, data}
      const productsData = response.data || [];
      console.log(`📦 ProductModel.fetchProductById: Products data:`, productsData);
      
      // Find the product with matching ID
      const productData = productsData.find((product: any) => product.id == id);
      
      if (!productData) {
        console.error(`❌ ProductModel.fetchProductById: Product with ID ${id} not found`);
        throw new Error(`Product with ID ${id} not found`);
      }
      
      console.log(`✅ ProductModel.fetchProductById: Found product:`, productData);
      return ProductModel.fromJson(productData);
    } catch (error) {
      console.error(`❌ ProductModel.fetchProductById: Error fetching product ${id}:`, error);
      throw error;
    }
  }

  /** Fetch products by category (GET /products?category=:id). */
  static async fetchProductsByCategory(
    categoryId: number,
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await this.fetchProducts(page, { ...params, category: categoryId });
    } catch (error) {
      throw error;
    }
  }

  /** Search products (GET /products?search=:term). */
  static async searchProducts(
    searchTerm: string,
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ProductModel>> {
    try {
      return await this.fetchProducts(page, { ...params, search: searchTerm });
    } catch (error) {
      throw error;
    }
  }

  /** Create a new product (POST /product-create). */
  static async createProduct(
    productData: Partial<ProductModel>
  ): Promise<ProductModel> {
    try {
      // Mobile app uses /product-create endpoint
      const response = await http_post("product-create", productData);
      // Handle mobile app response format {code, message, data}
      const productResponseData = response.data || response;
      return ProductModel.fromJson(productResponseData);
    } catch (error) {
      throw error;
    }
  }

  /** Update product (PUT /products/:id). */
  static async updateProduct(
    id: string | number,
    productData: Partial<ProductModel>
  ): Promise<ProductModel> {
    try {
      const response = await http_post(
        `products/${id}?_method=PUT`,
        productData
      );
      return ProductModel.fromJson(response);
    } catch (error) {
      throw error;
    }
  }

  /** Delete product (POST /products-delete). */
  static async deleteProduct(id: string | number): Promise<boolean> {
    try {
      // Mobile app uses /products-delete with id in request body
      await http_post("products-delete", { id: id });
      return true;
    } catch (error) {
      throw error;
    }
  }
}
export default ProductModel; 