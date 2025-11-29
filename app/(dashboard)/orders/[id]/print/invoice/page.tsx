"use client";

import { useEffect, useState, use } from "react"; // Import 'use'
import { Order } from "@/app/types/order";
import { format } from "date-fns";
import { IndianRupee, Phone, Mail, MapPin } from "lucide-react";

// MOCK DATA LOADER
const getOrderById = (id: string): Order | null => {
  return {
    id: id,
    storeId: 'store_1',
    orderNumber: 'ORD-2024-001',
    customer: { 
        id: 'c1', 
        storeId: 'store_1', 
        name: 'Rajesh Kumar', 
        phone: '+91 98765 43210', 
        address: '123 MG Road, Bangalore, Karnataka 560001',
        email: 'rajesh@example.com'
    },
    items: [
        { id: 'i1', tagNumber: '001', itemType: 'Formal Shirt', quantity: 2, services: ['wash', 'iron'], status: 'ready', price: 120, sentToWorkshop: false },
        { id: 'i2', tagNumber: '002', itemType: 'Blazer', quantity: 1, services: ['dry_clean'], status: 'ready', price: 450, sentToWorkshop: true },
        { id: 'i3', tagNumber: '003', itemType: 'Trousers', quantity: 2, services: ['wash', 'iron'], status: 'ready', price: 180, sentToWorkshop: false },
    ],
    totalItems: 5,
    workshopItems: 0,
    services: ['Wash', 'Iron', 'Dry Clean'],
    specialInstructions: 'Use fabric softener. Handle blazer with care.',
    totalAmount: 750,
    paidAmount: 0,
    discount: 0,
    tax: 0,
    status: 'ready',
    orderDate: new Date(),
    deliveryDate: new Date(Date.now() + 86400000 * 2),
    paymentMode: 'cash',
  };
};

// Update Interface for Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PrintInvoicePage({ params }: PageProps) {
  // UNWRAP PARAMS HERE
  const { id } = use(params);
  
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Use the unwrapped 'id'
    const data = getOrderById(id);
    setOrder(data);

    if (data) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [id]); // Depend on unwrapped id

  if (!order) return <div className="p-8">Loading invoice...</div>;

  return (
    <div className="bg-white min-h-screen text-black p-8 max-w-[210mm] mx-auto">
      {/* Invoice Header */}
      <header className="border-b-2 border-slate-800 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wider mb-2">LaundryPro</h1>
          <div className="text-sm text-slate-600 space-y-1">
            <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Shop 12, Indiranagar 100ft Rd, Bangalore</p>
            <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> +91 88888 99999</p>
            <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> support@laundrypro.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-slate-800">INVOICE</h2>
          <p className="text-lg font-mono font-bold mt-1">#{order.orderNumber}</p>
          <p className="text-sm text-slate-500 mt-1">Date: {format(order.orderDate, 'dd MMM yyyy')}</p>
        </div>
      </header>

      {/* Customer Details */}
      <section className="mb-8 flex justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bill To</h3>
          <p className="font-bold text-lg">{order.customer.name}</p>
          <p className="text-sm text-slate-600">{order.customer.address}</p>
          <p className="text-sm text-slate-600 mt-1">Phone: {order.customer.phone}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Date</h3>
          <p className="font-bold text-lg">{format(order.deliveryDate, 'dd MMM yyyy')}</p>
          <p className="text-sm text-slate-600">{format(order.deliveryDate, 'hh:mm a')}</p>
        </div>
      </section>

      {/* Order Items Table */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="text-left py-3 font-bold text-slate-700">#</th>
            <th className="text-left py-3 font-bold text-slate-700">Item Description</th>
            <th className="text-left py-3 font-bold text-slate-700">Service</th>
            <th className="text-center py-3 font-bold text-slate-700">Qty</th>
            <th className="text-right py-3 font-bold text-slate-700">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {order.items.map((item, index) => (
            <tr key={item.id}>
              <td className="py-3 text-slate-500">{index + 1}</td>
              <td className="py-3 font-medium">
                {item.itemType}
                <span className="block text-xs text-slate-400 font-normal">Tag: {item.tagNumber}</span>
              </td>
              <td className="py-3">
                {item.services.map(s => (
                    <span key={s} className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs mr-1 capitalize">
                        {s.replace('_', ' ')}
                    </span>
                ))}
              </td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right font-medium">₹{item.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Financial Summary */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax (0%)</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Discount</span>
            <span>- ₹{order.discount || 0}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between items-end">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-xl">₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="text-right text-xs mt-1">
            {order.paidAmount >= order.totalAmount ? (
                <span className="text-green-600 font-bold border border-green-600 px-2 py-0.5 rounded uppercase">PAID</span>
            ) : (
                <span className="text-red-600 font-bold border border-red-600 px-2 py-0.5 rounded uppercase">UNPAID</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer & Terms */}
      <div className="border-t border-slate-200 pt-6 text-xs text-slate-500 text-center">
        <p className="font-bold mb-1">Terms & Conditions:</p>
        <p>1. Goods not collected within 30 days will be sold to recover costs.</p>
        <p>2. We are not responsible for shrinkage or color fade due to fabric quality.</p>
        <p className="mt-4 font-medium text-slate-900">Thank you for choosing LaundryPro!</p>
      </div>

      {/* Print Styles (Hides URL/Time on print) */}
      <style jsx global>{`
        @media print {
          @page { margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}