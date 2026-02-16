//app/(dashboard)/settings/stores/page.tsx
import { CreateStoreModal } from "@/components/stores/create-store-modal";
import { StoreCard } from "@/components/stores/store-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

// Mock Data
const STORES = [
  {
    id: '1',
    name: 'Main Branch - Indiranagar',
    address: '123, 100ft Road, Indiranagar, Bangalore - 560038',
    phone: '+91 98765 43210',
    status: 'active' as const,
    ordersCount: 145,
    revenue: 450000
  },
  {
    id: '2',
    name: 'Collection Center - Koramangala',
    address: '45, 5th Block, Koramangala, Bangalore - 560034',
    phone: '+91 98765 43211',
    status: 'active' as const,
    ordersCount: 82,
    revenue: 120000
  },
  {
    id: '3',
    name: 'Workshop Unit - Whitefield',
    address: 'Plot 89, EPIP Zone, Whitefield, Bangalore - 560066',
    phone: '+91 98765 43212',
    status: 'maintenance' as const,
    ordersCount: 0,
    revenue: 0
  }
];

export default function StoresPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Link href="/settings" className="hover:text-blue-600 transition-colors">Settings</Link>
                <span>/</span>
                <span className="text-slate-900 font-medium">Stores</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Store Management</h2>
            <p className="text-slate-500 mt-1">Manage your laundry branches, workshops, and collection centers.</p>
        </div>
        
        <CreateStoreModal />
      </div>

      {/* Store Grid */}
      {STORES.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STORES.map((store) => (
                <StoreCard key={store.id} {...store} />
            ))}
            
            {/* 'Add New' Ghost Card */}
            <CreateStoreModal trigger={
                 <button className="group flex flex-col items-center justify-center gap-4 h-full min-h-[240px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-600 group-hover:text-blue-700">Add Another Store</span>
                </button>
            } />
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No stores added yet</h3>
            <p className="text-sm text-slate-500 max-w-sm text-center mb-6">
                Start by adding your first laundry branch or workshop location to manage orders.
            </p>
            <CreateStoreModal />
        </div>
      )}
    </div>
  );
}