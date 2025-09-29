// src/models/MyJonApplicationModel.ts

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

export class MyJonApplicationModel {
  id: string = "";
  created_at: string = "";
  updated_at: string = "";
  applicant_id: string = "";
  applicant_text: string = "";
  job_id: string = "";
  job_text: string = "";
  employer_id: string = "";
  employer_text: string = "";
  attachments: string = "";
  employer_message: string = "";
  applicant_message: string = "";
  decline_reason: string = "";
  status: string = "";
  interview_email_sent: string = "";
  hired_email_sent: string = "";
  declinded_email_sent: string = "";
  interview_scheduled_at: string = "";
  interview_location: string = "";
  interview_type: string = "";
  interview_result: string = "";
  interviewer_notes: string = "";
  interviewer_rating: string = "";
  interviewee_feedback: string = "";
  interviewee_notes: string = "";
  interviewee_rating: string = "";
  contract_url: string = "";
  onboarding_start_date: string = "";
  onboarding_notes: string = "";
  additional_info: string = "";

  /**
   * Updates the job fields with provided partial data.
   * @param data Partial data to update the job fields.
   */
  updateProfile(data: Partial<MyJonApplicationModel>): void {
    Object.assign(this, data);
  }

  /**
   * Converts the MyJonApplicationModel instance to a plain object.
   * Useful for sending data to APIs.
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
   * Creates a MyJonApplicationModel instance from a plain JS object or JSON string.
   * @param data The plain object or JSON string containing job data.
   */
  static fromJson(data: string | Record<string, any>): MyJonApplicationModel {
    const model = new MyJonApplicationModel();

    // If data is a JSON string, parse it
    let obj = typeof data === "string" ? {} : data;
    if (typeof data === "string") {
      try {
        obj = JSON.parse(data);
      } catch (error) {
        return model; // Return default if parsing fails
      }
    }

    // Merge values
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
   * Fetch paginated jobs from Laravel's 'jobs' endpoint.
   * @param page The page number to request.
   * @param params Additional query params for filtering or search, e.g. { search: 'Engineer' }
   * @returns A PaginatedResponse of MyJonApplicationModel
   */
  static async fetchJobs(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<MyJonApplicationModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      // Example: GET /jobs?page=1&search=Engineer
      const response = await http_get(
        `/my-job-applications?${queryParams.toString()}`
      );
      // Your ApiResponser returns { code, message, data }
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch jobs.");
      }

      const paginatedData: PaginatedResponse<any> = response.data;

      // Convert each item in data[] to MyJonApplicationModel
      paginatedData.data = paginatedData.data.map((item: any) =>
        MyJonApplicationModel.fromJson(item)
      );

      return paginatedData as PaginatedResponse<MyJonApplicationModel>;
    } catch (error) {
      throw error;
    }
  }

  static async fetchCompanyJobs(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<MyJonApplicationModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      // Example: GET /jobs?page=1&search=Engineer
      const response = await http_get(
        `/company-job-applications?${queryParams.toString()}`
      );
      // Your ApiResponser returns { code, message, data }
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch jobs.");
      }

      const paginatedData: PaginatedResponse<any> = response.data;

      // Convert each item in data[] to MyJonApplicationModel
      paginatedData.data = paginatedData.data.map((item: any) =>
        MyJonApplicationModel.fromJson(item)
      );

      return paginatedData as PaginatedResponse<MyJonApplicationModel>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch the currently authenticated user's jobs (my-jobs).
   * Supports pagination and optional filtering.
   * @param page The page number.
   * @param params Additional query params (e.g., { search: 'Something', status: 'draft' })
   */
  static async fetchMyJobs(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<MyJonApplicationModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      // Example: GET /my-jobs?page=1&search=Engineer
      const response = await http_get(`/my-jobs?${queryParams.toString()}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch user jobs.");
      }

      const paginatedData: PaginatedResponse<any> = response.data;

      // Convert each item in data[] to MyJonApplicationModel
      paginatedData.data = paginatedData.data.map((item: any) =>
        MyJonApplicationModel.fromJson(item)
      );

      return paginatedData as PaginatedResponse<MyJonApplicationModel>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch a single job by ID from the 'jobs' endpoint
   * e.g. GET /jobs/123
   * @param id The job ID
   * @returns A single MyJonApplicationModel instance
   */
  static async fetchJobById(
    id: string | number
  ): Promise<MyJonApplicationModel> {
    try {
      const response = await http_get(`/jobs/${id}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch job.");
      }
      return MyJonApplicationModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new job on the server
   * e.g. POST /jobs
   * @param jobData The MyJonApplicationModel instance or object representing the job
   * @returns The newly created MyJonApplicationModel from the API
   */
  static async createJob(
    jobData: Partial<MyJonApplicationModel>
  ): Promise<MyJonApplicationModel> {
    try {
      // Convert to JSON for submission
      const response = await http_post("/jobs", jobData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to create job.");
      }
      return MyJonApplicationModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing job on the server
   * e.g. PUT /jobs/{id}
   * @param id The ID of the job to update
   * @param jobData The updated data
   * @returns The updated MyJonApplicationModel instance from the API
   */
  static async updateJob(
    id: string | number,
    jobData: Partial<MyJonApplicationModel>
  ): Promise<MyJonApplicationModel> {
    try {
      const response = await http_post(`/jobs/${id}?_method=PUT`, jobData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to update job.");
      }
      return MyJonApplicationModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a job by ID
   * e.g. DELETE /jobs/{id}
   * @param id The job ID
   * @returns boolean - true if deleted successfully
   */
  static async deleteJob(id: string | number): Promise<boolean> {
    try {
      const response = await http_post(`/jobs/${id}?_method=DELETE`, {});
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to delete job.");
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
