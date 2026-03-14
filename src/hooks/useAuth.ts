import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore(s => s.user);
  const accessToken = useAuthStore(s => s.accessToken);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isApproved = useAuthStore(s => s.isApproved);
  const isStaff = useAuthStore(s => s.isStaff);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const login = useAuthStore(s => s.login);
  const logout = useAuthStore(s => s.logout);
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
