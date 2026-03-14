import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireStaff?: boolean;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  requireStaff
}: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isApproved = useAuthStore(s => s.isApproved);
  const isStaff = useAuthStore(s => s.isStaff);
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not approved, only allow access to pending-approval page
  if (!isApproved && location.pathname !== "/pending-approval") {
    return <Navigate to="/pending-approval" replace />;
  }

  // If approved but trying to access pending-approval, go to dashboard
  if (isApproved && location.pathname === "/pending-approval") {
    return <Navigate to="/dashboard" replace />;
  }

  // Check for staff requirement
  if (requireStaff && !isStaff) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};