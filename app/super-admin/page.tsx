// app/(super-admin)/page.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Users, ShoppingBag, CreditCard, ArrowUpRight, Loader2 } from 'lucide-react';
import { useSuperAdminStats } from '@/app/hooks/use-super-admin';
import { cn } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useSuperAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Platform overview and quick access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Businesses"
          value={stats?.businesses.total || 0}
          icon={Building2}
          color="blue"
          href="/super-admin/businesses"
        />
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          icon={Users}
          color="purple"
          href="/super-admin/users"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.businesses.active || 0}
          icon={CreditCard}
          color="green"
          href="/super-admin/subscriptions"
        />
        <StatCard
          title="Total Orders"
          value={(stats?.orders.total || 0).toLocaleString()}
          icon={ShoppingBag}
          color="orange"
        />
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Distribution</h2>
          <div className="space-y-4">
            <PlanBar label="Trial" value={stats?.planDistribution.trial || 0} total={stats?.businesses.total || 1} color="amber" />
            <PlanBar label="Basic" value={stats?.planDistribution.basic || 0} total={stats?.businesses.total || 1} color="green" />
            <PlanBar label="Professional" value={stats?.planDistribution.professional || 0} total={stats?.businesses.total || 1} color="blue" />
            <PlanBar label="Enterprise" value={stats?.planDistribution.enterprise || 0} total={stats?.businesses.total || 1} color="purple" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction href="/super-admin/users" icon={Users} title="Manage Users" description="View, edit, or delete users" color="purple" />
            <QuickAction href="/super-admin/businesses" icon={Building2} title="Manage Businesses" description="Toggle features for businesses" color="blue" />
            <QuickAction href="/super-admin/subscriptions" icon={CreditCard} title="Manage Subscriptions" description="Update business plans" color="green" />
          </div>
        </motion.div>
      </div>

      {/* User Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">User Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-700">{stats?.users.owners || 0}</p>
            <p className="text-sm text-purple-600">Owners</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-700">{stats?.users.admins || 0}</p>
            <p className="text-sm text-blue-600">Admins</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-700">{stats?.users.staff || 0}</p>
            <p className="text-sm text-green-600">Staff</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }: { title: string; value: string | number; icon: any; color: string; href?: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const content = (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {href && <ArrowUpRight className="w-4 h-4 text-slate-400 mt-2" />}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function PlanBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colors: Record<string, string> = { amber: 'bg-amber-500', green: 'bg-green-500', blue: 'bg-blue-500', purple: 'bg-purple-500' };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={cn('h-full rounded-full', colors[color])}
        />
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, title, description, color }: { href: string; icon: any; title: string; description: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
  };

  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-colors', colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-medium text-sm text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </Link>
  );
}