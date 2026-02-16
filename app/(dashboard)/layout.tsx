// app/(dashboard)/layout.tsx

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { SubscriptionBanner } from '@/components/dashboard/subscription-banner';
import { AppShell } from '@/components/app-shell'; // ⚡ NEW
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isPrintPage = pathname?.includes('/print/');

  if (isPrintPage) {
    return (
      <div className="min-h-screen bg-white w-full h-full">
        {children}
      </div>
    );
  }

  const showCreateOrder = pathname !== '/dashboard/create-order';
  const isMinimalPadding =
    pathname === '/dashboard/create-order' ||
    pathname === '/dashboard/order-review';

  return (
    // ⚡ NEW: Single unified auth/subscription check
    <AppShell>
      <div className="min-h-screen bg-slate-100">
        {/* Fixed Header */}
        <Header
          showCreateOrder={showCreateOrder}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 border-r-slate-200">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Mobile navigation sidebar</SheetDescription>
            </SheetHeader>
            <div className="h-full w-full">
              <Sidebar
                isCollapsed={false}
                isMobile={true}
                onItemClick={() => setMobileMenuOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main
          className={cn(
            'min-h-screen pt-16 transition-all duration-300 ease-in-out',
            sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
          )}
        >
          {/* Banner */}
          <SubscriptionBanner />

          {/* Page Content */}
          <div
            className={cn(
              'w-full',
              isMinimalPadding
                ? 'pt-0'
                : 'pt-0 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8'
            )}
          >
            <div className="max-w-[1600px] mx-auto">
              {/* Simple fade-in via CSS instead */}
              <div className="animate-in fade-in duration-200">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}