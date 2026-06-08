import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DynamicIcon, getIconNames } from "./DynamicIcon";
import { cn } from "@/shared/utils/misc";

const ALL_ICONS = getIconNames();

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = "var(--accent-primary)" }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_ICONS.slice(0, 80);
    const q = search.toLowerCase();
    return ALL_ICONS.filter((n) => n.toLowerCase().includes(q)).slice(0, 80);
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
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {filtered.map((name) => (
          <button
            key={name}
            onClick={() => onChange(name)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90",
              value === name
                ? "ring-2 ring-accent-primary bg-accent-primary/10"
                : "hover:bg-bg-card",
            )}
            title={name}
            aria-label={name}
          >
            <DynamicIcon name={name} size={20} style={{ color: value === name ? color : "var(--text-muted)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
