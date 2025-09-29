// src/models/ViewRecord.ts

import { http_get, http_post } from "../services/Api";
import Utils from "../services/Utils";

// Generic paginated response interface
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

export class ViewRecord {
  id: string = "";
  created_at: string = "";
  updated_at: string = "";
  type: string = "";
  viewer_id: string = "";
  item_id: string = "";
  company_id: string = "";

  // Extra text fields following your convention:
  viewer_text: string = "";
  item_text: string = "";
  company_text: string = "";

  /**
   * Updates the ViewRecord fields with the provided partial data.
   * @param data Partial data to update the record.
   */
  updateRecord(data: Partial<ViewRecord>): void {
    Object.assign(this, data);
  }

  /**
   * Converts the ViewRecord instance to a plain object.
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
   * Creates a ViewRecord instance from a plain object or JSON string.
   * @param data A plain object or JSON string representing a view record.
   */
  static fromJson(data: string | Record<string, any>): ViewRecord {
    const model = new ViewRecord();
    let obj = typeof data === "string" ? {} : data;
    if (typeof data === "string") {
      try {
        obj = JSON.parse(data);
      } catch (error) {
        return model;
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

  // --------------------------------------------------------
  // STATIC HTTP HELPER METHODS (Endpoints)
  // --------------------------------------------------------

  /**
   * Fetches paginated view records for the authenticated viewer.
   * Endpoint: GET /view-records?type=...
   * @param page Page number (default is 1).
   * @param params Additional query parameters.
   */
  static async fetchMyViewRecords(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ViewRecord>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });
      // Example: GET /view-records?type=...
      const response = await http_get(`/view-records?${queryParams.toString()}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch view records.");
      }
      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) =>
        ViewRecord.fromJson(item)
      );
      return paginatedData as PaginatedResponse<ViewRecord>;
    } catch (error) {
      console.error("Error fetching my view records:", error);
      throw error;
    }
  }

  /**
   * Fetches paginated view records for the authenticated company.
   * Endpoint: GET /company-view-records?type=...
   * @param page Page number (default is 1).
   * @param params Additional query parameters.
   */
  static async fetchCompanyViewRecords(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<ViewRecord>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });
      // Example: GET /company-view-records?type=...
      const response = await http_get(`/company-view-records?${queryParams.toString()}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch company view records.");
      }
      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) =>
        ViewRecord.fromJson(item)
      );
      return paginatedData as PaginatedResponse<ViewRecord>;
    } catch (error) {
      console.error("Error fetching company view records:", error);
      throw error;
    }
  }

  /**
   * Creates a new view record.
   * Endpoint: POST /view-record-create
   * @param recordData The data for the new view record.
   */
  static async createViewRecord(
    recordData: Partial<ViewRecord>
  ): Promise<ViewRecord> {
    try {
      // Convert recordData to JSON if needed
      const response = await http_post("/view-record-create", recordData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to create view record.");
      }
      return ViewRecord.fromJson(response.data);
    } catch (error) {
      console.error("Error creating view record:", error);
      throw error;
    }
  }

  // Optionally, you can add updateViewRecord() or deleteViewRecord() if needed.
}
