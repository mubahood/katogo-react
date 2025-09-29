// src/app/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, register, requestPasswordReset, resetPassword } from '../../services/Api';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Simple initial state - no localStorage access during initialization  
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true, // Set to true initially to prevent premature redirects
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      // Save to localStorage after successful login
      try {
        localStorage.setItem('DB_TOKEN', action.payload.token);
        localStorage.setItem('DB_LOGGED_IN_PROFILE', JSON.stringify(action.payload.user));
      } catch (error) {
        console.error('Failed to save auth data to localStorage:', error);
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
      
      // Clear localStorage
      try {
        localStorage.removeItem('DB_TOKEN');
        localStorage.removeItem('DB_LOGGED_IN_PROFILE');
      } catch (error) {
        console.error('Failed to clear auth data from localStorage:', error);
      }
    },
    // Action to update user profile
    updateProfile: (state, action: PayloadAction<any>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage with new user data
        try {
          localStorage.setItem('DB_LOGGED_IN_PROFILE', JSON.stringify(state.user));
        } catch (error) {
          console.error('Failed to update user data in localStorage:', error);
        }
      }
    },
        // Action to restore auth state from localStorage (call this after app initialization)
    restoreAuthState: (state) => {
      try {
        const token = localStorage.getItem('DB_TOKEN');
        const userDataStr = localStorage.getItem('DB_LOGGED_IN_PROFILE');
        
        console.log('🔄 Restoring auth state:', { 
          hasToken: !!token, 
          hasUser: !!userDataStr,
          token: token?.substring(0, 10) + '...', 
          userPreview: userDataStr?.substring(0, 50) + '...' 
        });
        
        if (token && userDataStr) {
          const userData = JSON.parse(userDataStr);
          
          state.isAuthenticated = true;
          state.user = userData;
          state.token = token;
          state.isLoading = false;
          state.error = null;
          
          console.log('✅ Auth state restored successfully');
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.isLoading = false;
          state.error = null;
          
          console.log('❌ No valid auth data found in localStorage');
        }
      } catch (error) {
        console.error('❌ Failed to restore auth state:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('DB_TOKEN');
        localStorage.removeItem('DB_LOGGED_IN_PROFILE');
        
        // Reset state to initial values
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = null;
      }
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfile,
  restoreAuthState,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Async action creators with real API calls
export const loginUser = (credentials: { email: string; password: string }) => async (dispatch: any) => {
  dispatch(loginStart());
  
  try {
    console.log('🔐 Starting login process...', { email: credentials.email });
    
    // Real API call
    const response = await login(credentials.email, credentials.password);
    
    if (response.code === 1 && response.data) {
      const userData = response.data;
      const token = userData.remember_token || userData.token || userData.access_token;
      
      if (!token) {
        throw new Error('No authentication token received from server');
      }
      
      console.log('✅ Login successful, dispatching success action');
      dispatch(loginSuccess({ user: userData, token }));
      return { success: true, user: userData };
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error: any) {
    console.error('❌ Login failed:', error);
    const errorMessage = error?.message || 'Login failed. Please try again.';
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

export const registerUser = (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  newsletter?: boolean;
}) => async (dispatch: any) => {
  dispatch(loginStart());
  
  try {
    console.log('🔐 Starting registration process...', { email: userData.email });
    
    // Prepare additional data for registration
    const additionalData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`,
      newsletter: userData.newsletter ? 1 : 0
    };
    
    // Real API call
    const response = await register(userData.email, userData.password, additionalData);
    
    if (response.code === 1 && response.data) {
      const registeredUser = response.data;
      const token = registeredUser.remember_token || registeredUser.token || registeredUser.access_token;
      
      if (!token) {
        throw new Error('No authentication token received from server');
      }
      
      console.log('✅ Registration successful, dispatching success action');
      dispatch(loginSuccess({ user: registeredUser, token }));
      return { success: true, user: registeredUser };
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  } catch (error: any) {
    console.error('❌ Registration failed:', error);
    const errorMessage = error?.message || 'Registration failed. Please try again.';
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Password reset action creators
export const requestPasswordResetAction = (email: string) => async (dispatch: any) => {
  try {
    console.log('🔐 Requesting password reset...', { email });
    
    const response = await requestPasswordReset(email);
    
    if (response.code === 1) {
      console.log('✅ Password reset email sent successfully');
      return { success: true, message: response.message || 'Password reset code sent to your email' };
    } else {
      throw new Error(response.message || 'Failed to send password reset email');
    }
  } catch (error: any) {
    console.error('❌ Password reset request failed:', error);
    const errorMessage = error?.message || 'Failed to send password reset email';
    return { success: false, error: errorMessage };
  }
};

export const resetPasswordAction = (email: string, code: string, newPassword: string) => async (dispatch: any) => {
  try {
    console.log('🔐 Resetting password...', { email });
    
    const response = await resetPassword(email, code, newPassword);
    
    if (response.code === 1) {
      console.log('✅ Password reset successful');
      return { success: true, message: response.message || 'Password reset successfully' };
    } else {
      throw new Error(response.message || 'Failed to reset password');
    }
  } catch (error: any) {
    console.error('❌ Password reset failed:', error);
    const errorMessage = error?.message || 'Failed to reset password';
    return { success: false, error: errorMessage };
  }
};

export default authSlice.reducer;