// app/(dashboard)/orders/components/order-table.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderTableRow } from './order-row';
import { OrderMobileCard } from './order-mobile-card';
import { OrderDialogs, ConfirmDialogState, WorkshopDialogState } from './order-dialogs';
import { useUpdateOrderStatus, useCancelOrder, useSendItemsToWorkshop } from '@/app/hooks/use-orders';
import { useAppContext } from '@/app/contexts/app-context';
import { Order, OrderStatus, OrderItemDetail, BusinessFeatures } from '@/app/types/order';
import { toast } from 'sonner';
import { useDrivers } from '@/app/hooks/use-drivers';

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { mutate: sendToWorkshop, isPending: isSendingToWorkshop } = useSendItemsToWorkshop();

  const { features } = useAppContext();

  const { data: driversRes, isLoading: driversLoading } = useDrivers();
  const drivers = driversRes?.data ?? [];

  const activeFeatures: BusinessFeatures = features || {
    pickupEnabled: true,
    deliveryEnabled: true,
    workshopEnabled: false,
  };

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    orderId: '',
    orderNumber: '',
    action: 'cancel',
    targetStatus: undefined,
    message: '',
  });

  const [sendAllDialog, setSendAllDialog] = useState<WorkshopDialogState>({
    open: false,
    orderId: '',
    orderNumber: '',
  });

  const [selectItemsDialog, setSelectItemsDialog] = useState<WorkshopDialogState>({
    open: false,
    orderId: '',
    orderNumber: '',
  });

  const [workshopPartnerName, setWorkshopPartnerName] = useState('');
  const [workshopNotes, setWorkshopNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const eligibleItems = orderItems.filter((item) => !item.sentToWorkshop);
  const allSelected = selectedItems.length === eligibleItems.length && eligibleItems.length > 0;

  const handleStatusUpdate = (
    orderId: string,
    newStatus: OrderStatus,
    requiresConfirmation?: boolean,
    confirmMessage?: string,
    orderNumber?: string
  ) => {
    if (requiresConfirmation) {
      setConfirmDialog({
        open: true,
        orderId,
        orderNumber: orderNumber || '',
        action: 'status',
        targetStatus: newStatus,
        message: confirmMessage || '',
      });
    } else {
      updateStatus({ id: orderId, status: newStatus });
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'cancel') {
      cancelOrder(confirmDialog.orderId);
    } else if (confirmDialog.action === 'status' && confirmDialog.targetStatus) {
      updateStatus({ id: confirmDialog.orderId, status: confirmDialog.targetStatus });
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    setConfirmDialog({
      open: true,
      orderId,
      orderNumber,
      action: 'cancel',
      targetStatus: undefined,
      message: `Are you sure you want to cancel order ${orderNumber}? This action cannot be undone.`,
    });
  };

  const handleOpenSendAllDialog = (orderId: string, orderNumber: string) => {
    setSendAllDialog({ open: true, orderId, orderNumber });
    setWorkshopPartnerName('');
    setWorkshopNotes('');
  };

  const handleConfirmSendAll = () => {
    updateStatus({
      id: sendAllDialog.orderId,
      status: 'AT_WORKSHOP',
      notes: 'Entire order sent to workshop',
      workshopPartnerName: workshopPartnerName.trim() || 'External Workshop',
      workshopNotes: workshopNotes.trim() || undefined,
    });
    setSendAllDialog({ open: false, orderId: '', orderNumber: '' });
    setWorkshopPartnerName('');
    setWorkshopNotes('');
  };

  const fetchOrderItems = async (orderId: string) => {
    setFetchingItems(true);
    setSelectedItems([]);
    setFetchError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch order details');
      }

      setOrderItems(result.data?.items || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load items';
      setFetchError(errorMsg);
      toast.error('Failed to load order items');
      setOrderItems([]);
    } finally {
      setFetchingItems(false);
    }
  };

  const handleOpenSelectItemsDialog = async (orderId: string, orderNumber: string) => {
    setSelectItemsDialog({ open: true, orderId, orderNumber });
    setWorkshopPartnerName('');
    setWorkshopNotes('');
    await fetchOrderItems(orderId);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(eligibleItems.map((item) => item.id));
    }
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleConfirmSelectItems = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    sendToWorkshop(
      {
        orderId: selectItemsDialog.orderId,
        itemIds: selectedItems,
        workshopPartnerName: workshopPartnerName.trim() || undefined,
        workshopNotes: workshopNotes.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Items sent to workshop!');
          resetSelectItemsDialog();
        },
        onError: (error) => {
          toast.error('Failed to send items', { description: error.message });
        },
      }
    );
  };

  const resetSelectItemsDialog = () => {
    setSelectItemsDialog({ open: false, orderId: '', orderNumber: '' });
    setSelectedItems([]);
    setWorkshopPartnerName('');
    setWorkshopNotes('');
    setOrderItems([]);
    setFetchError(null);
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No orders found</h3>
        <p className="text-sm text-slate-500 mb-6">Try adjusting your filters or create a new order</p>
        <Button onClick={() => router.push('/create-order')} className="gap-2">
          <ShoppingBag className="w-4 h-4" />
          Create Order
        </Button>
      </div>
    );
  }

  return (
    <>
      <OrderDialogs
        confirmDialog={confirmDialog}
        sendAllDialog={sendAllDialog}
        selectItemsDialog={selectItemsDialog}
        workshopPartnerName={workshopPartnerName}
        workshopNotes={workshopNotes}
        onConfirmDialogChange={setConfirmDialog}
        onSendAllDialogChange={setSendAllDialog}
        onSelectItemsDialogChange={setSelectItemsDialog}
        onWorkshopPartnerNameChange={setWorkshopPartnerName}
        onWorkshopNotesChange={setWorkshopNotes}
        onConfirmAction={handleConfirmAction}
        onConfirmSendAll={handleConfirmSendAll}
        onConfirmSelectItems={handleConfirmSelectItems}
        isUpdating={isUpdating}
        isCancelling={isCancelling}
        isSendingToWorkshop={isSendingToWorkshop}
        orderItems={orderItems}
        selectedItems={selectedItems}
        onToggleItem={handleToggleItem}
        onSelectAll={handleSelectAll}
        fetchingItems={fetchingItems}
        fetchError={fetchError}
      />

      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[70px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Order</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Customer</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Items</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Driver</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">Delivery</th>
                <th className="text-center py-4 px-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  features={activeFeatures}
                  drivers={drivers}
                  driversLoading={driversLoading}
                  onViewDetails={() => router.push(`/orders/${order.id}`)}
                  onStatusUpdate={handleStatusUpdate}
                  onOpenSelectItems={handleOpenSelectItemsDialog}
                  onOpenSendAll={handleOpenSendAllDialog}
                  onCancelOrder={handleCancelOrder}
                  isUpdating={isUpdating}
                  isCancelling={isCancelling}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-4">
        {orders.map((order) => (
          <OrderMobileCard
            key={order.id}
            order={order}
            features={activeFeatures}
            drivers={drivers}
            driversLoading={driversLoading}
            onViewDetails={() => router.push(`/orders/${order.id}`)}
            onStatusUpdate={handleStatusUpdate}
            onOpenSelectItems={handleOpenSelectItemsDialog}
            onOpenSendAll={handleOpenSendAllDialog}
            onCancelOrder={handleCancelOrder}
            isUpdating={isUpdating}
            isCancelling={isCancelling}
          />
        ))}
      </div>
    </>
  );
}