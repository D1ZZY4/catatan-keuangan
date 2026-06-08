import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DynamicIcon } from "./DynamicIcon";
import { BRAND_ICONS, BRAND_CATEGORIES } from "./BrandIcons";
import { cn } from "@/shared/utils/misc";

const CURATED_ISAX_ICONS = [
  "Wallet","Wallet1","Wallet2","Wallet3",
  "EmptyWallet","EmptyWalletAdd","EmptyWalletChange","EmptyWalletTick",
  "Card","CardAdd","CardCoin","CardEdit","CardPos","CardReceive","CardSend","CardTick",
  "Coin","Coin1","DollarCircle","DollarSquare",
  "Bank","MoneyRecive","MoneySend","MoneyAdd","MoneyRemove","Moneys",
  "ReceiptItem","ReceiptSquare","Bill",
  "Chart","Chart1","Chart2","Graph","TrendUp","TrendDown",
  "Bitcoin","BitcoinCard",
  "Bag","Bag2","BagHappy","BagTick","ShoppingCart",
  "Tag","Gift",
  "Airplane","AirplaneSquare","Bus","Car","TruckFast",
  "Building","Buildings","Buildings2",
  "Book","Book1","BookSaved","BookSquare",
  "Hospital","Heart",
  "Laptop","Monitor","Mobile","Keyboard",
  "MusicPlay","Video","Game","Gameboy",
  "Man","Woman",
  "Star1","Award","Crown","Diamond",
  "ArrowSwapHorizontal","DirectSend",
  "Setting2","Refresh2","Edit","Edit2",
  "HomeTrendUp","HomeTrendDown",
];

const LUCIDE_ICONS = [
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
  "Baby","Users","User","UserCircle","PersonStanding","Dog","Cat","Bird",
  "Wrench","Settings","Hammer","Drill","Recycle","Plug","Battery","Lightbulb",
  "MapPin","Map","Compass","Navigation","Globe2","Flag",
  "Star","Sparkles","Award","Target","Rocket","ThumbsUp","Smile",
  "Lock","Shield","ShieldCheck","Fingerprint","ScanLine","QrCode","Scan",
  "Clock","Calendar","Timer","Hourglass","AlarmClock",
  "Plus","Minus","Check","Circle","Square","Triangle","Hexagon","Bookmark","Layers",
  "ArrowRightLeft","Repeat","RefreshCw","Undo","Redo","Shuffle",
];

const DEDUPED_LUCIDE = Array.from(new Set(LUCIDE_ICONS));

type Tab = "lucide" | "iconsax" | "merek";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = "var(--accent-primary)" }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>(() => {
    if (value.startsWith("fab:")) return "merek";
    if (value.startsWith("isax:")) return "iconsax";
    return "lucide";
  });
  const [brandCategory, setBrandCategory] = useState<string>("Semua");

  const filteredLucide = useMemo(() => {
    if (!search.trim()) return DEDUPED_LUCIDE;
    const q = search.toLowerCase();
    return DEDUPED_LUCIDE.filter((n) => n.toLowerCase().includes(q));
  }, [search]);

  const filteredIsax = useMemo(() => {
    if (!search.trim()) return CURATED_ISAX_ICONS;
    const q = search.toLowerCase();
    return CURATED_ISAX_ICONS.filter((n) => n.toLowerCase().includes(q));
  }, [search]);

  const filteredBrands = useMemo(() => {
    const byCategory =
      brandCategory === "Semua"
        ? BRAND_ICONS
        : BRAND_ICONS.filter((b) => b.category === brandCategory);
    if (!search.trim()) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter((b) => b.label.toLowerCase().includes(q) || b.key.includes(q));
  }, [search, brandCategory]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "lucide", label: "Lucide" },
    { id: "iconsax", label: "Iconsax" },
    { id: "merek", label: "Merek" },
  ];

  return (
    <div className="space-y-3">
      {/* Tab selector */}
      <div className="flex gap-1 bg-bg-surface rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
              tab === t.id
                ? "bg-bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
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

      {/* Brand category filter chips */}
      {tab === "merek" && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {["Semua", ...BRAND_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setBrandCategory(cat)}
              className={cn(
                "flex-shrink-0 px-2.5 py-1 text-[10px] font-semibold rounded-full transition-all",
                brandCategory === cat
                  ? "bg-accent-primary text-white"
                  : "bg-bg-surface text-text-muted",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Lucide grid */}
      {tab === "lucide" && (
        <div className="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto no-scrollbar">
          {filteredLucide.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90",
                value === name
                  ? "ring-2 ring-accent-primary bg-accent-primary/12"
                  : "hover:bg-bg-surface",
              )}
              title={name}
              aria-label={name}
            >
              <DynamicIcon
                name={name}
                size={19}
                style={{ color: value === name ? color : "var(--text-muted)" }}
              />
            </button>
          ))}
          {filteredLucide.length === 0 && (
            <p className="col-span-8 text-center text-xs text-text-muted py-4">Ikon tidak ditemukan</p>
          )}
        </div>
      )}

      {/* Iconsax grid */}
      {tab === "iconsax" && (
        <div className="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto no-scrollbar">
          {filteredIsax.map((name) => {
            const fullName = `isax:${name}`;
            const selected = value === fullName;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(fullName)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90",
                  selected
                    ? "ring-2 ring-accent-primary bg-accent-primary/12"
                    : "hover:bg-bg-surface",
                )}
                title={name}
                aria-label={name}
              >
                <DynamicIcon
                  name={fullName}
                  size={19}
                  style={{ color: selected ? color : "var(--text-muted)" }}
                />
              </button>
            );
          })}
          {filteredIsax.length === 0 && (
            <p className="col-span-8 text-center text-xs text-text-muted py-4">Ikon tidak ditemukan</p>
          )}
        </div>
      )}

      {/* Brand icons grid */}
      {tab === "merek" && (
        <div className="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto no-scrollbar">
          {filteredBrands.map((entry) => {
            const fullName = `fab:${entry.key}`;
            const selected = value === fullName;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => onChange(fullName)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90",
                  selected
                    ? "ring-2 ring-accent-primary bg-accent-primary/12"
                    : "hover:bg-bg-surface",
                )}
                title={entry.label}
                aria-label={entry.label}
              >
                <FontAwesomeIcon
                  icon={entry.icon}
                  style={{
                    width: 19,
                    height: 19,
                    color: selected ? color : "var(--text-muted)",
                  }}
                />
              </button>
            );
          })}
          {filteredBrands.length === 0 && (
            <p className="col-span-8 text-center text-xs text-text-muted py-4">Ikon tidak ditemukan</p>
          )}
        </div>
      )}

      <p className="text-[10px] text-text-muted text-center">
        {tab === "lucide" && "Lucide — ikon antarmuka umum"}
        {tab === "iconsax" && "Iconsax — 993 ikon premium tersedia"}
        {tab === "merek" && `Merek — ${BRAND_ICONS.length} platform populer`}
      </p>
    </div>
  );
}
