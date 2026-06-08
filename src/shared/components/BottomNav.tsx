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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-bg-card safe-bottom">
      <div className="flex items-stretch h-14">
        {NAV_ITEMS.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                "min-h-[44px] active:scale-95",
                isActive
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-primary",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent-primary" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn("text-[10px] font-medium leading-none", isActive ? "font-semibold" : "")}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
