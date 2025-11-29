'use client';

import { Order, OrderStatus } from '@/app/types/order';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Eye,
  MessageCircle,
  Share2,
  Download,
  ArrowRight,
  ArrowLeft,
  Edit,
  Trash2,
  XCircle,
} from 'lucide-react';

interface OrderActionsMenuProps {
  order: Order;
  onView: () => void;
  onStatusChange: (newStatus: Order['status']) => void;
}

export default function OrderActionsMenu({
  order,
  onView,
  onStatusChange,
}: OrderActionsMenuProps) {
  const handleWhatsAppShare = () => {
    const message = `Hello ${order.customer.name},\n\nYour order ${order.orderNumber} is ${order.status}.\n\nTotal: ₹${order.totalAmount}\nDelivery: ${new Date(order.deliveryDate).toLocaleDateString()}\n\nThank you!`;
    const whatsappUrl = `https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Updated flow to match your new lifecycle
  const statusFlow: OrderStatus[] = [
    'pickup',
    'processing',
    'workshop',
    'ready',
    'delivery',
    'delivered',
    'completed',
  ];

  const currentIndex = statusFlow.indexOf(order.status);
  
  // Logic to determine next/prev steps safely
  const nextStatus = currentIndex >= 0 && currentIndex < statusFlow.length - 1 
    ? statusFlow[currentIndex + 1] 
    : null;
    
  const prevStatus = currentIndex > 0 
    ? statusFlow[currentIndex - 1] 
    : null;

  // Explicitly typed to ensure all statuses are covered
  const statusLabels: Record<OrderStatus, string> = {
    pickup: 'Pickup Scheduled',
    processing: 'Processing',
    workshop: 'At Workshop',
    ready: 'Ready',
    delivery: 'Out for Delivery',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onView} className="font-medium">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
          Communication
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          WhatsApp Customer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => alert('Share Invoice')}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => alert('Download Receipt')}>
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
          Status Management
        </DropdownMenuLabel>
        
        {nextStatus && order.status !== 'cancelled' && (
          <DropdownMenuItem
            onClick={() => onStatusChange(nextStatus)}
            className="text-green-600 font-medium"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Move to {statusLabels[nextStatus]}
          </DropdownMenuItem>
        )}

        {prevStatus && order.status !== 'cancelled' && (
          <DropdownMenuItem
            onClick={() => onStatusChange(prevStatus)}
            className="text-orange-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {statusLabels[prevStatus]}
          </DropdownMenuItem>
        )}

        {order.status !== 'cancelled' && order.status !== 'completed' && (
          <DropdownMenuItem
            onClick={() => onStatusChange('cancelled')}
            className="text-red-600"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Order
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => alert('Edit Order')}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Order
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            if (confirm(`Delete order ${order.orderNumber}?`)) {
              alert('Order deleted');
            }
          }} 
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}