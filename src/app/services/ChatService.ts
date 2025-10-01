// src/app/services/ChatService.ts - BRAND NEW CHAT SERVICE

import { http_get, http_post } from "./Api";
import { ugflix_user } from "../../Constants";
import Utils from "./Utils";

// ===== INTERFACES =====

export interface ChatConversation {
  id: number;
  product_owner_id: number;
  customer_id: number;
  product_id?: number;
  product_name?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  other_user_id: number;
  other_user_name: string;
  other_user_photo?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  chat_head_id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  sender_name?: string;
  sender_photo?: string;
  is_mine: boolean;
}

export interface SendMessageRequest {
  chat_head_id: number;
  receiver_id: number;
  body: string;
}

// ===== CHAT SERVICE =====

class ChatService {
  
  /**
   * Get current logged-in user
   */
  private getCurrentUser(): { id: number; name: string; email: string } | null {
    try {
      const user = Utils.loadFromDatabase(ugflix_user);
      if (user && user.id) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get all chat conversations for current user
   */
  async getConversations(): Promise<ChatConversation[]> {
    try {
      const response = await http_get('chat-heads');
      
      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to load conversations');
      }

      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      // Transform backend data to our format
      const conversations: ChatConversation[] = (response.data || []).map((item: any) => ({
        id: item.id,
        product_owner_id: parseInt(item.product_owner_id),
        customer_id: parseInt(item.customer_id),
        product_id: item.product_id ? parseInt(item.product_id) : undefined,
        product_name: item.product_name,
        last_message: item.last_message_body || 'No messages yet',
        last_message_time: item.last_message_time || item.created_at,
        unread_count: item.unread_count || 0,
        other_user_id: item.other_user_id || (
          currentUser.id === parseInt(item.product_owner_id) 
            ? parseInt(item.customer_id) 
            : parseInt(item.product_owner_id)
        ),
        other_user_name: item.other_user_name || (
          currentUser.id === parseInt(item.product_owner_id)
            ? item.customer_name
            : item.product_owner_name
        ),
        other_user_photo: item.other_user_photo || (
          currentUser.id === parseInt(item.product_owner_id)
            ? item.customer_photo
            : item.product_owner_photo
        ),
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return conversations;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(chatHeadId: number): Promise<ChatMessage[]> {
    try {
      const response = await http_get(`chat-messages?chat_head_id=${chatHeadId}`);
      
      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to load messages');
      }

      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      // Transform backend data to our format
      const messages: ChatMessage[] = (response.data || []).map((item: any) => ({
        id: item.id,
        chat_head_id: parseInt(item.chat_head_id),
        sender_id: parseInt(item.sender_id),
        receiver_id: parseInt(item.receiver_id),
        body: item.body,
        status: item.status || 'sent',
        created_at: item.created_at,
        sender_name: item.sender_name,
        sender_photo: item.sender_photo,
        is_mine: parseInt(item.sender_id) === currentUser.id
      }));

      return messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(data: SendMessageRequest): Promise<ChatMessage> {
    try {
      const response = await http_post('chat-send', data);
      
      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to send message');
      }

      const currentUser = this.getCurrentUser();
      
      // Transform response to our format
      const message: ChatMessage = {
        id: response.data.id,
        chat_head_id: data.chat_head_id,
        sender_id: response.data.sender_id || currentUser?.id || 0,
        receiver_id: data.receiver_id,
        body: data.body,
        status: 'sent',
        created_at: response.data.created_at || new Date().toISOString(),
        is_mine: true
      };

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(chatHeadId: number): Promise<void> {
    try {
      await http_post('chat-mark-as-read', { chat_head_id: chatHeadId });
    } catch (error) {
      console.error('Failed to mark as read:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Format timestamp for display
   */
  formatTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  }
}

export default new ChatService();
