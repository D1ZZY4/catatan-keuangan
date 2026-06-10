import React from 'react';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Heart,
  Music,
  BookOpen,
  Home,
  Shirt,
  Sparkles,
  Gift,
  MoreHorizontal,
  DollarSign,
  Briefcase,
  Star,
  RotateCcw,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Check,
  Search,
  Bell,
  Eye,
  EyeOff,
  Download,
  Upload,
  Share2,
  Trash2,
  Edit,
  Copy,
  Filter,
  SortAsc,
  Calendar,
  Camera,
  Calculator,
  Info,
  AlertCircle,
  Lock,
  Unlock,
  Fingerprint,
  QrCode,
  BarChart2,
  PieChart,
  Activity,
  Repeat,
  Clock,
  Tag,
  Landmark,
  Bitcoin,
  Coins,
  type LucideProps,
} from 'lucide-react-native';
import type { ViewStyle } from 'react-native';

const LUCIDE_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  wallet: Wallet,
  'arrow-up-circle': ArrowUpCircle,
  'arrow-down-circle': ArrowDownCircle,
  'arrow-left-right': ArrowLeftRight,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'piggy-bank': PiggyBank,
  'credit-card': CreditCard,
  'shopping-bag': ShoppingBag,
  utensils: Utensils,
  car: Car,
  zap: Zap,
  heart: Heart,
  music: Music,
  'book-open': BookOpen,
  home: Home,
  shirt: Shirt,
  sparkles: Sparkles,
  gift: Gift,
  'more-horizontal': MoreHorizontal,
  'dollar-sign': DollarSign,
  briefcase: Briefcase,
  star: Star,
  'rotate-ccw': RotateCcw,
  users: Users,
  settings: Settings,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  plus: Plus,
  minus: Minus,
  x: X,
  check: Check,
  search: Search,
  bell: Bell,
  eye: Eye,
  'eye-off': EyeOff,
  download: Download,
  upload: Upload,
  share: Share2,
  trash: Trash2,
  edit: Edit,
  copy: Copy,
  filter: Filter,
  sort: SortAsc,
  calendar: Calendar,
  camera: Camera,
  calculator: Calculator,
  info: Info,
  alert: AlertCircle,
  lock: Lock,
  unlock: Unlock,
  fingerprint: Fingerprint,
  qr: QrCode,
  'bar-chart': BarChart2,
  'pie-chart': PieChart,
  activity: Activity,
  repeat: Repeat,
  clock: Clock,
  tag: Tag,
  bank: Landmark,
  bitcoin: Bitcoin,
  coins: Coins,
};

export type AppIconName = keyof typeof LUCIDE_ICONS;

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

export function AppIcon({
  name,
  size = 24,
  color = '#1A1814',
  strokeWidth = 1.5,
}: AppIconProps): React.ReactElement {
  const IconComponent = LUCIDE_ICONS[name];

  if (IconComponent === undefined) {
    const Fallback = LUCIDE_ICONS['more-horizontal']!;
    return <Fallback size={size} color={color} strokeWidth={strokeWidth} />;
  }

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}

export function getIconNames(): string[] {
  return Object.keys(LUCIDE_ICONS);
}
