// src/app/services/ConnectApiService.ts

import ApiService from './ApiService';
import {
  ConnectUser,
  ConnectFilters,
  ConnectUsersResponse,
  ProfileUpdateData,
  ReportData,
  BlockData,
  ChatStartData,
  calculateAge,
  isUserOnline,
  parseProfilePhotos,
} from '../models/ConnectModels';

/**
 * API Service for Dating/Connect Module
 * Handles all connect-related API calls
 */
export class ConnectApiService {
  private static readonly BASE_URL = '/api';

  /**
   * Get users list with filters and pagination
   */
  static async getUsersList(
    filters: ConnectFilters = {},
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        per_page: perPage.toString(),
      };

      // Add filter parameters
      if (filters.search) params.search = filters.search;
      if (filters.sex) params.sex = filters.sex;
      if (filters.country) params.country = filters.country;
      if (filters.city) params.city = filters.city;
      if (filters.age_min) params.age_min = filters.age_min.toString();
      if (filters.age_max) params.age_max = filters.age_max.toString();
      if (filters.online_only) params.online_only = 'yes';
      if (filters.email_verified) params.email_verified = 'yes';
      if (filters.status) params.status = filters.status;

      // Add sorting
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_dir) params.sort_dir = filters.sort_dir;

      const response = await ApiService.get(`${this.BASE_URL}/users-list`, params);

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to fetch users');
      }

      const data = response.data;

      return {
        users: data.data.map((user: any) => this.mapToConnectUser(user)),
        pagination: {
          currentPage: data.current_page,
          lastPage: data.last_page,
          total: data.total,
          perPage: data.per_page,
          hasMore: data.next_page_url !== null,
          from: data.from,
          to: data.to,
        },
      };
    } catch (error: any) {
      console.error('Error fetching users list:', error);
      throw new Error(error.message || 'Failed to load users');
    }
  }

  /**
   * Get single user profile by ID
   */
  static async getUserProfile(userId: number): Promise<ConnectUser> {
    try {
      const response = await ApiService.get(`${this.BASE_URL}/dynamic-list`, {
        model: 'User',
        id: userId.toString(),
      });

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to fetch user profile');
      }

      return this.mapToConnectUser(response.data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw new Error(error.message || 'Failed to load user profile');
    }
  }

  /**
   * Update current user's profile
   */
  static async updateMyProfile(data: ProfileUpdateData): Promise<void> {
    try {
      const response = await ApiService.post(`${this.BASE_URL}/dynamic-save`, {
        model: 'User',
        ...data,
      });

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Start a chat with a user
   */
  static async startChat(data: ChatStartData): Promise<{ chatId: number }> {
    try {
      const response = await ApiService.post(`${this.BASE_URL}/chat-start`, {
        receiver_id: data.receiverId.toString(),
      });

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to start chat');
      }

      return {
        chatId: response.data.id || response.data.chat_thread_id,
      };
    } catch (error: any) {
      console.error('Error starting chat:', error);
      throw new Error(error.message || 'Failed to start chat');
    }
  }

  /**
   * Block a user
   */
  static async blockUser(data: BlockData): Promise<void> {
    try {
      const response = await ApiService.post(`${this.BASE_URL}/moderation/block-user`, {
        blocked_user_id: data.blockedUserId,
        reason: data.reason || 'No reason provided',
      });

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to block user');
      }
    } catch (error: any) {
      console.error('Error blocking user:', error);
      throw new Error(error.message || 'Failed to block user');
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(userId: number): Promise<void> {
    try {
      const response = await ApiService.post(`${this.BASE_URL}/moderation/unblock-user`, {
        blocked_user_id: userId,
      });

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to unblock user');
      }
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      throw new Error(error.message || 'Failed to unblock user');
    }
  }

  /**
   * Get list of blocked users
   */
  static async getBlockedUsers(): Promise<ConnectUser[]> {
    try {
      const response = await ApiService.get(`${this.BASE_URL}/moderation/blocked-users`);

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to fetch blocked users');
      }

      return response.data.map((user: any) => this.mapToConnectUser(user));
    } catch (error: any) {
      console.error('Error fetching blocked users:', error);
      throw new Error(error.message || 'Failed to load blocked users');
    }
  }

  /**
   * Report a user
   */
  static async reportUser(data: ReportData): Promise<void> {
    try {
      const response = await ApiService.post(`${this.BASE_URL}/moderation/report-content`, {
        content_type: data.contentType,
        content_id: data.contentId,
        reason: data.reason,
        details: data.details || '',
      });

      if (response.code !== 1) {
        throw new Error(response.message || 'Failed to report user');
      }
    } catch (error: any) {
      console.error('Error reporting user:', error);
      throw new Error(error.message || 'Failed to report user');
    }
  }

  /**
   * Search users by query
   */
  static async searchUsers(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    return this.getUsersList({ search: query }, page, perPage);
  }

  /**
   * Get online users only
   */
  static async getOnlineUsers(
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    return this.getUsersList({ online_only: true }, page, perPage);
  }

  /**
   * Get verified users only
   */
  static async getVerifiedUsers(
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    return this.getUsersList({ email_verified: true }, page, perPage);
  }

  /**
   * Get users by location
   */
  static async getUsersByLocation(
    country: string,
    city?: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    const filters: ConnectFilters = { country };
    if (city) filters.city = city;
    return this.getUsersList(filters, page, perPage);
  }

  /**
   * Get users by age range
   */
  static async getUsersByAgeRange(
    minAge: number,
    maxAge: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    return this.getUsersList({ age_min: minAge, age_max: maxAge }, page, perPage);
  }

  /**
   * Get users by gender
   */
  static async getUsersByGender(
    sex: 'male' | 'female',
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    return this.getUsersList({ sex }, page, perPage);
  }

  /**
   * Helper: Map backend user data to ConnectUser model
   */
  private static mapToConnectUser(data: any): ConnectUser {
    const profilePhotos = parseProfilePhotos(data.profile_photos || '');

    return {
      // Core Identity
      id: data.id,
      username: data.username || '',
      name: data.name || '',
      email: data.email || '',
      avatar: data.avatar || '',

      // Personal Info
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone_number: data.phone_number || '',
      phone_number_2: data.phone_number_2 || '',
      sex: data.sex || '',
      dob: data.dob || '',
      age: calculateAge(data.dob || ''),

      // Profile Content
      bio: data.bio || '',
      tagline: data.tagline || '',
      profile_photos: profilePhotos,

      // Physical Attributes
      height_cm: data.height_cm || '',
      body_type: data.body_type || '',
      sexual_orientation: data.sexual_orientation || '',

      // Location
      country: data.country || '',
      state: data.state || '',
      city: data.city || '',
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      address: data.address || '',

      // Phone Details
      phone_country_name: data.phone_country_name || '',
      phone_country_code: data.phone_country_code || '',
      phone_country_international: data.phone_country_international || '',

      // Dating Preferences
      looking_for: data.looking_for || '',
      interested_in: data.interested_in || '',
      age_range_min: data.age_range_min || '',
      age_range_max: data.age_range_max || '',
      max_distance_km: data.max_distance_km || '',

      // Lifestyle
      smoking_habit: data.smoking_habit || '',
      drinking_habit: data.drinking_habit || '',
      pet_preference: data.pet_preference || '',

      // Beliefs & Culture
      religion: data.religion || '',
      political_views: data.political_views || '',
      languages_spoken: data.languages_spoken || '',

      // Professional
      education_level: data.education_level || '',
      occupation: data.occupation || '',

      // Verification & Status
      email_verified: data.email_verified || 'no',
      phone_verified: data.phone_verified || 'no',
      verification_code: data.verification_code || '',
      status: data.status || '',
      isVerified: data.email_verified === 'yes',

      // Online Presence
      last_online_at: data.last_online_at || '',
      online_status: data.online_status || '',
      isOnline: isUserOnline(data.online_status || ''),

      // Subscription & Credits
      subscription_tier: data.subscription_tier || '',
      subscription_expires: data.subscription_expires || '',
      credits_balance: data.credits_balance || '0',

      // Engagement Metrics
      profile_views: data.profile_views || '0',
      likes_received: data.likes_received || '0',
      matches_count: data.matches_count || '0',
      completed_profile_pct: data.completed_profile_pct || '0',

      // Security
      failed_login_attempts: data.failed_login_attempts || '0',
      last_password_change: data.last_password_change || '',
      secret_code: data.secret_code || '',

      // System Fields
      company_id: data.company_id || '',
      remember_token: data.remember_token || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
    };
  }

  /**
   * Helper: Build query string from params
   */
  private static buildQueryString(params: Record<string, string>): string {
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }
}

export default ConnectApiService;
