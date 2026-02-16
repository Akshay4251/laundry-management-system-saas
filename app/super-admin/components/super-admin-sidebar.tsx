// app/(super-admin)/components/super-admin-sidebar.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/super-admin' },
  { icon: Users, label: 'Users', href: '/super-admin/users' },
  { icon: Building2, label: 'Businesses', href: '/super-admin/businesses' },
  { icon: CreditCard, label: 'Subscriptions', href: '/super-admin/subscriptions' },
];

export function SuperAdminSidebar({ isCollapsed: externalCollapsed, onToggleCollapse, isMobile = false, onItemClick }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  const isCollapsed = isMobile ? false : (externalCollapsed ?? internalCollapsed);

  const handleToggle = () => {
    if (isMobile) return;
    const newState = !isCollapsed;
    setInternalCollapsed(newState);
    onToggleCollapse?.(newState);
  };

  const isActive = (href: string) => {
    if (href === '/super-admin') return pathname === '/super-admin';
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : (isMobile ? '100%' : 256) }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'bg-white border-r border-slate-200 h-full flex flex-col',
        isMobile ? 'relative w-full' : 'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] hidden lg:flex'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Super Admin</h1>
              <p className="text-[10px] text-slate-500">Platform Control</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <AnimatePresence>
        {!isMobile && (isHovered || isCollapsed) && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={handleToggle}
            className={cn(
              'absolute -right-4 top-6 z-50 h-8 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group',
              isCollapsed ? 'w-8' : 'w-auto px-3 gap-1.5'
            )}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-slate-600 group-hover:text-red-600" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4 text-slate-600 group-hover:text-red-600" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-red-600">Collapse</span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href} onClick={onItemClick}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                  active
                    ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                    : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-red-600' : 'text-slate-500')} />
                <motion.span
                  animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                  className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="mt-3 bg-red-50 rounded-xl p-3 border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-slate-700">Super Admin</span>
            </div>
            <p className="text-[10px] text-slate-500">Full platform access</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}