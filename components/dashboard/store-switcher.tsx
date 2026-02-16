// components/dashboard/store-switcher.tsx
// ✅ OPTIMIZED: Use AppContext instead of StoreContext

'use client';

import * as React from "react";
import { 
  Check, 
  ChevronsUpDown, 
  PlusCircle, 
  Store, 
  Building2,
  MapPin,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
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
import { useAppContext } from '@/app/contexts/app-context'; // ⚡ NEW
import { toast } from 'sonner';

interface StoreSwitcherProps {
  className?: string;
}

export function StoreSwitcher({ className }: StoreSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showNewStoreModal, setShowNewStoreModal] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newStoreName, setNewStoreName] = React.useState('');
  const [newStoreLocation, setNewStoreLocation] = React.useState('');
  
  // ⚡ OPTIMIZED: Use unified context
  const { 
    stores, 
    selectedStore, 
    setSelectedStoreId, 
    isLoading: loading,
    refetch: refreshStores,
  } = useAppContext();

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
    setOpen(false);
  };

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) {
      toast.error('Store name is required');
      return;
    }

    try {
      setIsCreating(true);
      
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStoreName.trim(),
          address: newStoreLocation.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create store');
      }

      toast.success('Store created successfully!', {
        description: `${newStoreName} has been added.`,
      });

      // Refresh stores and select the new one
      await refreshStores();
      setSelectedStoreId(result.data.id);
      
      // Reset form and close modal
      setNewStoreName('');
      setNewStoreLocation('');
      setShowNewStoreModal(false);
    } catch (error) {
      toast.error('Failed to create store', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <Button 
        variant="outline" 
        className={cn("w-full justify-between h-9 px-3 rounded-full", className)} 
        disabled
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          <span className="text-slate-400">Loading stores...</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  const currentLabel = selectedStore?.name || "Select Store";

  return (
    <>
      {/* Store Selector Popover */}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a store"
            className={cn(
              "w-full justify-between h-9 px-3 rounded-full transition-all duration-200",
              "border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700",
              "text-slate-700 shadow-sm",
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <div className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 bg-blue-100 text-blue-600">
                <Store className="h-3 w-3" />
              </div>
              <span className="truncate text-sm font-medium">{currentLabel}</span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[240px] p-0 rounded-2xl shadow-xl border-slate-200 bg-white z-[100]"
          align="start"
          sideOffset={8}
        >
          <Command className="bg-white rounded-2xl">
            <CommandInput 
              placeholder="Search store..." 
              className="h-10 border-0"
            />
            <CommandList className="max-h-[280px]">
              <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                No store found.
              </CommandEmpty>
              
              {stores.length > 0 && (
                <CommandGroup heading="My Stores" className="px-2 py-1.5">
                  {stores.map((store) => (
                    <CommandItem
                      key={store.id}
                      value={store.name}
                      onSelect={() => handleStoreSelect(store.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-700 mb-1"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white border-slate-200 text-slate-500">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{store.name}</span>
                        {store.address && (
                          <span className="text-[10px] text-slate-400 truncate">
                            {store.address}
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 text-blue-600 shrink-0",
                          selectedStore?.id === store.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            
            {/* Create New Store Button */}
            <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => {
                  setOpen(false);
                  setShowNewStoreModal(true);
                }}
                className="flex items-center w-full gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Create New Store
              </button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Store Modal */}
      <Dialog open={showNewStoreModal} onOpenChange={setShowNewStoreModal}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl gap-0 p-0 overflow-hidden bg-white z-[200]">
          <DialogHeader className="px-6 py-6 bg-white">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Create New Store
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Add a new branch, collection center, or workshop to your organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name" className="text-slate-700">
                Store Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="store-name" 
                placeholder="e.g. Downtown Branch" 
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="rounded-lg border-slate-200 focus-visible:ring-blue-500"
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store-location" className="text-slate-700">
                Location / Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="store-location" 
                  placeholder="e.g. 123 Main Street, Bangalore"
                  value={newStoreLocation}
                  onChange={(e) => setNewStoreLocation(e.target.value)}
                  className="pl-9 rounded-lg border-slate-200 focus-visible:ring-blue-500"
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={() => setShowNewStoreModal(false)} 
              className="rounded-full text-slate-600 hover:text-slate-900"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStore}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              disabled={isCreating || !newStoreName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Store'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}