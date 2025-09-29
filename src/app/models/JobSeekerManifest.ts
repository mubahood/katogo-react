// src/models/JobSeekerManifest.ts

import Utils from "../services/Utils";
import { http_get } from "../services/Api";
import { LOCAL_JOBSEEKER_MANIFEST } from "../constants";

export class JobSeekerManifest {
  // Dashboard summary fields
  cv_views: number = 0;
  profile_completion_percentage: number = 0;
  job_application_count: number = 0;
  job_application_pending: number = 0;
  job_application_accepted: number = 0;
  job_application_rejected: number = 0;

  // Detailed lists – you might want to type these more strictly in your real code
  job_offers: any[] = [];
  job_applications: any[] = [];
  upcoming_interviews: any[] = [];
  saved_jobs: any[] = [];

  /**
   * Fetch the manifest data (locally if available, otherwise online).
   */
  static async getItems(): Promise<JobSeekerManifest> {
    let localData = new JobSeekerManifest();
    try {
      // Try to load from local storage first
      localData = await this.getLocal();
      // If we have a valid local manifest (using cv_views as a proxy), trigger online fetch in background
      if (localData) {
        return localData;
      }
    } catch (error) {
    }

    // Otherwise, fetch online and then load from local storage
    try {
      await this.getOnline();
      localData = await this.getLocal();
      if (!localData || localData.cv_views === 0) {
        throw new Error("Failed to fetch jobseeker manifest items.");
      }
      return localData;
    } catch (error) {
      alert("Failed to load jobseeker manifest: " + error);
      throw error;
    }
  }

  /**
   * Load manifest data from local storage.
   */
  static async getLocal(): Promise<JobSeekerManifest> {
    const manifest = new JobSeekerManifest();
    try {
      const rawData = Utils.loadFromDatabase(LOCAL_JOBSEEKER_MANIFEST);
      if (!rawData) return manifest;
      for (const key of Object.keys(rawData)) {
        if (key in manifest) {
          (manifest as any)[key] = rawData[key];
        }
      }
      return manifest;
    } catch (error) {
      return manifest;
    }
  }

  /**
   * Fetch the manifest data from the online API and save it locally.
   */
  static async getOnline(): Promise<void> {
    try {
      const response = await http_get("job-seeker-manifest", {});
      if (response.code !== 1) {
        throw new Error(
          response.message || "Failed to fetch jobseeker manifest items."
        );
      }

      try {
        Utils.saveToDatabase(LOCAL_JOBSEEKER_MANIFEST, response.data);
      } catch (error) {
        alert("Failed to save jobseeker manifest: " + error);
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert the manifest instance to a plain object.
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
   * Create a manifest instance from a JSON string or object.
   * @param data JSON string or object containing manifest data.
   */
  static fromJson(data: string | Record<string, any>): JobSeekerManifest {
    const model = new JobSeekerManifest();
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
}
