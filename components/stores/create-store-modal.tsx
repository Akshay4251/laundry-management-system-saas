'use client';

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Store, MapPin, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function CreateStoreModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Server Action to create store
    console.log("Creating store...");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Store
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle>Create New Store</DialogTitle>
            <DialogDescription>
              Add a new laundry branch to your organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Store Name</Label>
              <Input id="name" placeholder="e.g., Downtown Branch" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input id="phone" className="pl-9" placeholder="+91 98765 43210" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-slate-500" />
                <Textarea id="address" className="pl-9 resize-none" placeholder="Street, City, Zip Code" required />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Store</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}