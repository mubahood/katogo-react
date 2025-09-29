import Utils from "../services/Utils";
import { http_get } from "../services/Api";
import { API_CONFIG, LOCAL_MANIFEST } from "../constants";
import { DistrictModel } from "./DistrictModel";

export class ManifestModel {
  TOP_PRODUCTS: Record<string, any> = {};
  CATEGORIES: Record<string, any> = {};
  SLIDER_CATEGORIES: Record<string, any> = {};
  TOP_4_PRODUCTS: Record<string, any> = {};
  SECTION_1_PRODUCTS: Record<string, any> = {};
  SECTION_2_PRODUCTS: Record<string, any> = {};
  FIRST_BANNER = {};
  

  static async getItems(): Promise<ManifestModel> {
    let localData = new ManifestModel();
    try {
      localData = await this.getLocal();
      if (localData && localData.CATEGORIES.length > 0) {
        return localData;
      }
    } catch (error) {
    }

    try {
      await this.getOnline();
      localData = await this.getLocal();
      if (!localData || localData.CATEGORIES.length === 0) {
        throw new Error("Failed to fetch manifest items.");
      }
      return localData;
    } catch (error) {
      alert("Failed to load manifest: " + error);
      throw error;
    }
  }

  static async getLocal(): Promise<ManifestModel> {
    const manifest = new ManifestModel();
    try {
      const rawData = Utils.loadFromDatabase(LOCAL_MANIFEST);
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

  static async getOnline(): Promise<void> {
    try {
      const response = await http_get("manifest", {});
      if (response.code !== 1) {
        throw new Error(response.message || "Failed to fetch items.");
      }
      Utils.saveToDatabase(LOCAL_MANIFEST, response.data);
    } catch (error) {
      throw error;
    }
  }

  toJSON(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        result[key] = (this as any)[key];
      }
    }
    return result;
  }

  static fromJson(data: string): ManifestModel {
    const model = new ManifestModel();
    if (!data) return model;
    try {
      const obj = JSON.parse(data);
      for (const key of Object.keys(obj)) {
        if (key in model) {
          (model as any)[key] = obj[key];
        }
      }
      return model;
    } catch {
      return new ManifestModel();
    }
  }
}
