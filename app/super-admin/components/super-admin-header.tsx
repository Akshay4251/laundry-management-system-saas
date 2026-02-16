// app/(super-admin)/components/super-admin-header.tsx

'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Menu, LogOut, ChevronDown, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Props {
  session: Session;
  onMenuClick: () => void;
}

export function SuperAdminHeader({ session, onMenuClick }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-gradient-to-r from-red-600 to-pink-600 border-b border-red-700 shadow-lg">
      <div className="h-full flex items-center px-4">
        {/* Left */}
        <div className="flex items-center gap-3 w-64">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 rounded-xl hover:bg-white/10 text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link href="/super-admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-base font-bold text-white leading-tight">Super Admin</p>
              <p className="text-[10px] text-red-100">Platform Control</p>
            </div>
          </Link>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-white">System Online</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 lg:px-3 rounded-xl hover:bg-white/10 gap-2">
                <Avatar className="h-7 w-7 ring-2 ring-white/30">
                  <AvatarFallback className="bg-white text-red-600 text-xs font-bold">SA</AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium text-white">Admin</span>
                <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-white/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2" sideOffset={8}>
              <div className="px-3 py-3 mb-2 bg-red-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-900">Super Administrator</p>
                <p className="text-xs text-slate-500">{session.user?.email}</p>
              </div>
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-10 rounded-xl text-red-600 hover:bg-red-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}