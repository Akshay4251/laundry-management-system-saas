// app/(super-admin)/layout.tsx

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SuperAdminLayoutClient } from './components/super-admin-layout-client';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect('/login');
  }

  return (
    <SuperAdminLayoutClient session={session}>
      {children}
    </SuperAdminLayoutClient>
  );
}