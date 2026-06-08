import React, { useMemo } from "react";
import { ChevronRight, Plus, TrendingDown, Wallet } from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { SkeletonCard } from "@/shared/components/SkeletonCard";
import { TransactionListItem } from "@/shared/components/TransactionListItem";
import type { AppOutletContext } from "@/app/AppShell";
import { NetWorthHero } from "./NetWorthHero";
import { WalletCardWithSparkline } from "./WalletCardWithSparkline";
import { QuickActions, BudgetRow, RemindersRow } from "./HomeWidgets";
import { HealthScoreWidget } from "./HealthScoreWidget";

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
    .filter((tx) => tx.date >= startOfMonth && ["income", "debt_received", "invest_sell"].includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const monthlyExpense = transactions
    .filter((tx) => tx.date >= startOfMonth && ["expense", "transfer_external", "debt_given", "invest_buy"].includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const recentTransactions = transactions.slice(0, 6);

  return (
    <>
    <main className="pb-6">
      <NetWorthHero
        userName={userName}
        netWorth={netWorth}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
      />

      <div className="space-y-5 mt-4">
        <QuickActions openTransactionForm={openTransactionForm} onScan={openOCR} />

        <HealthScoreWidget />

        <section data-tour="wallets" className="space-y-2.5">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Wallet size={14} className="text-text-muted" />
              Dompet Saya
            </h2>
            <Link to="/wallets" className="text-xs text-text-muted font-medium flex items-center gap-0.5">
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
              <Link to="/wallets" className="flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3.5 border-2 border-dashed border-bg-surface active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-bg-surface flex items-center justify-center flex-shrink-0">
                  <Plus size={18} className="text-text-muted" />
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
                <Link to="/wallets" className="flex-shrink-0 w-[90px] rounded-2xl bg-bg-card border-2 border-dashed border-bg-surface flex flex-col items-center justify-center gap-1.5 text-text-muted active:scale-[0.97] transition-transform">
                  <Plus size={16} className="text-text-muted" />
                  <span className="text-[9px] font-semibold text-text-muted">Tambah</span>
                </Link>
              )}
            </div>
          )}
        </section>

        <div data-tour="budget"><BudgetRow /></div>
        <RemindersRow />

        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-semibold text-text-primary">Transaksi Terbaru</h2>
            <Link to="/transactions" className="text-xs text-text-muted font-medium flex items-center gap-0.5">
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
              <div className="w-10 h-10 rounded-xl bg-bg-surface flex items-center justify-center flex-shrink-0">
                <TrendingDown size={18} className="text-text-muted" />
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
    </>
  );

}
