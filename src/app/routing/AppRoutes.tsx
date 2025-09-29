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
const ProductDetailPageWrapper = React.lazy(() => import("../pages/ProductDetailPage/ProductDetailPageWrapper"));
const ProductsPage = React.lazy(() => import("../pages/ProductsPage"));
const MoviesPage = React.lazy(() => import("../pages/MoviesPage"));
const WatchPage = React.lazy(() => import("../pages/WatchPage"));
const CategoryPage = React.lazy(() => import("../pages/CategoryPage"));
const CartPage = React.lazy(() => import("../pages/CartPage"));
const CheckoutPage = React.lazy(() => import("../pages/CheckoutPage"));
const DeliveryAddressPage = React.lazy(() => import("../pages/DeliveryAddressPage"));
const OrderSuccessPage = React.lazy(() => import("../pages/OrderSuccessPage"));
const PaymentPage = React.lazy(() => import("../pages/PaymentPage"));
const PaymentCallbackPage = React.lazy(() => import("../pages/PaymentCallbackPage"));
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
const LandingPage = React.lazy(() => import("../pages/auth/LandingPage"));

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
          <Route path="product/:id" element={<ProductDetailPageWrapper />} />
          <Route path="category/:categoryId" element={<CategoryPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          
          {/* Movies */}
          <Route path="movies" element={<MoviesPage />} />
          <Route path="movies/:id" element={<WatchPage />} />
          <Route path="watch/:id" element={<WatchPage />} />
          
          {/* Movie-related features - using existing components for now */}
          <Route 
            path="watchlist" 
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } 
          />
          <Route path="downloads" element={<MoviesPage />} />
          <Route path="premium" element={<MoviesPage />} />
          
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
          <Route 
            path="payment/callback/:orderId" 
            element={
              <ProtectedRoute>
                <PaymentCallbackPage />
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
          <Route path="test" element={<ApiTestPage />} />
          <Route path="integration-status" element={<ApiIntegrationStatusPage />} />
        </Route>

        {/* Landing Page for Non-Authenticated Users */}
        <Route 
          path="/landing" 
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          } 
        />
        
        {/* UgFlix Streaming Platform Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
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
