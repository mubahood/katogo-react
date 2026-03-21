// src/main.tsx
import React from "react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { initializeThemeFromStorage } from "./app/hooks/useTheme";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// ERR-02: Sentry initialization (only when DSN is provided)
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 0.0,
    replaysOnErrorSampleRate: 0,
    integrations: [],
  });
}

// Apply persisted theme before the first render to avoid theme flash.
initializeThemeFromStorage();

// Styles - Bootstrap and Icons
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// UGFLIX Master CSS Architecture v2.0
import "./app/styles/index.css";

// App Component
import App from "./app/App";
import { store } from "./app/store/store";

// Debug utilities for development - TEMPORARILY DISABLED
// if (import.meta.env.DEV) {
//   import('./app/utils/debugAuth').then(({ debugAuthStatus }) => {
//     (window as any).debugAuth = debugAuthStatus;
//   });
  
//   import('./app/utils/testLogin').then(({ testLogin }) => {
//     (window as any).testLogin = testLogin;
//   });
  
//   import('./app/utils/authDebugger').then(({ debugLogin, manualAuth }) => {
//     (window as any).debugLogin = debugLogin;
//     (window as any).manualAuth = manualAuth;
//   });
  
//   import('./app/utils/quickLoginTest').then(({ quickLogin, loginInstructions }) => {
//     (window as any).quickLogin = quickLogin;
//     (window as any).loginInstructions = loginInstructions;
//   });
// }

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);

const AppProviders = (
  <HelmetProvider>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  </HelmetProvider>
);

const AppCore = GOOGLE_CLIENT_ID ? (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {AppProviders}
  </GoogleOAuthProvider>
) : (
  AppProviders
);

if (!GOOGLE_CLIENT_ID && import.meta.env.DEV) {
  console.warn("Google OAuth is disabled: VITE_GOOGLE_CLIENT_ID is not set.");
}

// Conditionally wrap with StrictMode only in development
const AppWrapper = import.meta.env.DEV ? (
  <React.StrictMode>{AppCore}</React.StrictMode>
) : AppCore;

root.render(AppWrapper);