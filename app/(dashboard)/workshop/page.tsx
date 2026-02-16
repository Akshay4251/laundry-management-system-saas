// app/(dashboard)/workshop/page.tsx

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  CheckCircle2,
  Truck,
  Clock,
  ArrowRight,
  Package,
  Search,
  Factory,
  Loader2,
  ExternalLink,
  PackageCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useWorkshopItems, useUpdateWorkshopItem } from '@/app/hooks/use-workshop';
import { WorkshopItem, ITEM_STATUS_CONFIG, ItemStatus } from '@/app/types/order';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type TabValue = 'processing' | 'ready' | 'history';

export default function WorkshopPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('processing');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data, isLoading, error } = useWorkshopItems(activeTab);
  const { mutate: updateItem, isPending: isUpdating } = useUpdateWorkshopItem();

  const items = data?.data?.items || [];
  const stats = data?.data?.stats || { atWorkshop: 0, returned: 0, returnedToday: 0 };

  const filteredItems = items.filter((item) =>
    item.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkReturned = (itemId: string) => {
    updateItem({ itemId, action: 'mark_returned' });
  };

  const handleReturnToStore = (itemId: string) => {
    updateItem({ itemId, action: 'return_to_store' });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Factory className="w-8 h-8 text-purple-600" />
              Workshop Operations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage items sent to external processing units
            </p>
          </div>
          
          {/* ✅ SEARCH BAR STYLING FIXED */}
          <div className="relative w-full sm:w-80">
            <div className={cn(
              "flex items-center h-11 rounded-full border bg-white transition-all duration-200",
              isSearchFocused 
                ? "border-blue-400 ring-4 ring-blue-50 shadow-md" 
                : "border-slate-200 hover:border-slate-300 shadow-sm"
            )}>
              <Search className={cn(
                "w-4 h-4 ml-4 transition-colors",
                isSearchFocused ? "text-blue-500" : "text-slate-400"
              )} />
              <Input
                placeholder="Search items, tags, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm px-3"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="At Workshop" count={stats.atWorkshop} icon={Clock} colorClass="blue" />
          <StatCard title="Returned Items" count={stats.returned} icon={PackageCheck} colorClass="purple" />
          <StatCard title="Returned Today" count={stats.returnedToday} icon={Truck} colorClass="green" />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/30">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                <TabsTrigger value="processing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">
                  At Workshop
                  <Badge className="ml-2 bg-blue-100 text-blue-700 border-0 text-xs">{stats.atWorkshop}</Badge>
                </TabsTrigger>
                <TabsTrigger value="ready" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">
                  Returned
                  <Badge className="ml-2 bg-purple-100 text-purple-700 border-0 text-xs">{stats.returned}</Badge>
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-sm font-medium">History</TabsTrigger>
              </TabsList>
            </div>

            {isLoading && <LoadingSkeleton />}

            {!isLoading && !error && filteredItems.length === 0 && (
              <EmptyState tab={activeTab} hasSearch={!!searchQuery} />
            )}

            {!isLoading && !error && filteredItems.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="pl-6">Item</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>{activeTab === 'history' ? 'Returned' : 'Sent'}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              {item.itemIcon ? <img src={item.itemIcon} className="w-6 h-6 object-contain" /> : <Package className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{item.itemName}</p>
                              <p className="text-xs text-slate-500 font-mono">{item.tagNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/orders/${item.order.id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
                            {item.order.orderNumber} <ExternalLink className="w-3 h-3" />
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{item.order.customer.fullName}</TableCell>
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(activeTab === 'history' ? item.workshopReturnedDate! : item.workshopSentDate!), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("border-0 text-[10px]", ITEM_STATUS_CONFIG[item.status as ItemStatus]?.bgColor, ITEM_STATUS_CONFIG[item.status as ItemStatus]?.color)}>
                            {ITEM_STATUS_CONFIG[item.status as ItemStatus]?.label || item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          {/* ✅ ACTION BUTTONS SIMPLIFIED */}
                          {activeTab === 'processing' && (
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 shadow-sm" onClick={() => handleMarkReturned(item.id)} disabled={isUpdating}>
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4 mr-1.5" />}
                              Mark Returned
                            </Button>
                          )}
                          {activeTab === 'ready' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => handleReturnToStore(item.id)} disabled={isUpdating}>
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                              Mark Ready
                            </Button>
                          )}
                          {activeTab === 'history' && (
                            <Link href={`/orders/${item.order.id}`}>
                              <Button variant="ghost" size="sm" className="text-slate-500">Details <ArrowRight className="ml-1.5 w-4 h-4" /></Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, icon: Icon, colorClass }: any) {
  const colors: any = {
    blue: 'text-blue-600 from-blue-50 to-blue-100 border-blue-200',
    purple: 'text-purple-600 from-purple-50 to-purple-100 border-purple-200',
    green: 'text-green-600 from-green-50 to-green-100 border-green-200',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{count}</p>
        </div>
        <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center", colors[colorClass])}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({ tab, hasSearch }: any) {
  return (
    <div className="p-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
        <Package className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-medium text-slate-900">{hasSearch ? 'No matches found' : 'No items here'}</h3>
      <p className="text-sm text-slate-500 mt-1">Everything is caught up.</p>
    </div>
  );
}