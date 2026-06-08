import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  HardDriveDownload,
  Info,
  Lock,
  Table2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAppData } from "@/app/AppDataContext";
import { useAuth } from "@/app/AuthContext";
import { useToast } from "@/shared/hooks/useToast";
import { db } from "@/shared/db/db";
import { encryptJSON, decryptJSON, sha256Hex } from "@/shared/crypto/crypto";
import { cn } from "@/shared/utils/misc";
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

  return [
    `CATKEU/${CATKEU_VERSION}`,
    `encrypted:true`,
    `created:${new Date().toISOString()}`,
    `checksum:${checksum}`,
    CATKEU_HEADER_SEPARATOR,
    encryptedB64,
  ].join("\n");
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
  const get = (k: string) => {
    const line = lines.find((l) => l.startsWith(`${k}:`));
    return line?.slice(k.length + 1) ?? "";
  };

  return {
    header: { version, encrypted: get("encrypted") === "true", created: get("created"), checksum: get("checksum") },
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

// ---- CSV Bank Import -------------------------------------------------------

export interface CsvRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  selected: boolean;
}

type BankFormat = "bca" | "mandiri" | "bni" | "bri" | "generic";

function detectBankFormat(lines: string[]): BankFormat {
  const header = (lines[0] ?? "").toLowerCase();
  if (header.includes("klikbca") || header.includes("bca")) return "bca";
  if (header.includes("mandiri") || header.includes("livin")) return "mandiri";
  if (header.includes("bni") || header.includes("bni46")) return "bni";
  if (header.includes("bri") || header.includes("brimo")) return "bri";
  const allText = lines.slice(0, 5).join(" ").toLowerCase();
  if (allText.includes("bca")) return "bca";
  if (allText.includes("mandiri")) return "mandiri";
  if (allText.includes("bni")) return "bni";
  if (allText.includes("bri")) return "bri";
  return "generic";
}

function parseAmount(raw: string): number {
  if (!raw) return 0;
  const clean = raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : Math.abs(val);
}

function parseDateStr(raw: string): number {
  if (!raw) return Date.now();
  // Try DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
  const parts = raw.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0] ?? "0");
    const p1 = parseInt(parts[1] ?? "0");
    const p2 = parseInt(parts[2] ?? "0");
    if ((parts[2]?.length ?? 0) === 4) {
      // DD/MM/YYYY
      const d = new Date(p2, p1 - 1, p0);
      if (!isNaN(d.getTime())) return d.getTime();
    } else if ((parts[0]?.length ?? 0) === 4) {
      // YYYY-MM-DD
      const d = new Date(p0, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsvBank(text: string): CsvRow[] {
  // Normalize line endings
  const raw = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const format = detectBankFormat(lines);

  // Find data start line (skip bank header rows)
  let dataStartIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const lower = (lines[i] ?? "").toLowerCase();
    // Look for a row with "tanggal" or "date" or "tgl"
    if (lower.includes("tanggal") || lower.includes("date") || lower.includes("tgl") || lower.includes("transaction date")) {
      dataStartIdx = i;
      break;
    }
  }

  const headerLine = lines[dataStartIdx] ?? "";
  const headerCols = splitCsvLine(headerLine).map((c) => c.toLowerCase().trim().replace(/"/g, ""));

  // Map columns by name
  const findCol = (keywords: string[]): number =>
    headerCols.findIndex((h) => keywords.some((kw) => h.includes(kw)));

  const dateCol = findCol(["tanggal", "date", "tgl", "transaction date"]);
  const descCol = findCol(["keterangan", "description", "uraian", "deskripsi", "remark", "narasi"]);
  const debitCol = findCol(["debet", "debit", "db", "pengeluaran", "keluar"]);
  const creditCol = findCol(["kredit", "credit", "cr", "pemasukan", "masuk"]);
  const mutCol = findCol(["mutasi", "mutation", "nominal", "jumlah", "amount"]);

  const rows: CsvRow[] = [];

  for (let i = dataStartIdx + 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i] ?? "");
    if (cols.length < 2) continue;

    const dateRaw = dateCol >= 0 ? (cols[dateCol] ?? "") : (cols[0] ?? "");
    const desc = descCol >= 0 ? (cols[descCol] ?? "") : (cols[1] ?? "");

    // Skip summary rows
    if (desc.toLowerCase().includes("total") || desc.toLowerCase().includes("saldo awal") || desc.toLowerCase().includes("saldo akhir")) continue;

    let debit = 0;
    let credit = 0;

    if (debitCol >= 0 && creditCol >= 0) {
      debit = parseAmount(cols[debitCol] ?? "");
      credit = parseAmount(cols[creditCol] ?? "");
    } else if (mutCol >= 0) {
      // Single amount column — check type column
      const typeColIdx = findCol(["jenis", "type", "db/cr", "cr/db", "kode"]);
      const typeVal = typeColIdx >= 0 ? (cols[typeColIdx] ?? "").toUpperCase() : "";
      const amount = parseAmount(cols[mutCol] ?? "");
      if (typeVal.includes("K") || typeVal.includes("CR") || typeVal.includes("C")) {
        credit = amount;
      } else if (typeVal.includes("D") || typeVal.includes("DB")) {
        debit = amount;
      } else {
        // Guess based on format
        if (format === "bca") {
          credit = amount; // BCA export: positive = credit by default unless separate cols
        } else {
          debit = amount;
        }
      }
    } else if (cols.length >= 3) {
      // Fallback: col 2 = debit, col 3 = credit
      debit = parseAmount(cols[2] ?? "");
      credit = cols.length >= 4 ? parseAmount(cols[3] ?? "") : 0;
    }

    if (debit === 0 && credit === 0) continue;
    if (!dateRaw.match(/\d/)) continue;

    const dateTs = parseDateStr(dateRaw.replace(/"/g, "").trim());
    const cleanDesc = desc.replace(/"/g, "").trim();

    rows.push({
      date: new Date(dateTs).toLocaleDateString("id-ID"),
      description: cleanDesc || "(tanpa keterangan)",
      debit,
      credit,
      selected: true,
    });
  }

  return rows;
}

// ---- Component -------------------------------------------------------------

export function BackupPage() {
  const { wallets, transactions, categories, budgets, reminders,
    addWallet, addTransaction, addCategory, addBudget, addReminder, reload } = useAppData();
  const { state } = useAuth();
  const { showToast } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    preview: ImportPreview;
    payload: BackupPayload;
  } | null>(null);

  // CSV bank import state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvWalletId, setCsvWalletId] = useState("");
  const [csvSheetOpen, setCsvSheetOpen] = useState(false);

  const cryptoKey = state.status === "unlocked" ? state.cryptoKey : null;

  // ---- .catkeu export -------------------------------------------------------
  const handleExport = async () => {
    if (!cryptoKey) { showToast("Kamu harus masuk terlebih dahulu", "error"); return; }
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

  // ---- CSV export -----------------------------------------------------------
  const handleExportCSV = () => {
    const findWallet = (id: string) => wallets.find((w) => w.id === id);
    const findCat = (id: string) => categories.find((c) => c.id === id);
    const escapeCSV = (v: string): string =>
      v.includes(",") || v.includes('"') || v.includes("\n")
        ? `"${v.replace(/"/g, '""')}"`
        : v;

    const headers = ["Tanggal", "Jenis", "Jumlah", "Mata Uang", "Kategori", "Dompet", "Tujuan", "Catatan", "Tag"];
    const rows = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString("id-ID"),
      tx.type,
      String(tx.amount),
      tx.currency ?? "",
      findCat(tx.categoryId)?.name ?? "",
      findWallet(tx.walletId)?.name ?? "",
      tx.toWalletId !== undefined ? (findWallet(tx.toWalletId)?.name ?? "") : "",
      tx.note ?? "",
      (tx.tags ?? []).join("|"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url;
    a.download = `catatan-keuangan-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${transactions.length} transaksi berhasil diekspor ke CSV`, "success");
  };

  // ---- .catkeu import -------------------------------------------------------
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!cryptoKey) { showToast("Kamu harus masuk terlebih dahulu", "error"); return; }

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
      for (const w of payload.wallets ?? []) { await addWallet({ ...w }); imported++; }
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
        await addBudget({ categoryId: b.categoryId, amount: b.amount, currency: b.currency, period: b.period, notifyAt: b.notifyAt });
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

  // ---- CSV bank import ------------------------------------------------------
  const handleCsvBankFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCsvBank(text);
      if (rows.length === 0) {
        showToast("Tidak ada transaksi yang dapat dibaca dari file CSV ini.", "error");
        return;
      }
      setCsvRows(rows);
      setCsvWalletId(wallets.find((w) => !w.isArchived)?.id ?? "");
      setCsvSheetOpen(true);
    } catch {
      showToast("Gagal membaca file CSV", "error");
    } finally {
      if (csvFileRef.current) csvFileRef.current.value = "";
    }
  };

  const handleConfirmCsvImport = async () => {
    if (!csvWalletId) { showToast("Pilih dompet tujuan", "error"); return; }
    const activeWallet = wallets.find((w) => w.id === csvWalletId);
    const currency = activeWallet?.currency ?? "IDR";

    // Find "Lainnya" category fallback
    const fallbackCat = categories.find((c) => c.name === "Lainnya" && c.type === "expense") ?? categories[0];
    const incomeFallbackCat = categories.find((c) => c.name === "Lainnya" && c.type === "income") ?? categories.find((c) => c.type === "income") ?? fallbackCat;

    const selected = csvRows.filter((r) => r.selected);
    let count = 0;
    for (const row of selected) {
      if (row.debit > 0) {
        await addTransaction({
          type: "expense",
          amount: row.debit,
          currency,
          walletId: csvWalletId,
          categoryId: fallbackCat?.id ?? "",
          date: new Date(row.date.split("/").reverse().join("-")).getTime() || Date.now(),
          note: row.description,
        });
        count++;
      }
      if (row.credit > 0) {
        await addTransaction({
          type: "income",
          amount: row.credit,
          currency,
          walletId: csvWalletId,
          categoryId: incomeFallbackCat?.id ?? "",
          date: new Date(row.date.split("/").reverse().join("-")).getTime() || Date.now(),
          note: row.description,
        });
        count++;
      }
    }

    showToast(`${count} transaksi berhasil diimpor dari CSV Bank`, "success");
    setCsvSheetOpen(false);
    setCsvRows([]);
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

  const selectedCsvCount = csvRows.filter((r) => r.selected).length;

  return (
    <>
      <AppBar title="Backup & Restore" showBack />

      <div className="p-4 space-y-4 pb-28">
        {/* Summary */}
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

        {/* Ekspor */}
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
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="w-full flex items-center gap-4 bg-bg-card rounded-xl p-4 shadow-card active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-primary/15 flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-accent-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-text-primary">Ekspor ke CSV</p>
              <p className="text-xs text-text-muted">Kompatibel dengan Excel & Google Sheets</p>
            </div>
          </button>
        </div>

        {/* Impor .catkeu */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-1">Impor Data</p>
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
                {importing ? "Membaca File…" : "Impor dari File .catkeu"}
              </p>
              <p className="text-xs text-text-muted">Pulihkan data dari backup terenkripsi</p>
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

        {/* Impor CSV Bank */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-1">Impor dari Bank</p>
          <label className="w-full flex items-center gap-4 bg-bg-card rounded-xl p-4 shadow-card cursor-pointer active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-accent-warm/20 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-accent-warm" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-text-primary">Impor CSV Bank</p>
              <p className="text-xs text-text-muted">BCA, Mandiri, BNI, BRI, atau format umum</p>
            </div>
            <Table2 size={14} className="text-text-muted flex-shrink-0" />
            <input
              ref={csvFileRef}
              type="file"
              accept=".csv,.xls,.xlsx,text/csv"
              onChange={(e) => void handleCsvBankFile(e)}
              className="sr-only"
            />
          </label>
          <div className="bg-bg-surface rounded-xl p-3 text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text-primary flex items-center gap-1.5">
              <Info size={12} className="text-accent-primary" /> Format yang didukung:
            </p>
            <p>• BCA — ekspor mutasi dari KlikBCA / m-BCA</p>
            <p>• Mandiri — ekspor mutasi dari Livin' by Mandiri</p>
            <p>• BNI — ekspor mutasi dari BNI Mobile Banking</p>
            <p>• BRI — ekspor mutasi dari BRImo</p>
            <p>• Format umum: kolom Tanggal, Keterangan, Debet, Kredit</p>
          </div>
        </div>

        {/* Berbahaya */}
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
          <p>• Impor .catkeu akan menggantikan semua data yang ada</p>
          <p>• Impor CSV Bank menambahkan transaksi, tidak mengganti data</p>
          <p>• Direkomendasikan: backup rutin setiap bulan</p>
        </div>
      </div>

      {/* Clear confirm sheet */}
      <BottomSheet isOpen={clearConfirm} onClose={() => setClearConfirm(false)} title="Hapus Semua Data?">
        <div className="p-4 pb-8 space-y-4">
          <div className="flex gap-3 bg-danger/10 rounded-xl p-3">
            <AlertTriangle size={20} className="text-danger flex-shrink-0" />
            <p className="text-sm text-text-primary">
              Semua data termasuk {wallets.length} dompet, {transactions.length} transaksi, dan semua kategori akan dihapus permanen. Tindakan ini <strong>tidak bisa dibatalkan</strong>.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setClearConfirm(false)} className="flex-1 py-3 bg-bg-card text-text-primary rounded-xl text-sm font-semibold">
              Batal
            </button>
            <button onClick={() => void handleClearAll()} className="flex-1 py-3 bg-danger text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform">
              Hapus Permanen
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* .catkeu import preview */}
      {importPreview !== null && (
        <BottomSheet isOpen={importPreview !== null} onClose={() => setImportPreview(null)} title="Pratinjau Impor">
          <div className="p-4 pb-8 space-y-4">
            <div className="bg-accent-primary/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-accent-primary">Detail File Backup</p>
              <p className="text-xs text-text-muted">
                Diekspor:{" "}
                {new Date(importPreview.preview.exportedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
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
                Ini akan <strong>menggantikan semua data yang ada</strong>. Lanjutkan?
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setImportPreview(null)} className="flex-1 py-3 bg-bg-card text-text-primary rounded-xl text-sm font-semibold">
                Batal
              </button>
              <button onClick={() => void handleConfirmImport(importPreview.payload)} className="flex-1 py-3 bg-accent-primary text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-fab">
                Ya, Impor
              </button>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* CSV Bank import preview sheet */}
      <BottomSheet isOpen={csvSheetOpen} onClose={() => setCsvSheetOpen(false)} title="Pratinjau Impor CSV Bank" fullHeight>
        <div className="flex flex-col h-full">
          {/* Wallet selector */}
          <div className="px-4 py-3 border-b border-bg-surface space-y-2">
            <p className="text-xs font-semibold text-text-muted">Masukkan ke Dompet</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {wallets.filter((w) => !w.isArchived).map((w) => (
                <button
                  key={w.id}
                  onClick={() => setCsvWalletId(w.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                    csvWalletId === w.id
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : "border-bg-card bg-bg-card text-text-muted",
                  )}
                >
                  {w.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted">
              {selectedCsvCount} dari {csvRows.length} baris dipilih — klik baris untuk hapus dari daftar
            </p>
          </div>

          {/* Row list */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {csvRows.map((row, idx) => (
              <div
                key={idx}
                onClick={() => setCsvRows((prev) => prev.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r))}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-b border-bg-card cursor-pointer transition-colors",
                  row.selected ? "bg-bg-page" : "bg-bg-card/40 opacity-50",
                )}
              >
                <div className="flex-shrink-0 text-accent-primary">
                  {row.selected ? <CheckCircle2 size={18} /> : <X size={18} className="text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{row.description}</p>
                  <p className="text-xs text-text-muted">{row.date}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  {row.debit > 0 && (
                    <p className="text-xs font-semibold text-danger">
                      -{new Intl.NumberFormat("id-ID").format(row.debit)}
                    </p>
                  )}
                  {row.credit > 0 && (
                    <p className="text-xs font-semibold text-success">
                      +{new Intl.NumberFormat("id-ID").format(row.credit)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Import button */}
          <div className="p-4 border-t border-bg-surface">
            <button
              onClick={() => void handleConfirmCsvImport()}
              disabled={selectedCsvCount === 0 || !csvWalletId}
              className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform shadow-fab"
            >
              Impor {selectedCsvCount} Transaksi
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
