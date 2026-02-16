'use client';

import Image from 'next/image';
import { Shirt, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceIconDisplayProps {
  iconUrl?: string | null;
  iconType?: 'LUCIDE' | 'CUSTOM_SVG';
  iconName?: string | null;
  iconColor?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  showBackground?: boolean;
}

// ✅ Expanded size options for better flexibility
const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24',
  '3xl': 'w-32 h-32',
};

// Icon padding based on size
const paddingClasses = {
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-2.5',
  xl: 'p-3',
  '2xl': 'p-4',
  '3xl': 'p-5',
};

// Background circle sizes
const backgroundSizes = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
  '2xl': 'w-28 h-28',
  '3xl': 'w-36 h-36',
};

export function ServiceIconDisplay({
  iconUrl,
  iconType,
  iconName,
  iconColor,
  name = 'Service icon',
  size = 'md',
  className,
  showBackground = false,
}: ServiceIconDisplayProps) {
  const sizeClass = sizeClasses[size];
  const paddingClass = paddingClasses[size];
  const backgroundSize = backgroundSizes[size];

  // ✅ Custom uploaded icon (Cloudinary URL)
  if (iconUrl) {
    if (showBackground) {
      return (
        <div className={cn('relative', className)}>
          {/* Gradient background circle */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl blur-xl opacity-60',
              backgroundSize
            )}
          />
          {/* Icon container */}
          <div
            className={cn(
              'relative rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden',
              sizeClass,
              paddingClass
            )}
          >
            <img
              src={iconUrl}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0',
          sizeClass,
          paddingClass,
          className
        )}
      >
        <img
          src={iconUrl}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // ✅ Fallback placeholder icon
  if (showBackground) {
    return (
      <div className={cn('relative', className)}>
        {/* Background gradient */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl blur-lg opacity-70',
            backgroundSize
          )}
        />
        {/* Icon container */}
        <div
          className={cn(
            'relative rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center',
            sizeClass
          )}
        >
          <Shirt className={cn('text-slate-400', size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-10 h-10')} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0',
        sizeClass,
        className
      )}
    >
      <Shirt className={cn('text-slate-400', size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-10 h-10')} />
    </div>
  );
}