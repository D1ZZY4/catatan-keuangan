import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { ALL_CURRENCIES, PINNED_CURRENCIES, type CurrencyInfo } from "@/shared/data/currencies";
import { cn } from "@/shared/utils/misc";

interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (code: string) => void;
}

function CurrencyRow({
  currency,
  selected,
  onClick,
}: {
  currency: CurrencyInfo;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 text-left active:bg-bg-card transition-colors",
        selected && "bg-accent-primary/5",
      )}
    >
      <span className="text-2xl w-8 flex-shrink-0 text-center">{currency.flag}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{currency.code}</p>
        <p className="text-xs text-text-muted truncate">{currency.name}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </button>
  );
}

export function CurrencySelector({ isOpen, onClose, value, onChange }: CurrencySelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return ALL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
  }, [search]);

  const displayList = filtered ?? ALL_CURRENCIES;
  const pinnedCodes = new Set(PINNED_CURRENCIES.map((c) => c.code));
  const pinned = displayList.filter((c) => pinnedCodes.has(c.code));
  const rest = displayList.filter((c) => !pinnedCodes.has(c.code));

  const handleSelect = (code: string) => {
    onChange(code);
    setSearch("");
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Pilih Mata Uang" fullHeight>
      <div className="sticky top-0 bg-bg-surface px-4 py-3 z-10 border-b border-bg-card">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mata uang…"
            className="w-full bg-bg-card rounded-xl pl-9 pr-9 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div>
        {!search.trim() && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-4 py-2 mt-1">
              Populer
            </p>
            {pinned.map((c) => (
              <CurrencyRow
                key={c.code}
                currency={c}
                selected={value === c.code}
                onClick={() => handleSelect(c.code)}
              />
            ))}
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-4 py-2">
              Semua mata uang
            </p>
          </div>
        )}
        {(search.trim() ? displayList : rest).map((c) => (
          <CurrencyRow
            key={c.code}
            currency={c}
            selected={value === c.code}
            onClick={() => handleSelect(c.code)}
          />
        ))}
        <div className="h-6" />
      </div>
    </BottomSheet>
  );
}
