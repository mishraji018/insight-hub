import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as HotToaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PredictionsPage from "./pages/PredictionsPage";
import AdminTrainModelPage from "./pages/AdminTrainModelPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* FIXED: Global toast notifications */}
      <HotToaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          {/* FIXED: Using refined ProtectedRoute with role-based guards */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['executive', 'analyst', 'manager']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRoles={['executive', 'analyst']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/predictions" element={<ProtectedRoute allowedRoles={['executive', 'analyst']}><PredictionsPage /></ProtectedRoute>} />
          <Route path="/admin/train-model" element={<ProtectedRoute allowedRoles={['executive']}><AdminTrainModelPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
