import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
const API_URL = `${API_ROOT}${API_PREFIX}`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
axiosInstance.interceptors.request.use(async (config) => {
  // Get token from NextAuth session
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
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
