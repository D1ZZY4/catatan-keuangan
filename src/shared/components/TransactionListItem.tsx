import React from "react";
import type { Category, Transaction } from "@/shared/types";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import { DynamicIcon } from "./DynamicIcon";

const TYPE_LABELS: Record<string, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  transfer_internal: "Transfer",
  transfer_external: "Transfer Keluar",
  debt_given: "Piutang",
  debt_received: "Hutang",
  debt_repay: "Pelunasan",
  savings_deposit: "Tabungan",
  savings_withdraw: "Tarik Tabungan",
  invest_buy: "Beli Investasi",
  invest_sell: "Jual Investasi",
};

function isPositiveType(type: string): boolean {
  return ["income", "debt_received", "savings_withdraw", "invest_sell"].includes(type);
}

function isNeutralType(type: string): boolean {
  return type === "transfer_internal";
}

interface TransactionListItemProps {
  transaction: Transaction;
  category?: Category;
  onClick?: () => void;
}

export function TransactionListItem({
  transaction,
  category,
  onClick,
}: TransactionListItemProps) {
  const positive = isPositiveType(transaction.type);
  const neutral = isNeutralType(transaction.type);

  const amountColor = neutral
    ? "text-accent-primary"
    : positive
      ? "text-success"
      : "text-danger";

  const amountPrefix = neutral ? "" : positive ? "+" : "-";
  const label = transaction.note ?? category?.name ?? TYPE_LABELS[transaction.type] ?? transaction.type;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        onClick && "cursor-pointer active:bg-bg-card transition-colors",
      )}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: category?.color ? `${category.color}22` : "var(--bg-card)" }}
      >
        <DynamicIcon
          name={category?.icon ?? "Circle"}
          size={18}
          style={{ color: category?.color ?? "var(--text-muted)" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{label}</p>
        <p className="text-xs text-text-muted">{formatDate(transaction.date)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-sm font-semibold", amountColor)}>
          {amountPrefix}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        {transaction.tags !== undefined && transaction.tags.length > 0 && (
          <p className="text-xs text-text-muted truncate max-w-[80px]">
            {transaction.tags[0]}
          </p>
        )}
      </div>
    </div>
  );
}
