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
];

export function SideNav() {
  return (
    <nav
      data-tour="sidenav"
      className="hidden md:flex flex-col w-64 min-h-[100dvh] flex-shrink-0 sticky top-0 border-r"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border, rgba(107,101,85,0.15))",
      }}
      aria-label="Navigasi utama"
    >
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center shadow-fab flex-shrink-0">
            <span className="text-white font-bold text-sm font-display">CK</span>
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary leading-tight">Catatan Keuangan</p>
            <p className="text-xs text-text-muted">Buku kas keluarga</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 min-h-[44px]",
                isActive
                  ? "bg-accent-primary/15 text-accent-primary font-semibold"
                  : "text-text-muted hover:bg-bg-surface hover:text-text-primary",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className="flex-shrink-0"
                />
                <span className="text-sm">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="px-5 py-6">
        <p className="text-xs text-text-muted opacity-60">
          v{import.meta.env.VITE_APP_VERSION}
        </p>
      </div>
    </nav>
  );
}
