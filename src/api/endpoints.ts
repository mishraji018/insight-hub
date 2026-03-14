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
  user?: User; // included in CustomTokenObtainPairView.post
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
  name?: string;
  is_approved?: boolean;
  is_email_verified?: boolean;
  avatar?: string | null;
  theme_preference?: 'light' | 'dark';
  date_joined?: string;
  two_fa_enabled?: boolean;
  onboarding_complete?: boolean;
  onboarding_step?: number;
  is_staff?: boolean;
  digest_enabled?: boolean;
  security_alerts_enabled?: boolean;
  subscription_plan?: Plan | null;
  stripe_customer_id?: string | null;
  query_usage_count?: number;
  last_usage_reset?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  invite_token?: string | null;
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: string;
  message: string;
}

export interface DashboardData {
  total_users: number;
  total_predictions: number;
  active_models: number;
  recent_activity: Array<{
    id: number;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

export interface AnalyticsSummary {
  total_sales: number;
  total_revenue: number;
  growth_rate: number;
  top_products: Array<{ name: string; sales: number }>;
  monthly_data: Array<{ month: string; sales: number; revenue: number }>;
}

export interface SalesData {
  id: number;
  date: string;
  product: string;
  quantity: number;
  revenue: number;
}

export interface Prediction {
  id: number;
  model_name: string;
  input_data: any;
  prediction: any;
  confidence?: number;
  created_at: string;
  created_by: User;
}

export interface PredictionRequest {
  model_name: string;
  input_data: any;
}

export interface Model {
  id: number;
  name: string;
  version: string;
  is_active: boolean;
  accuracy?: number;
  created_at: string;
}

export interface TaskStatus {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  result?: any;
  metrics?: any;
  error?: string;
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

export interface AdminStats {
  total_users: number;
  active_today: number;
  new_this_week: number;
  new_this_month: number;
  total_logins_today: number;
  failed_logins_today: number;
  locked_accounts_count: number;
  most_used_features: Array<{ feature_name: string; count: number }>;
  user_growth: Array<{ month: string; count: number }>;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  joined: string;
  last_login: string | null;
  is_verified: boolean;
  is_locked: boolean;
  two_fa_enabled: boolean;
  is_active: boolean;
  login_count: number;
}

export interface AuditLog {
  id: number;
  user: number | null;
  user_email: string | null;
  action: string;
  target_user: number | null;
  target_user_email: string | null;
  ip_address: string;
  user_agent: string;
  metadata: any;
  created_at: string;
}

export interface AuditLogResponse {
  results: AuditLog[];
  total_pages: number;
  current_page: number;
  total_count: number;
}

export interface SearchResult {
  users: Array<{ id: number; name: string; email: string; avatar: string | null }>;
}

export interface Organisation {
  id: number;
  name: string;
  owner?: number;
  owner_email?: string;
  plan?: number;
  plan_name?: string;
  invite_code?: string;
  created_at: string;
}

export interface OrgMember {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  organisation: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface APIKey {
  id: number;
  name: string;
  prefix: string;
  last_used: string | null;
  is_active: boolean;
  rate_limit: number;
  created_at: string;
}

// ============================================================================
// Auth Endpoints
// ============================================================================

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post('/api/token/', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response: AxiosResponse<RegisterResponse> = await axiosInstance.post('/api/auth/register/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      // In Simple JWT, logout usually just clears client-side unless using blacklist
      // We'll just clear storage for now
    }
    sessionStorage.clear();
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.get('/api/auth/me/');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response: AxiosResponse<{ access: string }> = await axiosInstance.post('/api/token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  changePassword: async (data: { old_password: string; new_password: string }): Promise<void> => {
    await axiosInstance.post('/api/auth/change-password/', data);
  },

  getLoginHistory: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/api/auth/login-history/');
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

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axiosInstance.post('/api/auth/upload-avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  trackActivity: async (feature_name: string): Promise<void> => {
    await axiosInstance.post('/api/analytics/track/', { feature_name });
  },

  getUserStats: async (): Promise<any> => {
    const response = await axiosInstance.get('/api/analytics/my-stats/');
    return response.data;
  },

  getNotifications: async (): Promise<{ results: Notification[]; unread_count: number }> => {
    const response = await axiosInstance.get('/api/notifications/');
    return response.data;
  },

  markNotificationRead: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/api/notifications/${id}/read/`);
  },

  clearNotifications: async (): Promise<void> => {
    await axiosInstance.delete('/api/notifications/clear-all/');
  },

  getSessions: async (): Promise<UserSession[]> => {
    const response = await axiosInstance.get('/api/auth/sessions/');
    return response.data;
  },

  revokeSession: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/auth/sessions/${id}/revoke/`);
  },

  revokeAllSessions: async (): Promise<void> => {
    await axiosInstance.delete('/api/auth/sessions/logout-all/');
  },

  exportData: async (format: 'json' | 'pdf' = 'json'): Promise<any> => {
    if (format === 'pdf') {
      const response = await axiosInstance.get('/api/auth/export-data/', {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    }
    const response = await axiosInstance.get('/api/auth/export-data/', { params: { format } });
    return response.data;
  },

  setup2FA: async (): Promise<{ secret: string; qr_code: string }> => {
    const response = await axiosInstance.get('/api/auth/2fa/setup/');
    return response.data;
  },

  enable2FA: async (otp_code: string): Promise<{ message: string; backup_codes: string[] }> => {
    const response = await axiosInstance.post('/api/auth/2fa/enable/', { otp_code });
    return response.data;
  },

  disable2FA: async (data: { password: string; otp_code: string }): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/api/auth/2fa/disable/', data);
    return response.data;
  },

  verify2FA: async (email: string, otp_code: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/api/auth/2fa/verify/', { email, otp_code });
    return response.data;
  },

  completeOnboarding: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.patch('/api/auth/onboarding/complete/');
    return response.data;
  },
};

export const billingAPI = {
  createCheckout: async (plan_id: number): Promise<{ url: string }> => {
    const response = await axiosInstance.post('/api/billing/create-checkout/', { plan_id });
    return response.data;
  },

  createPortal: async (): Promise<{ url: string }> => {
    const response = await axiosInstance.post('/api/billing/portal/');
    return response.data;
  },

  getUsage: async (): Promise<{
    plan_name: string;
    usage: number;
    limit: number;
    can_export: boolean;
    remaining: number;
  }> => {
    const response = await axiosInstance.get('/api/billing/usage/');
    return response.data;
  },
};

export const orgAPI = {
  getOrganisations: async (): Promise<Organisation[]> => {
    const response = await axiosInstance.get('/api/organisations/');
    return response.data;
  },

  createOrganisation: async (name: string): Promise<Organisation> => {
    const response = await axiosInstance.post('/api/organisations/', { name });
    return response.data;
  },

  getMembers: async (id: number): Promise<OrgMember[]> => {
    const response = await axiosInstance.get(`/api/organisations/${id}/members/`);
    return response.data;
  },

  generateInvite: async (id: number): Promise<{ invite_code: string }> => {
    const response = await axiosInstance.post(`/api/organisations/${id}/generate_invite/`);
    return response.data;
  },

  join: async (code: string): Promise<{ message: string; org_id: number }> => {
    const response = await axiosInstance.post('/api/organisations/join/', { code });
    return response.data;
  },

  changeRole: async (orgId: number, memberId: number, role: string): Promise<{ message: string }> => {
    const response = await axiosInstance.patch(`/api/organisations/${orgId}/members/${memberId}/role/`, { role });
    return response.data;
  },

  removeMember: async (orgId: number, memberId: number): Promise<void> => {
    await axiosInstance.delete(`/api/organisations/${orgId}/members/${memberId}/`);
  },
};

export const developerAPI = {
  getKeys: async (): Promise<APIKey[]> => {
    const response = await axiosInstance.get('/api/developer/keys/');
    return response.data;
  },

  createKey: async (name: string): Promise<APIKey & { key: string }> => {
    const response = await axiosInstance.post('/api/developer/keys/', { name });
    return response.data;
  },

  toggleKey: async (id: number): Promise<{ is_active: boolean }> => {
    const response = await axiosInstance.post(`/api/developer/keys/${id}/toggle/`);
    return response.data;
  },

  deleteKey: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/developer/keys/${id}/`);
  },
};

// ============================================================================
// Dashboard / Analytics Endpoints
// ============================================================================

export const dashboardAPI = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response: AxiosResponse<DashboardData> = await axiosInstance.get('/dashboard');
    return response.data;
  },
};

export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    const response = await axiosInstance.get('/api/admin/stats/');
    return response.data;
  },

  getUsers: async (search?: string): Promise<AdminUser[]> => {
    const response = await axiosInstance.get('/api/admin/users/', { params: { search } });
    return response.data;
  },

  performUserAction: async (id: number, action: 'unlock' | 'toggle_active' | 'force_logout'): Promise<{ message: string }> => {
    const response = await axiosInstance.patch(`/api/admin/users/${id}/action/`, { action });
    return response.data;
  },

  getAuditLogs: async (params?: { action?: string; user?: string; page?: number }): Promise<AuditLogResponse> => {
    const response = await axiosInstance.get('/api/admin/audit-log/', { params });
    return response.data;
  },

  exportAuditLogs: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/api/admin/audit-log/export/', { responseType: 'blob' });
    return response.data;
  },
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response: AxiosResponse<AnalyticsSummary> = await axiosInstance.get('/analytics/summary');
  return response.data;
};

export const getSalesData = async (params?: any): Promise<SalesData[]> => {
  const response: AxiosResponse<SalesData[]> = await axiosInstance.get('/analytics/sales', { params });
  return response.data;
};

export const uploadCSV = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/analytics/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const downloadPDFReport = async (from_date: string, to_date: string): Promise<Blob> => {
  const response = await axiosInstance.get('/analytics/report/pdf', {
    params: { from_date, to_date },
    responseType: 'blob'
  });
  return response.data;
};

export const downloadExcelReport = async (from_date: string, to_date: string): Promise<Blob> => {
  const response = await axiosInstance.get('/analytics/report/excel', {
    params: { from_date, to_date },
    responseType: 'blob'
  });
  return response.data;
};

// ============================================================================
// Prediction Endpoints
// ============================================================================

export const predictionAPI = {
  getAllPredictions: async (): Promise<Prediction[]> => {
    const response: AxiosResponse<Prediction[]> = await axiosInstance.get('/predictions');
    return response.data;
  },

  getPredictionById: async (id: number): Promise<Prediction> => {
    const response: AxiosResponse<Prediction> = await axiosInstance.get(`/predictions/${id}`);
    return response.data;
  },

  createPrediction: async (data: PredictionRequest): Promise<Prediction> => {
    const response: AxiosResponse<Prediction> = await axiosInstance.post('/predictions', data);
    return response.data;
  },

  deletePrediction: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/predictions/${id}`);
  },
};

export const getPredictions = async (params?: any): Promise<any> => {
  const response: AxiosResponse<Prediction[]> = await axiosInstance.get('/predictions', { params });
  return response.data;
};

// ============================================================================
// Model Training Endpoints
// ============================================================================

export const trainModel = async (data: { model_type: string; parameters?: any }): Promise<{ task_id: string }> => {
  const response = await axiosInstance.post('/models/train', data);
  return response.data;
};

export const getTaskStatus = async (taskId: string): Promise<TaskStatus> => {
  const response: AxiosResponse<TaskStatus> = await axiosInstance.get(`/models/task/${taskId}`);
  return response.data;
};

export const getModels = async (): Promise<Model[]> => {
  const response: AxiosResponse<Model[]> = await axiosInstance.get('/models');
  return response.data;
};

export const activateModel = async (modelId: number): Promise<Model> => {
  const response: AxiosResponse<Model> = await axiosInstance.post(`/models/${modelId}/activate`);
  return response.data;
};

// ============================================================================
// User Management Endpoints (Admin only)
// ============================================================================

export const userAPI = {
  getAllUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await axiosInstance.get('/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.patch(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  approveUser: async (id: number): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.post(`/users/${id}/approve`);
    return response.data;
  },
};

// ============================================================================
// Export
// ============================================================================

export const api = {
  auth: authAPI,
  dashboard: dashboardAPI,
  predictions: predictionAPI,
  users: userAPI,
  admin: adminAPI,
  billing: billingAPI,
  org: orgAPI,
  developer: developerAPI,
  search: async (query: string): Promise<SearchResult> => {
    const response = await axiosInstance.get('/api/search/', { params: { q: query } });
    return response.data;
  },
};

export default api;