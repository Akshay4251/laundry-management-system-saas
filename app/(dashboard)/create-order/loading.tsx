// app/(dashboard)/create-order/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateOrderLoading() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 p-4 pt-0 lg:p-6 lg:pt-0 pb-28 lg:pb-6">
        {/* Search Skeleton */}
        <Skeleton className="h-12 max-w-2xl mb-6 rounded-full" />

        {/* Categories Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-200 rounded-2xl p-6 bg-white">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, j) => (
                  <Skeleton key={j} className="h-40 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Skeleton */}
      <div className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-[380px] shrink-0 p-6 pt-0 pl-0">
        <div className="h-full border border-slate-200 rounded-2xl p-5 bg-white">
          <Skeleton className="h-32 mb-4 rounded-lg" />
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-12 w-full mt-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
}