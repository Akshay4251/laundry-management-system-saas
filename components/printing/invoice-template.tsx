// components/printing/invoice-template.tsx

import type { OrderDetail, OrderItemDetail } from "@/app/types/order";
import { format } from "date-fns";

interface InvoiceTemplateProps {
  order: OrderDetail;
}

export function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  const orderDate = new Date(order.createdAt);

  return (
    <div className="hidden print:block print:p-8 text-black">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-widest">WashNDry</h1>
        <p className="text-sm text-gray-600">123 Main St, Bangalore</p>
        <p className="text-sm text-gray-600">Phone: +91 98765 43210</p>
      </div>

      {/* Customer & Order Info */}
      <div className="flex justify-between mb-6 text-sm">
        <div>
          <p className="font-bold">Customer:</p>
          <p>{order.customer.fullName}</p>
          <p>{order.customer.phone}</p>
          {order.customer.address && (
            <p className="text-xs text-gray-600 mt-1 max-w-xs">
              {order.customer.address}
            </p>
          )}
        </div>
        <div className="text-right">
          <p>
            <span className="font-bold">Order #:</span> {order.orderNumber}
          </p>
          <p>
            <span className="font-bold">Date:</span>{" "}
            {format(orderDate, "dd/MM/yyyy")}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2">Item</th>
            <th className="text-left py-2">Service</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item: OrderItemDetail) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">
                {item.itemName}{" "}
                <span className="text-xs text-gray-500">
                  ({item.tagNumber})
                </span>
              </td>
              <td className="py-2 uppercase text-xs">
                {item.serviceName || "-"}
              </td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">
                ₹{item.unitPrice.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex flex-col items-end gap-1 text-sm">
        <div className="flex justify-between w-40">
          <span>Subtotal:</span>
          <span>₹{order.subtotal.toFixed(2)}</span>
        </div>
        {order.discount && order.discount > 0 && (
          <div className="flex justify-between w-40">
            <span>Discount:</span>
            <span>-₹{order.discount.toFixed(2)}</span>
          </div>
        )}
        {order.gstEnabled && order.gstAmount && (
          <div className="flex justify-between w-40">
            <span>GST:</span>
            <span>₹{order.gstAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between w-40 font-bold text-lg border-t border-black pt-2 mt-2">
          <span>Total:</span>
          <span>₹{order.totalAmount.toFixed(2)}</span>
        </div>
        {order.paidAmount > 0 && (
          <div className="flex justify-between w-40 text-xs mt-1">
            <span>Paid:</span>
            <span>₹{order.paidAmount.toFixed(2)}</span>
          </div>
        )}
        {order.dueAmount > 0 && (
          <div className="flex justify-between w-40 text-xs">
            <span>Due:</span>
            <span>₹{order.dueAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-500">
        <p>Thank you for your business!</p>
        <p>Terms & Conditions Apply.</p>
      </div>
    </div>
  );
}