'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Building2, User, Bell, Lock, Palette, 
  Globe, Check, ChevronDown, Camera, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TAB OPTIONS
// ============================================
const TAB_OPTIONS = [
  { value: 'business', label: 'Business', icon: Building2, dot: 'bg-blue-500' },
  { value: 'profile', label: 'Profile', icon: User, dot: 'bg-emerald-500' },
  { value: 'notifications', label: 'Notifications', icon: Bell, dot: 'bg-amber-500' },
  { value: 'security', label: 'Security', icon: Lock, dot: 'bg-red-500' },
  { value: 'appearance', label: 'Appearance', icon: Palette, dot: 'bg-purple-500' },
] as const;

// ============================================
// CUSTOM SELECT COMPONENT
// ============================================
interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'w-full h-11 flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
          isOpen
            ? 'border-blue-400 ring-4 ring-blue-50'
            : 'border-slate-200 hover:border-slate-300'
        )}
      >
        <span className={cn(
          'text-sm truncate',
          currentOption ? 'text-slate-700 font-medium' : 'text-slate-400'
        )}>
          {currentOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-slate-400 shrink-0 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors',
                  value === option.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CUSTOM INPUT COMPONENT (Pill Style)
// ============================================
interface PillInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

function PillInput({ label, className, ...props }: PillInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium text-slate-700">{label}</Label>}
      <div
        className={cn(
          'flex items-center h-11 rounded-full border bg-white transition-all duration-200',
          isFocused
            ? 'border-blue-400 ring-4 ring-blue-50 shadow-lg shadow-blue-100/50'
            : 'border-slate-200 hover:border-slate-300',
          className
        )}
      >
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className="flex-1 h-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 px-4 rounded-full"
        />
      </div>
    </div>
  );
}

// ============================================
// CUSTOM TEXTAREA COMPONENT (Pill Style)
// ============================================
interface PillTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

function PillTextarea({ label, className, ...props }: PillTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium text-slate-700">{label}</Label>}
      <div
        className={cn(
          'rounded-2xl border bg-white transition-all duration-200',
          isFocused
            ? 'border-blue-400 ring-4 ring-blue-50 shadow-lg shadow-blue-100/50'
            : 'border-slate-200 hover:border-slate-300',
          className
        )}
      >
        <textarea
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 p-4 rounded-2xl resize-none min-h-[100px]"
        />
      </div>
    </div>
  );
}

// ============================================
// TOGGLE SWITCH COMPONENT
// ============================================
interface ToggleRowProps {
  id: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}

function ToggleRow({ id, title, description, defaultChecked }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium text-slate-900 cursor-pointer">{title}</Label>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}

// ============================================
// SESSION CARD COMPONENT
// ============================================
interface SessionCardProps {
  device: string;
  lastActive: string;
  isCurrent?: boolean;
}

function SessionCard({ device, lastActive, isCurrent }: SessionCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Globe className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{device}</p>
          <p className="text-xs text-slate-500">{lastActive}</p>
        </div>
      </div>
      {isCurrent ? (
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
          Current
        </span>
      ) : (
        <button className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">
          Revoke
        </button>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('business');
  const [isSaving, setIsSaving] = useState(false);
  const [isTabSelectOpen, setIsTabSelectOpen] = useState(false);

  // Form states
  const [currency, setCurrency] = useState('inr');
  const [timezone, setTimezone] = useState('ist');
  const [role, setRole] = useState('admin');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('dmy');
  const [timeFormat, setTimeFormat] = useState('12');

  const currentTab = TAB_OPTIONS.find(tab => tab.value === activeTab);
  const CurrentIcon = currentTab?.icon || Building2;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  useEffect(() => {
    const handleClickOutside = () => setIsTabSelectOpen(false);
    if (isTabSelectOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isTabSelectOpen]);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm">
        <div className="px-4 lg:px-6 py-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
              <p className="text-slate-500 text-sm">Manage your business preferences</p>
            </div>
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'h-11 px-6 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2',
                isSaving
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              )}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>

          {/* Tab Navigation - Pill Style */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Mobile Tab Select */}
            <div className="sm:hidden relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTabSelectOpen(!isTabSelectOpen);
                }}
                className={cn(
                  'w-full h-11 flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
                  isTabSelectOpen
                    ? 'border-blue-400 ring-4 ring-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', currentTab?.dot)} />
                  <CurrentIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{currentTab?.label}</span>
                </div>
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 shrink-0 transition-transform',
                  isTabSelectOpen && 'rotate-180'
                )} />
              </button>

              <AnimatePresence>
                {isTabSelectOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {TAB_OPTIONS.map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => {
                            setActiveTab(tab.value);
                            setIsTabSelectOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors',
                            activeTab === tab.value
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={cn('w-2 h-2 rounded-full shrink-0', tab.dot)} />
                            <TabIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{tab.label}</span>
                          </div>
                          {activeTab === tab.value && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Tab Pills */}
            <div className="hidden sm:flex items-center gap-2 p-1 bg-white rounded-full border border-slate-200">
              {TAB_OPTIONS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-6">
        <AnimatePresence mode="wait">
          {/* Business Settings */}
          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              {/* Business Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Business Information</h2>
                      <p className="text-sm text-slate-500">Update your business details</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <PillInput label="Business Name" defaultValue="LaundryPro" />
                    <PillInput label="Business Email" type="email" defaultValue="contact@laundrypro.com" />
                    <PillInput label="Phone Number" defaultValue="+91 98765 43210" />
                    <PillInput label="GST Number" defaultValue="29ABCDE1234F1Z5" />
                  </div>

                  <PillTextarea label="Business Address" defaultValue="123 Main Street, Bangalore, Karnataka 560001" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Currency</Label>
                      <CustomSelect
                        options={[
                          { value: 'inr', label: 'INR (₹)' },
                          { value: 'usd', label: 'USD ($)' },
                          { value: 'eur', label: 'EUR (€)' },
                        ]}
                        value={currency}
                        onChange={setCurrency}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Timezone</Label>
                      <CustomSelect
                        options={[
                          { value: 'ist', label: 'IST (UTC+5:30)' },
                          { value: 'pst', label: 'PST (UTC-8)' },
                          { value: 'est', label: 'EST (UTC-5)' },
                        ]}
                        value={timezone}
                        onChange={setTimezone}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                      <p className="text-sm text-slate-500">Update your personal details</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                        AP
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <Camera className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                    <div>
                      <button className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Change Photo
                      </button>
                      <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <PillInput label="First Name" defaultValue="Admin" />
                    <PillInput label="Last Name" defaultValue="User" />
                    <PillInput label="Email" type="email" defaultValue="admin@laundrypro.com" />
                    <PillInput label="Phone" defaultValue="+91 98765 43210" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Role</Label>
                    <CustomSelect
                      options={[
                        { value: 'admin', label: 'Administrator' },
                        { value: 'manager', label: 'Manager' },
                        { value: 'staff', label: 'Staff' },
                      ]}
                      value={role}
                      onChange={setRole}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                      <p className="text-sm text-slate-500">Manage how you receive notifications</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <ToggleRow
                    id="emailNotif"
                    title="Email Notifications"
                    description="Receive notifications via email"
                    defaultChecked
                  />
                  <ToggleRow
                    id="smsNotif"
                    title="SMS Notifications"
                    description="Receive notifications via SMS"
                    defaultChecked
                  />
                  <ToggleRow
                    id="pushNotif"
                    title="Push Notifications"
                    description="Receive push notifications on mobile"
                  />
                </div>

                <div className="p-5 border-t border-slate-100 space-y-4">
                  <h3 className="font-medium text-slate-900">Notification Types</h3>
                  <ToggleRow
                    id="newOrder"
                    title="New Orders"
                    description="Get notified when new orders arrive"
                    defaultChecked
                  />
                  <ToggleRow
                    id="orderComplete"
                    title="Order Completion"
                    description="Get notified when orders are completed"
                    defaultChecked
                  />
                  <ToggleRow
                    id="lowStock"
                    title="Low Stock Alerts"
                    description="Get notified when inventory is low"
                    defaultChecked
                  />
                  <ToggleRow
                    id="marketing"
                    title="Marketing Updates"
                    description="Receive product updates and tips"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              {/* Password Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-red-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                      <p className="text-sm text-slate-500">Update your password regularly</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <PillInput label="Current Password" type="password" placeholder="Enter current password" />
                  <PillInput label="New Password" type="password" placeholder="Enter new password" />
                  <PillInput label="Confirm New Password" type="password" placeholder="Confirm new password" />
                  <button className="h-11 px-6 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              {/* 2FA Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <ToggleRow
                    id="2fa"
                    title="Two-Factor Authentication"
                    description="Add an extra layer of security to your account"
                  />
                </div>
              </div>

              {/* Sessions Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-medium text-slate-900">Active Sessions</h3>
                  <p className="text-sm text-slate-500">Manage your active sessions across devices</p>
                </div>

                <div className="p-5 space-y-3">
                  <SessionCard
                    device="Chrome on Windows"
                    lastActive="Active now"
                    isCurrent
                  />
                  <SessionCard
                    device="Safari on iPhone"
                    lastActive="2 hours ago"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Appearance Settings</h2>
                      <p className="text-sm text-slate-500">Customize how the app looks</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Theme</Label>
                      <CustomSelect
                        options={[
                          { value: 'light', label: 'Light' },
                          { value: 'dark', label: 'Dark' },
                          { value: 'system', label: 'System' },
                        ]}
                        value={theme}
                        onChange={setTheme}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Language</Label>
                      <CustomSelect
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'hi', label: 'Hindi' },
                          { value: 'kn', label: 'Kannada' },
                        ]}
                        value={language}
                        onChange={setLanguage}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Date Format</Label>
                      <CustomSelect
                        options={[
                          { value: 'mdy', label: 'MM/DD/YYYY' },
                          { value: 'dmy', label: 'DD/MM/YYYY' },
                          { value: 'ymd', label: 'YYYY-MM-DD' },
                        ]}
                        value={dateFormat}
                        onChange={setDateFormat}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Time Format</Label>
                      <CustomSelect
                        options={[
                          { value: '12', label: '12-hour (AM/PM)' },
                          { value: '24', label: '24-hour' },
                        ]}
                        value={timeFormat}
                        onChange={setTimeFormat}
                      />
                    </div>
                  </div>

                  <ToggleRow
                    id="compactMode"
                    title="Compact Mode"
                    description="Reduce spacing for more content on screen"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}