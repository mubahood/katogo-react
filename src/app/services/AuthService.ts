// src/app/services/AuthService.ts

/**
 * AuthService - Handles authentication API calls using the established API pattern
 * Follows system rules: uses http_post and http_get, handles standard response format
 */

import { http_post } from './Api';
import { ProfileModel } from '../models/ProfileModel';

// Define constants directly to avoid circular dependencies
const ugflix_auth_token = "ugflix_auth_token";
const ugflix_user = "ugflix_user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone_number?: string;
}

/**
 * Login user using the users/login endpoint
 * @param credentials - Login credentials (username/email and password)
 * @returns Promise with user data and token
 */
export const loginUser = async (credentials: LoginCredentials): Promise<ProfileModel> => {
  try {
    const response = await http_post('auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.code !== 1) {
      throw new Error(response.message || 'Login failed');
    }

    if (!response.data) {
      throw new Error('No user data received from server');
    }

    // Backend returns { token, user } inside data
    const token = response.data.token || response.data.remember_token || response.data.access_token;
    const userData = response.data.user || response.data;

    if (!token) {
      throw new Error('No authentication token received from server');
    }

    localStorage.setItem(ugflix_user, JSON.stringify(userData));
    localStorage.setItem(ugflix_auth_token, token);

    return ProfileModel.fromJson(userData);
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
    const response = await http_post('auth/register', {
      email: userData.email,
      password: userData.password,
      name: userData.name || '',
      phone_number: userData.phone_number || '',
    });

    if (response.code !== 1) {
      throw new Error(response.message || 'Registration failed');
    }

    if (!response.data) {
      throw new Error('No user data received from server');
    }

    // Backend returns { token, user } inside data
    const token = response.data.token || response.data.remember_token || response.data.access_token;
    const newUserData = response.data.user || response.data;

    if (!token) {
      throw new Error('No authentication token received from server');
    }

    localStorage.setItem(ugflix_user, JSON.stringify(newUserData));
    localStorage.setItem(ugflix_auth_token, token);

    return ProfileModel.fromJson(newUserData);
  } catch (error) {
    console.error('❌ AuthService: Registration failed:', error);
    throw error;
  }
};

/**
 * Logout user - clear local storage
 */
export const logoutUser = (): void => {
  localStorage.removeItem(ugflix_user);
  localStorage.removeItem(ugflix_auth_token);
};

/**
 * Check if user is currently logged in
 */
export const isUserLoggedIn = (): boolean => {
  const user = localStorage.getItem(ugflix_user);
  const token = localStorage.getItem(ugflix_auth_token);
  return !!(user && token);
};

/**
 * Get current logged in user
 */
export const getCurrentUser = (): ProfileModel | null => {
  const userData = localStorage.getItem(ugflix_user);
  if (userData) {
    return ProfileModel.fromJson(userData);
  }
  return null;
};

/**
 * Get current authentication token
 */
export const getCurrentToken = (): string | null => {
  return localStorage.getItem(ugflix_auth_token);
};
