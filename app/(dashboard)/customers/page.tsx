// app/(dashboard)/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Loader2,
  UserCog,
  X,
  Users,
  IndianRupee,
  UserPlus,
} from 'lucide-react';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCheckDuplicatePhone,
  type CustomerWithStats,
  type Customer,
} from '@/app/hooks/use-customers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  // ============= State =============
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerWithStats | null>(null);

  // Create Form State (NO NOTES)
  const [createFormData, setCreateFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<Customer | null>(null);

  // Edit Form State (WITH NOTES for existing customers)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // ============= Debounce Search =============
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ============= React Query Hooks =============
  const {
    data: customersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomers({
    search: debouncedSearch,
    page,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const customers = customersData?.data ?? [];
  const pagination = customersData?.pagination;

  const { mutateAsync: createCustomer, isPending: createLoading } = useCreateCustomer();
  const { mutateAsync: updateCustomer, isPending: updateLoading } = useUpdateCustomer();
  const { mutateAsync: deleteCustomer, isPending: deleteLoading } = useDeleteCustomer();
  const { mutateAsync: checkDuplicate } = useCheckDuplicatePhone();

  // ============= Reset Create Form =============
  useEffect(() => {
    if (!isCreateOpen) {
      setCreateFormData({ fullName: '', phone: '', email: '', address: '' });
      setCreateErrors({});
      setDuplicateWarning(null);
    }
  }, [isCreateOpen]);

  // ============= Load Edit Form =============
  useEffect(() => {
    if (editingCustomer) {
      setEditFormData({
        fullName: editingCustomer.fullName || '',
        phone: editingCustomer.phone || '',
        email: editingCustomer.email || '',
        address: editingCustomer.address || '',
        notes: editingCustomer.notes || '',
      });
      setEditErrors({});
    }
  }, [editingCustomer]);

  // ============= Validation =============
  const validateCreateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!createFormData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (createFormData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const cleanPhone = createFormData.phone.replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?\d{10,}$/.test(cleanPhone)) {
      newErrors.phone = 'Invalid phone number (10+ digits)';
    }

    if (createFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setCreateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (editFormData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const cleanPhone = editFormData.phone.replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?\d{10,}$/.test(cleanPhone)) {
      newErrors.phone = 'Invalid phone number (10+ digits)';
    }

    if (editFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============= Handlers =============
  const handleCreateInputChange = (field: string, value: string) => {
    setCreateFormData((prev) => ({ ...prev, [field]: value }));
    if (createErrors[field]) {
      setCreateErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (field === 'phone') {
      setDuplicateWarning(null);
    }
  };

  const handlePhoneBlur = async () => {
    const cleanPhone = createFormData.phone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.length >= 10) {
      try {
        const result = await checkDuplicate({ phone: cleanPhone });
        if (result.isDuplicate && result.customer) {
          setDuplicateWarning(result.customer);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleCreateSubmit = async () => {
    if (!validateCreateForm()) return;

    try {
      await createCustomer({
        fullName: createFormData.fullName.trim(),
        phone: createFormData.phone.trim(),
        email: createFormData.email.trim() || null,
        address: createFormData.address.trim() || null,
      });
      setIsCreateOpen(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm() || !editingCustomer) return;

    try {
      await updateCustomer({
        id: editingCustomer.id,
        data: {
          fullName: editFormData.fullName.trim(),
          phone: editFormData.phone.trim(),
          email: editFormData.email.trim() || null,
          address: editFormData.address.trim() || null,
          notes: editFormData.notes.trim() || null,
        },
      });
      setEditingCustomer(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;

    try {
      await deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  // ============= Format Helpers =============
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // ============= RENDER =============
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* ============= HEADER ============= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Customers
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Manage your customer database
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-6 h-11 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* ============= SEARCH & STATS BAR ============= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search customers by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-10 h-11 bg-white border-slate-200 rounded-full shadow-sm focus:shadow-md transition-shadow placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {pagination && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-slate-900">{pagination.total}</span>
            <span className="text-sm text-slate-600">
              {pagination.total === 1 ? 'customer' : 'customers'}
            </span>
          </div>
        )}
      </div>

      {/* ============= TABLE CARD ============= */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 hover:bg-slate-50">
              <TableHead className="w-[260px] font-semibold text-slate-900">Customer</TableHead>
              <TableHead className="w-[160px] font-semibold text-slate-900">Phone</TableHead>
              <TableHead className="w-[200px] font-semibold text-slate-900">Email</TableHead>
              <TableHead className="text-center w-[100px] font-semibold text-slate-900">Orders</TableHead>
              <TableHead className="text-center w-[120px] font-semibold text-slate-900">Total Spent</TableHead>
              <TableHead className="text-right w-[80px] font-semibold text-slate-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <X className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Failed to load customers</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {error instanceof Error ? error.message : 'Unknown error occurred'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 rounded-full">
                      Try Again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-lg">
                        {debouncedSearch ? 'No customers found' : 'No customers yet'}
                      </p>
                      <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                        {debouncedSearch
                          ? `No results found for "${debouncedSearch}". Try a different search.`
                          : 'Get started by adding your first customer to the database'}
                      </p>
                    </div>
                    {!debouncedSearch && (
                      <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Customer
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="popLayout">
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ring-2 ring-white">
                          {customer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{customer.fullName}</p>
                          <p className="text-xs text-slate-500">{formatDate(customer.createdAt)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-slate-900 font-medium">{customer.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {customer.email ? (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-slate-700 truncate">{customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-semibold border border-blue-200/50"
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        {customer.totalOrders || customer._count?.orders || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex items-center justify-center gap-1 text-sm font-semibold text-green-700">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {(customer.totalSpent || 0).toLocaleString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                          <DropdownMenuItem onClick={() => setEditingCustomer(customer)} className="rounded-lg cursor-pointer">
                            <Edit className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium">Edit Customer</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingCustomer(customer)}
                            className="text-red-600 focus:text-red-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span className="font-medium">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ============= PAGINATION ============= */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-sm text-slate-600 font-medium">
            Page <span className="text-slate-900 font-semibold">{pagination.page}</span> of{' '}
            <span className="text-slate-900 font-semibold">{pagination.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1 || isLoading}
              className="rounded-full h-10 px-4 font-medium hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="rounded-full h-10 px-4 font-medium hover:bg-slate-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ============= CREATE CUSTOMER DIALOG ============= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Add New Customer</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Create a new customer profile
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Duplicate Warning */}
            <AnimatePresence>
              {duplicateWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-800">Customer already exists</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          <span className="font-semibold">{duplicateWarning.fullName}</span> • {duplicateWarning.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-fullName" className="text-sm font-semibold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-fullName"
                  placeholder="John Doe"
                  value={createFormData.fullName}
                  onChange={(e) => handleCreateInputChange('fullName', e.target.value)}
                  className={cn('h-11', createErrors.fullName && 'border-red-300 focus-visible:ring-red-200')}
                />
                {createErrors.fullName && (
                  <p className="text-xs text-red-600 font-medium">{createErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-phone" className="text-sm font-semibold text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-phone"
                  placeholder="+91 98765 43210"
                  value={createFormData.phone}
                  onChange={(e) => handleCreateInputChange('phone', e.target.value)}
                  onBlur={handlePhoneBlur}
                  className={cn('h-11', createErrors.phone && 'border-red-300 focus-visible:ring-red-200')}
                />
                {createErrors.phone && (
                  <p className="text-xs text-red-600 font-medium">{createErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="create-email" className="text-sm font-semibold text-slate-700">
                Email <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="create-email"
                type="email"
                placeholder="customer@example.com"
                value={createFormData.email}
                onChange={(e) => handleCreateInputChange('email', e.target.value)}
                className={cn('h-11', createErrors.email && 'border-red-300 focus-visible:ring-red-200')}
              />
              {createErrors.email && (
                <p className="text-xs text-red-600 font-medium">{createErrors.email}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="create-address" className="text-sm font-semibold text-slate-700">
                Address <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="create-address"
                placeholder="Full address with landmark..."
                value={createFormData.address}
                onChange={(e) => handleCreateInputChange('address', e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createLoading}
              className="rounded-full h-11 px-6 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={createLoading || !!duplicateWarning}
              className="rounded-full h-11 px-6 font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= EDIT CUSTOMER DIALOG ============= */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserCog className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Edit Customer</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Update customer information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName" className="text-sm font-semibold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-fullName"
                  placeholder="John Doe"
                  value={editFormData.fullName}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, fullName: e.target.value });
                    if (editErrors.fullName) setEditErrors({ ...editErrors, fullName: '' });
                  }}
                  className={cn('h-11', editErrors.fullName && 'border-red-300 focus-visible:ring-red-200')}
                />
                {editErrors.fullName && (
                  <p className="text-xs text-red-600 font-medium">{editErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-sm font-semibold text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-phone"
                  placeholder="+91 98765 43210"
                  value={editFormData.phone}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, phone: e.target.value });
                    if (editErrors.phone) setEditErrors({ ...editErrors, phone: '' });
                  }}
                  className={cn('h-11', editErrors.phone && 'border-red-300 focus-visible:ring-red-200')}
                />
                {editErrors.phone && (
                  <p className="text-xs text-red-600 font-medium">{editErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-semibold text-slate-700">
                Email <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="customer@example.com"
                value={editFormData.email}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, email: e.target.value });
                  if (editErrors.email) setEditErrors({ ...editErrors, email: '' });
                }}
                className={cn('h-11', editErrors.email && 'border-red-300 focus-visible:ring-red-200')}
              />
              {editErrors.email && (
                <p className="text-xs text-red-600 font-medium">{editErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-sm font-semibold text-slate-700">
                Address <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="edit-address"
                placeholder="Full address with landmark..."
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="text-sm font-semibold text-slate-700">
                Notes <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="edit-notes"
                placeholder="Any additional notes about this customer..."
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditingCustomer(null)}
              disabled={updateLoading}
              className="rounded-full h-11 px-6 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateLoading}
              className="rounded-full h-11 px-6 font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {updateLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= DELETE CUSTOMER DIALOG ============= */}
      <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">{deletingCustomer?.fullName}</strong>? This action
              cannot be undone.
              {(deletingCustomer?.totalOrders || deletingCustomer?._count?.orders || 0) > 0 && (
                <span className="block mt-3 p-3 bg-orange-50 text-orange-700 rounded-lg font-medium text-sm border border-orange-200">
                  ⚠️ Warning: This customer has{' '}
                  {deletingCustomer?.totalOrders || deletingCustomer?._count?.orders || 0} order(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={deleteLoading} className="rounded-full h-11 px-6 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 rounded-full h-11 px-6 font-medium"
            >
              {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}