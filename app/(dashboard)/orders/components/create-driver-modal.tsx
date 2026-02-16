// app/(dashboard)/orders/components/create-driver-modal.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateDriver } from '@/app/hooks/use-drivers';

export type CreateDriverValues = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

interface CreateDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (driverId: string) => void; // for auto-assign
}

export function CreateDriverModal({ open, onOpenChange, onCreated }: CreateDriverModalProps) {
  const { mutateAsync, isPending } = useCreateDriver();

  const [values, setValues] = useState<CreateDriverValues>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!open) {
      setValues({ fullName: '', phone: '', email: '', password: '' });
    }
  }, [open]);

  const canSubmit = Boolean(values.fullName.trim() && values.phone.trim() && values.password.trim());

  const submit = async () => {
    const fullName = values.fullName.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();
    const password = values.password;

    if (!fullName || !phone || !password) return;

    const result = await mutateAsync({
      fullName,
      phone,
      email: email ? email : null,
      password,
    });

    const newDriverId = result.data.id;
    onCreated?.(newDriverId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Driver</DialogTitle>
          <DialogDescription>
            Create a driver account. Driver can login using phone/email + password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={values.fullName}
              onChange={(e) => setValues((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={values.phone}
              onChange={(e) => setValues((p) => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="space-y-2">
            <Label>Email (optional)</Label>
            <Input
              value={values.email}
              onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))}
              placeholder="e.g. driver@gmail.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              value={values.password}
              onChange={(e) => setValues((p) => ({ ...p, password: e.target.value }))}
              placeholder="Set a password"
              type="password"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit || isPending}>
            {isPending ? 'Creating...' : 'Create Driver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}