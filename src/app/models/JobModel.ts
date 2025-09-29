// src/models/JobModel.ts

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

export class JobModel {
  id: string = "";
  created_at: string = "";
  title: string = "";
  posted_by_id: string = "";
  status: string = "Pending";
  deadline: string = "";
  category_id: string = "";
  district_id: string = "";
  sub_county_id: string = "";
  address: string = "";
  vacancies_count: number = 0;
  employment_status: string = "Full Time";
  workplace: string = "Onsite";
  responsibilities: string = "";
  experience_field: string = "";
  experience_period: string = "";
  show_salary: string = "Yes";
  minimum_salary: number = 0;
  maximum_salary: number = 0;
  benefits: string = "";
  job_icon: string = "";
  gender: string = "";
  min_age: string = "";
  max_age: string = "";
  required_video_cv: string = "No";
  minimum_academic_qualification: string = "";
  application_method: string = "";
  application_method_details: string = "";
  slug: string = "";

  /**
   * Updates the job fields with provided partial data.
   * @param data Partial data to update the job fields.
   */
  updateProfile(data: Partial<JobModel>): void {
    Object.assign(this, data);
  }

  /**
   * Converts the JobModel instance to a plain object.
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
   * Creates a JobModel instance from a plain JS object or JSON string.
   * @param data The plain object or JSON string containing job data.
   */
  static fromJson(data: string | Record<string, any>): JobModel {
    const model = new JobModel();
    let obj = typeof data === "string" ? {} : data;
    if (typeof data === "string") {
      try {
        obj = JSON.parse(data);
      } catch (error) {
        return model; // Return default if parsing fails
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

  // Helper: Returns a formatted salary range if salary should be shown.
  getFormattedSalary(): string {
    if (this.show_salary.toLowerCase() === "yes") {
      return `UGX ${new Intl.NumberFormat().format(this.minimum_salary)} – ${new Intl.NumberFormat().format(this.maximum_salary)}`;
    }
    return "Hidden";
  }

  // Helper: Returns a combined location string (district and sub-county).
  getLocation(): string {
    let location = "";
    if (this.district_id) location += this.district_id;
    if (this.sub_county_id) location += ", " + this.sub_county_id;
    return location || "N/A";
  }

  /**
   * Fetch paginated jobs from Laravel's 'jobs' endpoint.
   * @param page The page number to request.
   * @param params Additional query params for filtering or search.
   * @returns A PaginatedResponse of JobModel
   */
  static async fetchJobs(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<JobModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(Object.entries(params).map(([key, val]) => [key, String(val)])),
      });

      const response = await http_get(`/jobs?${queryParams.toString()}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch jobs.");
      }

      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) => JobModel.fromJson(item));
      return paginatedData as PaginatedResponse<JobModel>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch jobs with an extended filter object. Supports all the standard filters plus:
   * - employment_status
   * - workplace
   * - gender
   * - experience_field
   * @param page The page number.
   * @param filters Extended filter object.
   * @returns A PaginatedResponse of JobModel.
   */
  static async fetchJobsWithFilters(
    page = 1,
    filters: {
      search?: string;
      category?: string;
      industry?: string;
      district?: string;
      deadline?: string;
      company?: string;
      salary?: string;
      sort?: string;
      employment_status?: string;
      workplace?: string;
      gender?: string;
      experience_field?: string;
    } = {}
  ): Promise<PaginatedResponse<JobModel>> {
    // Directly pass the filters to the existing fetchJobs function.
    return this.fetchJobs(page, filters);
  }

  static async fetchCompanyJobs(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<JobModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(Object.entries(params).map(([key, val]) => [key, String(val)])),
      });

      const response = await http_get(`/company-jobs?${queryParams.toString()}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch jobs.");
      }
      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) => JobModel.fromJson(item));
      return paginatedData as PaginatedResponse<JobModel>;
    } catch (error) {
      throw error;
    }
  }

  static async fetchMyJobs(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<JobModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(Object.entries(params).map(([key, val]) => [key, String(val)])),
      });

      const response = await http_get(`/my-jobs?${queryParams.toString()}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch user jobs.");
      }
      const paginatedData: PaginatedResponse<any> = response.data;
      paginatedData.data = paginatedData.data.map((item: any) => JobModel.fromJson(item));
      return paginatedData as PaginatedResponse<JobModel>;
    } catch (error) {
      throw error;
    }
  }

  static async fetchJobById(id: string | number): Promise<JobModel> {
    try {
      const response = await http_get(`/jobs/${id}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch job.");
      }
      return JobModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  static async createJob(jobData: Partial<JobModel>): Promise<JobModel> {
    try {
      const response = await http_post("/jobs", jobData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to create job.");
      }
      return JobModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  static async updateJob(id: string | number, jobData: Partial<JobModel>): Promise<JobModel> {
    try {
      const response = await http_post(`/jobs/${id}?_method=PUT`, jobData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to update job.");
      }
      return JobModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

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
