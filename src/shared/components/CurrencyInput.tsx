import React, { useEffect, useRef, useState } from "react";
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
      <div className="px-4 py-3 min-h-[80px] flex flex-col items-end justify-end border-b border-bg-card">
        <div className="text-xs text-text-muted mb-1 h-4">
          {hasOperator && value.trim() ? value.replace(/\*/g, "×").replace(/\//g, "÷") : ""}
        </div>
        <p className="text-3xl font-semibold text-text-primary tracking-tight">
          {evaluated !== null && hasOperator
            ? formatCurrency(evaluated, currency)
            : value
              ? formatCurrency(Number(value.replace(/,/g, "").replace(/\./g, "").replace(/[+\-*/]/g, "")) || 0, currency)
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

      <div className="grid grid-cols-5 gap-0">
        <div className="col-span-4 grid grid-cols-4 divide-x divide-bg-card">
          {OPERATORS.map((op) => (
            <button
              key={op}
              onClick={() => handleKey(op)}
              className="h-12 flex items-center justify-center text-accent-primary font-semibold text-lg active:bg-bg-card transition-colors"
            >
              {op}
            </button>
          ))}
        </div>
        <div />
      </div>

      <div className="grid grid-cols-3">
        {NUMPAD.map((row, ri) =>
          row.map((key) => (
            <button
              key={`${ri}-${key}`}
              onClick={() => handleKey(key)}
              className={cn(
                "h-14 flex items-center justify-center text-lg font-medium border-t border-r border-bg-card active:bg-bg-card transition-colors",
                key === "⌫" && "text-text-muted",
                key === "." && "text-text-muted",
              )}
              aria-label={key === "⌫" ? "Hapus" : key}
            >
              {key === "⌫" ? <Delete size={20} /> : key}
            </button>
          )),
        )}
      </div>
    </div>
  );
}
