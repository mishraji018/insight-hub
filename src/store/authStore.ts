import { create } from "zustand";
import { login as loginAPI } from "@/api/endpoints";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: "admin" | "user" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (data: { user: User; access: string; refresh: string; role: "admin" | "user" }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  role: (localStorage.getItem("user_role") as "admin" | "user") || null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await loginAPI(email, password);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user_role", data.role || "user");
      set({
        user: data.user,
        token: data.access,
        refreshToken: data.refresh,
        role: data.role || "user",
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Login failed",
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    set({
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
    });
  },

  setAuth: (data) => {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user_role", data.role);
    set({
      user: data.user,
      token: data.access,
      refreshToken: data.refresh,
      role: data.role,
      isAuthenticated: true,
    });
  },
}));
