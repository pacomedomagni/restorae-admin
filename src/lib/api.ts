import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
axiosInstance.interceptors.request.use((config) => {
  // Get token from session/storage
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T = any>(url: string) => axiosInstance.get<any, T>(url),
  post: <T = any>(url: string, data?: any) => axiosInstance.post<any, T>(url, data),
  patch: <T = any>(url: string, data?: any) => axiosInstance.patch<any, T>(url, data),
  put: <T = any>(url: string, data?: any) => axiosInstance.put<any, T>(url, data),
  delete: <T = any>(url: string) => axiosInstance.delete<any, T>(url),
};
