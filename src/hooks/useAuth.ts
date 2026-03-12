import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, accessToken, isAuthenticated, isApproved, isStaff, isLoading, error, login, logout } = useAuthStore();
  return {
    user,
    accessToken,
    role: user?.role,
    isAuthenticated,
    isApproved,
    isStaff,
    isLoading,
    error,
    login,
    logout,
    isAdmin: user?.role === "admin"
  };
}
