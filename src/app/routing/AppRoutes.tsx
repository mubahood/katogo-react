// src/app/routing/AppRoutes.tsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

// Layouts
import MainLayout from "../components/Layout/MainLayout";
import AuthLayout from "../components/Layout/AuthLayout";
import SubscriptionLayout from "../components/Layout/SubscriptionLayout";

// Route Guards
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import PublicOnlyRoute from "../components/Auth/PublicOnlyRoute";
import SubscriptionProtectedRoute from "../components/Auth/SubscriptionProtectedRoute";

// Lazy loaded components for better performance
const HomePage = React.lazy(() => import("../pages/HomePage"));
const StreamingHomePage = React.lazy(() => import("../pages/home/StreamingHomePage"));
const LiveTVPage = React.lazy(() => import("../pages/liveTV/LiveTVPage"));
const LiveStationPage = React.lazy(() => import("../pages/liveTV/LiveStationPage"));
const BlogPage = React.lazy(() => import("../pages/blog/BlogPage"));
const BlogPostPage = React.lazy(() => import("../pages/blog/BlogPostPage"));
const NewsPage = React.lazy(() => import("../pages/news/NewsPage"));
const NewsDetailPage = React.lazy(() => import("../pages/news/NewsDetailPage"));
const ProductDetailPageWrapper = React.lazy(() => import("../pages/ProductDetailPage/ProductDetailPageWrapper"));
const ProductsPage = React.lazy(() => import("../pages/ProductsPage"));
const MoviesPage = React.lazy(() => import("../pages/Movies/MoviesPage"));
const WatchPage = React.lazy(() => import("../pages/WatchPage"));
const SeriesDetailPage = React.lazy(() => import("../pages/Movies/SeriesDetailPage"));
const MovieDetailPage = React.lazy(() => import("../pages/Movies/MovieDetailPage"));
const CategoryPage = React.lazy(() => import("../pages/CategoryPage"));
const CartPage = React.lazy(() => import("../pages/CartPage"));
const CheckoutPage = React.lazy(() => import("../pages/CheckoutPage"));
const DeliveryAddressPage = React.lazy(() => import("../pages/DeliveryAddressPage"));
const OrderSuccessPage = React.lazy(() => import("../pages/OrderSuccessPage"));
const PaymentPage = React.lazy(() => import("../pages/PaymentPage"));
const PaymentCallbackPage = React.lazy(() => import("../pages/PaymentCallbackPage"));
const SearchResultsPage = React.lazy(() => import("../pages/SearchResultsPage"));
const AboutPage = React.lazy(() => import("../pages/AboutPage"));
const ContactPage = React.lazy(() => import("../pages/ContactPage"));
const FAQPage = React.lazy(() => import("../pages/FAQPage"));

// Legal Pages
const TermsPage = React.lazy(() => import("../pages/legal/TermsPage"));
const PrivacyPage = React.lazy(() => import("../pages/legal/PrivacyPage"));

// Static Pages
const SellOnUgFlix = React.lazy(() => import("../pages/static/SellOnUgFlix"));
const BuyerProtection = React.lazy(() => import("../pages/static/BuyerProtection"));
const Help = React.lazy(() => import("../pages/static/Help"));
const MobileApps = React.lazy(() => import("../pages/static/MobileApps"));
const About = React.lazy(() => import("../pages/static/About"));
const Terms = React.lazy(() => import("../pages/static/Terms"));
const Privacy = React.lazy(() => import("../pages/static/Privacy"));
const Contact = React.lazy(() => import("../pages/static/Contact"));

// Demo Pages
const ToastDemo = React.lazy(() => import("../components/Demo/ToastDemo"));

// Auth Pages
const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPassword = React.lazy(() => import("../pages/auth/ForgotPassword"));
const ForgotPasswordPage = React.lazy(() => import("../pages/auth/ForgotPasswordPage"));
const LandingPage = React.lazy(() => import("../pages/auth/LandingPage"));

// Subscription Pages - New comprehensive subscription system
const SubscriptionPlans = React.lazy(() => import("../pages/SubscriptionPlans"));
const PendingSubscription = React.lazy(() => import("../pages/PendingSubscription"));
const PaymentResult = React.lazy(() => import("../pages/PaymentResult"));
const SubscriptionHistory = React.lazy(() => import("../pages/SubscriptionHistory"));
const MySubscriptions = React.lazy(() => import("../pages/MySubscriptions"));

// Account Pages - Direct imports to fix dynamic import issues
// Account Pages - Lazy-loaded for better code splitting
const AccountDashboard = React.lazy(() => import("../pages/account/AccountDashboard"));
const AccountProfile = React.lazy(() => import("../pages/account/AccountProfile"));
const ProfileEdit = React.lazy(() => import("../pages/account/ProfileEdit"));
const AccountOrdersPage = React.lazy(() => import("../pages/account/AccountOrdersPage"));
const AccountSettings = React.lazy(() => import("../pages/account/AccountSettings"));
const AccountSubscriptionManagement = React.lazy(() => import("../pages/account/AccountSubscriptionManagement"));
const AccountWatchHistory = React.lazy(() => import("../pages/account/AccountWatchHistory"));
const AccountWatchlist = React.lazy(() => import("../pages/account/AccountWatchlist"));
const AccountMovieLikes = React.lazy(() => import("../pages/account/AccountMovieLikes"));
const AccountProducts = React.lazy(() => import("../pages/account/AccountProducts"));
const AccountChats = React.lazy(() => import("../pages/account/AccountChats"));
const OrderDetailsPage = React.lazy(() => import("../pages/account/OrderDetailsPage"));
const Account = React.lazy(() => import("../pages/account/Account"));
const ProductPost = React.lazy(() => import("../pages/account/ProductPost"));
const MyProducts = React.lazy(() => import("../pages/account/MyProducts"));
const AccountBlockedUsersPage = React.lazy(() => import("../pages/account/AccountBlockedUsersPage"));
const AccountMyReportsPage = React.lazy(() => import("../pages/account/AccountMyReportsPage"));

// Connect/Dating Pages
const ConnectDiscover = React.lazy(() => import("../pages/connect/ConnectDiscover"));
const ConnectProfile = React.lazy(() => import("../pages/connect/ConnectProfile"));

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
          {/* Home - Public (listing & preview are free) */}
          <Route index element={<StreamingHomePage />} />
          
          {/* Products - Protected */}
          <Route 
            path="products" 
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="product/:id" 
            element={
              <ProtectedRoute>
                <ProductDetailPageWrapper />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="category/:categoryId" 
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="search" 
            element={
                <SearchResultsPage />
            } 
          />

          {/* Live TV - Protected + Subscription */}
          <Route
            path="live"
            element={
              <ProtectedRoute>
                <SubscriptionProtectedRoute>
                  <LiveTVPage />
                </SubscriptionProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="live/:id"
            element={
              <ProtectedRoute>
                <SubscriptionProtectedRoute>
                  <LiveStationPage />
                </SubscriptionProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Blog - Public (no subscription required) */}
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:id" element={<BlogPostPage />} />
          
          {/* Local News - Public (WordPress API) */}
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          
          {/* Movies & Series Listing - Public (browsing open to all) */}
          <Route path="movies" element={<MoviesPage contentType="Movie" />} />
          <Route path="series" element={<MoviesPage contentType="Series" />} />
          <Route 
            path="movies/:id" 
            element={
              <ProtectedRoute>
                <SubscriptionProtectedRoute>
                  <WatchPage />
                </SubscriptionProtectedRoute>
              </ProtectedRoute>
            } 
          />
          <Route path="series/:id" element={<SeriesDetailPage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route 
            path="watch/:id" 
            element={
              <ProtectedRoute>
                <SubscriptionProtectedRoute>
                  <WatchPage />
                </SubscriptionProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Movie-related features - Protected redirects */}
          <Route 
            path="watchlist" 
            element={
              <ProtectedRoute>
                <Navigate to="/account/watchlist" replace />
              </ProtectedRoute>
            }
          />
          <Route 
            path="downloads" 
            element={
              <ProtectedRoute>
                <MoviesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="premium" 
            element={
              <ProtectedRoute>
                <MoviesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Cart & Checkout - Protected */}
          <Route 
            path="cart" 
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } 
          />
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
          
          {/* Redirect old chat route to new account chats */}
                    {/* Redirect old chat route to new account chats */}
          <Route 
            path="chat" 
            element={
              <ProtectedRoute>
                <Navigate to="/account/chats" replace />
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
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="subscriptions" element={<AccountSubscriptionManagement />} />
            <Route path="watchlist" element={<SubscriptionProtectedRoute><AccountWatchlist /></SubscriptionProtectedRoute>} />
            <Route path="history" element={<SubscriptionProtectedRoute><AccountWatchHistory /></SubscriptionProtectedRoute>} />
            <Route path="likes" element={<SubscriptionProtectedRoute><AccountMovieLikes /></SubscriptionProtectedRoute>} />
            <Route path="products" element={<MyProducts />} />
            <Route path="products/new" element={<ProductPost />} />
            <Route path="products/edit/:id" element={<ProductPost />} />
            <Route path="chats" element={<AccountChats />} />
            <Route path="orders" element={<AccountOrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="settings" element={<AccountSettings />} />
              <Route path="blocked-users" element={<AccountBlockedUsersPage />} />
              <Route path="my-reports" element={<AccountMyReportsPage />} />
          </Route>
          
          {/* Connect/Dating - Protected Routes */}
          <Route 
            path="connect" 
            element={
              <ProtectedRoute>
                <ConnectDiscover />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="connect/profile/:userId" 
            element={
              <ProtectedRoute>
                <ConnectProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Static Pages */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="help" element={<Help />} />
          <Route path="sell" element={<SellOnUgFlix />} />
          <Route path="buyer-protection" element={<BuyerProtection />} />
          <Route path="mobile-apps" element={<MobileApps />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="sell" element={<SellOnUgFlix />} />
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
        
        {/* UgFlix Streaming Platform Auth Routes - Public Only */}
        <Route 
          path="/auth/login" 
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/auth/register" 
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/auth/forgot-password" 
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          } 
        />
        
        {/* Direct auth routes - redirect to auth versions with PublicOnlyRoute */}
        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute>
              <Navigate to="/auth/login" replace />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicOnlyRoute>
              <Navigate to="/auth/register" replace />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicOnlyRoute>
              <Navigate to="/auth/forgot-password" replace />
            </PublicOnlyRoute>
          } 
        />

        {/* Subscription System Routes - COMPLETELY SEPARATE from MainLayout */}
        <Route path="subscription" element={<SubscriptionLayout />}>
          {/* Public - Anyone can view subscription plans */}
          <Route path="plans" element={<SubscriptionPlans />} />
          
          {/* Protected - Pending subscription management */}
          <Route 
            path="pending" 
            element={
              <ProtectedRoute>
                <PendingSubscription />
              </ProtectedRoute>
            } 
          />
          
          {/* Public - Pesapal redirects here after payment (no auth required) */}
          <Route path="callback" element={<PaymentResult />} />
          
          {/* Protected - Requires authentication */}
          <Route 
            path="my-subscriptions" 
            element={
              <ProtectedRoute>
                <MySubscriptions />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="history" 
            element={
              <ProtectedRoute>
                <SubscriptionHistory />
              </ProtectedRoute>
              } 
          />
        </Route>

        {/* Error Routes */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
