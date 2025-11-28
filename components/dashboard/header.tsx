'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  Menu, 
  User,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  ChevronDown,
  X,
  Command,
  ExternalLink,
  Keyboard
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
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StoreSwitcher } from './store-switcher'; 

interface HeaderProps {
  showCreateOrder?: boolean;
  onMenuClick?: () => void;
}

const notifications = [
  { id: 1, title: 'Order #2024-089 ready for pickup', time: '5m', unread: true },
  { id: 2, title: 'New customer registration', time: '1h', unread: true },
  { id: 3, title: 'Payment of $245.00 received', time: '3h', unread: false },
];

export function Header({ showCreateOrder = true, onMenuClick }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const unreadCount = notifications.filter(n => n.unread).length;

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-blue-100">
        <div className="h-full flex items-center px-4">
          <div className="w-9 h-9 bg-blue-50 rounded-full animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-blue-100/80 backdrop-blur-md">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        
        {/* ===== LEFT SECTION: BRAND & CONTEXT ===== */}
        <div className="flex items-center">
          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden mr-2 h-10 w-10 rounded-full hover:bg-blue-50 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo - Added Right Margin for spacing */}
          <Link href="/dashboard" className="flex items-center gap-3 mr-8">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/25">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="hidden xl:block text-[17px] font-semibold text-slate-800 tracking-tight">
              LaundryPro
            </span>
          </Link>

          {/* Context Switcher Group */}
          <div className="hidden md:flex items-center gap-4">
            {/* Straight Divider */}
            <div className="h-6 w-px bg-slate-200" /> 
            
            {/* Switcher with Blue Theme Hover */}
            <div className="w-[220px]">
              <StoreSwitcher 
                className="border-transparent bg-transparent shadow-none h-9 px-3 hover:bg-blue-50 hover:text-slate-700 text-slate-600" 
              />
            </div>
          </div>
        </div>

        {/* ===== CENTER SECTION - SEARCH ===== */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className={cn(
              "flex items-center w-full h-10 rounded-full border transition-all duration-200",
              isSearchFocused 
                ? "border-blue-400 bg-white shadow-lg shadow-blue-100/50 ring-4 ring-blue-50" 
                : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
            )}>
              <Search className={cn(
                "w-4 h-4 ml-4 transition-colors",
                isSearchFocused ? "text-blue-500" : "text-slate-400"
              )} />
              <Input
                id="header-search"
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 border-0 bg-transparent h-full text-sm placeholder:text-slate-400 focus-visible:ring-0 px-3"
              />
              {!searchQuery && (
                <div className="hidden xl:flex items-center gap-1 mr-3 px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm">
                  <Command className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">K</span>
                </div>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-3 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT SECTION ===== */}
        <div className="flex items-center gap-2">
          
          {/* Mobile Search Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-9 w-9 rounded-full hover:bg-blue-50 text-slate-600"
              >
                <Search className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto border-b border-blue-100">
              <SheetHeader className="sr-only">
                <SheetTitle>Search</SheetTitle>
              </SheetHeader>
              <div className="pt-2 pb-4">
                {/* Mobile Store Switcher */}
                <div className="mb-4 md:hidden">
                   <StoreSwitcher className="w-full justify-between bg-slate-50" />
                </div>
                <div className="flex items-center h-12 px-5 rounded-full border border-slate-200 bg-slate-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                  <Search className="w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0"
                    autoFocus
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Create Order Button */}
          {showCreateOrder && (
            <Link href="/create-order">
              <Button 
                className={cn(
                  "h-9 px-4 rounded-full text-sm font-medium",
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  "shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30",
                  "transition-all duration-200 cursor-pointer"
                )}
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Order</span>
              </Button>
            </Link>
          )}

          {/* Help */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex h-9 w-9 rounded-full hover:bg-blue-50 text-slate-500 hover:text-slate-700"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 rounded-full hover:bg-blue-50 text-slate-600"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 bg-white border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-full hover:bg-blue-50 transition-colors">
                  Mark all read
                </button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-blue-50/50 cursor-pointer transition-colors",
                      notification.unread && "bg-blue-50/30"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 mt-2 rounded-full shrink-0",
                      notification.unread ? "bg-blue-600" : "bg-transparent"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{notification.time} ago</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  View all
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-9 px-1.5 lg:pl-1.5 lg:pr-3 rounded-full hover:bg-blue-50 gap-2"
              >
                <Avatar className="h-7 w-7 ring-2 ring-blue-100">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/45.jpg" />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                    NS
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-800 leading-none">Niket Shah</span>
                </div>
                <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 bg-white border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="px-3 py-3 mb-1 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-800">Niket Shah</p>
                <p className="text-xs text-slate-500 mt-0.5">niket@laundrypro.com</p>
              </div>
              <DropdownMenuItem className="h-9 rounded-full text-sm cursor-pointer text-slate-700 focus:bg-blue-50 focus:text-blue-700">
                <User className="mr-3 h-4 w-4 text-slate-400" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="h-9 rounded-full text-sm cursor-pointer text-slate-700 focus:bg-blue-50 focus:text-blue-700">
                <Settings className="mr-3 h-4 w-4 text-slate-400" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="h-9 rounded-full text-sm cursor-pointer text-slate-700 focus:bg-blue-50 focus:text-blue-700">
                <CreditCard className="mr-3 h-4 w-4 text-slate-400" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem className="h-9 rounded-full text-sm cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}