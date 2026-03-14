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
  activeOrgId: number | null;

  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => void;
  setActiveOrgId: (id: number | null) => void;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: any) => Promise<void>;
  toggleTheme: () => Promise<void>;
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
  activeOrgId: localStorage.getItem('activeOrgId') ? parseInt(localStorage.getItem('activeOrgId')!) : null,

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isApproved: user?.is_approved ?? false,
      isStaff: user?.role === 'admin' || user?.is_staff === true,
    });
    if (user?.theme_preference) {
      const isDark = user.theme_preference === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    }
  },

  setTokens: (access: string, refresh: string) => {
    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  setActiveOrgId: (id: number | null) => {
    if (id) localStorage.setItem('activeOrgId', id.toString());
    else localStorage.removeItem('activeOrgId');
    set({ activeOrgId: id });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authAPI.login({ email, password });

      if (response.requires_2fa) {
        set({ isLoading: false });
        return response;
      }

      const user: User = response.user || {
        id: response.user_id,
        email: response.email,
        role: response.role,
        name: response.full_name,
        is_approved: response.is_approved,
        is_staff: response.is_staff,
      };

      sessionStorage.setItem('accessToken', response.access);
      sessionStorage.setItem('refreshToken', response.refresh);

      set({
        user,
        accessToken: response.access,
        refreshToken: response.refresh,
        isAuthenticated: true,
        isApproved: response.is_approved,
        isStaff: response.is_staff || user.role === 'admin',
        isLoading: false,
        error: null,
      });

      if (user.theme_preference) {
        document.documentElement.classList.toggle('dark', user.theme_preference === 'dark');
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
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
      // Apply system preference if not logged in
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
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
        isApproved: user.is_approved ?? false,
        isStaff: user.role === 'admin' || user.is_staff === true,
        isLoading: false,
        error: null,
      });
      if (user.theme_preference) {
        document.documentElement.classList.toggle('dark', user.theme_preference === 'dark');
      }
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

  updateProfile: async (data: any) => {
    const updatedUser = await authAPI.updateProfile(data);
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null
    }));
  },

  toggleTheme: async () => {
    const { user } = get();
    const newTheme = user?.theme_preference === 'light' ? 'dark' : 'light';
    
    if (user) {
      await authAPI.updateProfile({ theme_preference: newTheme });
      set((state) => ({
        user: state.user ? { ...state.user, theme_preference: newTheme } : null
      }));
    }
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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