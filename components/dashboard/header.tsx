// components/dashboard/header.tsx

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Bell, 
  Search, 
  Plus, 
  Menu, 
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Command,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StoreSwitcher } from './store-switcher';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/app/contexts/app-context';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/app/hooks/use-notifications';
import { useGlobalSearch, type GlobalSearchResult } from '@/app/hooks/use-global-search';
import { toast } from 'sonner';
import { NotificationDropdown } from './notification-dropdown';

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-green-100 text-green-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
};

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getBusinessInitials(name: string): string {
  return name.substring(0, 2).toUpperCase();
}

interface HeaderProps {
  showCreateOrder?: boolean;
  onMenuClick?: () => void;
}

export function Header({ showCreateOrder = true, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { business, features, isLoading: appLoading, selectedStoreId } = useAppContext();
  
  const { data: notificationsData } = useNotifications({ limit: 10 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const userName = useMemo(() => session?.user?.name || 'User', [session?.user?.name]);
  const userEmail = useMemo(() => session?.user?.email || '', [session?.user?.email]);
  const userInitials = useMemo(() => getUserInitials(userName), [userName]);
  const userRole = useMemo(() => session?.user?.role || 'STAFF', [session?.user?.role]);
  const roleColor = useMemo(() => ROLE_COLORS[userRole] || ROLE_COLORS.STAFF, [userRole]);
  const businessName = useMemo(() => business?.businessName || 'My Business', [business?.businessName]);
  const businessInitials = useMemo(() => getBusinessInitials(businessName), [businessName]);
  const isMultiStoreEnabled = useMemo(() => features?.multiStoreEnabled ?? false, [features?.multiStoreEnabled]);

  const notifications = notificationsData?.notifications ?? [];
  const unreadCount = notificationsData?.unreadCount ?? 0;

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const { data: resultsData, isLoading: searchLoading } = useGlobalSearch(
    debouncedQuery,
    selectedStoreId || undefined
  );
  const results: GlobalSearchResult[] = resultsData ?? [];

  const groupedResults = useMemo(() => {
    const orders = results.filter(r => r.type === 'order');
    const customers = results.filter(r => r.type === 'customer');
    return { orders, customers };
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('header-search')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    setActiveIndex(0);
    if (debouncedQuery.length >= 2 && results.length > 0 && isSearchFocused) {
      setIsDropdownOpen(true);
    } else if (!debouncedQuery) {
      setIsDropdownOpen(false);
    }
  }, [debouncedQuery, results.length, isSearchFocused]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      setIsLoggingOut(false);
    }
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
    setIsNotificationsOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/settings?tab=profile');
  };

  const handleSearchNavigate = (result: GlobalSearchResult) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    setDebouncedQuery('');
    router.push(result.href);
  };

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isDropdownOpen && results.length > 0) {
        setIsDropdownOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex(prev => {
        const next = prev + 1;
        return next >= results.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isDropdownOpen && results.length > 0) {
        setIsDropdownOpen(true);
        setActiveIndex(results.length - 1);
        return;
      }
      setActiveIndex(prev => {
        const next = prev - 1;
        return next < 0 ? results.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      if (isDropdownOpen && results.length > 0) {
        e.preventDefault();
        const target = results[activeIndex] || results[0];
        handleSearchNavigate(target);
      } else {
        const q = searchQuery.trim();
        if (!q) return;
        const encoded = encodeURIComponent(q);
        if (pathname.startsWith('/customers')) {
          router.push(`/customers?search=${encoded}`);
        } else {
          router.push(`/orders?search=${encoded}`);
        }
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  if (appLoading) {
    return (
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200">
        <div className="h-full flex items-center">
          <div className="flex items-center w-64 px-4 shrink-0 border-r border-slate-100">
            <div className="w-9 h-9 bg-blue-100 rounded-xl animate-pulse shrink-0" />
            <div className="hidden lg:block w-28 h-4 bg-slate-100 rounded animate-pulse ml-2.5" />
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-md h-10 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2 px-4 shrink-0">
            <div className="w-9 h-9 bg-slate-100 rounded-full animate-pulse" />
            <div className="w-9 h-9 bg-slate-100 rounded-full animate-pulse" />
            <div className="w-9 h-9 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200">
      <div className="h-full flex items-center">
        <div className="flex items-center w-64 px-4 shrink-0 border-r border-slate-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden mr-2 h-9 w-9 rounded-lg hover:bg-slate-50 text-slate-600 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link 
            href="/dashboard" 
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <span className="text-white text-xs font-bold">{businessInitials}</span>
            </div>
            <div className="hidden lg:flex flex-col min-w-0 flex-1">
              <span className="text-base font-bold text-slate-900 tracking-tight truncate leading-tight">
                {businessName}
              </span>
              {business?.planType && (
                <span className="text-[9px] text-slate-400 font-medium uppercase truncate leading-tight">
                  {business.planType === 'TRIAL' ? '14-day Trial' : business.planType}
                </span>
              )}
            </div>
          </Link>
        </div>

        <div className="flex-1 flex items-center gap-4 px-4">
          {isMultiStoreEnabled && (
            <div className="hidden md:flex items-center shrink-0">
              <div className="w-56">
                <StoreSwitcher />
              </div>
            </div>
          )}

          <div className="hidden lg:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full" ref={searchContainerRef}>
              <div className={cn(
                "flex items-center w-full h-10 rounded-full border transition-all duration-200",
                isSearchFocused 
                  ? "border-blue-400 bg-white shadow-lg ring-4 ring-blue-50" 
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              )}>
                <Search className={cn(
                  "w-4 h-4 ml-4 shrink-0",
                  isSearchFocused ? "text-blue-500" : "text-slate-400"
                )} />
                <Input
                  id="header-search"
                  type="text"
                  placeholder="Search orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyDown={handleSearchKeyDown}
                  className="flex-1 border-0 bg-transparent h-full text-sm placeholder:text-slate-400 focus-visible:ring-0 px-3 min-w-0"
                />
                {!searchQuery && (
                  <div className="hidden xl:flex items-center gap-1 mr-3 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md shadow-sm shrink-0">
                    <Command className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400">K</span>
                  </div>
                )}
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedQuery('');
                      setIsDropdownOpen(false);
                    }} 
                    className="mr-3 p-1 rounded-full hover:bg-slate-100 shrink-0"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>

              {isDropdownOpen && debouncedQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 max-h-[360px] overflow-auto">
                  {searchLoading && (
                    <div className="p-4 flex items-center justify-center text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                      Searching...
                    </div>
                  )}
                  {!searchLoading && results.length === 0 && (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      No results found for “{debouncedQuery}”
                    </div>
                  )}
                  {!searchLoading && results.length > 0 && (
                    <div className="py-2">
                      {groupedResults.orders.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Orders
                          </div>
                          {groupedResults.orders.map((r) => {
                            const globalIndex = results.findIndex(
                              x => x.id === r.id && x.type === r.type
                            );
                            const isActive = activeIndex === globalIndex;
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSearchNavigate(r);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50",
                                  isActive && "bg-blue-50"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                    {r.badge}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">
                                      {r.title}
                                    </div>
                                    {r.subtitle && (
                                      <div className="text-xs text-slate-500 truncate">
                                        {r.subtitle}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {groupedResults.customers.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Customers
                          </div>
                          {groupedResults.customers.map((r) => {
                            const globalIndex = results.findIndex(
                              x => x.id === r.id && x.type === r.type
                            );
                            const isActive = activeIndex === globalIndex;
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSearchNavigate(r);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50",
                                  isActive && "bg-blue-50"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                                    {r.badge}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">
                                      {r.title}
                                    </div>
                                    {r.subtitle && (
                                      <div className="text-xs text-slate-500 truncate">
                                        {r.subtitle}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 shrink-0">
          {showCreateOrder && (
            <Link href="/create-order">
              <Button className="h-9 px-4 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 whitespace-nowrap shrink-0 transition-all">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Order</span>
              </Button>
            </Link>
          )}

          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            isOpen={isNotificationsOpen}
            onOpenChange={setIsNotificationsOpen}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
            isMarkingAllRead={markAllAsRead.isPending}
          />

          <div className="hidden sm:block w-px h-5 bg-slate-200 shrink-0" />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-9 px-2 lg:pl-2 lg:pr-3 rounded-lg hover:bg-slate-50 gap-2 shrink-0"
              >
                <Avatar className="h-7 w-7 ring-2 ring-slate-100 shrink-0">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-[15px] font-semibold text-slate-900 w-20 truncate text-left">
                  {userName}
                </span>
                <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-64 rounded-2xl p-2 bg-white border-slate-200 shadow-xl z-[100]"
              sideOffset={8}
            >
              <button
                onClick={handleProfileClick}
                className="w-full px-3 py-3 mb-2 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl hover:from-blue-100 hover:to-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm shrink-0">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                    <span className={cn(
                      "inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      roleColor
                    )}>
                      {userRole}
                    </span>
                  </div>
                </div>
              </button>

              <DropdownMenuItem asChild>
                <Link 
                  href="/settings?tab=profile" 
                  className="flex items-center h-10 px-3 rounded-xl text-sm cursor-pointer text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <User className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/settings" 
                  className="flex items-center h-10 px-3 rounded-xl text-sm cursor-pointer text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Settings className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center h-10 px-3 rounded-xl text-sm cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 transition-colors"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-3 h-4 w-4 animate-spin shrink-0" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-3 h-4 w-4 shrink-0" />
                    Log out
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}