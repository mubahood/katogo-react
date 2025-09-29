// src/app/utils/debugAuth.ts
import { DB_TOKEN, DB_LOGGED_IN_PROFILE } from "../../Constants";
import Utils from "../services/Utils";

/**
 * Debug utility to check authentication status
 */
export function debugAuthStatus() {
  const token = Utils.loadFromDatabase(DB_TOKEN);
  const user = Utils.loadFromDatabase(DB_LOGGED_IN_PROFILE);
  
  console.log('Auth Debug:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    user: user ? {
      id: user.id, 
      name: user.name || user.username || 'No name',
      email: user.email || 'No email' 
    } : 'NOT FOUND'
  });
  
  if (!token) {
    return false;
  }
  
  if (!user || !user.id) {
    return false;
  }
  
  return true;
}

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthStatus;
}
