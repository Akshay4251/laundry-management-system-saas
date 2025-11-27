'use client';

import { useState } from 'react';
import { Star, MapPin, Phone, Edit, Trash2, Truck, Clock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface OrderItemDetail {
  id: string;
  sr: number;
  name: string;
  note: string;
  ironing: boolean;
  dying: boolean;
  color: string;
  size: string;
  deliveryType: 'standard' | 'express';
  deliveryTime: string;
  price: number;
  icon: string;
}

const mockOrderItems: OrderItemDetail[] = [
  {
    id: '1',
    sr: 1,
    name: 'Dress',
    note: 'My Note',
    ironing: true,
    dying: false,
    color: '#FF6B6B',
    size: 'XL',
    deliveryType: 'standard',
    deliveryTime: '2024-01-20 10:00 AM',
    price: 46.0,
    icon: '👗',
  },
  {
    id: '2',
    sr: 2,
    name: 'Jeans',
    note: '',
    ironing: false,
    dying: true,
    color: '#4ECDC4',
    size: 'L',
    deliveryType: 'express',
    deliveryTime: '2024-01-19 05:00 PM',
    price: 46.0,
    icon: '👖',
  },
  {
    id: '3',
    sr: 3,
    name: 'T-Shirt',
    note: 'Handle with care',
    ironing: true,
    dying: false,
    color: '#95E1D3',
    size: 'M',
    deliveryType: 'standard',
    deliveryTime: '2024-01-20 10:00 AM',
    price: 20.0,
    icon: '👔',
  },
];

export default function OrderReviewPage() {
  const [items, setItems] = useState<OrderItemDetail[]>(mockOrderItems);
  const [discount, setDiscount] = useState(5);
  const [gst, setGst] = useState(17);
  const [advancedPayment, setAdvancedPayment] = useState(50);

  const updateItem = (id: string, field: keyof OrderItemDetail, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount + gst - advancedPayment;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 pb-24 sm:pb-6">
      {/* Back Button - Mobile */}
      <Link href="/dashboard/create-order" className="lg:hidden">
        <Button variant="ghost" size="sm" className="gap-2 mb-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Order
        </Button>
      </Link>

      {/* Customer Info Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900">Krishnakant Patel</h3>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3 sm:w-4 sm:h-4',
                    i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 sm:line-clamp-1">
                123, MG Road, Bangalore, Karnataka - 560001
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Table - Desktop */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Sr</TableHead>
                <TableHead>Name & Note</TableHead>
                <TableHead className="w-24">Ironing</TableHead>
                <TableHead className="w-24">Dying</TableHead>
                <TableHead className="w-32">Color</TableHead>
                <TableHead className="w-32">Size</TableHead>
                <TableHead className="w-32">Delivery Type</TableHead>
                <TableHead className="w-48">Delivery Time</TableHead>
                <TableHead className="w-24">Price</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sr}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        {item.note && (
                          <p className="text-sm text-slate-500">{item.note}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.ironing}
                      onCheckedChange={(checked) =>
                        updateItem(item.id, 'ironing', checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.dying}
                      onCheckedChange={(checked) =>
                        updateItem(item.id, 'dying', checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                        className="w-8 h-8 rounded-full border-2 border-slate-300 cursor-pointer"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.size}
                      onValueChange={(value) => updateItem(item.id, 'size', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.deliveryType === 'express' ? (
                        <Truck className="w-5 h-5 text-orange-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-500" />
                      )}
                      <span className="text-sm capitalize">{item.deliveryType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600">{item.deliveryTime}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-blue-600">₹{item.price.toFixed(2)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Order Details Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  {item.note && (
                    <p className="text-sm text-slate-500 mt-0.5">{item.note}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Item #{item.sr}</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Services */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Ironing</span>
                <Switch
                  checked={item.ironing}
                  onCheckedChange={(checked) =>
                    updateItem(item.id, 'ironing', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Dying</span>
                <Switch
                  checked={item.dying}
                  onCheckedChange={(checked) =>
                    updateItem(item.id, 'dying', checked)
                  }
                />
              </div>
            </div>

            {/* Color & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={item.color}
                    onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 font-mono">{item.color}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Size
                </label>
                <Select
                  value={item.size}
                  onValueChange={(value) => updateItem(item.id, 'size', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                {item.deliveryType === 'express' ? (
                  <>
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-slate-700">Express Delivery</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-700">Standard Delivery</span>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-600 px-3">{item.deliveryTime}</p>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-600">Item Price</span>
              <span className="text-xl font-bold text-blue-600">₹{item.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Left: Additional Details */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-3">
            Order Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">
                Notification Preference
              </label>
              <Select defaultValue="whatsapp">
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">
                Pickup/Delivery
              </label>
              <Select defaultValue="delivery">
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">
              Delivery Date & Time
            </label>
            <Input 
              type="datetime-local" 
              defaultValue="2024-01-20T10:00" 
              className="h-10 sm:h-11"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">
              Special Instructions
            </label>
            <Textarea
              placeholder="Add any special instructions..."
              className="resize-none h-20 sm:h-24 text-sm"
            />
          </div>
        </div>

        {/* Right: Payment Summary */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-sm">
          <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Order Summary</h3>
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="text-slate-600">Discount ({discount}%)</span>
              <span className="font-medium text-green-600">
                - ₹{discountAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="text-slate-600">GST</span>
              <span className="font-medium">+ ₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="text-slate-600">Advanced Payment</span>
              <span className="font-medium text-red-600">
                - ₹{advancedPayment.toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">
                Payment Mode
              </label>
              <Select defaultValue="cash">
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t-2 border-slate-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-base sm:text-lg font-semibold">
                Total ({items.length} items)
              </span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600">
                ₹{total.toFixed(2)}
              </span>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 sm:h-12 text-base sm:text-lg font-semibold">
              Place Order
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-slate-900">Total ({items.length} items)</span>
          <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold">
          Place Order
        </Button>
      </div>
    </div>
  );
}