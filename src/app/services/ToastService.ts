// src/app/services/ToastService.ts
import { toast, ToastOptions } from 'react-toastify';

/**
 * ToastService - Centralized toast notification service
 * Provides contextual notifications with proper colors and styling
 */

const defaultOptions: ToastOptions = {
  position: "top-center", // Changed from "top-right" to "top-center"
  autoClose: 2000, // Reduced from 5000ms to 2000ms (2 seconds)
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export class ToastService {
  // Success notifications (Green)
  static success(message: string, options?: ToastOptions) {
    toast.success(message, {
      ...defaultOptions,
      ...options,
    });
  }

  // Error notifications (Red)
  static error(message: string, options?: ToastOptions) {
    toast.error(message, {
      ...defaultOptions,
      ...options,
    });
  }

  // Warning notifications (Orange/Yellow)
  static warning(message: string, options?: ToastOptions) {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
    });
  }

  // Info notifications (Blue)
  static info(message: string, options?: ToastOptions) {
    toast.info(message, {
      ...defaultOptions,
      ...options,
    });
  }

  // Default/neutral notifications
  static default(message: string, options?: ToastOptions) {
    toast(message, {
      ...defaultOptions,
      ...options,
    });
  }

  // Auth specific notifications
  static loginSuccess(userName?: string) {
    this.success(
      userName ? `Welcome back, ${userName}!` : "Logged in successfully!",
      { autoClose: 2000 } // Reduced from 3000ms to 2000ms
    );
  }

  static loginError(message: string = "Login failed. Please check your credentials.") {
    this.error(message, { autoClose: 4000 }); // Reduced from 6000ms to 4000ms
  }

  static registerSuccess(userName?: string) {
    this.success(
      userName ? `Welcome to BlitXpress, ${userName}!` : "Account created successfully!",
      { autoClose: 3000 } // Reduced from 4000ms to 3000ms
    );
  }

  static registerError(message: string = "Registration failed. Please try again.") {
    this.error(message, { autoClose: 4000 }); // Reduced from 6000ms to 4000ms
  }

  static logoutSuccess() {
    this.info("You have been logged out successfully.", { autoClose: 2000 }); // Reduced from 3000ms to 2000ms
  }

  // E-commerce specific notifications
  static addToCart(productName?: string) {
    this.success(
      productName ? `${productName} added to cart!` : "Product added to cart!",
      { autoClose: 1500 } // Reduced from 3000ms to 1500ms
    );
  }

  static removeFromCart(productName?: string) {
    this.warning(
      productName ? `${productName} removed from cart` : "Product removed from cart",
      { autoClose: 1500 } // Reduced from 3000ms to 1500ms
    );
  }

  static addToWishlist(productName?: string) {
    this.info(
      productName ? `${productName} added to wishlist!` : "Product added to wishlist!",
      { autoClose: 3000 }
    );
  }

  static removeFromWishlist(productName?: string) {
    this.warning(
      productName ? `${productName} removed from wishlist` : "Product removed from wishlist",
      { autoClose: 3000 }
    );
  }

  // Order notifications
  static orderSuccess(orderNumber?: string) {
    this.success(
      orderNumber ? `Order ${orderNumber} placed successfully!` : "Order placed successfully!",
      { autoClose: 5000 }
    );
  }

  static orderError(message: string = "Failed to place order. Please try again.") {
    this.error(message, { autoClose: 6000 });
  }

  static paymentSuccess() {
    this.success("Payment processed successfully!", { autoClose: 4000 });
  }

  static paymentError(message: string = "Payment failed. Please try again.") {
    this.error(message, { autoClose: 6000 });
  }

  // Profile/Account notifications
  static profileUpdated() {
    this.success("Profile updated successfully!", { autoClose: 3000 });
  }

  static profileError(message: string = "Failed to update profile.") {
    this.error(message, { autoClose: 5000 });
  }

  static passwordChanged() {
    this.success("Password changed successfully!", { autoClose: 4000 });
  }

  static passwordError(message: string = "Failed to change password.") {
    this.error(message, { autoClose: 5000 });
  }

  // Network/API notifications
  static networkError() {
    this.error("Network error. Please check your connection and try again.", {
      autoClose: 6000
    });
  }

  static serverError() {
    this.error("Server error. Please try again later.", { autoClose: 5000 });
  }

  static apiError(message: string) {
    this.error(message, { autoClose: 5000 });
  }

  // General action notifications
  static actionSuccess(action: string) {
    this.success(`${action} completed successfully!`, { autoClose: 3000 });
  }

  static actionError(action: string) {
    this.error(`Failed to ${action.toLowerCase()}. Please try again.`, { autoClose: 5000 });
  }

  // Copy/Share notifications
  static copied(item: string = "Link") {
    this.info(`${item} copied to clipboard!`, { autoClose: 2000 });
  }

  static shared(item: string = "Item") {
    this.success(`${item} shared successfully!`, { autoClose: 3000 });
  }

  // Validation notifications
  static validationError(message: string) {
    this.warning(message, { autoClose: 4000 });
  }

  // Loading state notifications (for long operations)
  static loading(message: string = "Loading...", id?: string) {
    return toast.loading(message, {
      toastId: id,
      position: "top-center", // Changed to match default position
    });
  }

  static updateLoading(toastId: any, type: 'success' | 'error' | 'info' | 'warning', message: string) {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  // Dismiss notifications
  static dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  static dismissAll() {
    toast.dismiss();
  }
}

export default ToastService;
