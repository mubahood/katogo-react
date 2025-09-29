// src/app/services/CartService.ts

import ProductModel from "../models/ProductModel";
import Utils from "./Utils";
import ToastService from "./ToastService";
import { CART_ITEMS } from "../../Constants";

export interface CartItem {
  product_id: number;
  quantity: number;
  variant: Record<string, string>;
  added_at: string;
  price?: string; // Store price at time of adding
  product_name?: string; // Store name for quick reference
}

export interface DetailedCartItem {
  product: ProductModel;
  quantity: number;
  variant: Record<string, string>;
  added_at: string;
  subtotal: number;
}

// Event listeners for cart updates
type CartUpdateListener = (items: CartItem[]) => void;
const cartListeners: CartUpdateListener[] = [];

/**
 * Enhanced service for managing shopping cart with better state management
 */
export class CartService {
  
  /**
   * Subscribe to cart updates
   */
  static onCartUpdate(callback: CartUpdateListener): () => void {
    cartListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = cartListeners.indexOf(callback);
      if (index > -1) {
        cartListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of cart updates
   */
  private static notifyListeners(): void {
    const items = this.getCartItems();
    cartListeners.forEach(callback => {
      try {
        callback(items);
      } catch (error) {
        console.error("Error in cart listener:", error);
      }
    });
    
    // Also dispatch custom event for components using addEventListener
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { items, count: items.length } 
    }));
  }

  /**
   * Get all cart items from localStorage
   */
  static getCartItems(): CartItem[] {
    try {
      const items = localStorage.getItem(CART_ITEMS);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error("Error loading cart items:", error);
      return [];
    }
  }

  /**
   * Save cart items to localStorage and notify listeners
   */
  static saveCartItems(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_ITEMS, JSON.stringify(items));
      this.notifyListeners();
    } catch (error) {
      console.error("Error saving cart items:", error);
      ToastService.error("Failed to save cart");
    }
  }

  /**
   * Add item to cart or update quantity if exists
   */
  static addToCart(
    productId: number,
    quantity = 1,
    variant: Record<string, string> = {},
    productData?: { name: string; price: string }
  ): boolean {
    try {
      const cartItems = this.getCartItems();
      const variantKey = JSON.stringify(variant);
      
      const existingItemIndex = cartItems.findIndex(
        item => 
          item.product_id === productId && 
          JSON.stringify(item.variant) === variantKey
      );

      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
        ToastService.success(`Updated ${productData?.name || 'product'} quantity in cart`);
      } else {
        const newItem: CartItem = {
          product_id: productId,
          quantity,
          variant,
          added_at: new Date().toISOString(),
          price: productData?.price,
          product_name: productData?.name,
        };
        cartItems.push(newItem);
        ToastService.addToCart(productData?.name || 'Product');
      }

      this.saveCartItems(cartItems);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      ToastService.error("Failed to add to cart");
      return false;
    }
  }

  /**
   * Update cart item quantity
   */
  static updateCartItem(
    productId: number,
    quantity: number,
    variant: Record<string, string> = {}
  ): boolean {
    try {
      const cartItems = this.getCartItems();
      const variantKey = JSON.stringify(variant);
      
      const itemIndex = cartItems.findIndex(
        item => 
          item.product_id === productId && 
          JSON.stringify(item.variant) === variantKey
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cartItems.splice(itemIndex, 1);
          ToastService.removeFromCart(cartItems[itemIndex].product_name || 'Product');
        } else {
          cartItems[itemIndex].quantity = quantity;
        }
        this.saveCartItems(cartItems);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating cart item:", error);
      ToastService.error("Failed to update cart");
      return false;
    }
  }

  /**
   * Remove item from cart completely
   */
  static removeFromCart(
    productId: number,
    variant: Record<string, string> = {}
  ): boolean {
    try {
      const cartItems = this.getCartItems();
      const variantKey = JSON.stringify(variant);
      
      const itemIndex = cartItems.findIndex(
        item => 
          item.product_id === productId && 
          JSON.stringify(item.variant) === variantKey
      );

      if (itemIndex >= 0) {
        const removedItem = cartItems[itemIndex];
        cartItems.splice(itemIndex, 1);
        this.saveCartItems(cartItems);
        ToastService.removeFromCart(removedItem.product_name || 'Product');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from cart:", error);
      ToastService.error("Failed to remove from cart");
      return false;
    }
  }

  /**
   * Clear entire cart
   */
  static clearCart(): boolean {
    try {
      localStorage.removeItem(CART_ITEMS);
      ToastService.success("Cart cleared");
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      ToastService.error("Failed to clear cart");
      return false;
    }
  }

  /**
   * Get cart items with full product details
   */
  static async getDetailedCartItems(): Promise<DetailedCartItem[]> {
    const cartItems = this.getCartItems();
    const detailedItems: DetailedCartItem[] = [];

    for (const item of cartItems) {
      try {
        const product = await ProductModel.fetchProductById(item.product_id);
        const subtotal = parseFloat(product.price_1) * item.quantity;
        
        detailedItems.push({
          product,
          quantity: item.quantity,
          variant: item.variant,
          added_at: item.added_at,
          subtotal,
        });
      } catch (error) {
        console.warn(`Product ${item.product_id} not found, removing from cart`);
        this.removeFromCart(item.product_id, item.variant);
      }
    }

    return detailedItems;
  }

  /**
   * Get cart total amount
   */
  static async getCartTotal(): Promise<number> {
    const detailedItems = await this.getDetailedCartItems();
    return detailedItems.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Get formatted cart total
   */
  static async getFormattedCartTotal(): Promise<string> {
    const total = await this.getCartTotal();
    return Utils.moneyFormat(String(total));
  }

  /**
   * Get cart item count
   */
  static getCartItemCount(): number {
    const cartItems = this.getCartItems();
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Check if product is in cart
   */
  static isInCart(
    productId: number,
    variant: Record<string, string> = {}
  ): boolean {
    const cartItems = this.getCartItems();
    const variantKey = JSON.stringify(variant);
    
    return cartItems.some(
      item => 
        item.product_id === productId && 
        JSON.stringify(item.variant) === variantKey
    );
  }

  /**
   * Get quantity of specific product in cart
   */
  static getProductQuantity(
    productId: number,
    variant: Record<string, string> = {}
  ): number {
    const cartItems = this.getCartItems();
    const variantKey = JSON.stringify(variant);
    
    const item = cartItems.find(
      item => 
        item.product_id === productId && 
        JSON.stringify(item.variant) === variantKey
    );
    
    return item ? item.quantity : 0;
  }

  /**
   * Sync cart with user account (for when user logs in)
   */
  static async syncWithServer(): Promise<boolean> {
    try {
      // This would sync with backend when user is logged in
      // For now, we'll just keep local storage
      // TODO: Implement server sync when user authentication is complete
      return true;
    } catch (error) {
      console.error("Error syncing cart with server:", error);
      return false;
    }
  }

  /**
   * Merge guest cart with user cart (after login)
   */
  static async mergeGuestCart(serverCartItems: CartItem[]): Promise<boolean> {
    try {
      const localItems = this.getCartItems();
      const mergedItems: CartItem[] = [...serverCartItems];

      // Merge local items with server items
      for (const localItem of localItems) {
        const variantKey = JSON.stringify(localItem.variant);
        const existingIndex = mergedItems.findIndex(
          item => 
            item.product_id === localItem.product_id &&
            JSON.stringify(item.variant) === variantKey
        );

        if (existingIndex >= 0) {
          // Add quantities together
          mergedItems[existingIndex].quantity += localItem.quantity;
        } else {
          // Add new item
          mergedItems.push(localItem);
        }
      }

      this.saveCartItems(mergedItems);
      ToastService.success("Cart synced successfully");
      return true;
    } catch (error) {
      console.error("Error merging guest cart:", error);
      ToastService.error("Failed to sync cart");
      return false;
    }
  }

  /**
   * Validate cart items (check if products still exist and are available)
   */
  static async validateCart(): Promise<boolean> {
    try {
      const cartItems = this.getCartItems();
      const validItems: CartItem[] = [];
      let hasInvalidItems = false;

      for (const item of cartItems) {
        try {
          const product = await ProductModel.fetchProductById(item.product_id);
          if (product.isActive() && product.isInStock()) {
            validItems.push(item);
          } else {
            hasInvalidItems = true;
            console.warn(`Product ${item.product_id} is no longer available`);
          }
        } catch (error) {
          hasInvalidItems = true;
          console.warn(`Product ${item.product_id} not found`);
        }
      }

      if (hasInvalidItems) {
        this.saveCartItems(validItems);
        ToastService.warning("Some items were removed from cart as they're no longer available");
      }

      return true;
    } catch (error) {
      console.error("Error validating cart:", error);
      return false;
    }
  }
}

export default CartService;
