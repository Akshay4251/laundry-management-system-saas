'use client';

import { use, useEffect } from 'react';
import { useOrder } from '@/app/hooks/use-orders';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PrintTagsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, isError } = useOrder(id);
  const order = data?.data;

  useEffect(() => {
    if (order) {
      setTimeout(() => window.print(), 500);
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
    return <div className="p-8 text-center text-red-600">Failed to load tags</div>;
  }

  // Flatten items based on quantity
  const tagsToPrint = order.items.flatMap((item) => {
    return Array.from({ length: item.quantity }).map((_, idx) => ({
      ...item,
      index: idx + 1,
      total: item.quantity,
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
              <span className="text-xs font-bold">
                {format(new Date(order.createdAt), 'dd/MM')}
              </span>
            </div>

            {/* Middle: Item Info */}
            <div className="flex justify-between items-center flex-1">
              <div>
                <div className="font-bold text-2xl uppercase leading-none mb-1">
                  {tag.itemName}
                </div>
                {tag.treatmentName && (
                  <span className="text-[10px] bg-black text-white px-1 py-0.5 rounded uppercase font-bold">
                    {tag.treatmentName}
                  </span>
                )}
                {tag.isExpress && (
                  <span className="text-[10px] bg-orange-500 text-white px-1 py-0.5 rounded uppercase font-bold ml-1">
                    EXPRESS
                  </span>
                )}
              </div>
              <div className="text-center pl-2 border-l-2 border-black">
                <div className="text-xs font-bold text-gray-600 uppercase">Piece</div>
                <div className="text-3xl font-black leading-none">
                  {tag.index}
                  <span className="text-lg text-gray-500">/{tag.total}</span>
                </div>
              </div>
            </div>

            {/* Bottom: Customer & Tag ID */}
            <div className="border-t-2 border-black pt-1 mt-1 flex justify-between items-end">
              <div className="text-sm font-bold truncate w-3/4">
                {order.customer.fullName}
              </div>
              <div className="text-[10px] font-mono text-gray-500">#{tag.tagNumber}</div>
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