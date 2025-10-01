// src/app/services/ChatApiService.ts

import { http_get, http_post } from "./Api";
import ToastService from "./ToastService";

// ===== TYPE DEFINITIONS =====

export interface ChatHead {
  id: number;
  created_at: string;
  updated_at: string;
  product_id?: string;
  product_text?: string;
  product_name?: string;
  product_photo?: string;
  product_owner_id: string;
  product_owner_text?: string;
  product_owner_name?: string;
  product_owner_photo?: string;
  product_owner_last_seen?: string;
  customer_id: string;
  customer_text?: string;
  customer_name?: string;
  customer_photo?: string;
  customer_last_seen?: string;
  last_message_body?: string;
  last_message_time?: string;
  last_message_status?: string;
  customer_unread_messages_count?: string;
  product_owner_unread_messages_count?: string;
  type?: string;
  sender_unread_count?: number;
  receiver_unread_count?: number;
}

export interface ChatMessage {
  id: number;
  created_at: string;
  updated_at: string;
  chat_head_id: string;
  chat_head_text?: string;
  sender_id: string;
  sender_text?: string;
  receiver_id: string;
  receiver_text?: string;
  sender_name?: string;
  sender_photo?: string;
  receiver_name?: string;
  receiver_photo?: string;
  body: string;
  type?: string;
  status?: string;
  audio?: string;
  product_id?: string;
  document?: string;
  photo?: string;
  longitude?: string;
  latitude?: string;
  isMyMessage?: boolean;
}

export interface ChatStartRequest {
  sender_id: number;
  receiver_id: number;
  product_id?: number;
}

export interface ChatSendRequest {
  chat_head_id: number;
  receiver_id: number;
  body: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ===== CHAT API SERVICE =====

export class ChatApiService {
  
  /**
   * Start a new chat conversation
   */
  static async startChat(request: ChatStartRequest): Promise<ChatHead> {
    try {
      const response = await http_post("chat-start", request);
      return response.data;
    } catch (error) {
      console.error("Failed to start chat:", error);
      ToastService.error("Failed to start chat");
      throw error;
    }
  }

  /**
   * Get all chat heads for the current user
   */
  static async getChatHeads(): Promise<ChatHead[]> {
    try {
      const response = await http_get("chat-heads");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch chat heads:", error);
      ToastService.error("Failed to load conversations");
      throw error;
    }
  }

  /**
   * Get messages for a specific chat head
   */
  static async getChatMessages(chatHeadId?: number): Promise<ChatMessage[]> {
    try {
      const params = chatHeadId ? `?chat_head_id=${chatHeadId}` : '';
      const response = await http_get(`chat-messages${params}`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      ToastService.error("Failed to load messages");
      throw error;
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(request: ChatSendRequest): Promise<ChatMessage> {
    try {
      const response = await http_post("chat-send", request);
      ToastService.success("Message sent successfully");
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
  static async markAsRead(chatHeadId: number): Promise<void> {
    try {
      await http_post("chat-mark-as-read", { chat_head_id: chatHeadId });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      // Don't show toast for this, it's a background operation
    }
  }

  /**
   * Delete a chat
   */
  static async deleteChat(chatHeadId: number): Promise<void> {
    try {
      await http_post("chat-delete", { chat_head_id: chatHeadId });
      ToastService.success("Chat deleted successfully");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      ToastService.error("Failed to delete chat");
      throw error;
    }
  }

  /**
   * Start chat with seller (user ID 1) for contact seller functionality
   */
  static async startSellerChat(productId?: number): Promise<ChatHead> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const request: ChatStartRequest = {
      sender_id: currentUser.id,
      receiver_id: 1, // Always chat with user ID 1 (the seller)
      product_id: productId
    };

    return this.startChat(request);
  }

  /**
   * Get current user from storage or auth context
   * This should be replaced with your actual auth implementation
   */
  private static getCurrentUser(): { id: number } | null {
    try {
      // This should match your authentication system
      const token = localStorage.getItem('ugflix_auth_token');
      const user = localStorage.getItem('ugflix_user');
      
      if (token && user) {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  /**
   * Get unread message count for a user in a chat head
   */
  static getUnreadCount(chatHead: ChatHead, userId: number): number {
    if (userId.toString() === chatHead.product_owner_id) {
      return parseInt(chatHead.product_owner_unread_messages_count || '0');
    } else if (userId.toString() === chatHead.customer_id) {
      return parseInt(chatHead.customer_unread_messages_count || '0');
    }
    return 0;
  }

  /**
   * Get the other participant's info from a chat head
   */
  static getOtherParticipant(chatHead: ChatHead, currentUserId: number): {
    id: string;
    name: string;
    photo: string;
    lastSeen: string;
  } {
    const isProductOwner = currentUserId.toString() === chatHead.product_owner_id;
    
    if (isProductOwner) {
      return {
        id: chatHead.customer_id,
        name: chatHead.customer_name || chatHead.customer_text || 'Unknown User',
        photo: chatHead.customer_photo || '',
        lastSeen: chatHead.customer_last_seen || ''
      };
    } else {
      return {
        id: chatHead.product_owner_id,
        name: chatHead.product_owner_name || chatHead.product_owner_text || 'Unknown User',
        photo: chatHead.product_owner_photo || '',
        lastSeen: chatHead.product_owner_last_seen || ''
      };
    }
  }

  /**
   * Format message time for display
   */
  static formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Check if message is from current user
   */
  static isMyMessage(message: ChatMessage, currentUserId: number): boolean {
    return message.sender_id === currentUserId.toString();
  }
}

export default ChatApiService;