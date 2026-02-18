// components/printing/tag-template.tsx

import type { OrderDetail, OrderItemDetail } from "@/app/types/order";
import { format } from "date-fns";

interface TagTemplateProps {
  order: OrderDetail;
}

export function TagTemplate({ order }: TagTemplateProps) {
  const orderDate = new Date(order.createdAt);

  return (
    <div className="hidden print:block">
      <div className="grid grid-cols-1 gap-4 p-2">
        {order.items.map((item: OrderItemDetail, index: number) => (
          <div
            key={item.id}
            className="border-2 border-black p-2 w-[300px] h-[150px] flex flex-col justify-between page-break-inside-avoid"
          >
            {/* Top Row: Order # and Date */}
            <div className="flex justify-between items-center border-b border-black pb-1">
              <span className="font-bold text-lg">{order.orderNumber}</span>
              <span className="text-xs">
                {format(orderDate, "dd/MM")}
              </span>
            </div>

            {/* Middle: Item Details */}
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-black text-xl uppercase">
                  {item.itemName}
                </p>
                <p className="text-xs font-bold uppercase">
                  {item.serviceName || "-"}
                </p>
                <p className="text-xs text-gray-600">
                  {item.color || "-"} • {item.brand || "-"}
                </p>
              </div>
              <div className="text-center border-l border-black pl-2">
                <span className="block text-3xl font-black">
                  {index + 1}/{order.totalItems}
                </span>
              </div>
            </div>

            {/* Bottom: Customer Name */}
            <div className="bg-black text-white text-center text-sm font-bold py-1 uppercase">
              {order.customer.fullName.substring(0, 20)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}