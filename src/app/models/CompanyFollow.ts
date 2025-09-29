// src/models/CompanyFollow.ts

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

export class CompanyFollow {
  id: string = "";
  created_at: string = "";
  updated_at: string = "";
  user_id: string = "";
  company_id: string = "";

  // Instead of user_id_text, company_id_text => user_text, company_text
  user_text: string = "";
  company_text: string = "";

  /**
   * Updates the current follow object with new partial data.
   */
  updateFollow(data: Partial<CompanyFollow>): void {
    Object.assign(this, data);
  }

  /**
   * Convert this instance to a plain object (useful for sending to an API).
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
   * Creates a CompanyFollow instance from a plain object or JSON string.
   */
  static fromJson(data: string | Record<string, any>): CompanyFollow {
    const model = new CompanyFollow();

    let obj = typeof data === "string" ? {} : data;
    if (typeof data === "string") {
      try {
        obj = JSON.parse(data);
      } catch (error) {
        return model; // Return default if parse fails
      }
    }

    const modelKeys = Object.keys(model);
    for (const key of Object.keys(obj)) {
      if (modelKeys.includes(key)) {
        (model as any)[key] = obj[key];
      }
    }
    return model;
  }

  // ------------------------------
  //   STATIC HTTP HELPER METHODS
  // ------------------------------

  /**
   * Fetch paginated company-follows for the current user
   * e.g. GET /my-company-follows?page=1
   */
  static async fetchMyCompanyFollows(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<CompanyFollow>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      const response = await http_get(
        `/my-company-follows?${queryParams.toString()}`
      );
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch company follows.");
      }

      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) =>
        CompanyFollow.fromJson(item)
      );

      return paginatedData as PaginatedResponse<CompanyFollow>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch paginated followers for a specific company
   * e.g. GET /company-followers?page=1&company_id=123
   */
  static async fetchCompanyFollowers(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<CompanyFollow>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      const response = await http_get(
        `/company-followers?${queryParams.toString()}`
      );
      if (response.code !== 1) {
        throw new Error(
          response.message || "Failed to fetch company followers."
        );
      }

      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) =>
        CompanyFollow.fromJson(item)
      );

      return paginatedData as PaginatedResponse<CompanyFollow>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new follow (POST /company-follow).
   */
  static async createFollow(
    followData: Partial<CompanyFollow>
  ): Promise<CompanyFollow> {
    try {
      const response = await http_post("/company-follow", followData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to create company follow.");
      }
      return CompanyFollow.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove/unfollow a company (DELETE /company-follow/:id).
   */
  static async removeFollow(id: string | number): Promise<boolean> {
    try {
      const response = await http_post(
        `/company-follow/${id}?_method=DELETE`,
        {}
      );
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to remove follow.");
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
