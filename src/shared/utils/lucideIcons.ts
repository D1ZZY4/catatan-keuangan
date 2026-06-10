import type { LucideIcon } from 'lucide-react-native';
import {
  Wallet, CreditCard, Banknote, PiggyBank, DollarSign, CircleDollarSign, Coins, BadgeDollarSign, HandCoins,
  TrendingUp, TrendingDown, BarChart2, PieChart, ArrowLeftRight, ArrowUp, ArrowDown, ArrowUpDown,
  ShoppingBag, ShoppingCart, Store, Package, Gift, Tag, Receipt, Ticket, Barcode,
  Car, Bus, Train, Plane, Bike, Fuel, Ship, Truck, CarFront,
  Home, Building, Building2, Key, Landmark, Hotel, Warehouse, BedDouble,
  Utensils, Coffee, Pizza, Beef, Fish, Salad, Soup, Wine, Beer, IceCream,
  Heart, Pill, Stethoscope, Ambulance, Activity, Thermometer, Syringe,
  BookOpen, GraduationCap, Pencil, School, Library, Microscope, Calculator, Notebook,
  Gamepad2, Music, Film, Camera, Tv, Headphones, Mic, Radio, Trophy, Medal, Dices, Sword,
  Shirt, Watch, Diamond, Gem, Crown, Glasses, Scissors, Palette, Brush,
  Briefcase, Laptop, Code, Globe, Monitor, Printer, Keyboard, Cpu, Database,
  Phone, Mail, Send, MessageCircle, Bell, Wifi, Bluetooth, Share2,
  Sun, Moon, Cloud, Umbrella, Wind, Snowflake, Leaf, Flower2, TreePine, Mountain, Waves, Flame, Droplets, Zap,
  Baby, Users, User, PersonStanding, Dog, Cat, Bird,
  Wrench, Settings, Hammer, Drill, Recycle, Plug, Battery, Lightbulb,
  MapPin, Map, Compass, Navigation, Globe2, Flag,
  Star, Sparkles, Award, Target, Rocket, ThumbsUp, Smile,
  Lock, Shield, ShieldCheck, Fingerprint, QrCode, Scan,
  Clock, Calendar, Timer, Hourglass, AlarmClock,
  Check, Circle, Square, Triangle, Hexagon, Bookmark, Layers,
  ArrowRightLeft, Repeat, RefreshCw, Undo, Redo, Shuffle,
  HelpCircle,
  Apple, Flower,
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  Wallet, CreditCard, Banknote, PiggyBank, DollarSign, CircleDollarSign, Coins, BadgeDollarSign, HandCoins,
  TrendingUp, TrendingDown, BarChart2, PieChart, ArrowLeftRight, ArrowUp, ArrowDown, ArrowUpDown,
  ShoppingBag, ShoppingCart, Store, Package, Gift, Tag, Receipt, Ticket, Barcode,
  Car, Bus, Train, Plane, Bike, Fuel, Ship, Truck, CarFront,
  Home, Building, Building2, Key, Landmark, Hotel, Warehouse, BedDouble,
  Utensils, Coffee, Pizza, Beef, Fish, Salad, Soup, Wine, Beer, IceCream,
  Heart, Pill, Stethoscope, Ambulance, Activity, Thermometer, Syringe,
  BookOpen, GraduationCap, Pencil, School, Library, Microscope, Calculator, Notebook,
  Gamepad2, Music, Film, Camera, Tv, Headphones, Mic, Radio, Trophy, Medal, Dices, Sword,
  Shirt, Watch, Diamond, Gem, Crown, Glasses, Scissors, Palette, Brush,
  Briefcase, Laptop, Code, Globe, Monitor, Printer, Keyboard, Cpu, Database,
  Phone, Mail, Send, MessageCircle, Bell, Wifi, Bluetooth, Share2,
  Sun, Moon, Cloud, Umbrella, Wind, Snowflake, Leaf, Flower2, TreePine, Mountain, Waves, Flame, Droplets, Zap,
  Baby, Users, User, PersonStanding, Dog, Cat, Bird,
  Wrench, Settings, Hammer, Drill, Recycle, Plug, Battery, Lightbulb,
  MapPin, Map, Compass, Navigation, Globe2, Flag,
  Star, Sparkles, Award, Target, Rocket, ThumbsUp, Smile,
  Lock, Shield, ShieldCheck, Fingerprint, QrCode, Scan,
  Clock, Calendar, Timer, Hourglass, AlarmClock,
  Check, Circle, Square, Triangle, Hexagon, Bookmark, Layers,
  ArrowRightLeft, Repeat, RefreshCw, Undo, Redo, Shuffle,
  Apple, Flower,
};

export const ALL_LUCIDE_ICON_NAMES = Object.keys(ICON_MAP);

export function getLucideIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? HelpCircle;
}
