// components/dashboard/sidebar.tsx

'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  UserCircle,
  Package,
  Calendar,
  IndianRupee,
  Settings,
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
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrderStats } from '@/app/hooks/use-orders';
import { useAppContext } from '@/app/contexts/app-context';
import { StatusCounts } from '@/app/types/order';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  badgeKey?: keyof StatusCounts;
  featureFlag?: 'pickupEnabled' | 'deliveryEnabled' | 'workshopEnabled' | 'multiStoreEnabled';
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Home',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' }],
  },
  {
    title: 'Order Operations',
    items: [
      {
        icon: ShoppingBag,
        label: 'Pickups',
        href: '/orders?status=PICKUP',
        badgeKey: 'PICKUP',
        featureFlag: 'pickupEnabled',
      },
      {
        icon: Loader,
        label: 'In-Progress',
        href: '/orders?status=IN_PROGRESS',
        badgeKey: 'IN_PROGRESS',
      },
      {
        icon: Factory,
        label: 'Workshop',
        href: '/workshop',
        badgeKey: 'AT_WORKSHOP',
        featureFlag: 'workshopEnabled',
      },
      {
        icon: CheckCircle,
        label: 'Ready',
        href: '/orders?status=READY',
        badgeKey: 'READY',
      },
      {
        icon: Truck,
        label: 'Out for Delivery',
        href: '/orders?status=OUT_FOR_DELIVERY',
        badgeKey: 'OUT_FOR_DELIVERY',
        featureFlag: 'deliveryEnabled',
      },
      {
        icon: ListChecks,
        label: 'All Orders',
        href: '/orders',
      },
    ],
  },
  {
    title: 'Business Management',
    items: [
      { icon: UserCircle, label: 'Customers', href: '/customers' },
      { icon: ClipboardList, label: 'Inventory', href: '/inventory' },
      { icon: Package, label: 'Items & Pricing', href: '/items' },
      { icon: Wrench, label: 'Treatments', href: '/treatments' },
      { icon: IndianRupee, label: 'Expenses', href: '/expenses' },
      { icon: Calendar, label: 'Calendar', href: '/calendar' },
    ],
  },
  {
    title: 'System',
    items: [{ icon: Settings, label: 'Settings', href: '/settings' }],
  },
];

function filterMenuByFeatures(
  sections: MenuSection[],
  features: {
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    workshopEnabled: boolean;
    multiStoreEnabled: boolean;
  }
): MenuSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.featureFlag) return true;
        return features[item.featureFlag] === true;
      }),
    }))
    .filter((section) => section.items.length > 0);
}

interface SidebarContentProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onItemClick?: () => void;
}

const SidebarContent = memo(function SidebarContent({
  isCollapsed,
  isMobile,
  onItemClick,
}: SidebarContentProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { features, isLoading: featuresLoading } = useAppContext();
  const { data: statsData } = useOrderStats();
  const statusCounts = statsData?.data?.statusCounts as StatusCounts | undefined;

  const filteredSections = useMemo(() => {
    if (!features) return MENU_SECTIONS;
    return filterMenuByFeatures(MENU_SECTIONS, {
      pickupEnabled: features.pickupEnabled,
      deliveryEnabled: features.deliveryEnabled,
      workshopEnabled: features.workshopEnabled,
      multiStoreEnabled: features.multiStoreEnabled,
    });
  }, [features]);

  const isMenuItemActive = (href: string | undefined) => {
    if (!href) return false;
    const [hrefPath, hrefQuery] = href.split('?');

    // Path must match exactly
    if (pathname !== hrefPath) return false;

    const currentStatus = (searchParams.get('status') || '').toUpperCase();

    // No query in href => "All Orders" should be active only if no status filter
    if (!hrefQuery) {
      return !currentStatus;
    }

    const hrefParams = new URLSearchParams(hrefQuery);
    const hrefStatus = (hrefParams.get('status') || '').toUpperCase();

    if (hrefStatus) {
      return currentStatus === hrefStatus;
    }

    // For safety, require all params in href to match current searchParams
    for (const [key, value] of hrefParams.entries()) {
      if ((searchParams.get(key) || '').toUpperCase() !== value.toUpperCase()) {
        return false;
      }
    }
    return true;
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

  if (featuresLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

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
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
        }
        .sidebar-scroll.scrolling::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .sidebar-scroll.scrolling::-webkit-scrollbar-thumb {
          background: #94a3b8;
        }
      `}</style>

      {filteredSections.map((section, index) => (
        <div key={section.title}>
          <div
            className={cn(
              'transition-all duration-200',
              isCollapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100 h-auto mb-2'
            )}
          >
            <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {section.title}
            </h3>
          </div>

          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isMenuItemActive(item.href);
              const badgeCount = item.badgeKey && statusCounts ? statusCounts[item.badgeKey] : 0;
              const showBadge = badgeCount > 0;

              return (
                <Link key={item.label} href={item.href || '#'} onClick={onItemClick}>
                  <div
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      active
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        active ? 'text-blue-600' : 'text-slate-500'
                      )}
                    />
                    <span
                      className={cn(
                        'font-semibold text-sm whitespace-nowrap transition-all duration-200',
                        isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                      )}
                    >
                      {item.label}
                    </span>

                    {showBadge && !isCollapsed && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                        {badgeCount}
                      </span>
                    )}

                    {showBadge && isCollapsed && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {!isCollapsed && index < filteredSections.length - 1 && (
            <div className="mt-5 mx-3 border-t border-slate-100" />
          )}
        </div>
      ))}
    </nav>
  );
});

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
  onItemClick,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isCollapsed = isMobile ? false : externalCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (isMobile) return;
    const newState = !isCollapsed;
    setInternalCollapsed(newState);
    onToggleCollapse?.(newState);
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-slate-200 h-full flex flex-col transition-all duration-300',
        isMobile ? 'relative w-full lg:hidden' : 'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] hidden lg:flex',
        isCollapsed ? 'w-[72px]' : isMobile ? 'w-full' : 'w-64'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isMobile && (
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">WashNDry</h1>
              <p className="text-[10px] text-slate-500 leading-tight">Laundry Management</p>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (isHovered || isCollapsed) && (
        <button
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
        </button>
      )}

      <SidebarContent isCollapsed={isCollapsed} isMobile={isMobile} onItemClick={onItemClick} />

      <div
        className={cn(
          'overflow-hidden border-t border-slate-100 p-4 flex-shrink-0 transition-all duration-200',
          isCollapsed ? 'opacity-0 h-0 p-0' : 'opacity-100 h-auto'
        )}
      >
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
          <p className="text-xs text-slate-700 font-semibold">WashNDry v1.0</p>
          <p className="text-[10px] text-slate-500 mt-0.5">© 2026 All rights reserved</p>
        </div>
      </div>
    </aside>
  );
}