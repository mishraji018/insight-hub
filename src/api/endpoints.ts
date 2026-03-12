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
  full_name: string;
  is_approved: boolean;
  is_staff: boolean;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'predictor' | 'analyst' | 'user' | 'executive' | 'manager';
  first_name?: string;
  last_name?: string;
  is_approved?: boolean;
  invite_link?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  role?: string;
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
  error?: string;
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
      await axiosInstance.post('/api/token/refresh/', { refresh: refreshToken });
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

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response: AxiosResponse<AnalyticsSummary> = await axiosInstance.get('/analytics/summary');
  return response.data;
};

export const getSalesData = async (): Promise<SalesData[]> => {
  const response: AxiosResponse<SalesData[]> = await axiosInstance.get('/analytics/sales');
  return response.data;
};

export const uploadCSV = async (file: File): Promise<{ message: string; rows: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/analytics/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const downloadPDFReport = async (): Promise<Blob> => {
  const response = await axiosInstance.get('/analytics/report/pdf', { responseType: 'blob' });
  return response.data;
};

export const downloadExcelReport = async (): Promise<Blob> => {
  const response = await axiosInstance.get('/analytics/report/excel', { responseType: 'blob' });
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

export const getPredictions = async (): Promise<Prediction[]> => {
  const response: AxiosResponse<Prediction[]> = await axiosInstance.get('/predictions');
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
};

export default api;