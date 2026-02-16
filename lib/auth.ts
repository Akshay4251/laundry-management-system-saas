// lib/auth.ts
// ✅ OPTIMIZED: Removed console.log for production

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isSuperAdminEmail, verifySuperAdminPassword } from '@/lib/super-admin-auth';
import type { UserRole } from '@prisma/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // SUPER ADMIN LOGIN
        if (isSuperAdminEmail(email)) {
          const isValidPassword = await verifySuperAdminPassword(password);

          if (!isValidPassword) {
            throw new Error('Invalid super admin credentials');
          }

          // ✅ REMOVED: console.log (security/performance)
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Super Admin logged in:', email);
          }

          return {
            id: 'super-admin',
            email: email,
            name: 'Super Administrator',
            role: 'SUPER_ADMIN' as const,
            businessId: null,
            isSuperAdmin: true,
          };
        }

        // REGULAR USER LOGIN
        const user = await prisma.user.findUnique({
          where: { email },
          include: { business: true },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // ✅ REMOVED: console.log
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ User logged in:', user.email);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          businessId: user.businessId,
          isSuperAdmin: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole | 'SUPER_ADMIN';
        token.businessId = user.businessId || null;
        token.isSuperAdmin = user.isSuperAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole | 'SUPER_ADMIN';
        session.user.businessId = token.businessId as string | null;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});