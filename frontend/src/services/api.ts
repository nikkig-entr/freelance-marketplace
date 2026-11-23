import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TokenResponse, ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiService {
  private client: AxiosInstance;
  private refreshPromise: Promise<TokenResponse> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newTokens = await this.refreshAccessToken();
            if (newTokens && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Handle other auth errors
        if (error.response?.status === 403) {
          this.handleAuthError();
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<TokenResponse | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await axios.post<TokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        // Refresh token is in HttpOnly cookie

        return response.data;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleAuthError() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/auth/login', credentials);
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    password_confirm: string;
    full_name: string;
    role: string;
  }): Promise<any> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/auth/refresh');
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post('/auth/reset-password', { token, new_password: newPassword });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.client.post('/auth/verify-email', { token });
  }

  // Generic CRUD methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // File upload
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  }
}

export const api = new ApiService();

// Export individual service modules
export const authService = {
  login: (credentials: { email: string; password: string }) => api.login(credentials),
  register: (data: any) => api.register(data),
  logout: () => api.logout(),
  getCurrentUser: () => api.getCurrentUser(),
  refreshToken: () => api.refreshToken(),
  forgotPassword: (email: string) => api.forgotPassword(email),
  resetPassword: (token: string, newPassword: string) => api.resetPassword(token, newPassword),
  verifyEmail: (token: string) => api.verifyEmail(token),
};

export const projectService = {
  list: (params?: any) => api.get('/projects', params),
  get: (uuid: string) => api.get(`/projects/${uuid}`),
  create: (data: any) => api.post('/projects', data),
  update: (uuid: string, data: any) => api.patch(`/projects/${uuid}`, data),
  delete: (uuid: string) => api.delete(`/projects/${uuid}`),
  publish: (uuid: string) => api.post(`/projects/${uuid}/publish`),
  close: (uuid: string) => api.post(`/projects/${uuid}/close`),
};

export const bidService = {
  list: (projectUuid: string, params?: any) => api.get(`/projects/${projectUuid}/bids`, params),
  create: (projectUuid: string, data: any) => api.post(`/projects/${projectUuid}/bids`, data),
  get: (uuid: string) => api.get(`/bids/${uuid}`),
  accept: (uuid: string) => api.post(`/bids/${uuid}/accept`),
  reject: (uuid: string) => api.post(`/bids/${uuid}/reject`),
  withdraw: (uuid: string) => api.post(`/bids/${uuid}/withdraw`),
  shortlist: (uuid: string) => api.post(`/bids/${uuid}/shortlist`),
};

export const messageService = {
  list: (projectUuid: string, params?: any) => api.get(`/projects/${projectUuid}/messages`, params),
  send: (projectUuid: string, data: any) => api.post(`/projects/${projectUuid}/messages`, data),
  markRead: (messageId: number) => api.post(`/messages/${messageId}/read`),
};

export const balanceService = {
  get: () => api.get('/balance'),
  deposit: (data: any) => api.post('/balance/deposit', data),
  withdraw: (data: any) => api.post('/balance/withdraw', data),
  transactions: (params?: any) => api.get('/balance/transactions', params),
  withdrawals: (params?: any) => api.get('/balance/withdrawals', params),
};

export const aiService = {
  generateProposal: (data: any) => api.post('/ai/generate-proposal', data),
  improveProfile: (data: any) => api.post('/ai/improve-profile', data),
  matchProjects: (data: any) => api.post('/ai/match-projects', data),
  analyzeProject: (projectUuid: string) => api.post(`/ai/analyze-project/${projectUuid}`),
};

export const billingService = {
  getPlans: () => api.get('/billing/plans'),
  subscribe: (plan: string, interval: string) => api.post('/billing/subscribe', { plan, interval }),
  cancelSubscription: () => api.post('/billing/cancel'),
  getPortalUrl: () => api.get('/billing/portal'),
  getInvoices: () => api.get('/billing/invoices'),
};

export const userService = {
  getProfile: (id: number) => api.get(`/users/${id}`),
  updateProfile: (id: number, data: any) => api.patch(`/users/${id}`, data),
  uploadAvatar: (file: File, onProgress?: (progress: number) => void) =>
    api.uploadFile('/users/avatar', file, onProgress),
  deleteAccount: () => api.delete('/users/me'),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', params),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: any) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getProjects: (params?: any) => api.get('/admin/projects', params),
  getTransactions: (params?: any) => api.get('/admin/transactions', params),
  getWithdrawals: (params?: any) => api.get('/admin/withdrawals', params),
  approveWithdrawal: (id: number) => api.post(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id: number, reason: string) => api.post(`/admin/withdrawals/${id}/reject`, { reason }),
};