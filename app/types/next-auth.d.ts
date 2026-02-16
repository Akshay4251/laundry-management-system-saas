//app/types/next-auth.d.ts
import { UserRole } from '@prisma/client';
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole | 'SUPER_ADMIN';
      businessId: string | null;
      isSuperAdmin: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole | 'SUPER_ADMIN';
    businessId: string | null;
    isSuperAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole | 'SUPER_ADMIN';
    businessId: string | null;
    isSuperAdmin: boolean;
  }
}