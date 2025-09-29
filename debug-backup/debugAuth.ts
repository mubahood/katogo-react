// src/app/utils/debugAuth.ts
import { ugflix_auth_token, ugflix_user } from "../../Constants";
import Utils from "../services/Utils";

/**
 * Debug utility to check authentication status
 */
export function debugAuthStatus() {
  const token = Utils.loadFromDatabase(ugflix_auth_token);
  const user = Utils.loadFromDatabase(ugflix_user);
  
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
