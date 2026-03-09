import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, token, role, isAuthenticated, isLoading, error, login, logout } = useAuthStore();
  return { user, token, role, isAuthenticated, isLoading, error, login, logout, isAdmin: role === "admin" };
}
