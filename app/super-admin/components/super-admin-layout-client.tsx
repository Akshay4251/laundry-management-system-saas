// app/(super-admin)/components/super-admin-layout-client.tsx

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { SuperAdminSidebar } from './super-admin-sidebar';
import { SuperAdminHeader } from './super-admin-header';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  session: Session;
}

export function SuperAdminLayoutClient({ children, session }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      <SuperAdminHeader session={session} onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="hidden lg:block">
        <SuperAdminSidebar isCollapsed={sidebarCollapsed} onToggleCollapse={setSidebarCollapsed} />
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-slate-200">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Super admin navigation</SheetDescription>
          </SheetHeader>
          <SuperAdminSidebar isCollapsed={false} isMobile onItemClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className={`transition-all duration-300 min-h-[calc(100vh-4rem)] ml-0 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        <div className="w-full h-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}