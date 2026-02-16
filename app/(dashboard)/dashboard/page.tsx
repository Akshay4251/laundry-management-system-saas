// app/(dashboard)/dashboard/page.tsx

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client/page';

export default async function DashboardPage() {
  const session = await auth();

  // Redirect if not authenticated
  if (!session) {
    redirect('/login');
  }

  // Redirect super admins to their panel
  if (session.user.isSuperAdmin) {
    redirect('/super-admin');
  }

  // Pass session to client component
  return <DashboardClient session={session} />;
}