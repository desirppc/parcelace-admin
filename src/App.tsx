
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
const ParcelAceAI = lazy(() => import('./components/ParcelAceAI'));
const AnalyticsTest = lazy(() => import('./pages/AnalyticsTest'));
const PublicTracking = lazy(() => import('./pages/PublicTracking'));
const TrackingTemplate = lazy(() => import('./pages/TrackingTemplate'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

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
              
              
              <Route path="/orders" element={<Navigate to="/dashboard/orders" replace />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/orders" replace />} />
              
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
                <Route path="/dashboard/ai" element={<Suspense fallback={<LoadingSpinner />}><ParcelAceAI /></Suspense>} />
                <Route path="/dashboard/analytics" element={<Suspense fallback={<LoadingSpinner />}><AnalyticsTest /></Suspense>} />
                
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
