'use client';

import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

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
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const user: User | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: (session.user as any).id,
      email: session.user.email || '',
      name: session.user.name || undefined,
      role: (session.user as any).role,
    };
  }, [session]);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!user;

  const checkAuth = async () => {
    // NextAuth manages session state; this is a no-op for compatibility.
    return;
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !['ADMIN', 'ANALYST', 'SUPPORT'].includes(user.role)) {
      signOut({ callbackUrl: '/login' });
      return;
    }

    if (!isLoading && !isAuthenticated && pathname?.startsWith('/dashboard')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router, user]);

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error('Invalid credentials');
    }

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/dashboard';
    router.push(redirect);
  };

  const logout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
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
