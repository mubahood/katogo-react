import Utils from "../services/Utils";
import { http_get } from "../services/Api";
import { API_CONFIG, LOCAL_DISTRICTS } from "../constants";

export class DistrictModel {
  id = "0";
  jobs_count = "";
  name = "";

  static async getItems(): Promise<DistrictModel[]> {
    let localData: DistrictModel[] = [];
    try {
      localData = await this.getLocal();
      if (localData.length > 0) {
        return localData;
      }
    } catch (error) {
    }

    try {
      await this.getOnline();
      localData = await this.getLocal();
      if (!localData || localData.length === 0) {
        throw new Error("Failed to fetch districts.");
      }
      return localData;
    } catch (error) {
      alert("Failed to load districts: " + error);
      throw error;
    }
  }

  static async getLocal(): Promise<DistrictModel[]> {
    try {
      const rawData = Utils.loadFromDatabase(LOCAL_DISTRICTS);
      if (!Array.isArray(rawData)) {
        return [];
      }

      return rawData.map((item) =>
        DistrictModel.fromJson(JSON.stringify(item))
      );
    } catch (error) {
      return [];
    }
  }

  static async getOnline(): Promise<void> {
    try {
      const response = await http_get("districts", {});

      if (response.code !== 1 || !Array.isArray(response.data)) {
        throw new Error(response.message || "Failed to fetch items.");
      }
      Utils.saveToDatabase(LOCAL_DISTRICTS, response.data);
    } catch (error) {
      throw error;
    }
  }

  toJSON(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        result[key] = (this as any)[key];
      }
    }
    return result;
  }

  static fromJson(data: string): DistrictModel {
    try {
      const obj = JSON.parse(data) || {};
      const model = new DistrictModel();
      for (const key of Object.keys(obj)) {
        if (key in model) {
          (model as any)[key] = obj[key];
        }
      }
      return model;
    } catch {
      return new DistrictModel();
    }
  }
}
