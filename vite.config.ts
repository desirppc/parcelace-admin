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
            './src/components/WarehouseScreen',
            './src/components/ParcelAceAI',
            './src/pages/AnalyticsTest'
          ],
          'tracking': [
            './src/components/TrackingPage',
            './src/components/TrackingV2Page',
            './src/pages/PublicTracking',
            './src/pages/TrackingTemplate',
            './src/pages/CustomiseTrackingPage'
          ],
          'onboarding': [
            './src/components/OnboardingWizard',
            './src/pages/OnboardingChecklist',
            './src/pages/OnboardingPrepaidOrders',
            './src/pages/OnboardingKYC',
            './src/pages/OnboardingPrepaidShipments',
            './src/pages/OnboardingReverseShipments',
            './src/pages/OnboardingShipmentTracking',
            './src/pages/OnboardingCourierSelection',
            './src/pages/OnboardingCODRemittance',
            './src/pages/OnboardingWalletTransaction',
            './src/pages/OnboardingEarlyCOD',
            './src/pages/OnboardingInvoice',
            './src/pages/OnboardingBilling',
            './src/pages/OnboardingTrackingPage',
            './src/pages/OnboardingSupportDashboard',
            './src/pages/OnboardingCreateTicket',
            './src/pages/OnboardingShopifyIntegration',
            './src/pages/OnboardingReturnPro'
          ],
          'finance': [
            './src/pages/CODRemittanceDetails',
            './src/pages/DailyReport',
            './src/pages/AdminEmailReportsPage'
          ],
          'support': [
            './src/pages/NotifyAce',
            './src/pages/NPS',
            './src/pages/BrandDetails'
          ],
          'settings': [
            './src/pages/CourierChoiceHub',
            './src/pages/CourierPriorityRules',
            './src/components/ProfilePage',
            './src/components/ProfileTest'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
}));
