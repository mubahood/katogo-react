// src/app/models/VendorModel.ts

import { http_get, http_post } from "../services/Api";
import Utils from "../services/Utils";

export class VendorModel {
  id: number = 0;
  username: string = "";
  first_name: string = "";
  last_name: string = "";
  email: string | null = null;
  phone_number: string = "";
  user_type: string = "Vendor";
  sex: string | null = null;
  reg_number: string = "";
  country: string = "";
  occupation: string = "";
  profile_photo: string | null = null;
  profile_photo_large: string = "";
  location_lat: string = "";
  location_long: string = "";
  facebook: string = "";
  twitter: string = "";
  whatsapp: string | null = null;
  linkedin: string = "";
  website: string = "";
  other_link: string = "";
  cv: string = "";
  language: string = "";
  about: string = "";
  address: string = "";
  avatar: string = "";
  name: string = "";
  campus_id: number = 1;
  complete_profile: number | null = null;
  title: string | null = null;
  dob: string | null = null;
  intro: string | null = null;
  business_name: string = "";
  business_license_number: string = "";
  business_license_issue_authority: string = "";
  business_license_issue_date: string = "";
  business_license_validity: string = "";
  business_address: string = "";
  business_phone_number: string = "";
  business_whatsapp: string = "";
  business_email: string = "";
  business_logo: string = "";
  business_cover_photo: string | null = null;
  business_cover_details: string | null = null;
  nin: string = "";
  status: string = "Active";
  approved: number | null = null;
  reg_date: string | null = null;
  last_seen: string | null = null;
  created_at: string = "";
  updated_at: string = "";
  remember_token: string | null = null;

  /**
   * Update fields with provided partial data.
   */
  updateProfile(data: Partial<VendorModel>): void {
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
   * Creates a VendorModel instance from a plain object or JSON string.
   */
  static fromJson(data: string | Record<string, any>): VendorModel {
    const model = new VendorModel();
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
   * Helper: Returns the vendor avatar URL with fallback.
   */
  getAvatarUrl(): string {
    if (this.avatar && !this.avatar.includes("user.jpg")) {
      return Utils.img(this.avatar);
    }
    if (this.profile_photo) {
      return Utils.img(this.profile_photo);
    }
    return Utils.img("media/avatars/default.jpg");
  }

  /**
   * Helper: Returns the vendor's full name.
   */
  getFullName(): string {
    return `${this.first_name} ${this.last_name}`.trim() || this.name || this.username;
  }

  /**
   * Helper: Returns the business logo URL with fallback.
   */
  getBusinessLogoUrl(): string {
    return this.business_logo 
      ? Utils.img(this.business_logo) 
      : Utils.img("media/vendors/default-logo.png");
  }

  /**
   * Helper: Check if vendor is active.
   */
  isActive(): boolean {
    return this.status === "Active";
  }

  /**
   * Helper: Check if vendor is approved.
   */
  isApproved(): boolean {
    return this.approved === 1;
  }

  /**
   * Helper: Check if vendor profile is complete.
   */
  isProfileComplete(): boolean {
    return this.complete_profile === 1;
  }

  /** Fetch all vendors (GET /vendors). */
  static async fetchVendors(): Promise<VendorModel[]> {
    try {
      const response = await http_get("/vendors");
      
      // Handle API response format: {code, message, data}
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch vendors");
      }
      
      const vendorsData = response.data;
      if (!Array.isArray(vendorsData)) {
        throw new Error("Invalid response format for vendors.");
      }
      
      return vendorsData.map((item: any) => VendorModel.fromJson(item));
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error;
    }
  }

  /** Fetch a single vendor by ID (GET /vendors/:id). */
  static async fetchVendorById(id: string | number): Promise<VendorModel> {
    try {
      const response = await http_get(`/vendors/${id}`);
      
      // Handle API response format: {code, message, data}
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch vendor");
      }
      
      return VendorModel.fromJson(response.data);
    } catch (error) {
      console.error("Error fetching vendor by ID:", error);
      throw error;
    }
  }

  /** Create a new vendor (POST /vendors). */
  static async createVendor(vendorData: Partial<VendorModel>): Promise<VendorModel> {
    try {
      const response = await http_post("/vendors", vendorData);
      return VendorModel.fromJson(response);
    } catch (error) {
      console.error("Error creating vendor:", error);
      throw error;
    }
  }

  /** Update vendor (PUT /vendors/:id). */
  static async updateVendor(
    id: string | number,
    vendorData: Partial<VendorModel>
  ): Promise<VendorModel> {
    try {
      const response = await http_post(`/vendors/${id}?_method=PUT`, vendorData);
      return VendorModel.fromJson(response);
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  }

  /** Delete vendor (DELETE /vendors/:id). */
  static async deleteVendor(id: string | number): Promise<boolean> {
    try {
      await http_post(`/vendors/${id}?_method=DELETE`, {});
      return true;
    } catch (error) {
      console.error("Error deleting vendor:", error);
      throw error;
    }
  }
}

export default VendorModel;
