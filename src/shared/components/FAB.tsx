import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  ScanLine,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/misc";

export type FABAction = "income" | "expense" | "transfer" | "scan";

interface SpeedDialItem {
  action: FABAction;
  label: string;
  Icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  ringClass: string;
}

const DIAL_ITEMS: SpeedDialItem[] = [
  {
    action: "scan",
    label: "Scan Struk",
    Icon: ScanLine,
    colorClass: "text-text-muted",
    bgClass: "bg-bg-surface",
    ringClass: "ring-1 ring-black/[0.08]",
  },
  {
    action: "transfer",
    label: "Transfer",
    Icon: ArrowLeftRight,
    colorClass: "text-accent-primary",
    bgClass: "bg-accent-primary/12",
    ringClass: "ring-1 ring-accent-primary/20",
  },
  {
    action: "expense",
    label: "Pengeluaran",
    Icon: TrendingDown,
    colorClass: "text-danger",
    bgClass: "bg-danger/10",
    ringClass: "ring-1 ring-danger/20",
  },
  {
    action: "income",
    label: "Pemasukan",
    Icon: TrendingUp,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    ringClass: "ring-1 ring-success/20",
  },
];

interface FABProps {
  onAction: (action: FABAction) => void;
}

export function FAB({ onAction }: FABProps) {
  const [dialOpen, setDialOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!dialOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dialOpen]);

  const startPress = useCallback(() => {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setDialOpen(true);
    }, 500);
  }, []);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleTap = useCallback(() => {
    cancelPress();
    if (!didLongPress.current) {
      onAction("expense");
    }
  }, [cancelPress, onAction]);

  const handleDialAction = useCallback(
    (action: FABAction) => {
      setDialOpen(false);
      onAction(action);
    },
    [onAction],
  );

  return (
    <>
      {dialOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDialOpen(false)}
          aria-hidden
        />
      )}

      <div
        className="fixed right-4 z-50 flex flex-col items-center gap-3"
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
      >
        {DIAL_ITEMS.map((item, i) => {
          const delay = (DIAL_ITEMS.length - 1 - i) * 50;
          return (
            <div
              key={item.action}
              className={cn(
                "flex items-center gap-2.5 transition-all duration-200",
                dialOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none",
              )}
              style={{
                transitionDelay: dialOpen ? `${delay}ms` : "0ms",
              }}
            >
              <span
                className="text-xs font-semibold text-text-primary bg-bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-card whitespace-nowrap"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
              >
                {item.label}
              </span>
              <button
                onClick={() => handleDialAction(item.action)}
                aria-label={item.label}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-card",
                  item.bgClass,
                  item.ringClass,
                )}
              >
                <item.Icon size={20} strokeWidth={2} className={item.colorClass} />
              </button>
            </div>
          );
        })}

        <button
          ref={buttonRef}
          onPointerDown={startPress}
          onPointerUp={handleTap}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          aria-label={dialOpen ? "Tutup menu" : "Tambah transaksi"}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            "active:scale-90 transition-all duration-200 select-none",
            dialOpen ? "bg-text-muted/70" : "bg-accent-primary",
          )}
          style={
            !dialOpen
              ? {
                  boxShadow:
                    "0 4px 20px rgba(140,192,235,0.55), 0 2px 8px rgba(140,192,235,0.30)",
                }
              : undefined
          }
        >
          <div
            className={cn(
              "transition-transform duration-200",
              dialOpen ? "rotate-45" : "rotate-0",
            )}
          >
            {dialOpen ? (
              <X size={24} strokeWidth={2.5} className="text-white" />
            ) : (
              <Plus size={24} strokeWidth={2.5} className="text-white" />
            )}
          </div>
        </button>
      </div>

      <div
        className={cn(
          "fixed right-6 z-50 transition-all duration-300",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-0",
        )}
        style={{ bottom: "calc(100px + env(safe-area-inset-bottom, 0px))", pointerEvents: "none" }}
      />
    </>
  );
}
