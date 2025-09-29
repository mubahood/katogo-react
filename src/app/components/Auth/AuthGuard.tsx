// src/app/components/Auth/AuthGuard.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { authService } from '../../services/auth.service';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, require authentication; if false, redirect authenticated users
  redirectTo?: string;   // Where to redirect if condition not met
}

/**
 * AuthGuard component handles authentication-based routing
 * - For protected pages (requireAuth=true): redirect unauthenticated users to login
 * - For auth pages (requireAuth=false): redirect authenticated users away from auth pages
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo 
}) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      // Additional server-side verification for critical routes
      if (authStatus && requireAuth) {
        try {
          // Verify token is still valid with server
          await authService.getCurrentUser();
        } catch (error) {
          console.warn('🔒 Token validation failed, logging out');
          authService.logout();
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="danger" />
          <p className="mt-3 text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // For protected routes: redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    const loginRedirect = redirectTo || '/auth/login';
    return (
      <Navigate 
        to={loginRedirect} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // For auth routes: redirect to home if already authenticated
  if (!requireAuth && isAuthenticated) {
    const homeRedirect = redirectTo || '/';
    return (
      <Navigate 
        to={homeRedirect} 
        replace 
      />
    );
  }

  // Render children if auth status matches requirements
  return <>{children}</>;
};

export default AuthGuard;