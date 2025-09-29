import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./routing/AppRoutes";
import ScrollToTop from "./components/Layout/ScrollToTop";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { restoreAuthState, selectIsAuthenticated, selectUser } from "./store/slices/authSlice";
import { CacheApiService } from "./services/CacheApiService";
import AnalyticsService from "./services/AnalyticsService";
import PerformanceService from "./services/PerformanceService";

// Import Master CSS Architecture
import "./styles/index.css";

// Import React Toastify CSS
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";

// Import auth debugger for development
import "./utils/authDebugger";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Restore authentication state on app startup
  useEffect(() => {
    // Ensure we're in browser environment and localStorage is available
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      console.log('🚀 App started, restoring auth state immediately...');
      
      // Restore auth state immediately - no delay needed
      dispatch(restoreAuthState());
    } else {
      console.log('🚫 Not in browser environment, skipping auth restore');
    }
  }, [dispatch]);

  // Initialize analytics and performance monitoring in production
  useEffect(() => {
    AnalyticsService.initialize();
    PerformanceService.initialize();
    PerformanceService.trackBundlePerformance();
  }, []);

  // Preload essential data for better performance with offline fallbacks
  useEffect(() => {
    // Preload critical data in background with graceful fallback handling
    CacheApiService.preloadEssentialData().catch((error) => {
      console.warn('⚠️ Data preload completed with offline fallbacks:', error?.message || 'Network unavailable');
    });
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <AppRoutes />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="custom-toast-container"
      />
    </ErrorBoundary>
  );
};

export default App;
