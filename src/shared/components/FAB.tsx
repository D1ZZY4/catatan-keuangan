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
  color: string;
}

const SPEED_DIAL: SpeedDialOption[] = [
  { action: "income", label: "Pemasukan", Icon: TrendingUp, color: "bg-success" },
  { action: "expense", label: "Pengeluaran", Icon: TrendingDown, color: "bg-danger" },
  { action: "transfer", label: "Transfer", Icon: ArrowLeftRight, color: "bg-accent-primary" },
  { action: "scan", label: "Scan Struk", Icon: ScanLine, color: "bg-warning" },
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
    }, 450);
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
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className="fixed right-5 bottom-[84px] z-50 flex flex-col items-end gap-3">
        {isOpen &&
          SPEED_DIAL.map((opt, i) => (
            <div
              key={opt.action}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="text-sm font-medium text-text-primary bg-bg-surface rounded-sm px-2 py-1 shadow-card whitespace-nowrap">
                {opt.label}
              </span>
              <button
                onClick={() => handleOptionClick(opt.action)}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-fab active:scale-95 transition-transform",
                  opt.color,
                )}
                aria-label={opt.label}
              >
                <opt.Icon size={20} />
              </button>
            </div>
          ))}

        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-fab active:scale-95 transition-all",
            isOpen ? "bg-text-muted rotate-45" : "bg-accent-primary",
          )}
          aria-label={isOpen ? "Tutup" : "Tambah transaksi"}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </>
  );
}
