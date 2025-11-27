"use client";

import { useState } from "react";
import { Order, OrderItem, ItemStatus } from "@/app/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Printer, Check, AlertCircle, Package, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderItemsTableProps {
  order: Order;
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  const [items, setItems] = useState<OrderItem[]>(order.items);

  const handleStatusChange = (itemId: string, status: ItemStatus) => {
    setItems(items.map((i) => (i.id === itemId ? { ...i, status } : i)));
  };

  const handlePrintTag = (item: OrderItem) => {
    console.log("Print tag for:", item.tagNumber);
    // Implement QR/barcode printing
  };

  const getItemStatusBadge = (status: ItemStatus) => {
    const variants = {
      received: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Received" },
      processing: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Processing" },
      workshop: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Workshop" },
      ready: { color: "bg-green-100 text-green-700 border-green-200", label: "Ready" },
      delivered: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Delivered" },
    };

    const config = variants[status];
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getServiceBadges = (services: string[]) => {
    const serviceMap: Record<string, { color: string; label: string }> = {
      wash: { color: "bg-blue-50 text-blue-700", label: "Wash" },
      dry_clean: { color: "bg-purple-50 text-purple-700", label: "Dry Clean" },
      iron: { color: "bg-orange-50 text-orange-700", label: "Iron" },
      fold: { color: "bg-green-50 text-green-700", label: "Fold" },
      starch: { color: "bg-yellow-50 text-yellow-700", label: "Starch" },
      steam: { color: "bg-pink-50 text-pink-700", label: "Steam" },
    };

    return services.map((service) => {
      const config = serviceMap[service] || { color: "bg-slate-50 text-slate-700", label: service };
      return (
        <Badge key={service} variant="outline" className={`${config.color} text-xs`}>
          {config.label}
        </Badge>
      );
    });
  };

  const allItemsReady = items.every((item) => 
    item.status === 'ready' || item.status === 'delivered'
  );

  const workshopCount = items.filter(i => i.status === 'workshop').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
            <p className="text-sm text-slate-500 mt-1">
              Individual item tracking with tags and status
            </p>
          </div>
          <div className="flex items-center gap-2">
            {workshopCount > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                <Wrench className="w-3 h-3 mr-1" />
                {workshopCount} at Workshop
              </Badge>
            )}
            {allItemsReady ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                All Ready
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Tag</TableHead>
              <TableHead className="font-semibold">Item Details</TableHead>
              <TableHead className="font-semibold">Services</TableHead>
              <TableHead className="font-semibold text-center">Qty</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Price</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.id} 
                className={cn(
                  "hover:bg-slate-50",
                  item.sentToWorkshop && "bg-orange-50/30"
                )}
              >
                <TableCell>
                  <div className="space-y-1">
                    <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                      {item.tagNumber}
                    </code>
                    {item.sentToWorkshop && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <Wrench className="w-3 h-3" />
                        Workshop
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{item.itemType}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {item.color && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-slate-400" />
                          {item.color}
                        </span>
                      )}
                      {item.brand && (
                        <span>• {item.brand}</span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-orange-600 italic">{item.notes}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {getServiceBadges(item.services)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium text-slate-900">{item.quantity}</span>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.status}
                    onValueChange={(value) =>
                      handleStatusChange(item.id, value as ItemStatus)
                    }
                  >
                    <SelectTrigger className="h-9 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 gap-2"
                    onClick={() => handlePrintTag(item)}
                  >
                    <Printer className="w-4 h-4" />
                    Print Tag
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <span className="font-medium">{order.totalItems}</span> total pieces •{" "}
            <span className="font-medium">{items.length}</span> item types •{" "}
            <span className="font-medium">{workshopCount}</span> at workshop
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Total: ₹{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}