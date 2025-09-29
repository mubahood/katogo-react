// src/app/utils/OrderModelUtils.ts
import { OrderModel } from '../models/OrderModel';

/**
 * Utility functions to safely handle OrderModel operations
 */
export class OrderModelUtils {
  /**
   * Safely creates an OrderModel instance from any object
   * Ensures all methods are available even if the source object is a plain object
   */
  static ensureOrderModel(source: any): OrderModel {
    if (!source) {
      return new OrderModel();
    }

    // If it's already an OrderModel instance with methods, return as is
    if (source instanceof OrderModel && typeof source.getTax === 'function') {
      return source;
    }

    // Create a new OrderModel instance and copy properties
    const order = new OrderModel();
    
    if (typeof source === 'object') {
      Object.keys(source).forEach(key => {
        if (source.hasOwnProperty(key) && key !== 'constructor') {
          try {
            (order as any)[key] = source[key];
          } catch (error) {
          }
        }
      });
    }

    return order;
  }

  /**
   * Safely calculates tax for an amount
   */
  static calculateTax(order: any, amount: string | number): number {
    try {
      if (order && typeof order.getTax === 'function') {
        return parseFloat(order.getTax(amount.toString()) || '0') || 0;
      }
    } catch (error) {
    }
    
    // Fallback: 13% tax
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return (numAmount || 0) * 0.13;
  }

  /**
   * Safely converts order to JSON
   */
  static toJson(order: any): Record<string, any> {
    try {
      if (order && typeof order.toJson === 'function') {
        return order.toJson();
      }
    } catch (error) {
    }

    // Fallback: manual object creation
    return {
      id: order?.id || 0,
      customer_name: order?.customer_name || '',
      customer_phone_number_1: order?.customer_phone_number_1 || '',
      customer_phone_number_2: order?.customer_phone_number_2 || '',
      customer_address: order?.customer_address || '',
      mail: order?.mail || '',
      delivery_method: order?.delivery_method || '',
      delivery_address_id: order?.delivery_address_id || '',
      delivery_address_text: order?.delivery_address_text || '',
      delivery_address_details: order?.delivery_address_details || '',
      delivery_amount: order?.delivery_amount || '0',
      payable_amount: order?.payable_amount || '0',
      order_total: order?.order_total || '0',
      order_state: order?.order_state || '0',
      amount: order?.amount || '',
      payment_confirmation: order?.payment_confirmation || '',
      delivery_district: order?.delivery_district || '',
      created_at: order?.created_at || '',
      updated_at: order?.updated_at || '',
      user: order?.user || '',
      date_created: order?.date_created || '',
      date_updated: order?.date_updated || '',
      temporary_id: order?.temporary_id || '',
      temporary_text: order?.temporary_text || '',
      description: order?.description || '',
      order_details: order?.order_details || '',
      stripe_id: order?.stripe_id || '',
      stripe_text: order?.stripe_text || '',
      stripe_url: order?.stripe_url || '',
      stripe_paid: order?.stripe_paid || '',
      items: order?.items || '',
    };
  }

  /**
   * Safely gets payment link
   */
  static getPaymentLink(order: any): string {
    try {
      if (order && typeof order.getPaymentLink === 'function') {
        return order.getPaymentLink() || '';
      }
    } catch (error) {
    }

    // Fallback: direct stripe_url access
    return order?.stripe_url || '';
  }
}
