import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TokenResponse, ApiError, User, Project, Bid, Message, Transaction, Withdrawal, PaginatedResponse, RegisterData, UserPlan } from '@/types';

const VITE_API_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
if (!VITE_API_URL) {
  throw new Error('VITE_API_URL environment variable is required. Please set it in your .env file.');
}
const API_BASE_URL = VITE_API_URL;

interface GenericParams {
  [key: string]: string | number | boolean | undefined | string[];
}

interface GenericData {
  [key: string]: unknown;
}

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

        const { access_token } = response.data;
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
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return response.data;
  }

  async register(data: RegisterData): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
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
  async get<T>(url: string, params?: GenericParams): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: GenericData): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: GenericData): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: GenericData): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // File upload
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<{ url: string }>(url, formData, {
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
  register: (data: RegisterData) => api.register(data),
  logout: () => api.logout(),
  getCurrentUser: () => api.getCurrentUser(),
  refreshToken: () => api.refreshToken(),
  forgotPassword: (email: string) => api.forgotPassword(email),
  resetPassword: (token: string, newPassword: string) => api.resetPassword(token, newPassword),
  verifyEmail: (token: string) => api.verifyEmail(token),
};

export const projectService = {
  list: <T = PaginatedResponse<Project>>(params?: GenericParams) => api.get<T>('/projects', params),
  get: <T = Project>(uuid: string) => api.get<T>(`/projects/${uuid}`),
  create: <T = Project>(data: GenericData) => api.post<T>('/projects', data),
  update: <T = Project>(uuid: string, data: GenericData) => api.patch<T>(`/projects/${uuid}`, data),
  delete: <T = void>(uuid: string) => api.delete<T>(`/projects/${uuid}`),
  publish: <T = Project>(uuid: string) => api.post<T>(`/projects/${uuid}/publish`),
  close: <T = Project>(uuid: string) => api.post<T>(`/projects/${uuid}/close`),
  parseProject: <T = Project>(description: string) => api.post<T>('/projects/parse', { description }),
  getCategories: <T = { items: Array<{ id: number; name: string }> }>() => api.get<T>('/categories'),
};

export const bidService = {
  list: <T = PaginatedResponse<Bid>>(projectUuid: string, params?: GenericParams) => api.get<T>(`/projects/${projectUuid}/bids`, params),
  create: <T = Bid>(projectUuid: string, data: GenericData) => api.post<T>(`/projects/${projectUuid}/bids`, data),
  get: <T = Bid>(uuid: string) => api.get<T>(`/bids/${uuid}`),
  accept: <T = Bid>(uuid: string) => api.post<T>(`/bids/${uuid}/accept`),
  reject: <T = Bid>(uuid: string) => api.post<T>(`/bids/${uuid}/reject`),
  withdraw: <T = Bid>(uuid: string) => api.post<T>(`/bids/${uuid}/withdraw`),
  shortlist: <T = Bid>(uuid: string) => api.post<T>(`/bids/${uuid}/shortlist`),
};

export const messageService = {
  list: <T = PaginatedResponse<Message>>(projectUuid: string, params?: GenericParams) => api.get<T>(`/projects/${projectUuid}/messages`, params),
  send: <T = Message>(projectUuid: string, data: GenericData) => api.post<T>(`/projects/${projectUuid}/messages`, data),
  markRead: <T = Message>(messageId: number) => api.post<T>(`/messages/${messageId}/read`),
};

export const balanceService = {
  get: <T = { balance_cents: number; pending_balance_cents: number }>() => api.get<T>('/balance'),
  deposit: <T = { checkout_url: string }>(data: GenericData) => api.post<T>('/balance/deposit', data),
  withdraw: <T = Withdrawal>(data: GenericData) => api.post<T>('/balance/withdraw', data),
  transactions: <T = PaginatedResponse<Transaction>>(params?: GenericParams) => api.get<T>('/balance/transactions', params),
  withdrawals: <T = PaginatedResponse<Withdrawal>>(params?: GenericParams) => api.get<T>('/balance/withdrawals', params),
};

export const aiService = {
  generateProposal: <T = { proposal: string }>(data: GenericData) => api.post<T>('/ai/generate-proposal', data),
  improveProfile: <T = { improved: string }>(data: GenericData) => api.post<T>('/ai/improve-profile', data),
  matchProjects: <T = PaginatedResponse<Project>>(data: GenericData) => api.post<T>('/ai/match-projects', data),
  analyzeProject: <T = { analysis: string }>(projectUuid: string) => api.post<T>(`/ai/analyze-project/${projectUuid}`),
};

export const billingService = {
  getPlans: <T = Array<{ plan: UserPlan; price: number; features: string[] }>>() => api.get<T>('/billing/plans'),
  subscribe: <T = { checkout_url: string }>(plan: string, interval: string) => api.post<T>('/billing/subscribe', { plan, interval }),
  cancelSubscription: <T = void>() => api.post<T>('/billing/cancel'),
  getPortalUrl: <T = { portal_url: string }>() => api.get<T>('/billing/portal'),
  getInvoices: <T = Array<{ id: string; created_at: string; description: string | null; amount_cents: number; status: string }>>() => api.get<T>('/billing/invoices'),
};

export const userService = {
  getProfile: <T = User>(id: number) => api.get<T>(`/users/${id}`),
  updateProfile: <T = User>(id: number, data: GenericData) => api.patch<T>(`/users/${id}`, data),
  uploadAvatar: (file: File, onProgress?: (progress: number) => void) =>
    api.uploadFile('/users/avatar', file, onProgress),
  deleteAccount: <T = void>() => api.delete<T>('/users/me'),
  getCategories: <T = { items: Array<{ id: number; name: string }> }>() => api.get<T>('/users/categories'),
  listTalent: <T = { items: User[]; total: number; total_pages: number }>(params?: GenericParams) => api.get<T>('/users/talent', params),
};

export const adminService = {
  getStats: <T = { users: number; projects: number; revenue_cents: number }>() => api.get<T>('/admin/stats'),
  getUsers: <T = PaginatedResponse<User>>(params?: GenericParams) => api.get<T>('/admin/users', params),
  getUser: <T = User>(id: number) => api.get<T>(`/admin/users/${id}`),
  updateUser: <T = User>(id: number, data: GenericData) => api.patch<T>(`/admin/users/${id}`, data),
  deleteUser: <T = void>(id: number) => api.delete<T>(`/admin/users/${id}`),
  getProjects: <T = PaginatedResponse<Project>>(params?: GenericParams) => api.get<T>('/admin/projects', params),
  getTransactions: <T = PaginatedResponse<Transaction>>(params?: GenericParams) => api.get<T>('/admin/transactions', params),
  getWithdrawals: <T = PaginatedResponse<Withdrawal>>(params?: GenericParams) => api.get<T>('/admin/withdrawals', params),
  approveWithdrawal: <T = Withdrawal>(id: number) => api.post<T>(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: <T = Withdrawal>(id: number, reason: string) => api.post<T>(`/admin/withdrawals/${id}/reject`, { reason }),
};