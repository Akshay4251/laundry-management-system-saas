'use client';

import { 
  Eye, 
  MoreVertical, 
  Phone, 
  IndianRupee, 
  Sparkles,
  Factory,       
  CheckCircle2,  
  ArrowLeft,     
  Truck,         
  RotateCcw,     
  XCircle,       
  PackageCheck,
  Ban,
  ShoppingBag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/app/types/order';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; 

interface OrdersTableProps {
  orders: Order[];
}

// Define the Action Interface
interface WorkflowAction {
  label: string;
  action: OrderStatus;
  icon: any;
  color?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();

  // --- FLEXIBLE WORKFLOW ENGINE ---
  const getWorkflowActions = (order: Order): WorkflowAction[] => {
    const isPaid = order.paidAmount >= order.totalAmount;
    
    switch (order.status) {
      case 'pickup': // Scheduled for Pickup
        return [
          { label: 'Mark Received (Process)', action: 'processing', icon: Loader2, color: 'text-blue-600' },
          { label: 'Cancel Order', action: 'cancelled', icon: XCircle, color: 'text-red-600' },
        ];

      case 'processing': // In Progress
        return [
          { label: 'Mark as Ready', action: 'ready', icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Send to Workshop', action: 'workshop', icon: Factory, color: 'text-purple-600' },
          { label: 'Partially Ready', action: 'processing', icon: PackageCheck, color: 'text-amber-600' }, 
          { label: 'Move back to Pickup', action: 'pickup', icon: ArrowLeft, color: 'text-slate-500' },
        ];
      
      case 'workshop': // At Workshop
        return [
          { label: 'Receive & Mark Ready', action: 'ready', icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Receive & Process', action: 'processing', icon: RotateCcw, color: 'text-blue-600' },
        ];

      case 'ready': // Ready for Pickup/Delivery
        return [
          { 
            label: 'Mark Delivered (Walk-in)', 
            action: 'delivered', 
            icon: CheckCircle2, 
            color: isPaid ? 'text-emerald-600' : 'text-slate-400',
            disabled: !isPaid,
            disabledReason: 'Payment pending'
          },
          { 
            label: 'Dispatch Driver', 
            action: 'delivery', 
            icon: Truck, 
            color: isPaid ? 'text-blue-600' : 'text-slate-400',
            disabled: !isPaid,
            disabledReason: 'Payment pending'
          },
          { label: 'Return to Workshop', action: 'workshop', icon: Factory, color: 'text-purple-600' },
          { label: 'Return to In-Progress', action: 'processing', icon: ArrowLeft, color: 'text-slate-500' },
        ];

      case 'delivery': // Out for Delivery
        return [
          { label: 'Confirm Delivery', action: 'delivered', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Delivery Failed (Return)', action: 'ready', icon: RotateCcw, color: 'text-red-600' },
        ];

      case 'delivered': // Completed
      case 'completed':
        return [
          { label: 'Re-process (Undo)', action: 'processing', icon: RotateCcw, color: 'text-amber-600' },
        ];

      default:
        return [];
    }
  };

  // Mock Status Update Handler
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    console.log(`Updating Order ${orderId} to ${newStatus}`);
    // TODO: Server action call here
    router.refresh(); 
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order? This cannot be undone.')) {
      handleStatusUpdate(orderId, 'cancelled');
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No orders found</h3>
        <p className="text-sm text-slate-500 mb-6">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[14%]" />
              <col className="w-[17%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[70px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Order</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Customer</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Services</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Instructions</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Delivery</th>
                <th className="text-center py-4 px-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isPaid = order.paidAmount >= order.totalAmount;
                const workflowActions = getWorkflowActions(order);

                return (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold text-slate-900 truncate">#{order.orderNumber}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{order.totalItems} items</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 truncate">{order.customer.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{order.customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {order.services.map((service, index) => (
                          <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {order.specialInstructions ? (
                        <div className="flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 line-clamp-2">{order.specialInstructions}</span>
                        </div>
                      ) : <span className="text-xs text-slate-400">None</span>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{order.totalAmount.toLocaleString('en-IN')}</span>
                        </span>
                        <span className={cn('text-xs font-medium mt-0.5 truncate', isPaid ? 'text-emerald-600' : 'text-amber-600')}>
                          {isPaid ? '✓ Paid' : `₹${(order.totalAmount - order.paidAmount).toLocaleString('en-IN')} due`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={order.status} size="sm" />
                      {order.workshopItems > 0 && (
                        <div className="text-xs text-purple-600 font-medium mt-1">{order.workshopItems} at workshop</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-sm truncate">{format(order.deliveryDate, 'MMM dd, yyyy')}</span>
                        <span className="text-xs text-slate-500 mt-0.5 truncate">{format(order.deliveryDate, 'hh:mm a')}</span>
                      </div>
                    </td>

                    {/* ACTIONS COLUMN */}
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                              <MoreVertical className="w-4 h-4 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg">
                            <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)} className="cursor-pointer font-medium">
                              <Eye className="w-4 h-4 mr-2 text-slate-500" />
                              View Details
                            </DropdownMenuItem>
                            
                            {workflowActions.length > 0 && <DropdownMenuSeparator />}
                            {workflowActions.length > 0 && (
                                <DropdownMenuLabel className="text-xs font-normal text-slate-400">Change Status</DropdownMenuLabel>
                            )}
                            
                            {workflowActions.map((action) => (
                              <DropdownMenuItem
                                key={action.label}
                                onClick={() => !action.disabled && handleStatusUpdate(order.id, action.action)}
                                disabled={action.disabled}
                                className={cn(
                                  "cursor-pointer flex items-center justify-between", 
                                  action.color,
                                  action.disabled && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div className="flex items-center">
                                  {action.disabled ? <Ban className="w-4 h-4 mr-2" /> : <action.icon className="w-4 h-4 mr-2" />}
                                  {action.label}
                                </div>
                              </DropdownMenuItem>
                            ))}

                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer" onClick={() => handleCancelOrder(order.id)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {orders.map((order) => {
          const isPaid = order.paidAmount >= order.totalAmount;
          const workflowActions = getWorkflowActions(order);

          return (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-semibold text-slate-900">#{order.orderNumber}</div>
                  <div className="text-xs text-slate-500 mt-1">{order.totalItems} items</div>
                </div>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="font-medium text-slate-900 mb-2">{order.customer.name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-3.5 h-3.5" /> {order.customer.phone}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-500 mb-2">Services</div>
                <div className="flex flex-wrap gap-1.5">
                  {order.services.map((service, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">{service}</span>
                  ))}
                </div>
              </div>
              {order.workshopItems > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">{order.workshopItems} items at workshop</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Amount</div>
                  <div className="font-semibold text-slate-900 flex items-center gap-0.5"><IndianRupee className="w-4 h-4" /> {order.totalAmount.toLocaleString('en-IN')}</div>
                  <div className={cn('text-xs font-medium mt-0.5', isPaid ? 'text-emerald-600' : 'text-amber-600')}>{isPaid ? '✓ Paid' : 'Unpaid'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Delivery</div>
                  <div className="font-medium text-slate-900">{format(order.deliveryDate, 'MMM dd, yyyy')}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{format(order.deliveryDate, 'hh:mm a')}</div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 h-11">
                      Actions
                      <MoreVertical className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64 bg-white border border-slate-200 shadow-lg">
                    <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                      <Eye className="w-4 h-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    
                    {workflowActions.length > 0 && <DropdownMenuSeparator />}
                    {workflowActions.map((action) => (
                      <DropdownMenuItem 
                        key={action.label} 
                        onClick={() => !action.disabled && handleStatusUpdate(order.id, action.action)}
                        disabled={action.disabled}
                        className={cn(action.color, action.disabled && "opacity-50")}
                      >
                        {action.disabled ? <Ban className="w-4 h-4 mr-2" /> : <action.icon className="w-4 h-4 mr-2" />}
                        <div className="flex flex-col">
                            <span>{action.label}</span>
                            {action.disabledReason && <span className="text-[10px] text-red-500">{action.disabledReason}</span>}
                        </div>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => handleCancelOrder(order.id)}>
                      <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}