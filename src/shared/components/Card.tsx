import React from "react";
import { cn } from "@/shared/utils/misc";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onLongPress?: () => void;
  padding?: "none" | "sm" | "md";
  variant?: "default" | "surface";
}

export function Card({
  children,
  className,
  onClick,
  onLongPress,
  padding = "md",
  variant = "default",
}: CardProps) {
  const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = React.useRef(false);

  const handlePointerDown = () => {
    if (!onLongPress) return;
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, 500);
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (didLongPress.current) return;
    onClick?.();
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      className={cn(
        "rounded-xl shadow-card",
        variant === "default" ? "bg-bg-card" : "bg-bg-surface",
        padding === "md" && "p-4",
        padding === "sm" && "p-3",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform select-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
