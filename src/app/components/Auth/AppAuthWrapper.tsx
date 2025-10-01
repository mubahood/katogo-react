// src/app/components/Auth/AppAuthWrapper.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading } from '../../store/slices/authSlice';

interface AppAuthWrapperProps {
  children: React.ReactNode;
}

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/landing',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/login',
  '/register',
  '/forgot-password',
  '/about',
  '/contact',
  '/faq',
  '/help',
  '/sell',
  '/buyer-protection',
  '/mobile-apps',
  '/terms',
  '/privacy',
  '/404'
];

// Define routes that should redirect authenticated users
const AUTH_ONLY_ROUTES = [
  '/landing',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/login',
  '/register',
  '/forgot-password'
];

const AppAuthWrapper: React.FC<AppAuthWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Don't do anything while authentication is loading
    if (isLoading) {
      return;
    }

    const currentPath = location.pathname;
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );

    console.log('🔍 AppAuthWrapper: Route check', {
      currentPath,
      isAuthenticated,
      isPublicRoute,
      isAuthOnlyRoute,
      isLoading
    });

    if (!isAuthenticated) {
      // User is not authenticated
      if (!isPublicRoute) {
        // Trying to access a protected route - redirect to landing
        console.log('🚫 Redirecting unauthenticated user to landing page');
        navigate('/landing', { 
          replace: true, 
          state: { from: location } 
        });
        return;
      }
      // User can access public routes
    } else {
      // User is authenticated
      if (isAuthOnlyRoute) {
        // User is trying to access auth-only routes while logged in
        const from = location.state?.from?.pathname || '/';
        console.log('✅ Redirecting authenticated user to:', from);
        navigate(from, { replace: true });
        return;
      }
      // User can access any other route
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  // Show loading while authentication state is being restored
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          color: '#666', 
          margin: 0, 
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Loading application...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppAuthWrapper;