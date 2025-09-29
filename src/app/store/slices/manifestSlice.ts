// src/app/store/slices/manifestSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/ApiService';

export interface AppInfo {
  name: string;
  version: string;
  api_version: string;
  maintenance_mode: boolean;
}

export interface Category {
  id: number;
  category: string;
  name: string;
  category_text: number;
  parent_id: number | null;
  image?: string;
  banner_image?: string | null;
  show_in_banner?: string;
  show_in_categories?: string;
  is_parent?: string;
  icon?: string;
}

export interface DeliveryLocation {
  id: number;
  name: string;
  shipping_cost: number;
  details: string | null;
}

export interface AppSettings {
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  delivery_fee_varies: boolean;
  min_order_amount: number;
}

export interface AppFeatures {
  wishlist_enabled: boolean;
  reviews_enabled: boolean;
  chat_enabled: boolean;
  promotions_enabled: boolean;
}

export interface AppCounts {
  total_products: number;
  total_categories: number;
  total_orders: number;
  total_users: number;
  total_vendors: number;
  active_vendors: number;
  total_delivery_locations: number;
  active_promotions: number;
  wishlist_count: number;
  cart_count: number;
  notifications_count: number;
  unread_messages_count: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  processing_orders: number;
  recent_orders_this_week: number;
  orders_today: number;
  orders_this_month: number;
  new_users_this_week: number;
  new_users_today: number;
  products_out_of_stock: number;
  low_stock_products: number;
  featured_products_count: number;
  total_revenue: number;
  revenue_this_month: number;
  average_order_value: number;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  user_type: string;
  status: string;
  complete_profile: string;
}

export interface Product {
  id: number;
  name: string;
  price_1: string;
  price_2: string;
  feature_photo: string;
  category: number;
}

export interface RecentOrder {
  id: number;
  order_total: string;
  order_state: number;
  created_at: string;
}

export interface ManifestData {
  app_info: AppInfo;
  categories: Category[];
  delivery_locations: DeliveryLocation[];
  settings: AppSettings;
  features: AppFeatures;
  counts: AppCounts;
  user: UserInfo | null;
  is_authenticated: boolean;
  featured_products: Product[];
  recent_products: Product[];
  recent_orders?: RecentOrder[];
  recent_search_suggestions?: string[];
  wishlist?: any[]; // Include wishlist data in manifest
}

interface ManifestState {
  data: ManifestData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  initialized: boolean;
}

const initialState: ManifestState = {
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  initialized: false,
};

// Async thunk to load manifest from API
export const loadManifest = createAsyncThunk(
  'manifest/load',
  async (_, { rejectWithValue }) => {
    try {
      const manifest = await ApiService.getManifest();
      return manifest;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load manifest');
    }
  }
);

const manifestSlice = createSlice({
  name: 'manifest',
  initialState,
  reducers: {
    updateCounts: (state, action: PayloadAction<Partial<AppCounts>>) => {
      if (state.data) {
        state.data.counts = { ...state.data.counts, ...action.payload };
      }
    },
    updateCartCount: (state, action: PayloadAction<number>) => {
      if (state.data) {
        state.data.counts.cart_count = action.payload;
      }
    },
    incrementWishlistCount: (state) => {
      if (state.data) {
        state.data.counts.wishlist_count += 1;
      }
    },
    decrementWishlistCount: (state) => {
      if (state.data) {
        state.data.counts.wishlist_count = Math.max(0, state.data.counts.wishlist_count - 1);
      }
    },
    updateUserInfo: (state, action: PayloadAction<UserInfo>) => {
      if (state.data) {
        state.data.user = action.payload;
        state.data.is_authenticated = true;
      }
    },
    clearUserInfo: (state) => {
      if (state.data) {
        state.data.user = null;
        state.data.is_authenticated = false;
        // Reset user-specific counts
        state.data.counts.total_orders = 0;
        state.data.counts.wishlist_count = 0;
        state.data.counts.notifications_count = 0;
        state.data.counts.unread_messages_count = 0;
      }
    },
    markAsInitialized: (state) => {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadManifest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadManifest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastUpdated = Date.now();
        state.initialized = true;
        state.error = null;
      })
      .addCase(loadManifest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateCounts,
  updateCartCount,
  incrementWishlistCount,
  decrementWishlistCount,
  updateUserInfo,
  clearUserInfo,
  markAsInitialized,
} = manifestSlice.actions;

// Selectors
export const selectManifest = (state: { manifest: ManifestState }) => state.manifest.data;
export const selectManifestLoading = (state: { manifest: ManifestState }) => state.manifest.isLoading;
export const selectManifestError = (state: { manifest: ManifestState }) => state.manifest.error;
export const selectManifestInitialized = (state: { manifest: ManifestState }) => state.manifest.initialized;
export const selectCategories = (state: { manifest: ManifestState }) => state.manifest.data?.categories || [];
export const selectDeliveryLocations = (state: { manifest: ManifestState }) => state.manifest.data?.delivery_locations || [];
export const selectAppCounts = (state: { manifest: ManifestState }) => state.manifest.data?.counts;
export const selectUserInfo = (state: { manifest: ManifestState }) => state.manifest.data?.user;
export const selectIsAuthenticated = (state: { manifest: ManifestState }) => state.manifest.data?.is_authenticated || false;
export const selectFeaturedProducts = (state: { manifest: ManifestState }) => state.manifest.data?.featured_products || [];
export const selectRecentProducts = (state: { manifest: ManifestState }) => state.manifest.data?.recent_products || [];
export const selectRecentOrders = (state: { manifest: ManifestState }) => state.manifest.data?.recent_orders || [];

export default manifestSlice.reducer;
