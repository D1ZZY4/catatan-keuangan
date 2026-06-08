import React from "react";
import { cn } from "@/shared/utils/misc";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  height?: "sm" | "md";
}

function getProgressColor(pct: number): string {
  if (pct < 60) return "bg-success";
  if (pct < 85) return "bg-warning";
  return "bg-danger";
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage,
  className,
  height = "sm",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = getProgressColor(pct);

  return (
    <div className={cn("space-y-1", className)}>
      {(label !== undefined || showPercentage) && (
        <div className="flex justify-between items-center">
          {label !== undefined && (
            <span className="text-xs text-text-muted">{label}</span>
          )}
          {showPercentage && (
            <span className={cn("text-xs font-semibold", pct >= 85 ? "text-danger" : pct >= 60 ? "text-warning" : "text-success")}>
              {pct}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-bg-page rounded-full overflow-hidden",
          height === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
