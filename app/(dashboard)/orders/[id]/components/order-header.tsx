//app/(dashboard)/orders/[id]/components/order-header.tsx
'use client';

import { useState, useEffect } from 'react';
import { OrderDetail, OrderStatus } from '@/app/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../../components/status-badge';
import {
  User,
  Phone,
  Package,
  IndianRupee,
  Printer,
  Share2,
  Zap,
  Factory,
  FileText,
  Tags,
  ChevronDown,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface OrderHeaderProps {
  order: OrderDetail;
}

// Status display mapping for customer-friendly messages
const statusMessages: Record<OrderStatus, { emoji: string; message: string }> = {
  PICKUP: {
    emoji: '📦',
    message: 'Your order has been scheduled for pickup',
  },
  IN_PROGRESS: {
    emoji: '⚙️',
    message: 'Your order is currently being processed',
  },
  AT_WORKSHOP: {
    emoji: '🏭',
    message: 'Your order is at our specialized workshop for premium care',
  },
  WORKSHOP_RETURNED: {
    emoji: '✅',
    message: 'Your order has been received from the workshop and is being prepared',
  },
  READY: {
    emoji: '🎉',
    message: 'Great news! Your order is ready for pickup/delivery',
  },
  OUT_FOR_DELIVERY: {
    emoji: '🚚',
    message: 'Your order is out for delivery',
  },
  COMPLETED: {
    emoji: '✨',
    message: 'Your order has been completed. Thank you for choosing us!',
  },
  CANCELLED: {
    emoji: '❌',
    message: 'This order has been cancelled',
  },
};

export function OrderHeader({ order }: OrderHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-64 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse" />;
  }

  // Format phone number for WhatsApp (remove spaces, dashes, and add country code if needed)
  const formatPhoneForWhatsApp = (phone: string | undefined | null): string => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume India (+91)
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    // Remove leading zeros if any
    cleaned = cleaned.replace(/^0+/, '');
    
    return cleaned;
  };

  // Generate professional WhatsApp message
  const generateWhatsAppMessage = (): string => {
    const statusInfo = statusMessages[order.status];
    const balanceAmount = order.dueAmount ?? (order.totalAmount - order.paidAmount);
    const isFullyPaid = balanceAmount <= 0;
    
    // Get business name from store or default
    const businessName = order.store?.name || 'Our Laundry Service';
    
    // Format items summary - using correct property names from OrderItemDetail
    const itemsSummary = order.items && order.items.length > 0
      ? order.items.slice(0, 5).map(item => 
          `  • ${item.itemName || 'Item'} ${item.treatmentName ? `(${item.treatmentName})` : ''} x${item.quantity}`
        ).join('\n') + (order.items.length > 5 ? `\n  ... and ${order.items.length - 5} more items` : '')
      : '  No items listed';

    const message = `
*${businessName}* 🧺

Hello *${order.customer?.fullName || 'Valued Customer'}*! 👋

${statusInfo.emoji} *Order Update*
━━━━━━━━━━━━━━━━━

*Order No:* #${order.orderNumber}
*Status:* ${statusInfo.message}

📦 *Order Details:*
${itemsSummary}

💰 *Payment Summary:*
━━━━━━━━━━━━━━━━━
   Total Amount: *₹${order.totalAmount.toFixed(2)}*
   Amount Paid: ₹${order.paidAmount.toFixed(2)}
   ${isFullyPaid 
      ? '✅ *FULLY PAID*' 
      : `⏳ Balance Due: *₹${balanceAmount.toFixed(2)}*`
   }

${order.deliveryDate ? `📅 *Expected Ready:* ${format(new Date(order.deliveryDate), 'EEEE, MMMM d, yyyy')}\n` : ''}
${order.specialInstructions ? `📝 *Note:* ${order.specialInstructions}\n` : ''}
━━━━━━━━━━━━━━━━━

Thank you for choosing *${businessName}*! 🙏
For any queries, feel free to reply to this message.
    `.trim();

    return message;
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    const phone = order.customer?.phone;
    
    if (!phone) {
      toast.error('Customer phone number not available');
      return;
    }

    const formattedPhone = formatPhoneForWhatsApp(phone);
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp...', {
      description: `Sending to ${order.customer.phone}`,
    });
  };

  // Handle copy message to clipboard
  const handleCopyMessage = async () => {
    const message = generateWhatsAppMessage();
    
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy message');
    }
  };

  // Handle native share (fallback)
  const handleNativeShare = async () => {
    const message = generateWhatsAppMessage();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${order.orderNumber}`,
          text: message,
        });
        toast.success('Shared successfully');
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopyMessage();
    }
  };

  const handlePrint = (type: 'invoice' | 'tags') => {
    const url = `/orders/${order.id}/print/${type}`;
    const width = type === 'tags' ? 400 : 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url,
      `Print ${type}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const isExpress = order.priority === 'EXPRESS';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
    >
      {/* Top Row: Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900">
              #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
            {isExpress && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 rounded-full px-3">
                <Zap className="w-3 h-3 mr-1" />
                Express
              </Badge>
            )}
            {order.isRework && (
              <Badge className="bg-red-100 text-red-700 border-red-200 rounded-full px-3">
                Rework #{order.reworkCount}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Created {format(new Date(order.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full">
                <Share2 className="w-4 h-4" />
                Share
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem 
                onClick={handleWhatsAppShare} 
                className="cursor-pointer gap-2 rounded-lg"
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span>WhatsApp</span>
                {order.customer?.phone && (
                  <span className="ml-auto text-xs text-slate-400">
                    {order.customer.phone.slice(-4)}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleCopyMessage} 
                className="cursor-pointer gap-2 rounded-lg"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Message'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleNativeShare} 
                className="cursor-pointer gap-2 rounded-lg"
              >
                <Share2 className="w-4 h-4" />
                <span>More Options...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Print Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full">
                <Printer className="w-4 h-4" />
                Print
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => handlePrint('invoice')} className="cursor-pointer rounded-lg">
                <FileText className="w-4 h-4 mr-2" />
                Print Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint('tags')} className="cursor-pointer rounded-lg">
                <Tags className="w-4 h-4 mr-2" />
                Print Tags
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Customer */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-1">Customer</p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {order.customer?.fullName || 'Unknown'}
            </p>
            {order.customer?.phone && (
              <button 
                onClick={handleWhatsAppShare}
                className="text-xs text-slate-500 flex items-center gap-1 mt-1 hover:text-green-600 transition-colors group"
              >
                <Phone className="w-3 h-3" />
                <span>{order.customer.phone}</span>
                <MessageCircle className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-green-600" />
              </button>
            )}
          </div>
        </div>

        {/* Total Items */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Total Items</p>
            <p className="text-sm font-semibold text-slate-900">
              {order.stats?.totalItems || order.items?.length || 0} types
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {order.stats?.totalQuantity || 0} pieces
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Total Amount</p>
            <p className="text-sm font-semibold text-slate-900">
              ₹{order.totalAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Paid: ₹{order.paidAmount?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Workshop Items */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            (order.stats?.workshopItems || 0) > 0 ? 'bg-orange-50' : 'bg-slate-50'
          }`}>
            <Factory className={`w-5 h-5 ${
              (order.stats?.workshopItems || 0) > 0 ? 'text-orange-600' : 'text-slate-400'
            }`} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Workshop</p>
            <p className="text-sm font-semibold text-slate-900">
              {order.stats?.workshopItems || 0} items
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(order.stats?.workshopItems || 0) > 0 ? 'At workshop' : 'None sent'}
            </p>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">Special Instructions</p>
          <p className="text-sm text-slate-700">{order.specialInstructions}</p>
        </div>
      )}
    </motion.div>
  );
}