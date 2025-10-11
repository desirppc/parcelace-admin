
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
const TrackingPage = lazy(() => import("./components/TrackingPage"));
const TrackingV2Page = lazy(() => import("./components/TrackingV2Page"));
const ViewOrder = lazy(() => import("./components/ViewOrder"));
const ViewOrderDetails = lazy(() => import("./components/ViewOrderDetails"));
const ViewShipment = lazy(() => import("./components/ViewShipment"));
const OrdersPage = lazy(() => import("./components/OrdersPage"));
const WarehouseScreen = lazy(() => import("./components/WarehouseScreen"));
const CourierPartnerSelection = lazy(() => import("./components/CourierPartnerSelection"));
const OnboardingChecklist = lazy(() => import('./pages/OnboardingChecklist'));
const OnboardingReturnPro = lazy(() => import('./pages/OnboardingReturnPro'));
const OnboardingPrepaidOrders = lazy(() => import('./pages/OnboardingPrepaidOrders'));
const OnboardingKYC = lazy(() => import('./pages/OnboardingKYC'));
const OnboardingPrepaidShipments = lazy(() => import('./pages/OnboardingPrepaidShipments'));
const OnboardingReverseShipments = lazy(() => import('./pages/OnboardingReverseShipments'));
const OnboardingShipmentTracking = lazy(() => import('./pages/OnboardingShipmentTracking'));
const OnboardingCourierSelection = lazy(() => import('./pages/OnboardingCourierSelection'));
const OnboardingCODRemittance = lazy(() => import('./pages/OnboardingCODRemittance'));
const CODRemittanceDetails = lazy(() => import('./pages/CODRemittanceDetails'));
const OnboardingWalletTransaction = lazy(() => import('./pages/OnboardingWalletTransaction'));
const OnboardingEarlyCOD = lazy(() => import('./pages/OnboardingEarlyCOD'));
const OnboardingInvoice = lazy(() => import('./pages/OnboardingInvoice'));
const OnboardingBilling = lazy(() => import('./pages/OnboardingBilling'));
const OnboardingTrackingPage = lazy(() => import('./pages/OnboardingTrackingPage'));
const OnboardingSupportDashboard = lazy(() => import('./pages/OnboardingSupportDashboard'));
const OnboardingCreateTicket = lazy(() => import('./pages/OnboardingCreateTicket'));
const OnboardingShopifyIntegration = lazy(() => import('./pages/OnboardingShopifyIntegration'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const ProfileTest = lazy(() => import('./components/ProfileTest'));
const OnboardingWizard = lazy(() => import('./components/OnboardingWizard'));
const ParcelAceAI = lazy(() => import('./components/ParcelAceAI'));
const AnalyticsTest = lazy(() => import('./pages/AnalyticsTest'));
const DailyReport = lazy(() => import('./pages/DailyReport'));
const AdminEmailReportsPage = lazy(() => import('./pages/AdminEmailReportsPage'));
const BrandDetails = lazy(() => import('./pages/BrandDetails'));
const NPS = lazy(() => import('./pages/NPS'));
const CustomiseTrackingPage = lazy(() => import('./pages/CustomiseTrackingPage'));
const PublicTracking = lazy(() => import('./pages/PublicTracking'));
const TrackingTemplate = lazy(() => import('./pages/TrackingTemplate'));
const CourierChoiceHub = lazy(() => import('./pages/CourierChoiceHub'));
const CourierPriorityRules = lazy(() => import('./pages/CourierPriorityRules'));
const NotifyAce = lazy(() => import('./pages/NotifyAce'));
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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
              
              {/* Onboarding Wizard - Requires Authentication but not onboarding completion */}
              <Route path="/onboarding/wizard" element={
                <RouteGuard requireAuth={true} requireOnboarding={false}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <OnboardingWizard 
                      onComplete={() => window.location.href = '/dashboard/orders/prepaid'} 
                      onNavigateBack={() => window.history.back()} 
                    />
                  </Suspense>
                </RouteGuard>
              } />
              
              {/* Redirect Routes */}
              <Route path="/orders" element={<Navigate to="/dashboard/orders" replace />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/orders" replace />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route element={<RouteGuard><OnboardingLayout /></RouteGuard>}>
                {/* Core Dashboard Routes */}
                <Route path="/dashboard/orders" element={<Suspense fallback={<LoadingSpinner />}><OrdersPage /></Suspense>} />
                <Route path="/dashboard/shipments" element={<Suspense fallback={<LoadingSpinner />}><ShipmentPage /></Suspense>} />
                <Route path="/dashboard/tracking" element={<Suspense fallback={<LoadingSpinner />}><ShipmentPage /></Suspense>} />
                <Route path="/dashboard/warehouse" element={<Suspense fallback={<LoadingSpinner />}><WarehouseScreen /></Suspense>} />
                <Route path="/dashboard/ai" element={<Suspense fallback={<LoadingSpinner />}><ParcelAceAI /></Suspense>} />
                <Route path="/dashboard/analytics" element={<Suspense fallback={<LoadingSpinner />}><AnalyticsTest /></Suspense>} />
                <Route path="/dashboard/reports/daily" element={<Suspense fallback={<LoadingSpinner />}><DailyReport /></Suspense>} />
                <Route path="/dashboard/reports/admin-email" element={<Suspense fallback={<LoadingSpinner />}><AdminEmailReportsPage /></Suspense>} />
                
                {/* Order Management */}
                <Route path="/dashboard/orders/add" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><AddOrder /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/orders/view" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><ViewOrder /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/orders/:orderId" element={<RouteGuard><Suspense fallback={<LoadingSpinner />}><ViewOrderDetails /></Suspense></RouteGuard>} />
                
                {/* Profile Route */}
                <Route path="/dashboard/profile" element={<Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense>} />
                
                {/* Test Route */}
                <Route path="/test/profile" element={<Suspense fallback={<LoadingSpinner />}><ProfileTest /></Suspense>} />
                
                {/* Onboarding Routes - Require both authentication and onboarding completion */}
                <Route path="/dashboard/orders/prepaid" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingPrepaidOrders /></Suspense></OnboardingRoute>} />
                
                {/* Shipment Management */}
                <Route path="/dashboard/shipments/prepaid" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingPrepaidShipments /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/shipments/reverse" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingReverseShipments /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/shipments/:shipmentId" element={<RouteGuard><Suspense fallback={<LoadingSpinner />}><ViewShipment /></Suspense></RouteGuard>} />
                <Route path="/dashboard/shipments/tracking" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingShipmentTracking /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/shipments/tracking-v1" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><TrackingPage /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/shipments/tracking-v2" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><TrackingV2Page /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/shipments/courier-selection" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingCourierSelection /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/shipments/courier-choice-hub" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><CourierChoiceHub /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/settings/courier-priority-rules" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><CourierPriorityRules /></Suspense></OnboardingRoute>} />
                
                {/* Postship Routes */}
                <Route path="/dashboard/postship/notify-ace" element={<Suspense fallback={<LoadingSpinner />}><NotifyAce /></Suspense>} />
                
                {/* Finance Routes */}
                <Route path="/dashboard/finance/cod-remittance" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingCODRemittance /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/finance/cod-remittance/:id" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><CODRemittanceDetails /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/finance/wallet-transaction" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingWalletTransaction /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/finance/early-cod" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingEarlyCOD /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/finance/invoice" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingInvoice /></Suspense></OnboardingRoute>} />
                
                {/* Support Routes */}
                <Route path="/dashboard/support/support-dashboard" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingSupportDashboard /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/support/create-ticket" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingCreateTicket /></Suspense></OnboardingRoute>} />
                
                {/* Settings Routes */}
                <Route path="/dashboard/settings/billing" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingBilling /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/settings/brand-details" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><BrandDetails /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/settings/customise-shipping-label" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingTrackingPage /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/settings/warehouse" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><WarehouseScreen /></Suspense></OnboardingRoute>} />
                
                {/* KYC Route */}
                <Route path="/dashboard/kyc" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingKYC /></Suspense></OnboardingRoute>} />
                
                {/* Onboarding Routes - Keep for backward compatibility */}
                <Route path="/onboarding/checklist" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingChecklist /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/shopify-integration" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingShopifyIntegration /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/postship/return-pro" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingReturnPro /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/postship/brand-details" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><BrandDetails /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/postship/nps" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><NPS /></Suspense></OnboardingRoute>} />
                <Route path="/dashboard/postship/customise-tracking" element={<RouteGuard><Suspense fallback={<LoadingSpinner />}><CustomiseTrackingPage /></Suspense></RouteGuard>} />
                <Route path="/onboarding/orders/prepaid-orders" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingPrepaidOrders /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/kyc" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingKYC /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/shipments/prepaid-shipments" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingPrepaidShipments /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/shipments/reverse-shipments" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingReverseShipments /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/shipments/tracking" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingShipmentTracking /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/shipments/courier-selection" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingCourierSelection /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/shipments/courier-choice-hub" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><CourierChoiceHub /></Suspense></OnboardingRoute>} />

                <Route path="/onboarding/finance/cod-remittance" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingCODRemittance /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/finance/wallet-transaction" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingWalletTransaction /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/finance/early-cod" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingEarlyCOD /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/finance/invoice" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingInvoice /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/settings/billing" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingBilling /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/settings/brand-details" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><BrandDetails /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/settings/customise-shipping-label" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingTrackingPage /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/support/support-dashboard" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingSupportDashboard /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/support/create-ticket" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><OnboardingCreateTicket /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/profile" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense></OnboardingRoute>} />
                <Route path="/onboarding/warehouse-location" element={<OnboardingRoute><Suspense fallback={<LoadingSpinner />}><WarehouseScreen /></Suspense></OnboardingRoute>} />
                
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
