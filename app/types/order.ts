// app/types/order.ts

export type OrderStatus = 
  | 'pickup'        // NEW: Scheduled for pickup (Driver collecting dirty clothes)
  | 'processing'    // Washing/Ironing/Tagging
  | 'workshop'      // Sent to external unit
  | 'ready'         // Ready at store
  | 'delivery'      // Out for delivery (Clean clothes going to customer)
  | 'delivered'     // Handed over (Payment might be pending)
  | 'completed'     // Closed/Archived
  | 'cancelled';    

// ... Rest of the file remains exactly the same ...
export type PaymentMode = 'cash' | 'card' | 'upi' | 'online';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type ItemStatus = 'received' | 'processing' | 'workshop' | 'workshop_ready' | 'ready' | 'delivered';  
export type ServiceType = 'wash' | 'dry_clean' | 'iron' | 'fold' | 'starch' | 'steam';

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface OrderItem {
  id: string;
  tagNumber: string;
  itemType: string;
  quantity: number;
  services: ServiceType[];
  color?: string;
  brand?: string;
  notes?: string;
  status: ItemStatus;
  price: number;
  sentToWorkshop: boolean;
  workshopSentDate?: Date;
  workshopReturnedDate?: Date;
  workshopNotes?: string;
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