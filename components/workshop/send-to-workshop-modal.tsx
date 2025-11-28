import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Truck, AlertTriangle } from "lucide-react";

interface ModalProps {
    count: number;
    onConfirm: () => void;
}

export function SendToWorkshopModal({ count, onConfirm }: ModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
          <Truck className="w-4 h-4 mr-2" />
          Send to Workshop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-0 p-0 overflow-hidden rounded-2xl">
        <div className="p-6 bg-white">
            <DialogHeader className="mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-900">
                Send Items to Workshop
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
                You are about to transfer <span className="font-bold text-slate-900">{count} item(s)</span> to the external workshop facility.
            </DialogDescription>
            </DialogHeader>
            
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                    <p className="font-semibold mb-1">Action Required</p>
                    <p>These items will not be marked "Ready" until they are received back from the workshop.</p>
                </div>
            </div>
        </div>

        <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="ghost" className="hover:bg-slate-200 text-slate-600">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button 
                onClick={onConfirm} 
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            >
                Confirm Transfer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}