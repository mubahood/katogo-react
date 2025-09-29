// src/models/DeliveryAddress.ts

import { http_get } from "../services/Api";
import Utils from "../services/Utils";

export class DeliveryAddress {
  static end_point: string = "delivery-addresses";
  static tableName: string = "delivery_addresses"; // Used as the localStorage key

  id: number = 0;
  created_at: string = "";
  updated_at: string = "";
  address: string = "";
  latitude: string = "";
  longitude: string = "";
  shipping_cost: string = "";

  /**
   * Creates a DeliveryAddress instance from a JSON object.
   */
  static fromJson(m: any): DeliveryAddress {
    const obj = new DeliveryAddress();
    if (!m) return obj;
    obj.id = Utils.int_parse(m["id"]);
    obj.created_at = Utils.to_str(m["created_at"], "");
    obj.updated_at = Utils.to_str(m["updated_at"], "");
    obj.address = Utils.to_str(m["address"], "");
    obj.latitude = Utils.to_str(m["latitude"], "");
    obj.longitude = Utils.to_str(m["longitude"], "");
    obj.shipping_cost = Utils.to_str(m["shipping_cost"], "");
    return obj;
  }

  /**
   * Converts this instance to a plain object.
   */
  toJson(): Record<string, any> {
    return {
      id: this.id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude,
      shipping_cost: this.shipping_cost,
    };
  }

  /**
   * Fetches local DeliveryAddress records from localStorage.
   */
  static async getLocalData(where: string = "1"): Promise<DeliveryAddress[]> {
    const data: DeliveryAddress[] = [];
    const stored = Utils.loadFromDatabase(DeliveryAddress.tableName);
    if (!stored) return data;
    try {
      const arr = JSON.parse(stored);
      if (!Array.isArray(arr)) return data;
      arr.forEach((m: any) => data.push(DeliveryAddress.fromJson(m)));
    } catch (e) {
    }
    return data;
  }

  /**
   * Gets DeliveryAddress items from localStorage.
   * If none exist, fetches them online and stores them locally.
   */
  static async get_items(where: string = "1"): Promise<DeliveryAddress[]> {
    let data = await DeliveryAddress.getLocalData(where);
    if (data.length === 0) {
      await DeliveryAddress.getOnlineItems();
      data = await DeliveryAddress.getLocalData(where);
    } else {
      // Optionally refresh online in the background.
      DeliveryAddress.getOnlineItems();
    }
    return data;
  }

  /**
   * Fetches online DeliveryAddress records using http_get and saves them in localStorage.
   */
  static async getOnlineItems(): Promise<DeliveryAddress[]> {
    const data: DeliveryAddress[] = [];
    try {
      const resp = await http_get(DeliveryAddress.end_point, {});
      if (resp.code !== 1) return [];
      if (Array.isArray(resp.data)) {
        // Map each fetched item to its JSON representation.
        const items = resp.data.map((x: any) =>
          DeliveryAddress.fromJson(x).toJson()
        );
        Utils.saveToDatabase(DeliveryAddress.tableName, JSON.stringify(items));
      }
    } catch (error) {
    }
    return data;
  }

  /**
   * Saves this DeliveryAddress instance to localStorage.
   */
  async save(): Promise<void> {
    let current = await DeliveryAddress.getLocalData();
    const index = current.findIndex((item) => item.id === this.id);
    if (index !== -1) {
      current[index] = this;
    } else {
      current.push(this);
    }
    Utils.saveToDatabase(DeliveryAddress.tableName, JSON.stringify(current));
  }

  /**
   * Deletes all DeliveryAddress records from localStorage.
   */
  static async deleteAll(): Promise<void> {
    Utils.saveToDatabase(DeliveryAddress.tableName, JSON.stringify([]));
  }

  /**
   * Deletes this DeliveryAddress record from localStorage.
   */
  async delete(): Promise<void> {
    let current = await DeliveryAddress.getLocalData();
    current = current.filter((item) => item.id !== this.id);
    Utils.saveToDatabase(DeliveryAddress.tableName, JSON.stringify(current));
  }
}
