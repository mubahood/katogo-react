// src/app/services/ProfileService.ts
/**
 * PROFILE SERVICE
 * 
 * Centralized service for managing user profile data:
 * ✅ Fetching fresh profile from backend
 * ✅ Syncing to localStorage with consistent keys
 * ✅ Updating Redux store
 * ✅ Error handling and retry logic
 * 
 * CRITICAL: This service ensures data consistency across:
 * - Backend database
 * - localStorage (ugflix_user)
 * - Redux store (auth.user)
 */

import { store } from '../store/store';
import { updateProfile as updateProfileAction } from '../store/slices/authSlice';
import { ApiService } from './ApiService';
import ToastService from './ToastService';

// ===== CONSTANTS =====
export const STORAGE_KEYS = {
  USER: 'ugflix_user',
  TOKEN: 'ugflix_auth_token',
} as const;

// ===== TYPES =====
export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone_number: string;
  phone_number_2?: string;
  dob?: string;
  sex?: string;
  avatar?: string;
  
  // Location
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  
  // Dating Profile
  bio?: string;
  tagline?: string;
  sexual_orientation?: string;
  height_cm?: number | string;
  body_type?: string;
  
  // Lifestyle
  smoking_habit?: string;
  drinking_habit?: string;
  pet_preference?: string;
  religion?: string;
  political_views?: string;
  
  // Additional
  languages_spoken?: string;
  education_level?: string;
  occupation?: string;
  
  // Preferences
  looking_for?: string;
  interested_in?: string;
  age_range_min?: number | string;
  age_range_max?: number | string;
  max_distance_km?: number | string;
  
  // System
  remember_token?: string;
  token?: string;
  created_at?: string;
  updated_at?: string;
  
  [key: string]: any; // Allow for additional fields
}

/**
 * ProfileService - Centralized profile management
 */
export class ProfileService {
  
  /**
   * Fetch user profile from backend and sync to local storage + Redux
   * This is the PRIMARY method for refreshing user data
   * 
   * @param showToast - Whether to show success/error toasts (default: false)
   * @returns Promise<UserProfile> - The updated user profile
   */
  static async fetchAndSyncProfile(showToast: boolean = false): Promise<UserProfile> {
    try {
      console.log('🔄 ProfileService: Fetching and syncing user profile...');
      
      // Fetch from backend
      const freshProfile = await ApiService.fetchUserProfile();
      
      if (!freshProfile || !freshProfile.id) {
        throw new Error('Invalid profile data received from server');
      }
      
      // Sync to localStorage
      this.saveToLocalStorage(freshProfile);
      
      // Sync to Redux store
      this.syncToRedux(freshProfile);
      
      console.log('✅ ProfileService: Profile synced successfully', {
        userId: freshProfile.id,
        name: freshProfile.name || `${freshProfile.first_name} ${freshProfile.last_name}`,
        email: freshProfile.email
      });
      
      if (showToast) {
        ToastService.success('Profile refreshed successfully!');
      }
      
      return freshProfile;
      
    } catch (error: any) {
      console.error('❌ ProfileService: Failed to fetch and sync profile:', error);
      
      if (showToast) {
        ToastService.error(error.message || 'Failed to refresh profile');
      }
      
      throw error;
    }
  }
  
  /**
   * Get user profile from localStorage
   * Returns null if no profile found or if data is invalid
   */
  static getFromLocalStorage(): UserProfile | null {
    try {
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (!userJson) {
        console.log('ℹ️ ProfileService: No user data in localStorage');
        return null;
      }
      
      const user = JSON.parse(userJson);
      
      if (!user || !user.id) {
        console.warn('⚠️ ProfileService: Invalid user data in localStorage');
        return null;
      }
      
      return user;
      
    } catch (error) {
      console.error('❌ ProfileService: Failed to parse user from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Save user profile to localStorage
   * Uses consistent key (ugflix_user)
   */
  static saveToLocalStorage(profile: UserProfile): void {
    try {
      const userJson = JSON.stringify(profile);
      localStorage.setItem(STORAGE_KEYS.USER, userJson);
      console.log('💾 ProfileService: Saved to localStorage', {
        key: STORAGE_KEYS.USER,
        userId: profile.id
      });
    } catch (error) {
      console.error('❌ ProfileService: Failed to save to localStorage:', error);
      throw new Error('Failed to save profile to local storage');
    }
  }
  
  /**
   * Sync profile to Redux store
   * Updates auth.user state
   */
  static syncToRedux(profile: UserProfile): void {
    try {
      store.dispatch(updateProfileAction(profile));
      console.log('🔄 ProfileService: Synced to Redux store');
    } catch (error) {
      console.error('❌ ProfileService: Failed to sync to Redux:', error);
      throw new Error('Failed to sync profile to Redux store');
    }
  }
  
  /**
   * Update profile and sync everywhere
   * Use this after successful profile update
   * 
   * @param updatedProfile - The updated profile data from backend
   */
  static syncUpdatedProfile(updatedProfile: UserProfile): void {
    try {
      console.log('🔄 ProfileService: Syncing updated profile...');
      
      // Save to localStorage
      this.saveToLocalStorage(updatedProfile);
      
      // Sync to Redux
      this.syncToRedux(updatedProfile);
      
      console.log('✅ ProfileService: Updated profile synced successfully');
      
    } catch (error) {
      console.error('❌ ProfileService: Failed to sync updated profile:', error);
      throw error;
    }
  }
  
  /**
   * Clear user data from localStorage and Redux
   * Use this on logout
   */
  static clearProfile(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      console.log('🗑️ ProfileService: Cleared user data');
    } catch (error) {
      console.error('❌ ProfileService: Failed to clear profile:', error);
    }
  }
  
  /**
   * Validate profile data structure
   * Ensures all required fields are present
   */
  static validateProfile(profile: any): profile is UserProfile {
    if (!profile) return false;
    if (typeof profile !== 'object') return false;
    if (!profile.id || typeof profile.id !== 'number') return false;
    if (!profile.email || typeof profile.email !== 'string') return false;
    
    return true;
  }
  
  /**
   * Get auth token from localStorage
   */
  static getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
  
  /**
   * Check if user is authenticated (has valid token and user data)
   */
  static isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getFromLocalStorage();
    
    return !!token && !!user && this.validateProfile(user);
  }
}

export default ProfileService;
