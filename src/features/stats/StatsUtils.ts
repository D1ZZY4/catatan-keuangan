import type { Transaction } from "@/shared/types";
import { INCOME_TYPES, EXPENSE_TYPES } from "@/shared/constants/transactionTypes";

export type Period = "week" | "month" | "3months" | "6months" | "year" | "custom";
export type StatsTab = "overview" | "debt";

export const PERIOD_LABELS: Record<Period, string> = {
  week: "Minggu Ini",
  month: "Bulan Ini",
  "3months": "3 Bulan",
  "6months": "6 Bulan",
  year: "Tahun Ini",
  custom: "Kustom",
};

export function getPeriodStart(period: Exclude<Period, "custom">): number {
  const now = new Date();
  switch (period) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    case "3months":
      return new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
    case "6months":
      return new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
    case "year":
      return new Date(now.getFullYear(), 0, 1).getTime();
  }
}

export function dateToInputValue(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function inputValueToTs(val: string, endOfDay = false): number {
  const d = new Date(val);
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isIncome(tx: Transaction): boolean {
  return INCOME_TYPES.includes(tx.type);
}

export function isExpense(tx: Transaction): boolean {
  return EXPENSE_TYPES.includes(tx.type);
}

export function getMonthKey(date: number): string {
  return new Date(date).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export function getDayKey(date: number): string {
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function last6Months(): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  });
}
