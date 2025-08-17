import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "./components/AuthWrapper";
import Dashboard from "./pages/Dashboard";
import ShopManagement from "./pages/ShopManagement";
import ProductListings from "./pages/ProductListings";
import Recommendations from "./pages/Recommendations";
import Orders from "./pages/Orders";
import UserLocations from "./pages/UserLocations";
import Coupons from "./pages/Coupons";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shops" element={<ShopManagement />} />
            <Route path="/products" element={<ProductListings />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/locations" element={<UserLocations />} />
            <Route path="/coupons" element={<Coupons />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
