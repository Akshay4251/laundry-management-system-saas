// app/types/order.ts
// ============================================================================
// ORDER TYPES - SYNCED WITH PRISMA SCHEMA
// ============================================================================

// ============================================================================
// ENUMS - MUST MATCH PRISMA EXACTLY
// ============================================================================

export type OrderStatus =
  | 'PICKUP'
  | 'IN_PROGRESS'
  | 'AT_WORKSHOP'
  | 'WORKSHOP_RETURNED'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type ItemStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'AT_WORKSHOP'
  | 'WORKSHOP_RETURNED'
  | 'READY'
  | 'COMPLETED';

export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'ONLINE';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type OrderPriority = 'NORMAL' | 'EXPRESS';
export type OrderType = 'PICKUP' | 'WALKIN';

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

export interface StatusConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  icon: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PICKUP: {
    label: 'Awaiting Pickup',
    description: 'Scheduled for pickup from customer',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    icon: 'Truck',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Order is being processed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    icon: 'Loader2',
  },
  AT_WORKSHOP: {
    label: 'At Workshop',
    description: 'All items sent to external workshop',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-500',
    icon: 'Factory',
  },
  WORKSHOP_RETURNED: {
    label: 'Workshop Returned',
    description: 'Items returned from workshop, awaiting QC',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    dotColor: 'bg-violet-500',
    icon: 'PackageCheck',
  },
  READY: {
    label: 'Ready',
    description: 'Ready for pickup or delivery',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    icon: 'CheckCircle2',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    description: 'Being delivered to customer',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    icon: 'Truck',
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Successfully delivered to customer',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: 'PackageCheck',
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'Order was cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
    icon: 'XCircle',
  },
};

export const ITEM_STATUS_CONFIG: Record<ItemStatus, StatusConfig> = {
  RECEIVED: {
    label: 'Received',
    description: 'Item received at store',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-500',
    icon: 'Package',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Item is being processed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    icon: 'Loader2',
  },
  AT_WORKSHOP: {
    label: 'At Workshop',
    description: 'Item sent to external workshop',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-500',
    icon: 'Factory',
  },
  WORKSHOP_RETURNED: {
    label: 'Workshop Returned',
    description: 'Returned from workshop, awaiting QC',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    dotColor: 'bg-violet-500',
    icon: 'PackageCheck',
  },
  READY: {
    label: 'Ready',
    description: 'Item is ready',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    icon: 'CheckCircle2',
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Item delivered to customer',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: 'UserCheck',
  },
};

// ============================================================================
// WORKFLOW TRANSITIONS - Complete State Machine
// ============================================================================

export interface WorkflowAction {
  targetStatus: OrderStatus;
  label: string;
  description?: string;
  icon: string;
  color: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
  requiresPayment?: boolean;
  requiresConfirmation?: boolean;
  confirmMessage?: string;
  isReverse?: boolean;
}

export const STATUS_TRANSITIONS: Record<OrderStatus, WorkflowAction[]> = {
  PICKUP: [
    {
      targetStatus: 'IN_PROGRESS',
      label: 'Items Received',
      description: 'Items picked up and received at store',
      icon: 'PackageCheck',
      color: 'text-blue-600',
      variant: 'success',
    },
    {
      targetStatus: 'CANCELLED',
      label: 'Cancel Pickup',
      description: 'Customer cancelled pickup request',
      icon: 'XCircle',
      color: 'text-red-600',
      variant: 'danger',
      requiresConfirmation: true,
      confirmMessage: 'Cancel this pickup order?',
    },
  ],

  IN_PROGRESS: [
    {
      targetStatus: 'READY',
      label: 'Mark Ready',
      description: 'All items processed and ready',
      icon: 'CheckCircle2',
      color: 'text-green-600',
      variant: 'success',
    },
    {
      targetStatus: 'AT_WORKSHOP',
      label: 'Send All to Workshop',
      description: 'Send entire order to external workshop',
      icon: 'Factory',
      color: 'text-purple-600',
      variant: 'warning',
      requiresConfirmation: true,
      confirmMessage: 'Send all items to external workshop?',
    },
    {
      targetStatus: 'CANCELLED',
      label: 'Cancel Order',
      icon: 'XCircle',
      color: 'text-red-600',
      variant: 'danger',
      requiresConfirmation: true,
      confirmMessage: 'Cancel this order? This cannot be undone.',
    },
  ],

  AT_WORKSHOP: [
    {
      targetStatus: 'WORKSHOP_RETURNED',
      label: 'Items Returned',
      description: 'All items received from workshop',
      icon: 'PackageCheck',
      color: 'text-violet-600',
      variant: 'success',
    },
    {
      targetStatus: 'IN_PROGRESS',
      label: 'Return for Processing',
      description: 'Workshop cancelled, process in-house',
      icon: 'RotateCcw',
      color: 'text-blue-600',
      variant: 'secondary',
      isReverse: true,
    },
    {
      targetStatus: 'CANCELLED',
      label: 'Cancel Order',
      icon: 'XCircle',
      color: 'text-red-600',
      variant: 'danger',
      requiresConfirmation: true,
      confirmMessage: 'Cancel this order? Items may still be at workshop.',
    },
  ],

  WORKSHOP_RETURNED: [
    {
      targetStatus: 'READY',
      label: 'Mark Ready',
      description: 'Items verified and ready for customer',
      icon: 'CheckCircle2',
      color: 'text-green-600',
      variant: 'success',
    },
    {
      targetStatus: 'IN_PROGRESS',
      label: 'Needs Rework',
      description: 'Issues found, needs reprocessing',
      icon: 'RotateCcw',
      color: 'text-orange-600',
      variant: 'warning',
      isReverse: true,
      requiresConfirmation: true,
      confirmMessage: 'Send back for rework due to issues?',
    },
    {
      targetStatus: 'AT_WORKSHOP',
      label: 'Return to Workshop',
      description: 'Workshop needs to redo',
      icon: 'Factory',
      color: 'text-purple-600',
      variant: 'secondary',
      isReverse: true,
    },
  ],

  READY: [
    {
      targetStatus: 'COMPLETED',
      label: 'Hand Over (Store Pickup)',
      description: 'Customer picked up at store',
      icon: 'UserCheck',
      color: 'text-emerald-600',
      variant: 'success',
      requiresPayment: true,
    },
    {
      targetStatus: 'OUT_FOR_DELIVERY',
      label: 'Send for Delivery',
      description: 'Dispatch for home delivery',
      icon: 'Truck',
      color: 'text-indigo-600',
      variant: 'default',
    },
    {
      targetStatus: 'IN_PROGRESS',
      label: 'Back to Processing',
      description: 'Needs additional work',
      icon: 'RotateCcw',
      color: 'text-orange-600',
      variant: 'warning',
      isReverse: true,
      requiresConfirmation: true,
      confirmMessage: 'Send order back to processing?',
    },
    {
      targetStatus: 'AT_WORKSHOP',
      label: 'Send to Workshop',
      description: 'Needs external workshop processing',
      icon: 'Factory',
      color: 'text-purple-600',
      variant: 'secondary',
      isReverse: true,
    },
    {
      targetStatus: 'CANCELLED',
      label: 'Cancel Order',
      icon: 'XCircle',
      color: 'text-red-600',
      variant: 'danger',
      requiresConfirmation: true,
    },
  ],

  OUT_FOR_DELIVERY: [
    {
      targetStatus: 'COMPLETED',
      label: 'Delivered',
      description: 'Successfully delivered to customer',
      icon: 'CheckCircle2',
      color: 'text-emerald-600',
      variant: 'success',
      requiresPayment: true,
    },
    {
      targetStatus: 'READY',
      label: 'Delivery Failed',
      description: 'Could not deliver, returned to store',
      icon: 'RotateCcw',
      color: 'text-orange-600',
      variant: 'warning',
      isReverse: true,
    },
  ],

  COMPLETED: [
    {
      targetStatus: 'IN_PROGRESS',
      label: 'Reprocess Order',
      description: 'Customer complaint - needs rework',
      icon: 'RefreshCcw',
      color: 'text-red-600',
      variant: 'danger',
      isReverse: true,
      requiresConfirmation: true,
      confirmMessage: 'Send this order back for reprocessing due to issues?',
    },
  ],

  CANCELLED: [],
};

export const CANCELLABLE_STATUSES: OrderStatus[] = [
  'PICKUP',
  'IN_PROGRESS',
  'AT_WORKSHOP',
  'WORKSHOP_RETURNED',
  'READY',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getStatusConfig(status: OrderStatus): StatusConfig {
  return ORDER_STATUS_CONFIG[status];
}

export function getItemStatusConfig(status: ItemStatus): StatusConfig {
  return ITEM_STATUS_CONFIG[status];
}

export function getAvailableActions(status: OrderStatus): WorkflowAction[] {
  return STATUS_TRANSITIONS[status] || [];
}

export function getForwardActions(status: OrderStatus): WorkflowAction[] {
  return getAvailableActions(status).filter((a) => !a.isReverse);
}

export function getReverseActions(status: OrderStatus): WorkflowAction[] {
  return getAvailableActions(status).filter((a) => a.isReverse);
}

export function canTransitionTo(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  const actions = STATUS_TRANSITIONS[fromStatus] || [];
  return actions.some((action) => action.targetStatus === toStatus);
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'CANCELLED';
}

export function isCompletedStatus(status: OrderStatus): boolean {
  return status === 'COMPLETED';
}

export function canBeCancelled(status: OrderStatus): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}

export function getInitialStatus(orderType: OrderType): OrderStatus {
  return orderType === 'PICKUP' ? 'PICKUP' : 'IN_PROGRESS';
}

// ============================================================================
// CART / ORDER CREATION TYPES
// ============================================================================

export interface CartOrderItem {
  cartKey: string;
  id: string;
  treatmentId: string;
  name: string;
  treatmentName: string;
  quantity: number;
  price: number;
  expressPrice?: number;
  iconUrl?: string | null;
  notes?: string;
}

// ============================================================================
// SIMPLIFIED CUSTOMER TYPE FOR ORDER FLOW
// ============================================================================

export interface OrderCustomer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
}

// ============================================================================
// DRIVER TYPE
// ============================================================================

export interface OrderDriver {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
}

// ============================================================================
// ORDER ADDRESS TYPE (Linked CustomerAddress)
// ============================================================================

export interface OrderAddress {
  id: string;
  label: string;
  fullAddress: string;
  landmark: string | null;
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface OrderStore {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
}

export interface OrderItemDetail {
  id: string;
  tagNumber: string;
  itemId: string | null;
  itemName: string;
  itemIcon?: string | null;
  itemCategory?: string;
  treatmentId: string | null;
  treatmentName: string | null;
  treatmentCode?: string;
  turnaroundHours?: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isExpress: boolean;
  status: ItemStatus;
  color?: string | null;
  brand?: string | null;
  notes?: string | null;
  sentToWorkshop: boolean;
  workshopPartnerName?: string | null;
  workshopSentDate?: string | null;
  workshopReturnedDate?: string | null;
  workshopNotes?: string | null;
}

export interface OrderPayment {
  id: string;
  amount: number;
  mode: PaymentMode;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy?: string | null;
  notes?: string | null;
  createdAt: string;
}

// ============================================================================
// ITEMS SUMMARY TYPE (for order list views)
// ============================================================================

export interface OrderItemsSummary {
  total: number;
  names: string[];
  preview: string;
}

// ============================================================================
// ORDER TYPE - Base order for list views
// ============================================================================

export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode | null;
  priority: OrderPriority;
  isExpress: boolean;

  // Customer & Store
  customer: OrderCustomer;
  store: OrderStore;

  // Driver assignment
  driverId?: string | null;
  driver?: OrderDriver | null;

  // Customer Address linked to this order
  address?: OrderAddress | null;

  // Amount breakdown
  subtotal: number;
  discount?: number | null;

  // GST
  gstEnabled: boolean;
  gstPercentage?: number | null;
  gstAmount?: number | null;

  // Legacy tax
  tax?: number | null;

  // Totals
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  // Dates
  pickupDate?: string | null;
  deliveryDate?: string | null;
  completedDate?: string | null;

  // Other
  specialInstructions?: string | null;
  assignedTo?: string | null;
  totalItems: number;
  totalQuantity: number;

  // Rework tracking
  isRework: boolean;
  reworkCount: number;
  reworkReason?: string | null;

  // Computed fields for list views
  itemsSummary?: OrderItemsSummary;
  workshopItems?: number;

  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  items: OrderItemDetail[];
  payments: OrderPayment[];
  statusHistory: OrderStatusHistoryItem[];
  stats: {
    totalItems: number;
    totalQuantity: number;
    workshopItems: number;
    completedItems: number;
    inProgressItems: number;
    atWorkshopItems: number;
    readyItems: number;
  };
}

// ============================================================================
// FILTER / QUERY TYPES
// ============================================================================

export interface OrderFilters {
  storeId?: string;
  status?: OrderStatus | 'all';
  orderType?: OrderType;
  paymentStatus?: PaymentStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// STATUS COUNTS TYPE
// ============================================================================

export interface StatusCounts {
  PICKUP: number;
  IN_PROGRESS: number;
  AT_WORKSHOP: number;
  WORKSHOP_RETURNED: number;
  READY: number;
  OUT_FOR_DELIVERY: number;
  COMPLETED: number;
  CANCELLED: number;
  total: number;
}

// ============================================================================
// WORKSHOP TYPES
// ============================================================================

export interface WorkshopItem {
  id: string;
  tagNumber: string;
  itemName: string;
  itemIcon: string | null;
  itemCategory: string | null;
  treatmentName: string | null;
  quantity: number;
  status: ItemStatus;
  isExpress: boolean;
  color: string | null;
  brand: string | null;
  notes: string | null;
  workshopPartnerName: string | null;
  workshopSentDate: string | null;
  workshopReturnedDate: string | null;
  workshopNotes: string | null;
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    priority: OrderPriority;
    customer: {
      id: string;
      fullName: string;
      phone: string;
    };
    store: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
}

export interface WorkshopStats {
  atWorkshop: number;
  returned: number;
  returnedToday: number;
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: OrderDetail;
}

export interface WorkshopResponse {
  success: boolean;
  data: {
    items: WorkshopItem[];
    stats: WorkshopStats;
  };
}

export interface OrderStatsResponse {
  success: boolean;
  data: {
    statusCounts: StatusCounts;
    workshopItems: number;
    today: {
      orders: number;
      revenue: number;
    };
  };
}

// ============================================================================
// FEATURE FLAGS TYPE
// ============================================================================

export interface BusinessFeatures {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  workshopEnabled: boolean;
  multiStoreEnabled?: boolean;
  expressMultiplier?: number;
  planType?: string;
  planStatus?: string;
}

// ============================================================================
// FEATURE-AWARE HELPERS
// ============================================================================

export function getFeatureAwareTransitions(status: OrderStatus, features: BusinessFeatures): WorkflowAction[] {
  const allActions = STATUS_TRANSITIONS[status] || [];

  return allActions.filter((action) => {
    if (action.targetStatus === 'AT_WORKSHOP' && !features.workshopEnabled) return false;
    if (action.targetStatus === 'OUT_FOR_DELIVERY' && !features.deliveryEnabled) return false;
    return true;
  });
}

export function getFeatureAwareForwardActions(status: OrderStatus, features: BusinessFeatures): WorkflowAction[] {
  return getFeatureAwareTransitions(status, features).filter((a) => !a.isReverse);
}

export function getFeatureAwareReverseActions(status: OrderStatus, features: BusinessFeatures): WorkflowAction[] {
  return getFeatureAwareTransitions(status, features).filter((a) => a.isReverse);
}

export function getSimplifiedFlow(features: BusinessFeatures): OrderStatus[] {
  const flow: OrderStatus[] = [];

  if (features.pickupEnabled) flow.push('PICKUP');
  flow.push('IN_PROGRESS');

  if (features.workshopEnabled) flow.push('AT_WORKSHOP', 'WORKSHOP_RETURNED');

  flow.push('READY');

  if (features.deliveryEnabled) flow.push('OUT_FOR_DELIVERY');

  flow.push('COMPLETED');

  return flow;
}

export function isStatusVisible(status: OrderStatus, features: BusinessFeatures): boolean {
  const alwaysVisible: OrderStatus[] = ['IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'];

  if (alwaysVisible.includes(status)) return true;

  switch (status) {
    case 'PICKUP':
      return features.pickupEnabled;
    case 'AT_WORKSHOP':
    case 'WORKSHOP_RETURNED':
      return features.workshopEnabled;
    case 'OUT_FOR_DELIVERY':
      return features.deliveryEnabled;
    default:
      return true;
  }
}

export function getNextStatus(currentStatus: OrderStatus, features: BusinessFeatures): OrderStatus | null {
  const flow = getSimplifiedFlow(features);

  const currentIndex = flow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === flow.length - 1) return null;

  return flow[currentIndex + 1];
}

// ============================================================================
// PICKUP ORDER HELPERS
// ============================================================================

export interface PickupOrderInput {
  storeId: string;
  customerId: string;
  pickupDate: string;
  pickupTimeSlot?: string;
  estimatedItemCount?: number;
  pickupAddress?: string;
  pickupNotes?: string;
  deliveryDate?: string;
}

export function isPickupAwaitingItems(order: Order | OrderDetail): boolean {
  return (
    order.status === 'PICKUP' &&
    order.orderType === 'PICKUP' &&
    (order.totalItems === 0 || order.totalAmount === 0)
  );
}

export function canAddItemsToOrder(order: Order | OrderDetail): boolean {
  return ['PICKUP', 'IN_PROGRESS'].includes(order.status);
}

export function canModifyOrder(order: Order | OrderDetail): boolean {
  return !['COMPLETED', 'CANCELLED', 'OUT_FOR_DELIVERY'].includes(order.status);
}

export function generateItemsSummary(items: OrderItemDetail[], maxPreview: number = 2): OrderItemsSummary {
  const names = items.map((item) => item.itemName);
  const total = items.length;

  let preview: string;
  if (total === 0) {
    preview = 'No items';
  } else if (total <= maxPreview) {
    preview = names.join(', ');
  } else {
    const shown = names.slice(0, maxPreview).join(', ');
    const remaining = total - maxPreview;
    preview = `${shown} + ${remaining} more`;
  }

  return { total, names, preview };
}

export function countWorkshopItems(items: OrderItemDetail[]): number {
  return items.filter(
    (item) => item.sentToWorkshop && (item.status === 'AT_WORKSHOP' || !item.workshopReturnedDate)
  ).length;
}

// ============================================================================
// ADDRESS DISPLAY HELPERS (for dashboard)
// ============================================================================

export function getOrderDisplayAddress(order: Order | OrderDetail): string | null {
  if (order.address) {
    const parts = [
      order.address.fullAddress,
      order.address.landmark,
      `${order.address.city} - ${order.address.pincode}`,
    ].filter(Boolean);
    return parts.join(', ');
  }
  return order.customer?.address || null;
}

export function getOrderAddressLabel(order: Order | OrderDetail): string | null {
  return order.address?.label || null;
}