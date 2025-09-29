// src/app/store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  isEmailVerified: boolean;
  profileImage?: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: string;
  trackingNumber?: string;
}

interface UserState {
  currentUser: User | null;
  addresses: Address[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  addresses: [],
  orders: [],
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Authentication
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.addresses = [];
      state.orders = [];
      state.isAuthenticated = false;
      state.error = null;
    },
    
    // Profile Management
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    
    // Address Management
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      // If this is set as default, remove default from others
      if (action.payload.isDefault) {
        state.addresses = state.addresses.map(addr => ({ ...addr, isDefault: false }));
      }
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        // If this is set as default, remove default from others
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map(addr => ({ ...addr, isDefault: false }));
        }
        state.addresses[index] = action.payload;
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === action.payload
      }));
    },
    
    // Order Management
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload); // Add to beginning
      // Update user stats
      if (state.currentUser) {
        state.currentUser.totalOrders += 1;
        state.currentUser.totalSpent += action.payload.total;
      }
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    
    // UI State
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  logout,
  updateProfile,
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  setOrders,
  addOrder,
  updateOrderStatus,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectUserAddresses = (state: { user: UserState }) => state.user.addresses;
export const selectDefaultAddress = (state: { user: UserState }) => 
  state.user.addresses.find(addr => addr.isDefault);
export const selectUserOrders = (state: { user: UserState }) => state.user.orders;
export const selectRecentOrders = (state: { user: UserState }) => 
  state.user.orders.slice(0, 5);
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
