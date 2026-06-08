import React from "react";
import { WifiOff } from "lucide-react";
import { formatDate } from "@/shared/utils/format";

interface OfflinePillProps {
  lastUpdated: number | null;
}

export function OfflinePill({ lastUpdated }: OfflinePillProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-[10px] font-medium"
    >
      <WifiOff size={10} strokeWidth={2.5} />
      <span>
        Mode Luring
        {lastUpdated !== null ? ` — Kurs per ${formatDate(lastUpdated)}` : ""}
      </span>
    </div>
  );
}
