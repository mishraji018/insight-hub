import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as HotToaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PredictionsPage from "./pages/PredictionsPage";
import AdminTrainModelPage from "./pages/AdminTrainModelPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HotToaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0a0a0a',
              color: '#F9FAFB',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            },
          }}
        />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Auth but Pending Approval */}
            <Route path="/pending-approval" element={
              <ProtectedRoute>
                <PendingApprovalPage />
              </ProtectedRoute>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['executive', 'manager']}>
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['executive', 'analyst', 'manager']}>
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            <Route path="/predictions" element={
              <ProtectedRoute allowedRoles={['executive', 'analyst', 'manager']}>
                <PredictionsPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/panel" element={
              <ProtectedRoute requireStaff={true}>
                <AdminPanelPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/train-model" element={
              <ProtectedRoute requireStaff={true}>
                <AdminTrainModelPage />
              </ProtectedRoute>
            } />

            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
export default App;
