# Authentication & Route Protection Test Plan

## Overview
This document outlines the test scenarios for the newly implemented authentication system and route protection in the e-commerce platform.

## 🚀 Quick Test Instructions

### 1. Start the Application
```bash
cd /Users/mac/Desktop/github/shop-js
npm run dev
```
The app should start on `http://localhost:5175/` (or another port if 5175 is busy).

### 2. Test Authentication Flow

#### A. Test Public Access (Not Logged In)
1. **Navigate to Home Page (`/`)**
   - ✅ Should load successfully
   - ✅ Navigation should show "Login" and "Register" links
   - ✅ Should NOT show "Account", "Wishlist", or "Logout" links

2. **Try to Access Protected Routes**
   - Navigate to `/account` → Should redirect to `/auth/login`
   - Navigate to `/checkout` → Should redirect to `/auth/login`
   - Navigate to `/wishlist` → Should redirect to `/auth/login`
   - Navigate to `/order-success` → Should redirect to `/auth/login`

3. **Access Public-Only Routes**
   - Navigate to `/auth/login` → Should load login page
   - Navigate to `/auth/register` → Should load registration page

#### B. Test Registration
1. **Go to Registration Page (`/auth/register`)**
   - Fill out the form with valid data:
     - First Name: "John"
     - Last Name: "Doe"
     - Email: "john.doe@example.com"
     - Password: "password123"
     - Confirm Password: "password123"
   - Click "Create Account"
   - ✅ Should show loading spinner during registration
   - ✅ Should show success notification
   - ✅ Should redirect to home page (`/`)
   - ✅ Navigation should now show user's name and logout option

#### C. Test Logout
1. **Click Logout Button**
   - ✅ Should show confirmation or immediately log out
   - ✅ Should redirect to home page
   - ✅ Navigation should revert to showing "Login" and "Register"

#### D. Test Login
1. **Go to Login Page (`/auth/login`)**
   - Use demo credentials:
     - Email: "demo@example.com"
     - Password: "password"
   - Click "Sign In"
   - ✅ Should show loading spinner during login
   - ✅ Should show welcome notification
   - ✅ Should redirect to home page
   - ✅ Navigation should show user account options

#### E. Test Protected Route Access (While Logged In)
1. **Navigate to Protected Routes**
   - `/account` → Should load account dashboard
   - `/account/profile` → Should load profile page
   - `/checkout` → Should load checkout page
   - `/wishlist` → Should load wishlist page
   - `/order-success` → Should load order success page

#### F. Test Public-Only Route Redirect (While Logged In)
1. **Try to Access Auth Pages While Logged In**
   - Navigate to `/auth/login` → Should redirect to `/`
   - Navigate to `/auth/register` → Should redirect to `/`
   - Navigate to `/auth/forgot-password` → Should redirect to `/`

#### G. Test Navigation Behavior
1. **Desktop Navigation**
   - When not logged in: Shows Login, Register
   - When logged in: Shows Account (with user's name), Wishlist, Logout

2. **Mobile Navigation**
   - Toggle mobile menu
   - Verify same conditional rendering as desktop

3. **Search Functionality**
   - Search bar should be accessible in all states
   - Search should work regardless of authentication status

## 🧪 Advanced Test Scenarios

### 1. Route Protection with Intended Destination
1. While not logged in, try to access `/account/profile`
2. Should redirect to `/auth/login`
3. After successful login, should redirect back to `/account/profile`

### 2. Persistent Login State
1. Log in successfully
2. Refresh the page
3. Should remain logged in (localStorage persistence)
4. Close browser tab and reopen
5. Should still be logged in

### 3. Form Validation
1. **Login Form**
   - Try submitting with empty fields
   - Try invalid email format
   - Try password less than 6 characters

2. **Registration Form**
   - Try submitting with empty required fields
   - Try mismatched password confirmation
   - Try invalid email format

### 4. Error Handling
1. **Network Simulation**
   - Simulate slow network (login/registration should show loading states)
   - The mock API includes delays to test loading states

## 🎯 Expected Results Summary

### Authentication State Management
- ✅ Redux store properly manages authentication state
- ✅ localStorage persistence works correctly
- ✅ State is restored on page refresh

### Route Protection
- ✅ Protected routes redirect to login when not authenticated
- ✅ Public-only routes redirect to home when authenticated
- ✅ Intended destination is preserved during authentication flow

### Navigation Behavior
- ✅ Dynamic navigation based on authentication state
- ✅ Consistent behavior across desktop, mobile, and off-canvas menus
- ✅ User information displayed correctly when logged in

### User Experience
- ✅ Loading states during authentication
- ✅ Success/error notifications
- ✅ Form validation and error messages
- ✅ Responsive design maintained

## 🐛 Common Issues to Watch For

1. **Navigation Links**: Ensure all conditional navigation links update correctly
2. **Route Loops**: Watch for infinite redirects between protected and auth routes
3. **State Persistence**: Verify localStorage is properly saving/loading auth state
4. **Form Validation**: Check that all form validation messages appear correctly
5. **Mobile Menu**: Ensure mobile navigation toggles and shows correct links

## 🔧 Mock Authentication Notes

- The system uses mock authentication for testing
- Any email/password combination will work for login
- Registration creates a mock user with the provided information
- No real API calls are made - everything is simulated with delays

## ✅ Test Completion Checklist

- [ ] All public routes accessible without authentication
- [ ] All protected routes redirect to login when not authenticated
- [ ] Registration flow works and logs user in
- [ ] Login flow works with demo credentials
- [ ] Logout clears state and redirects appropriately
- [ ] Navigation updates correctly based on auth state
- [ ] Protected routes accessible after authentication
- [ ] Auth pages redirect to home when already logged in
- [ ] State persists across page refreshes
- [ ] Mobile navigation works correctly
- [ ] Form validation displays appropriate errors
- [ ] Loading states appear during auth operations
- [ ] Success/error notifications show correctly

---

**Status**: ✅ All core authentication and route protection features implemented and ready for testing.
