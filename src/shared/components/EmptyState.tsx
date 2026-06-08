import React from "react";
import { cn } from "@/shared/utils/misc";

interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

function DefaultIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="opacity-60">
      <circle cx="60" cy="60" r="50" fill="var(--bg-card)" />
      <path d="M40 70 Q60 40 80 70" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="52" r="12" fill="var(--accent-secondary)" />
      <path d="M53 52 L57 56 L67 46" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WalletEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="35" width="80" height="55" rx="12" fill="var(--bg-card)" />
      <rect x="20" y="35" width="80" height="20" rx="12" fill="var(--accent-secondary)" opacity="0.6" />
      <circle cx="76" cy="65" r="8" fill="var(--accent-primary)" opacity="0.8" />
      <rect x="32" y="42" width="24" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
      <rect x="32" y="62" width="16" height="2.5" rx="1.25" fill="var(--text-muted)" opacity="0.4" />
      <rect x="32" y="68" width="24" height="2.5" rx="1.25" fill="var(--text-muted)" opacity="0.3" />
      <circle cx="88" cy="32" r="14" fill="var(--accent-primary)" opacity="0.2" />
      <path d="M84 32 L87 35 L93 29" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TransactionEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="28" y="25" width="64" height="75" rx="10" fill="var(--bg-card)" />
      <rect x="36" y="38" width="40" height="4" rx="2" fill="var(--accent-secondary)" opacity="0.7" />
      <rect x="36" y="48" width="30" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
      <rect x="36" y="57" width="40" height="4" rx="2" fill="var(--success)" opacity="0.4" />
      <rect x="36" y="67" width="25" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
      <rect x="36" y="76" width="40" height="4" rx="2" fill="var(--danger)" opacity="0.4" />
      <circle cx="85" cy="30" r="16" fill="var(--bg-page)" />
      <path d="M78 30 L82 34 L92 24" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatsEmptyIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="80" width="16" height="25" rx="4" fill="var(--accent-primary)" opacity="0.4" />
      <rect x="42" y="60" width="16" height="45" rx="4" fill="var(--accent-primary)" opacity="0.6" />
      <rect x="64" y="50" width="16" height="55" rx="4" fill="var(--accent-primary)" opacity="0.8" />
      <rect x="86" y="35" width="16" height="70" rx="4" fill="var(--accent-primary)" />
      <path d="M20 80 Q52 40 90 35" stroke="var(--accent-secondary)" strokeWidth="2" strokeDasharray="4 3" fill="none" />
    </svg>
  );
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center gap-4", className)}>
      <div className="mb-2">
        {illustration ?? <DefaultIllustration />}
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description !== undefined && (
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      )}
      {action !== undefined && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2.5 bg-accent-primary text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-fab"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
