// src/app/services/AccountApiService.ts

import { http_get, http_post } from "./Api";
import ToastService from "./ToastService";

// ===== TYPE DEFINITIONS =====

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  bio?: string;
  date_of_birth?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  product_price?: number;
  added_at: string;
  product?: {
    id: number;
    name: string;
    image?: string;
    price: number;
    in_stock: boolean;
  };
}

export interface WatchHistoryItem {
  id: number;
  user_id: number;
  product_id: number;
  watch_duration: number;
  total_duration: number;
  progress_percentage: number;
  last_watched_at: string;
  product: {
    id: number;
    name: string;
    thumbnail?: string;
    duration?: number;
  };
}

export interface LikedContent {
  id: number;
  user_id: number;
  product_id: number;
  liked_at: string;
  product: {
    id: number;
    name: string;
    image?: string;
    price?: number;
    rating?: number;
  };
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_name: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
}

export interface UserProduct {
  id: number;
  user_id: number;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'inactive' | 'sold';
  image?: string;
  category_id: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: number;
  participants: Array<{
    id: number;
    name: string;
    avatar?: string;
  }>;
  last_message: {
    id: number;
    content: string;
    sent_at: string;
    sender_id: number;
  };
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  sent_at: string;
  read_at?: string;
}

export interface DashboardStats {
  total_watch_time: number;
  movies_watched: number;
  total_orders: number;
  active_subscriptions: number;
  watchlist_items: number;
  liked_content: number;
  chat_messages: number;
  my_products: number;
}

export interface RecentActivity {
  id: string;
  type: 'watch' | 'order' | 'like' | 'chat' | 'product' | 'subscription';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ===== ACCOUNT API SERVICE =====

export class AccountApiService {
  
  // ===== DASHBOARD =====
  
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await http_get("account/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      ToastService.error("Failed to load dashboard statistics");
      throw error;
    }
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await http_get(`account/dashboard/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      ToastService.error("Failed to load recent activity");
      throw error;
    }
  }

  // ===== PROFILE =====
  
  /**
   * Get user profile
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await http_get("account/profile");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      ToastService.error("Failed to load profile");
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await http_post("account/profile", { ...profileData, _method: 'PUT' });
      ToastService.success("Profile updated successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to update profile:", error);
      ToastService.error("Failed to update profile");
      throw error;
    }
  }

  /**
   * Upload profile avatar
   */
  static async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await http_post("account/profile/avatar", formData);
      ToastService.success("Avatar uploaded successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      ToastService.error("Failed to upload avatar");
      throw error;
    }
  }

  // ===== WATCHLIST =====
  
  /**
   * Get user's watchlist
   */
  static async getWatchlist(page: number = 1): Promise<{ data: WatchlistItem[]; total: number; currentPage: number }> {
    try {
      const response = await http_get(`account/watchlist?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
      ToastService.error("Failed to load watchlist");
      throw error;
    }
  }

  /**
   * Add item to watchlist
   */
  static async addToWatchlist(productId: number): Promise<WatchlistItem> {
    try {
      const response = await http_post("account/watchlist", { product_id: productId });
      ToastService.success("Added to watchlist");
      return response.data;
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      ToastService.error("Failed to add to watchlist");
      throw error;
    }
  }

  /**
   * Remove item from watchlist
   */
  static async removeFromWatchlist(itemId: number): Promise<void> {
    try {
      await http_post(`account/watchlist/${itemId}`, { _method: 'DELETE' });
      ToastService.success("Removed from watchlist");
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      ToastService.error("Failed to remove from watchlist");
      throw error;
    }
  }

  // ===== WATCH HISTORY =====
  
  /**
   * Get user's watch history
   */
  static async getWatchHistory(page: number = 1): Promise<{ data: WatchHistoryItem[]; total: number; currentPage: number }> {
    try {
      const response = await http_get(`account/watch-history?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch watch history:", error);
      ToastService.error("Failed to load watch history");
      throw error;
    }
  }

  /**
   * Clear watch history
   */
  static async clearWatchHistory(): Promise<void> {
    try {
      await http_post("account/watch-history", { _method: 'DELETE' });
      ToastService.success("Watch history cleared");
    } catch (error) {
      console.error("Failed to clear watch history:", error);
      ToastService.error("Failed to clear watch history");
      throw error;
    }
  }

  // ===== LIKES =====
  
  /**
   * Get user's liked content
   */
  static async getLikedContent(page: number = 1): Promise<{ data: LikedContent[]; total: number; currentPage: number }> {
    try {
      const response = await http_get(`account/likes?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch liked content:", error);
      ToastService.error("Failed to load liked content");
      throw error;
    }
  }

  /**
   * Like content
   */
  static async likeContent(productId: number): Promise<LikedContent> {
    try {
      const response = await http_post("account/likes", { product_id: productId });
      ToastService.success("Content liked");
      return response.data;
    } catch (error) {
      console.error("Failed to like content:", error);
      ToastService.error("Failed to like content");
      throw error;
    }
  }

  /**
   * Unlike content
   */
  static async unlikeContent(likeId: number): Promise<void> {
    try {
      await http_post(`account/likes/${likeId}`, { _method: 'DELETE' });
      ToastService.success("Content unliked");
    } catch (error) {
      console.error("Failed to unlike content:", error);
      ToastService.error("Failed to unlike content");
      throw error;
    }
  }

  // ===== SUBSCRIPTIONS =====
  
  /**
   * Get user's subscriptions
   */
  static async getSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await http_get("account/subscriptions");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      ToastService.error("Failed to load subscriptions");
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: number): Promise<void> {
    try {
      await http_post(`account/subscriptions/${subscriptionId}/cancel`);
      ToastService.success("Subscription cancelled");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      ToastService.error("Failed to cancel subscription");
      throw error;
    }
  }

  // ===== USER PRODUCTS =====
  
  /**
   * Get user's products (items they're selling)
   */
  static async getUserProducts(page: number = 1): Promise<{ data: UserProduct[]; total: number; currentPage: number }> {
    try {
      const response = await http_get(`account/products?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user products:", error);
      ToastService.error("Failed to load your products");
      throw error;
    }
  }

  /**
   * Create new product
   */
  static async createProduct(productData: Partial<UserProduct>): Promise<UserProduct> {
    try {
      const response = await http_post("account/products", productData);
      ToastService.success("Product created successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to create product:", error);
      ToastService.error("Failed to create product");
      throw error;
    }
  }

  /**
   * Update product
   */
  static async updateProduct(productId: number, productData: Partial<UserProduct>): Promise<UserProduct> {
    try {
      const response = await http_post(`account/products/${productId}`, { ...productData, _method: 'PUT' });
      ToastService.success("Product updated successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to update product:", error);
      ToastService.error("Failed to update product");
      throw error;
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(productId: number): Promise<void> {
    try {
      await http_post(`account/products/${productId}`, { _method: 'DELETE' });
      ToastService.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      ToastService.error("Failed to delete product");
      throw error;
    }
  }

  // ===== CHATS =====
  
  /**
   * Get user's conversations
   */
  static async getConversations(): Promise<ChatConversation[]> {
    try {
      const response = await http_get("account/chats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      ToastService.error("Failed to load conversations");
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: number, page: number = 1): Promise<{ data: ChatMessage[]; total: number; currentPage: number }> {
    try {
      const response = await http_get(`account/chats/${conversationId}/messages?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      ToastService.error("Failed to load messages");
      throw error;
    }
  }

  /**
   * Send message
   */
  static async sendMessage(conversationId: number, content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<ChatMessage> {
    try {
      const response = await http_post(`account/chats/${conversationId}/messages`, {
        content,
        message_type: messageType
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      ToastService.error("Failed to send message");
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(conversationId: number): Promise<void> {
    try {
      await http_post(`account/chats/${conversationId}/mark-read`);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      // Don't show toast for this, it's a background operation
    }
  }

  /**
   * Start new conversation
   */
  static async startConversation(participantId: number, initialMessage?: string): Promise<ChatConversation> {
    try {
      const response = await http_post("account/chats", {
        participant_id: participantId,
        initial_message: initialMessage
      });
      return response.data;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      ToastService.error("Failed to start conversation");
      throw error;
    }
  }
}

export default AccountApiService;