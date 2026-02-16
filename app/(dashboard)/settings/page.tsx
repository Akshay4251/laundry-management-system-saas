// app/(dashboard)/settings/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Save, Building2, User, Bell, Lock, 
  Check, ChevronDown, Camera, Loader2,
  Eye, EyeOff, Receipt, Info, CreditCard
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  useProfile, 
  useUpdateProfile,
  useBusinessSettings, 
  useUpdateBusinessSettings,
  usePreferences,
  useUpdatePreferences,
  useUpdatePassword,
} from '@/app/hooks/use-settings';
import { toast } from 'sonner';

// Import the Billing Page component
import BillingPageContent from './billing/page';

// ============================================
// TAB OPTIONS - Added billing tab
// ============================================
const TAB_OPTIONS = [
  { value: 'business', label: 'Business', icon: Building2, dot: 'bg-blue-500' },
  { value: 'profile', label: 'Profile', icon: User, dot: 'bg-emerald-500' },
  { value: 'billing', label: 'Billing', icon: CreditCard, dot: 'bg-purple-500' },
  { value: 'notifications', label: 'Notifications', icon: Bell, dot: 'bg-amber-500' },
  { value: 'security', label: 'Security', icon: Lock, dot: 'bg-red-500' },
] as const;

type TabValue = typeof TAB_OPTIONS[number]['value'];

// ============================================
// NOTIFICATION OPTIONS (4 TYPES)
// ============================================
const NOTIFICATION_OPTIONS = [
  {
    id: 'notifyNewOrders',
    title: 'New Orders',
    description: 'Get notified when a new order is created',
    type: 'ORDER_CREATED',
  },
  {
    id: 'notifyOrderComplete',
    title: 'Order Completed',
    description: 'Get notified when an order is completed',
    type: 'ORDER_COMPLETED',
  },
  {
    id: 'notifyLowStock',
    title: 'Low Stock Alert',
    description: 'Get notified when inventory items are running low',
    type: 'LOW_STOCK',
  },
  {
    id: 'notifyMarketing',
    title: 'Marketing Updates',
    description: 'Receive product updates and tips',
    type: 'SYSTEM',
  },
] as const;

// ============================================
// GST PERCENTAGE OPTIONS
// ============================================
const GST_PERCENTAGE_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
  { value: '28', label: '28%' },
];

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
  disabled?: boolean;
}

function CustomSelect({ options, value, onChange, placeholder, disabled }: CustomSelectProps) {
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
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={cn(
          'w-full h-11 flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
          isOpen
            ? 'border-blue-400 ring-4 ring-blue-50'
            : 'border-slate-200 hover:border-slate-300',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-50'
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
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 max-h-60 overflow-auto"
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
// PILL INPUT COMPONENT
// ============================================
interface PillInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function PillInput({ label, error, className, ...props }: PillInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium text-slate-700">{label}</Label>}
      <div
        className={cn(
          'flex items-center h-11 rounded-full border bg-white transition-all duration-200',
          isFocused
            ? 'border-blue-400 ring-4 ring-blue-50 shadow-lg shadow-blue-100/50'
            : error
            ? 'border-red-300 ring-2 ring-red-50'
            : 'border-slate-200 hover:border-slate-300',
          props.disabled && 'opacity-50 bg-slate-50',
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
          className="flex-1 h-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 px-4 rounded-full disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ============================================
// PILL TEXTAREA COMPONENT
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
          props.disabled && 'opacity-50 bg-slate-50',
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
          className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 p-4 rounded-2xl resize-none min-h-[100px] disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

// ============================================
// TOGGLE ROW COMPONENT
// ============================================
interface ToggleRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ id, title, description, checked, onCheckedChange, disabled }: ToggleRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors',
      disabled && 'opacity-50'
    )}>
      <div className="space-y-0.5 flex-1 mr-4">
        <Label htmlFor={id} className="text-sm font-medium text-slate-900 cursor-pointer">{title}</Label>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Switch 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

// ============================================
// SECTION CARD COMPONENT
// ============================================
interface SectionCardProps {
  icon: React.ElementType;
  iconColor: string;
  bgGradient: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, iconColor, bgGradient, title, description, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={cn('p-5 border-b border-slate-100', bgGradient)}>
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-5">
        {children}
      </div>
    </div>
  );
}

// ============================================
// SKELETON LOADERS
// ============================================
function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOGO UPLOAD COMPONENT
// ============================================
interface LogoUploadProps {
  currentLogo?: string | null;
  businessName: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
}

function LogoUpload({ currentLogo, businessName, onUpload, onRemove, isUploading }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      onUpload(file);
    }
  };

  const initials = businessName
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'LP';

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        {currentLogo ? (
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200">
            <img 
              src={currentLogo} 
              alt="Business Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {currentLogo ? 'Change Logo' : 'Upload Logo'}
          </button>
          
          {currentLogo && (
            <button 
              type="button"
              onClick={onRemove}
              disabled={isUploading}
              className="px-4 py-2 rounded-full border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">JPG, PNG or GIF. Max 2MB. Recommended: 200x200px</p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabValue | null;
  
  // Initialize activeTab from URL or default to 'business'
  const [activeTab, setActiveTab] = useState<TabValue>(() => {
    if (tabFromUrl && ['business', 'profile', 'billing', 'notifications', 'security'].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return 'business';
  });
  
  const [isTabSelectOpen, setIsTabSelectOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Hooks
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: businessData, isLoading: businessLoading } = useBusinessSettings();
  const { data: preferences, isLoading: preferencesLoading } = usePreferences();
  
  const updateProfile = useUpdateProfile();
  const updateBusiness = useUpdateBusinessSettings();
  const updatePreferences = useUpdatePreferences();
  const updatePassword = useUpdatePassword();

  // Form States - Business
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    gstNumber: '',
    address: '',
    logoUrl: '' as string | null,
    gstEnabled: false,
    gstPercentage: '18',
  });

  // Form States - Profile
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
  });

  // Form States - Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Form States - Notifications
  const [notificationsForm, setNotificationsForm] = useState({
    notifyNewOrders: true,
    notifyOrderComplete: true,
    notifyLowStock: true,
    notifyMarketing: false,
  });

  // Initialize forms from data
  useEffect(() => {
    if (businessData?.business) {
      setBusinessForm({
        businessName: businessData.business.businessName || '',
        email: businessData.business.email || '',
        phone: businessData.business.phone || '',
        gstNumber: (businessData.business as any).gstNumber || '',
        address: businessData.business.address || '',
        logoUrl: businessData.business.logoUrl || null,
        gstEnabled: businessData.settings?.gstEnabled ?? false,
        gstPercentage: businessData.settings?.gstPercentage?.toString() || '18',
      });
    }
  }, [businessData]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setNotificationsForm({
        notifyNewOrders: preferences.notifyNewOrders ?? true,
        notifyOrderComplete: preferences.notifyOrderComplete ?? true,
        notifyLowStock: preferences.notifyLowStock ?? true,
        notifyMarketing: preferences.notifyMarketing ?? false,
      });
    }
  }, [preferences]);

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  // Get current tab info
  const currentTab = TAB_OPTIONS.find(tab => tab.value === activeTab);
  const CurrentIcon = currentTab?.icon || Building2;

  // Close tab select on outside click
  useEffect(() => {
    const handleClickOutside = () => setIsTabSelectOpen(false);
    if (isTabSelectOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isTabSelectOpen]);

  // Handle Logo Upload
  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/settings/business/logo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      const result = await response.json();
      setBusinessForm(prev => ({ ...prev, logoUrl: result.data.logoUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    try {
      await fetch('/api/settings/business/logo', {
        method: 'DELETE',
      });
      setBusinessForm(prev => ({ ...prev, logoUrl: null }));
      toast.success('Logo removed');
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  // Handle Save
  const handleSave = useCallback(async () => {
    try {
      switch (activeTab) {
        case 'business':
          await updateBusiness.mutateAsync({
            ...businessForm,
            gstPercentage: parseFloat(businessForm.gstPercentage),
          });
          break;
        case 'profile':
          await updateProfile.mutateAsync(profileForm);
          break;
        case 'notifications':
          await updatePreferences.mutateAsync(notificationsForm);
          break;
      }
    } catch (error) {
      // Error is handled by mutation
    }
  }, [activeTab, businessForm, profileForm, notificationsForm, updateBusiness, updateProfile, updatePreferences]);

  // Handle Password Update
  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      await updatePassword.mutateAsync(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const isSaving = updateBusiness.isPending || updateProfile.isPending || updatePreferences.isPending;
  const isLoading = profileLoading || businessLoading || preferencesLoading;

  // Check if save button should be shown (not for billing or security tabs)
  const showSaveButton = !['billing', 'security'].includes(activeTab);

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
            
            {showSaveButton && (
              <motion.button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'h-11 px-6 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2',
                  isSaving || isLoading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Tab Navigation */}
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
          {/* ========================================== */}
          {/* BUSINESS SETTINGS */}
          {/* ========================================== */}
          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              {businessLoading ? (
                <SettingsSkeleton />
              ) : (
                <>
                  {/* Business Information Card */}
                  <SectionCard
                    icon={Building2}
                    iconColor="bg-blue-100 text-blue-600"
                    bgGradient="bg-gradient-to-r from-blue-50 to-transparent"
                    title="Business Information"
                    description="Update your business details and branding"
                  >
                    <LogoUpload
                      currentLogo={businessForm.logoUrl}
                      businessName={businessForm.businessName}
                      onUpload={handleLogoUpload}
                      onRemove={handleLogoRemove}
                      isUploading={isUploadingLogo}
                    />

                    <div className="pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PillInput 
                          label="Business Name" 
                          value={businessForm.businessName}
                          onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Enter business name"
                        />
                        <PillInput 
                          label="Business Email" 
                          type="email" 
                          value={businessForm.email}
                          onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contact@example.com"
                        />
                        <PillInput 
                          label="Phone Number" 
                          value={businessForm.phone}
                          onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div className="mt-5">
                        <PillTextarea 
                          label="Business Address" 
                          value={businessForm.address}
                          onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter your complete business address"
                        />
                      </div>
                    </div>
                  </SectionCard>

                  {/* GST Settings Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-green-50 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">GST Settings</h2>
                          <p className="text-sm text-slate-500">Configure tax settings for your invoices</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                        <div className="space-y-0.5 flex-1 mr-4">
                          <Label htmlFor="gstEnabled" className="text-sm font-medium text-slate-900 cursor-pointer">
                            Enable GST
                          </Label>
                          <p className="text-xs text-slate-500">
                            Add GST to all orders and invoices
                          </p>
                        </div>
                        <Switch 
                          id="gstEnabled" 
                          checked={businessForm.gstEnabled} 
                          onCheckedChange={(checked) => setBusinessForm(prev => ({ ...prev, gstEnabled: checked }))}
                        />
                      </div>

                      <AnimatePresence>
                        {businessForm.gstEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 overflow-hidden"
                          >
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">GST will be applied to all orders</p>
                                <p className="text-xs text-blue-700 mt-1">
                                  The selected GST percentage will be automatically calculated and added to order totals.
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <PillInput 
                                label="GST Number (GSTIN)" 
                                value={businessForm.gstNumber}
                                onChange={(e) => setBusinessForm(prev => ({ 
                                  ...prev, 
                                  gstNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                                }))}
                                placeholder="22AAAAA0000A1Z5"
                                maxLength={15}
                              />
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">GST Percentage</Label>
                                <CustomSelect
                                  options={GST_PERCENTAGE_OPTIONS}
                                  value={businessForm.gstPercentage}
                                  onChange={(value) => setBusinessForm(prev => ({ ...prev, gstPercentage: value }))}
                                  placeholder="Select GST %"
                                />
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Preview</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Subtotal</span>
                                  <span className="text-slate-900">₹1,000.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">GST ({businessForm.gstPercentage}%)</span>
                                  <span className="text-slate-900">₹{((1000 * parseFloat(businessForm.gstPercentage)) / 100).toFixed(2)}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-semibold">
                                  <span className="text-slate-900">Total</span>
                                  <span className="text-slate-900">₹{(1000 + (1000 * parseFloat(businessForm.gstPercentage)) / 100).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* PROFILE SETTINGS */}
          {/* ========================================== */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              {profileLoading ? (
                <SettingsSkeleton />
              ) : (
                <SectionCard
                  icon={User}
                  iconColor="bg-emerald-100 text-emerald-600"
                  bgGradient="bg-gradient-to-r from-emerald-50 to-transparent"
                  title="Personal Information"
                  description="Update your personal details"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                        {profileForm.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
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
                    <PillInput 
                      label="Full Name" 
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your name"
                    />
                    <PillInput 
                      label="Email" 
                      type="email" 
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                </SectionCard>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* BILLING SETTINGS - NEW TAB */}
          {/* ========================================== */}
          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl -mx-4 lg:-mx-6 -my-6"
            >
              <BillingPageContent />
            </motion.div>
          )}

          {/* ========================================== */}
          {/* NOTIFICATIONS SETTINGS */}
          {/* ========================================== */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              {preferencesLoading ? (
                <SettingsSkeleton />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                        <p className="text-sm text-slate-500">Choose which notifications you want to receive</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {NOTIFICATION_OPTIONS.map((option) => (
                      <ToggleRow
                        key={option.id}
                        id={option.id}
                        title={option.title}
                        description={option.description}
                        checked={notificationsForm[option.id as keyof typeof notificationsForm]}
                        onCheckedChange={(checked) => {
                          setNotificationsForm(prev => ({ ...prev, [option.id]: checked }));
                        }}
                      />
                    ))}
                  </div>

                  <div className="p-5 bg-blue-50 border-t border-blue-100">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium">How notifications work</p>
                        <p className="text-blue-700 text-xs mt-1">
                          Notifications will appear in your notification center. You&apos;ll only receive notifications for events you&apos;ve enabled above.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* SECURITY SETTINGS */}
          {/* ========================================== */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl space-y-6"
            >
              <SectionCard
                icon={Lock}
                iconColor="bg-red-100 text-red-600"
                bgGradient="bg-gradient-to-r from-red-50 to-transparent"
                title="Change Password"
                description="Update your password to keep your account secure"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <PillInput 
                      label="Current Password" 
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <PillInput 
                      label="New Password" 
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <PillInput 
                    label="Confirm New Password" 
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password" 
                  />

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-700 mb-2">Password must contain:</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li className={cn(
                        'flex items-center gap-2',
                        passwordForm.newPassword.length >= 8 && 'text-emerald-600'
                      )}>
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          passwordForm.newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'
                        )} />
                        At least 8 characters
                      </li>
                      <li className={cn(
                        'flex items-center gap-2',
                        /[A-Z]/.test(passwordForm.newPassword) && 'text-emerald-600'
                      )}>
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          /[A-Z]/.test(passwordForm.newPassword) ? 'bg-emerald-500' : 'bg-slate-300'
                        )} />
                        One uppercase letter
                      </li>
                      <li className={cn(
                        'flex items-center gap-2',
                        /[a-z]/.test(passwordForm.newPassword) && 'text-emerald-600'
                      )}>
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          /[a-z]/.test(passwordForm.newPassword) ? 'bg-emerald-500' : 'bg-slate-300'
                        )} />
                        One lowercase letter
                      </li>
                      <li className={cn(
                        'flex items-center gap-2',
                        /[0-9]/.test(passwordForm.newPassword) && 'text-emerald-600'
                      )}>
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          /[0-9]/.test(passwordForm.newPassword) ? 'bg-emerald-500' : 'bg-slate-300'
                        )} />
                        One number
                      </li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={handlePasswordUpdate}
                    disabled={updatePassword.isPending || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className={cn(
                      'h-11 px-6 rounded-full font-medium text-sm transition-colors flex items-center gap-2',
                      updatePassword.isPending || !passwordForm.currentPassword
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    )}
                  >
                    {updatePassword.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}