// src/app/utils/testAuthFlow.ts
/**
 * Test utility to verify authentication flow
 * Run this in browser console to test the auth redirection logic
 */

export const testAuthFlow = () => {
  console.log('🧪 Testing Authentication Flow');
  console.log('================================');
  
  // Get current auth state
  const token = localStorage.getItem('ugflix_auth_token');
  const user = localStorage.getItem('ugflix_user');
  const isAuthenticated = !!(token && user);
  
  console.log('📊 Current Auth State:', {
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated,
    currentPath: window.location.pathname
  });
  
  console.log('🛣️ Route Protection Test:');
  
  // Test protected routes
  const protectedRoutes = [
    '/',
    '/products',
    '/movies',
    '/cart',
    '/account',
    '/chat'
  ];
  
  // Test public routes  
  const publicRoutes = [
    '/landing',
    '/auth/login',
    '/auth/register',
    '/about',
    '/contact',
    '/terms',
    '/privacy'
  ];
  
  console.log('🔒 Protected Routes (require auth):', protectedRoutes);
  console.log('🌐 Public Routes (no auth required):', publicRoutes);
  
  if (isAuthenticated) {
    console.log('✅ User is authenticated - should be able to access all routes');
    console.log('🚫 Auth pages should redirect to home when accessed');
  } else {
    console.log('❌ User is NOT authenticated');
    console.log('🚫 Protected routes should redirect to /landing');
    console.log('✅ Public routes should be accessible');
  }
  
  return {
    isAuthenticated,
    currentPath: window.location.pathname,
    protectedRoutes,
    publicRoutes
  };
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testAuthFlow = testAuthFlow;
  console.log('🔧 Auth flow tester available: window.testAuthFlow()');
}