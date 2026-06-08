import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
import { cn } from "@/shared/utils/misc";

const CURATED_ICONS = [
  "Wallet","CreditCard","Banknote","PiggyBank","DollarSign","CircleDollarSign","Coins","BadgeDollarSign","HandCoins",
  "TrendingUp","TrendingDown","BarChart2","PieChart","AreaChart","ArrowLeftRight","ArrowUp","ArrowDown","ArrowUpDown",
  "ShoppingBag","ShoppingCart","Store","Package","Gift","Tag","Receipt","Ticket","Barcode",
  "Car","Bus","Train","Plane","Bike","Fuel","Ship","Truck","CarFront",
  "Home","Building","Building2","Key","Landmark","Hotel","Warehouse","BedDouble",
  "Utensils","Coffee","Pizza","Apple","Beef","Fish","Salad","Soup","Wine","Beer","IceCream",
  "Heart","Pill","Stethoscope","Ambulance","Activity","Thermometer","Syringe","Cross",
  "BookOpen","GraduationCap","Pencil","School","Library","Microscope","Calculator","Notebook",
  "Gamepad2","Music","Film","Camera","Tv","Headphones","Mic","Radio","Trophy","Medal","Dices","Sword",
  "Shirt","Watch","Diamond","Gem","Crown","Glasses","Scissors","Palette","Brush",
  "Briefcase","Laptop","Code","Globe","Monitor","Printer","Keyboard","Cpu","Database",
  "Phone","Mail","Send","MessageCircle","Bell","Wifi","Bluetooth","Share2",
  "Sun","Moon","Cloud","Umbrella","Wind","Snowflake","Leaf","Flower","Tree","TreePine","Mountain","Waves","Flame","Droplets","Zap",
  "Baby","Users","User","UserCircle","PersonStanding","Baby","Dog","Cat","Bird","Fish",
  "Wrench","Settings","Tool","Hammer","Drill","Scissors","Recycle","Plug","Battery","Lightbulb",
  "MapPin","Map","Compass","Navigation","Globe2","Flag",
  "Star","Sparkles","Award","Trophy","Target","Rocket","Heart","ThumbsUp","Smile",
  "Lock","Shield","ShieldCheck","Key","Fingerprint","ScanLine","QrCode","Scan",
  "Clock","Calendar","Timer","Hourglass","AlarmClock","Watch",
  "Plus","Minus","Check","X","Circle","Square","Triangle","Hexagon","Bookmark","Layers",
  "ArrowRightLeft","Repeat","RefreshCw","Undo","Redo","Shuffle","Maximize","Minimize",
];

const DEDUPED_ICONS = Array.from(new Set(CURATED_ICONS));

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = "var(--accent-primary)" }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return DEDUPED_ICONS;
    const q = search.toLowerCase();
    return DEDUPED_ICONS.filter((n) => n.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari ikon…"
          className="w-full bg-bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
        />
      </div>
      <div className="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto">
        {filtered.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90",
              value === name
                ? "ring-2 ring-accent-primary bg-accent-primary/12"
                : "hover:bg-bg-card active:bg-bg-card",
            )}
            title={name}
            aria-label={name}
          >
            <DynamicIcon
              name={name}
              size={20}
              style={{ color: value === name ? color : "var(--text-muted)" }}
            />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-8 text-center text-xs text-text-muted py-4">Ikon tidak ditemukan</p>
        )}
      </div>
    </div>
  );
}
