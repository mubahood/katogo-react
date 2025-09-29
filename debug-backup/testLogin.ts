// src/app/utils/testLogin.ts
import { login } from '../services/Api';
import { debugAuthStatus } from './debugAuth';

/**
 * Test login functionality with debugging
 */
export async function testLogin(email: string, password: string) {
  
  try {
    const response = await login(email, password);
    
    // Check if authentication data was saved
    const authStatus = debugAuthStatus();
    
    if (authStatus) {
      return { success: true, response };
    } else {
      return { success: false, error: 'Auth data not saved' };
    }
  } catch (error) {
    return { success: false, error: (error as Error).message || 'Unknown error' };
  }
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testLogin = testLogin;
}
