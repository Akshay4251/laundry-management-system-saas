// app/(super-admin)/businesses/page.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  Loader2,
  AlertCircle,
  Store,
  Users,
  ShoppingBag,
  Truck,
  Package,
  Factory,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminBusinesses, useUpdateBusinessFeatures } from '@/app/hooks/use-super-admin';

const featureConfig = [
  { key: 'pickupEnabled', label: 'Pickup', icon: Package, color: 'amber' },
  { key: 'deliveryEnabled', label: 'Delivery', icon: Truck, color: 'blue' },
  { key: 'workshopEnabled', label: 'Workshop', icon: Factory, color: 'purple' },
  { key: 'multiStoreEnabled', label: 'Multi-Store', icon: MapPin, color: 'green' },
] as const;

export default function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useSuperAdminBusinesses({ search: searchQuery });
  const updateFeatures = useUpdateBusinessFeatures();

  const businesses = data?.items || [];
  const pagination = data?.pagination;

  const handleToggle = (businessId: string, feature: string, currentValue: boolean) => {
    updateFeatures.mutate({
      businessId,
      features: { [feature]: !currentValue },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
        <p className="text-sm text-slate-500">Manage business features and settings</p>
      </div>

      {/* Search */}
      <div className="flex items-center h-11 rounded-full border border-slate-200 bg-white hover:border-slate-300 max-w-md">
        <Search className="w-5 h-5 ml-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-full bg-transparent border-0 outline-none text-sm px-3"
        />
      </div>

      {/* Businesses List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-sm font-medium text-slate-900">Failed to load businesses</p>
            <button onClick={() => refetch()} className="mt-2 text-sm text-red-600 hover:text-red-700">Try again</button>
          </div>
        ) : businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-900">No businesses found</p>
          </div>
        ) : (
          businesses.map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Business Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                      {business.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{business.businessName}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          business.planType === 'ENTERPRISE' && 'bg-purple-100 text-purple-700',
                          business.planType === 'PROFESSIONAL' && 'bg-blue-100 text-blue-700',
                          business.planType === 'BASIC' && 'bg-green-100 text-green-700',
                          business.planType === 'TRIAL' && 'bg-amber-100 text-amber-700',
                        )}>
                          {business.planType}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{business.user?.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      <span>{business._count.stores} stores</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{business._count.customers} customers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" />
                      <span>{business._count.orders} orders</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="p-5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Features</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {featureConfig.map(({ key, label, icon: Icon, color }) => {
                    const isEnabled = business.settings?.[key] ?? false;
                    const colors: Record<string, { bg: string; text: string; border: string }> = {
                      amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
                      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
                      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
                      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
                    };
                    const colorSet = colors[color];

                    return (
                      <button
                        key={key}
                        onClick={() => handleToggle(business.id, key, isEnabled)}
                        disabled={updateFeatures.isPending}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                          isEnabled
                            ? `${colorSet.bg} ${colorSet.border}`
                            : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          isEnabled ? colorSet.bg : 'bg-slate-100'
                        )}>
                          <Icon className={cn('w-4 h-4', isEnabled ? colorSet.text : 'text-slate-400')} />
                        </div>
                        <div className="text-left">
                          <p className={cn('text-sm font-medium', isEnabled ? 'text-slate-900' : 'text-slate-500')}>
                            {label}
                          </p>
                          <p className="text-xs text-slate-400">{isEnabled ? 'Enabled' : 'Disabled'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center">
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} businesses)
          </span>
        </div>
      )}
    </div>
  );
}