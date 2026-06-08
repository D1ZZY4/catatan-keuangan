import React, { useMemo, useState } from "react";
import { Bell, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { WalletCard } from "@/shared/components/WalletCard";
import { SkeletonCard } from "@/shared/components/SkeletonCard";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { TransactionListItem } from "@/shared/components/TransactionListItem";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { EmptyState, WalletEmptyIllustration, TransactionEmptyIllustration } from "@/shared/components/EmptyState";
import { formatCurrency, formatRelative } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { AppOutletContext } from "@/app/AppShell";

function useSparkline(walletId: string, transactions: ReturnType<typeof useAppData>["transactions"], initialBalance: number) {
  return useMemo(() => {
    const days = 7;
    const now = Date.now();
    const points: number[] = [];
    for (let d = days - 1; d >= 0; d--) {
      const dayStart = now - d * 86400000;
      const dayEnd = dayStart + 86400000;
      const balance = transactions
        .filter((tx) => tx.date < dayEnd && (tx.walletId === walletId || tx.toWalletId === walletId))
        .reduce((acc, tx) => {
          if (tx.walletId === walletId) {
            switch (tx.type) {
              case "income": case "debt_received": case "savings_withdraw": case "invest_sell":
                return acc + tx.amount;
              case "expense": case "transfer_external": case "debt_given":
              case "savings_deposit": case "invest_buy": case "debt_repay":
                return acc - tx.amount;
              case "transfer_internal":
                return acc - tx.amount;
              default: return acc;
            }
          }
          if (tx.toWalletId === walletId && tx.type === "transfer_internal") return acc + tx.amount;
          return acc;
        }, initialBalance);
      points.push(balance);
    }
    return points;
  }, [walletId, transactions, initialBalance]);
}

function WalletCardWithSparkline({ wallet }: { wallet: ReturnType<typeof useAppData>["wallets"][number] }) {
  const { transactions, getWalletBalance } = useAppData();
  const balance = getWalletBalance(wallet.id);
  const sparkline = useSparkline(wallet.id, transactions, wallet.initialBalance);

  return (
    <WalletCard
      wallet={wallet}
      balance={balance}
      sparkline={sparkline}
    />
  );
}

function BudgetRow() {
  const { budgets, transactions, categories } = useAppData();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const budgetsWithSpending = budgets.map((budget) => {
    const spent = transactions
      .filter(
        (tx) =>
          tx.categoryId === budget.categoryId &&
          tx.date >= startOfMonth &&
          ["expense", "transfer_external"].includes(tx.type),
      )
      .reduce((s, tx) => s + tx.amount, 0);
    const cat = categories.find((c) => c.id === budget.categoryId);
    return { budget, spent, cat };
  });

  if (budgetsWithSpending.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-text-primary">Anggaran Bulan Ini</h2>
        <Link to="/budgets" className="text-xs text-accent-primary font-medium">
          Kelola
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {budgetsWithSpending.map(({ budget, spent, cat }) => (
          <div
            key={budget.id}
            className="flex-shrink-0 w-[180px] bg-bg-card rounded-xl p-3 shadow-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: cat ? `${cat.color}22` : "var(--bg-page)" }}
              >
                <DynamicIcon name={cat?.icon ?? "Circle"} size={14} style={{ color: cat?.color ?? "var(--text-muted)" }} />
              </div>
              <span className="text-xs font-medium text-text-primary truncate">{cat?.name ?? "Anggaran"}</span>
            </div>
            <ProgressBar value={spent} max={budget.amount} showPercentage height="sm" className="mb-2" />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>{formatCurrency(spent, budget.currency)}</span>
              <span>{formatCurrency(budget.amount, budget.currency)}</span>
            </div>
          </div>
        ))}
        <Link
          to="/budgets"
          className="flex-shrink-0 w-[160px] border-2 border-dashed border-bg-card rounded-xl p-3 flex items-center justify-center text-xs text-text-muted active:bg-bg-card transition-colors"
        >
          + Tambah Anggaran
        </Link>
      </div>
    </section>
  );
}

function RemindersRow() {
  const { reminders } = useAppData();
  const today = new Date();

  const upcoming = reminders
    .filter((r) => r.isActive)
    .map((r) => {
      let dueDate: Date;
      if (r.period === "monthly") {
        dueDate = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
        if (dueDate.getTime() < Date.now()) {
          dueDate = new Date(today.getFullYear(), today.getMonth() + 1, r.dueDay);
        }
      } else {
        const diff = (r.dueDay - today.getDay() + 7) % 7;
        dueDate = new Date(today);
        dueDate.setDate(today.getDate() + diff);
      }
      return { reminder: r, dueDate };
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Bell size={14} className="text-text-muted" />
          Pengingat Tagihan
        </h2>
        <Link to="/settings/reminders" className="text-xs text-accent-primary font-medium">
          Lihat semua
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {upcoming.map(({ reminder, dueDate }) => {
          const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);
          return (
            <div
              key={reminder.id}
              className={cn(
                "flex-shrink-0 w-[160px] rounded-xl p-3 shadow-card",
                daysLeft <= 3 ? "bg-warning/10 border border-warning/30" : "bg-bg-card",
              )}
            >
              <p className="text-xs font-semibold text-text-primary truncate mb-1">{reminder.name}</p>
              {reminder.amount !== undefined && (
                <p className="text-sm font-bold text-text-primary">{formatCurrency(reminder.amount, reminder.currency)}</p>
              )}
              <p className={cn("text-xs mt-1", daysLeft <= 3 ? "text-warning" : "text-text-muted")}>
                {daysLeft === 0 ? "Hari ini" : daysLeft === 1 ? "Besok" : `${daysLeft} hari lagi`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HomePage() {
  const { state } = useAuth();
  const { wallets, transactions, categories, loading } = useAppData();
  const { openTransactionForm } = useOutletContext<AppOutletContext>();

  const userName = state.status === "unlocked" ? state.userName : "Pengguna";

  const activeWallets = wallets.filter((w) => !w.isArchived);

  const netWorth = useMemo(
    () =>
      activeWallets.reduce((sum, w) => sum + computeWalletBalance(w, transactions), 0),
    [activeWallets, transactions],
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const monthlyIncome = transactions
    .filter((tx) => tx.date >= startOfMonth && ["income", "debt_received", "invest_sell"].includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const monthlyExpense = transactions
    .filter((tx) => tx.date >= startOfMonth && ["expense", "transfer_external", "debt_given", "invest_buy"].includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const recentTransactions = transactions.slice(0, 8);

  // suppress unused import warning — formatRelative used in TransactionListItem context
  void formatRelative;

  return (
    <main className="pb-4">
      <div className="px-4 pt-14 pb-5 bg-gradient-to-b from-bg-card to-bg-page">
        <p className="text-xs text-text-muted mb-1">Selamat datang, {userName} 👋</p>
        <p className="text-2xl font-bold text-text-primary tabular-nums">
          {formatCurrency(netWorth, "IDR")}
        </p>
        <p className="text-xs text-text-muted mt-0.5">Total kekayaan bersih</p>

        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-success/15 flex items-center justify-center">
              <TrendingUp size={12} className="text-success" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted leading-none">Pemasukan</p>
              <p className="text-xs font-semibold text-success">{formatCurrency(monthlyIncome, "IDR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-danger/15 flex items-center justify-center">
              <TrendingDown size={12} className="text-danger" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted leading-none">Pengeluaran</p>
              <p className="text-xs font-semibold text-danger">{formatCurrency(monthlyExpense, "IDR")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <section className="space-y-2">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-semibold text-text-primary">Dompet</h2>
            <Link to="/wallets" className="text-xs text-accent-primary font-medium flex items-center gap-0.5">
              Lihat semua <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 px-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : activeWallets.length === 0 ? (
            <div className="px-4">
              <EmptyState
                illustration={<WalletEmptyIllustration />}
                title="Belum ada dompet"
                description="Tambahkan dompet untuk mulai mencatat keuangan"
                action={{ label: "+ Tambah Dompet", onClick: () => window.location.assign("/wallets") }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-4">
              {activeWallets.slice(0, 4).map((w) => (
                <WalletCardWithSparkline key={w.id} wallet={w} />
              ))}
            </div>
          )}
        </section>

        <BudgetRow />
        <RemindersRow />

        <section className="space-y-1">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-sm font-semibold text-text-primary">Transaksi Terbaru</h2>
            <Link to="/transactions" className="text-xs text-accent-primary font-medium flex items-center gap-0.5">
              Lihat semua <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-0 divide-y divide-bg-card">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-bg-card animate-shimmer skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-bg-card rounded animate-shimmer skeleton-shimmer" />
                    <div className="h-3 w-20 bg-bg-card rounded animate-shimmer skeleton-shimmer" />
                  </div>
                  <div className="h-4 w-16 bg-bg-card rounded animate-shimmer skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="px-4">
              <EmptyState
                illustration={<TransactionEmptyIllustration />}
                title="Belum ada transaksi"
                description="Tap tombol + di bawah untuk menambah transaksi"
                action={{ label: "+ Catat Transaksi", onClick: () => openTransactionForm("expense") }}
              />
            </div>
          ) : (
            <div className="divide-y divide-bg-card">
              {recentTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <TransactionListItem
                    key={tx.id}
                    transaction={tx}
                    {...(cat !== undefined ? { category: cat } : {})}
                    onClick={() => openTransactionForm(tx.type, tx)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
