// Updated order statuses
export type OrderStatus = 
  | 'new'           // Just received at collection center
  | 'processing'    // Being sorted, tagged, washed at center
  | 'workshop'      // Sent to external workshop
  | 'ready'         // Ready for pickup/delivery
  | 'delivery'      // Out for delivery
  | 'completed'     // Customer received
  | 'cancelled';    // Order cancelled

export type PaymentMode = 'cash' | 'card' | 'upi' | 'online';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type ItemStatus = 
  | 'received'      // Item received at center
  | 'processing'    // Being processed at center
  | 'workshop'      // At workshop
  | 'ready'         // Processed and ready
  | 'delivered';    // Delivered to customer

export type ServiceType = 
  | 'wash'
  | 'dry_clean'
  | 'iron'
  | 'fold'
  | 'starch'
  | 'steam';

export interface Customer {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

// Individual item in an order
export interface OrderItem {
  id: string;
  tagNumber: string;              // Unique tag: ORD-2024-001-ITM-001
  itemType: string;                // Shirt, Pant, Saree, etc.
  quantity: number;
  services: ServiceType[];
  color?: string;
  brand?: string;
  notes?: string;
  status: ItemStatus;
  price: number;
  
  // Workshop tracking
  sentToWorkshop: boolean;
  workshopSentDate?: Date;
  workshopReturnedDate?: Date;
  workshopNotes?: string;
}

// Workshop batch tracking
export interface WorkshopBatch {
  id: string;
  batchNumber: string;
  orderId: string;
  items: OrderItem[];
  sentDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  status: 'sent' | 'partial_return' | 'completed';
  workshopName: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  
  // Items
  items: OrderItem[];              // Individual tracked items
  totalItems: number;              // Total item count
  
  // Workshop tracking
  workshopItems: number;           // Items currently at workshop
  
  // Legacy fields (for backward compatibility)
  services: string[];
  specialInstructions: string | null;
  
  // Financial
  totalAmount: number;
  paidAmount: number;
  discount?: number;
  tax?: number;
  
  // Status & tracking
  status: OrderStatus;
  orderDate: Date;
  deliveryDate: Date;
  completedDate?: Date;
  
  // Payment
  paymentMode: PaymentMode;
  
  // Additional metadata
  assignedTo?: string;             // Staff member
  priority?: 'normal' | 'urgent' | 'express';
  tags?: string[];
}