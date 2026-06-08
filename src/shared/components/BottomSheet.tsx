import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/misc";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  fullHeight,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    currentY.current = Math.max(0, e.clientY - startY.current);
    sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
  };

  const handlePointerUp = () => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    if (currentY.current > 120) {
      onClose();
    } else {
      sheetRef.current.style.transform = "";
    }
    currentY.current = 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={cn(
          "relative w-full bg-bg-surface rounded-t-2xl shadow-2xl animate-sheet-in transition-transform",
          fullHeight ? "max-h-[92dvh]" : "max-h-[85dvh]",
          "flex flex-col",
          className,
        )}
        style={{ transition: isDragging.current ? "none" : undefined }}
      >
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-text-muted/30" />
          </div>
          {title !== undefined && (
            <div className="flex items-center justify-between px-5 pt-1 pb-3">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-bg-card active:scale-95 transition-all"
                aria-label="Tutup"
              >
                <X size={18} className="text-text-muted" />
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
