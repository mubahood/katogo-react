// src/app/models/CartItemModel.ts
import { ProductModel } from './ProductModel';
import Utils from '../services/Utils';

export interface CartVariant {
  color?: string;
  size?: string;
  [key: string]: string | undefined;
}

export interface CartItem {
  id: string; // Unique identifier for cart item (product_id + variant hash)
  product_id: number;
  product_name: string;
  product_price_1: string;
  product_quantity: number;
  product_feature_photo: string;
  color: string;
  size: string;
  variant: CartVariant;
  added_at: string;
  updated_at: string;
}

export interface DetailedCartItem extends CartItem {
  product: ProductModel;
  subtotal: number;
  isAvailable: boolean;
}

export interface CartSummary {
  items: DetailedCartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  totalAmount: number;
  deliveryFee: number;
  isEmpty: boolean;
}

export class CartItemModel implements CartItem {
  id: string;
  product_id: number;
  product_name: string;
  product_price_1: string;
  product_quantity: number;
  product_feature_photo: string;
  color: string;
  size: string;
  variant: CartVariant;
  added_at: string;
  updated_at: string;

  constructor(data: Partial<CartItem> = {}) {
    this.product_id = data.product_id || 0;
    this.product_name = data.product_name || '';
    this.product_price_1 = data.product_price_1 || '0';
    this.product_quantity = data.product_quantity || 1;
    this.product_feature_photo = data.product_feature_photo || '';
    this.color = data.color || '';
    this.size = data.size || '';
    this.variant = data.variant || {};
    this.added_at = data.added_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    
    // Generate unique ID based on product_id and variant
    this.id = this.generateId();
  }

  private generateId(): string {
    const variantString = JSON.stringify({
      color: this.color,
      size: this.size,
      ...this.variant
    });
    return `${this.product_id}_${btoa(variantString).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  static fromProduct(
    product: ProductModel, 
    quantity: number = 1, 
    variant: CartVariant = {}
  ): CartItemModel {
    return new CartItemModel({
      product_id: product.id,
      product_name: product.name,
      product_price_1: product.price_1,
      product_quantity: quantity,
      product_feature_photo: product.feature_photo || '',
      color: variant.color || '',
      size: variant.size || '',
      variant
    });
  }

  static fromJson(data: any): CartItemModel {
    return new CartItemModel({
      id: data.id,
      product_id: parseInt(data.product_id?.toString() || '0'),
      product_name: data.product_name || '',
      product_price_1: data.product_price_1?.toString() || '0',
      product_quantity: parseInt(data.product_quantity?.toString() || '1'),
      product_feature_photo: data.product_feature_photo || '',
      color: data.color || '',
      size: data.size || '',
      variant: data.variant || {},
      added_at: data.added_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    });
  }

  toJson(): Record<string, any> {
    return {
      id: this.id,
      product_id: this.product_id,
      product_name: this.product_name,
      product_price_1: this.product_price_1,
      product_quantity: this.product_quantity,
      product_feature_photo: this.product_feature_photo,
      color: this.color,
      size: this.size,
      variant: this.variant,
      added_at: this.added_at,
      updated_at: this.updated_at
    };
  }

  updateQuantity(newQuantity: number): void {
    this.product_quantity = Math.max(0, newQuantity);
    this.updated_at = new Date().toISOString();
  }

  getSubtotal(): number {
    return parseFloat(this.product_price_1) * this.product_quantity;
  }

  hasVariant(): boolean {
    return this.color !== '' || this.size !== '' || Object.keys(this.variant).length > 0;
  }

  getVariantDisplay(): string {
    const parts: string[] = [];
    if (this.color) parts.push(`Color: ${this.color}`);
    if (this.size) parts.push(`Size: ${this.size}`);
    
    Object.entries(this.variant).forEach(([key, value]) => {
      if (value && key !== 'color' && key !== 'size') {
        parts.push(`${key}: ${value}`);
      }
    });
    
    return parts.join(', ');
  }

  /**
   * Helper: Returns the properly formatted image URL for the cart item
   */
  getImageUrl(): string {
    return this.product_feature_photo ? Utils.img(this.product_feature_photo) : '/media/svg/files/blank-image.svg';
  }
}

export default CartItemModel;
