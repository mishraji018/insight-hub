import { create } from 'zustand';
import { authAPI, User } from '@/api/endpoints';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  isStaff: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isApproved: false,
  isStaff: false,
  isLoading: false,
  error: null,

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isApproved: user?.is_approved ?? true,
      isStaff: user?.role === 'admin',
    });
  },

  setTokens: (access: string, refresh: string) => {
    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authAPI.login({ email, password });

      // Backend returns fields directly, not nested under 'user'
      const user: User = {
        id: response.user_id,
        email: response.email,
        role: response.role,
        first_name: response.full_name,
        is_approved: response.is_approved,
      };

      sessionStorage.setItem('accessToken', response.access);
      sessionStorage.setItem('refreshToken', response.refresh);

      set({
        user,
        accessToken: response.access,
        refreshToken: response.refresh,
        isAuthenticated: true,
        isApproved: response.is_approved ?? true,
        isStaff: response.is_staff ?? false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as any;
        errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.detail ||
          'Invalid credentials';
      }

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isApproved: false,
        isStaff: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.clear();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isApproved: false,
        isStaff: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      set({ user: null, isAuthenticated: false, isApproved: false, isStaff: false, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const user = await authAPI.getCurrentUser();
      set({
        user,
        accessToken,
        refreshToken: sessionStorage.getItem('refreshToken'),
        isAuthenticated: true,
        isApproved: user.is_approved ?? true,
        isStaff: user.role === 'admin',
        isLoading: false,
        error: null,
      });
    } catch (error) {
      sessionStorage.clear();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isApproved: false,
        isStaff: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initializeAuth: async () => {
    await get().checkAuth();
  },

  clearError: () => {
    set({ error: null });
  },
}));

export const useUserRole = (): User['role'] | null => {
  const user = useAuthStore((state) => state.user);
  return user?.role || null;
};

export const useIsAdmin = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
};

export const useIsPredictor = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'predictor';
};

export const useIsAnalyst = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'analyst';
};

export default useAuthStore;