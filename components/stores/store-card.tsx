//components/stores/store-card.tsx
import { Store as StoreIcon, MapPin, Phone, MoreVertical, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface StoreCardProps {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'maintenance' | 'closed';
  ordersCount: number;
  revenue: number;
}

export function StoreCard({ name, address, phone, status, ordersCount, revenue }: StoreCardProps) {
  return (
    <div className="group relative bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
            <StoreIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{name}</h3>
            <Badge 
                variant="secondary" 
                className={`mt-1 capitalize text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5 ${
                    status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    status === 'maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                    'bg-slate-100 text-slate-600 border-slate-200'
                }`}
            >
                {status}
            </Badge>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-slate-900 shrink-0">
              <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-sm cursor-pointer">
                <ExternalLink className="w-4 h-4 mr-2" /> Switch to this Store
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm cursor-pointer">
                <Edit className="w-4 h-4 mr-2" /> Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 text-sm cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Store
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Details */}
      <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-500">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5" />
          <p className="line-clamp-2">{address}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <p className="truncate">{phone}</p>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="pt-3 sm:pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Active Orders</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 sm:mt-1">{ordersCount}</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Monthly Rev</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 sm:mt-1">₹{revenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}