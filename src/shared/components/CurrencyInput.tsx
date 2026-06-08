import React, { useEffect, useRef } from "react";
import { Delete } from "lucide-react";
import { evaluateAmount } from "@/shared/utils/math";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";

interface CurrencyInputProps {
  value: string;
  onChange: (raw: string, evaluated: number | null) => void;
  currency?: string;
  className?: string;
  autoFocus?: boolean;
}

const NUMPAD = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [".", "0", "⌫"],
] as const;

const OPERATORS = ["+", "-", "×", "÷"] as const;

export function CurrencyInput({
  value,
  onChange,
  currency = "IDR",
  className,
  autoFocus,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const evaluated = evaluateAmount(value);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleKey = (key: string) => {
    if (key === "⌫") {
      const next = value.slice(0, -1);
      onChange(next, evaluateAmount(next));
      return;
    }
    if (key === "×") {
      append("*");
      return;
    }
    if (key === "÷") {
      append("/");
      return;
    }
    append(key);
  };

  const append = (char: string) => {
    const next = value + char;
    onChange(next, evaluateAmount(next));
  };

  const hasOperator = /[+\-*/]/.test(value);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="px-5 py-4 min-h-[96px] flex flex-col items-end justify-end bg-bg-page border-b border-bg-card">
        <p className="text-xs text-text-muted/70 mb-1 min-h-[16px] font-display tabular-nums">
          {hasOperator && value.trim() ? value.replace(/\*/g, "×").replace(/\//g, "÷") : "\u00A0"}
        </p>
        <p className="text-[36px] font-bold font-display text-text-primary tracking-tight tabular-nums leading-none">
          {evaluated !== null && hasOperator
            ? formatCurrency(evaluated, currency)
            : value
              ? formatCurrency(
                  Number(value.replace(/,/g, "").replace(/\./g, "").replace(/[+\-*/]/g, "")) || 0,
                  currency,
                )
              : formatCurrency(0, currency)}
        </p>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v, evaluateAmount(v));
          }}
          className="sr-only"
          inputMode="none"
          aria-label="Jumlah"
        />
      </div>

      <div className="grid grid-cols-4 border-b border-bg-card">
        {OPERATORS.map((op) => (
          <button
            key={op}
            onClick={() => handleKey(op)}
            className="h-[52px] flex items-center justify-center text-accent-primary font-bold text-xl active:bg-accent-primary/10 transition-colors border-r border-bg-card last:border-r-0"
          >
            {op}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3">
        {NUMPAD.map((row, ri) =>
          row.map((key) => (
            <button
              key={`${ri}-${key}`}
              onClick={() => handleKey(key)}
              className={cn(
                "h-[60px] flex items-center justify-center text-xl font-medium border-t border-r border-bg-card last:border-r-0 active:bg-bg-card transition-colors select-none",
                key === "⌫" && "text-warning",
                key === "." && "text-text-muted text-2xl font-bold",
                key !== "⌫" && key !== "." && "text-text-primary",
              )}
              aria-label={key === "⌫" ? "Hapus" : key}
            >
              {key === "⌫" ? <Delete size={22} /> : key}
            </button>
          )),
        )}
      </div>
    </div>
  );
}
