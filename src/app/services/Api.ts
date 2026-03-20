import axios from "axios";
import { ugflix_auth_token, ugflix_user, DEBUG_CONFIG } from "../../Constants";
import { API_CONFIG } from "../constants";
import Utils from "./Utils";
import ToastService from "./ToastService";

// Create an axios instance with default configuration
const api = axios.create({
  // baseURL: "https://fabricare.hambren.com/api", // Backend API base URL
  baseURL: API_CONFIG.API_URL, // Backend API base URL
  //get token
  headers: {
    // DON'T set Content-Type here - let each request set its own
    // FormData needs multipart/form-data, JSON needs application/json
    "Accept": "application/json",
  },
  withCredentials: false, // Temporarily disable credentials to test CORS
  timeout: 30000, // 30 second timeout
});

// CRITICAL FIX: Set auth headers on axios defaults BEFORE interceptor
// This ensures headers are ALWAYS present on every request
const token = localStorage.getItem('ugflix_auth_token');
const userStr = localStorage.getItem('ugflix_user');
const user = userStr ? JSON.parse(userStr) : null;

if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  api.defaults.headers.common['authorization'] = `Bearer ${token}`;
  api.defaults.headers.common['Tok'] = `Bearer ${token}`;
  api.defaults.headers.common['tok'] = `Bearer ${token}`;
}

if (user && user.id) {
  api.defaults.headers.common['logged_in_user_id'] = user.id.toString();
}

// Expose debug function globally for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = () => {
    const token = localStorage.getItem('ugflix_auth_token');
    const user = localStorage.getItem('ugflix_user');
    console.log('🔍 localStorage Debug:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'NO TOKEN',
      hasUser: !!user,
      userParsed: user ? JSON.parse(user) : null
    });
    return { token, user: user ? JSON.parse(user) : null };
  };
}

// Debug function to check token and user in localStorage
export function debugAuthState() {
  const token = Utils.loadFromDatabase(ugflix_auth_token);
  const user = Utils.loadFromDatabase(ugflix_user);
  
  console.log('🔍 AUTH DEBUG STATE:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? token.substring(0, 50) + '...' : 'NO TOKEN',
    hasUser: !!user,
    userId: user?.id || 'NO USER',
    userName: user?.name || 'NO NAME',
    userEmail: user?.email || 'NO EMAIL'
  });
  
  return { token, user };
}

// Function to handle user registration
export async function register(email: string, password: string, additionalData?: Record<string, any>) {
  const registerData = {
    email,
    password,
    name: additionalData?.name || '',
    phone_number: additionalData?.phone_number || '',
    ...additionalData
  };
  return handleAuth("auth/register", registerData);
}

// Function to handle user login
export async function login(email: string, password: string) {
  return handleAuth("auth/login", { email, password });
}

// Step 1: Request a password reset code sent to email
export async function requestPasswordReset(email: string) {
  try {
    const resp = await http_post('auth/request-password-reset-code', { email });
    if (resp.code !== 1) {
      throw new Error(resp.message || "Failed to send password reset code");
    }
    return resp;
  } catch (error) {
    throw new Error(`Password reset request failed: ${error}`);
  }
}

// Step 2: Reset password using the code received by email
export async function resetPassword(email: string, code: string, newPassword: string) {
  try {
    const resp = await http_post('auth/password-reset', {
      email,
      code,
      new_password: newPassword,
    });
    if (resp.code !== 1) {
      throw new Error(resp.message || "Failed to reset password");
    }
    return resp;
  } catch (error) {
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

// Save user data to local storage - handles { token, user } shape from /api/auth/* endpoints
interface AuthResponseData {
  token?: string;
  user?: {
    id: number;
    [key: string]: any;
  };
  // Legacy shape: token stored on user object
  remember_token?: string;
  id?: number;
  [key: string]: any;
}

function saveUserData(resp: AuthResponseData) {
  // New shape: { token, user } — from /api/auth/login and /api/auth/register
  const token = resp.token || resp.remember_token || resp.user?.token || resp.user?.remember_token;
  const user = resp.user || resp;

  if (!token || token.length <= 5) {
    console.error('Invalid or missing token in response:', resp);
    throw new Error("No authentication token received from server");
  }

  try {
    Utils.saveToDatabase(ugflix_auth_token, token);
    Utils.saveToDatabase(ugflix_user, user);
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('❌ Failed to save user data:', error);
    throw new Error("Failed to save data to local storage: " + error);
  }
}

// Add an interceptor for request authorization - matches mobile app pattern EXACTLY
api.interceptors.request.use(
  (config) => {
    const token = Utils.loadFromDatabase(ugflix_auth_token);
    const u = Utils.loadFromDatabase(ugflix_user);
    
    // CRITICAL FIX: Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    // Follow EXACT Flutter/Dart mobile app authentication pattern
    // Flutter sends: Authorization, authorization, tok, Tok headers
    if (token) {
      // Set on BOTH axios defaults AND request config to ensure they stick
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Tok'] = `Bearer ${token}`;
      api.defaults.headers.common['tok'] = `Bearer ${token}`;
      
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['authorization'] = `Bearer ${token}`;
      config.headers['Tok'] = `Bearer ${token}`;
      config.headers['tok'] = `Bearer ${token}`;
    } else {
      console.warn('⚠️ NO TOKEN FOUND - Request will be sent without authentication headers!');
      console.warn('⚠️ Check localStorage for ugflix_auth_token');
    }
    
    if (u && u.id) {
      // Set on BOTH axios defaults AND request config
      api.defaults.headers.common['logged_in_user_id'] = u.id.toString();
      config.headers['logged_in_user_id'] = u.id.toString();
    } else {
      console.warn('⚠️ NO USER ID FOUND - Request will be sent without logged_in_user_id header!');
      console.warn('⚠️ Check localStorage for ugflix_user');
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
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 — session expired: clear storage and redirect to login
    if (status === 401) {
      Utils.saveToDatabase(ugflix_auth_token, null);
      Utils.saveToDatabase(ugflix_user, null);
      localStorage.removeItem(ugflix_auth_token);
      localStorage.removeItem(ugflix_user);
      ToastService.error("Session expired. Please login again.");
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1200);
      return Promise.reject(error);
    }

    // 503 — backend maintenance mode
    if (status === 503) {
      ToastService.error("Service temporarily unavailable. Please try again later.");
      return Promise.reject(error);
    }

    // 403 with require_subscription flag
    if (status === 403 && error.response?.data?.data?.require_subscription) {
      const message = error.response.data.message || 'Active subscription required';
      ToastService.error(message);
      setTimeout(() => {
        window.location.href = '/subscribe';
      }, 1500);
      return Promise.reject(error);
    }

    // 429 — rate limited
    if (status === 429) {
      if (!import.meta.env.DEV) {
        ToastService.error("Too many requests. Please wait a moment and try again.");
      }
      return Promise.reject(error);
    }

    // Network errors
    if (!error.response) {
      if (!import.meta.env.DEV || !error.message?.includes('Network Error')) {
        ToastService.networkError();
      }
    } else if (status >= 500) {
      ToastService.serverError();
    }

    // Handle Unauthenticated message body (some endpoints return 200 with Unauthenticated message)
    if (error.response?.data?.message === 'Unauthenticated') {
      ToastService.error("You are not logged in.");
    }

    return Promise.reject(error);
  }
);

// Function to make a POST request
export const http_post = async (path: string, params: Record<string, any> | FormData) => {
  try {
    const u = Utils.loadFromDatabase(ugflix_user);
    const token = localStorage.getItem('ugflix_auth_token');

    console.log(`📡 POST ${path}:`, {
      hasUser: !!u,
      userId: u?.id,
      isFormData: params instanceof FormData
    });
    
    let formData: FormData;
    
    // Check if params is already FormData
    if (params instanceof FormData) {
      formData = params;
      
      // Debug: Log FormData contents BEFORE adding user fields
      console.log('📦 FormData contents BEFORE adding user fields:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }
      
      // Add user identification to existing FormData
      if (u && u.id) {
        formData.append('user', u.id.toString());
        formData.append('User-Id', u.id.toString());
        formData.append('user_id', u.id.toString());
      }
      
      // Debug: Log FormData contents AFTER adding user fields
      console.log('📦 FormData contents AFTER adding user fields:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }
    } else {
      // Add user identification to body parameters like Dart implementation
      if (u && u.id) {
        params.user = u.id.toString();
        params['User-Id'] = u.id.toString();
        params.user_id = u.id.toString();
      }
      
      // Convert params object to FormData
      formData = new FormData();
      Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
      });
    }
    
    // CRITICAL: Handle Content-Type properly for FormData vs JSON
    const config: any = {};
    
    if (params instanceof FormData) {
      // For FormData, MUST delete Content-Type to let browser set it with boundary
      // Browser will automatically set: multipart/form-data; boundary=----WebKitFormBoundary...
      config.headers = {
        'Content-Type': undefined // This tells axios to remove the header
      };
      console.log('🗂️ Sending FormData - Content-Type will be set by browser');
    } else {
      // For regular objects, use JSON
      config.headers = {
        'Content-Type': 'application/json'
      };
      console.log('📄 Sending JSON - Content-Type: application/json');
    }
    
    const response = await api.post(path, formData, config);
    
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
