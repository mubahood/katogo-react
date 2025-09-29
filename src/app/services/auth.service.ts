import { API_ENDPOINTS, getAuthHeaders } from '../config/api.config';
import { http_post } from './Api';

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean; // For frontend compatibility
  code: number;
  message: string;
  errors?: Record<string, string[]>; // For validation errors
  data: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      name: string;
      email: string;
      phone_number?: string;
      username: string;
      status: string;
      company_id: number;
      token: string;
      remember_token: string;
      created_at: string;
      updated_at: string;
    };
    company: {
      id: number;
      name: string;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

class AuthService {
  private baseUrl = API_ENDPOINTS.BASE_URL;

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Add platform type like mobile app does
      const loginData = {
        email: credentials.email,
        password: credentials.password,
        platform_type: 'web',
        remember: credentials.remember || false
      };

      console.log('🔐 Attempting login with centralized http_post...');
      const data = await http_post('auth/login', loginData) as AuthResponse;

      if (data.code !== 1) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(data.message || 'Login failed');
      }

      // Store auth token using the same key as mobile app expects
      // Backend returns token in user.token or user.remember_token field
      const token = data.data?.user?.token || data.data?.user?.remember_token;
      if (token) {
        localStorage.setItem('ugflix_auth_token', token);
        localStorage.setItem('ugflix_user', JSON.stringify(data.data.user));
        
        if (data.data?.company) {
          localStorage.setItem('ugflix_company', JSON.stringify(data.data.company));
        }
      }

      console.log('✅ Login successful');
      return {
        success: true,
        code: data.code,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Add platform type like mobile app does
      const registerData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        platform_type: 'web'
      };

      console.log('📝 Attempting registration with centralized http_post...');
      const data = await http_post('auth/register', registerData) as AuthResponse;

      if (data.code !== 1) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth token using the same key as mobile app expects
      // Backend returns token in user.token or user.remember_token field
      const token = data.data?.user?.token || data.data?.user?.remember_token;
      if (token) {
        localStorage.setItem('ugflix_auth_token', token);
        localStorage.setItem('ugflix_user', JSON.stringify(data.data.user));
        
        if (data.data?.company) {
          localStorage.setItem('ugflix_company', JSON.stringify(data.data.company));
        }
      }

      console.log('✅ Registration successful');
      return {
        success: true,
        code: data.code,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();
      const user = this.getCurrentUser();
      
      if (token) {
        // Use same authentication headers as mobile app
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`,
          'Tok': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        };

        // Add user ID header if available
        if (user?.id) {
          headers['logged_in_user_id'] = user.id.toString();
        }

        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            platform_type: 'web'
          }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('ugflix_auth_token');
      localStorage.removeItem('ugflix_user');
      localStorage.removeItem('ugflix_company');
    }
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('ugflix_auth_token');
  }

  /**
   * Get current user data
   */
  getCurrentUser(): any | null {
    const userString = localStorage.getItem('ugflix_user');
    return userString ? JSON.parse(userString) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      return data;
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      return data;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }

      return data;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const token = this.getAuthToken();
      const user = this.getCurrentUser();
      
      if (!token) {
        throw new Error('No auth token available');
      }

      // Use same authentication headers as mobile app
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Tok': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      // Add user ID header if available
      if (user?.id) {
        headers['logged_in_user_id'] = user.id.toString();
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform_type: 'web'
        }),
      });

      const data = await response.json();

      if (data.code !== 1) {
        throw new Error(data.message || 'Token refresh failed');
      }

      // Update stored token - backend returns token in user.remember_token field
      if (data.data?.user?.remember_token) {
        localStorage.setItem('ugflix_auth_token', data.data.user.remember_token);
        localStorage.setItem('ugflix_user', JSON.stringify(data.data.user));
        localStorage.setItem('ugflix_company', JSON.stringify(data.data.company));
      }

      return data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear invalid tokens
      localStorage.removeItem('ugflix_auth_token');
      localStorage.removeItem('ugflix_user');
      localStorage.removeItem('ugflix_company');
      throw new Error(error.message || 'Network error occurred');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;