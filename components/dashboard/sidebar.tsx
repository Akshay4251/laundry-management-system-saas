'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UserCircle,
  Package,
  ShoppingBag,
  Calendar,
  Receipt,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  LucideIcon,
  Shirt,
  Clock,
  Loader,
  Truck,
  ClipboardList,
  FileText,
  ListChecks,
  IndianRupee,
  CheckCircle,
  PackageCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  badge?: string;
  children?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Home',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Order Operations',
    items: [
      { 
        icon: Clock, 
        label: 'Pending', 
        href: '/dashboard/orders?status=pending',
        badge: '5' 
      },
      { 
        icon: Loader, 
        label: 'In Progress', 
        href: '/dashboard/orders?status=processing',
        badge: '2' 
      },
      { 
        icon: CheckCircle, 
        label: 'Ready', 
        href: '/dashboard/orders?status=ready' 
      },
      { 
        icon: PackageCheck, 
        label: 'Pickup', 
        href: '/dashboard/orders?status=pickup' 
      },
      { 
        icon: Truck, 
        label: 'Out for Delivery', 
        href: '/dashboard/orders?status=delivery' 
      },
      { 
        icon: ListChecks, 
        label: 'All Orders', 
        href: '/dashboard/orders' 
      },
    ],
  },
  {
    title: 'Business Management',
    items: [
      { icon: UserCircle, label: 'Customers', href: '/dashboard/customers' },
      { icon: ClipboardList, label: 'Inventory', href: '/dashboard/inventory' },
      { icon: Package, label: 'Service Items', href: '/dashboard/services' },
      { icon: IndianRupee, label: 'Expenses', href: '/dashboard/expenses' },
      { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
      {
        icon: BarChart3,
        label: 'Reports',
        children: [
          { icon: FileText, label: 'Booking Reports', href: '/dashboard/reports/booking' },
          { icon: TrendingUp, label: 'Income Report', href: '/dashboard/reports/income' },
          { icon: TrendingDown, label: 'Expense Report', href: '/dashboard/reports/expense' },
          { icon: PieChart, label: 'Profit & Loss', href: '/dashboard/reports/profit-loss' },
        ],
      },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onItemClick?: () => void;
}

export function Sidebar({ 
  isCollapsed: externalCollapsed, 
  onToggleCollapse, 
  isMobile = false, 
  onItemClick 
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // ✅ FIX: Default closed state (Empty Array)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const pathname = usePathname();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isCollapsed = isMobile ? false : (externalCollapsed ?? internalCollapsed);

  const handleToggle = () => {
    if (isMobile) return;
    const newState = !isCollapsed;
    setInternalCollapsed(newState);
    onToggleCollapse?.(newState);
  };

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1000);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : (isMobile ? '100%' : 256) }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "bg-white border-r border-slate-200 h-full flex flex-col",
        // ✅ FIX: Force hidden on large screens if it's the mobile instance
        isMobile ? "relative w-full lg:hidden" : "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] hidden lg:flex"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile Header Logo (Only visible on Mobile) */}
      {isMobile && (
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">LaundryPro</h1>
              <p className="text-[10px] text-slate-500 leading-tight">Laundry Management</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Collapse Button (Hidden on Mobile) */}
      <AnimatePresence>
        {!isMobile && (isHovered || isCollapsed) && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onClick={handleToggle}
            className={cn(
              'absolute -right-4 top-6 z-50 h-8 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1.5 group',
              isCollapsed ? 'w-8 px-0' : 'w-auto px-3'
            )}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                  Collapse
                </span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav
        className={cn('flex-1 p-4 space-y-6 overflow-y-auto sidebar-scroll', isScrolling && 'scrolling')}
        onScroll={handleScroll}
      >
        <style jsx>{`
          .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
            transition: scrollbar-color 0.3s ease;
          }
          .sidebar-scroll.scrolling {
            scrollbar-color: #94a3b8 #f1f5f9;
          }
          .sidebar-scroll::-webkit-scrollbar { width: 6px; }
          .sidebar-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 10px; transition: background 0.3s ease; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; transition: background 0.3s ease; }
          .sidebar-scroll.scrolling::-webkit-scrollbar-track { background: #f1f5f9; }
          .sidebar-scroll.scrolling::-webkit-scrollbar-thumb { background: #94a3b8; }
          .sidebar-scroll.scrolling::-webkit-scrollbar-thumb:hover { background: #64748b; }
        `}</style>
        
        {menuSections.map((section, index) => (
          <div key={section.title}>
            <motion.div
              animate={{
                opacity: isCollapsed ? 0 : 1,
                height: isCollapsed ? 0 : 'auto',
                marginBottom: isCollapsed ? 0 : 8,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </h3>
            </motion.div>

            <div className="space-y-1">
              {section.items.map((item) => (
                <MenuItem
                  key={item.label}
                  item={item}
                  isCollapsed={isCollapsed}
                  pathname={pathname}
                  isExpanded={expandedMenus.includes(item.label)}
                  onToggle={() => toggleSubmenu(item.label)}
                  onItemClick={onItemClick} 
                />
              ))}
            </div>

            {!isCollapsed && index < menuSections.length - 1 && (
              <div className="mt-5 mx-3 border-t border-slate-100" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <motion.div
        animate={{
          opacity: isCollapsed ? 0 : 1,
          height: isCollapsed ? 0 : 'auto',
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden border-t border-slate-100 p-4 flex-shrink-0"
      >
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
          <p className="text-xs text-slate-700 font-semibold">LaundryPro v2.0</p>
          <p className="text-[10px] text-slate-500 mt-0.5">© 2024 All rights reserved</p>
        </div>
      </motion.div>
    </motion.aside>
  );
}

// Menu Item Component
interface MenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  pathname: string;
  isExpanded: boolean;
  onToggle: () => void;
  isChild?: boolean;
  onItemClick?: () => void; 
}

function MenuItem({ item, isCollapsed, pathname, isExpanded, onToggle, isChild = false, onItemClick }: MenuItemProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname === item.href : false;
  const isParentActive = hasChildren && (item.children?.some((child) => child.href === pathname) ?? false);

  if (hasChildren) {
    return (
      <div>
        <motion.button
          onClick={onToggle}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'w-full relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
            isParentActive
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
              : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
          )}
        >
          <Icon className={cn(
            'w-5 h-5 flex-shrink-0 transition-colors duration-200',
            isParentActive ? 'text-blue-600' : 'text-slate-500'
          )} />
          <motion.span
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-sm whitespace-nowrap overflow-hidden flex-1 text-left"
          >
            {item.label}
          </motion.span>

          {item.badge && !isCollapsed && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
              {item.badge}
            </span>
          )}

          {!isCollapsed && (
            <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180', isParentActive ? 'text-blue-600' : 'text-slate-400')} />
          )}
        </motion.button>

        <AnimatePresence>
          {isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5 pl-4 border-l-2 border-slate-200 ml-7 py-1">
                {item.children?.map((child) => {
                  const ChildIcon = child.icon;
                  return (
                    <Link key={child.href || child.label} href={child.href || '#'}>
                      <motion.div
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onItemClick} // Pass click handler to children
                        className={cn(
                          'relative flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group',
                          pathname === child.href
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <ChildIcon className={cn('w-4 h-4 flex-shrink-0', pathname === child.href ? 'text-blue-600' : 'text-slate-400')} />
                        <span className={cn('text-sm transition-all', pathname === child.href ? 'font-semibold' : 'font-medium')}>
                          {child.label}
                        </span>
                        {pathname === child.href && (
                          <motion.div layoutId="activeSubmenu" className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href || '#'} onClick={onItemClick}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          isActive
            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
            : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
        )}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-blue-600' : 'text-slate-500')} />
        <motion.span
          animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
          className="font-semibold text-sm whitespace-nowrap overflow-hidden"
        >
          {item.label}
        </motion.span>
        {item.badge && !isCollapsed && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
            {item.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}