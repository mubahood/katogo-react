import axios from "axios";
import { ugflix_auth_token, ugflix_user, DEBUG_CONFIG } from "../../Constants";
import { API_CONFIG } from "../constants";
import Utils from "./Utils";
import ToastService from "./ToastService";

// Create an axios instance with default configuration
const api = axios.create({
  // baseURL: "https://fabricare.hambren.com/api", // Backend API base URL
  baseURL: API_CONFIG.API_URL, // Backend API base URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Temporarily disable credentials to test CORS
  timeout: 30000, // 30 second timeout
});

// Function to handle user registration
export async function register(email: string, password: string, additionalData?: Record<string, any>) {
  const registerData = { 
    username: email, 
    password,
    email,
    ...additionalData 
  };
  return handleAuth("users/register", registerData);
}

// Function to handle user login
export async function login(email: string, password: string) {
  return handleAuth("users/login", { username: email, password });
}

// Function to request password reset
export async function requestPasswordReset(email: string) {
  try {
    console.log('🔐 Requesting password reset for:', email);
    
    const resp = await http_post('users/login', {
      username: email,
      task: 'request_password_reset'
    });
    
    console.log('🔐 Password reset request response:', resp);
    
    if (resp.code !== 1) {
      console.error('❌ Password reset request failed:', resp);
      throw new Error(resp.message || "Failed to send password reset email");
    }
    
    console.log('✅ Password reset email sent successfully');
    return resp;
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    throw new Error(`Password reset request failed: ${error}`);
  }
}

// Function to reset password with code
export async function resetPassword(email: string, code: string, newPassword: string) {
  try {
    console.log('🔐 Resetting password for:', email);
    
    const resp = await http_post('users/login', {
      email,
      code,
      password: newPassword,
      task: 'reset_password'
    });
    
    console.log('🔐 Password reset response:', resp);
    
    if (resp.code !== 1) {
      console.error('❌ Password reset failed:', resp);
      throw new Error(resp.message || "Failed to reset password");
    }
    
    console.log('✅ Password reset successfully');
    return resp;
  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw new Error(`Password reset failed: ${error}`);
  }
}

// Common function to handle authentication
async function handleAuth(path: string, params: Record<string, any>) {
  try {
    console.log(`🔐 Attempting ${path} with params:`, { username: params.username, password: '[HIDDEN]' });
    
    const resp = await http_post(path, params);
    console.log('🔐 Auth response received:', resp);
    
    // Check if response is successful
    if (resp.code !== 1) {
      console.error('❌ Auth failed with response:', resp);
      throw new Error(resp.message || "Authentication failed");
    }
    
    console.log('✅ Auth successful, saving user data...');
    saveUserData(resp.data);
    return resp;
  } catch (error) {
    console.error('❌ Auth error:', error);
    throw new Error(`${path.split("/").pop()} failed: ${error}`);
  }
}

// Save user data to local storage - matches backend response structure
interface AuthResponseData {
  user: {
    id: number;
    token?: string;
    remember_token?: string;
    [key: string]: any;
  };
  company?: {
    id: number;
    [key: string]: any;
  };
}

function saveUserData(resp: AuthResponseData) {
  // Backend returns user data nested under 'user' key
  const user = resp.user;
  const token = user.token || user.remember_token;
  
  console.log('Attempting to save user data:', resp);
  console.log('Token found:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN');
  
  if (!token || token.length <= 5) {
    console.error('Invalid or missing token in response:', resp);
    throw new Error("No authentication token received from server");
  }
  
  try {
    // Store data in the same format as mobile app expects
    Utils.saveToDatabase(ugflix_auth_token, token);
    Utils.saveToDatabase(ugflix_user, user); // Store user object directly
    
    // Also store company data separately if provided
    if (resp.company) {
      Utils.saveToDatabase('DB_COMPANY', resp.company);
    }
    
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('❌ Failed to save user data:', error);
    throw new Error("Failed to save data to local storage: " + error);
  }
}

// Add an interceptor for request authorization - matches mobile app pattern
api.interceptors.request.use(
  (config) => {
    console.log('🔧 Axios request interceptor:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: Object.keys(config.headers || {}),
      hasData: !!config.data,
      dataType: config.data?.constructor?.name
    });
    
    const token = Utils.loadFromDatabase(ugflix_auth_token);
    const u = Utils.loadFromDatabase(ugflix_user);
    
    // Follow exact mobile app authentication pattern
    if (token) {
      // Mobile app uses both Authorization and Tok headers
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.Tok = `Bearer ${token}`;
    }
    
    if (u && u.id) {
      // Mobile app sends logged_in_user_id header
      config.headers.logged_in_user_id = u.id.toString();
    }
    
    // Add platform type to body for POST requests (like mobile app)
    // Only add if data is not FormData (FormData is handled in http_post)
    if (config.method === 'post' && config.data && !(config.data instanceof FormData)) {
      config.data.platform_type = 'web';
    }
    
    return config;
  },
  (error) => {
    console.error('🔧 Axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ Axios response interceptor:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.keys(response.headers || {}),
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Axios response interceptor error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseHeaders: error.response?.headers ? Object.keys(error.response.headers) : [],
      responseData: error.response?.data
    });
    
    // Reduce console noise for network errors during development
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      console.warn("🔧 Network unavailable - using offline mode");
    } else {
      console.error("API Error:", error.response || error.message);
    }
    
    // Handle Unauthenticated like Dart implementation
    if (error.response?.data?.message === 'Unauthenticated') {
      ToastService.error("You are not logged in.");
      // Utils.logout(); // Uncomment when logout function is available
      return Promise.reject(error);
    }
    
    // Handle rate limiting (429 errors) - suppress retries and flooding
    if (error.response?.status === 429) {
      console.warn('🚦 Rate limited (429) - throttling further requests');
      // Don't show toast for rate limiting in dev to reduce noise
      if (!import.meta.env.DEV) {
        ToastService.error("Server busy. Please wait a moment and try again.");
      }
      return Promise.reject(error);
    }
    
    // Show appropriate toast based on error type - but skip for network errors during dev
    if (!error.response) {
      // Network error - only show toast in production or if not a simple connectivity issue
      if (!import.meta.env.DEV || !error.message?.includes('Network Error')) {
        ToastService.networkError();
      }
    } else if (error.response.status >= 500) {
      // Server error
      ToastService.serverError();
    } else if (error.response.status === 401) {
      // Unauthorized - could handle logout here
      ToastService.error("Session expired. Please login again.");
    }
    
    return Promise.reject(error);
  }
);

// Function to make a POST request
export const http_post = async (path: string, params: Record<string, any>) => {
  try {
    const u = Utils.loadFromDatabase(ugflix_user);
    
    console.log(`📡 POST ${path}:`, { 
      hasUser: !!u, 
      userId: u?.id,
      params: Object.keys(params)
    });
    
    // Add user identification to body parameters like Dart implementation
    if (u && u.id) {
      params.user = u.id.toString();
      params['User-Id'] = u.id.toString();
      params.user_id = u.id.toString();
    }
    
    // Use FormData like Dart implementation for consistency
    const formData = new FormData();
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });
    
    const response = await api.post(path, formData, {
      headers: {
        // Don't set Content-Type for FormData - let axios handle it with boundary
        Accept: "application/json",
      },
    });
    
    console.log(`✅ POST ${path} response:`, response.status, response.statusText);
    return handleResponse(response);
  } catch (error: any) {
    console.error(`❌ POST ${path} failed:`, error);
    
    // Provide more detailed error information
    let errorMessage = "Unknown error occurred";
    
    if (error.response) {
      // Server responded with error status
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      errorMessage = `Server error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request error:', error.request);
      errorMessage = "No response from server. Please check your connection.";
    } else {
      // Something else happened
      errorMessage = error.message || "Request failed";
    }
    
    return {
      code: 0,
      message: errorMessage,
      data: null
    };
  }
};

// Function to make a GET request
export const http_get = async (path: string, params?: Record<string, any>) => {
  try {
    const u = Utils.loadFromDatabase(ugflix_user);
    
    if (!params) params = {};
    
    // Add user identification to query parameters like Dart implementation
    if (u && u.id) {
      params.user = u.id.toString();
      params['User-Id'] = u.id.toString();
      params.user_id = u.id.toString();
      if (DEBUG_CONFIG.ENABLE_API_LOGS) {
        console.log(`👤 Added user ID: ${u.id} to ${path} request`);
      }
    } else {
      if (DEBUG_CONFIG.ENABLE_API_LOGS) {
        console.log(`🔧 No user logged in, proceeding without user params`);
      }
    }

    const response = await api.get(path, { params });
    
    const result = handleResponse(response);
    return result;
  } catch (error: any) {
    // Use warn instead of error for network issues to reduce console noise
    if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
      console.warn("🔧 API request failed (server unavailable):", path);
    } else {
      console.error("GET request failed:", error);
    }
    return {
      code: 0,
      message: "GET request failed: " + error,
      data: null
    };
  }
};

// Handle API response - updated to match Dart RespondModel behavior
function handleResponse(response: any) {
  if (!response) {
    return {
      code: 0,
      message: "Failed to connect to internet. Check your connection and try again",
      data: null
    };
  }
  
  let { data } = response;
  if (!data) {
    return {
      code: 0,
      message: "Failed to fetch data because data is null",
      data: null
    };
  }
  
  // Handle different response formats
  let resp = data;
  
  // If data is a string, try to parse it as JSON
  if (typeof data === 'string') {
    try {
      resp = JSON.parse(data);
    } catch (e) {
      resp = { code: 0, message: data.toString(), data: null };
    }
  }
  
  // Handle Unauthenticated like Dart implementation
  if (resp.message === 'Unauthenticated') {
    ToastService.error("You are not logged in.");
    // Utils.logout(); // Uncomment when logout function is available
    return {
      code: 0,
      message: "You are not logged in.",
      data: null
    };
  }
  
  // Return the response in the same format as Dart
  const result = {
    code: parseInt(resp.code || resp.status || '0', 10),
    message: resp.message || "Request completed",
    data: resp.data || resp
  };
  
  return result;
}

export default api;
