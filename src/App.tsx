
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect, Suspense, lazy } from "react";
import SmartCache from "@/utils/smartCache";
import { UserProvider } from './contexts/UserContext';

// Import essential components that are always needed
import RouteGuard from './components/RouteGuard';
import OnboardingRoute from './components/OnboardingRoute';
import PublicRoute from './components/PublicRoute';
import OnboardingLayout from './components/OnboardingLayout';

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const MobileOTPVerification = lazy(() => import("./pages/MobileOTPVerification"));
const AddOrder = lazy(() => import("./components/AddOrder"));
const ShipmentPage = lazy(() => import("./components/ShipmentPage"));
const ActionNeededPage = lazy(() => import("./components/ActionNeededPage"));
const TrackingPage = lazy(() => import("./components/TrackingPage"));
const TrackingV2Page = lazy(() => import("./components/TrackingV2Page"));
const ViewOrder = lazy(() => import("./components/ViewOrder"));
const ViewOrderDetails = lazy(() => import("./components/ViewOrderDetails"));
const ViewShipment = lazy(() => import("./components/ViewShipment"));
const OrdersPage = lazy(() => import("./components/OrdersPage"));
const FENumberPage = lazy(() => import("./components/FENumberPage"));
const UsersPage = lazy(() => import("./components/UsersPage"));
const VendorsPage = lazy(() => import("./components/VendorsPage"));
const SupportTicketsPage = lazy(() => import("./components/SupportTicketsPage"));
const EmailResponsePage = lazy(() => import("./components/EmailResponsePage"));
const GmailPage = lazy(() => import("./components/GmailPage"));
const ParcelAceAI = lazy(() => import('./components/ParcelAceAI'));
const AnalyticsTest = lazy(() => import('./pages/AnalyticsTest'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PublicTracking = lazy(() => import('./pages/PublicTracking'));
const TrackingTemplate = lazy(() => import('./pages/TrackingTemplate'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ManageCODPlanPage = lazy(() => import('./components/ManageCODPlanPage'));
const CODRemittancePage = lazy(() => import('./components/CODRemittancePage'));
const CODRemittanceSummaryPage = lazy(() => import('./components/CODRemittanceSummaryPage'));
const CODRemittanceDetailsPage = lazy(() => import('./components/CODRemittanceDetailsPage'));
const AddMoney = lazy(() => import('./components/AddMoney'));
const FailedOrderImportPage = lazy(() => import('./components/FailedOrderImportPage'));
const FailedOrdersDetailPage = lazy(() => import('./components/FailedOrdersDetailPage'));
const AddPincode = lazy(() => import('./components/AddPincode'));
const UpdateEway = lazy(() => import('./components/UpdateEway'));
const BulkTrackingPage = lazy(() => import('./components/BulkTrackingPage'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  // Removed session monitoring setup - sessions only checked on API calls
  // No automatic refresh or monitoring needed
  
  // Cleanup background refresh timers on app unmount
  useEffect(() => {
    return () => {
      SmartCache.clearAllTimers();
    };
  }, []);

  // Force light theme - remove dark class from HTML and prevent system theme detection
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Force light theme immediately
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
      
      // Prevent system theme detection by blocking media query changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = () => {
        // Always force light theme regardless of system preference
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      };
      
      // Listen for system theme changes and override them
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleThemeChange);
      }
      
      // Prevent dark class from being added via MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (document.documentElement.classList.contains('dark')) {
              document.documentElement.classList.remove('dark');
            }
          }
          // Also watch for style changes
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (document.documentElement.style.colorScheme === 'dark') {
              document.documentElement.style.colorScheme = 'light';
            }
          }
        });
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      return () => {
        observer.disconnect();
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleThemeChange);
        } else {
          mediaQuery.removeListener(handleThemeChange);
        }
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} storageKey="parcelace-theme">
        <TooltipProvider>
          <UserProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            
            <Routes>
              {/* Public Routes - No Authentication Required */}
              <Route path="/" element={<PublicRoute><Suspense fallback={<LoadingSpinner />}><Index /></Suspense></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Suspense fallback={<LoadingSpinner />}><Login /></Suspense></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Suspense fallback={<LoadingSpinner />}><SignUp /></Suspense></PublicRoute>} />
              <Route path="/mobile-otp-verification" element={<PublicRoute><Suspense fallback={<LoadingSpinner />}><MobileOTPVerification /></Suspense></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><Suspense fallback={<LoadingSpinner />}><ForgotPassword /></Suspense></PublicRoute>} />
              <Route path="/otp-verification" element={<PublicRoute><Suspense fallback={<LoadingSpinner />}><OTPVerification /></Suspense></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><Suspense fallback={<LoadingSpinner />}><ResetPassword /></Suspense></PublicRoute>} />
              <Route path="/tracking/:awbNumber" element={<Suspense fallback={<LoadingSpinner />}><PublicTracking /></Suspense>} />
              <Route path="/tracking-template" element={<Suspense fallback={<LoadingSpinner />}><TrackingTemplate /></Suspense>} />
              
              
              <Route path="/orders" element={<Navigate to="/dashboard/prepaid-shipments" replace />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/prepaid-shipments" replace />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route element={<RouteGuard><OnboardingLayout /></RouteGuard>}>
                {/* Core Dashboard Routes */}
                <Route path="/dashboard/orders" element={<Suspense fallback={<LoadingSpinner />}><OrdersPage /></Suspense>} />
                <Route path="/dashboard/fe-number" element={<Suspense fallback={<LoadingSpinner />}><FENumberPage /></Suspense>} />
                <Route path="/dashboard/prepaid-shipments" element={<Suspense fallback={<LoadingSpinner />}><ShipmentPage /></Suspense>} />
                <Route path="/dashboard/reverse-shipments" element={<Suspense fallback={<LoadingSpinner />}><ShipmentPage /></Suspense>} />
                <Route path="/dashboard/action-needed" element={<Suspense fallback={<LoadingSpinner />}><ActionNeededPage /></Suspense>} />
                <Route path="/dashboard/tracking" element={<Suspense fallback={<LoadingSpinner />}><ShipmentPage /></Suspense>} />
                <Route path="/dashboard/support-user" element={<Suspense fallback={<LoadingSpinner />}><UsersPage /></Suspense>} />
                <Route path="/dashboard/vendors" element={<Suspense fallback={<LoadingSpinner />}><VendorsPage /></Suspense>} />
                <Route path="/dashboard/support" element={<Suspense fallback={<LoadingSpinner />}><SupportTicketsPage /></Suspense>} />
                <Route path="/dashboard/support/support-dashboard" element={<Suspense fallback={<LoadingSpinner />}><SupportTicketsPage /></Suspense>} />
                <Route path="/dashboard/email-responses" element={<Suspense fallback={<LoadingSpinner />}><EmailResponsePage /></Suspense>} />
                <Route path="/dashboard/gmail" element={<Suspense fallback={<LoadingSpinner />}><GmailPage /></Suspense>} />
                <Route path="/dashboard/ai" element={<Suspense fallback={<LoadingSpinner />}><ParcelAceAI /></Suspense>} />
                <Route path="/dashboard/analytics" element={<Suspense fallback={<LoadingSpinner />}><AnalyticsTest /></Suspense>} />
                <Route path="/dashboard/analytics-query" element={<Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense>} />
                <Route path="/dashboard/failed-order-import" element={<Suspense fallback={<LoadingSpinner />}><FailedOrderImportPage /></Suspense>} />
                <Route path="/dashboard/failed-order-import/:importId" element={<Suspense fallback={<LoadingSpinner />}><FailedOrdersDetailPage /></Suspense>} />
                
                {/* Finance */}
                <Route path="/dashboard/finance/manage-cod-plan" element={<Suspense fallback={<LoadingSpinner />}><ManageCODPlanPage /></Suspense>} />
                <Route path="/dashboard/finance/cod-remittance-summary" element={<Suspense fallback={<LoadingSpinner />}><CODRemittanceSummaryPage /></Suspense>} />
                <Route path="/dashboard/finance/cod-remittance" element={<Suspense fallback={<LoadingSpinner />}><CODRemittancePage /></Suspense>} />
                <Route path="/dashboard/finance/cod-remittance/:id" element={<Suspense fallback={<LoadingSpinner />}><CODRemittanceDetailsPage /></Suspense>} />
                <Route path="/dashboard/finance/add-money" element={<Suspense fallback={<LoadingSpinner />}><AddMoney /></Suspense>} />
                
                {/* Tools */}
                <Route path="/dashboard/tools/add-pincode" element={<Suspense fallback={<LoadingSpinner />}><AddPincode /></Suspense>} />
                <Route path="/dashboard/tools/update-eway" element={<Suspense fallback={<LoadingSpinner />}><UpdateEway /></Suspense>} />
                <Route path="/dashboard/tools/bulk-tracking" element={<Suspense fallback={<LoadingSpinner />}><BulkTrackingPage /></Suspense>} />
                
                {/* Order Management */}
                <Route path="/dashboard/orders/add" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><AddOrder /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/orders/view" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><ViewOrder /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/orders/:orderId" element={<RouteGuard><Suspense fallback={<LoadingSpinner />}><ViewOrderDetails /></Suspense></RouteGuard>} />
                
                {/* Shipment Management */}
                <Route path="/dashboard/shipment/:awb" element={<RouteGuard><Suspense fallback={<LoadingSpinner />}><ViewShipment /></Suspense></RouteGuard>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
              </Route>
              
              {/* Catch-all route for any unmatched paths - Must be protected */}
              <Route path="*" element={
                <RouteGuard>
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFound />
                  </Suspense>
                </RouteGuard>
              } />
            </Routes>
            
            
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
