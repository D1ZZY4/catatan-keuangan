import React, { useMemo, useState } from "react";
import {
  Bell,
  ChevronRight,
  Layers,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  ScanLine,
  Plus,
} from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { WalletCard } from "@/shared/components/WalletCard";
import { SkeletonCard } from "@/shared/components/SkeletonCard";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { TransactionListItem } from "@/shared/components/TransactionListItem";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
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

function QuickActions({
  openTransactionForm,
  onScan,
}: {
  openTransactionForm: AppOutletContext["openTransactionForm"];
  onScan: () => void;
}) {
  const actions = [
    {
      label: "Pengeluaran",
      icon: TrendingDown,
      iconColor: "#C62828",
      iconBg: "rgba(198,40,40,0.12)",
      onClick: () => openTransactionForm("expense"),
    },
    {
      label: "Pemasukan",
      icon: TrendingUp,
      iconColor: "#2E7D32",
      iconBg: "rgba(46,125,50,0.12)",
      onClick: () => openTransactionForm("income"),
    },
    {
      label: "Transfer",
      icon: ArrowLeftRight,
      iconColor: "var(--accent-primary)",
      iconBg: "rgba(140,192,235,0.15)",
      onClick: () => openTransactionForm("transfer_internal"),
    },
    {
      label: "Scan Struk",
      icon: ScanLine,
      iconColor: "var(--text-muted)",
      iconBg: "var(--bg-surface)",
      onClick: onScan,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5 px-4">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="flex flex-col items-center gap-2.5 py-3.5 rounded-2xl bg-bg-card shadow-card active:scale-95 transition-transform"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: a.iconBg }}
          >
            <a.icon size={19} strokeWidth={2} style={{ color: a.iconColor }} />
          </div>
          <span className="text-[9px] font-semibold text-text-muted leading-none tracking-wide uppercase">{a.label}</span>
        </button>
      ))}
    </div>
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
                "flex-shrink-0 w-[175px] rounded-2xl p-3.5 shadow-card border",
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
                <span className="text-xs font-semibold text-text-primary truncate flex-1">
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
          className="flex-shrink-0 w-[130px] border-2 border-dashed border-bg-card rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 text-text-muted active:bg-bg-card transition-colors"
        >
          <Plus size={16} />
          <span className="text-[10px] font-medium">Anggaran Baru</span>
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
                "flex-shrink-0 w-[160px] rounded-2xl p-3.5 shadow-card border",
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
}: {
  userName: string;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
}) {
  const [visible, setVisible] = useState(true);
  const now = new Date();
  const monthName = now.toLocaleString("id-ID", { month: "long" });

  return (
    <div className="relative overflow-hidden">
      <div
        className="px-4 pt-14 pb-6"
        style={{
          background:
            "linear-gradient(155deg, var(--accent-secondary) 0%, var(--bg-card) 60%, var(--bg-page) 100%)",
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[13px] font-semibold text-text-primary">
              Halo, <span className="text-accent-primary">{userName}</span>
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {monthName} {now.getFullYear()}
            </p>
          </div>
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-[10px] font-semibold text-text-muted bg-bg-surface/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-black/[0.06] active:opacity-60 transition-opacity"
            aria-label={visible ? "Sembunyikan saldo" : "Tampilkan saldo"}
          >
            {visible ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        <p className="text-[10px] text-text-muted font-semibold mb-1 tracking-widest uppercase">
          Total kekayaan bersih
        </p>
        <p className="text-[40px] font-bold font-display text-text-primary tabular-nums leading-none tracking-tight mb-5">
          {visible ? formatCurrency(netWorth, "IDR") : "Rp ••••••"}
        </p>

        <div className="flex gap-3">
          <div className="flex-1 bg-bg-surface/60 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-success/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={11} className="text-success" />
              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">Masuk</p>
            </div>
            <p className="text-[14px] font-bold font-display tabular-nums text-success leading-none">
              {visible ? formatCurrency(monthlyIncome, "IDR") : "••••"}
            </p>
          </div>
          <div className="flex-1 bg-bg-surface/60 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-danger/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={11} className="text-danger" />
              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">Keluar</p>
            </div>
            <p className="text-[14px] font-bold font-display tabular-nums text-danger leading-none">
              {visible ? formatCurrency(monthlyExpense, "IDR") : "••••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { state } = useAuth();
  const { wallets, transactions, categories, loading } = useAppData();
  const { openTransactionForm, openOCR } = useOutletContext<AppOutletContext>();

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

  const recentTransactions = transactions.slice(0, 6);

  return (
    <main className="pb-6">
      <NetWorthHero
        userName={userName}
        netWorth={netWorth}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
      />

      <div className="space-y-5 mt-4">
        <QuickActions
          openTransactionForm={openTransactionForm}
          onScan={openOCR}
        />

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
            <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
              <div className="flex-shrink-0 w-[160px]"><SkeletonCard /></div>
              <div className="flex-shrink-0 w-[160px]"><SkeletonCard /></div>
            </div>
          ) : activeWallets.length === 0 ? (
            <div className="mx-4">
              <Link
                to="/wallets"
                className="flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3.5 border-2 border-dashed border-accent-primary/25 active:bg-bg-surface transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus size={18} className="text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Tambah Dompet Pertama</p>
                  <p className="text-[11px] text-text-muted">Tunai, rekening, dompet digital</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar pb-1">
              {activeWallets.slice(0, 6).map((w) => (
                <div key={w.id} className="flex-shrink-0 w-[160px]">
                  <WalletCardWithSparkline wallet={w} />
                </div>
              ))}
              {activeWallets.length > 0 && (
                <Link
                  to="/wallets"
                  className="flex-shrink-0 w-[90px] rounded-2xl bg-bg-card border-2 border-dashed border-accent-primary/20 flex flex-col items-center justify-center gap-1.5 text-text-muted active:bg-bg-surface transition-colors"
                >
                  <Plus size={16} className="text-accent-primary" />
                  <span className="text-[9px] font-semibold text-accent-primary">Tambah</span>
                </Link>
              )}
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
            <button
              onClick={() => openTransactionForm("expense")}
              className="mx-4 w-[calc(100%-2rem)] flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3.5 border-2 border-dashed border-bg-surface active:bg-bg-surface transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={18} className="text-accent-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-text-primary">Catat Transaksi Pertama</p>
                <p className="text-[11px] text-text-muted">Tap untuk mulai mencatat pengeluaran</p>
              </div>
            </button>
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
