import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/misc";

const PRESET_COLORS = [
  "#E65100",
  "#1976D2",
  "#FBC02D",
  "#8E24AA",
  "#D81B60",
  "#00897B",
  "#F4511E",
  "#5D4037",
  "#3949AB",
  "#2E7D32",
  "#8CC0EB",
  "#6B6555",
] as const;

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [customHex, setCustomHex] = useState(
    PRESET_COLORS.includes(value as (typeof PRESET_COLORS)[number]) ? "" : value,
  );

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCustomHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => {
              onChange(color);
              setCustomHex("");
            }}
            className={cn(
              "w-10 h-10 rounded-xl transition-all active:scale-90 flex items-center justify-center",
              value === color && "ring-2 ring-offset-1 ring-accent-primary",
            )}
            style={{ backgroundColor: color }}
            aria-label={color}
          >
            {value === color && <Check size={16} className="text-white drop-shadow" />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 border border-bg-card"
          style={{ backgroundColor: customHex || value }}
        />
        <input
          type="text"
          value={customHex}
          onChange={handleCustomChange}
          placeholder="#RRGGBB"
          maxLength={7}
          className="flex-1 bg-bg-card rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40 uppercase"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setCustomHex(e.target.value);
          }}
          className="w-9 h-9 rounded-xl overflow-hidden cursor-pointer bg-transparent border-0 p-0"
          aria-label="Pilih warna"
        />
      </div>
    </div>
  );
}
