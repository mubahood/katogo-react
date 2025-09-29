// src/app/hooks/useCart.ts
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  setLoading,
  syncFromStorage,
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  selectCartIsLoading,
  selectCartIsEmpty,
  selectIsInCart,
  selectItemQuantity
} from '../store/slices/cartSlice';
import { CartItemModel, CartVariant } from '../models/CartItemModel';
import { ProductModel } from '../models/ProductModel';
import ToastService from '../services/ToastService';

export const useCart = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const cartTotal = useSelector(selectCartTotal);
  const isLoading = useSelector(selectCartIsLoading);
  const isEmpty = useSelector(selectCartIsEmpty);

  // Sync cart from localStorage on mount
  useEffect(() => {
    dispatch(syncFromStorage());
  }, [dispatch]);

  // Add item to cart
  const addToCart = useCallback(async (
    product: ProductModel,
    quantity: number = 1,
    variant: CartVariant = {}
  ): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      // Validate inputs
      if (!product || !product.id || quantity <= 0) {
        ToastService.error('Invalid product or quantity');
        return false;
      }

      // Check if product has required variants
      const colors = product.getColors?.() || [];
      const sizes = product.getSizes?.() || [];
      
      if (colors.length > 0 && !variant.color) {
        ToastService.error('Please select a color');
        return false;
      }
      
      if (sizes.length > 0 && !variant.size) {
        ToastService.error('Please select a size');
        return false;
      }

      // Add to cart
      dispatch(addToCartAction({ product, quantity, variant }));
      
      // Show success message
      const variantText = variant.color || variant.size ? 
        ` (${Object.entries(variant).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')})` : '';
      
      ToastService.success(`${product.name}${variantText} added to cart`);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      ToastService.error('Failed to add item to cart');
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Remove item from cart
  const removeFromCart = useCallback(async (
    productId: number,
    variant: CartVariant = {}
  ): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      dispatch(removeFromCartAction({ productId, variant }));
      ToastService.success('Item removed from cart');
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      ToastService.error('Failed to remove item from cart');
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Update item quantity
  const updateQuantity = useCallback(async (
    productId: number,
    quantity: number,
    variant: CartVariant = {}
  ): Promise<boolean> => {
    try {
      if (quantity < 0) {
        ToastService.error('Invalid quantity');
        return false;
      }

      dispatch(updateQuantityAction({ productId, quantity, variant }));
      
      if (quantity === 0) {
        ToastService.success('Item removed from cart');
      } else {
        ToastService.success('Cart updated');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating cart:', error);
      ToastService.error('Failed to update cart');
      return false;
    }
  }, [dispatch]);

  // Clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      dispatch(clearCartAction());
      ToastService.success('Cart cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      ToastService.error('Failed to clear cart');
      return false;
    }
  }, [dispatch]);

  // Check if item is in cart
  const isInCart = useCallback((productId: number, variant: CartVariant = {}): boolean => {
    try {
      const tempItem = new CartItemModel({
        product_id: productId,
        color: variant.color || '',
        size: variant.size || '',
        variant
      });
      return cartItems.some((item: CartItemModel) => item.id === tempItem.id);
    } catch (error) {
      console.error('Error checking if item is in cart:', error);
      return false;
    }
  }, [cartItems]);

  // Get item quantity
  const getItemQuantity = useCallback((productId: number, variant: CartVariant = {}): number => {
    try {
      const tempItem = new CartItemModel({
        product_id: productId,
        color: variant.color || '',
        size: variant.size || '',
        variant
      });
      const item = cartItems.find((item: CartItemModel) => item.id === tempItem.id);
      return item ? item.product_quantity : 0;
    } catch (error) {
      console.error('Error getting item quantity:', error);
      return 0;
    }
  }, [cartItems]);

  // Get formatted cart total
  const getFormattedTotal = useCallback((): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(cartTotal);
  }, [cartTotal]);

  // Get cart summary
  const getCartSummary = useCallback(() => {
    const subtotal = cartTotal;
    const deliveryFee = 0; // Calculate based on your logic
    const totalAmount = subtotal + deliveryFee;

    return {
      items: cartItems,
      totalItems: cartItems.length,
      totalQuantity: cartCount,
      subtotal,
      totalAmount,
      deliveryFee,
      isEmpty
    };
  }, [cartItems, cartCount, cartTotal, isEmpty]);

  // Check if cart has items with variants
  const hasVariantItems = useCallback((): boolean => {
    return cartItems.some((item: CartItemModel) => item.hasVariant());
  }, [cartItems]);

  // Get items by product (useful for grouping variants)
  const getItemsByProduct = useCallback((productId: number): CartItemModel[] => {
    return cartItems.filter((item: CartItemModel) => item.product_id === productId);
  }, [cartItems]);

  return {
    // State
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    isEmpty,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Utilities
    isInCart,
    getItemQuantity,
    getFormattedTotal,
    getCartSummary,
    hasVariantItems,
    getItemsByProduct,
  };
};

export default useCart;
