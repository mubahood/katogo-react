// src/app/store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItemModel, CartVariant, CartSummary } from '../../models/CartItemModel';
import { ProductModel } from '../../models/ProductModel';

const CART_STORAGE_KEY = 'shop_cart_items';

interface CartState {
  items: CartItemModel[];
  totalQuantity: number;
  totalAmount: number;
  isLoading: boolean;
  lastUpdated: string;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartItemModel[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.map((item: any) => CartItemModel.fromJson(item));
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItemModel[]): void => {
  try {
    const data = items.map(item => item.toJson());
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Calculate totals
const calculateTotals = (items: any[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.product_quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.product_price_1) * item.product_quantity), 0);
  return { totalQuantity, totalAmount };
};

// Save to localStorage safely
const saveToStorage = (items: any[]) => {
  try {
    const plainItems = items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price_1: item.product_price_1,
      product_quantity: item.product_quantity,
      product_feature_photo: item.product_feature_photo,
      color: item.color,
      size: item.size,
      variant: item.variant,
      added_at: item.added_at,
      updated_at: item.updated_at
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(plainItems));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Initial state with data from localStorage
const initialItems = loadCartFromStorage();
const { totalQuantity, totalAmount } = calculateTotals(initialItems);

const initialState: CartState = {
  items: initialItems,
  totalQuantity,
  totalAmount,
  isLoading: false,
  lastUpdated: new Date().toISOString(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action: PayloadAction<{
      product: ProductModel;
      quantity?: number;
      variant?: CartVariant;
    }>) => {
      const { product, quantity = 1, variant = {} } = action.payload;
      
      // Create a temporary cart item to generate the ID
      const tempItem = CartItemModel.fromProduct(product, quantity, variant);
      
      // Check if item with same product_id and variant already exists
      const existingItemIndex = state.items.findIndex(item => item.id === tempItem.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        state.items[existingItemIndex].product_quantity += quantity;
        state.items[existingItemIndex].updated_at = new Date().toISOString();
      } else {
        // Add new item
        state.items.push(tempItem);
      }
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      state.lastUpdated = new Date().toISOString();
      
      // Save to localStorage
      saveToStorage(state.items);
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<{
      productId: number;
      variant?: CartVariant;
    }>) => {
      const { productId, variant = {} } = action.payload;
      
      // Generate the same ID to find the item
      const tempItem = new CartItemModel({
        product_id: productId,
        color: variant.color || '',
        size: variant.size || '',
        variant
      });
      
      state.items = state.items.filter(item => item.id !== tempItem.id);
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      state.lastUpdated = new Date().toISOString();
      
      // Save to localStorage
      saveToStorage(state.items);
    },

    // Update item quantity
    updateQuantity: (state, action: PayloadAction<{
      productId: number;
      quantity: number;
      variant?: CartVariant;
    }>) => {
      const { productId, quantity, variant = {} } = action.payload;
      
      // Generate the same ID to find the item
      const tempItem = new CartItemModel({
        product_id: productId,
        color: variant.color || '',
        size: variant.size || '',
        variant
      });
      
      const itemIndex = state.items.findIndex(item => item.id === tempItem.id);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          state.items[itemIndex].product_quantity = quantity;
          state.items[itemIndex].updated_at = new Date().toISOString();
        }
        
        // Recalculate totals
        const totals = calculateTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalAmount = totals.totalAmount;
        state.lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        saveToStorage(state.items);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.lastUpdated = new Date().toISOString();
      
      // Clear localStorage
      localStorage.removeItem(CART_STORAGE_KEY);
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Sync cart from localStorage (useful after app restart)
    syncFromStorage: (state) => {
      const items = loadCartFromStorage();
      state.items = items;
      
      const totals = calculateTotals(items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      state.lastUpdated = new Date().toISOString();
    },

    // Bulk update cart items (useful for checkout operations)
    updateCartItems: (state, action: PayloadAction<CartItemModel[]>) => {
      state.items = action.payload;
      
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      state.lastUpdated = new Date().toISOString();
      
      // Save to localStorage
      saveToStorage(state.items);
    }
  },
});

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) => state.cart.totalQuantity;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.totalAmount;
export const selectCartIsLoading = (state: { cart: CartState }) => state.cart.isLoading;
export const selectCartIsEmpty = (state: { cart: CartState }) => state.cart.items.length === 0;

// Check if specific item is in cart
export const selectIsInCart = (productId: number, variant: CartVariant = {}) => 
  (state: { cart: CartState }) => {
    const tempItem = new CartItemModel({
      product_id: productId,
      color: variant.color || '',
      size: variant.size || '',
      variant
    });
    return state.cart.items.some(item => item.id === tempItem.id);
  };

// Get quantity of specific item in cart
export const selectItemQuantity = (productId: number, variant: CartVariant = {}) => 
  (state: { cart: CartState }) => {
    const tempItem = new CartItemModel({
      product_id: productId,
      color: variant.color || '',
      size: variant.size || '',
      variant
    });
    const item = state.cart.items.find(item => item.id === tempItem.id);
    return item ? item.product_quantity : 0;
  };

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setLoading,
  syncFromStorage,
  updateCartItems
} = cartSlice.actions;

export default cartSlice.reducer;