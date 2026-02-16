// lib/service-icons.ts
import {
  Shirt,
  ShirtIcon,
  Footprints,
  Glasses,
  Watch,
  Crown,
  Gem,
  Heart,
  Star,
  Sparkles,
  Zap,
  Wind,
  Droplets,
  Waves,
  Snowflake,
  Sun,
  Moon,
  CloudRain,
  Umbrella,
  Briefcase,
  GraduationCap,
  Building2,
  Home,
  BedDouble,
  Sofa,
  Armchair,
  Lamp,
  Frame,
  PaintBucket,
  Palette,
  Scissors,
  Paintbrush,
  Wand2,
  Shield,
  Award,
  Medal,
  Trophy,
  Target,
  Flag,
  Gift,
  ShoppingBag,
  Package,
  PackageCheck,
  Truck,
  Users,
  User,
  Baby,
  type LucideIcon,
} from 'lucide-react';

export interface IconOption {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'GARMENT' | 'HOUSEHOLD' | 'SPECIALTY';
  keywords: string[];
  defaultColor: string;
}

export const PROFESSIONAL_ICONS: IconOption[] = [
  // ============= GARMENT ICONS =============
  {
    id: 'shirt-1',
    name: 'Shirt',
    icon: Shirt,
    category: 'GARMENT',
    keywords: ['shirt', 'top', 'casual', 'tee', 't-shirt'],
    defaultColor: '#3B82F6',
  },
  {
    id: 'shirt-2',
    name: 'Dress Shirt',
    icon: ShirtIcon,
    category: 'GARMENT',
    keywords: ['dress', 'shirt', 'formal', 'business'],
    defaultColor: '#6366F1',
  },
  {
    id: 'footwear',
    name: 'Footwear',
    icon: Footprints,
    category: 'GARMENT',
    keywords: ['shoes', 'sneakers', 'boots', 'footwear'],
    defaultColor: '#8B5CF6',
  },
  {
    id: 'glasses',
    name: 'Accessories',
    icon: Glasses,
    category: 'GARMENT',
    keywords: ['glasses', 'sunglasses', 'accessories'],
    defaultColor: '#EC4899',
  },
  {
    id: 'watch',
    name: 'Watch',
    icon: Watch,
    category: 'GARMENT',
    keywords: ['watch', 'timepiece', 'accessories'],
    defaultColor: '#F59E0B',
  },
  {
    id: 'briefcase',
    name: 'Business Wear',
    icon: Briefcase,
    category: 'GARMENT',
    keywords: ['suit', 'business', 'formal', 'office', 'corporate'],
    defaultColor: '#1F2937',
  },
  {
    id: 'graduation',
    name: 'Uniform',
    icon: GraduationCap,
    category: 'GARMENT',
    keywords: ['uniform', 'school', 'graduation', 'formal'],
    defaultColor: '#10B981',
  },
  {
    id: 'baby',
    name: 'Kids Wear',
    icon: Baby,
    category: 'GARMENT',
    keywords: ['baby', 'kids', 'children', 'infant'],
    defaultColor: '#FF6B9D',
  },
  {
    id: 'user',
    name: 'Casual Wear',
    icon: User,
    category: 'GARMENT',
    keywords: ['casual', 'everyday', 'regular'],
    defaultColor: '#6B7280',
  },
  {
    id: 'users',
    name: 'Family Pack',
    icon: Users,
    category: 'GARMENT',
    keywords: ['family', 'group', 'multiple', 'bulk'],
    defaultColor: '#14B8A6',
  },

  // ============= HOUSEHOLD ICONS =============
  {
    id: 'home',
    name: 'Home Textiles',
    icon: Home,
    category: 'HOUSEHOLD',
    keywords: ['home', 'house', 'household'],
    defaultColor: '#F97316',
  },
  {
    id: 'bed',
    name: 'Bedding',
    icon: BedDouble,
    category: 'HOUSEHOLD',
    keywords: ['bed', 'bedsheet', 'linen', 'blanket', 'comforter'],
    defaultColor: '#7C3AED',
  },
  {
    id: 'sofa',
    name: 'Sofa Covers',
    icon: Sofa,
    category: 'HOUSEHOLD',
    keywords: ['sofa', 'couch', 'furniture', 'covers'],
    defaultColor: '#DC2626',
  },
  {
    id: 'armchair',
    name: 'Chair Covers',
    icon: Armchair,
    category: 'HOUSEHOLD',
    keywords: ['chair', 'armchair', 'seat', 'covers'],
    defaultColor: '#0891B2',
  },
  {
    id: 'lamp',
    name: 'Lampshades',
    icon: Lamp,
    category: 'HOUSEHOLD',
    keywords: ['lamp', 'shade', 'lighting', 'decor'],
    defaultColor: '#FBBF24',
  },
  {
    id: 'frame',
    name: 'Curtains',
    icon: Frame,
    category: 'HOUSEHOLD',
    keywords: ['curtain', 'drapes', 'window', 'frame'],
    defaultColor: '#059669',
  },
  {
    id: 'paint-bucket',
    name: 'Table Cloth',
    icon: PaintBucket,
    category: 'HOUSEHOLD',
    keywords: ['tablecloth', 'table', 'dining', 'cover'],
    defaultColor: '#8B5CF6',
  },
  {
    id: 'umbrella',
    name: 'Outdoor Covers',
    icon: Umbrella,
    category: 'HOUSEHOLD',
    keywords: ['outdoor', 'umbrella', 'patio', 'garden'],
    defaultColor: '#EC4899',
  },

  // ============= SPECIALTY ICONS =============
  {
    id: 'crown',
    name: 'Royal Service',
    icon: Crown,
    category: 'SPECIALTY',
    keywords: ['royal', 'luxury', 'premium', 'vip', 'crown'],
    defaultColor: '#FFD700',
  },
  {
    id: 'gem',
    name: 'Luxury Items',
    icon: Gem,
    category: 'SPECIALTY',
    keywords: ['luxury', 'premium', 'expensive', 'gem', 'diamond'],
    defaultColor: '#A855F7',
  },
  {
    id: 'heart',
    name: 'Wedding Dress',
    icon: Heart,
    category: 'SPECIALTY',
    keywords: ['wedding', 'bride', 'bridal', 'gown', 'dress'],
    defaultColor: '#FF1493',
  },
  {
    id: 'star',
    name: 'VIP Service',
    icon: Star,
    category: 'SPECIALTY',
    keywords: ['vip', 'star', 'premium', 'special'],
    defaultColor: '#FBBF24',
  },
  {
    id: 'sparkles',
    name: 'Premium Care',
    icon: Sparkles,
    category: 'SPECIALTY',
    keywords: ['premium', 'special', 'care', 'delicate', 'sparkle'],
    defaultColor: '#06B6D4',
  },
  {
    id: 'zap',
    name: 'Express Service',
    icon: Zap,
    category: 'SPECIALTY',
    keywords: ['express', 'fast', 'quick', 'urgent', 'speed'],
    defaultColor: '#EAB308',
  },
  {
    id: 'wind',
    name: 'Dry Clean',
    icon: Wind,
    category: 'SPECIALTY',
    keywords: ['dry', 'clean', 'air', 'wind', 'fresh'],
    defaultColor: '#3B82F6',
  },
  {
    id: 'droplets',
    name: 'Wet Wash',
    icon: Droplets,
    category: 'SPECIALTY',
    keywords: ['wet', 'wash', 'water', 'clean', 'laundry'],
    defaultColor: '#0EA5E9',
  },
  {
    id: 'waves',
    name: 'Deep Clean',
    icon: Waves,
    category: 'SPECIALTY',
    keywords: ['deep', 'clean', 'wash', 'intensive'],
    defaultColor: '#06B6D4',
  },
  {
    id: 'snowflake',
    name: 'Delicate',
    icon: Snowflake,
    category: 'SPECIALTY',
    keywords: ['delicate', 'gentle', 'soft', 'silk', 'care'],
    defaultColor: '#7DD3FC',
  },
  {
    id: 'shield',
    name: 'Stain Protection',
    icon: Shield,
    category: 'SPECIALTY',
    keywords: ['protection', 'shield', 'stain', 'guard'],
    defaultColor: '#10B981',
  },
  {
    id: 'award',
    name: 'Premium Quality',
    icon: Award,
    category: 'SPECIALTY',
    keywords: ['quality', 'award', 'best', 'premium'],
    defaultColor: '#F59E0B',
  },
  {
    id: 'medal',
    name: 'Gold Service',
    icon: Medal,
    category: 'SPECIALTY',
    keywords: ['gold', 'medal', 'premium', 'best'],
    defaultColor: '#FBBF24',
  },
  {
    id: 'trophy',
    name: 'Championship',
    icon: Trophy,
    category: 'SPECIALTY',
    keywords: ['trophy', 'sports', 'uniform', 'team'],
    defaultColor: '#F97316',
  },
  {
    id: 'gift',
    name: 'Special Occasion',
    icon: Gift,
    category: 'SPECIALTY',
    keywords: ['gift', 'special', 'occasion', 'party', 'event'],
    defaultColor: '#EC4899',
  },
  {
    id: 'bag',
    name: 'Bags & Luggage',
    icon: ShoppingBag,
    category: 'SPECIALTY',
    keywords: ['bag', 'luggage', 'suitcase', 'travel'],
    defaultColor: '#8B5CF6',
  },
  {
    id: 'package',
    name: 'Bulk Service',
    icon: Package,
    category: 'SPECIALTY',
    keywords: ['bulk', 'package', 'large', 'multiple'],
    defaultColor: '#6366F1',
  },
  {
    id: 'package-check',
    name: 'Quality Check',
    icon: PackageCheck,
    category: 'SPECIALTY',
    keywords: ['quality', 'check', 'verified', 'inspected'],
    defaultColor: '#10B981',
  },
  {
    id: 'wand',
    name: 'Magic Clean',
    icon: Wand2,
    category: 'SPECIALTY',
    keywords: ['magic', 'special', 'unique', 'exclusive'],
    defaultColor: '#A855F7',
  },
  {
    id: 'scissors',
    name: 'Alterations',
    icon: Scissors,
    category: 'SPECIALTY',
    keywords: ['alterations', 'tailoring', 'repair', 'fix'],
    defaultColor: '#64748B',
  },
  {
    id: 'paintbrush',
    name: 'Stain Removal',
    icon: Paintbrush,
    category: 'SPECIALTY',
    keywords: ['stain', 'removal', 'clean', 'spot'],
    defaultColor: '#EF4444',
  },
];

// Helper functions
export function getIconById(id: string): IconOption | undefined {
  return PROFESSIONAL_ICONS.find((icon) => icon.id === id);
}

export function getIconsByCategory(
  category: 'GARMENT' | 'HOUSEHOLD' | 'SPECIALTY'
): IconOption[] {
  return PROFESSIONAL_ICONS.filter((icon) => icon.category === category);
}

export function searchIcons(query: string): IconOption[] {
  const lowerQuery = query.toLowerCase();
  return PROFESSIONAL_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.keywords.some((keyword) => keyword.includes(lowerQuery))
  );
}

export function getDefaultIconForService(
  name: string,
  category: string
): IconOption {
  const lowerName = name.toLowerCase();

  // Try to find matching icon by keywords
  const matchingIcon = PROFESSIONAL_ICONS.find((icon) =>
    icon.keywords.some((keyword) => lowerName.includes(keyword))
  );

  if (matchingIcon) {
    return matchingIcon;
  }

  // Fallback to category defaults
  if (category === 'HOUSEHOLD') {
    return getIconById('home') || PROFESSIONAL_ICONS[0];
  }
  if (category === 'SPECIALTY') {
    return getIconById('sparkles') || PROFESSIONAL_ICONS[0];
  }
  return getIconById('shirt-1') || PROFESSIONAL_ICONS[0];
}

// Color palette for icons
export const ICON_COLORS = [
  { name: 'Blue', value: '#3B82F6', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Purple', value: '#8B5CF6', gradient: 'from-purple-400 to-purple-600' },
  { name: 'Pink', value: '#EC4899', gradient: 'from-pink-400 to-pink-600' },
  { name: 'Red', value: '#EF4444', gradient: 'from-red-400 to-red-600' },
  { name: 'Orange', value: '#F97316', gradient: 'from-orange-400 to-orange-600' },
  { name: 'Yellow', value: '#FBBF24', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Green', value: '#10B981', gradient: 'from-green-400 to-green-600' },
  { name: 'Teal', value: '#14B8A6', gradient: 'from-teal-400 to-teal-600' },
  { name: 'Cyan', value: '#06B6D4', gradient: 'from-cyan-400 to-cyan-600' },
  { name: 'Indigo', value: '#6366F1', gradient: 'from-indigo-400 to-indigo-600' },
  { name: 'Violet', value: '#7C3AED', gradient: 'from-violet-400 to-violet-600' },
  { name: 'Gray', value: '#6B7280', gradient: 'from-gray-400 to-gray-600' },
  { name: 'Gold', value: '#FFD700', gradient: 'from-yellow-300 to-yellow-500' },
  { name: 'Rose', value: '#FF1493', gradient: 'from-rose-400 to-rose-600' },
];