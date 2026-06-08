import React, { useEffect, useRef, useState } from "react";
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

interface SpeedDialOption {
  action: FABAction;
  label: string;
  Icon: React.ElementType;
  bg: string;
  shadow: string;
}

const SPEED_DIAL: SpeedDialOption[] = [
  {
    action: "scan",
    label: "Scan Struk",
    Icon: ScanLine,
    bg: "bg-warning",
    shadow: "shadow-warning/30",
  },
  {
    action: "transfer",
    label: "Transfer",
    Icon: ArrowLeftRight,
    bg: "bg-accent-primary",
    shadow: "shadow-accent-primary/30",
  },
  {
    action: "expense",
    label: "Pengeluaran",
    Icon: TrendingDown,
    bg: "bg-danger",
    shadow: "shadow-danger/30",
  },
  {
    action: "income",
    label: "Pemasukan",
    Icon: TrendingUp,
    bg: "bg-success",
    shadow: "shadow-success/30",
  },
];

interface FABProps {
  onAction: (action: FABAction) => void;
}

export function FAB({ onAction }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setIsOpen(true);
    }, 400);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (didLongPress.current) return;
    if (isOpen) {
      setIsOpen(false);
    } else {
      onAction("expense");
    }
  };

  const handleOptionClick = (action: FABAction) => {
    setIsOpen(false);
    onAction(action);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed right-4 bottom-[88px] z-50 flex flex-col items-end gap-3">
        {SPEED_DIAL.map((opt, i) => {
          const delay = isOpen ? i * 45 : (SPEED_DIAL.length - 1 - i) * 30;
          return (
            <div
              key={opt.action}
              className={cn(
                "flex items-center gap-3 transition-all duration-200",
                isOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none",
              )}
              style={{ transitionDelay: `${delay}ms` }}
            >
              <div className="bg-bg-surface/95 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-card border border-black/[0.06] dark:border-white/10">
                <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                  {opt.label}
                </span>
              </div>
              <button
                onClick={() => handleOptionClick(opt.action)}
                className={cn(
                  "w-12 h-12 rounded-[16px] flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg",
                  opt.bg,
                )}
                aria-label={opt.label}
              >
                <opt.Icon size={20} strokeWidth={2.2} />
              </button>
            </div>
          );
        })}

        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
          className={cn(
            "w-[60px] h-[60px] rounded-[20px] flex items-center justify-center text-white transition-all duration-200 active:scale-90",
            isOpen
              ? "bg-text-muted/80 shadow-lg rotate-45"
              : "bg-accent-primary shadow-xl",
          )}
          style={
            isOpen
              ? undefined
              : {
                  boxShadow:
                    "0 8px 24px rgba(140,192,235,0.50), 0 2px 8px rgba(140,192,235,0.25)",
                }
          }
          aria-label={isOpen ? "Tutup" : "Tambah transaksi"}
        >
          {isOpen ? (
            <X size={22} strokeWidth={2.5} />
          ) : (
            <Plus size={28} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  );
}
