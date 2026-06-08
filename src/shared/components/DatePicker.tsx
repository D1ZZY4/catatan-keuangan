import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/shared/utils/misc";

interface DatePickerProps {
  value: number;
  onChange: (timestamp: number) => void;
  label?: string;
  includeTime?: boolean;
  className?: string;
}

function toLocalInputValue(ts: number, includeTime: boolean): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (!includeTime) return date;
  return `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(val: string, includeTime: boolean): number {
  if (includeTime) {
    return new Date(val).getTime();
  }
  const [year, month, day] = val.split("-").map(Number);
  const d = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  return d.getTime();
}

export function DatePicker({
  value,
  onChange,
  label,
  includeTime = false,
  className,
}: DatePickerProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label !== undefined && (
        <label className="text-xs font-medium text-text-muted">{label}</label>
      )}
      <div className="relative">
        <Calendar
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type={includeTime ? "datetime-local" : "date"}
          value={toLocalInputValue(value, includeTime)}
          onChange={(e) => {
            if (e.target.value) onChange(fromLocalInputValue(e.target.value, includeTime));
          }}
          className="w-full bg-bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/40 [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>
    </div>
  );
}
