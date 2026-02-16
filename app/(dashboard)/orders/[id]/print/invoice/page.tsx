'use client';

import { use, useEffect } from 'react';
import { useOrder } from '@/app/hooks/use-orders';
import { format } from 'date-fns';
import { Phone, Mail, MapPin, Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PrintInvoicePage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, isError } = useOrder(id);
  const order = data?.data;

  useEffect(() => {
    if (order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !order) {
    return <div className="p-8 text-center text-red-600">Failed to load invoice</div>;
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="bg-white min-h-screen text-black p-8 max-w-[210mm] mx-auto">
      {/* Invoice Header */}
      <header className="border-b-2 border-slate-800 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wider mb-2">
            {order.store.name}
          </h1>
          <div className="text-sm text-slate-600 space-y-1">
            {order.store.address && (
              <p className="flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {order.store.address}
              </p>
            )}
            {order.store.phone && (
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3" /> {order.store.phone}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-slate-800">INVOICE</h2>
          <p className="text-lg font-mono font-bold mt-1">#{order.orderNumber}</p>
          <p className="text-sm text-slate-500 mt-1">
            Date: {format(new Date(order.createdAt), 'dd MMM yyyy')}
          </p>
        </div>
      </header>

      {/* Customer Details */}
      <section className="mb-8 flex justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bill To</h3>
          <p className="font-bold text-lg">{order.customer.fullName}</p>
          {order.customer.address && (
            <p className="text-sm text-slate-600">{order.customer.address}</p>
          )}
          <p className="text-sm text-slate-600 mt-1">Phone: {order.customer.phone}</p>
          {order.customer.email && (
            <p className="text-sm text-slate-600">{order.customer.email}</p>
          )}
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Delivery Date
          </h3>
          {order.deliveryDate ? (
            <>
              <p className="font-bold text-lg">
                {format(new Date(order.deliveryDate), 'dd MMM yyyy')}
              </p>
              <p className="text-sm text-slate-600">
                {format(new Date(order.deliveryDate), 'hh:mm a')}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Not scheduled</p>
          )}
        </div>
      </section>

      {/* Order Items Table */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="text-left py-3 font-bold text-slate-700">#</th>
            <th className="text-left py-3 font-bold text-slate-700">Item Description</th>
            <th className="text-left py-3 font-bold text-slate-700">Treatment</th>
            <th className="text-center py-3 font-bold text-slate-700">Qty</th>
            <th className="text-right py-3 font-bold text-slate-700">Rate</th>
            <th className="text-right py-3 font-bold text-slate-700">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {order.items.map((item, index) => (
            <tr key={item.id}>
              <td className="py-3 text-slate-500">{index + 1}</td>
              <td className="py-3 font-medium">
                {item.itemName}
                <span className="block text-xs text-slate-400 font-normal">
                  Tag: {item.tagNumber}
                </span>
              </td>
              <td className="py-3">
                {item.treatmentName && (
                  <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs capitalize">
                    {item.treatmentName}
                  </span>
                )}
                {item.isExpress && (
                  <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs ml-1">
                    EXPRESS
                  </span>
                )}
              </td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
              <td className="py-3 text-right font-medium">₹{item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Financial Summary */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>- ₹{order.discount.toFixed(2)}</span>
            </div>
          )}
          {order.tax && order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax (GST)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between items-end">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-xl">₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Paid</span>
            <span className="text-green-600">₹{order.paidAmount.toFixed(2)}</span>
          </div>
          {order.dueAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Balance Due</span>
              <span className="text-orange-600 font-medium">₹{order.dueAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="text-right text-xs mt-2">
            {order.paidAmount >= order.totalAmount ? (
              <span className="text-green-600 font-bold border border-green-600 px-2 py-0.5 rounded uppercase">
                PAID
              </span>
            ) : order.paidAmount > 0 ? (
              <span className="text-yellow-600 font-bold border border-yellow-600 px-2 py-0.5 rounded uppercase">
                PARTIAL
              </span>
            ) : (
              <span className="text-red-600 font-bold border border-red-600 px-2 py-0.5 rounded uppercase">
                UNPAID
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer & Terms */}
      <div className="border-t border-slate-200 pt-6 text-xs text-slate-500 text-center">
        <p className="font-bold mb-1">Terms & Conditions:</p>
        <p>1. Goods not collected within 30 days will be sold to recover costs.</p>
        <p>2. We are not responsible for shrinkage or color fade due to fabric quality.</p>
        <p className="mt-4 font-medium text-slate-900">Thank you for your business!</p>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page { margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}