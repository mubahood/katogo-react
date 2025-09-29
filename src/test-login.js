// Test file to verify login functionality
// Open this in browser console at http://localhost:5173/auth/login

console.log('🧪 Testing UgFlix login functionality...');

// Test the auth service directly
import { authService } from '../app/services/auth.service';

async function testLogin() {
  try {
    console.log('📡 Testing login with valid credentials...');
    
    const result = await authService.login({
      email: 'admin@gmail.com',
      password: '4321',
      remember: false
    });
    
    console.log('✅ Login test successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Login test failed:', error);
    throw error;
  }
}

// Test the centralized HTTP method directly
import { http_post } from '../app/services/Api';

async function testHttpPost() {
  try {
    console.log('📡 Testing direct http_post...');
    
    const result = await http_post('auth/login', {
      email: 'admin@gmail.com',
      password: '4321',
      platform_type: 'web'
    });
    
    console.log('✅ HTTP Post test successful:', result);
    return result;
  } catch (error) {
    console.error('❌ HTTP Post test failed:', error);
    throw error;
  }
}

// Export test functions to window for console access
window.testLogin = testLogin;
window.testHttpPost = testHttpPost;

console.log('🧪 Test functions loaded. Run testLogin() or testHttpPost() in console.');