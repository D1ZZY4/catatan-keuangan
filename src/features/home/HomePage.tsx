import React, { useMemo, useState } from "react";
import { Bell, ChevronRight, Layers, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { WalletCard } from "@/shared/components/WalletCard";
import { SkeletonCard } from "@/shared/components/SkeletonCard";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { TransactionListItem } from "@/shared/components/TransactionListItem";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import {
  EmptyState,
  WalletEmptyIllustration,
  TransactionEmptyIllustration,
} from "@/shared/components/EmptyState";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { AppOutletContext } from "@/app/AppShell";

function useSparkline(
  walletId: string,
  transactions: ReturnType<typeof useAppData>["transactions"],
  initialBalance: number,
) {
  return useMemo(() => {
    const days = 7;
    const now = Date.now();
    const points: number[] = [];
    for (let d = days - 1; d >= 0; d--) {
      const dayStart = now - d * 86400000;
      const dayEnd = dayStart + 86400000;
      const balance = transactions
        .filter(
          (tx) => tx.date < dayEnd && (tx.walletId === walletId || tx.toWalletId === walletId),
        )
        .reduce((acc, tx) => {
          if (tx.walletId === walletId) {
            switch (tx.type) {
              case "income":
              case "debt_received":
              case "savings_withdraw":
              case "invest_sell":
                return acc + tx.amount;
              case "expense":
              case "transfer_external":
              case "debt_given":
              case "savings_deposit":
              case "invest_buy":
              case "debt_repay":
                return acc - tx.amount;
              case "transfer_internal":
                return acc - tx.amount;
              default:
                return acc;
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

function WalletCardWithSparkline({
  wallet,
}: {
  wallet: ReturnType<typeof useAppData>["wallets"][number];
}) {
  const { transactions, getWalletBalance } = useAppData();
  const balance = getWalletBalance(wallet.id);
  const sparkline = useSparkline(wallet.id, transactions, wallet.initialBalance);
  return <WalletCard wallet={wallet} balance={balance} sparkline={sparkline} />;
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
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Layers size={14} className="text-accent-primary" />
          Anggaran Bulan Ini
        </h2>
        <Link to="/budgets" className="text-xs text-accent-primary font-medium">
          Kelola
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {budgetsWithSpending.map(({ budget, spent, cat }) => {
          const pct = budget.amount > 0 ? spent / budget.amount : 0;
          const isOver = pct >= 1;
          const isNear = pct > 0.8;
          return (
            <div
              key={budget.id}
              className={cn(
                "flex-shrink-0 w-[180px] rounded-2xl p-3.5 shadow-card border",
                isOver
                  ? "bg-danger/8 border-danger/25"
                  : isNear
                    ? "bg-warning/8 border-warning/25"
                    : "bg-bg-card border-transparent",
              )}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat ? `${cat.color}22` : "var(--bg-page)" }}
                >
                  <DynamicIcon
                    name={cat?.icon ?? "Circle"}
                    size={15}
                    style={{ color: cat?.color ?? "var(--text-muted)" }}
                  />
                </div>
                <span className="text-xs font-semibold text-text-primary truncate">
                  {cat?.name ?? "Anggaran"}
                </span>
              </div>
              <ProgressBar value={spent} max={budget.amount} showPercentage height="sm" className="mb-2" />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>{formatCurrency(spent, budget.currency)}</span>
                <span>{formatCurrency(budget.amount, budget.currency)}</span>
              </div>
            </div>
          );
        })}
        <Link
          to="/budgets"
          className="flex-shrink-0 w-[150px] border-2 border-dashed border-bg-card rounded-2xl p-3 flex items-center justify-center text-xs text-text-muted active:bg-bg-card transition-colors"
        >
          + Anggaran Baru
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
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Bell size={14} className="text-warning" />
          Pengingat Tagihan
        </h2>
        <Link to="/settings/reminders" className="text-xs text-accent-primary font-medium">
          Lihat semua
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {upcoming.map(({ reminder, dueDate }) => {
          const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);
          const isUrgent = daysLeft <= 3;
          return (
            <div
              key={reminder.id}
              className={cn(
                "flex-shrink-0 w-[165px] rounded-2xl p-3.5 shadow-card border",
                isUrgent ? "bg-warning/10 border-warning/30" : "bg-bg-card border-transparent",
              )}
            >
              <div
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mb-2",
                  isUrgent
                    ? "bg-warning/20 text-warning"
                    : "bg-accent-secondary/30 text-accent-primary",
                )}
              >
                {daysLeft === 0
                  ? "Hari ini!"
                  : daysLeft === 1
                    ? "Besok"
                    : `${daysLeft} hari lagi`}
              </div>
              <p className="text-xs font-semibold text-text-primary truncate mb-1">
                {reminder.name}
              </p>
              {reminder.amount !== undefined && (
                <p className="text-sm font-bold font-display tabular-nums text-text-primary">
                  {formatCurrency(reminder.amount, reminder.currency)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NetWorthHero({
  userName,
  netWorth,
  monthlyIncome,
  monthlyExpense,
  openTransactionForm,
}: {
  userName: string;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  openTransactionForm: AppOutletContext["openTransactionForm"];
}) {
  const [visible, setVisible] = useState(true);
  const now = new Date();
  const monthName = now.toLocaleString("id-ID", { month: "long" });

  return (
    <div className="relative overflow-hidden">
      <div
        className="px-4 pt-14 pb-5"
        style={{
          background:
            "linear-gradient(155deg, var(--accent-secondary) 0%, var(--bg-card) 55%, var(--bg-page) 100%)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-medium text-text-muted">
              Halo,{" "}
              <span className="text-text-primary font-bold">{userName}</span>
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {monthName} {now.getFullYear()}
            </p>
          </div>
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-[10px] font-semibold text-text-muted bg-bg-surface/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-black/[0.06] active:opacity-60 transition-opacity"
          >
            {visible ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        <p className="text-[11px] text-text-muted font-medium mb-1 tracking-wide uppercase">
          Total kekayaan bersih
        </p>
        <p className="text-[34px] font-bold font-display text-text-primary tabular-nums leading-none tracking-tight">
          {visible ? formatCurrency(netWorth, "IDR") : "Rp ••••••"}
        </p>

        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-success/12 rounded-2xl px-3 py-2.5 border border-success/20">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={11} className="text-success" />
              <p className="text-[10px] font-medium text-text-muted">Pemasukan</p>
            </div>
            <p className="text-[13px] font-bold font-display tabular-nums text-success leading-none">
              {visible ? formatCurrency(monthlyIncome, "IDR") : "••••"}
            </p>
          </div>
          <div className="flex-1 bg-danger/10 rounded-2xl px-3 py-2.5 border border-danger/20">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={11} className="text-danger" />
              <p className="text-[10px] font-medium text-text-muted">Pengeluaran</p>
            </div>
            <p className="text-[13px] font-bold font-display tabular-nums text-danger leading-none">
              {visible ? formatCurrency(monthlyExpense, "IDR") : "••••"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4 bg-bg-page">
        <button
          onClick={() => openTransactionForm("expense")}
          className="w-full py-3.5 bg-accent-primary text-white font-bold text-sm rounded-2xl active:scale-[0.98] transition-transform"
          style={{ boxShadow: "0 6px 20px rgba(140,192,235,0.45), 0 2px 8px rgba(140,192,235,0.2)" }}
        >
          + Catat Pengeluaran Sekarang
        </button>
      </div>
    </div>
  );
}

export function HomePage() {
  const { state } = useAuth();
  const { wallets, transactions, categories, loading } = useAppData();
  const { openTransactionForm } = useOutletContext<AppOutletContext>();

  const userName = state.status === "unlocked" ? state.userName : "Pengguna";
  const activeWallets = wallets.filter((w) => !w.isArchived);

  const netWorth = useMemo(
    () => activeWallets.reduce((sum, w) => sum + computeWalletBalance(w, transactions), 0),
    [activeWallets, transactions],
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const monthlyIncome = transactions
    .filter(
      (tx) =>
        tx.date >= startOfMonth &&
        ["income", "debt_received", "invest_sell"].includes(tx.type),
    )
    .reduce((s, tx) => s + tx.amount, 0);

  const monthlyExpense = transactions
    .filter(
      (tx) =>
        tx.date >= startOfMonth &&
        ["expense", "transfer_external", "debt_given", "invest_buy"].includes(tx.type),
    )
    .reduce((s, tx) => s + tx.amount, 0);

  const recentTransactions = transactions.slice(0, 8);

  return (
    <main className="pb-4">
      <NetWorthHero
        userName={userName}
        netWorth={netWorth}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        openTransactionForm={openTransactionForm}
      />

      <div className="space-y-5 mt-1">
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Wallet size={14} className="text-accent-primary" />
              Dompet Saya
            </h2>
            <Link
              to="/wallets"
              className="text-xs text-accent-primary font-medium flex items-center gap-0.5"
            >
              Lihat semua <ChevronRight size={13} />
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
                action={{
                  label: "+ Tambah Dompet",
                  onClick: () => window.location.assign("/wallets"),
                }}
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

        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-semibold text-text-primary">Transaksi Terbaru</h2>
            <Link
              to="/transactions"
              className="text-xs text-accent-primary font-medium flex items-center gap-0.5"
            >
              Lihat semua <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="mx-4 rounded-2xl overflow-hidden bg-bg-card divide-y divide-bg-page">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-bg-page animate-shimmer skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-bg-page rounded animate-shimmer skeleton-shimmer" />
                    <div className="h-3 w-20 bg-bg-page rounded animate-shimmer skeleton-shimmer" />
                  </div>
                  <div className="h-4 w-16 bg-bg-page rounded animate-shimmer skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="px-4">
              <EmptyState
                illustration={<TransactionEmptyIllustration />}
                title="Belum ada transaksi"
                description='Tap tombol "CATAT" di pojok kanan bawah untuk mulai mencatat'
                action={{
                  label: "+ Catat Transaksi",
                  onClick: () => openTransactionForm("expense"),
                }}
              />
            </div>
          ) : (
            <div className="mx-4 rounded-2xl overflow-hidden bg-bg-card shadow-card divide-y divide-bg-page">
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
