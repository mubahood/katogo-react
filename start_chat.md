i want to share with you about this react project  i am doing, I want you to understand it very well so you can be able to answer following questions correctly .

// src/app/routing/AppRoutes.tsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

// Layouts
import MainLayout from "../components/Layout/MainLayout";
import AuthLayout from "../components/Layout/AuthLayout";

// Route Guards
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import PublicOnlyRoute from "../components/Auth/PublicOnlyRoute";

// Lazy loaded components for better performance
const HomePage = React.lazy(() => import("../pages/HomePage"));
const ProductDetailPage = React.lazy(() => import("../pages/ProductDetailPage/ProductDetailPage"));
const ProductsPage = React.lazy(() => import("../pages/ProductsPage"));
const CategoryPage = React.lazy(() => import("../pages/CategoryPage"));
const CartPage = React.lazy(() => import("../pages/CartPage"));
const CheckoutPage = React.lazy(() => import("../pages/CheckoutPage"));
const DeliveryAddressPage = React.lazy(() => import("../pages/DeliveryAddressPage"));
const OrderSuccessPage = React.lazy(() => import("../pages/OrderSuccessPage"));
const PaymentPage = React.lazy(() => import("../pages/PaymentPage"));
const SearchResultsPage = React.lazy(() => import("../pages/SearchResultsPage"));
const WishlistPage = React.lazy(() => import("../pages/WishlistPage"));
const AboutPage = React.lazy(() => import("../pages/AboutPage"));
const ContactPage = React.lazy(() => import("../pages/ContactPage"));
const FAQPage = React.lazy(() => import("../pages/FAQPage"));

// Legal Pages
const TermsPage = React.lazy(() => import("../pages/legal/TermsPage"));
const PrivacyPage = React.lazy(() => import("../pages/legal/PrivacyPage"));

// Static Pages
const SellOnBlitXpress = React.lazy(() => import("../pages/static/SellOnBlitXpress"));
const BuyerProtection = React.lazy(() => import("../pages/static/BuyerProtection"));
const Help = React.lazy(() => import("../pages/static/Help"));
const MobileApps = React.lazy(() => import("../pages/static/MobileApps"));
const About = React.lazy(() => import("../pages/static/About"));
const Terms = React.lazy(() => import("../pages/static/Terms"));
const Privacy = React.lazy(() => import("../pages/static/Privacy"));
const Contact = React.lazy(() => import("../pages/static/Contact"));

// Demo Pages
const ToastDemo = React.lazy(() => import("../components/Demo/ToastDemo"));
const ApiTestPage = React.lazy(() => import("../pages/ApiTestPage"));
const ApiIntegrationStatusPage = React.lazy(() => import("../pages/ApiIntegrationStatusPage"));

// Auth Pages
const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/auth/RegisterPage"));
const MinimalLogin = React.lazy(() => import("../pages/auth/MinimalLogin"));
const MinimalRegister = React.lazy(() => import("../pages/auth/MinimalRegister"));
const ForgotPassword = React.lazy(() => import("../pages/auth/ForgotPassword"));
const ForgotPasswordPage = React.lazy(() => import("../pages/auth/ForgotPasswordPage"));

// Account Pages
const AccountDashboard = React.lazy(() => import("../pages/account/AccountDashboard"));
const AccountProfile = React.lazy(() => import("../pages/account/AccountProfile"));
const AccountOrdersPage = React.lazy(() => import("../pages/account/AccountOrdersPage"));
const AccountSettings = React.lazy(() => import("../pages/account/AccountSettings"));
const AccountWishlist = React.lazy(() => import("../pages/account/AccountWishlist"));
const OrderDetailsPage = React.lazy(() => import("../pages/account/OrderDetailsPage"));
const Account = React.lazy(() => import("../pages/account/Account"));

// Error Pages
const NotFoundPage = React.lazy(() => import("../pages/errors/NotFoundPage"));

// Loading Component
const PageLoader: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
    <Spinner animation="border" variant="primary" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          {/* Home */}
          <Route index element={<HomePage />} />
          
          {/* Products */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="category/:categoryId" element={<CategoryPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          
          {/* Cart & Checkout */}
          <Route path="cart" element={<CartPage />} />
          <Route 
            path="delivery-address" 
            element={
              <ProtectedRoute>
                <DeliveryAddressPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="order-success" 
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="payment/:orderId" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          
          {/* User Features */}
          <Route 
            path="wishlist" 
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Account - Protected Routes with Shared Layout */}
          <Route 
            path="account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          >
            <Route index element={<AccountDashboard />} />
            <Route path="profile" element={<AccountProfile />} />
            <Route path="orders" element={<AccountOrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="wishlist" element={<AccountWishlist />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
          
          {/* Static Pages */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="help" element={<Help />} />
          <Route path="sell" element={<SellOnBlitXpress />} />
          <Route path="buyer-protection" element={<BuyerProtection />} />
          <Route path="mobile-apps" element={<MobileApps />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="sell" element={<SellOnBlitXpress />} />
          <Route path="buyer-protection" element={<BuyerProtection />} />
          <Route path="mobile-apps" element={<MobileApps />} />
          
          {/* Legacy About Route */}
          <Route path="about-legacy" element={<AboutPage />} />
          
          {/* Register Page (direct access for footer links) */}
          <Route 
            path="register" 
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            } 
          />
          
          {/* Demo Pages */}
          <Route path="toast-demo" element={<ToastDemo />} />
          <Route path="api-test" element={<ApiTestPage />} />
          <Route path="integration-status" element={<ApiIntegrationStatusPage />} />
        </Route>

        {/* MINIMAL Auth Routes - NO LAYOUT DEPENDENCIES */}
        <Route path="/auth/login" element={<MinimalLogin />} />
        <Route path="/auth/register" element={<MinimalRegister />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        
        {/* Direct auth routes - redirect to minimal versions */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

        {/* Error Routes */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

// export const BASE_URL = "https://skills-ug-api.8technologies.net";
export const BASE_URL = "https://blit.blitxpress.com";
// export const BASE_URL = "http://localhost:8888/blitxpress";
export const API_URL = BASE_URL + "/api";
export const TIMEOUT = 8000;
export const MAX_RETRIES = 3;
export const DATE_FORMAT = "YYYY-MM-DD";
export const CURRENCY = "UGX"; 
export const LOCAL_MANIFEST = "LOCAL_MANIFEST";
export const CART_ITEMS = "CART_ITEMS";
export const LOCAL_DISTRICTS = "LOCAL_DISTRICTS";
export const APP_NAME = "BlitXpress";
export const LOCAL_JOBSEEKER_MANIFEST = "LOCAL_JOBSEEKER_MANIFEST";
export const LOGO =
  "https://skills-ug-api.8technologies.net/storage/images/8tech.png";

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "Full Time", label: "Full Time" },
  { value: "Part Time", label: "Part Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

export const DB_TOKEN = "DB_TOKEN";
export const DB_LOGGED_IN_PROFILE = "DB_LOGGED_IN_PROFILE";
export const COUNTRIES = [
  { value: "UG", label: "Uganda" },
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AS", label: "American Samoa" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AI", label: "Anguilla" },
  { value: "AQ", label: "Antarctica" },
  { value: "AG", label: "Antigua and Barbuda" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AW", label: "Aruba" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BS", label: "Bahamas" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BB", label: "Barbados" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BM", label: "Bermuda" },
  { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  { value: "BN", label: "Brunei Darussalam" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "KH", label: "Cambodia" },
  { value: "CM", label: "Cameroon" },
  { value: "CA", label: "Canada" },
  { value: "CV", label: "Cape Verde" },
  { value: "KY", label: "Cayman Islands" },
  { value: "CF", label: "Central African Republic" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" },
  { value: "CG", label: "Congo" },
  { value: "CD", label: "Congo, Democratic Republic" },
  { value: "CR", label: "Costa Rica" },
  { value: "CI", label: "Cote d'Ivoire" },
  { value: "HR", label: "Croatia" },
  { value: "CU", label: "Cuba" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" },
  { value: "DJ", label: "Djibouti" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" },
  { value: "ET", label: "Ethiopia" },
  { value: "FJ", label: "Fiji" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "GA", label: "Gabon" },
  { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GR", label: "Greece" },
  { value: "GD", label: "Grenada" },
  { value: "GU", label: "Guam" },
  { value: "GT", label: "Guatemala" },
  { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GY", label: "Guyana" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HK", label: "Hong Kong" },
  { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KI", label: "Kiribati" },
  { value: "KP", label: "Korea, Democratic People's Republic" },
  { value: "KR", label: "Korea, Republic" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "LA", label: "Lao People's Democratic Republic" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LS", label: "Lesotho" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libya" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MO", label: "Macao" },
  { value: "MK", label: "Macedonia" },
  { value: "MG", label: "Madagascar" },
  { value: "MW", label: "Malawi" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "MH", label: "Marshall Islands" },
  { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" },
  { value: "MX", label: "Mexico" },
  { value: "FM", label: "Micronesia" },
  { value: "MD", label: "Moldova" },
  { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MS", label: "Montserrat" },
  { value: "MA", label: "Morocco" },
  { value: "MZ", label: "Mozambique" },
  { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" },
  { value: "NR", label: "Nauru" },
  { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" },
  { value: "NZ", label: "New Zealand" },
  { value: "NI", label: "Nicaragua" },
  { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" },
  { value: "NU", label: "Niue" },
  { value: "NF", label: "Norfolk Island" },
  { value: "MP", label: "Northern Mariana Islands" },
  { value: "NO", label: "Norway" },
  { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" },
  { value: "PW", label: "Palau" },
  { value: "PS", label: "Palestine" },
  { value: "PA", label: "Panama" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "PR", label: "Puerto Rico" },
  { value: "QA", label: "Qatar" },
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russian Federation" },
  { value: "RW", label: "Rwanda" },
  { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "LC", label: "Saint Lucia" },
  { value: "VC", label: "Saint Vincent and the Grenadines" },
  { value: "WS", label: "Samoa" },
  { value: "SM", label: "San Marino" },
  { value: "ST", label: "Sao Tome and Principe" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SG", label: "Singapore" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "SB", label: "Solomon Islands" },
  { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" },
  { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" },
  { value: "SZ", label: "Swaziland" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syrian Arab Republic" },
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "TL", label: "Timor-Leste" },
  { value: "TG", label: "Togo" },
  { value: "TO", label: "Tonga" },
  { value: "TT", label: "Trinidad and Tobago" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "TM", label: "Turkmenistan" },
  { value: "TV", label: "Tuvalu" },

  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VU", label: "Vanuatu" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Viet Nam" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
];
/*  
0517A1FF
and
F75E1EFF
*/

import { BASE_URL, DB_LOGGED_IN_PROFILE, DB_TOKEN } from "../constants";
import { ProfileModel } from "../models/ProfileModel";
import { http_get } from "./Api";

class Utils {
  //static moneyFormat
  static moneyFormat(value: any) {
    if (value === null) {
      return "0";
    }
    if (value === undefined) {
      return "0";
    }
    if (value === "undefined") {
      return "0";
    }
    //check if it contains . and remove last two digits
    if (value.includes(".")) {
      value = value.split(".")[0];
    }
    //add , after every 3 digits
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  //statric int_parse
  static int_parse(value: any) {
    if (value === null) {
      return 0;
    }
    if (value === undefined) {
      return 0;
    }
    if (value === "undefined") {
      return 0;
    }
    if (value === "") {
      return 0;
    }
    return parseInt(value);
  }

  //isValidMail
  static isValidMail(mail: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  }

  //static to_str
  static to_str(value: any, default_value: any) {
    if (value === null) {
      return default_value;
    }
    if (value === undefined) {
      return default_value;
    }
    if (value === "undefined") {
      return default_value;
    }
    if (value === "") {
      return default_value;
    }
    return value;
  }

  static formatDateTime(interview_scheduled_at: string) {
    var date = new Date(interview_scheduled_at);
    return date.toLocaleString();
  }

  static initials(name: string | null | undefined): string {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return "";
  }

  //formatDate
  static formatDate(date: string) {
    var d = new Date(date);
    return d.toLocaleDateString();
  }

  // Convert an object to JSON string
  static toJson(obj: any) {
    return JSON.stringify(obj);
  }

  //delay static function that takes seconds
  static delay = (seconds: number) =>
    new Promise((resolve) => setTimeout(resolve, seconds * 1000));

  // Convert a JSON string to an object
  static fromJson(jsonStr: any, Model: any) {
    const obj = JSON.parse(jsonStr);
    return new Model(obj);
  }

  // Convert a list of objects to a JSON string
  static toJsonList(objList: any) {
    return JSON.stringify(objList);
  }

  //removeFromDatabase
  static removeFromDatabase(DB_PATH = "") {
    localStorage.removeItem(DB_PATH);
  }

  // Save an object to the local database
  static saveToDatabase(local_path: any, obj: any) {
    if (obj === null) {
      return;
    }
    if (obj === undefined) {
      return;
    }
    if (obj === "undefined") {
      return;
    }
    try {
      localStorage.setItem(local_path, JSON.stringify(obj));
    } catch (error) {
      return;
    }
  }

  // Load an object from the local database by id
  static loadFromDatabase(DB_PATH = "") {
    // load from local db
    var data = localStorage.getItem(DB_PATH);
    if (data === null) {
      return null;
    }
    if (data === undefined) {
      return null;
    }
    if (data === "undefined") {
      return null;
    }
    if (data === "") {
      return null;
    }
    var results = null;
    try {
      results = JSON.parse(data);
    } catch (error) {
      return null;
    }
    return results;
  }

  // Generate a unique identifier
  static generateUniqueId() {
    return "_" + Math.random().toString(36).substring(2, 11);
  }

  //save profile
  static saveProfile(profile: ProfileModel) {
    try {
      const lsValue = JSON.stringify(profile);
      localStorage.setItem(DB_LOGGED_IN_PROFILE, lsValue);
    } catch (error) {
      alert("" + error);
    }
  }

  static img(url: any) {
    var default_img = BASE_URL + "/storage/images/default.png";
    if (url === null) {
      return default_img;
    }
    if (url === undefined) {
      return default_img;
    }
    if (url === "undefined") {
      return default_img;
    }
    if (url === "") {
      return default_img;
    }
    if (url === "null") {
      return default_img;
    }

    var last_segment = "";
    try {
      last_segment = url.split("/").pop() || "";
    } catch (error) {
      confirm("Error: " + error);
      return "";
    }
    if (last_segment === "undefined") {
      return "";
    }
    if (last_segment === "null") {
      return "";
    }
    if (last_segment === "") {
      return "";
    }
    if (last_segment === null) {
      return "";
    }
    if (last_segment === undefined) {
      return "";
    }
    return BASE_URL + "/storage/images/" + last_segment;
  }

  static file(url: any) {
    var default_img = BASE_URL + "/storage/images/default.png";
    if (url === null) {
      return default_img;
    }
    if (url === undefined) {
      return default_img;
    }
    if (url === "undefined") {
      return default_img;
    }
    if (url === "") {
      return default_img;
    }
    if (url === "null") {
      return default_img;
    }

    var last_segment = "";
    try {
      last_segment = url.split("/").pop() || "";
    } catch (error) {
      confirm("Error: " + error);
      return "";
    }
    if (last_segment === "undefined") {
      return "";
    }
    if (last_segment === "null") {
      return "";
    }
    if (last_segment === "") {
      return "";
    }
    if (last_segment === null) {
      return "";
    }
    if (last_segment === undefined) {
      return "";
    }
    return BASE_URL + "/storage/files/" + last_segment;
  }

  moneyFormat(any: string): string { 
    const str = String(any);
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

export default Utils;


// src/app/services/ManifestService.ts

import { ApiService } from './ApiService';
import BannerModel from '../models/BannerModel';
import CategoryModel from '../models/CategoryModel';
import ProductModel from '../models/ProductModel';
import ToastService from './ToastService';
import VendorModel from '../models/VendorModel';

/**
 * Manifest interface matching the Flutter app's structure
 */
export interface HomepageManifest {
  banners: BannerModel[];
  categories: CategoryModel[];
  topProducts: ProductModel[];
  featuredCategories: CategoryModel[];
  isLoading: boolean;
  lastUpdated: Date;
}

/**
 * Manifest Service that harmonizes homepage data loading
 * Inspired by the Flutter app's manifest logic
 */
export class ManifestService {
  private static instance: ManifestService;
  private cachedManifest: HomepageManifest | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheTime: number = 0;

  private constructor() {}

  static getInstance(): ManifestService {
    if (!ManifestService.instance) {
      ManifestService.instance = new ManifestService();
    }
    return ManifestService.instance;
  }

  /**
   * Load homepage manifest with all required data
   * This mirrors the Flutter app's manifest loading approach
   */
  async loadHomepageManifest(forceRefresh = false): Promise<HomepageManifest> {
    const now = Date.now();
    
    // Return cached data if valid and not forcing refresh
    if (
      !forceRefresh &&
      this.cachedManifest &&
      (now - this.lastCacheTime) < this.cacheExpiry
    ) {
      return this.cachedManifest;
    }

    try {
      const manifest: HomepageManifest = {
        banners: [],
        categories: [],
        topProducts: [],
        featuredCategories: [],
        isLoading: true,
        lastUpdated: new Date(),
      };

      // Load all data concurrently like the Flutter app
      const [
        bannersData,
        categoriesData,
        vendorsData,
        topProductsData,
      ] = await Promise.allSettled([
        this.loadBanners(),
        this.loadCategories(),
        this.loadVendors(),
        this.loadTopProducts(),
      ]);

      // Process banners
      if (bannersData.status === 'fulfilled') {
        manifest.banners = bannersData.value;
      } else {
        console.warn('Failed to load banners:', bannersData.reason);
      }

      // Process categories
      if (categoriesData.status === 'fulfilled') {
        manifest.categories = categoriesData.value;
        manifest.featuredCategories = this.getFeaturedCategories(categoriesData.value);
      } else {
        console.warn('Failed to load categories:', categoriesData.reason);
      }

      // Process top products
      if (topProductsData.status === 'fulfilled') {
        manifest.topProducts = topProductsData.value;
      } else {
        console.warn('Failed to load top products:', topProductsData.reason);
      }

      manifest.isLoading = false;

      // Cache the result
      this.cachedManifest = manifest;
      this.lastCacheTime = now;

      return manifest;
    } catch (error) {
      console.error('Failed to load homepage manifest:', error);
      ToastService.error('Failed to load homepage data');
      
      // Return a fallback manifest
      return {
        banners: [],
        categories: [],
        topProducts: [],
        featuredCategories: [],
        isLoading: false,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Load banners for carousel
   * This matches the Flutter implementation exactly:
   * - Get all categories from API
   * - Filter categories where show_in_banner.toLowerCase() == 'yes'
   * - Convert these categories to banner models
   */
  private async loadBanners(): Promise<BannerModel[]> {
    try {
      console.log('🎠 Loading banners from API...');
      
      // Use the existing getBannerCategories method which filters by show_in_banner
      const bannerCategories = await ApiService.getBannerCategories();

      console.log('🎠 Banner categories found:', bannerCategories.length);
      console.log('🎠 Banner categories data:', bannerCategories.map(cat => ({
        id: cat.id,
        name: cat.category,
        show_in_banner: cat.show_in_banner,
        banner_image: cat.banner_image
      })));
      
      // Convert banner categories to banner models
      const categoryBanners = bannerCategories
        .filter(cat => {
          const hasImage = cat.banner_image && cat.banner_image.trim() !== '';
          console.log(`🎠 Category "${cat.category}" has banner image:`, hasImage, cat.banner_image);
          return hasImage;
        })
        .map((cat, index) => {
          const banner = BannerModel.fromApiData({
            id: cat.id,
            title: cat.category,
            subtitle: `Shop ${cat.category}`,
            description: `Discover amazing ${cat.category.toLowerCase()} products`,
            image: cat.banner_image,
            action_type: 'category',
            action_value: cat.id.toString(),
            is_active: 'Yes',
            position: index,
          });
          console.log(`🎠 Created banner for "${cat.category}":`, banner.getImageUrl());
          return banner;
        });

      // If no category banners found, return empty array (no fallback dummy data)
      if (categoryBanners.length === 0) {
        console.log('🎠 No category banners found - returning empty array (no dummy data)');
        return [];
      }

      console.log('🎠 Successfully created banners from categories:', categoryBanners.length);
      return BannerModel.sortByPosition(categoryBanners);
    } catch (error) {
      console.error('🎠 Failed to load banners from categories:', error);
      return []; // Return empty array instead of fallback dummy data
    }
  }

  /**
   * Create fallback promotional banners
   */
  private createFallbackBanners(): BannerModel[] {
    const fallbackBanners = [
      {
        id: 1,
        title: 'Welcome to BlitXpress',
        subtitle: 'Your one-stop shop',
        description: 'Discover amazing products at unbeatable prices',
        image: 'media/auth/bg1.jpg',
        action_type: 'url' as const,
        action_value: '/products',
        is_active: 'Yes' as const,
        position: 1,
      },
      {
        id: 2,
        title: 'Super Deals',
        subtitle: 'Up to 50% Off',
        description: 'Limited time offers on selected items',
        image: 'media/auth/bg2.jpg',
        action_type: 'url' as const,
        action_value: '/products?sort_by=price_1',
        is_active: 'Yes' as const,
        position: 2,
      },
      {
        id: 3,
        title: 'New Arrivals',
        subtitle: 'Fresh Products',
        description: 'Check out our latest additions',
        image: 'media/auth/bg3.jpg',
        action_type: 'url' as const,
        action_value: '/products?sort_by=date_added',
        is_active: 'Yes' as const,
        position: 3,
      },
    ];

    console.log('🎠 Created fallback banners:', fallbackBanners.length);
    return fallbackBanners.map(data => BannerModel.fromApiData(data));
  }

  /**
   * Load categories for display
   */
  private async loadCategories(): Promise<CategoryModel[]> {
    return await ApiService.getCategories();
  }

  /**
   * Load vendors for display
   */
  private async loadVendors(): Promise<VendorModel[]> {
    const vendors = await ApiService.getVendors();
    return vendors.slice(0, 12); // Limit to 12 vendors
  }

  /**
   * Load top/featured products
   */
  private async loadTopProducts(): Promise<ProductModel[]> {
    const response = await ApiService.getProducts({
      page: 1,
      limit: 12,
      sort_by: 'metric',
      sort_order: 'desc',
      in_stock: true,
    });
    return response.data;
  }

  /**
   * Get featured categories for special display
   * This matches the Flutter implementation:
   * - Filter categories where show_in_categories == 'Yes'
   * - Limit to 8 categories (like Flutter)
   */
  private getFeaturedCategories(categories: CategoryModel[]): CategoryModel[] {
    console.log('📂 Total categories received:', categories.length);
    
    const featuredCats = categories
      .filter(cat => {
        const isShown = cat.isShownInCategories();
        console.log(`📂 Category "${cat.category}" shown in categories:`, isShown, cat.show_in_categories);
        return isShown;
      })
      .slice(0, 8); // Show top 8 categories like Flutter
    
    console.log('📂 Featured categories found:', featuredCats.length);
    console.log('📂 Featured categories:', featuredCats.map(cat => cat.category));
    return featuredCats;
  }

  /**
   * Clear cache to force refresh
   */
  clearCache(): void {
    this.cachedManifest = null;
    this.lastCacheTime = 0;
  }

  /**
   * Get cached manifest if available
   */
  getCachedManifest(): HomepageManifest | null {
    const now = Date.now();
    if (
      this.cachedManifest &&
      (now - this.lastCacheTime) < this.cacheExpiry
    ) {
      return this.cachedManifest;
    }
    return null;
  }
}

// Export singleton instance
export default ManifestService.getInstance();

