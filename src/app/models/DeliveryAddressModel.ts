// src/app/models/DeliveryAddressModel.ts
import { http_get } from "../services/Api";
import Utils from "../services/Utils";

export interface DeliveryAddress {
  id: number;
  created_at: string;
  updated_at: string;
  address: string;
  latitude: string;
  longitude: string;
  shipping_cost: string;
}

export class DeliveryAddressModel implements DeliveryAddress {
  static end_point = "delivery-addresses";
  static tableName = "delivery_addresses";

  id: number = 0;
  created_at: string = "";
  updated_at: string = "";
  address: string = "";
  latitude: string = "";
  longitude: string = "";
  shipping_cost: string = "";

  constructor(data: Partial<DeliveryAddress> = {}) {
    Object.assign(this, data);
  }

  /**
   * Creates a DeliveryAddressModel instance from a JSON object.
   */
  static fromJson(m: any): DeliveryAddressModel {
    if (!m) return new DeliveryAddressModel();

    return new DeliveryAddressModel({
      id: Utils.int_parse(m['id']),
      created_at: Utils.to_str(m['created_at'], ''),
      updated_at: Utils.to_str(m['updated_at'], ''),
      address: Utils.to_str(m['address'], ''),
      latitude: Utils.to_str(m['latitude'], ''),
      longitude: Utils.to_str(m['longitude'], ''),
      shipping_cost: Utils.to_str(m['shipping_cost'], ''),
    });
  }

  /**
   * Serializes this DeliveryAddressModel to a plain object.
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
   * Fetches delivery addresses from the online endpoint.
   */
  static async getItems(): Promise<DeliveryAddressModel[]> {
    try {
      const response = await http_get(DeliveryAddressModel.end_point, {});
      
      if (response.code !== 1) {
        return [];
      }

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((item: any) => DeliveryAddressModel.fromJson(item));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get formatted display text with shipping cost
   */
  getDisplayText(): string {
    return `${this.address} (${Utils.moneyFormat(this.shipping_cost)})`;
  }
}

export default DeliveryAddressModel;
