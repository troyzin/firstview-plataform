
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Productions from "./pages/Productions";
import Equipment from "./pages/Equipment";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/productions" element={
              <ProtectedRoute requiredActions={['view_productions']}>
                <Productions />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute requiredActions={['view_reports']}>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/team" element={
              <ProtectedRoute requiredActions={['view_team']}>
                <Team />
              </ProtectedRoute>
            } />
            
            <Route path="/equipment" element={
              <ProtectedRoute requiredActions={['view_equipment']}>
                <Equipment />
              </ProtectedRoute>
            } />
            
            <Route path="/clients" element={
              <ProtectedRoute requiredActions={['view_clients']}>
                <Clients />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
