// src/app/services/AuthService.ts

/**
 * AuthService - Handles authentication API calls using the established API pattern
 * Follows system rules: uses http_post and http_get, handles standard response format
 */

import { http_post } from './Api';
import { ProfileModel } from '../models/ProfileModel';

// Define constants directly to avoid circular dependencies
const DB_TOKEN = "DB_TOKEN";
const DB_LOGGED_IN_PROFILE = "DB_LOGGED_IN_PROFILE";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

/**
 * Login user using the users/login endpoint
 * @param credentials - Login credentials (username/email and password)
 * @returns Promise with user data and token
 */
export const loginUser = async (credentials: LoginCredentials): Promise<ProfileModel> => {
  try {
    console.log('🔐 AuthService: Attempting login with:', { username: credentials.username });
    
    // Call the API using your established pattern
    const response = await http_post('users/login', {
      username: credentials.username,
      password: credentials.password
    });

    console.log('🔐 AuthService: Raw login response:', response);

    // Check if the response is successful
    if (response.code !== 1) {
      console.error('❌ Login failed:', response.message);
      throw new Error(response.message || 'Login failed');
    }

    if (!response.data) {
      console.error('❌ No user data in response');
      throw new Error('No user data received from server');
    }

    const responseData = response.data;
    console.log('🔐 AuthService: User data received:', responseData);

    // Create ProfileModel from response data
    const userProfile = ProfileModel.fromJson(responseData);
    
    // Get token from response (could be remember_token, token, or access_token)
    const token = responseData.remember_token || responseData.token || responseData.access_token;
    
    console.log('🔐 AuthService: Token found:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN');
    
    if (!token) {
      console.error('❌ No token in response data:', Object.keys(responseData));
      throw new Error('No authentication token received from server');
    }

    // Save user and token using localStorage
    localStorage.setItem(DB_LOGGED_IN_PROFILE, JSON.stringify(responseData));
    localStorage.setItem(DB_TOKEN, token);

    console.log('✅ AuthService: Login successful, data saved');
    return userProfile;
  } catch (error) {
    console.error('❌ AuthService: Login failed:', error);
    throw error;
  }
};

/**
 * Register new user using the users/register endpoint
 * @param userData - Registration data
 * @returns Promise with user data and token
 */
export const registerUser = async (userData: RegisterData): Promise<ProfileModel> => {
  try {
    console.log('🔐 AuthService: Attempting registration');
    
    // Call the API using your established pattern
    // Combine first_name and last_name into name as expected by the API
    const registrationData = {
      name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      email: userData.email || userData.username,
      password: userData.password
    };

    const response = await http_post('users/register', registrationData);

    console.log('🔐 AuthService: Registration response:', response);

    // Check if the response is successful
    if (response.code !== 1) {
      console.error('❌ Registration failed:', response.message);
      throw new Error(response.message || 'Registration failed');
    }

    if (!response.data) {
      console.error('❌ No user data in registration response');
      throw new Error('No user data received from server');
    }

    const responseData = response.data;

    // Create ProfileModel from response data
    const userProfile = ProfileModel.fromJson(responseData);
    
    // Get token from response
    const token = responseData.remember_token || responseData.token || responseData.access_token;
    
    if (!token) {
      console.error('❌ No token in registration response:', Object.keys(responseData));
      throw new Error('No authentication token received from server');
    }

    // Save user and token using localStorage
    localStorage.setItem(DB_LOGGED_IN_PROFILE, JSON.stringify(responseData));
    localStorage.setItem(DB_TOKEN, token);

    console.log('✅ AuthService: Registration successful');
    return userProfile;
  } catch (error) {
    console.error('❌ AuthService: Registration failed:', error);
    throw error;
  }
};

/**
 * Logout user - clear local storage
 */
export const logoutUser = (): void => {
  localStorage.removeItem(DB_LOGGED_IN_PROFILE);
  localStorage.removeItem(DB_TOKEN);
};

/**
 * Check if user is currently logged in
 */
export const isUserLoggedIn = (): boolean => {
  const user = localStorage.getItem(DB_LOGGED_IN_PROFILE);
  const token = localStorage.getItem(DB_TOKEN);
  return !!(user && token);
};

/**
 * Get current logged in user
 */
export const getCurrentUser = (): ProfileModel | null => {
  const userData = localStorage.getItem(DB_LOGGED_IN_PROFILE);
  if (userData) {
    return ProfileModel.fromJson(userData);
  }
  return null;
};

/**
 * Get current authentication token
 */
export const getCurrentToken = (): string | null => {
  return localStorage.getItem(DB_TOKEN);
};
