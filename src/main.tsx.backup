// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Force light mode - disable dark mode permanently
document.documentElement.setAttribute('data-bs-theme', 'light');
document.documentElement.style.colorScheme = 'light';

// Prevent any theme changes
const preventDarkMode = () => {
  document.documentElement.setAttribute('data-bs-theme', 'light');
  document.documentElement.style.colorScheme = 'light';
};

// Monitor for any theme changes and override them
const observer = new MutationObserver(preventDarkMode);
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-bs-theme', 'data-theme', 'class']
});

// Styles - Bootstrap and Icons
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Global Styles - Main theme
import "./app/styles/main.css";

// App Component
import App from "./app/App";
import { store } from "./app/store/store";

// Debug utilities for development
if (import.meta.env.DEV) {
  import('./app/utils/debugAuth').then(({ debugAuthStatus }) => {
    (window as any).debugAuth = debugAuthStatus;
  });
  
  import('./app/utils/testLogin').then(({ testLogin }) => {
    (window as any).testLogin = testLogin;
  });
  
  import('./app/utils/authDebugger').then(({ debugLogin, manualAuth }) => {
    (window as any).debugLogin = debugLogin;
    (window as any).manualAuth = manualAuth;
  });
  
  import('./app/utils/quickLoginTest').then(({ quickLogin, loginInstructions }) => {
    (window as any).quickLogin = quickLogin;
    (window as any).loginInstructions = loginInstructions;
  });
}

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

root.render(
  <React.StrictMode>
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
        {/* Only show React Query DevTools in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);