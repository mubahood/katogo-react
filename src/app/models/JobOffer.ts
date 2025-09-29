// src/models/JobOffer.ts

import { http_get, http_post } from "../services/Api";
import Utils from "../services/Utils"; // Adjust import if needed

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

export class JobOffer {
  // ---- Primary fields ----
  id: string = "";
  created_at: string = "";
  updated_at: string = "";
  job_title: string = "";
  company_name: string = "";
  salary: string = "";
  start_date: string = "";
  job_description: string = "";
  candidate_id: string = "";
  company_id: string = "";
  status: string = "";
  candidate_message: string = "";

  // ---- Extra text fields for every *_id property ----
  candidate_text: string = "";
  company_text: string = "";

  /**
   * Update the offer fields with provided partial data.
   */
  updateOffer(data: Partial<JobOffer>): void {
    Object.assign(this, data);
  }

  /**
   * Convert this instance into a plain object (useful for sending to APIs).
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
   * Create a JobOffer from a plain JS object or JSON string.
   */
  static fromJson(data: string | Record<string, any>): JobOffer {
    const model = new JobOffer();

    let obj = typeof data === "string" ? {} : data;
    if (typeof data === "string") {
      try {
        obj = JSON.parse(data);
      } catch (error) {
        return model; // Return default if JSON parse fails
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

  /**
   * ------------------------------
   *   STATIC HTTP HELPER METHODS
   * ------------------------------
   */

  /**
   * Fetch paginated "my job offers" for the currently authenticated user.
   * e.g. GET /my-job-offers?page=1&search=Engineer
   */
  static async fetchMyOffers(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<JobOffer>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      const response = await http_get(
        `/my-job-offers?${queryParams.toString()}`
      );
      // Assuming { code, message, data }
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch my job offers.");
      }

      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) =>
        JobOffer.fromJson(item)
      );

      return paginatedData as PaginatedResponse<JobOffer>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch paginated "company job offers" (for an employer).
   * e.g. GET /company-job-offers?page=1&status=open
   */
  static async fetchCompanyOffers(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<JobOffer>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      const response = await http_get(
        `/company-job-offers?${queryParams.toString()}`
      );
      if (response.code !== 1) {
        throw new Error(
          response.message || "Failed to fetch company job offers."
        );
      }

      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) =>
        JobOffer.fromJson(item)
      );

      return paginatedData as PaginatedResponse<JobOffer>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch a single job offer by ID
   * e.g. GET /job-offers/:id
   */
  static async fetchOfferById(id: string | number): Promise<JobOffer> {
    try {
      const response = await http_get(`/job-offers/${id}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch job offer.");
      }
      return JobOffer.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new job offer
   * e.g. POST /job-offers
   */
  static async createOffer(offerData: Partial<JobOffer>): Promise<JobOffer> {
    try {
      const response = await http_post("/job-offers", offerData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to create job offer.");
      }
      return JobOffer.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing job offer
   * e.g. PUT /job-offers/:id
   */
  static async updateOffer(
    id: string | number,
    offerData: Partial<JobOffer>
  ): Promise<JobOffer> {
    try {
      const response = await http_post(
        `/job-offers/${id}?_method=PUT`,
        offerData
      );
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to update job offer.");
      }
      return JobOffer.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete an existing job offer
   * e.g. DELETE /job-offers/:id
   */
  static async deleteOffer(id: string | number): Promise<boolean> {
    try {
      const response = await http_post(`/job-offers/${id}?_method=DELETE`, {});
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to delete job offer.");
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
