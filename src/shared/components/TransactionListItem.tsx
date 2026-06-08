import React, { useRef, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
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

const DELETE_ZONE_W = 72;
const DUPE_ZONE_W = 64;
const COMMIT_THRESHOLD = 50;

interface TransactionListItemProps {
  transaction: Transaction;
  category?: Category;
  onClick?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function TransactionListItem({
  transaction,
  category,
  onClick,
  onDelete,
  onDuplicate,
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

  // ---- Swipe state ---------------------------------------------------------
  const [swipeX, setSwipeX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, lastX: 0, moved: false });
  const swipeEnabled = onDelete !== undefined || onDuplicate !== undefined;

  const clampSwipe = (delta: number) => {
    const minX = onDelete ? -DELETE_ZONE_W : 0;
    const maxX = onDuplicate ? DUPE_ZONE_W : 0;
    return Math.max(minX, Math.min(maxX, delta));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!swipeEnabled) return;
    dragRef.current = { startX: e.clientX, lastX: e.clientX, moved: false };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    dragRef.current.lastX = e.clientX;
    const delta = e.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 6) dragRef.current.moved = true;
    setSwipeX(clampSwipe(delta));
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const delta = dragRef.current.lastX - dragRef.current.startX;

    if (!dragRef.current.moved) {
      // Tap — if already revealed, close; otherwise let onClick fire
      if (swipeX !== 0) setSwipeX(0);
      return;
    }

    if (delta <= -COMMIT_THRESHOLD && onDelete) {
      // Snap to reveal delete zone
      setSwipeX(-DELETE_ZONE_W);
    } else if (delta >= COMMIT_THRESHOLD && onDuplicate) {
      onDuplicate();
      setSwipeX(0);
    } else {
      setSwipeX(0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (swipeX !== 0) {
      setSwipeX(0);
      return;
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
  };

  // ---- Render --------------------------------------------------------------
  return (
    <div className="relative overflow-hidden" style={{ isolation: "isolate" }}>
      {/* Left action zone (duplicate — swipe right) */}
      {onDuplicate && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center bg-accent-primary"
          style={{ width: `${DUPE_ZONE_W}px` }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-0.5">
            <Copy size={16} className="text-white" />
            <span className="text-[10px] text-white font-semibold">Salin</span>
          </div>
        </div>
      )}

      {/* Right action zone (delete — swipe left) */}
      {onDelete && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-danger"
          style={{ width: `${DELETE_ZONE_W}px` }}
        >
          <button
            onClick={() => { setSwipeX(0); onDelete(); }}
            className="flex flex-col items-center justify-center gap-0.5 w-full h-full"
            aria-label="Hapus transaksi"
          >
            <Trash2 size={16} className="text-white" />
            <span className="text-[10px] text-white font-semibold">Hapus</span>
          </button>
        </div>
      )}

      {/* Main content */}
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={swipeEnabled ? handlePointerDown : undefined}
        onPointerMove={swipeEnabled ? handlePointerMove : undefined}
        onPointerUp={swipeEnabled ? handlePointerUp : undefined}
        onPointerCancel={swipeEnabled ? () => { setDragging(false); setSwipeX(0); } : undefined}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3 bg-bg-page select-none",
          onClick && "cursor-pointer active:bg-bg-card",
        )}
        style={{
          transform: swipeX !== 0 ? `translateX(${swipeX}px)` : undefined,
          transition: dragging ? "none" : "transform 0.22s cubic-bezier(0.32,0.72,0,1)",
          touchAction: swipeEnabled ? "pan-y" : undefined,
          willChange: dragging ? "transform" : undefined,
        }}
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
          <p className={cn("text-sm font-semibold font-display tabular-nums", amountColor)}>
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
    </div>
  );
}
