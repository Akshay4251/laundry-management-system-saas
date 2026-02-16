// app/(dashboard)/orders/components/driver-assignment-cell.tsx

'use client';

import { useMemo, useState } from 'react';
import { ChevronsUpDown, UserPlus, UserX, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { CreateDriverModal } from './create-driver-modal';
import { useAssignDriver } from '@/app/hooks/use-orders';
import type { DriverListItem } from '@/app/hooks/use-drivers';
import type { Order } from '@/app/types/order';

interface DriverAssignmentCellProps {
  order: Order;
  drivers: DriverListItem[];
  driversLoading: boolean;
}

export function DriverAssignmentCell({ order, drivers, driversLoading }: DriverAssignmentCellProps) {
  const { mutate, isPending } = useAssignDriver();

  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const activeDrivers = useMemo(() => drivers.filter((d) => d.isActive), [drivers]);

  const currentDriverName = order.driver?.fullName || (order.driverId ? 'Assigned' : 'Unassigned');
  const disabled = order.status === 'COMPLETED' || order.status === 'CANCELLED';

  const assign = (driverId: string | null) => {
    mutate(
      { orderId: order.id, driverId },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  const handleCreated = (driverId: string) => {
    // auto-assign newly created driver
    assign(driverId);
  };

  return (
    <>
      <CreateDriverModal open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || driversLoading || isPending}
            className={cn(
              'w-full justify-between rounded-lg',
              order.driverId ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'
            )}
          >
            <span className="truncate text-left">
              {driversLoading ? 'Loading...' : currentDriverName}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[260px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search driver..." />
            <CommandList>
              <CommandEmpty>No drivers found.</CommandEmpty>

              <CommandGroup heading="Assignment">
                <CommandItem onSelect={() => assign(null)} className="cursor-pointer">
                  <UserX className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Unassign</span>
                  {!order.driverId && <Check className="ml-auto h-4 w-4 text-blue-600" />}
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Drivers">
                {activeDrivers.map((d) => (
                  <CommandItem key={d.id} onSelect={() => assign(d.id)} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{d.fullName}</span>
                      <span className="text-xs text-slate-500">
                        {d.phone}
                        {d.email ? ` • ${d.email}` : ''}
                      </span>
                    </div>
                    {order.driverId === d.id && <Check className="ml-auto h-4 w-4 text-blue-600" />}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Add Driver</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}