/// <reference types="vite/client" />

// Extend React's video element types to include referrerPolicy (valid HTML attribute)
declare namespace React {
  interface VideoHTMLAttributes<T> {
    referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url' | '';
  }
}
