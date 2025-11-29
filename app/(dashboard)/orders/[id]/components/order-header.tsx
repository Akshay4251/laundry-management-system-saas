"use client";

import { useState, useEffect } from "react"; // <--- Added hooks
import { Order } from "@/app/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../../components/status-badge";
import {
  User,
  Phone,
  Package,
  DollarSign,
  Printer,
  Share2,
  AlertCircle,
  Zap,
  Star,
  Tags,
  FileText,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrderHeaderProps {
  order: Order;
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function OrderHeader({ order }: OrderHeaderProps) {
  // --- HYDRATION FIX START ---
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client side
  if (!isMounted) {
    return <div className="h-64 bg-white rounded-lg border border-slate-200 shadow-sm animate-pulse" />; 
  }
  // --- HYDRATION FIX END ---

  const handlePrint = (type: 'invoice' | 'tags') => {
    const url = `/print/${order.id}/${type}`;
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

  const handleShare = () => {
    console.log("Share order:", order.id);
  };

  const getPriorityBadge = () => {
    if (!order.priority || order.priority === 'normal') return null;
    
    const config = {
      urgent: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle, label: 'Urgent' },
      express: { color: 'bg-red-100 text-red-700 border-red-200', icon: Zap, label: 'Express' },
    };

    const { color, icon: Icon, label } = config[order.priority];
    
    return (
      <Badge variant="outline" className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
    >
      {/* Top Row: Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900">
              {order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
            {getPriorityBadge()}
            {order.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Star className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            Created {formatDateTime(order.orderDate)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Printer className="w-4 h-4" />
                Print
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePrint('invoice')}>
                <FileText className="w-4 h-4 mr-2" />
                Print Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint('tags')}>
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
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-1">Customer</p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {order.customer.name}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" />
              {order.customer.phone}
            </p>
          </div>
        </div>

        {/* Total Items */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              Total Items
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {order.items.length} types
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {order.totalItems} pieces
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              Total Amount
            </p>
            <p className="text-sm font-semibold text-slate-900">
              ₹{order.totalAmount.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Paid: ₹{order.paidAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Workshop Items */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            order.workshopItems > 0 ? 'bg-orange-50' : 'bg-slate-50'
          }`}>
            <Package className={`w-5 h-5 ${
              order.workshopItems > 0 ? 'text-orange-600' : 'text-slate-400'
            }`} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Workshop</p>
            <p className="text-sm font-semibold text-slate-900">
              {order.workshopItems} items
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {order.workshopItems > 0 ? 'At workshop' : 'None sent'}
            </p>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">
            Special Instructions
          </p>
          <p className="text-sm text-slate-700">{order.specialInstructions}</p>
        </div>
      )}

      {/* Services */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-500 mb-2">Services</p>
        <div className="flex flex-wrap gap-2">
          {order.services.map((service) => (
            <Badge key={service} variant="outline" className="bg-slate-50">
              {service}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}