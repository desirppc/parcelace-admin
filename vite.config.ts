import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8084,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'query-vendor': ['@tanstack/react-query'],
          'utils-vendor': ['lucide-react', 'next-themes'],
          
          // Feature chunks
          'auth': [
            './src/pages/Login',
            './src/pages/SignUp',
            './src/pages/ForgotPassword',
            './src/pages/MobileOTPVerification',
            './src/pages/OTPVerification',
            './src/pages/ResetPassword'
          ],
          'dashboard': [
            './src/pages/Index',
            './src/components/OrdersPage',
            './src/components/ShipmentPage',
            './src/components/ParcelAceAI',
            './src/pages/AnalyticsTest'
          ],
          'tracking': [
            './src/components/TrackingPage',
            './src/components/TrackingV2Page',
            './src/pages/PublicTracking',
            './src/pages/TrackingTemplate'
          ],
          'onboarding': [
            './src/components/OnboardingWizard'
          ],
          'finance': [],
          'settings': []
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
}));
