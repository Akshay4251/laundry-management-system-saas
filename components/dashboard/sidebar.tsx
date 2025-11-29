'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UserCircle,
  Package,
  Calendar,
  IndianRupee,
  Settings,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
  Shirt,
  Loader,
  Truck,
  ClipboardList,
  ListChecks,
  CheckCircle,
  Factory,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// INTERFACES (Moved to top to fix TS Error)
// ==========================================

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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onItemClick?: () => void;
}

interface MenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  isChild?: boolean;
  onItemClick?: () => void;
  isMenuItemActive: (href: string) => boolean;
}

// ==========================================
// MENU CONFIGURATION
// ==========================================

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
        icon: ShoppingBag, 
        label: 'Pickups', 
        href: '/orders?status=pickup',
        badge: '1'
      },
      { 
        icon: Loader, 
        label: 'In-Progress', 
        href: '/orders?status=processing',
        badge: '2' 
      },
       { 
        icon: Factory, 
        label: 'Workshop', 
        href: '/workshop' 
      },
      { 
        icon: CheckCircle, 
        label: 'Ready', 
        href: '/orders?status=ready' 
      },
      { 
        icon: Truck, 
        label: 'Out for Delivery', 
        href: '/orders?status=delivery' 
      },
      { 
        icon: ListChecks, 
        label: 'All Orders', 
        href: '/orders' 
      },
    ],
  },
  {
    title: 'Business Management',
    items: [
      { icon: UserCircle, label: 'Customers', href: '/customers' },
      { icon: ClipboardList, label: 'Inventory', href: '/inventory' },
      { icon: Package, label: 'Services', href: '/services' },
      { icon: IndianRupee, label: 'Expenses', href: '/expenses' },
      { icon: Calendar, label: 'Calendar', href: '/calendar' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
  },
];

// ==========================================
// COMPONENTS
// ==========================================

function SidebarSkeleton({ isCollapsed }: { isCollapsed: boolean; isMobile: boolean }) {
  return (
    <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
      {[1, 2, 3, 4].map((section) => (
        <div key={section}>
          {!isCollapsed && (
            <div className="h-3 w-20 bg-slate-200 rounded mb-3 mx-3 animate-pulse" />
          )}
          <div className="space-y-1">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                {!isCollapsed && (
                  <div className="h-4 flex-1 bg-slate-200 rounded animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({ 
  isCollapsed, 
  isMobile, 
  onItemClick 
}: { 
  isCollapsed: boolean; 
  isMobile: boolean;
  onItemClick?: () => void;
}) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMenuItemActive = (href: string) => {
    if (!href) return false;
    const [hrefPath, hrefQuery] = href.split('?');
    if (pathname !== hrefPath) return false;
    if (!hrefQuery) return searchParams.toString() === '';
    const hrefParams = new URLSearchParams(hrefQuery);
    for (const [key, value] of hrefParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
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
                isExpanded={expandedMenus.includes(item.label)}
                onToggle={() => toggleSubmenu(item.label)}
                onItemClick={onItemClick}
                isMenuItemActive={isMenuItemActive}
              />
            ))}
          </div>

          {!isCollapsed && index < menuSections.length - 1 && (
            <div className="mt-5 mx-3 border-t border-slate-100" />
          )}
        </div>
      ))}
    </nav>
  );
}

// ==========================================
// MENU ITEM COMPONENT
// ==========================================

function MenuItem({ 
  item, 
  isCollapsed, 
  isExpanded, 
  onToggle, 
  isChild = false, 
  onItemClick, 
  isMenuItemActive 
}: MenuItemProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? isMenuItemActive(item.href) : false;
  const isParentActive = hasChildren && (item.children?.some((child) => child.href && isMenuItemActive(child.href)) ?? false);

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
                  const isChildActive = child.href ? isMenuItemActive(child.href) : false;
                  return (
                    <Link key={child.href || child.label} href={child.href || '#'}>
                      <motion.div
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onItemClick}
                        className={cn(
                          'relative flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group',
                          isChildActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <ChildIcon className={cn('w-4 h-4 flex-shrink-0', isChildActive ? 'text-blue-600' : 'text-slate-400')} />
                        <span className={cn('text-sm transition-all', isChildActive ? 'font-semibold' : 'font-medium')}>
                          {child.label}
                        </span>
                        {isChildActive && (
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
            : 'text-black hover:bg-slate-50 border-l-4 border-transparent'
        )}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-blue-600' : 'text-black')} />
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

// ==========================================
// MAIN SIDEBAR EXPORT
// ==========================================

export function Sidebar({ 
  isCollapsed: externalCollapsed, 
  onToggleCollapse, 
  isMobile = false, 
  onItemClick 
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isCollapsed = isMobile ? false : (externalCollapsed ?? internalCollapsed);

  const handleToggle = () => {
    if (isMobile) return;
    const newState = !isCollapsed;
    setInternalCollapsed(newState);
    onToggleCollapse?.(newState);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : (isMobile ? '100%' : 256) }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "bg-white border-r border-slate-200 h-full flex flex-col",
        isMobile ? "relative w-full lg:hidden" : "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] hidden lg:flex"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile Header Logo */}
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

      {/* Floating Collapse Button */}
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

      {/* Navigation with Suspense Boundary */}
      <Suspense fallback={<SidebarSkeleton isCollapsed={isCollapsed} isMobile={isMobile} />}>
        <SidebarContent 
          isCollapsed={isCollapsed} 
          isMobile={isMobile}
          onItemClick={onItemClick}
        />
      </Suspense>

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