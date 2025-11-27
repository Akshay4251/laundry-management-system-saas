'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { AnimatePresence, motion } from 'framer-motion';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/create-order': 'Create Order',
  '/dashboard/order-review': 'Order Review',
  '/dashboard/orders': 'Orders',
  '/dashboard/customers': 'Customers',
  '/dashboard/services': 'Services',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/staff': 'Staff',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
  '/dashboard/bookings': 'All Bookings',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const pageTitle = pageTitles[pathname] || 'Dashboard';
  const showCreateOrder = pathname !== '/dashboard/create-order';

  // Minimal padding for POS pages
  const isMinimalPadding = pathname === '/dashboard/create-order' || pathname === '/dashboard/order-review';

  return (
    <div className="min-h-screen bg-slate-200">
      {/* Header */}
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

      {/* Mobile Sidebar (Sheet using Regular Sidebar) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-slate-200">
          {/* Accessibility Fix */}
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Mobile navigation sidebar</SheetDescription>
          </SheetHeader>
          
          {/* Reusing Regular Sidebar */}
          <div className="h-full w-full">
            <Sidebar 
              isCollapsed={false} // Always expanded on mobile
              isMobile={true}     // New prop to handle mobile adjustments
              onItemClick={() => setMobileMenuOpen(false)} // Close on click
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300
          min-h-[calc(100vh-4rem)]
          ${/* Mobile: No Margin */ 'ml-0'}
          ${/* Desktop: Dynamic Margin */ sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}
        `}
      >
        <div 
          className={`
            w-full h-full
            ${isMinimalPadding ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}
          `}
        >
          <div className="max-w-[1600px] mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
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