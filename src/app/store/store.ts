// src/app/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import your API services
import { productsApi } from '../services/productsApi';
import { realProductsApi } from '../services/realProductsApi';

// Import your Redux slices
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import wishlistReducer from './slices/wishlistSlice';
import userReducer from './slices/userSlice';
import manifestReducer from './slices/manifestSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    notification: notificationReducer,
    wishlist: wishlistReducer,
    manifest: manifestReducer,
    // Add the API reducers
    [productsApi.reducerPath]: productsApi.reducer,
    [realProductsApi.reducerPath]: realProductsApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of RTK Query.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          // Ignore RTK Query actions for serialization checks
          'realProductsApi/executeQuery/fulfilled',
          'realProductsApi/executeQuery/pending',
          'realProductsApi/executeQuery/rejected',
          'realProductsApi/config/middlewareRegistered',
          'realProductsApi/subscriptions/internal_getRTKQSubscriptions',
          'realProductsApi/subscriptions/unsubscribeQueryResult',
          'productsApi/executeQuery/fulfilled',
          'productsApi/executeQuery/pending',
          'productsApi/executeQuery/rejected',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload', 'meta.arg', 'meta.baseQueryMeta'],
        // Ignore these paths in the state
        ignoredPaths: [
          'realProductsApi', 
          'productsApi', 
          'auth.user', 
          'cart.items'
        ],
      },
    }).concat(
      productsApi.middleware,
      realProductsApi.middleware
    ),
});

// Optional: Required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Define RootState and AppDispatch types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;