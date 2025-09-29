// src/app/types/ApiResponse.ts

/**
 * Standard API response format for all endpoints
 * Following the system rules for response structure
 */
export interface ApiResponse<T = any> {
  code: number; // 1 for success, 0 for failure
  status: number;
  message: string;
  data: T;
}

/**
 * Login/Register response data structure
 */
export interface AuthResponseData {
  id: number;
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  reg_date?: string;
  last_seen?: string;
  email: string;
  approved?: number;
  profile_photo?: string;
  user_type?: string;
  sex?: string;
  reg_number?: string;
  country?: string;
  occupation?: string;
  profile_photo_large?: string;
  phone_number?: string;
  location_lat?: string;
  location_long?: string;
  facebook?: string;
  twitter?: string;
  whatsapp?: string;
  linkedin?: string;
  website?: string;
  other_link?: string;
  cv?: string;
  language?: string;
  about?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  remember_token: string;
  avatar?: string;
  name?: string;
  campus_id?: number;
  complete_profile?: number;
  title?: string;
  dob?: string;
  intro?: string;
  business_name?: string;
  business_license_number?: string;
  business_license_issue_authority?: string;
  business_license_issue_date?: string;
  business_license_validity?: string;
  business_address?: string;
  business_phone_number?: string;
  business_whatsapp?: string;
  business_email?: string;
  business_logo?: string;
  business_cover_photo?: string;
  business_cover_details?: string;
  nin?: string;
  status?: string;
  token?: string;
}

/**
 * Type for login response
 */
export type LoginResponse = ApiResponse<AuthResponseData>;

/**
 * Type for register response
 */
export type RegisterResponse = ApiResponse<AuthResponseData>;

/**
 * Generic error response
 */
export interface ErrorResponse {
  code: 0;
  status: 0;
  message: string;
  data?: any;
}
