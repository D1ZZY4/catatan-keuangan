import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useOutletContext } from "react-router-dom";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { AppBar } from "@/shared/components/AppBar";
import { EmptyState, StatsEmptyIllustration } from "@/shared/components/EmptyState";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { Transaction } from "@/shared/types";
import type { AppOutletContext } from "@/app/AppShell";

type Period = "week" | "month" | "3months" | "6months" | "year";
type StatsTab = "overview" | "debt";

const PERIOD_LABELS: Record<Period, string> = {
  week: "Minggu Ini",
  month: "Bulan Ini",
  "3months": "3 Bulan",
  "6months": "6 Bulan",
  year: "Tahun Ini",
};

function getPeriodStart(period: Period): number {
  const now = new Date();
  switch (period) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    case "3months":
      return new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
    case "6months":
      return new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
    case "year":
      return new Date(now.getFullYear(), 0, 1).getTime();
  }
}

function isIncome(tx: Transaction): boolean {
  return ["income", "debt_received", "savings_withdraw", "invest_sell"].includes(tx.type);
}

function isExpense(tx: Transaction): boolean {
  return ["expense", "transfer_external", "debt_given", "savings_deposit", "invest_buy", "debt_repay"].includes(tx.type);
}

function getMonthKey(date: number): string {
  return new Date(date).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

function getDayKey(date: number): string {
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function last6Months(): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-bg-surface rounded-xl shadow-fab px-3 py-2 text-xs space-y-1">
      {label !== undefined && <p className="font-semibold text-text-muted">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, "IDR")}
        </p>
      ))}
    </div>
  );
}

function OverviewTab({ period }: { period: Period }) {
  const { transactions, categories, wallets } = useAppData();

  const periodStart = getPeriodStart(period);
  const filtered = useMemo(
    () => transactions.filter((tx) => tx.date >= periodStart),
    [transactions, periodStart],
  );

  const totalIncome = filtered.filter(isIncome).reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = filtered.filter(isExpense).reduce((s, tx) => s + tx.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const daysInPeriod = Math.max(1, Math.ceil((Date.now() - periodStart) / 86400000));
  const avgDailyExpense = totalExpense / daysInPeriod;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of filtered.filter(isExpense)) {
      const cat = categories.find((c) => c.id === tx.categoryId);
      const key = cat?.name ?? "Lain-lain";
      map[key] = (map[key] ?? 0) + tx.amount;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => {
        const cat = categories.find((c) => c.name === name);
        return { name, value, color: cat?.color ?? "#8CC0EB" };
      });
  }, [filtered, categories]);

  const monthlyData = useMemo(() => {
    const months = last6Months();
    const map: Record<string, { income: number; expense: number }> = {};
    for (const m of months) map[m] = { income: 0, expense: 0 };
    for (const tx of transactions.filter((tx) => tx.date >= getPeriodStart("6months"))) {
      const key = getMonthKey(tx.date);
      if (!(key in map)) continue;
      const row = map[key];
      if (row === undefined) continue;
      if (isIncome(tx)) row.income += tx.amount;
      else if (isExpense(tx)) row.expense += tx.amount;
    }
    return months.map((m) => {
      const row = map[m];
      return { name: m, Pemasukan: row?.income ?? 0, Pengeluaran: row?.expense ?? 0 };
    });
  }, [transactions]);

  const dailyExpenseData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    for (const tx of filtered.filter(isExpense)) {
      const key = getDayKey(tx.date);
      dayMap[key] = (dayMap[key] ?? 0) + tx.amount;
    }
    return Object.entries(dayMap)
      .slice(-14)
      .map(([name, value]) => ({ name, Pengeluaran: value }));
  }, [filtered]);

  const balanceOverTime = useMemo(() => {
    const months = last6Months();
    return months.map((m, i) => {
      const untilDate = new Date();
      untilDate.setDate(1);
      untilDate.setMonth(new Date().getMonth() - (5 - i) + 1);
      const bal = wallets
        .filter((w) => !w.isArchived)
        .reduce((s, w) => {
          const walletBal = transactions
            .filter((tx) => tx.date < untilDate.getTime())
            .reduce((acc, tx) => {
              if (tx.walletId === w.id) {
                if (isIncome(tx)) return acc + tx.amount;
                if (isExpense(tx) || tx.type === "transfer_internal") return acc - tx.amount;
              }
              if (tx.toWalletId === w.id && tx.type === "transfer_internal") return acc + tx.amount;
              return acc;
            }, w.initialBalance);
          return s + walletBal;
        }, 0);
      return { name: m, "Total Aset": bal };
    });
  }, [wallets, transactions]);

  return (
    <div className="space-y-5 pb-4">
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        {[
          { label: "Pemasukan", value: formatCurrency(totalIncome, "IDR"), color: "text-success" },
          { label: "Pengeluaran", value: formatCurrency(totalExpense, "IDR"), color: "text-danger" },
          {
            label: "Selisih",
            value: formatCurrency(netBalance, "IDR"),
            color: netBalance >= 0 ? "text-success" : "text-danger",
          },
          {
            label: "Rata-rata/Hari",
            value: formatCurrency(avgDailyExpense, "IDR"),
            color: "text-warning",
          },
        ].map((m) => (
          <div key={m.label} className="bg-bg-card rounded-xl p-3 shadow-card">
            <p className="text-[10px] text-text-muted mb-1">{m.label}</p>
            <p className={cn("text-sm font-bold tabular-nums leading-tight", m.color)}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {expenseByCategory.length > 0 && (
        <section className="px-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Pengeluaran per Kategori</h2>
          <div className="bg-bg-card rounded-xl p-3 shadow-card">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  animationBegin={0}
                >
                  {expenseByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {expenseByCategory.slice(0, 6).map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] text-text-muted truncate">{entry.name}</span>
                  <span className="text-[10px] font-semibold text-text-primary ml-auto flex-shrink-0">
                    {formatNumber(entry.value / 1000, 0)}k
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {dailyExpenseData.length > 1 && (
        <section className="px-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Tren Pengeluaran Harian</h2>
          <div className="bg-bg-card rounded-xl p-3 shadow-card">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dailyExpenseData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-page)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Pengeluaran" fill="var(--danger)" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="px-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Pemasukan vs Pengeluaran (6 Bulan)</h2>
        <div className="bg-bg-card rounded-xl p-3 shadow-card">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-page)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Pemasukan" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="px-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Tren Total Aset</h2>
        <div className="bg-bg-card rounded-xl p-3 shadow-card">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={balanceOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-page)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Total Aset"
                stroke="var(--accent-primary)"
                fill="url(#assetGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="px-4">
        <div className="bg-bg-card rounded-xl p-4 shadow-card">
          <p className="text-xs text-text-muted mb-1">Tingkat Tabungan</p>
          <p className={cn("text-2xl font-bold", savingsRate >= 0 ? "text-success" : "text-danger")}>
            {savingsRate}%
          </p>
          <p className="text-xs text-text-muted mt-1">
            {savingsRate >= 20
              ? "Bagus! Kamu menabung dengan baik."
              : savingsRate >= 0
                ? "Coba tingkatkan tabungan kamu."
                : "Pengeluaran melebihi pemasukan."}
          </p>
        </div>
      </div>
    </div>
  );
}

function DebtTab() {
  const { transactions, categories } = useAppData();
  const { openTransactionForm } = useOutletContext<AppOutletContext>();

  const debtMap = useMemo(() => {
    const map: Record<
      string,
      { name: string; given: number; received: number; repaid: number; txIds: string[] }
    > = {};

    for (const tx of transactions) {
      if (!["debt_given", "debt_received", "debt_repay"].includes(tx.type)) continue;
      const person = tx.linkedPersonName ?? "Tidak diketahui";
      if (!(person in map)) {
        map[person] = { name: person, given: 0, received: 0, repaid: 0, txIds: [] };
      }
      const entry = map[person];
      if (entry === undefined) continue;
      entry.txIds.push(tx.id);
      if (tx.type === "debt_given") entry.given += tx.amount;
      else if (tx.type === "debt_received") entry.received += tx.amount;
      else if (tx.type === "debt_repay") entry.repaid += tx.amount;
    }

    return Object.values(map).filter((e) => e.given > 0 || e.received > 0);
  }, [transactions]);

  const debtTx = transactions.filter((tx) =>
    ["debt_given", "debt_received"].includes(tx.type),
  );

  if (debtTx.length === 0) {
    return (
      <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center text-2xl">
          🤝
        </div>
        <p className="text-sm font-semibold text-text-primary">Tidak ada hutang/piutang</p>
        <p className="text-xs text-text-muted max-w-xs">
          Catat transaksi piutang atau hutang untuk melihat rekap di sini
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-warning/10 rounded-xl p-3">
          <p className="text-[10px] text-text-muted">Total Piutang</p>
          <p className="text-sm font-bold text-warning tabular-nums">
            {formatCurrency(
              debtMap.reduce((s, e) => s + Math.max(0, e.given - e.repaid), 0),
              "IDR",
            )}
          </p>
        </div>
        <div className="bg-danger/10 rounded-xl p-3">
          <p className="text-[10px] text-text-muted">Total Hutang</p>
          <p className="text-sm font-bold text-danger tabular-nums">
            {formatCurrency(
              debtMap.reduce((s, e) => s + Math.max(0, e.received - e.repaid), 0),
              "IDR",
            )}
          </p>
        </div>
      </div>

      {debtMap.map((entry) => {
        const net = entry.given - entry.received - entry.repaid;
        const isOwedToMe = net > 0;
        const outstanding = Math.abs(net);

        return (
          <div key={entry.name} className="bg-bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary/15 flex items-center justify-center text-sm font-bold text-accent-primary">
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{entry.name}</p>
                  <p className={cn("text-xs font-medium", isOwedToMe ? "text-warning" : "text-danger")}>
                    {isOwedToMe ? "Piutang" : "Hutang"}
                  </p>
                </div>
              </div>
              <p className={cn("text-sm font-bold tabular-nums", isOwedToMe ? "text-warning" : "text-danger")}>
                {formatCurrency(outstanding, "IDR")}
              </p>
            </div>

            <div className="flex gap-3 text-[11px] text-text-muted mb-3">
              {entry.given > 0 && (
                <span>Dipinjamkan: {formatCurrency(entry.given, "IDR")}</span>
              )}
              {entry.received > 0 && (
                <span>Dipinjam: {formatCurrency(entry.received, "IDR")}</span>
              )}
              {entry.repaid > 0 && (
                <span>Terlunasi: {formatCurrency(entry.repaid, "IDR")}</span>
              )}
            </div>

            {outstanding > 0 && (
              <button
                onClick={() => {
                  openTransactionForm("debt_repay");
                }}
                className="w-full py-2 bg-success/15 text-success rounded-lg text-xs font-semibold active:scale-95 transition-transform"
              >
                ✓ Tandai Lunas
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StatsPage() {
  const { transactions } = useAppData();
  const [period, setPeriod] = useState<Period>("month");
  const [activeTab, setActiveTab] = useState<StatsTab>("overview");

  if (transactions.length === 0) {
    return (
      <>
        <AppBar title="Statistik" />
        <EmptyState
          illustration={<StatsEmptyIllustration />}
          title="Belum ada data"
          description="Tambahkan transaksi untuk melihat statistik keuangan kamu"
        />
      </>
    );
  }

  return (
    <>
      <AppBar title="Statistik" />

      <div className="flex border-b border-bg-card">
        {(["overview", "debt"] as StatsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-all border-b-2",
              activeTab === tab
                ? "text-accent-primary border-accent-primary"
                : "text-text-muted border-transparent",
            )}
          >
            {tab === "overview" ? "Ringkasan" : "Hutang & Piutang"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar border-b border-bg-card">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                  period === p ? "bg-accent-primary text-white" : "bg-bg-card text-text-muted",
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <OverviewTab period={period} />
        </>
      )}

      {activeTab === "debt" && <DebtTab />}
    </>
  );
}
