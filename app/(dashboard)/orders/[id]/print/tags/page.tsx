"use client";

import { useEffect, useState, use } from "react"; // Import 'use'
import { Order } from "@/app/types/order";
import { format } from "date-fns";

// Mock Data Loader
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
        address: '',
        email: ''
    },
    items: [
        { id: 'i1', tagNumber: '001', itemType: 'Formal Shirt', quantity: 2, services: ['wash', 'iron'], status: 'ready', price: 120, sentToWorkshop: false },
        { id: 'i2', tagNumber: '002', itemType: 'Blazer', quantity: 1, services: ['dry_clean'], status: 'ready', price: 450, sentToWorkshop: true },
        { id: 'i3', tagNumber: '003', itemType: 'Trousers', quantity: 2, services: ['wash', 'iron'], status: 'ready', price: 180, sentToWorkshop: false },
    ],
    totalItems: 5,
    workshopItems: 0,
    services: [],
    specialInstructions: '',
    totalAmount: 750,
    paidAmount: 0,
    status: 'ready',
    orderDate: new Date(),
    deliveryDate: new Date(),
    paymentMode: 'cash',
  };
};

// Update Interface
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PrintTagsPage({ params }: PageProps) {
  // UNWRAP PARAMS
  const { id } = use(params);
  
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const data = getOrderById(id); // Use unwrapped id
    setOrder(data);
    if (data) {
        setTimeout(() => window.print(), 500);
    }
  }, [id]);

  if (!order) return <div>Loading tags...</div>;

  // Flatten items based on quantity
  const tagsToPrint = order.items.flatMap(item => {
    return Array.from({ length: item.quantity }).map((_, idx) => ({
        ...item,
        index: idx + 1,
        total: item.quantity
    }));
  });

  return (
    <div className="bg-white min-h-screen p-4 text-black">
      <div className="grid grid-cols-1 gap-4 print:block">
        {tagsToPrint.map((tag, globalIndex) => (
          <div 
            key={`${tag.id}-${globalIndex}`} 
            className="w-[300px] h-[150px] border-2 border-black p-3 flex flex-col justify-between mb-4 page-break-inside-avoid break-inside-avoid"
            style={{ pageBreakInside: 'avoid' }}
          >
            {/* Top: Order ID & Date */}
            <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1">
                <span className="font-black text-xl">{order.orderNumber}</span>
                <span className="text-xs font-bold">{format(order.orderDate, 'dd/MM')}</span>
            </div>

            {/* Middle: Item Info */}
            <div className="flex justify-between items-center flex-1">
                <div>
                    <div className="font-bold text-2xl uppercase leading-none mb-1">
                        {tag.itemType}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {tag.services.map(s => (
                            <span key={s} className="text-[10px] bg-black text-white px-1 py-0.5 rounded uppercase font-bold">
                                {s.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text-center pl-2 border-l-2 border-black">
                    <div className="text-xs font-bold text-gray-600 uppercase">Piece</div>
                    <div className="text-3xl font-black leading-none">
                        {tag.index}<span className="text-lg text-gray-500">/{tag.total}</span>
                    </div>
                </div>
            </div>

            {/* Bottom: Customer & Tag ID */}
            <div className="border-t-2 border-black pt-1 mt-1 flex justify-between items-end">
                <div className="text-sm font-bold truncate w-3/4">
                    {order.customer.name}
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                    #{tag.tagNumber}
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0.5cm; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}