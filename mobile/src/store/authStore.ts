import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';
import { authAPI, User } from '../api/endpoints';

const storage = new (require('react-native-mmkv').MMKV)();

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
  biometricsEnabled: boolean;

  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setActiveOrgId: (id: number | null) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: any) => Promise<void>;
  toggleTheme: (newTheme: 'dark' | 'light') => Promise<void>;
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
  activeOrgId: storage.getNumber('activeOrgId') || null,
  biometricsEnabled: storage.getBool('biometricsEnabled') || false,

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isApproved: user?.is_approved ?? false,
      isStaff: user?.role === 'admin' || user?.is_staff === true,
    });
  },

  setTokens: async (access: string, refresh: string) => {
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  setActiveOrgId: (id: number | null) => {
    if (id) storage.set('activeOrgId', id);
    else storage.delete('activeOrgId');
    set({ activeOrgId: id });
  },

  setBiometricsEnabled: (enabled: boolean) => {
    storage.set('biometricsEnabled', enabled);
    set({ biometricsEnabled: enabled });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      if (response.requires_2fa) {
        set({ isLoading: false });
        return response;
      }

      await get().setTokens(response.access, response.refresh);
      const user: User | undefined = response.user;
      get().setUser(user || null);
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.detail || 'Login failed' });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isApproved: false,
        isStaff: false,
      });
    }
  },

  checkAuth: async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (!accessToken) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authAPI.getCurrentUser();
      set({
        user,
        accessToken,
        refreshToken: await SecureStore.getItemAsync('refreshToken'),
        isAuthenticated: true,
        isApproved: user.is_approved ?? false,
        isStaff: user.role === 'admin' || user.is_staff === true,
        isLoading: false,
      });
    } catch (error) {
      await get().logout();
    }
  },

  initializeAuth: async () => {
    await get().checkAuth();
  },

  clearError: () => set({ error: null }),

  updateProfile: async (data: any) => {
    const updatedUser = await authAPI.updateProfile(data);
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null
    }));
  },

  toggleTheme: async (newTheme: 'dark' | 'light') => {
    if (get().user) {
      await authAPI.updateProfile({ theme_preference: newTheme });
      set((state) => ({
        user: state.user ? { ...state.user, theme_preference: newTheme } : null
      }));
    }
  },
}));

export default useAuthStore;
