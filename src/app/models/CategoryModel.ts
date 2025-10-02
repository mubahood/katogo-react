// src/app/models/CategoryModel.ts

import { http_get, http_post } from "../services/Api";
import Utils from "../services/Utils";

export class CategoryModel {
  id: number = 0;
  category: string = "";
  image: string = "";
  banner_image: string | null = null;
  show_in_banner: string = "No";
  show_in_categories: string = "Yes";
  attributes: string[] | null = null;
  is_parent: string = "No";
  parent_id: number | null = null;
  parent_text: number = 0;
  category_text: number = 0;
  created_at: string = "";
  updated_at: string = "";

  /**
   * Update fields with provided partial data.
   */
  updateProfile(data: Partial<CategoryModel>): void {
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
   * Creates a CategoryModel instance from a plain object or JSON string.
   */
  static fromJson(data: string | Record<string, any>): CategoryModel {
    const model = new CategoryModel();
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
    return model;
  }

  /**
   * Helper: Returns the category image URL with fallback.
   */
  getImageUrl(): string {
    return this.image 
      ? Utils.img(this.image) 
      : Utils.img("media/categories/placeholder.png");
  }

  /**
   * Helper: Returns the banner image URL with fallback.
   */
  getBannerImageUrl(): string | null {
    return this.banner_image ? Utils.img(this.banner_image) : null;
  }

  /**
   * Helper: Check if category should be shown in banner.
   */
  isShownInBanner(): boolean {
    return this.show_in_banner === "Yes";
  }

  /**
   * Helper: Check if category should be shown in categories list.
   */
  isShownInCategories(): boolean {
    return this.show_in_categories === "Yes";
  }

  /**
   * Helper: Check if category is a parent category.
   */
  isParentCategory(): boolean {
    return this.is_parent === "Yes";
  }

  /** 
   * Fetch all categories (GET /api/ProductCategory). 
   * ⚠️ WARNING: This makes a direct API call! Should only be called from ManifestService cache.
   */
  static async fetchCategories(): Promise<CategoryModel[]> {
    try {
      console.log('🔴 CategoryModel.fetchCategories() - Making API call to /api/ProductCategory');
      
      // Mobile app uses /api/ProductCategory with is_not_private=1 parameter
      const response = await http_get("api/ProductCategory?is_not_private=1");
      
      // Handle API response format: {code, message, data}
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch categories");
      }
      
      const categoriesData = response.data;
      if (!Array.isArray(categoriesData)) {
        throw new Error("Invalid response format for categories.");
      }
      
      console.log(`✅ Categories fetched: ${categoriesData.length} items`);
      return categoriesData.map((item: any) => CategoryModel.fromJson(item));
    } catch (error: any) {
      // Provide better error context for network issues
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        console.warn('🔧 Cannot reach API server for categories');
      }
      console.error('❌ Category fetch failed:', error);
      throw error;
    }
  }

  /** Fetch a single category by ID (GET /categories/:id). */
  static async fetchCategoryById(id: string | number): Promise<CategoryModel> {
    try {
      const response = await http_get(`/categories/${id}`);
      
      // Handle API response format: {code, message, data}
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch category");
      }
      
      return CategoryModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /** Create a new category (POST /categories). */
  static async createCategory(categoryData: Partial<CategoryModel>): Promise<CategoryModel> {
    try {
      const response = await http_post("/categories", categoryData);
      return CategoryModel.fromJson(response);
    } catch (error) {
      throw error;
    }
  }

  /** Update category (PUT /categories/:id). */
  static async updateCategory(
    id: string | number,
    categoryData: Partial<CategoryModel>
  ): Promise<CategoryModel> {
    try {
      const response = await http_post(`/categories/${id}?_method=PUT`, categoryData);
      return CategoryModel.fromJson(response);
    } catch (error) {
      throw error;
    }
  }

  /** Delete category (DELETE /categories/:id). */
  static async deleteCategory(id: string | number): Promise<boolean> {
    try {
      await http_post(`/categories/${id}?_method=DELETE`, {});
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default CategoryModel;
