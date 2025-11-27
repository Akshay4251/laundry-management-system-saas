import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <Button variant="ghost" size="sm" className="h-9 gap-2" disabled>
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-64" />
            
            <div className="grid grid-cols-4 gap-4 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <Skeleton className="h-6 w-32 mb-6" />
              <div className="space-y-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <Skeleton className="h-6 w-32 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table Skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>

        {/* Info Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}