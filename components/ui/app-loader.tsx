// components/ui/app-loader.tsx

'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AppLoader({ 
  message = 'Loading...', 
  fullScreen = true,
  size = 'md' 
}: AppLoaderProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center gap-3 p-4">
        <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
        {message && <span className="text-sm text-slate-600">{message}</span>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Logo Placeholder */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-2xl bg-blue-400 animate-ping opacity-20" />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">{message}</p>
          <p className="text-xs text-slate-400 mt-1">Please wait...</p>
        </div>
      </div>
    </div>
  );
}