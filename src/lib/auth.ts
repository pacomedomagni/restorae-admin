import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Log environment at startup
console.log('NextAuth Config - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NextAuth Config - NODE_ENV:', process.env.NODE_ENV);

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const apiRoot = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
          const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
          const url = `${apiRoot}${apiPrefix}/auth/login`;
          
          console.log('Auth: Connecting to', url);
          
          const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" }
          });
          
          const data = await res.json();

          if (res.ok && data) {
            if (!['ADMIN', 'ANALYST', 'SUPPORT'].includes(data.user?.role)) {
              console.log('Auth: User role not allowed:', data.user?.role);
              return null;
            }
            console.log('Auth: Login successful for', data.user?.email);
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              accessToken: data.accessToken,
            };
          }
          console.log('Auth: Login failed', res.status, data);
          return null;
        } catch (e) {
          console.error('Auth: Login error', e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Use non-secure cookie prefix for HTTP localhost
  // When secure is false, NextAuth uses "next-auth." prefix instead of "__Secure-next-auth."
  useSecureCookies: false,
};
