
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
// Removed session monitoring imports - no automatic session management needed
import { useEffect } from "react";
import SmartCache from "@/utils/smartCache";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import MobileOTPVerification from "./pages/MobileOTPVerification";
import AddOrder from "./components/AddOrder";
import ShipmentPage from "./components/ShipmentPage";
import TrackingPage from "./components/TrackingPage";
import TrackingV2Page from "./components/TrackingV2Page";
import ViewOrder from "./components/ViewOrder";
import ViewOrderDetails from "./components/ViewOrderDetails";
import ViewShipment from "./components/ViewShipment";
import OrdersPage from "./components/OrdersPage";
import WarehouseScreen from "./components/WarehouseScreen";
import CourierPartnerSelection from "./components/CourierPartnerSelection";
import OnboardingLayout from './components/OnboardingLayout';
import OnboardingChecklist from './pages/OnboardingChecklist';
import OnboardingReturnPro from './pages/OnboardingReturnPro';
import OnboardingPrepaidOrders from './pages/OnboardingPrepaidOrders';
import OnboardingReverseOrders from './pages/OnboardingReverseOrders';
import OnboardingKYC from './pages/OnboardingKYC';
import OnboardingPrepaidShipments from './pages/OnboardingPrepaidShipments';
import OnboardingReverseShipments from './pages/OnboardingReverseShipments';
import OnboardingShipmentTracking from './pages/OnboardingShipmentTracking';
import OnboardingCourierSelection from './pages/OnboardingCourierSelection';
import OnboardingCODRemittance from './pages/OnboardingCODRemittance';
import CODRemittanceDetails from './pages/CODRemittanceDetails';
import OnboardingWalletTransaction from './pages/OnboardingWalletTransaction';
import OnboardingEarlyCOD from './pages/OnboardingEarlyCOD';
import OnboardingInvoice from './pages/OnboardingInvoice';
import OnboardingBilling from './pages/OnboardingBilling';
import OnboardingTrackingPage from './pages/OnboardingTrackingPage';
import OnboardingSupportDashboard from './pages/OnboardingSupportDashboard';
import OnboardingCreateTicket from './pages/OnboardingCreateTicket';
import OnboardingShopifyIntegration from './pages/OnboardingShopifyIntegration';
import ProfilePage from './components/ProfilePage';
import ProfileTest from './components/ProfileTest';
import OnboardingWizard from './components/OnboardingWizard';
import RouteGuard from './components/RouteGuard';
import OnboardingRoute from './components/OnboardingRoute';
import PublicRoute from './components/PublicRoute';
import ParcelAceAI from './components/ParcelAceAI';
import AnalyticsTest from './pages/AnalyticsTest';
import DailyReport from './pages/DailyReport';
import AdminEmailReportsPage from './pages/AdminEmailReportsPage';
import BrandDetails from './pages/BrandDetails';
import NPS from './pages/NPS';
import CustomiseTrackingPage from './pages/CustomiseTrackingPage';
import PublicTracking from './pages/PublicTracking';
import TrackingTemplate from './pages/TrackingTemplate';
import CourierChoiceHub from './pages/CourierChoiceHub';
import CourierPriorityRules from './pages/CourierPriorityRules';
import NotifyAce from './pages/NotifyAce';

import { UserProvider } from './contexts/UserContext';
// Add imports for forgot password flow
import OTPVerification from './pages/OTPVerification';
import ResetPassword from './pages/ResetPassword';

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
              <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/mobile-otp-verification" element={<PublicRoute><MobileOTPVerification /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/otp-verification" element={<PublicRoute><OTPVerification /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              <Route path="/tracking/:awbNumber" element={<PublicTracking />} />
              <Route path="/tracking-template" element={<TrackingTemplate />} />
              
              {/* Onboarding Wizard - Requires Authentication but not onboarding completion */}
              <Route path="/onboarding/wizard" element={
                <RouteGuard requireAuth={true} requireOnboarding={false}>
                  <OnboardingWizard 
                    onComplete={() => window.location.href = '/dashboard/orders/prepaid'} 
                    onNavigateBack={() => window.history.back()} 
                  />
                </RouteGuard>
              } />
              
              {/* Redirect Routes */}
              <Route path="/orders" element={<Navigate to="/dashboard/orders" replace />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/orders/prepaid" replace />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route element={<RouteGuard><OnboardingLayout /></RouteGuard>}>
                {/* Core Dashboard Routes */}
                <Route path="/dashboard/orders" element={<OrdersPage />} />
                <Route path="/dashboard/shipments" element={<ShipmentPage />} />
                <Route path="/dashboard/tracking" element={<ShipmentPage />} />
                <Route path="/dashboard/warehouse" element={<WarehouseScreen />} />
                <Route path="/dashboard/ai" element={<ParcelAceAI />} />
                <Route path="/dashboard/analytics" element={<AnalyticsTest />} />
                <Route path="/dashboard/reports/daily" element={<DailyReport />} />
                <Route path="/dashboard/reports/admin-email" element={<AdminEmailReportsPage />} />
                
                {/* Order Management */}
                <Route path="/dashboard/orders/add" element={<OnboardingRoute><AddOrder /></OnboardingRoute>} />
                <Route path="/dashboard/orders/view" element={<OnboardingRoute><ViewOrder /></OnboardingRoute>} />
                <Route path="/dashboard/orders/:orderId" element={<RouteGuard><ViewOrderDetails /></RouteGuard>} />
                
                {/* Profile Route */}
                <Route path="/dashboard/profile" element={<ProfilePage />} />
                
                {/* Test Route */}
                <Route path="/test/profile" element={<ProfileTest />} />
                
                {/* Onboarding Routes - Require both authentication and onboarding completion */}
                <Route path="/dashboard/orders/prepaid" element={<OnboardingRoute><OnboardingPrepaidOrders /></OnboardingRoute>} />
                <Route path="/dashboard/orders/reverse" element={<OnboardingRoute><OnboardingReverseOrders /></OnboardingRoute>} />
                
                {/* Shipment Management */}
                <Route path="/dashboard/shipments/prepaid" element={<OnboardingRoute><OnboardingPrepaidShipments /></OnboardingRoute>} />
                <Route path="/dashboard/shipments/reverse" element={<OnboardingRoute><OnboardingReverseShipments /></OnboardingRoute>} />
                <Route path="/dashboard/shipments/:shipmentId" element={<RouteGuard><ViewShipment /></RouteGuard>} />
                <Route path="/dashboard/shipments/tracking" element={<OnboardingRoute><OnboardingShipmentTracking /></OnboardingRoute>} />
                <Route path="/dashboard/shipments/tracking-v1" element={<OnboardingRoute><TrackingPage /></OnboardingRoute>} />
                <Route path="/dashboard/shipments/tracking-v2" element={<OnboardingRoute><TrackingV2Page /></OnboardingRoute>} />
                <Route path="/dashboard/shipments/courier-selection" element={<OnboardingRoute><OnboardingCourierSelection /></OnboardingRoute>} />
                <Route path="/dashboard/shipments/courier-choice-hub" element={<OnboardingRoute><CourierChoiceHub /></OnboardingRoute>} />
                <Route path="/dashboard/settings/courier-priority-rules" element={<OnboardingRoute><CourierPriorityRules /></OnboardingRoute>} />
                
                {/* Postship Routes */}
                <Route path="/dashboard/postship/notify-ace" element={<NotifyAce />} />
                
                {/* Finance Routes */}
                <Route path="/dashboard/finance/cod-remittance" element={<OnboardingRoute><OnboardingCODRemittance /></OnboardingRoute>} />
                <Route path="/dashboard/finance/cod-remittance/:id" element={<OnboardingRoute><CODRemittanceDetails /></OnboardingRoute>} />
                <Route path="/dashboard/finance/wallet-transaction" element={<OnboardingRoute><OnboardingWalletTransaction /></OnboardingRoute>} />
                <Route path="/dashboard/finance/early-cod" element={<OnboardingRoute><OnboardingEarlyCOD /></OnboardingRoute>} />
                <Route path="/dashboard/finance/invoice" element={<OnboardingRoute><OnboardingInvoice /></OnboardingRoute>} />
                
                {/* Support Routes */}
                <Route path="/dashboard/support/support-dashboard" element={<OnboardingRoute><OnboardingSupportDashboard /></OnboardingRoute>} />
                <Route path="/dashboard/support/create-ticket" element={<OnboardingRoute><OnboardingCreateTicket /></OnboardingRoute>} />
                
                {/* Settings Routes */}
                <Route path="/dashboard/settings/billing" element={<OnboardingRoute><OnboardingBilling /></OnboardingRoute>} />
                <Route path="/dashboard/settings/brand-details" element={<OnboardingRoute><BrandDetails /></OnboardingRoute>} />
                <Route path="/dashboard/settings/customise-shipping-label" element={<OnboardingRoute><OnboardingTrackingPage /></OnboardingRoute>} />
                <Route path="/dashboard/settings/warehouse" element={<OnboardingRoute><WarehouseScreen /></OnboardingRoute>} />
                
                {/* KYC Route */}
                <Route path="/dashboard/kyc" element={<OnboardingRoute><OnboardingKYC /></OnboardingRoute>} />
                
                {/* Onboarding Routes - Keep for backward compatibility */}
                <Route path="/onboarding/checklist" element={<OnboardingRoute><OnboardingChecklist /></OnboardingRoute>} />
                <Route path="/onboarding/shopify-integration" element={<OnboardingRoute><OnboardingShopifyIntegration /></OnboardingRoute>} />
                <Route path="/onboarding/postship/return-pro" element={<OnboardingRoute><OnboardingReturnPro /></OnboardingRoute>} />
                <Route path="/dashboard/postship/brand-details" element={<OnboardingRoute><BrandDetails /></OnboardingRoute>} />
                <Route path="/dashboard/postship/nps" element={<OnboardingRoute><NPS /></OnboardingRoute>} />
                <Route path="/dashboard/postship/customise-tracking" element={<RouteGuard><CustomiseTrackingPage /></RouteGuard>} />
                <Route path="/onboarding/orders/prepaid-orders" element={<OnboardingRoute><OnboardingPrepaidOrders /></OnboardingRoute>} />
                <Route path="/onboarding/orders/reverse-orders" element={<OnboardingRoute><OnboardingReverseOrders /></OnboardingRoute>} />
                <Route path="/onboarding/kyc" element={<OnboardingRoute><OnboardingKYC /></OnboardingRoute>} />
                <Route path="/onboarding/shipments/prepaid-shipments" element={<OnboardingRoute><OnboardingPrepaidShipments /></OnboardingRoute>} />
                <Route path="/onboarding/shipments/reverse-shipments" element={<OnboardingRoute><OnboardingReverseShipments /></OnboardingRoute>} />
                <Route path="/onboarding/shipments/tracking" element={<OnboardingRoute><OnboardingShipmentTracking /></OnboardingRoute>} />
                <Route path="/onboarding/shipments/courier-selection" element={<OnboardingRoute><OnboardingCourierSelection /></OnboardingRoute>} />
                <Route path="/onboarding/shipments/courier-choice-hub" element={<OnboardingRoute><CourierChoiceHub /></OnboardingRoute>} />

                <Route path="/onboarding/finance/cod-remittance" element={<OnboardingRoute><OnboardingCODRemittance /></OnboardingRoute>} />
                <Route path="/onboarding/finance/wallet-transaction" element={<OnboardingRoute><OnboardingWalletTransaction /></OnboardingRoute>} />
                <Route path="/onboarding/finance/early-cod" element={<OnboardingRoute><OnboardingEarlyCOD /></OnboardingRoute>} />
                <Route path="/onboarding/finance/invoice" element={<OnboardingRoute><OnboardingInvoice /></OnboardingRoute>} />
                <Route path="/onboarding/settings/billing" element={<OnboardingRoute><OnboardingBilling /></OnboardingRoute>} />
                <Route path="/onboarding/settings/brand-details" element={<OnboardingRoute><BrandDetails /></OnboardingRoute>} />
                <Route path="/onboarding/settings/customise-shipping-label" element={<OnboardingRoute><OnboardingTrackingPage /></OnboardingRoute>} />
                <Route path="/onboarding/support/support-dashboard" element={<OnboardingRoute><OnboardingSupportDashboard /></OnboardingRoute>} />
                <Route path="/onboarding/support/create-ticket" element={<OnboardingRoute><OnboardingCreateTicket /></OnboardingRoute>} />
                <Route path="/onboarding/profile" element={<OnboardingRoute><ProfilePage /></OnboardingRoute>} />
                <Route path="/onboarding/warehouse-location" element={<OnboardingRoute><WarehouseScreen /></OnboardingRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
              
              {/* Catch-all route for any unmatched paths - Must be protected */}
              <Route path="*" element={
                <RouteGuard>
                  <NotFound />
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
