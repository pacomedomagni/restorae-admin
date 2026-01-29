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
  const session = await getSession();
  const accessToken = (session as any)?.accessToken;
  
  if (!accessToken) {
    // No token - reject the request immediately instead of sending a 401
    throw new axios.Cancel('No auth token available');
  }
  
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Cancelled requests (no token) should just be silently ignored
    if (axios.isCancel(error)) {
      return Promise.reject(error);
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

// =========================================================================
// STORIES API
// =========================================================================

export const storiesApi = {
  getAll: () => api.get('/stories/admin/all'),
  getById: (id: string) => api.get(`/stories/${id}`),
  create: (data: any) => api.post('/stories/admin', data),
  update: (id: string, data: any) => api.put(`/stories/admin/${id}`, data),
  delete: (id: string) => api.delete(`/stories/admin/${id}`),
  
  // Categories (read-only - no admin endpoints for categories)
  getCategories: () => api.get('/stories/categories'),
};

// =========================================================================
// ACHIEVEMENTS API
// =========================================================================

export const achievementsApi = {
  getAll: () => api.get('/achievements/admin/all'),
  create: (data: any) => api.post('/achievements/admin', data),
  update: (id: string, data: any) => api.put(`/achievements/admin/${id}`, data),
  delete: (id: string) => api.delete(`/achievements/admin/${id}`),
  getLeaderboard: (limit?: number) => api.get(`/achievements/leaderboard${limit ? `?limit=${limit}` : ''}`),
};

// =========================================================================
// COACH MARKS API
// =========================================================================

export const coachMarksApi = {
  getAll: () => api.get('/coach-marks/admin/all'),
  create: (data: any) => api.post('/coach-marks/admin', data),
  update: (id: string, data: any) => api.put(`/coach-marks/admin/${id}`, data),
  delete: (id: string) => api.delete(`/coach-marks/admin/${id}`),
};
