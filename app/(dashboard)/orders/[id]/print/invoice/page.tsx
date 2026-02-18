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

  const subtotal = order.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);

  return (
    <div className="bg-white min-h-screen text-black p-4 max-w-[210mm] mx-auto">
      {/* ================================================================
          OUTER BORDER - Full invoice wrapped in a bordered container
      ================================================================ */}
      <div className="border-2 border-slate-800">

        {/* ================================================================
            HEADER: Business Info + Invoice Meta
        ================================================================ */}
        <header className="border-b-2 border-slate-800 p-6 flex justify-between items-start">
          <div>
            {/* Business logo only if set */}
            {order.business?.logoUrl && (
              <img
                src={order.business.logoUrl}
                alt={order.business.name}
                className="h-12 w-auto object-contain mb-2"
              />
            )}

            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wider mb-1">
              {order.business?.name || order.store.name}
            </h1>

            {/* Store as branch — only show if business name exists */}
            {order.business?.name && (
              <p className="text-sm font-medium text-slate-600 mb-2">
                Branch: {order.store.name}
              </p>
            )}

            <div className="text-sm text-slate-600 space-y-1">
              {(order.store.address || order.business?.address) && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {order.store.address || order.business?.address}
                </p>
              )}
              {(order.store.phone || order.business?.phone) && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {order.store.phone || order.business?.phone}
                </p>
              )}
              {order.business?.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {order.business.email}
                </p>
              )}
              {order.business?.gstNumber && (
                <p className="text-xs text-slate-500 mt-1">
                  GSTIN: {order.business.gstNumber}
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

        {/* ================================================================
            CUSTOMER + DELIVERY INFO
        ================================================================ */}
        <section className="border-b-2 border-slate-800 flex">
          {/* Bill To */}
          <div className="flex-1 p-6 border-r-2 border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <p className="font-bold text-lg">{order.customer.fullName}</p>
            {order.customer.address && (
              <p className="text-sm text-slate-600 mt-1">{order.customer.address}</p>
            )}
            <p className="text-sm text-slate-600 mt-1">Phone: {order.customer.phone}</p>
            {order.customer.email && (
              <p className="text-sm text-slate-600">{order.customer.email}</p>
            )}
          </div>

          {/* Delivery Date */}
          <div className="w-52 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
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

        {/* ================================================================
            ITEMS TABLE
        ================================================================ */}
        <div className="border-b-2 border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-50">
                <th className="text-left py-3 px-4 font-bold text-slate-700 w-[5%]">#</th>
                <th className="text-left py-3 px-4 font-bold text-slate-700 border-l border-slate-300 w-[35%]">
                  Item Description
                </th>
                <th className="text-left py-3 px-4 font-bold text-slate-700 border-l border-slate-300 w-[20%]">
                  Service
                </th>
                <th className="text-center py-3 px-4 font-bold text-slate-700 border-l border-slate-300 w-[10%]">
                  Qty
                </th>
                <th className="text-right py-3 px-4 font-bold text-slate-700 border-l border-slate-300 w-[15%]">
                  Rate
                </th>
                <th className="text-right py-3 px-4 font-bold text-slate-700 border-l border-slate-300 w-[15%]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any, index: number) => (
                <tr key={item.id} className="border-b border-slate-200 last:border-b-0">
                  <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                  <td className="py-3 px-4 font-medium border-l border-slate-200">
                    {item.itemName}
                    <span className="block text-xs text-slate-400 font-normal mt-0.5">
                      Tag: {item.tagNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-l border-slate-200">
                    {item.serviceName && (
                      <span className="text-sm">{item.serviceName}</span>
                    )}
                    {item.isExpress && (
                      <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs ml-1">
                        EXPRESS
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center border-l border-slate-200">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-right border-l border-slate-200">
                    ₹{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium border-l border-slate-200">
                    ₹{item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================================================================
            FINANCIAL SUMMARY
        ================================================================ */}
        <div className="border-b-2 border-slate-800 flex">
          {/* Left side: Special Instructions */}
          <div className="flex-1 p-6 border-r-2 border-slate-800">
            {order.specialInstructions ? (
              <>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Notes / Instructions
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {order.specialInstructions}
                </p>
              </>
            ) : (
              <div className="text-sm text-slate-300 italic">No special instructions</div>
            )}
          </div>

          {/* Right side: Totals */}
          <div className="w-72">
            {/* Subtotal */}
            <div className="flex justify-between px-6 py-2.5 border-b border-slate-200">
              <span className="text-sm text-slate-600">Subtotal</span>
              <span className="text-sm font-medium">₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount */}
            {order.discount != null && order.discount > 0 && (
              <div className="flex justify-between px-6 py-2.5 border-b border-slate-200">
                <span className="text-sm text-slate-600">Discount</span>
                <span className="text-sm text-green-600">- ₹{order.discount.toFixed(2)}</span>
              </div>
            )}

            {/* GST */}
            {order.gstEnabled && order.gstAmount != null && order.gstAmount > 0 && (
              <div className="flex justify-between px-6 py-2.5 border-b border-slate-200">
                <span className="text-sm text-slate-600">
                  GST {order.gstPercentage ? `(${order.gstPercentage}%)` : ''}
                </span>
                <span className="text-sm">₹{order.gstAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Legacy tax fallback */}
            {!order.gstEnabled && order.tax != null && order.tax > 0 && (
              <div className="flex justify-between px-6 py-2.5 border-b border-slate-200">
                <span className="text-sm text-slate-600">Tax</span>
                <span className="text-sm">₹{order.tax.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between px-6 py-3 bg-slate-800 text-white">
              <span className="font-bold text-base">Total</span>
              <span className="font-bold text-base">₹{order.totalAmount.toFixed(2)}</span>
            </div>

            {/* Paid */}
            <div className="flex justify-between px-6 py-2.5 border-b border-slate-200">
              <span className="text-sm text-slate-600">Paid</span>
              <span className="text-sm text-green-600 font-medium">
                ₹{order.paidAmount.toFixed(2)}
              </span>
            </div>

            {/* Balance Due */}
            {order.dueAmount > 0 && (
              <div className="flex justify-between px-6 py-2.5 border-b border-slate-200">
                <span className="text-sm text-slate-600">Balance Due</span>
                <span className="text-sm text-red-600 font-bold">
                  ₹{order.dueAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Payment Status */}
            <div className="flex justify-end px-6 py-3">
              {order.paidAmount >= order.totalAmount ? (
                <span className="text-green-600 font-bold border-2 border-green-600 px-3 py-0.5 rounded text-xs uppercase tracking-wider">
                  Paid
                </span>
              ) : order.paidAmount > 0 ? (
                <span className="text-yellow-600 font-bold border-2 border-yellow-600 px-3 py-0.5 rounded text-xs uppercase tracking-wider">
                  Partial
                </span>
              ) : (
                <span className="text-red-600 font-bold border-2 border-red-600 px-3 py-0.5 rounded text-xs uppercase tracking-wider">
                  Unpaid
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================
            FOOTER: Terms + Thank You
        ================================================================ */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            {/* Terms */}
            <div className="flex-1 mr-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Terms & Conditions
              </h3>
              <div className="text-xs text-slate-500 space-y-1">
                <p>1. Goods not collected within 30 days will be sold to recover costs.</p>
                <p>2. We are not responsible for shrinkage or color fade due to fabric quality.</p>
                <p>3. Please check items at the time of delivery. No claims accepted later.</p>
              </div>
            </div>

            {/* Signature */}
            <div className="text-center flex-shrink-0">
              <div className="w-40 border-b border-slate-400 mb-2 pt-10" />
              <p className="text-xs text-slate-500">Authorized Signature</p>
            </div>
          </div>

          {/* Thank You */}
          <div className="text-center border-t border-slate-200 pt-4">
            <p className="font-medium text-slate-900 text-sm">
              Thank you for choosing {order.business?.name || order.store.name}!
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 8mm;
            size: A4;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          nav, aside, .no-print {
            display: none !important;
          }
        }

        @media screen {
          body {
            background-color: #f1f5f9;
          }
        }
      `}</style>
    </div>
  );
}