import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import { AnimatePresence } from "framer-motion";
import { useServiceWorker } from "@/hooks/use-service-worker";
import PerformanceMonitor from "@/components/ui/performance-monitor";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimeFigures from "./pages/AnimeFigures";
import Keychains from "./pages/Keychains";
import ProductDetail from "./pages/ProductDetail";
import AllProducts from "./pages/AllProducts";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import SearchResults from "./pages/SearchResults";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

// Auth Pages
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

// Admin Pages
import AdminDashboard from "./components/admin/AdminDashboard";

const queryClient = new QueryClient();

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/anime-figures" element={<AnimeFigures />} />
        <Route path="/anime-figure" element={<AnimeFigures />} />
        <Route path="/keychains" element={<Keychains />} />
        <Route path="/keychain" element={<Keychains />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

// Service Worker Registration Component
const ServiceWorkerRegistration = () => {
  const { isSupported, isRegistered, isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isSupported && isRegistered) {
      console.log('Service Worker is active and ready');
    }
  }, [isSupported, isRegistered]);

  // Show update notification when available
  useEffect(() => {
    if (isUpdateAvailable) {
      const shouldUpdate = window.confirm(
        'A new version of the app is available. Would you like to update now?'
      );
      if (shouldUpdate) {
        updateServiceWorker();
      }
    }
  }, [isUpdateAvailable, updateServiceWorker]);

  return null; // This component doesn't render anything
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StoreProvider>
        <TooltipProvider>
          <ServiceWorkerRegistration />
          <PerformanceMonitor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </StoreProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
