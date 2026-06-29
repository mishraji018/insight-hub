import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react';
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
  isLoading: true,
  error: null,
  activeOrgId: typeof window !== 'undefined' && localStorage.getItem('activeOrgId') ? parseInt(localStorage.getItem('activeOrgId')!) : null,

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
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      set({ isLoading: false, error: null });
      return result;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut({ redirect: false });
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
    } catch (error) {
      console.error('Logout error:', error);
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
      const isKietAdmin = user.email?.toLowerCase().endsWith('@kiet.edu') || false;
      set({
        user: {
          ...user,
          role: isKietAdmin ? 'admin' : user.role,
          is_approved: isKietAdmin ? true : user.is_approved,
          is_staff: isKietAdmin ? true : user.is_staff,
        },
        accessToken,
        refreshToken: sessionStorage.getItem('refreshToken'),
        isAuthenticated: true,
        isApproved: isKietAdmin ? true : (user.is_approved ?? false),
        isStaff: isKietAdmin ? true : (user.role === 'admin' || user.is_staff === true),
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