import React, { useRef, useState } from "react";
import { AlertTriangle, Download, HardDriveDownload, Trash2, Upload } from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAppData } from "@/app/AppDataContext";
import { useToast } from "@/shared/hooks/useToast";
import { formatDate } from "@/shared/utils/format";
import { db } from "@/shared/db/db";
import type { Budget, Category, Reminder, Transaction, Wallet } from "@/shared/types";

interface BackupData {
  version: 1;
  exportedAt: number;
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  reminders: Reminder[];
}

export function BackupPage() {
  const { wallets, transactions, categories, budgets, reminders,
    addWallet, addTransaction, addCategory, addBudget, addReminder, reload } = useAppData();
  const { showToast } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleExport = () => {
    const data: BackupData = {
      version: 1,
      exportedAt: Date.now(),
      wallets,
      transactions,
      categories: categories.filter((c) => !c.isDefault),
      budgets,
      reminders,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `catatan-keuangan-${dateStr}.catkeu`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Berhasil mengekspor ${transactions.length} transaksi`, "success");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;

      if (
        typeof data !== "object" ||
        data === null ||
        (data as Record<string, unknown>)["version"] !== 1
      ) {
        showToast("File backup tidak valid atau versi tidak cocok", "error");
        return;
      }

      const backup = data as BackupData;
      let imported = 0;

      for (const w of backup.wallets ?? []) {
        await addWallet({ ...w });
        imported++;
      }
      for (const c of backup.categories ?? []) {
        await addCategory({ name: c.name, icon: c.icon, color: c.color, type: c.type });
        imported++;
      }
      for (const tx of backup.transactions ?? []) {
        await addTransaction({
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          walletId: tx.walletId,
          categoryId: tx.categoryId,
          date: tx.date,
          ...(tx.note !== undefined ? { note: tx.note } : {}),
          ...(tx.toWalletId !== undefined ? { toWalletId: tx.toWalletId } : {}),
        });
        imported++;
      }
      for (const b of backup.budgets ?? []) {
        await addBudget({
          categoryId: b.categoryId,
          amount: b.amount,
          currency: b.currency,
          period: b.period,
          notifyAt: b.notifyAt,
        });
      }
      for (const r of backup.reminders ?? []) {
        await addReminder({
          name: r.name,
          ...(r.amount !== undefined ? { amount: r.amount } : {}),
          currency: r.currency,
          dueDay: r.dueDay,
          period: r.period,
          category: r.category ?? "",
          notifyDaysBefore: r.notifyDaysBefore,
          isActive: r.isActive,
        });
      }

      showToast(`Berhasil mengimpor ${imported} item`, "success");
    } catch {
      showToast("Gagal mengimpor file. Pastikan file tidak rusak.", "error");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleClearAll = async () => {
    try {
      await db.wallets.clear();
      await db.transactions.clear();
      await db.categories.clear();
      await db.budgets.clear();
      await db.reminders.clear();
      await reload();
      showToast("Semua data berhasil dihapus", "success");
      setClearConfirm(false);
    } catch {
      showToast("Gagal menghapus data", "error");
    }
  };

  const stats = [
    { label: "Dompet", count: wallets.length },
    { label: "Transaksi", count: transactions.length },
    { label: "Kategori", count: categories.filter((c) => !c.isDefault).length },
    { label: "Anggaran", count: budgets.length },
    { label: "Pengingat", count: reminders.length },
  ];

  return (
    <>
      <AppBar title="Backup & Restore" showBack />

      <div className="p-4 space-y-4">
        <div className="bg-bg-card rounded-xl p-4 shadow-card space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Data Tersimpan</p>
          <div className="grid grid-cols-5 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold text-text-primary">{s.count}</p>
                <p className="text-[10px] text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-1">Ekspor</p>
          <button
            onClick={handleExport}
            disabled={wallets.length === 0 && transactions.length === 0}
            className="w-full flex items-center gap-4 bg-bg-card rounded-xl p-4 shadow-card active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
              <Download size={20} className="text-success" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Ekspor Semua Data</p>
              <p className="text-xs text-text-muted">Simpan sebagai file .catkeu ke perangkat</p>
            </div>
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-1">Impor</p>
          <label className={`w-full flex items-center gap-4 bg-bg-card rounded-xl p-4 shadow-card ${importing ? "opacity-50" : "cursor-pointer active:scale-[0.98] transition-transform"}`}>
            <div className="w-10 h-10 rounded-xl bg-accent-primary/15 flex items-center justify-center flex-shrink-0">
              {importing ? (
                <HardDriveDownload size={20} className="text-accent-primary animate-pulse" />
              ) : (
                <Upload size={20} className="text-accent-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">
                {importing ? "Mengimpor…" : "Impor dari File"}
              </p>
              <p className="text-xs text-text-muted">Pilih file .catkeu untuk memulihkan data</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".catkeu,application/json"
              onChange={(e) => void handleImportFile(e)}
              className="sr-only"
              disabled={importing}
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-1">Berbahaya</p>
          <button
            onClick={() => setClearConfirm(true)}
            className="w-full flex items-center gap-4 bg-danger/5 border border-danger/20 rounded-xl p-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center flex-shrink-0">
              <Trash2 size={20} className="text-danger" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-danger">Hapus Semua Data</p>
              <p className="text-xs text-text-muted">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </button>
        </div>

        <div className="bg-bg-card rounded-xl p-4 text-xs text-text-muted space-y-1.5">
          <p className="font-semibold text-text-primary">ℹ️ Tentang Backup</p>
          <p>• File .catkeu berisi semua data kamu dalam format JSON</p>
          <p>• Data tidak dienkripsi di dalam file — simpan dengan aman</p>
          <p>• Impor akan menambah data, bukan menggantikan yang ada</p>
          <p>• Direkomendasikan: backup rutin setiap bulan</p>
        </div>
      </div>

      <BottomSheet isOpen={clearConfirm} onClose={() => setClearConfirm(false)} title="Hapus Semua Data?">
        <div className="p-4 pb-8 space-y-4">
          <div className="flex gap-3 bg-danger/10 rounded-xl p-3">
            <AlertTriangle size={20} className="text-danger flex-shrink-0" />
            <p className="text-sm text-text-primary">
              Semua data — termasuk {wallets.length} dompet, {transactions.length} transaksi, dan semua kategori — akan dihapus permanen. Tindakan ini <strong>tidak bisa dibatalkan</strong>.
            </p>
          </div>
          <p className="text-sm text-text-muted text-center">Pastikan kamu sudah melakukan ekspor backup sebelum menghapus.</p>
          <div className="flex gap-3">
            <button onClick={() => setClearConfirm(false)}
              className="flex-1 py-3 bg-bg-card text-text-primary rounded-xl text-sm font-semibold">
              Batal
            </button>
            <button onClick={() => void handleClearAll()}
              className="flex-1 py-3 bg-danger text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform">
              Hapus Permanen
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
