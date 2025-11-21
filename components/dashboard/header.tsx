'use client';

import { useState, useEffect } from 'react';
import { Bell, Settings, Search, Plus, Shirt, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

interface HeaderProps {
  title: string;
  showCreateOrder?: boolean;
  onMenuClick?: () => void;
}

export function Header({ title, showCreateOrder = true, onMenuClick }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Prevent hydration mismatch for dynamic content
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white border-b border-slate-200 shadow-sm">
        <div className="h-full flex items-center px-4">
          <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-full flex items-center">
        {/* Left: Logo + Brand */}
        <div className="flex items-center px-3 sm:px-4 lg:px-6 border-r border-slate-200 h-full w-auto lg:w-64 shrink-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden mr-2 h-9 w-9 flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
              <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                LaundryPro
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">
                Laundry Management
              </p>
            </div>
          </Link>
        </div>

        {/* Right Section: Title + Search + Actions */}
        <div className="flex-1 flex items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-3 lg:gap-4 min-w-0">
          {/* Page Title */}
          <h2 className="text-sm sm:text-lg font-semibold text-slate-900 truncate max-w-[100px] sm:max-w-[200px] lg:max-w-none">
            {title}
          </h2>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Scan Barcode or Type Here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 h-9 lg:h-10 bg-slate-50 border-slate-200 text-sm w-full"
                />
              </div>
              <Button size="sm" className="bg-blue-50 hover:bg-blue-200 text-blue-700 gap-2 h-9 lg:h-10 px-3 shrink-0">
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Right: Actions + User */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Search Sheet - ✅ FIXED asChild */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden hover:bg-slate-100 h-9 w-9"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto pt-12">
                <SheetHeader>
                  <SheetTitle>Search Orders</SheetTitle>
                </SheetHeader>
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Scan Barcode or Type Here..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base"
                      autoFocus
                    />
                  </div>
                  <Button 
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 h-11"
                  >
                    Search
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Create Order Button - Hidden on Small Mobile */}
            {showCreateOrder && (
              <Link href="/dashboard/create-order" className="hidden sm:block">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 h-9 lg:h-10"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">Create Order</span>
                  <span className="lg:hidden">Order</span>
                </Button>
              </Link>
            )}

            {/* Create Order FAB - Mobile Only */}
            {showCreateOrder && (
              <Link href="/dashboard/create-order" className="sm:hidden">
                <Button 
                  size="icon"
                  className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Settings - Hidden on Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex hover:bg-slate-100 h-9 w-9 lg:h-10 lg:w-10"
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>

            {/* Notifications - ✅ FIXED asChild */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-slate-100 h-9 w-9 lg:h-10 lg:w-10"
                >
                  <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px]">
                    5
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80">
                <DropdownMenuLabel className="font-semibold">
                  Notifications
                  <span className="ml-2 text-xs font-normal text-slate-500">(5 new)</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <DropdownMenuItem key={i} className="flex flex-col items-start py-3 cursor-pointer">
                      <p className="text-sm font-medium text-slate-900">
                        New order received
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Order #ORD-{i.toString().padStart(3, '0')} from John Doe
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {i} minutes ago
                      </p>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-blue-600 font-medium cursor-pointer justify-center">
                  View All Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown - ✅ FIXED asChild */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 sm:gap-3 hover:bg-slate-100 h-9 lg:h-10 px-2 sm:px-3 pl-1 sm:pl-2"
                >
                  {/* Desktop: User Info */}
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      Niket Shah
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                      Branch Manager
                    </p>
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 lg:w-9 lg:h-9 border border-slate-200">
                    <AvatarImage src="https://randomuser.me/api/portraits/men/45.jpg" />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      NS
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Niket Shah</p>
                    <p className="text-xs text-slate-500">Branch Manager</p>
                    <p className="text-xs text-slate-400">niket@laundryfro.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer md:hidden">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}