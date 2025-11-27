import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderHeader } from "./components/order-header";
import { OrderItemsTable } from "./components/order-items-table";
import { OrderTimeline } from "./components/order-timeline";
import { OrderActions } from "./components/order-actions";
import { OrderInfoCards } from "./components/order-info-cards";
import { Order, OrderStatus, PaymentMode } from "@/app/types/order";

// Comprehensive Mock Data
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      address: '123 MG Road, Bangalore, Karnataka 560001',
      email: 'rajesh.kumar@email.com'
    },
    items: [
      {
        id: 'item-1',
        tagNumber: 'ORD-2024-001-ITM-001',
        itemType: 'Formal Shirt',
        quantity: 2,
        services: ['wash', 'iron', 'fold'],
        color: 'White',
        brand: 'Raymond',
        notes: 'Remove collar stains',
        status: 'ready',
        price: 120,
        sentToWorkshop: false,
      },
      {
        id: 'item-2',
        tagNumber: 'ORD-2024-001-ITM-002',
        itemType: 'Blazer',
        quantity: 1,
        services: ['dry_clean'],
        color: 'Navy Blue',
        brand: 'Louis Philippe',
        status: 'workshop',
        price: 450,
        sentToWorkshop: true,
        workshopSentDate: new Date('2024-01-16T10:00:00'),
        workshopNotes: 'Dry clean only - delicate fabric',
      },
      {
        id: 'item-3',
        tagNumber: 'ORD-2024-001-ITM-003',
        itemType: 'Formal Pant',
        quantity: 2,
        services: ['wash', 'iron', 'starch'],
        color: 'Black',
        status: 'ready',
        price: 180,
        sentToWorkshop: false,
      },
      {
        id: 'item-4',
        tagNumber: 'ORD-2024-001-ITM-004',
        itemType: 'Tie',
        quantity: 3,
        services: ['dry_clean', 'iron'],
        color: 'Mixed',
        status: 'processing',
        price: 90,
        sentToWorkshop: false,
      },
      {
        id: 'item-5',
        tagNumber: 'ORD-2024-001-ITM-005',
        itemType: 'Suit',
        quantity: 1,
        services: ['dry_clean', 'steam'],
        color: 'Charcoal Gray',
        brand: 'Van Heusen',
        status: 'workshop',
        price: 600,
        sentToWorkshop: true,
        workshopSentDate: new Date('2024-01-16T10:00:00'),
        workshopNotes: 'Premium dry cleaning required',
      },
    ],
    totalItems: 9,
    workshopItems: 2,
    services: ['Wash', 'Iron', 'Dry Clean', 'Fold', 'Starch', 'Steam'],
    specialInstructions: 'Customer needs items by Friday evening. Handle blazer and suit with care.',
    totalAmount: 1440,
    paidAmount: 1000,
    discount: 60,
    tax: 0,
    status: 'processing' as OrderStatus,
    orderDate: new Date('2024-01-15T10:30:00'),
    deliveryDate: new Date('2024-01-19T18:00:00'),
    paymentMode: 'card' as PaymentMode,
    assignedTo: 'Staff-001',
    priority: 'urgent',
    tags: ['Premium', 'Corporate'],
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: {
      name: 'Priya Sharma',
      phone: '+91 98765 43211',
      address: '456 Koramangala, Bangalore, Karnataka 560034',
      email: 'priya.sharma@email.com'
    },
    items: [
      {
        id: 'item-6',
        tagNumber: 'ORD-2024-002-ITM-001',
        itemType: 'Saree',
        quantity: 2,
        services: ['dry_clean', 'iron'],
        color: 'Silk - Red/Gold',
        notes: 'Handle silk carefully',
        status: 'processing',
        price: 800,
        sentToWorkshop: false,
      },
      {
        id: 'item-7',
        tagNumber: 'ORD-2024-002-ITM-002',
        itemType: 'Blouse',
        quantity: 3,
        services: ['wash', 'iron'],
        color: 'Mixed',
        status: 'processing',
        price: 150,
        sentToWorkshop: false,
      },
      {
        id: 'item-8',
        tagNumber: 'ORD-2024-002-ITM-003',
        itemType: 'Kurti',
        quantity: 3,
        services: ['wash', 'iron', 'fold'],
        color: 'Cotton - Various',
        status: 'received',
        price: 180,
        sentToWorkshop: false,
      },
    ],
    totalItems: 8,
    workshopItems: 0,
    services: ['Dry Clean', 'Wash', 'Iron', 'Fold'],
    specialInstructions: 'Handle silk items carefully',
    totalAmount: 1130,
    paidAmount: 500,
    status: 'processing' as OrderStatus,
    orderDate: new Date('2024-01-16T09:15:00'),
    deliveryDate: new Date('2024-01-18T17:00:00'),
    paymentMode: 'cash' as PaymentMode,
    priority: 'normal',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: {
      name: 'Amit Patel',
      phone: '+91 98765 43212',
      address: '789 Indiranagar, Bangalore, Karnataka 560038',
    },
    items: [
      {
        id: 'item-9',
        tagNumber: 'ORD-2024-003-ITM-001',
        itemType: 'Jeans',
        quantity: 2,
        services: ['wash', 'fold'],
        color: 'Blue',
        status: 'received',
        price: 100,
        sentToWorkshop: false,
      },
      {
        id: 'item-10',
        tagNumber: 'ORD-2024-003-ITM-002',
        itemType: 'T-Shirt',
        quantity: 5,
        services: ['wash', 'fold'],
        color: 'Mixed',
        status: 'received',
        price: 150,
        sentToWorkshop: false,
      },
    ],
    totalItems: 7,
    workshopItems: 0,
    services: ['Wash', 'Fold'],
    specialInstructions: null,
    totalAmount: 250,
    paidAmount: 0,
    status: 'new' as OrderStatus,
    orderDate: new Date('2024-01-16T11:45:00'),
    deliveryDate: new Date('2024-01-19T16:00:00'),
    paymentMode: 'online' as PaymentMode,
    priority: 'normal',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: {
      name: 'Sneha Reddy',
      phone: '+91 98765 43213',
      address: '321 Whitefield, Bangalore, Karnataka 560066',
      email: 'sneha.reddy@email.com'
    },
    items: [
      {
        id: 'item-11',
        tagNumber: 'ORD-2024-004-ITM-001',
        itemType: 'Bed Sheet',
        quantity: 4,
        services: ['wash', 'iron', 'fold'],
        color: 'White/Colored',
        status: 'ready',
        price: 400,
        sentToWorkshop: false,
      },
      {
        id: 'item-12',
        tagNumber: 'ORD-2024-004-ITM-002',
        itemType: 'Pillow Cover',
        quantity: 8,
        services: ['wash', 'iron'],
        color: 'White',
        status: 'ready',
        price: 200,
        sentToWorkshop: false,
      },
    ],
    totalItems: 12,
    workshopItems: 0,
    services: ['Wash', 'Iron', 'Fold'],
    specialInstructions: 'Use fabric softener',
    totalAmount: 600,
    paidAmount: 600,
    status: 'ready' as OrderStatus,
    orderDate: new Date('2024-01-15T14:20:00'),
    deliveryDate: new Date('2024-01-17T15:00:00'),
    paymentMode: 'upi' as PaymentMode,
    priority: 'normal',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customer: {
      name: 'Vikram Singh',
      phone: '+91 98765 43214',
      address: '654 HSR Layout, Bangalore, Karnataka 560102',
    },
    items: [
      {
        id: 'item-13',
        tagNumber: 'ORD-2024-005-ITM-001',
        itemType: 'Sherwani',
        quantity: 1,
        services: ['dry_clean', 'steam', 'iron'],
        color: 'Cream/Gold',
        notes: 'Wedding outfit - urgent',
        status: 'delivered',
        price: 1200,
        sentToWorkshop: false,
      },
      {
        id: 'item-14',
        tagNumber: 'ORD-2024-005-ITM-002',
        itemType: 'Kurta',
        quantity: 2,
        services: ['wash', 'iron', 'starch'],
        color: 'White',
        status: 'delivered',
        price: 200,
        sentToWorkshop: false,
      },
    ],
    totalItems: 3,
    workshopItems: 0,
    services: ['Dry Clean', 'Steam', 'Iron', 'Wash', 'Starch'],
    specialInstructions: 'Urgent - wedding event on Saturday',
    totalAmount: 1400,
    paidAmount: 1400,
    status: 'delivery' as OrderStatus,
    orderDate: new Date('2024-01-16T08:00:00'),
    deliveryDate: new Date('2024-01-17T20:00:00'),
    paymentMode: 'upi' as PaymentMode,
    priority: 'express',
    tags: ['Urgent', 'Wedding'],
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customer: {
      name: 'Ananya Iyer',
      phone: '+91 98765 43215',
      address: '987 Jayanagar, Bangalore, Karnataka 560041',
      email: 'ananya.iyer@email.com'
    },
    items: [
      {
        id: 'item-15',
        tagNumber: 'ORD-2024-006-ITM-001',
        itemType: 'Jacket',
        quantity: 1,
        services: ['dry_clean'],
        color: 'Leather - Black',
        status: 'workshop',
        price: 800,
        sentToWorkshop: true,
        workshopSentDate: new Date('2024-01-15T16:30:00'),
        workshopNotes: 'Leather specialist required',
      },
      {
        id: 'item-16',
        tagNumber: 'ORD-2024-006-ITM-002',
        itemType: 'Dress',
        quantity: 3,
        services: ['dry_clean', 'iron'],
        color: 'Various',
        status: 'workshop',
        price: 600,
        sentToWorkshop: true,
        workshopSentDate: new Date('2024-01-15T16:30:00'),
      },
    ],
    totalItems: 4,
    workshopItems: 4,
    services: ['Dry Clean', 'Iron'],
    specialInstructions: null,
    totalAmount: 1400,
    paidAmount: 1400,
    status: 'workshop' as OrderStatus,
    orderDate: new Date('2024-01-15T16:30:00'),
    deliveryDate: new Date('2024-01-17T12:00:00'),
    paymentMode: 'card' as PaymentMode,
    priority: 'normal',
  },
];

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Await the params object
  const { id } = await params;
  
  const order = MOCK_ORDERS.find((o) => o.id === id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="h-9 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
        {/* Order Header */}
        <OrderHeader order={order} />

        {/* Timeline & Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrderTimeline order={order} />
          </div>
          <div>
            <OrderActions order={order} />
          </div>
        </div>

        {/* Items Table */}
        <OrderItemsTable order={order} />

        {/* Info Cards */}
        <OrderInfoCards order={order} />
      </div>
    </div>
  );
}