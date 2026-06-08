import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart2, Home, Settings, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/shared/utils/misc";

const NAV_ITEMS = [
  { to: "/", label: "Beranda", Icon: Home, exact: true },
  { to: "/transactions", label: "Transaksi", Icon: TrendingUp, exact: false },
  { to: "/stats", label: "Statistik", Icon: BarChart2, exact: false },
  { to: "/wallets", label: "Dompet", Icon: Wallet, exact: false },
  { to: "/settings", label: "Pengaturan", Icon: Settings, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-bg-card safe-bottom"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center justify-around h-[58px] px-1">
        {NAV_ITEMS.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className="flex-1 flex items-center justify-center min-h-[44px]"
            aria-label={label}
          >
            {({ isActive }) => (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-accent-primary/15 text-accent-primary"
                    : "text-text-muted hover:text-text-primary active:scale-90",
                )}
              >
                <Icon
                  size={isActive ? 18 : 20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                {isActive && (
                  <span className="text-xs font-semibold leading-none whitespace-nowrap">
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
