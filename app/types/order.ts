export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'ready' 
  | 'pickup' 
  | 'delivery' 
  | 'completed' 
  | 'cancelled';

export type PaymentMode = 'cash' | 'card' | 'upi' | 'online';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: number;
  totalAmount: number;
  paidAmount: number;
  status: OrderStatus;
  orderDate: Date;
  deliveryDate: Date;
  paymentMode: PaymentMode;
}