import React from "react";
import type { Wallet } from "@/shared/types";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import { DynamicIcon } from "./DynamicIcon";

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  if (data.length < 2) {
    return <div className="w-[60px] h-[20px]" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 60;
  const H = 20;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

interface WalletCardProps {
  wallet: Wallet;
  balance: number;
  sparkline?: number[];
  convertedLabel?: string;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export function WalletCard({
  wallet,
  balance,
  sparkline,
  convertedLabel,
  onClick,
  onLongPress,
  className,
}: WalletCardProps) {
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
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      className={cn(
        "rounded-xl p-4 shadow-card bg-bg-card cursor-pointer active:scale-[0.97] transition-transform select-none",
        wallet.isArchived && "opacity-60",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${wallet.color}22` }}
        >
          <DynamicIcon name={wallet.icon} size={18} style={{ color: wallet.color }} />
        </div>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-bg-page text-text-muted uppercase tracking-wide">
          {wallet.currency}
        </span>
      </div>

      <p className="text-xs text-text-muted mb-0.5 truncate">{wallet.name}</p>
      <p className="text-lg font-semibold text-text-primary leading-tight truncate">
        {formatCurrency(balance, wallet.currency)}
      </p>

      {convertedLabel !== undefined && (
        <p className="text-[11px] text-text-muted mt-0.5">{convertedLabel}</p>
      )}

      {sparkline !== undefined && sparkline.length >= 2 && (
        <div className="mt-3 flex justify-end">
          <Sparkline data={sparkline} color={wallet.color} />
        </div>
      )}
    </div>
  );
}
