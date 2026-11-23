import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthTokens } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  hasRole: (roles: string[]) => boolean;
  hasPlan: (plans: string[]) => boolean;
  canUseAI: () => boolean;
  getBidLimit: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  const loadStoredAuth = useCallback(async () => {
    const storedAccessToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');

    if (storedAccessToken && storedRefreshToken) {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setTokens({
          access_token: storedAccessToken,
          refresh_token: storedRefreshToken,
          token_type: 'bearer',
          expires_in: 900,
        });
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const login = async (email: string, password: string) => {
    const newTokens = await api.login({ email, password });
    setTokens(newTokens);
    const userData = await api.getCurrentUser();
    setUser(userData);
  };

  const register = async (data: { email: string; password: string; full_name: string; role: string }) => {
    const newTokens = await api.register(data);
    setTokens(newTokens);
    const userData = await api.getCurrentUser();
    setUser(userData);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setTokens(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      await logout();
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const hasRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const hasPlan = (plans: string[]) => {
    return user ? plans.includes(user.plan) : false;
  };

  const canUseAI = () => {
    return user ? ['pro', 'agency'].includes(user.plan) : false;
  };

  const getBidLimit = () => {
    if (!user) return 2;
    if (user.plan === 'starter') return 2;
    return -1; // unlimited
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        hasRole,
        hasPlan,
        canUseAI,
        getBidLimit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}