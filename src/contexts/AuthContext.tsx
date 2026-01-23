'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Verify token by fetching user profile
      const userData = await api.get('/users/me');
      
      // Check if user has admin role
      if (!['ADMIN', 'ANALYST', 'SUPPORT'].includes(userData.role)) {
        throw new Error('Insufficient permissions');
      }

      setUser(userData);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('adminToken');
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      
      // Only redirect if on a protected page
      if (pathname?.startsWith('/dashboard')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response;

      // Check if user has admin role
      if (!['ADMIN', 'ANALYST', 'SUPPORT'].includes(userData.role)) {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store token
      localStorage.setItem('adminToken', accessToken);
      document.cookie = `adminToken=${accessToken}; path=/; max-age=86400; samesite=strict`;

      setUser(userData);
      
      // Redirect to dashboard or intended page
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
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

// HOC for protecting pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }

      if (!isLoading && isAuthenticated && requiredRoles) {
        if (!requiredRoles.includes(user!.role)) {
          router.push('/dashboard');
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (requiredRoles && !requiredRoles.includes(user!.role)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
