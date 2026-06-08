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
  Legend,
} from "recharts";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { AppBar } from "@/shared/components/AppBar";
import { EmptyState, StatsEmptyIllustration } from "@/shared/components/EmptyState";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { Transaction } from "@/shared/types";

type Period = "month" | "3months" | "6months" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Bulan Ini",
  "3months": "3 Bulan",
  "6months": "6 Bulan",
  year: "Tahun Ini",
};

function getPeriodStart(period: Period): number {
  const now = new Date();
  switch (period) {
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
  return [
    "expense",
    "transfer_external",
    "debt_given",
    "savings_deposit",
    "invest_buy",
    "debt_repay",
  ].includes(tx.type);
}

function getMonthKey(date: number): string {
  return new Date(date).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
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

export function StatsPage() {
  const { transactions, categories, wallets } = useAppData();
  const [period, setPeriod] = useState<Period>("month");

  const periodStart = getPeriodStart(period);

  const filtered = useMemo(
    () => transactions.filter((tx) => tx.date >= periodStart),
    [transactions, periodStart],
  );

  const totalIncome = filtered.filter(isIncome).reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = filtered.filter(isExpense).reduce((s, tx) => s + tx.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const netWorth = wallets
    .filter((w) => !w.isArchived)
    .reduce((s, w) => s + computeWalletBalance(w, transactions), 0);

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

  const savingsRate =
    totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

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

      <div className="space-y-5 pb-4">
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          {[
            { label: "Pemasukan", value: totalIncome, color: "text-success" },
            { label: "Pengeluaran", value: totalExpense, color: "text-danger" },
            {
              label: "Selisih",
              value: netBalance,
              color: netBalance >= 0 ? "text-success" : "text-danger",
            },
            { label: "Tingkat Tabungan", value: null, extra: `${savingsRate}%`, color: savingsRate >= 0 ? "text-accent-primary" : "text-danger" },
          ].map((m) => (
            <div key={m.label} className="bg-bg-card rounded-xl p-3 shadow-card">
              <p className="text-[10px] text-text-muted mb-1">{m.label}</p>
              <p className={cn("text-sm font-bold tabular-nums leading-tight", m.color)}>
                {m.extra !== undefined
                  ? m.extra
                  : formatCurrency(m.value ?? 0, "IDR")}
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
      </div>
    </>
  );
}
