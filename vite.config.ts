import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    base: '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5173,
      host: true,
      hmr: { overlay: true },
      watch: { usePolling: true },
    },

    preview: {
      port: 4173,
      host: true,
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,         // No source maps in production
      minify: 'terser',
      target: 'es2015',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,

      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          passes: 2,
        },
        format: {
          comments: false,
        },
      },

      rollupOptions: {
        output: {
          // Stable chunk filenames for long-term caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? ''
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.(woff2?|ttf|eot)$/.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            if (/\.css$/.test(name)) {
              return 'assets/css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },

          manualChunks: (id) => {
            // Core React
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react'
            }
            // Router
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
              return 'vendor-router'
            }
            // Redux
            if (id.includes('node_modules/@reduxjs/') || id.includes('node_modules/react-redux/') || id.includes('node_modules/redux/')) {
              return 'vendor-redux'
            }
            // Query
            if (id.includes('node_modules/@tanstack/')) {
              return 'vendor-query'
            }
            // UI icons
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons'
            }
            // Bootstrap (legacy)
            if (id.includes('node_modules/bootstrap/') || id.includes('node_modules/react-bootstrap/')) {
              return 'vendor-bootstrap'
            }
            // Media / video
            if (id.includes('node_modules/hls.js/') || id.includes('node_modules/react-player/')) {
              return 'vendor-media'
            }
            // Swiper
            if (id.includes('node_modules/swiper/')) {
              return 'vendor-swiper'
            }
            // Framer motion
            if (id.includes('node_modules/framer-motion/')) {
              return 'vendor-motion'
            }
            // Sentry
            if (id.includes('node_modules/@sentry/')) {
              return 'vendor-sentry'
            }
          },
        },
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'axios',
        'lucide-react',
      ],
    },
  }
})
