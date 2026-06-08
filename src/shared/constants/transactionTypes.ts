import React from "react";
import {
  ArrowLeftRight,
  BarChart2,
  CheckCircle,
  DollarSign,
  PiggyBank,
  Send,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { TransactionType } from "@/shared/types";

export interface TransactionTypeOption {
  type: TransactionType;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}

export const TYPE_OPTIONS: TransactionTypeOption[] = [
  { type: "expense",           label: "Pengeluaran",    Icon: TrendingDown,   color: "text-danger",           bg: "bg-danger/10" },
  { type: "income",            label: "Pemasukan",      Icon: TrendingUp,     color: "text-success",          bg: "bg-success/10" },
  { type: "transfer_internal", label: "Transfer",       Icon: ArrowLeftRight, color: "text-accent-primary",   bg: "bg-accent-primary/10" },
  { type: "transfer_external", label: "Kirim Uang",     Icon: Send,           color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
  { type: "debt_given",        label: "Piutang",        Icon: UserPlus,       color: "text-warning",          bg: "bg-warning/10" },
  { type: "debt_received",     label: "Hutang",         Icon: UserMinus,      color: "text-warning",          bg: "bg-warning/10" },
  { type: "debt_repay",        label: "Pelunasan",      Icon: CheckCircle,    color: "text-text-muted",       bg: "bg-bg-page" },
  { type: "savings_deposit",   label: "Tabungan",       Icon: PiggyBank,      color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
  { type: "savings_withdraw",  label: "Tarik Tabungan", Icon: Wallet,         color: "text-success",          bg: "bg-success/10" },
  { type: "invest_buy",        label: "Beli Investasi", Icon: BarChart2,      color: "text-accent-primary",   bg: "bg-accent-primary/10" },
  { type: "invest_sell",       label: "Jual Investasi", Icon: DollarSign,     color: "text-success",          bg: "bg-success/10" },
];

export const INCOME_TYPES: TransactionType[] = ["income", "debt_received", "savings_withdraw", "invest_sell"];
export const EXPENSE_TYPES: TransactionType[] = ["expense", "transfer_external", "debt_given", "savings_deposit", "invest_buy", "debt_repay"];
export const TRANSFER_TYPES: TransactionType[] = ["transfer_internal"];
export const DEBT_TYPES: TransactionType[] = ["debt_given", "debt_received", "debt_repay"];

export function getTypeOption(type: TransactionType): TransactionTypeOption {
  return TYPE_OPTIONS.find((t) => t.type === type) ?? TYPE_OPTIONS[0]!;
}

export function isIncomeType(type: TransactionType): boolean {
  return INCOME_TYPES.includes(type);
}

export function isExpenseType(type: TransactionType): boolean {
  return EXPENSE_TYPES.includes(type);
}

export function isDebtType(type: TransactionType): boolean {
  return DEBT_TYPES.includes(type);
}

export function isTransferType(type: TransactionType): boolean {
  return TRANSFER_TYPES.includes(type);
}
