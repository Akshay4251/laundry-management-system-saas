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
  | 'received'      
  | 'processing'    
  | 'workshop'      // Sent to external workshop
  | 'workshop_ready' // Back from workshop, ready for store check
  | 'ready'         // Processed and ready
  | 'delivered';  

export type ServiceType = 
  | 'wash'
  | 'dry_clean'
  | 'iron'
  | 'fold'
  | 'starch'
  | 'steam';

export interface Customer {
  id: string; // Added ID
  storeId: string; // NEW: Multi-store link
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
  storeId: string; 
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];              
  totalItems: number;              
  workshopItems: number;           
  services: string[];
  specialInstructions: string | null;
  totalAmount: number;
  paidAmount: number;
  discount?: number;
  tax?: number;
  status: OrderStatus;
  orderDate: Date;
  deliveryDate: Date;
  completedDate?: Date;
  paymentMode: PaymentMode;
  assignedTo?: string;             
  priority?: 'normal' | 'urgent' | 'express';
  tags?: string[];
}