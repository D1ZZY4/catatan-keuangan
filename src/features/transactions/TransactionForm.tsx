import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BarChart2,
  CheckCircle,
  ChevronLeft,
  DollarSign,
  Hash,
  PiggyBank,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { DatePicker } from "@/shared/components/DatePicker";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { useAppData } from "@/app/AppDataContext";
import { useAutoCategory } from "@/shared/hooks/useAutoCategory";
import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { Transaction, TransactionType } from "@/shared/types";

const TYPE_OPTIONS: {
  type: TransactionType;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { type: "expense", label: "Pengeluaran", Icon: TrendingDown, color: "text-danger", bg: "bg-danger/10" },
  { type: "income", label: "Pemasukan", Icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  { type: "transfer_internal", label: "Transfer", Icon: ArrowLeftRight, color: "text-accent-primary", bg: "bg-accent-primary/10" },
  { type: "transfer_external", label: "Kirim Uang", Icon: Send, color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
  { type: "debt_given", label: "Piutang", Icon: UserPlus, color: "text-warning", bg: "bg-warning/10" },
  { type: "debt_received", label: "Hutang", Icon: UserMinus, color: "text-warning", bg: "bg-warning/10" },
  { type: "debt_repay", label: "Pelunasan", Icon: CheckCircle, color: "text-text-muted", bg: "bg-bg-page" },
  { type: "savings_deposit", label: "Tabungan", Icon: PiggyBank, color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
  { type: "savings_withdraw", label: "Tarik Tabungan", Icon: Wallet, color: "text-success", bg: "bg-success/10" },
  { type: "invest_buy", label: "Beli Investasi", Icon: BarChart2, color: "text-accent-primary", bg: "bg-accent-primary/10" },
  { type: "invest_sell", label: "Jual Investasi", Icon: DollarSign, color: "text-success", bg: "bg-success/10" },
];

type Step = 1 | 2 | 3;

interface FormState {
  type: TransactionType;
  amountRaw: string;
  amount: number;
  categoryId: string;
  walletId: string;
  toWalletId: string;
  date: number;
  note: string;
  linkedPersonName: string;
  linkedPersonPhone: string;
  tags: string[];
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editTransaction?: Transaction;
  prefill?: { amount?: number; note?: string; date?: number };
}

function WalletSelector({
  wallets,
  selected,
  onSelect,
  label,
}: {
  wallets: ReturnType<typeof useAppData>["wallets"];
  selected: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {wallets.filter((w) => !w.isArchived).map((w) => (
          <button
            key={w.id}
            onClick={() => onSelect(w.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all",
              selected === w.id
                ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                : "border-bg-card bg-bg-card text-text-primary",
            )}
          >
            <DynamicIcon name={w.icon} size={14} style={{ color: w.color }} />
            {w.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TransactionForm({
  isOpen,
  onClose,
  defaultType = "expense",
  editTransaction,
  prefill,
}: TransactionFormProps) {
  const { wallets, categories, addTransaction, updateTransaction } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const activeWallets = wallets.filter((w) => !w.isArchived);

  const hasPrefill = prefill !== undefined && (prefill.amount !== undefined || prefill.note !== undefined);
  // skip step 1 (type selection) — type is always pre-set by the caller (quick actions / speed dial)
  const [step, setStep] = useState<Step>(editTransaction ? 3 : hasPrefill ? 3 : 2);
  const [form, setForm] = useState<FormState>(() => {
    const def: FormState = {
      type: editTransaction?.type ?? defaultType,
      amountRaw: editTransaction
        ? String(editTransaction.amount)
        : prefill?.amount !== undefined
          ? String(prefill.amount)
          : "",
      amount: editTransaction?.amount ?? prefill?.amount ?? 0,
      categoryId: editTransaction?.categoryId ?? "",
      walletId:
        editTransaction?.walletId ?? wallets.find((w) => !w.isArchived)?.id ?? "",
      toWalletId: editTransaction?.toWalletId ?? "",
      date: editTransaction?.date ?? prefill?.date ?? Date.now(),
      note: editTransaction?.note ?? prefill?.note ?? "",
      linkedPersonName: editTransaction?.linkedPersonName ?? "",
      linkedPersonPhone: editTransaction?.linkedPersonPhone ?? "",
      tags: editTransaction?.tags ?? [],
    };
    return def;
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [categoryManuallySelected, setCategoryManuallySelected] = useState(!!editTransaction);

  const isIncomeType = ["income", "debt_received", "savings_withdraw", "invest_sell"].includes(form.type);
  const autoCategoryType = isIncomeType ? "income" : "expense";
  const suggestedCategory = useAutoCategory(form.note, autoCategoryType, categories);

  useEffect(() => {
    if (suggestedCategory && !categoryManuallySelected && !form.categoryId) {
      setForm((s) => ({ ...s, categoryId: suggestedCategory.id }));
    }
  }, [suggestedCategory, categoryManuallySelected, form.categoryId]);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
  }, []);

  const visibleCategories = useMemo(() => {
    const isIncome = ["income", "debt_received", "savings_withdraw", "invest_sell"].includes(form.type);
    return categories.filter((c) => c.type === (isIncome ? "income" : "expense") || c.type === "both");
  }, [categories, form.type]);

  const handleSave = async () => {
    if (form.amount <= 0) {
      showToast("Jumlah tidak boleh nol", "error");
      return;
    }
    if (!form.walletId) {
      showToast("Pilih dompet terlebih dahulu", "error");
      return;
    }
    if (form.type === "transfer_internal" && !form.toWalletId) {
      showToast("Pilih dompet tujuan", "error");
      return;
    }

    setLoading(true);
    try {
      const baseData = {
        type: form.type,
        amount: form.amount,
        currency: wallets.find((w) => w.id === form.walletId)?.currency ?? "IDR",
        walletId: form.walletId,
        categoryId: form.categoryId || (visibleCategories[0]?.id ?? ""),
        date: form.date,
        ...(form.note ? { note: form.note } : {}),
        ...(form.toWalletId ? { toWalletId: form.toWalletId } : {}),
        ...(form.linkedPersonName ? { linkedPersonName: form.linkedPersonName } : {}),
        ...(form.linkedPersonPhone ? { linkedPersonPhone: form.linkedPersonPhone } : {}),
        ...(form.tags.length > 0 ? { tags: form.tags } : {}),
      };

      if (editTransaction) {
        await updateTransaction({ ...editTransaction, ...baseData, updatedAt: Date.now() });
        showToast("Transaksi berhasil diperbarui", "success");
      } else {
        await addTransaction(baseData);
        showToast("Transaksi berhasil dicatat", "success");
      }
      onClose();
    } catch {
      showToast("Gagal menyimpan transaksi", "error");
    } finally {
      setLoading(false);
    }
  };

  const isDebtType = ["debt_given", "debt_received", "debt_repay"].includes(form.type);
  const isTransfer = form.type === "transfer_internal";

  const typeLabel =
    TYPE_OPTIONS.find((t) => t.type === form.type)?.label ?? "Transaksi";
  const title = editTransaction ? "Edit Transaksi" : typeLabel;

  if (activeWallets.length === 0) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title} fullHeight>
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
            <Wallet size={28} className="text-accent-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-text-primary">Belum ada dompet aktif</p>
            <p className="text-sm text-text-muted">Buat dompet terlebih dahulu sebelum mencatat transaksi.</p>
          </div>
          <button
            onClick={() => { onClose(); void navigate("/wallets"); }}
            className="px-6 py-3 rounded-full bg-accent-primary text-white font-semibold text-sm"
          >
            Buat Dompet Dulu
          </button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} fullHeight>
      {step === 1 && (
        <div className="p-4 space-y-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Jenis Transaksi
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => {
                  const isInc = ["income", "debt_received", "savings_withdraw", "invest_sell"].includes(opt.type);
                  const firstCat = categories.find((c) => c.type === (isInc ? "income" : "expense") || c.type === "both");
                  setForm((s) => ({ ...s, type: opt.type, categoryId: firstCat?.id ?? "" }));
                  setStep(2);
                }}
                className="flex items-center gap-2 px-3 py-3 rounded-xl bg-bg-card text-sm font-medium text-text-primary active:scale-95 transition-transform"
              >
                <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", opt.bg)}>
                  <opt.Icon size={14} className={opt.color} />
                </span>
                <span className="text-xs leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-bg-card">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-accent-primary font-medium flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Jenis
            </button>
            <p className="flex-1 text-sm font-medium text-text-primary text-center">
              {TYPE_OPTIONS.find((t) => t.type === form.type)?.label}
            </p>
          </div>
          <CurrencyInput
            value={form.amountRaw}
            onChange={(raw, evaluated) => {
              update("amountRaw", raw);
              if (evaluated !== null) update("amount", evaluated);
            }}
            currency={wallets.find((w) => w.id === form.walletId)?.currency ?? "IDR"}
            autoFocus
          />
          <div className="p-4">
            <button
              onClick={() => {
                if (form.amount > 0) setStep(3);
                else showToast("Masukkan jumlah terlebih dahulu", "error");
              }}
              className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-fab"
            >
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-4 space-y-4 pb-8">
          <div className="flex items-center justify-between bg-bg-card rounded-xl px-4 py-3">
            <span className="text-sm text-text-muted">Jumlah</span>
            <button onClick={() => setStep(2)} className="text-sm font-bold text-text-primary">
              {formatCurrency(form.amount, wallets.find((w) => w.id === form.walletId)?.currency ?? "IDR")}
            </button>
          </div>

          <WalletSelector
            wallets={wallets}
            selected={form.walletId}
            onSelect={(id) => update("walletId", id)}
            label="Dari Dompet"
          />

          {isTransfer && (
            <WalletSelector
              wallets={wallets}
              selected={form.toWalletId}
              onSelect={(id) => update("toWalletId", id)}
              label="Ke Dompet"
            />
          )}

          {!isTransfer && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-text-muted">Kategori</label>
                {suggestedCategory !== undefined && !categoryManuallySelected && (
                  <button
                    onClick={() => {
                      update("categoryId", suggestedCategory.id);
                      setCategoryManuallySelected(true);
                    }}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary"
                    aria-label={`Saran kategori: ${suggestedCategory.name}`}
                  >
                    <Sparkles size={9} />
                    Saran: {suggestedCategory.name}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { update("categoryId", cat.id); setCategoryManuallySelected(true); }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all",
                      form.categoryId === cat.id
                        ? "border-accent-primary bg-accent-primary/10"
                        : "border-bg-card bg-bg-card",
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}22` }}
                    >
                      <DynamicIcon name={cat.icon} size={16} style={{ color: cat.color }} />
                    </div>
                    <span className="text-[10px] text-text-muted leading-tight text-center line-clamp-1">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <DatePicker
            value={form.date}
            onChange={(ts) => update("date", ts)}
            label="Tanggal"
            includeTime
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Catatan (opsional)</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Tambahkan catatan…"
              className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1">
              <Hash size={11} className="text-text-muted" /> Tag (opsional, maks 5)
            </label>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-accent-primary/15 text-accent-primary text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    #{tag}
                    <button
                      onClick={() => update("tags", form.tags.filter((t) => t !== tag))}
                      aria-label={`Hapus tag ${tag}`}
                      className="opacity-60 hover:opacity-100"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.replace(/\s+/g, "-").replace(/^#/, ""))}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                  e.preventDefault();
                  const tag = tagInput.trim().replace(/^#/, "");
                  if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
                    update("tags", [...form.tags, tag]);
                    setTagInput("");
                  }
                } else if (e.key === "Backspace" && !tagInput && form.tags.length > 0) {
                  update("tags", form.tags.slice(0, -1));
                }
              }}
              placeholder={form.tags.length >= 5 ? "Maks 5 tag" : "Ketik lalu Enter…"}
              disabled={form.tags.length >= 5}
              className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40 disabled:opacity-40"
            />
          </div>

          {isDebtType && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Nama orang</label>
                <input
                  type="text"
                  value={form.linkedPersonName}
                  onChange={(e) => update("linkedPersonName", e.target.value)}
                  placeholder="cth. Budi Santoso"
                  className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">No. HP (opsional)</label>
                <input
                  type="tel"
                  value={form.linkedPersonPhone}
                  onChange={(e) => update("linkedPersonPhone", e.target.value)}
                  placeholder="cth. 0812-3456-7890"
                  className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
                />
              </div>
            </>
          )}

          <button
            onClick={() => void handleSave()}
            disabled={loading || form.amount <= 0}
            className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab"
          >
            {loading
              ? "Menyimpan…"
              : editTransaction
                ? "Simpan Perubahan"
                : "Catat Transaksi"}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
