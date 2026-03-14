import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user_id: number;
  email: string;
  role: 'admin' | 'predictor' | 'analyst' | 'user' | 'executive' | 'manager';
  full_name?: string;
  is_approved: boolean;
  is_staff: boolean;
  user?: User;
  requires_2fa?: boolean;
}

export interface Plan {
  id: number;
  name: 'free' | 'pro' | 'enterprise';
  stripe_price_id?: string;
  max_queries: number;
  can_export: boolean;
  has_custom_domain: boolean;
  is_multi_user: boolean;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'predictor' | 'analyst' | 'user' | 'executive' | 'manager';
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  theme_preference?: 'light' | 'dark';
  date_joined?: string;
  two_fa_enabled?: boolean;
  is_staff?: boolean;
  subscription_plan?: Plan | null;
  query_usage_count?: number;
  is_approved?: boolean;
  digest_enabled?: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: 'login' | 'security' | 'system';
  created_at: string;
}

export interface UserSession {
  id: number;
  device_name: string;
  browser: string;
  ip_address: string | null;
  last_active: string;
  is_active: boolean;
}

// ============================================================================
// Auth Endpoints
// ============================================================================

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post('/api/token/', credentials);
    return response.data;
  },

  register: async (data: any): Promise<any> => {
    const response = await axiosInstance.post('/api/auth/register/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Handled in Store to clear storage
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.get('/api/auth/me/');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/api/auth/forgot-password/', { email });
    return response.data;
  },

  resetPassword: async (data: any): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/api/auth/reset-password/', data);
    return response.data;
  },

  verifyEmail: async (data: { email: string; otp: string }): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/api/auth/verify-email/', data);
    return response.data;
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/api/auth/resend-verification/', { email });
    return response.data;
  },

  updateProfile: async (data: any): Promise<any> => {
    const response = await axiosInstance.patch('/api/auth/profile/', data);
    return response.data;
  },

  uploadAvatar: async (formData: FormData): Promise<{ avatar_url: string }> => {
    const response = await axiosInstance.post('/api/auth/upload-avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getNotifications: async (): Promise<{ results: Notification[]; unread_count: number }> => {
    const response = await axiosInstance.get('/api/notifications/');
    return response.data;
  },

  clearNotifications: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/api/notifications/clear/');
    return response.data;
  },

  getSessions: async (): Promise<UserSession[]> => {
    const response = await axiosInstance.get('/api/auth/sessions/');
    return response.data;
  },

  revokeSession: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/auth/sessions/${id}/revoke/`);
  },

  verify2FA: async (email: string, otp_code: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/api/auth/2fa/verify/', { email, otp_code });
    return response.data;
  },
};

export const api = {
  auth: authAPI,
  // Add other modules as needed
};

export default api;
