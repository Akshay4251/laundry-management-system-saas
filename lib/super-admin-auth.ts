// lib/super-admin-auth.ts

import bcrypt from 'bcryptjs';

/**
 * Check if email is a super admin (from environment variables)
 */
export function isSuperAdminEmail(email: string): boolean {
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  return superAdminEmails.includes(email.toLowerCase());
}

/**
 * Verify super admin password (from environment variables)
 */
export async function verifySuperAdminPassword(password: string): Promise<boolean> {
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  
  if (!superAdminPassword) {
    console.error('❌ SUPER_ADMIN_PASSWORD not configured in .env');
    return false;
  }

  // If password starts with $2a$ or $2b$, it's bcrypt hashed
  if (superAdminPassword.startsWith('$2a$') || superAdminPassword.startsWith('$2b$')) {
    return bcrypt.compare(password, superAdminPassword);
  }

  // Plain text comparison (development only)
  if (process.env.NODE_ENV === 'development') {
    return password === superAdminPassword;
  }

  console.error('❌ Super admin password must be hashed in production');
  return false;
}

/**
 * Get super admin configuration
 */
export function getSuperAdminConfig() {
  return {
    emails: process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [],
    isConfigured: !!(process.env.SUPER_ADMIN_EMAILS && process.env.SUPER_ADMIN_PASSWORD),
  };
}