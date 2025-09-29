// src/app/hooks/useManifest.ts
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { 
  loadManifest, 
  selectManifest, 
  selectManifestLoading, 
  selectManifestError, 
  selectManifestInitialized,
  updateCartCount,
} from '../store/slices/manifestSlice';

/**
 * Hook to manage application manifest
 * Automatically loads manifest on mount and provides methods to update it
 */
export const useManifest = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const manifest = useSelector((state: RootState) => selectManifest(state));
  const isLoading = useSelector((state: RootState) => selectManifestLoading(state));
  const error = useSelector((state: RootState) => selectManifestError(state));
  const initialized = useSelector((state: RootState) => selectManifestInitialized(state));

  // Load manifest on first mount
  useEffect(() => {
    if (!initialized && !isLoading) {
      dispatch(loadManifest());
    }
  }, [dispatch, initialized, isLoading]);

  // Method to reload manifest (useful after important actions)
  const reloadManifest = () => {
    dispatch(loadManifest());
  };

  // Method to update cart count in manifest
  const updateManifestCartCount = (count: number) => {
    dispatch(updateCartCount(count));
  };

  return {
    manifest,
    isLoading,
    error,
    initialized,
    reloadManifest,
    updateManifestCartCount,
  };
};

/**
 * Hook to get manifest categories
 */
export const useManifestCategories = () => {
  const manifest = useSelector((state: RootState) => selectManifest(state));
  return manifest?.categories || [];
};

/**
 * Hook to get delivery locations from manifest
 */
export const useDeliveryLocations = () => {
  const manifest = useSelector((state: RootState) => selectManifest(state));
  return manifest?.delivery_locations || [];
};

/**
 * Hook to get app counts from manifest
 */
export const useAppCounts = () => {
  const manifest = useSelector((state: RootState) => selectManifest(state));
  return manifest?.counts || {
    total_products: 0,
    total_categories: 0,
    total_orders: 0,
    total_users: 0,
    total_vendors: 0,
    active_vendors: 0,
    total_delivery_locations: 0,
    active_promotions: 0,
    wishlist_count: 0,
    cart_count: 0,
    notifications_count: 0,
    unread_messages_count: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    processing_orders: 0,
    recent_orders_this_week: 0,
    orders_today: 0,
    orders_this_month: 0,
    new_users_this_week: 0,
    new_users_today: 0,
    products_out_of_stock: 0,
    low_stock_products: 0,
    featured_products_count: 0,
    total_revenue: 0,
    revenue_this_month: 0,
    average_order_value: 0,
  };
};

/**
 * Hook to get admin dashboard statistics from manifest
 */
export const useAdminStats = () => {
  const counts = useAppCounts();
  return {
    totalUsers: counts.total_users,
    totalVendors: counts.total_vendors,
    totalProducts: counts.total_products,
    totalCategories: counts.total_categories,
    totalDeliveryLocations: counts.total_delivery_locations,
    pendingOrders: counts.pending_orders,
    recentOrdersThisWeek: counts.recent_orders_this_week,
    activePromotions: counts.active_promotions,
  };
};

/**
 * Hook to get featured products from manifest
 */
export const useFeaturedProducts = () => {
  const manifest = useSelector((state: RootState) => selectManifest(state));
  return manifest?.featured_products || [];
};

/**
 * Hook to get recent orders from manifest
 */
export const useRecentOrders = () => {
  const manifest = useSelector((state: RootState) => selectManifest(state));
  return manifest?.recent_orders || [];
};

/**
 * Hook to get enhanced order statistics
 */
export const useOrderStats = () => {
  const counts = useAppCounts();
  return {
    totalOrders: counts.total_orders,
    pendingOrders: counts.pending_orders,
    completedOrders: counts.completed_orders,
    cancelledOrders: counts.cancelled_orders,
    processingOrders: counts.processing_orders,
    ordersToday: counts.orders_today,
    ordersThisWeek: counts.recent_orders_this_week,
    ordersThisMonth: counts.orders_this_month,
    averageOrderValue: counts.average_order_value,
  };
};

/**
 * Hook to get revenue statistics
 */
export const useRevenueStats = () => {
  const counts = useAppCounts();
  return {
    totalRevenue: counts.total_revenue,
    revenueThisMonth: counts.revenue_this_month,
    averageOrderValue: counts.average_order_value,
  };
};

/**
 * Hook to get user growth statistics
 */
export const useUserGrowthStats = () => {
  const counts = useAppCounts();
  return {
    totalUsers: counts.total_users,
    newUsersToday: counts.new_users_today,
    newUsersThisWeek: counts.new_users_this_week,
    totalVendors: counts.total_vendors,
    activeVendors: counts.active_vendors,
  };
};

/**
 * Hook to get inventory statistics
 */
export const useInventoryStats = () => {
  const counts = useAppCounts();
  return {
    totalProducts: counts.total_products,
    outOfStockProducts: counts.products_out_of_stock,
    lowStockProducts: counts.low_stock_products,
    featuredProductsCount: counts.featured_products_count,
  };
};

/**
 * Hook to refresh manifest after important actions
 * Provides methods to trigger manifest reload after key events
 */
export const useManifestRefresh = () => {
  const { reloadManifest } = useManifest();
  
  const refreshAfterOrderPlacement = () => {
    // Refresh after order is placed to update counts
    setTimeout(() => reloadManifest(), 1000);
  };

  const refreshAfterProfileUpdate = () => {
    // Refresh after profile update to get latest user info
    setTimeout(() => reloadManifest(), 500);
  };

  const refreshAfterWishlistChange = () => {
    // Refresh after wishlist changes to update counts
    setTimeout(() => reloadManifest(), 500);
  };

  const refreshAfterVendorRegistration = () => {
    // Refresh after new vendor registration
    setTimeout(() => reloadManifest(), 1000);
  };

  const refreshAfterProductChange = () => {
    // Refresh after product add/edit/delete
    setTimeout(() => reloadManifest(), 1000);
  };

  return {
    refreshAfterOrderPlacement,
    refreshAfterProfileUpdate,
    refreshAfterWishlistChange,
    refreshAfterVendorRegistration,
    refreshAfterProductChange,
    refreshNow: reloadManifest,
  };
};

/**
 * Hook to get vendors from manifest
 */
export const useManifestVendors = () => {
  const manifest = useSelector((state: RootState) => selectManifest(state));
  return []; // Vendors not implemented in manifest yet
};

/**
 * Hook to get mega menu categories from manifest
 * Returns main categories with their subcategories for mega menu display
 * Based on Laravel form logic: is_parent='Yes' for main categories, is_parent='No' for subcategories
 */
export const useMegaMenuCategories = () => {
  const manifest = useSelector((state: RootState) => selectManifest(state));
  const categories = manifest?.categories || [];
  
  // Debug only if categories length changes or on error
  const previousLengthRef = useRef<number>(0);
  
  if (categories.length !== previousLengthRef.current) {
    console.log('📋 Categories loaded:', categories.length);
    previousLengthRef.current = categories.length;
  }
  
  // Get main categories (parents) - is_parent='Yes'
  const mainCategories = categories
    .filter(cat => {
      return cat.is_parent === 'Yes' || cat.is_parent === 'YES' || cat.is_parent === 'yes' || cat.is_parent === '1';
    })
    .slice(0, 3); // Limit to 3 main categories for mega menu
  
  // For each main category, find its subcategories
  const categoriesWithSubs = mainCategories.map(parent => {
    // Find subcategories: is_parent='No' AND parent_id=this_category_id
    const subcategories = categories
      .filter(cat => {
        // Check if it's a subcategory (is_parent = 'No')
        const isSubcategory = cat.is_parent === 'No' || cat.is_parent === 'NO' || cat.is_parent === 'no' || cat.is_parent === '0';
        
        // Check if it belongs to this parent (handle string/number mismatch)
        const belongsToThisParent = 
          cat.parent_id === parent.id ||
          Number(cat.parent_id) === Number(parent.id) ||
          String(cat.parent_id) === String(parent.id);
        
        return isSubcategory && belongsToThisParent;
      })
      .slice(0, 6); // Limit to 6 subcategories per parent
    
    return {
      ...parent,
      subcategories
    };
  });
  
  return categoriesWithSubs;
};

export default useManifest;
