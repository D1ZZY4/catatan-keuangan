import React, { useMemo, useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { EmptyState } from "@/shared/components/EmptyState";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { useAppData } from "@/app/AppDataContext";
import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { Budget, Category } from "@/shared/types";

function BudgetEmptyIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-28 h-28" fill="none" aria-hidden>
      <rect x="20" y="30" width="80" height="55" rx="10" fill="var(--bg-card)" />
      <rect x="32" y="44" width="56" height="8" rx="4" fill="var(--accent-primary)" opacity="0.4" />
      <rect x="32" y="58" width="40" height="6" rx="3" fill="var(--bg-page)" />
      <rect x="32" y="68" width="25" height="6" rx="3" fill="var(--bg-page)" />
      <circle cx="88" cy="26" r="14" fill="var(--success)" opacity="0.15" />
      <text x="88" y="31" textAnchor="middle" fontSize="14" fill="var(--success)" fontWeight="700">+</text>
    </svg>
  );
}

interface BudgetFormState {
  categoryId: string;
  amountRaw: string;
  amount: number;
  currency: string;
  period: "monthly" | "weekly";
  notifyAt: number;
}

function defaultForm(): BudgetFormState {
  return {
    categoryId: "",
    amountRaw: "",
    amount: 0,
    currency: "IDR",
    period: "monthly",
    notifyAt: 80,
  };
}

interface BudgetFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editBudget?: Budget;
  categories: Category[];
  existingCategoryIds: Set<string>;
  onSave: (data: Omit<Budget, "id" | "createdAt">) => Promise<void>;
}

function BudgetFormSheet({
  isOpen,
  onClose,
  editBudget,
  categories,
  existingCategoryIds,
  onSave,
}: BudgetFormSheetProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<BudgetFormState>(() => {
    if (editBudget) {
      return {
        categoryId: editBudget.categoryId,
        amountRaw: String(editBudget.amount),
        amount: editBudget.amount,
        currency: editBudget.currency,
        period: editBudget.period,
        notifyAt: editBudget.notifyAt,
      };
    }
    return defaultForm();
  });
  const [loading, setLoading] = useState(false);

  const availableCategories = categories.filter(
    (c) =>
      c.type !== "income" &&
      (!existingCategoryIds.has(c.id) || c.id === editBudget?.categoryId),
  );

  const handleSave = async () => {
    if (!form.categoryId) {
      showToast("Pilih kategori terlebih dahulu", "error");
      return;
    }
    if (form.amount <= 0) {
      showToast("Masukkan jumlah anggaran", "error");
      return;
    }
    setLoading(true);
    try {
      await onSave({
        categoryId: form.categoryId,
        amount: form.amount,
        currency: form.currency,
        period: form.period,
        notifyAt: form.notifyAt,
      });
      onClose();
    } catch {
      showToast("Gagal menyimpan anggaran", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editBudget ? "Edit Anggaran" : "Tambah Anggaran"}
      fullHeight
    >
      <div className="p-4 space-y-5 pb-8">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Kategori
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setForm((s) => ({ ...s, categoryId: cat.id }))}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                  form.categoryId === cat.id
                    ? "border-accent-primary bg-accent-primary/10"
                    : "border-bg-card bg-bg-card",
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  <DynamicIcon name={cat.icon} size={16} style={{ color: cat.color }} />
                </div>
                <span className="text-[10px] text-text-muted leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
          {availableCategories.length === 0 && (
            <p className="text-xs text-text-muted text-center py-4">
              Semua kategori sudah memiliki anggaran
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Batas Anggaran
          </label>
          <CurrencyInput
            value={form.amountRaw}
            onChange={(raw, evaluated) => {
              setForm((s) => ({
                ...s,
                amountRaw: raw,
                ...(evaluated !== null ? { amount: evaluated } : {}),
              }));
            }}
            currency={form.currency}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Periode
          </label>
          <div className="flex gap-2">
            {(["monthly", "weekly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setForm((s) => ({ ...s, period: p }))}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                  form.period === p
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "bg-bg-card text-text-primary border-bg-card",
                )}
              >
                {p === "monthly" ? "Bulanan" : "Mingguan"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Notifikasi saat
            </label>
            <span className="text-sm font-bold text-accent-primary">{form.notifyAt}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={form.notifyAt}
            onChange={(e) =>
              setForm((s) => ({ ...s, notifyAt: parseInt(e.target.value) }))
            }
            className="w-full accent-accent-primary h-2"
          />
          <p className="text-xs text-text-muted">
            Kirim notifikasi ketika pengeluaran mencapai {form.notifyAt}% dari batas
          </p>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={loading || form.amount <= 0 || !form.categoryId}
          className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab"
        >
          {loading ? "Menyimpan…" : editBudget ? "Simpan Perubahan" : "Tambah Anggaran"}
        </button>
      </div>
    </BottomSheet>
  );
}

export function BudgetPage() {
  const { budgets, transactions, categories, addBudget, updateBudget, removeBudget } = useAppData();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Budget | null>(null);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfWeek = (() => {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const budgetsWithData = useMemo(
    () =>
      budgets.map((budget) => {
        const periodStart = budget.period === "monthly" ? startOfMonth : startOfWeek;
        const spent = transactions
          .filter(
            (tx) =>
              tx.categoryId === budget.categoryId &&
              tx.date >= periodStart &&
              ["expense", "transfer_external"].includes(tx.type),
          )
          .reduce((s, tx) => s + tx.amount, 0);
        const cat = categories.find((c) => c.id === budget.categoryId);
        const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        return { budget, spent, cat, pct };
      }),
    [budgets, transactions, categories, startOfMonth, startOfWeek],
  );

  const existingCategoryIds = useMemo(
    () => new Set(budgets.map((b) => b.categoryId)),
    [budgets],
  );

  const handleSave = async (data: Omit<Budget, "id" | "createdAt">) => {
    if (editBudget) {
      await updateBudget({ ...editBudget, ...data });
      showToast("Anggaran diperbarui", "success");
    } else {
      await addBudget(data);
      showToast("Anggaran ditambahkan", "success");
    }
  };

  const handleDelete = async (budget: Budget) => {
    await removeBudget(budget.id);
    showToast("Anggaran dihapus", "success");
    setDeleteConfirm(null);
  };

  return (
    <>
      <AppBar
        title="Anggaran"
        showBack
        actions={
          <button
            onClick={() => {
              setEditBudget(undefined);
              setFormOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center shadow-fab active:scale-90 transition-transform"
            aria-label="Tambah anggaran"
          >
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      <div className="px-4 pt-3 pb-2 bg-gradient-to-b from-bg-card to-bg-page border-b border-bg-card">
        <p className="text-xs text-text-muted">Periode Bulan Ini</p>
        <p className="text-sm font-semibold text-text-primary">
          {now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="p-4 space-y-3">
        {budgets.length === 0 ? (
          <EmptyState
            illustration={<BudgetEmptyIllustration />}
            title="Belum ada anggaran"
            description="Tetapkan batas pengeluaran per kategori agar keuangan lebih terkontrol"
            action={{
              label: "+ Tambah Anggaran",
              onClick: () => {
                setEditBudget(undefined);
                setFormOpen(true);
              },
            }}
          />
        ) : (
          budgetsWithData.map(({ budget, spent, cat, pct }) => (
            <div key={budget.id} className="bg-bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: cat ? `${cat.color}22` : "var(--bg-page)" }}
                  >
                    <DynamicIcon
                      name={cat?.icon ?? "Circle"}
                      size={18}
                      style={{ color: cat?.color ?? "var(--text-muted)" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {cat?.name ?? "Anggaran"}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {budget.period === "monthly" ? "Bulanan" : "Mingguan"} · notif {budget.notifyAt}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditBudget(budget);
                      setFormOpen(true);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted active:bg-bg-page transition-colors text-xs font-bold"
                    aria-label="Edit anggaran"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(budget)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-danger active:bg-danger/10 transition-colors"
                    aria-label="Hapus anggaran"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <ProgressBar value={spent} max={budget.amount} showPercentage height="md" className="mb-2" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Terpakai</p>
                  <p className="text-sm font-bold text-text-primary tabular-nums">
                    {formatCurrency(spent, budget.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Sisa</p>
                  <p
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      budget.amount - spent < 0 ? "text-danger" : "text-success",
                    )}
                  >
                    {formatCurrency(Math.max(0, budget.amount - spent), budget.currency)}
                  </p>
                </div>
              </div>

              {pct > 85 && (
                <div className="mt-2 flex items-center gap-1.5 bg-danger/10 rounded-lg px-2 py-1.5">
                  <AlertTriangle size={12} className="text-danger flex-shrink-0" />
                  <p className="text-[11px] text-danger font-medium">
                    {pct >= 100
                      ? "Anggaran sudah melebihi batas!"
                      : `Anggaran hampir habis (${Math.round(pct)}%)`}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <BudgetFormSheet
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditBudget(undefined);
        }}
        {...(editBudget !== undefined ? { editBudget } : {})}
        categories={categories}
        existingCategoryIds={existingCategoryIds}
        onSave={handleSave}
      />

      <BottomSheet
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Anggaran?"
      >
        <div className="p-4 pb-8 space-y-4">
          <p className="text-sm text-text-primary">
            Anggaran untuk kategori{" "}
            <strong>
              {categories.find((c) => c.id === deleteConfirm?.categoryId)?.name ?? "ini"}
            </strong>{" "}
            akan dihapus. Data transaksi tidak terpengaruh.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-3 bg-bg-card text-text-primary rounded-xl text-sm font-semibold"
            >
              Batal
            </button>
            <button
              onClick={() => deleteConfirm && void handleDelete(deleteConfirm)}
              className="flex-1 py-3 bg-danger text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
            >
              Hapus
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
