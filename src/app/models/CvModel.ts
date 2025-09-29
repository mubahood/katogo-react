// src/models/CvModel.ts

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

export class CvModel {
  id: string = "";
  username: string = "";
  password: string = "";
  name: string = "";
  avatar: string = "";
  remember_token: string = "";
  created_at: string = "";
  updated_at: string = "";
  enterprise_id: string = "";
  first_name: string = "";
  last_name: string = "";
  date_of_birth: string = "";
  place_of_birth: string = "";
  sex: string = "";
  home_address: string = "";
  current_address: string = "";
  phone_number_1: string = "";
  phone_number_2: string = "";
  email: string = "";
  nationality: string = "";
  religion: string = "";
  spouse_name: string = "";
  spouse_phone: string = "";
  father_name: string = "";
  father_phone: string = "";
  mother_name: string = "";
  mother_phone: string = "";
  languages: string = "";
  emergency_person_name: string = "";
  emergency_person_phone: string = "";
  national_id_number: string = "";
  passport_number: string = "";
  tin: string = "";
  nssf_number: string = "";
  bank_name: string = "";
  bank_account_number: string = "";
  primary_school_name: string = "";
  primary_school_year_graduated: string = "";
  seconday_school_name: string = "";
  seconday_school_year_graduated: string = "";
  high_school_name: string = "";
  high_school_year_graduated: string = "";
  degree_university_name: string = "";
  degree_university_year_graduated: string = "";
  masters_university_name: string = "";
  masters_university_year_graduated: string = "";
  phd_university_name: string = "";
  phd_university_year_graduated: string = "";
  user_type: string = "";
  demo_id: string = "";
  user_id: string = "";
  user_batch_importer_id: string = "";
  school_pay_account_id: string = "";
  school_pay_payment_code: string = "";
  given_name: string = "";
  deleted_at: string = "";
  marital_status: string = "";
  verification: string = "";
  current_class_id: string = "";
  current_theology_class_id: string = "";
  status: string = "";
  parent_id: string = "";
  main_role_id: string = "";
  stream_id: string = "";
  account_id: string = "";
  has_personal_info: string = "";
  has_educational_info: string = "";
  has_account_info: string = "";
  diploma_school_name: string = "";
  diploma_year_graduated: string = "";
  certificate_school_name: string = "";
  certificate_year_graduated: string = "";
  company_id: string = "";
  managed_by: string = "";
  title: string = "";
  dob: string = "";
  intro: string = "";
  rate: string = "";
  can_evaluate: string = "";
  work_load_pending: string = "";
  work_load_completed: string = "";
  belongs_to_company: string = "";
  card_status: string = "";
  card_number: string = "";
  card_balance: string = "";
  card_accepts_credit: string = "";
  card_max_credit: string = "";
  card_accepts_cash: string = "";
  is_dependent: string = "";
  dependent_status: string = "";
  dependent_id: string = "";
  card_expiry: string = "";
  belongs_to_company_status: string = "";
  objective: string = "";
  special_qualification: string = "";
  career_summary: string = "";
  present_salary: string = "";
  expected_salary: string = "";
  expected_job_level: string = "";
  expected_job_nature: string = "";
  preferred_job_location: string = "";
  preferred_job_category: string = "";
  preferred_job_category_other: string = "";
  preferred_job_districts: string = "";
  preferred_job_abroad: string = "";
  preferred_job_countries: string = "";
  has_disability: string = "";
  is_registered_on_disability: string = "";
  disability_type: string = "";
  dificulty_to_see: string = "";
  dificulty_to_hear: string = "";
  dificulty_to_walk: string = "";
  dificulty_to_speak: string = "";
  dificulty_display_on_cv: string = "";
  country_code: string = "";
  blood_group: string = "";
  height: string = "";
  weight: string = "";

  company_name!: string;
  company_year_of_establishment!: string;
  company_employees_range!: string;
  company_country!: string;
  company_address!: string;
  company_district_id!: string;
  company_sub_county_id!: string;
  company_main_category_id!: string;
  company_sub_category_id!: string;
  company_phone_number!: string;
  company_description!: string;
  company_trade_license_no!: string;
  company_website_url!: string;
  company__email!: string;
  company__phone!: string;
  company_has_accessibility!: string;
  company_has_disability_inclusion_policy!: string;
  company_logo!: string;
  company_tax_id!: string;
  company_facebook_url!: string;
  company_linkedin_url!: string;
  company_operating_hours!: string;
  company_certifications!: string;
  company_ownership_type!: string;
  company_status!: string;
  is_company!: string;

  /**
   * Updates the job fields with provided partial data.
   * @param data Partial data to update the job fields.
   */
  updateProfile(data: Partial<CvModel>): void {
    Object.assign(this, data);
  }

  /**
   * Converts the CvModel instance to a plain object.
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
   * Creates a CvModel instance from a plain JS object or JSON string.
   * @param data The plain object or JSON string containing job data.
   */
  static fromJson(data: string | Record<string, any>): CvModel {
    const model = new CvModel();

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
   * @returns A PaginatedResponse of CvModel
   */
  static async fetchJobs(
    page = 1,
    params: Record<string, string | number> = {}
  ): Promise<PaginatedResponse<CvModel>> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        ),
      });

      // Example: GET /cvs?page=1&search=Engineer
      const response = await http_get(`/cvs?${queryParams.toString()}`);
      // Your ApiResponser returns { code, message, data }
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch jobs.");
      }

      const paginatedData: PaginatedResponse<any> = response.data;

      // Convert each item in data[] to CvModel
      paginatedData.data = paginatedData.data.map((item: any) =>
        CvModel.fromJson(item)
      );

      return paginatedData as PaginatedResponse<CvModel>;
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
  ): Promise<PaginatedResponse<CvModel>> {
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

      // Convert each item in data[] to CvModel
      paginatedData.data = paginatedData.data.map((item: any) =>
        CvModel.fromJson(item)
      );

      return paginatedData as PaginatedResponse<CvModel>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch a single job by ID from the 'jobs' endpoint
   * e.g. GET /cvs/123
   * @param id The job ID
   * @returns A single CvModel instance
   */
  static async fetchJobById(id: string | number): Promise<CvModel> {
    try {
      const response = await http_get(`/cvs/${id}`);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch job.");
      }
      return CvModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new job on the server
   * e.g. POST /cvs
   * @param jobData The CvModel instance or object representing the job
   * @returns The newly created CvModel from the API
   */
  static async createJob(jobData: Partial<CvModel>): Promise<CvModel> {
    try {
      // Convert to JSON for submission
      const response = await http_post("/cvs", jobData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to create job.");
      }
      return CvModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing job on the server
   * e.g. PUT /cvs/{id}
   * @param id The ID of the job to update
   * @param jobData The updated data
   * @returns The updated CvModel instance from the API
   */
  static async updateJob(
    id: string | number,
    jobData: Partial<CvModel>
  ): Promise<CvModel> {
    try {
      const response = await http_post(`/cvs/${id}?_method=PUT`, jobData);
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to update job.");
      }
      return CvModel.fromJson(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a job by ID
   * e.g. DELETE /cvs/{id}
   * @param id The job ID
   * @returns boolean - true if deleted successfully
   */
  static async deleteJob(id: string | number): Promise<boolean> {
    try {
      const response = await http_post(`/cvs/${id}?_method=DELETE`, {});
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to delete job.");
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
