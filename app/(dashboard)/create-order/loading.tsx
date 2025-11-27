import { Skeleton } from '@/components/ui/skeleton';

export default function CreateOrderLoading() {
  return (
    <div className="flex h-full">
      <div className="flex-1 p-6">
        {/* Search Skeleton */}
        <Skeleton className="h-14 max-w-2xl mb-6" />

        {/* Categories Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-5 gap-4">
                {[...Array(10)].map((_, j) => (
                  <Skeleton key={j} className="h-40 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className="w-96 border-l border-slate-200 p-5">
        <Skeleton className="h-32 mb-4" />
        <Skeleton className="h-8 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    </div>
  );
}