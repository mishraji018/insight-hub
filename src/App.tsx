import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as HotToaster } from "react-hot-toast";
import { useEffect, Suspense, lazy } from "react";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy Load Pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const PredictionsPage = lazy(() => import("./pages/PredictionsPage"));
const AdminTrainModelPage = lazy(() => import("./pages/AdminTrainModelPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const PendingApprovalPage = lazy(() => import("./pages/PendingApprovalPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const DeveloperPage = lazy(() => import("./pages/DeveloperPage"));
const OfflinePage = lazy(() => import("./pages/OfflinePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PWAInstallPrompt = lazy(() => import("@/components/PWAInstallPrompt"));
const ErrorBoundary = lazy(() => import("@/components/ErrorBoundary"));

// Loading Placeholder
const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-4">
    <Skeleton className="h-12 w-64 bg-primary/10" />
    <Skeleton className="h-4 w-48 bg-white/5" />
    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mt-8">
      <Skeleton className="h-32 rounded-2xl bg-white/5" />
      <Skeleton className="h-32 rounded-2xl bg-white/5" />
      <Skeleton className="h-32 rounded-2xl bg-white/5" />
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  const initializeAuth = useAuthStore(s => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Network Connectivity Listener
  useEffect(() => {
    const handleOffline = () => {
      if (!navigator.onLine) {
        // Save current location before going to offline page
        const currentPath = window.location.pathname;
        if (currentPath !== '/offline') {
          sessionStorage.setItem('pre_offline_path', currentPath);
          window.location.href = '/offline';
        }
      }
    };

    const handleOnline = () => {
      if (navigator.onLine) {
        const previousPath = sessionStorage.getItem('pre_offline_path');
        if (previousPath && window.location.pathname === '/offline') {
          sessionStorage.removeItem('pre_offline_path');
          window.location.href = previousPath;
        }
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    // Check initial state
    if (!navigator.onLine && window.location.pathname !== '/offline') {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

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
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/developer" element={<DeveloperPage />} />
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

                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requireStaff={true}>
                    <AdminDashboardPage />
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

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />

                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                } />

                <Route path="/offline" element={<OfflinePage />} />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default App;
