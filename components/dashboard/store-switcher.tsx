"use client";

import * as React from "react";
import { 
  Check, 
  ChevronsUpDown, 
  PlusCircle, 
  Store, 
  Building2,
  MapPin
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// Mock Data
const stores = [
  { label: "Indiranagar Branch", value: "store_1", type: "Store" },
  { label: "Koramangala Hub", value: "store_2", type: "Store" },
  { label: "Central Workshop", value: "store_3", type: "Workshop" },
];

export function StoreSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [showNewStoreModal, setShowNewStoreModal] = React.useState(false);
  const [selectedStore, setSelectedStore] = React.useState(stores[0]);
  const router = useRouter();

  const onStoreSelect = (store: typeof stores[0]) => {
    setOpen(false);
    setSelectedStore(store);
    console.log("Switched context to:", store.label);
    router.refresh(); 
  };

  return (
    <Dialog open={showNewStoreModal} onOpenChange={setShowNewStoreModal}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a store"
            className={cn(
              "w-[240px] justify-between h-9 px-3 rounded-full transition-all duration-200",
              "border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700",
              "text-slate-700 shadow-sm",
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full shrink-0",
                selectedStore.type === 'Workshop' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
              )}>
                <Store className="h-3 w-3" />
              </div>
              <span className="truncate text-sm font-medium">{selectedStore.label}</span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0 rounded-2xl shadow-xl border-slate-100 overflow-hidden bg-white">
          <Command className="bg-white">
            <CommandList className="max-h-[300px] p-1">
              <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                No store found.
              </CommandEmpty>
              <CommandGroup heading="My Stores" className="text-xs font-medium text-slate-400 px-2 py-1.5">
                {stores.map((store) => (
                  <CommandItem
                    key={store.value}
                    onSelect={() => onStoreSelect(store)}
                    className="text-sm cursor-pointer rounded-xl px-3 py-2.5 aria-selected:bg-blue-50 aria-selected:text-blue-700 mb-1"
                  >
                    <div className={cn(
                        "mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        store.type === 'Workshop' 
                            ? "bg-purple-50 border-purple-100 text-purple-600" 
                            : "bg-white border-slate-200 text-slate-500"
                    )}>
                        <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className="font-medium">{store.label}</span>
                        <span className="text-[10px] text-slate-400">{store.type}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 text-blue-600",
                        selectedStore.value === store.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            
            <div className="p-1 border-t border-slate-100 bg-slate-50/50">
                <CommandGroup>
                    <CommandItem
                    onSelect={() => {
                        setOpen(false);
                        setShowNewStoreModal(true);
                    }}
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-blue-600 aria-selected:bg-blue-100 aria-selected:text-blue-700 font-medium"
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Store
                    </CommandItem>
                </CommandGroup>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* CREATE STORE MODAL */}
      <DialogContent className="sm:max-w-[450px] rounded-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-6 bg-white">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
             <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">Create New Store</DialogTitle>
          <DialogDescription className="text-slate-500">
            Add a new branch, collection center, or workshop to your organization.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700">Store Name</Label>
            <Input id="name" placeholder="e.g. Downtown Branch" className="rounded-lg border-slate-200 focus-visible:ring-blue-500" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-700">Location Type</Label>
            <div className="grid grid-cols-3 gap-3">
                {['Store', 'Workshop', 'Hub'].map((type) => (
                    <div key={type} className="relative">
                        <input type="radio" name="type" id={type} className="peer sr-only" defaultChecked={type === 'Store'} />
                        <label 
                            htmlFor={type}
                            className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-slate-100 bg-white p-3 hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50/50 peer-checked:text-blue-700 cursor-pointer transition-all text-xs font-medium text-slate-600"
                        >
                            {type}
                        </label>
                    </div>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-700">Location / City</Label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="location" placeholder="e.g. Bangalore" className="pl-9 rounded-lg border-slate-200 focus-visible:ring-blue-500" />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 mt-4">
          <Button variant="ghost" onClick={() => setShowNewStoreModal(false)} className="rounded-full text-slate-600 hover:text-slate-900">
            Cancel
          </Button>
          <Button type="submit" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
            Create Store
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}