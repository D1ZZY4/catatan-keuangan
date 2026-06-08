import React, { useMemo, useState } from "react";
import { Filter, Pencil, Search, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAppData } from "@/app/AppDataContext";
import { AppBar } from "@/shared/components/AppBar";
import { TransactionListItem } from "@/shared/components/TransactionListItem";
import { EmptyState, TransactionEmptyIllustration } from "@/shared/components/EmptyState";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { AppOutletContext } from "@/app/AppShell";
import type { Transaction } from "@/shared/types";

type FilterPeriod = "all" | "today" | "week" | "month";
type FilterType = "all" | "income" | "expense" | "transfer";

interface FilterState {
  period: FilterPeriod;
  txType: FilterType;
  walletId: string;
  search: string;
}

const INCOME_TYPES = ["income", "debt_received", "savings_withdraw", "invest_sell"];
const EXPENSE_TYPES = ["expense", "transfer_external", "debt_given", "savings_deposit", "invest_buy", "debt_repay"];
const TRANSFER_TYPES = ["transfer"];

function matchesType(tx: Transaction, txType: FilterType): boolean {
  if (txType === "all") return true;
  if (txType === "income") return INCOME_TYPES.includes(tx.type);
  if (txType === "expense") return EXPENSE_TYPES.includes(tx.type);
  if (txType === "transfer") return TRANSFER_TYPES.includes(tx.type);
  return true;
}

export function TransactionPage() {
  const { transactions, categories, wallets, removeTransaction, addTransaction } = useAppData();
  const { showToast } = useToast();
  const { openTransactionForm } = useOutletContext<AppOutletContext>();

  const [filter, setFilter] = useState<FilterState>({
    period: "month",
    txType: "all",
    walletId: "all",
    search: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const now = Date.now();
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter.walletId !== "all" && tx.walletId !== filter.walletId && tx.toWalletId !== filter.walletId) return false;
      if (!matchesType(tx, filter.txType)) return false;
      if (filter.period === "today") {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        if (tx.date < startOfDay.getTime()) return false;
      } else if (filter.period === "week") {
        if (tx.date < now - 7 * 86400000) return false;
      } else if (filter.period === "month") {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        if (tx.date < start.getTime()) return false;
      }
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase();
        const cat = categories.find((c) => c.id === tx.categoryId);
        if (
          !tx.note?.toLowerCase().includes(q) &&
          !cat?.name.toLowerCase().includes(q) &&
          !tx.linkedPersonName?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [transactions, filter, categories, now]);

  const grouped = useMemo(() => {
    const g: Record<string, Transaction[]> = {};
    for (const tx of filtered) {
      const d = new Date(tx.date);
      const key = d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const existing = g[key];
      if (existing !== undefined) {
        existing.push(tx);
      } else {
        g[key] = [tx];
      }
    }
    return g;
  }, [filtered]);

  const totalIncome = filtered
    .filter((tx) => INCOME_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = filtered
    .filter((tx) => EXPENSE_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const handleDelete = async () => {
    if (!selectedTx) return;
    await removeTransaction(selectedTx.id);
    showToast("Transaksi dihapus", "success");
    setSelectedTx(null);
  };

  const handleSwipeDelete = async (tx: Transaction) => {
    await removeTransaction(tx.id);
    showToast("Transaksi dihapus", "success");
  };

  const handleDuplicate = async (tx: Transaction) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = tx;
    await addTransaction({ ...rest, date: Date.now() });
    showToast("Transaksi diduplikasi", "success");
  };

  const PERIODS: { id: FilterPeriod; label: string }[] = [
    { id: "today", label: "Hari ini" },
    { id: "week", label: "7 hari" },
    { id: "month", label: "Bulan ini" },
    { id: "all", label: "Semua" },
  ];

  const TX_TYPES: { id: FilterType; label: string }[] = [
    { id: "all", label: "Semua Jenis" },
    { id: "income", label: "Pemasukan" },
    { id: "expense", label: "Pengeluaran" },
    { id: "transfer", label: "Transfer" },
  ];

  const activeFilterCount =
    (filter.txType !== "all" ? 1 : 0) +
    (filter.walletId !== "all" ? 1 : 0);

  return (
    <>
      <AppBar
        title="Transaksi"
        actions={
          <button
            onClick={() => setFilterOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full active:bg-bg-card transition-colors"
            aria-label="Filter"
          >
            <Filter size={18} className="text-text-muted" />
            {activeFilterCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-warning text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      <div className="px-4 py-3 border-b border-bg-card">
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilter((f) => ({ ...f, period: p.id }))}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                filter.period === p.id
                  ? "bg-accent-primary text-white"
                  : "bg-bg-card text-text-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-text-muted">Masuk:</span>
            <span className="font-semibold font-display tabular-nums text-success">{formatCurrency(totalIncome, "IDR")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-text-muted">Keluar:</span>
            <span className="font-semibold font-display tabular-nums text-danger">{formatCurrency(totalExpense, "IDR")}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            placeholder="Cari transaksi…"
            className="w-full bg-bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration={<TransactionEmptyIllustration />}
          title="Tidak ada transaksi"
          description="Coba ubah filter atau tambahkan transaksi baru"
          action={{ label: "+ Catat Transaksi", onClick: () => openTransactionForm("expense") }}
        />
      ) : (
        <div>
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-bg-page border-b border-bg-card">
                <p className="text-xs font-semibold text-text-muted">{date}</p>
              </div>
              <div className="divide-y divide-bg-card">
                {txs.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  return (
                    <TransactionListItem
                      key={tx.id}
                      transaction={tx}
                      {...(cat !== undefined ? { category: cat } : {})}
                      onClick={() => setSelectedTx(tx)}
                      onDelete={() => void handleSwipeDelete(tx)}
                      onDuplicate={() => void handleDuplicate(tx)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div className="h-4" />
        </div>
      )}

      <BottomSheet
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
        title="Opsi Transaksi"
      >
        <div className="pb-6">
          <button
            onClick={() => {
              if (selectedTx) {
                openTransactionForm(selectedTx.type, selectedTx);
                setSelectedTx(null);
              }
            }}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-text-primary active:bg-bg-card"
          >
            <Pencil size={16} className="flex-shrink-0" />
            Edit Transaksi
          </button>
          <button
            onClick={() => void handleDelete()}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-danger active:bg-bg-card"
          >
            <Trash2 size={16} className="flex-shrink-0" />
            Hapus Transaksi
          </button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={filterOpen} onClose={() => setFilterOpen(false)} title="Filter">
        <div className="p-4 space-y-5 pb-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Jenis Transaksi</p>
            <div className="grid grid-cols-2 gap-2">
              {TX_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter((f) => ({ ...f, txType: t.id }))}
                  className={cn(
                    "flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    filter.txType === t.id
                      ? "bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/30"
                      : "bg-bg-card text-text-primary",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Dompet</p>
            <div className="flex flex-col gap-1">
              {[{ id: "all", name: "Semua Dompet" }, ...wallets].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setFilter((f) => ({ ...f, walletId: w.id }))}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    filter.walletId === w.id
                      ? "bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/30"
                      : "bg-bg-card text-text-primary",
                  )}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setFilter((f) => ({ ...f, txType: "all", walletId: "all" }));
                  setFilterOpen(false);
                }}
                className="flex-1 py-3 bg-bg-card text-text-muted rounded-2xl text-sm font-semibold"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setFilterOpen(false)}
              className="flex-1 py-3 bg-accent-primary text-white rounded-2xl text-sm font-semibold"
            >
              Terapkan
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
