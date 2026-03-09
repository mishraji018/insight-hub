import apiClient from "./client";

// Auth
export const login = (email: string, password: string) =>
  apiClient.post("/api/token/", { email, password });

export const refreshToken = (refresh: string) =>
  apiClient.post("/api/token/refresh/", { refresh });

// Analytics
export const getAnalyticsSummary = () =>
  apiClient.get("/api/analytics-summary/");

export const getSalesData = (params?: { page?: number; page_size?: number; ordering?: string }) =>
  apiClient.get("/api/sales-data/", { params });

// CSV Upload
export const uploadCSV = (file: File, onUploadProgress?: (e: { loaded: number; total?: number }) => void) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post("/api/upload-csv/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

// Model Training
export const trainModel = () =>
  apiClient.post("/api/train-model/");

export const getTaskStatus = (taskId: string) =>
  apiClient.get(`/api/task-status/${taskId}/`);

export const getModels = () =>
  apiClient.get("/api/models/");

export const activateModel = (modelId: string) =>
  apiClient.patch(`/api/models/${modelId}/`, { is_active: true });

// Reports
export const downloadPDFReport = (from: string, to: string) =>
  apiClient.get("/api/reports/pdf/", { params: { from, to }, responseType: "blob" });

export const downloadExcelReport = (from: string, to: string) =>
  apiClient.get("/api/reports/excel/", { params: { from, to }, responseType: "blob" });

// Predictions
export const getPredictions = (params?: Record<string, string>) =>
  apiClient.get("/api/predictions/", { params });
