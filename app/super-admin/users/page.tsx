// app/(super-admin)/users/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Search,
  Users,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Mail,
  Building2,
  MoreHorizontal,
  KeyRound,
  Trash2,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminUsers, useDeleteUser, useResetUserPassword } from '@/app/hooks/use-super-admin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data, isLoading, isError, refetch } = useSuperAdminUsers({ search: searchQuery, role: roleFilter });
  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();

  const users = data?.items || [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (deleteUserId) {
      await deleteUser.mutateAsync(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const handleResetPassword = async () => {
    if (resetPasswordUser && newPassword.length >= 6) {
      await resetPassword.mutateAsync({ userId: resetPasswordUser.id, newPassword });
      setResetPasswordUser(null);
      setNewPassword('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Manage all users across businesses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="flex items-center h-11 rounded-full border border-slate-200 bg-white hover:border-slate-300">
            <Search className="w-5 h-5 ml-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full bg-transparent border-0 outline-none text-sm px-3"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              'h-11 px-4 rounded-full border bg-white flex items-center gap-2 transition-all',
              isFilterOpen ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <span className="text-sm text-slate-600">Role:</span>
            <span className="text-sm font-medium text-slate-900">{roleFilter === 'all' ? 'All' : roleFilter}</span>
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', isFilterOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50"
                >
                  {['all', 'OWNER', 'ADMIN', 'STAFF'].map((role) => (
                    <button
                      key={role}
                      onClick={() => { setRoleFilter(role); setIsFilterOpen(false); }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                        roleFilter === role ? 'bg-red-50 text-red-700' : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <span>{role === 'all' ? 'All Roles' : role}</span>
                      {roleFilter === role && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-sm font-medium text-slate-900">Failed to load users</p>
            <button onClick={() => refetch()} className="mt-2 text-sm text-red-600 hover:text-red-700">Try again</button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-900">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-medium">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user.fullName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {user.business && (
                    <Link
                      href={`/super-admin/businesses?search=${encodeURIComponent(user.business.businessName)}`}
                      className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600"
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="max-w-[120px] truncate">{user.business.businessName}</span>
                    </Link>
                  )}

                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    user.role === 'OWNER' && 'bg-purple-100 text-purple-700',
                    user.role === 'ADMIN' && 'bg-blue-100 text-blue-700',
                    user.role === 'STAFF' && 'bg-green-100 text-green-700',
                  )}>
                    {user.role}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-lg hover:bg-slate-100">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem
                        onClick={() => setResetPasswordUser({ id: user.id, name: user.fullName })}
                        className="gap-2 text-sm rounded-lg"
                      >
                        <KeyRound className="w-4 h-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteUserId(user.id)}
                        className="gap-2 text-sm rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center">
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
          </span>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="rounded-full bg-red-600 hover:bg-red-700"
            >
              {deleteUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUser} onOpenChange={() => { setResetPasswordUser(null); setNewPassword(''); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetPasswordUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetPasswordUser(null); setNewPassword(''); }} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={newPassword.length < 6 || resetPassword.isPending}
              className="rounded-full bg-red-600 hover:bg-red-700"
            >
              {resetPassword.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}