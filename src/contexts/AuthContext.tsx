'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: (session.user as any).id || '',
      email: session.user.email || '',
      name: session.user.name || undefined,
      role: (session.user as any).role || '',
    };
  }, [session]);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error('Invalid credentials');
    }
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
