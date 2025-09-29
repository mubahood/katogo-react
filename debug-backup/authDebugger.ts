// src/app/utils/authDebugger.ts
import { http_post } from '../services/Api';
import { DB_TOKEN, DB_LOGGED_IN_PROFILE } from '../../Constants';
import Utils from '../services/Utils';

/**
 * Debug authentication by testing the raw API response
 */
export async function debugLogin(email: string, password: string) {
  
  try {
    // Make raw API call to see exact response
    const rawResponse = await http_post('users/login', {
      username: email,
      password: password
    });
    
    
    // Analyze response structure
    
    if (rawResponse?.data) {
      const data = rawResponse.data;
    }
    
    return rawResponse;
  } catch (error) {
    return null;
  }
}

/**
 * Manual authentication for testing
 */
export async function manualAuth(email: string, password: string) {
  
  const rawResponse = await debugLogin(email, password);
  
  if (!rawResponse || rawResponse.code !== 1) {
    return false;
  }
  
  const userData = rawResponse.data;
  if (!userData) {
    return false;
  }
  
  // Try to find token in different fields
  const token = userData.remember_token || userData.token || userData.access_token;
  
  if (!token) {
    return false;
  }
  
  try {
    Utils.saveToDatabase(DB_TOKEN, token);
    Utils.saveToDatabase(DB_LOGGED_IN_PROFILE, userData);
    
    
    return true;
  } catch (error) {
    return false;
  }
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).debugLogin = debugLogin;
  (window as any).manualAuth = manualAuth;
}
