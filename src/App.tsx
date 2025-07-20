
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import TestLogin from "./pages/TestLogin";
import AddOrder from "./components/AddOrder";
import ShipmentPage from "./components/ShipmentPage";
import TrackingPage from "./components/TrackingPage";
import TrackingV2 from "./components/TrackingV2";
import ViewOrder from "./components/ViewOrder";
import ViewOrderDetails from "./components/ViewOrderDetails";
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
import OnboardingWalletTransaction from './pages/OnboardingWalletTransaction';
import OnboardingEarlyCOD from './pages/OnboardingEarlyCOD';
import OnboardingInvoice from './pages/OnboardingInvoice';
import OnboardingBilling from './pages/OnboardingBilling';
import OnboardingInvoiceSettings from './pages/OnboardingInvoiceSettings';
import OnboardingTrackingPage from './pages/OnboardingTrackingPage';
import OnboardingSupportDashboard from './pages/OnboardingSupportDashboard';
import OnboardingCreateTicket from './pages/OnboardingCreateTicket';
import OnboardingMyTickets from './pages/OnboardingMyTickets';
import OnboardingTicketHistory from './pages/OnboardingTicketHistory';
import OnboardingShopifyIntegration from './pages/OnboardingShopifyIntegration';
import ProfilePage from './components/ProfilePage';
import OnboardingWizard from './components/OnboardingWizard';
import RouteGuard from './components/RouteGuard';
import ParcelAceAI from './components/ParcelAceAI';
import AnalyticsTest from './pages/AnalyticsTest';
import { UserProvider } from './contexts/UserContext';
// Add imports for forgot password flow
import OTPVerification from './pages/OTPVerification';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/test-login" element={<TestLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Dashboard redirect */}
            <Route path="/dashboard" element={<OrdersPage />} />
            {/* Onboarding Wizard - standalone route */}
            <Route path="/onboarding/wizard" element={
              <OnboardingWizard 
                onComplete={() => window.location.href = '/orders'} 
                onNavigateBack={() => window.history.back()} 
              />
            } />
            <Route element={<RouteGuard><OnboardingLayout /></RouteGuard>}>
              <Route path="/add-order" element={<AddOrder />} />
              <Route path="/shipments" element={<ShipmentPage />} />
              <Route path="/view-order" element={<ViewOrder />} />
              <Route path="/order/:orderId" element={<ViewOrderDetails />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/tracking" element={<ShipmentPage />} />
              <Route path="/tracking-page" element={<TrackingPage />} />
              <Route path="/tracking-v2" element={<TrackingV2 />} />
              <Route path="/courier-selection" element={<CourierPartnerSelection />} />
              {/* AI Route */}
              <Route path="/ai" element={<ParcelAceAI />} />
              {/* Analytics Test Route */}
              <Route path="/analytics-test" element={<AnalyticsTest />} />
              {/* Warehouse Route */}
              <Route path="/warehouse" element={<WarehouseScreen />} />
              {/* Onboarding Routes */}
              <Route path="/onboarding/checklist" element={<OnboardingChecklist />} />
              <Route path="/onboarding/shopify-integration" element={<OnboardingShopifyIntegration />} />
              <Route path="/onboarding/postship/return-pro" element={<OnboardingReturnPro />} />
              <Route path="/onboarding/orders/prepaid-orders" element={<OnboardingPrepaidOrders />} />
              <Route path="/onboarding/orders/reverse-orders" element={<OnboardingReverseOrders />} />
              {/* KYC Route */}
              <Route path="/onboarding/kyc" element={<OnboardingKYC />} />
              {/* Shipment Routes */}
              <Route path="/onboarding/shipments/prepaid-shipments" element={<OnboardingPrepaidShipments />} />
              <Route path="/onboarding/shipments/reverse-shipments" element={<OnboardingReverseShipments />} />
              <Route path="/onboarding/shipments/tracking" element={<OnboardingShipmentTracking />} />
              <Route path="/onboarding/shipments/courier-selection" element={<OnboardingCourierSelection />} />
              {/* Finance Routes */}
              <Route path="/onboarding/finance/cod-remittance" element={<OnboardingCODRemittance />} />
              <Route path="/onboarding/finance/wallet-transaction" element={<OnboardingWalletTransaction />} />
              <Route path="/onboarding/finance/early-cod" element={<OnboardingEarlyCOD />} />
              <Route path="/onboarding/finance/invoice" element={<OnboardingInvoice />} />
              {/* Settings Routes */}
              <Route path="/onboarding/settings/billing" element={<OnboardingBilling />} />
              <Route path="/onboarding/settings/invoice-settings" element={<OnboardingInvoiceSettings />} />
              <Route path="/onboarding/settings/tracking-page" element={<OnboardingTrackingPage />} />
              {/* Support Routes */}
              <Route path="/onboarding/support/support-dashboard" element={<OnboardingSupportDashboard />} />
              <Route path="/onboarding/support/create-ticket" element={<OnboardingCreateTicket />} />
              <Route path="/onboarding/support/my-tickets" element={<OnboardingMyTickets />} />
              <Route path="/onboarding/support/ticket-history" element={<OnboardingTicketHistory />} />
              {/* Profile Route */}
              <Route path="/onboarding/profile" element={<ProfilePage />} />
              {/* Legacy Warehouse Route */}
              <Route path="/onboarding/warehouse-location" element={<WarehouseScreen />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
