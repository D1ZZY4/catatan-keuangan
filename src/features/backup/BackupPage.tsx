import React, { useRef, useState } from "react";
import { AlertTriangle, Download, HardDriveDownload, Info, Lock, Trash2, Upload } from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAppData } from "@/app/AppDataContext";
import { useAuth } from "@/app/AuthContext";
import { useToast } from "@/shared/hooks/useToast";
import { db } from "@/shared/db/db";
import { encryptJSON, decryptJSON, toBase64, sha256Hex } from "@/shared/crypto/crypto";
import type { Budget, Category, Reminder, Transaction, Wallet } from "@/shared/types";

const CATKEU_VERSION = "1.0";
const CATKEU_HEADER_SEPARATOR = "---";

interface BackupPayload {
  version: string;
  exportedAt: string;
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  reminders: Reminder[];
}

interface ParsedHeader {
  version: string;
  encrypted: boolean;
  created: string;
  checksum: string;
}

async function buildCatkeuFile(payload: BackupPayload, key: CryptoKey): Promise<string> {
  const plaintext = JSON.stringify(payload);
  const checksum = await sha256Hex(plaintext);
  const { iv, blob } = await encryptJSON(key, payload);
  const encryptedB64 = `${iv}:${blob}`;

  const header = [
    `CATKEU/${CATKEU_VERSION}`,
    `encrypted:true`,
    `created:${new Date().toISOString()}`,
    `checksum:${checksum}`,
    CATKEU_HEADER_SEPARATOR,
    encryptedB64,
  ].join("\n");

  return header;
}

function parseCatkeuHeader(content: string): { header: ParsedHeader; body: string } | null {
  const sepIdx = content.indexOf(`\n${CATKEU_HEADER_SEPARATOR}\n`);
  if (sepIdx === -1) return null;

  const headerBlock = content.slice(0, sepIdx);
  const body = content.slice(sepIdx + CATKEU_HEADER_SEPARATOR.length + 2);

  const lines = headerBlock.split("\n");
  const firstLine = lines[0] ?? "";
  if (!firstLine.startsWith("CATKEU/")) return null;

  const version = firstLine.replace("CATKEU/", "");
  const get = (key: string) => {
    const line = lines.find((l) => l.startsWith(`${key}:`));
    return line?.slice(key.length + 1) ?? "";
  };

  return {
    header: {
      version,
      encrypted: get("encrypted") === "true",
      created: get("created"),
      checksum: get("checksum"),
    },
    body,
  };
}

async function decryptCatkeuBody(body: string, key: CryptoKey): Promise<BackupPayload | null> {
  try {
    const colonIdx = body.indexOf(":");
    if (colonIdx === -1) return null;
    const iv = body.slice(0, colonIdx);
    const blob = body.slice(colonIdx + 1).trim();
    return await decryptJSON<BackupPayload>(key, { iv, blob });
  } catch {
    return null;
  }
}

interface ImportPreview {
  exportedAt: string;
  wallets: number;
  transactions: number;
  categories: number;
  budgets: number;
  reminders: number;
}

export function BackupPage() {
  const { wallets, transactions, categories, budgets, reminders,
    addWallet, addTransaction, addCategory, addBudget, addReminder, reload } = useAppData();
  const { state } = useAuth();
  const { showToast } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    preview: ImportPreview;
    payload: BackupPayload;
  } | null>(null);

  const cryptoKey = state.status === "unlocked" ? state.cryptoKey : null;

  const handleExport = async () => {
    if (!cryptoKey) {
      showToast("Kamu harus masuk terlebih dahulu untuk mengekspor", "error");
      return;
    }

    const payload: BackupPayload = {
      version: CATKEU_VERSION,
      exportedAt: new Date().toISOString(),
      wallets,
      transactions,
      categories: categories.filter((c) => !c.isDefault),
      budgets,
      reminders,
    };

    try {
      const fileContent = await buildCatkeuFile(payload, cryptoKey);
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      a.href = url;
      a.download = `catatan-keuangan-${dateStr}.catkeu`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Berhasil mengekspor ${transactions.length} transaksi (terenkripsi)`, "success");
    } catch {
      showToast("Gagal mengekspor data. Coba lagi.", "error");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!cryptoKey) {
      showToast("Kamu harus masuk terlebih dahulu untuk mengimpor", "error");
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = parseCatkeuHeader(text);

      if (!parsed) {
        showToast("File tidak dikenali. Pastikan file berekstensi .catkeu yang valid.", "error");
        return;
      }

      const payload = await decryptCatkeuBody(parsed.body, cryptoKey);
      if (!payload) {
        showToast("File tidak bisa dibuka. Pastikan PIN kamu benar dan file tidak rusak.", "error");
        return;
      }

      setImportPreview({
        preview: {
          exportedAt: parsed.header.created,
          wallets: payload.wallets?.length ?? 0,
          transactions: payload.transactions?.length ?? 0,
          categories: payload.categories?.length ?? 0,
          budgets: payload.budgets?.length ?? 0,
          reminders: payload.reminders?.length ?? 0,
        },
        payload,
      });
    } catch {
      showToast("Gagal membaca file. Pastikan file tidak rusak.", "error");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleConfirmImport = async (payload: BackupPayload) => {
    try {
      await db.wallets.clear();
      await db.transactions.clear();
      await db.categories.clear();
      await db.budgets.clear();
      await db.reminders.clear();

      let imported = 0;
      for (const w of payload.wallets ?? []) {
        await addWallet({ ...w });
        imported++;
      }
      for (const c of payload.categories ?? []) {
        await addCategory({ name: c.name, icon: c.icon, color: c.color, type: c.type });
        imported++;
      }
      for (const tx of payload.transactions ?? []) {
        await addTransaction({
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          walletId: tx.walletId,
          categoryId: tx.categoryId,
          date: tx.date,
          ...(tx.note !== undefined ? { note: tx.note } : {}),
          ...(tx.toWalletId !== undefined ? { toWalletId: tx.toWalletId } : {}),
          ...(tx.linkedPersonName !== undefined ? { linkedPersonName: tx.linkedPersonName } : {}),
        });
        imported++;
      }
      for (const b of payload.budgets ?? []) {
        await addBudget({
          categoryId: b.categoryId,
          amount: b.amount,
          currency: b.currency,
          period: b.period,
          notifyAt: b.notifyAt,
        });
      }
      for (const r of payload.reminders ?? []) {
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

      await reload();
      showToast(`Berhasil mengimpor ${imported} item`, "success");
      setImportPreview(null);
    } catch {
      showToast("Gagal mengimpor file. Coba lagi.", "error");
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
            onClick={() => void handleExport()}
            disabled={wallets.length === 0 && transactions.length === 0}
            className="w-full flex items-center gap-4 bg-bg-card rounded-xl p-4 shadow-card active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
              <Download size={20} className="text-success" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-text-primary">Ekspor Semua Data</p>
              <p className="text-xs text-text-muted">Simpan sebagai file .catkeu terenkripsi</p>
            </div>
            <Lock size={14} className="text-text-muted flex-shrink-0" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-1">Impor</p>
          <label
            className={`w-full flex items-center gap-4 bg-bg-card rounded-xl p-4 shadow-card ${
              importing ? "opacity-50" : "cursor-pointer active:scale-[0.98] transition-transform"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-accent-primary/15 flex items-center justify-center flex-shrink-0">
              {importing ? (
                <HardDriveDownload size={20} className="text-accent-primary animate-pulse" />
              ) : (
                <Upload size={20} className="text-accent-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">
                {importing ? "Membaca File…" : "Impor dari File"}
              </p>
              <p className="text-xs text-text-muted">Pilih file .catkeu untuk memulihkan data</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".catkeu"
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
          <div className="flex items-center gap-1.5 mb-2">
            <Info size={14} className="text-accent-primary flex-shrink-0" />
            <p className="font-semibold text-text-primary">Tentang Backup</p>
          </div>
          <p>• File .catkeu dienkripsi dengan kunci dari PIN kamu</p>
          <p>• Impor akan menggantikan semua data yang ada</p>
          <p>• Gunakan PIN yang sama untuk membuka file backup</p>
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
          <p className="text-sm text-text-muted text-center">
            Pastikan kamu sudah melakukan ekspor backup sebelum menghapus.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setClearConfirm(false)}
              className="flex-1 py-3 bg-bg-card text-text-primary rounded-xl text-sm font-semibold"
            >
              Batal
            </button>
            <button
              onClick={() => void handleClearAll()}
              className="flex-1 py-3 bg-danger text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      </BottomSheet>

      {importPreview !== null && (
        <BottomSheet
          isOpen={importPreview !== null}
          onClose={() => setImportPreview(null)}
          title="Pratinjau Impor"
        >
          <div className="p-4 pb-8 space-y-4">
            <div className="bg-accent-primary/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-accent-primary">Detail File Backup</p>
              <p className="text-xs text-text-muted">
                Diekspor:{" "}
                {new Date(importPreview.preview.exportedAt).toLocaleDateString("id-ID", {
                  dateStyle: "long",
                })}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: "Dompet", count: importPreview.preview.wallets },
                  { label: "Transaksi", count: importPreview.preview.transactions },
                  { label: "Kategori", count: importPreview.preview.categories },
                  { label: "Anggaran", count: importPreview.preview.budgets },
                  { label: "Pengingat", count: importPreview.preview.reminders },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-bg-surface rounded-lg p-2">
                    <p className="text-base font-bold text-text-primary">{s.count}</p>
                    <p className="text-[10px] text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 bg-warning/10 rounded-xl p-3">
              <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-primary">
                Ini akan <strong>menggantikan semua data yang ada</strong> dengan data dari file ini. Lanjutkan?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setImportPreview(null)}
                className="flex-1 py-3 bg-bg-card text-text-primary rounded-xl text-sm font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => void handleConfirmImport(importPreview.payload)}
                className="flex-1 py-3 bg-accent-primary text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-fab"
              >
                Ya, Impor
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
