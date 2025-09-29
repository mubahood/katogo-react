// src/app/utils/authDebugger.ts

/**
 * Authentication debugging utilities
 * Use these in browser console to test authentication state
 */

export const debugAuthStatus = () => {
  console.log('🔍 Authentication Debug Status:');
  console.log('================================');
  
  // Check localStorage
  const token = localStorage.getItem('ugflix_auth_token');
  const userProfile = localStorage.getItem('ugflix_user');
  
  console.log('📦 localStorage:', {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
    hasUserProfile: !!userProfile,
    userProfile: userProfile ? JSON.parse(userProfile) : null
  });
  
  // Check Redux store (if available)
  if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('🏪 Redux store available - check Redux DevTools');
  }
  
  return {
    token,
    userProfile: userProfile ? JSON.parse(userProfile) : null,
    isAuthenticated: !!(token && userProfile)
  };
};

export const clearAuthData = () => {
  console.log('🧹 Clearing authentication data...');
  localStorage.removeItem('ugflix_auth_token');
  localStorage.removeItem('ugflix_user');
  console.log('✅ Auth data cleared. Please refresh the page.');
};

export const setMockAuthData = () => {
  console.log('🎭 Setting mock authentication data...');
  
  const mockToken = 'mock_token_' + Date.now();
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    name: 'Test User',
    avatar: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem('ugflix_auth_token', mockToken);
  localStorage.setItem('ugflix_user', JSON.stringify(mockUser));
  
  console.log('✅ Mock auth data set. Please refresh the page to see changes.');
  return { token: mockToken, user: mockUser };
};

export const forceAuthRestore = () => {
  console.log('🔧 Forcing authentication state restore...');
  
  // Dispatch the restore action directly
  if (typeof window !== 'undefined' && (window as any).store) {
    const store = (window as any).store;
    store.dispatch({ type: 'auth/restoreAuthState' });
    console.log('✅ Auth restore action dispatched');
  } else {
    console.log('❌ Redux store not available on window.store');
  }
};

// Make these available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthStatus;
  (window as any).clearAuth = clearAuthData;
  (window as any).setMockAuth = setMockAuthData;
  (window as any).forceAuthRestore = forceAuthRestore;
  
  console.log('🔧 Auth debugging tools available:');
  console.log('- window.debugAuth() - Check current auth status');
  console.log('- window.clearAuth() - Clear authentication data');
  console.log('- window.setMockAuth() - Set mock authentication for testing');
  console.log('- window.forceAuthRestore() - Force auth state restore');
}
