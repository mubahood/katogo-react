// src/app/constants/index.ts

/**
 * Centralized application constants
 */

// Import main constants from root
export * from "../../Constants";

// ===================================================================
// API CONFIGURATION
// ===================================================================

/* 
  BASE_URL: "http://localhost:8888/ugflix",
  API_URL: "http://localhost:8888/ugflix/api",
*/

export const API_CONFIG = {
  BASE_URL: "http://localhost:8888/katogo",
  API_URL: "http://localhost:8888/katogo/api",
  TIMEOUT: 5000,
  MAX_RETRIES: 3,
} as const;

// ===================================================================
// APPLICATION SETTINGS
// ===================================================================

export const APP_CONFIG = {
  NAME: "UgFlix",
  CURRENCY: "UGX",
  DATE_FORMAT: "YYYY-MM-DD",
  LOGO: "http://localhost:8888/katogo/storage/images/logo.png",
} as const;

// ===================================================================
// LOCAL STORAGE KEYS
// ===================================================================

export const STORAGE_KEYS = {
  CART_ITEMS: "CART_ITEMS",
  LOCAL_MANIFEST: "LOCAL_MANIFEST",
  LOCAL_DISTRICTS: "LOCAL_DISTRICTS",
  LOCAL_JOBSEEKER_MANIFEST: "LOCAL_JOBSEEKER_MANIFEST",
  USER_PREFERENCES: "USER_PREFERENCES",
  THEME: "THEME",
  // Auth-related storage keys
  ugflix_auth_token: "ugflix_auth_token",
  ugflix_user: "ugflix_user",
} as const;

// Legacy exports for backward compatibility
export const ugflix_auth_token = STORAGE_KEYS.ugflix_auth_token;
export const ugflix_user = STORAGE_KEYS.ugflix_user;
export const LOCAL_MANIFEST = STORAGE_KEYS.LOCAL_MANIFEST;
export const LOCAL_DISTRICTS = STORAGE_KEYS.LOCAL_DISTRICTS;
export const LOCAL_JOBSEEKER_MANIFEST = STORAGE_KEYS.LOCAL_JOBSEEKER_MANIFEST;
export const BASE_URL = API_CONFIG.BASE_URL;
export const API_URL = API_CONFIG.API_URL;

// ===================================================================
// UI CONSTANTS
// ===================================================================

export const BREAKPOINTS = {
  XS: 575.98,
  SM: 767.98,
  MD: 991.98,
  LG: 1199.98,
  XL: 1399.98,
} as const;

export const GRID_SETTINGS = {
  CONTAINER_MAX_WIDTH: 1200,
  PRODUCTS_PER_PAGE: 20,
  PRODUCTS_PER_ROW_DESKTOP: 4,
  PRODUCTS_PER_ROW_TABLET: 3,
  PRODUCTS_PER_ROW_MOBILE: 2,
} as const;

// ===================================================================
// PRODUCT SETTINGS
// ===================================================================

export const PRODUCT_CONFIG = {
  DEFAULT_IMAGE: "/media/svg/files/blank-image.svg",
  STOCK_WARNING_THRESHOLD: 10,
  LOW_STOCK_PERCENTAGE: 70,
  CRITICAL_STOCK_PERCENTAGE: 90,
} as const;

// ===================================================================
// NOTIFICATION SETTINGS
// ===================================================================

export const NOTIFICATION_CONFIG = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
  },
  POSITION: "top-right" as const,
  MAX_NOTIFICATIONS: 5,
} as const;

// ===================================================================
// FORM VALIDATION
// ===================================================================

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// ===================================================================
// ROUTES
// ===================================================================

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/product/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PROFILE: "/profile",
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  CONTACT: "/contact",
} as const;

// ===================================================================
// ERROR MESSAGES
// ===================================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  NOT_FOUND: "The requested resource was not found.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  VALIDATION_ERROR: "Please check your input and try again.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
} as const;

// ===================================================================
// SUCCESS MESSAGES
// ===================================================================

export const SUCCESS_MESSAGES = {
  ITEM_ADDED_TO_CART: "Item added to cart successfully!",
  ITEM_REMOVED_FROM_CART: "Item removed from cart.",
  NEWSLETTER_SUBSCRIBED: "Successfully subscribed to newsletter!",
  FORM_SUBMITTED: "Form submitted successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
} as const;

// ===================================================================
// COMPANY INFORMATION
// ===================================================================

export const COMPANY_INFO = {
  NAME: "UgFlix",
  TAGLINE: "Your trusted marketplace for quality products",
  DESCRIPTION:
    "UgFlix is Uganda's leading e-commerce platform connecting buyers and sellers across the country.",
  EMAIL: "blitelofficial@gmail.com",
  PHONE: "0800200146",
  WHATSAPP: "+256 790 742428",
  ADDRESS: "Kampala, Uganda",
} as const;

// ===================================================================
// SOCIAL MEDIA LINKS
// ===================================================================

export const SOCIAL_MEDIA = {
  TWITTER: "https://x.com/blit_xpress",
  FACEBOOK: "https://www.facebook.com/people/Blit-Xpress/61575579878607/",
  INSTAGRAM: "https://www.instagram.com/blit_xpress/",
  TIKTOK: "https://www.tiktok.com/@blit_xpress",
} as const;

// ===================================================================
// MOBILE APP LINKS
// ===================================================================

export const APP_LINKS = {
  IOS: "https://apps.apple.com/in/app/ugflix/id6742859129",
  ANDROID:
    "https://play.google.com/store/apps/details?id=com.eurosatgroup.ugflix&pli=1",
} as const;

// ===================================================================
// STATIC PAGE CONTENT
// ===================================================================

export const STATIC_CONTENT = {
  BUYER_PROTECTION: {
    TITLE: "Buyer Protection",
    SUBTITLE: "Shop with confidence on UgFlix",
    FEATURES: [
      {
        icon: "bi-shield-check",
        title: "Secure Payments",
        description:
          "All payments are processed securely through encrypted channels",
      },
      {
        icon: "bi-truck",
        title: "Safe Delivery",
        description:
          "Track your orders and get guaranteed delivery to your doorstep",
      },
      {
        icon: "bi-arrow-return-left",
        title: "Easy Returns",
        description:
          "Return items within 7 days if they don't meet your expectations",
      },
      {
        icon: "bi-headset",
        title: "24/7 Support",
        description: "Our customer support team is always ready to help you",
      },
    ],
  },
  VENDOR_BENEFITS: [
    "Reach thousands of customers across Uganda",
    "Easy product listing and management",
    "Secure payment processing",
    "Marketing and promotional support",
    "Real-time analytics and insights",
    "Dedicated vendor support team",
  ],
  VENDOR_REQUIREMENTS: [
    "Valid business registration or identification",
    "Quality products that meet our standards",
    "Competitive pricing and good customer service",
    "Ability to fulfill orders within specified timeframes",
    "Compliance with local laws and regulations",
  ],
} as const;
