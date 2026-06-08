import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckSquare2,
  Filter,
  FolderInput,
  Pencil,
  Search,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAppData } from "@/app/AppDataContext";
import { AppBar } from "@/shared/components/AppBar";
import { TransactionListItem } from "@/shared/components/TransactionListItem";
import { EmptyState, TransactionEmptyIllustration } from "@/shared/components/EmptyState";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import { INCOME_TYPES, EXPENSE_TYPES, TRANSFER_TYPES } from "@/shared/constants/transactionTypes";
import { hapticTap } from "@/shared/utils/haptic";
import type { AppOutletContext } from "@/app/AppShell";
import type { Transaction } from "@/shared/types";

type FilterPeriod = "all" | "today" | "week" | "month";
type FilterType = "all" | "income" | "expense" | "transfer";

interface FilterState {
  period: FilterPeriod;
  txType: FilterType;
  walletId: string;
  search: string;
  tag: string | null;
}

function matchesType(tx: Transaction, txType: FilterType): boolean {
  if (txType === "all") return true;
  if (txType === "income") return INCOME_TYPES.includes(tx.type);
  if (txType === "expense") return EXPENSE_TYPES.includes(tx.type);
  if (txType === "transfer") return TRANSFER_TYPES.includes(tx.type);
  return true;
}

export function TransactionPage() {
  const { transactions, categories, wallets, removeTransaction, addTransaction, updateTransaction } = useAppData();
  const { showToast } = useToast();
  const { openTransactionForm } = useOutletContext<AppOutletContext>();

  const [filter, setFilter] = useState<FilterState>({
    period: "month",
    txType: "all",
    walletId: "all",
    search: "",
    tag: null,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Batch select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveCatOpen, setMoveCatOpen] = useState(false);

  useEffect(() => {
    setVisibleCount(100);
  }, [filter]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => c + 50);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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
      if (filter.tag !== null && !(tx.tags ?? []).includes(filter.tag)) return false;
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
    for (const tx of filtered.slice(0, visibleCount)) {
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
  }, [filtered, visibleCount]);

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

  const handleLongPress = (tx: Transaction) => {
    setSelectMode(true);
    setSelectedIds(new Set([tx.id]));
    hapticTap();
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await removeTransaction(id);
    }
    showToast(`${ids.length} transaksi dihapus`, "success");
    exitSelectMode();
  };

  const handleBatchMoveCategory = async (categoryId: string) => {
    const ids = Array.from(selectedIds);
    const txList = transactions.filter((t) => ids.includes(t.id));
    for (const tx of txList) {
      await updateTransaction({ ...tx, categoryId, updatedAt: Date.now() });
    }
    showToast(`${ids.length} transaksi dipindahkan`, "success");
    setMoveCatOpen(false);
    exitSelectMode();
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

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const tx of transactions) {
      for (const t of tx.tags ?? []) set.add(t);
    }
    return Array.from(set).sort();
  }, [transactions]);

  const activeFilterCount =
    (filter.walletId !== "all" ? 1 : 0) + (filter.tag !== null ? 1 : 0);

  return (
    <>
      <AppBar
        title={selectMode ? `${selectedIds.size} dipilih` : "Transaksi"}
        actions={
          selectMode ? (
            <button
              onClick={exitSelectMode}
              className="w-9 h-9 flex items-center justify-center rounded-full active:bg-bg-card"
              aria-label="Batalkan pilihan"
            >
              <X size={18} className="text-text-muted" />
            </button>
          ) : (
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
          )
        }
      />

      {!selectMode && (
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

          {/* Baris 2: Filter Jenis */}
          <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
            {TX_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter((f) => ({ ...f, txType: t.id }))}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                  filter.txType === t.id
                    ? "bg-accent-primary text-white"
                    : "bg-bg-card text-text-muted",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-text-muted">Masuk:</span>
              <span className="font-semibold font-display tabular-nums text-success">
                {formatCurrency(totalIncome, "IDR")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-danger" />
              <span className="text-text-muted">Keluar:</span>
              <span className="font-semibold font-display tabular-nums text-danger">
                {formatCurrency(totalExpense, "IDR")}
              </span>
            </div>
          </div>
        </div>
      )}

      {!selectMode && (
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
      )}

      {selectMode && (
        <div className="px-4 py-2 bg-accent-primary/5 border-b border-accent-primary/20 flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedIds.size === filtered.length) {
                setSelectedIds(new Set());
              } else {
                setSelectedIds(new Set(filtered.map((t) => t.id)));
              }
            }}
            className="text-xs text-accent-primary font-medium flex items-center gap-1"
          >
            <CheckSquare2 size={14} />
            {selectedIds.size === filtered.length ? "Batalkan Semua" : "Pilih Semua"}
          </button>
          <span className="flex-1" />
          <p className="text-xs text-text-muted">Tahan item untuk mulai pilih</p>
        </div>
      )}

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
                      {...(!selectMode ? { onClick: () => setSelectedTx(tx) } : {})}
                      {...(!selectMode ? { onDelete: () => void handleSwipeDelete(tx) } : {})}
                      {...(!selectMode ? { onDuplicate: () => void handleDuplicate(tx) } : {})}
                      onLongPress={() => handleLongPress(tx)}
                      selectMode={selectMode}
                      selected={selectedIds.has(tx.id)}
                      onSelect={handleToggleSelect}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length > visibleCount && (
            <div ref={sentinelRef} className="h-4" />
          )}
          {filtered.length <= visibleCount && <div className="h-4" />}
        </div>
      )}

      {/* Batch action toolbar */}
      {selectMode && selectedIds.size > 0 && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-bg-card border border-black/[0.07] rounded-2xl px-4 py-3 shadow-float z-50"
          style={{ width: "calc(100% - 2rem)", maxWidth: 400 }}
        >
          <button
            onClick={() => setMoveCatOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 text-accent-primary"
            aria-label="Pindah kategori"
          >
            <FolderInput size={18} />
            <span className="text-[10px] font-semibold">Pindah Kategori</span>
          </button>
          <div className="w-px h-10 bg-bg-surface" />
          <button
            onClick={() => void handleBatchDelete()}
            className="flex-1 flex flex-col items-center gap-1 text-danger"
            aria-label="Hapus yang dipilih"
          >
            <Trash2 size={18} />
            <span className="text-[10px] font-semibold">Hapus ({selectedIds.size})</span>
          </button>
        </div>
      )}

      {/* Move category sheet */}
      <BottomSheet
        isOpen={moveCatOpen}
        onClose={() => setMoveCatOpen(false)}
        title="Pindah ke Kategori"
      >
        <div className="p-4 pb-8 grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => void handleBatchMoveCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-bg-card active:scale-95 transition-transform"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}22` }}
              >
                <DynamicIcon name={cat.icon} size={18} style={{ color: cat.color }} />
              </div>
              <span className="text-[10px] text-text-muted leading-tight text-center line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Single tx options sheet */}
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
            onClick={() => {
              if (!selectedTx) return;
              const typeLabel = INCOME_TYPES.includes(selectedTx.type) ? "Pemasukan" : "Pengeluaran";
              const text = `${typeLabel} ${formatCurrency(selectedTx.amount, selectedTx.currency ?? "IDR")}${selectedTx.note ? ` — ${selectedTx.note}` : ""} (${new Date(selectedTx.date).toLocaleDateString("id-ID")})`;
              if (typeof navigator.share !== "undefined") {
                void navigator.share({ title: "Catatan Keuangan", text });
              } else {
                void navigator.clipboard.writeText(text).then(() =>
                  showToast("Teks transaksi disalin ke clipboard", "success"),
                );
              }
              setSelectedTx(null);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-text-primary active:bg-bg-card"
          >
            <Share2 size={16} className="flex-shrink-0" />
            Bagikan Transaksi
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

      {/* Filter sheet — Dompet + Tag */}
      <BottomSheet isOpen={filterOpen} onClose={() => setFilterOpen(false)} title="Filter">
        <div className="p-4 space-y-5 pb-8">
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

          {allTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Tag</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setFilter((f) => ({ ...f, tag: f.tag === tag ? null : tag }))
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      filter.tag === tag
                        ? "bg-accent-primary text-white"
                        : "bg-bg-card text-text-primary ring-1 ring-border",
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setFilter((f) => ({ ...f, walletId: "all", tag: null }));
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
