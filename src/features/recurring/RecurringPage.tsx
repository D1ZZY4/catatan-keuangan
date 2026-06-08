import React, { useEffect, useState } from "react";
import { CalendarClock, Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAppData } from "@/app/AppDataContext";
import { useToast } from "@/shared/hooks/useToast";
import {
  createRecurring,
  deleteRecurring,
  listRecurring,
  toggleRecurring,
  type RecurringTransactionRow,
} from "@/shared/hooks/useRecurringTransactions";
import { newId } from "@/shared/utils/misc";
import type { TransactionType } from "@/shared/types";

const FREQ_OPTIONS: Array<{ value: RecurringTransactionRow["frequency"]; label: string; desc: string }> = [
  { value: "harian", label: "Harian", desc: "Setiap hari" },
  { value: "mingguan", label: "Mingguan", desc: "Setiap 7 hari" },
  { value: "bulanan", label: "Bulanan", desc: "Setiap bulan" },
];

const TYPE_OPTIONS: Array<{ value: TransactionType; label: string }> = [
  { value: "expense", label: "Pengeluaran" },
  { value: "income", label: "Pemasukan" },
];

export function RecurringPage() {
  const { wallets, categories } = useAppData();
  const { showToast } = useToast();
  const [items, setItems] = useState<RecurringTransactionRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "expense" as TransactionType,
    amount: "",
    categoryId: "",
    walletId: "",
    note: "",
    frequency: "bulanan" as RecurringTransactionRow["frequency"],
  });

  const load = async () => {
    const rows = await listRecurring();
    setItems(rows.sort((a, b) => a.nextDueDate - b.nextDueDate));
  };

  useEffect(() => { void load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Nama wajib diisi", "error"); return; }
    if (!form.amount || isNaN(Number(form.amount))) { showToast("Nominal tidak valid", "error"); return; }
    if (!form.walletId) { showToast("Pilih dompet", "error"); return; }
    if (!form.categoryId) { showToast("Pilih kategori", "error"); return; }

    const wallet = wallets.find((w) => w.id === form.walletId);
    // Set next due to tomorrow by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await createRecurring({
      name: form.name.trim(),
      type: form.type,
      amount: Number(form.amount),
      currency: wallet?.currency ?? "IDR",
      categoryId: form.categoryId,
      walletId: form.walletId,
      note: form.note,
      frequency: form.frequency,
      nextDueDate: tomorrow.getTime(),
      isActive: 1,
    });

    showToast("Transaksi berulang ditambahkan", "success");
    setSheetOpen(false);
    setForm({ name: "", type: "expense", amount: "", categoryId: "", walletId: "", note: "", frequency: "bulanan" });
    await load();
  };

  const handleToggle = async (item: RecurringTransactionRow) => {
    await toggleRecurring(item.id, item.isActive === 1 ? 0 : 1);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteRecurring(id);
    showToast("Dihapus", "success");
    await load();
  };

  const filteredCats = categories.filter(
    (c) => c.type === form.type || c.type === "both",
  );

  const findWallet = (id: string) => wallets.find((w) => w.id === id);
  const findCat = (id: string) => categories.find((c) => c.id === id);

  return (
    <>
      <AppBar title="Transaksi Berulang" showBack />

      <div className="p-4 space-y-3 pb-28">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
            <CalendarClock size={48} className="opacity-30" />
            <p className="text-sm font-medium">Belum ada transaksi berulang</p>
            <p className="text-xs text-center max-w-[200px]">
              Tambahkan pengeluaran atau pemasukan rutin seperti gaji, tagihan, cicilan.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === "income" ? "bg-success/15" : "bg-danger/15"}`}>
                <RefreshCw size={18} className={item.type === "income" ? "text-success" : "text-danger"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-muted">
                  {findCat(item.categoryId)?.name} · {findWallet(item.walletId)?.name}
                </p>
                <p className="text-xs text-text-muted">
                  {FREQ_OPTIONS.find((f) => f.value === item.frequency)?.label} ·{" "}
                  Jatuh tempo:{" "}
                  {new Date(item.nextDueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <p className={`text-sm font-bold mt-0.5 ${item.type === "income" ? "text-success" : "text-danger"}`}>
                  {item.type === "income" ? "+" : "-"}
                  {new Intl.NumberFormat("id-ID").format(item.amount)} {item.currency}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => void handleToggle(item)}
                  className="text-accent-primary active:scale-95 transition-transform"
                >
                  {item.isActive === 1
                    ? <ToggleRight size={28} className="text-accent-primary" />
                    : <ToggleLeft size={28} className="text-text-muted" />}
                </button>
                <button
                  onClick={() => void handleDelete(item.id)}
                  className="p-1.5 rounded-lg active:bg-danger/10 transition-colors"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB-like add button */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-accent-primary text-white rounded-full shadow-fab flex items-center justify-center active:scale-95 transition-transform z-10"
      >
        <Plus size={24} />
      </button>

      {/* Add Recurring Sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Tambah Transaksi Berulang" fullHeight>
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className="p-4 space-y-4 flex-1">
            {/* Name */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Nama</p>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="cth. Cicilan KPR, Gaji bulanan…"
                className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Jenis</p>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setForm((f) => ({ ...f, type: t.value, categoryId: "" }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      form.type === t.value
                        ? "bg-accent-primary text-white"
                        : "bg-bg-card text-text-muted"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Nominal</p>
              <input
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Frekuensi</p>
              <div className="flex gap-2">
                {FREQ_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setForm((prev) => ({ ...prev, frequency: f.value }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      form.frequency === f.value
                        ? "bg-accent-secondary text-white"
                        : "bg-bg-card text-text-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Dompet</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {wallets.filter((w) => !w.isArchived).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setForm((f) => ({ ...f, walletId: w.id }))}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                      form.walletId === w.id
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary"
                        : "bg-bg-card border-transparent text-text-muted"
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Kategori</p>
              <div className="flex gap-2 flex-wrap">
                {filteredCats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setForm((f) => ({ ...f, categoryId: c.id }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      form.categoryId === c.id
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary"
                        : "bg-bg-card border-transparent text-text-muted"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Catatan (opsional)</p>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Tambahkan catatan…"
                className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
            </div>
          </div>

          <div className="p-4 border-t border-bg-surface">
            <button
              onClick={() => void handleSave()}
              className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-fab"
            >
              Simpan
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
