import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
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
          // Connect to Backend API to verify credentials
          const apiRoot = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
          const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
          const res = await fetch(`${apiRoot}${apiPrefix}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          });
          
          const user = await res.json();

          if (res.ok && user) {
            if (!['ADMIN', 'ANALYST', 'SUPPORT'].includes(user.user?.role)) {
              return null;
            }
            // Return user object with token
            return {
               id: user.user.id,
               name: user.user.name,
               email: user.user.email,
               role: user.user.role,
               accessToken: user.accessToken,
            };
          }
          return null;
        } catch (e) {
          console.error('Login error', e);
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
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session as any).accessToken = token.accessToken;
      (session.user as any).id = token.sub;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
};
