import React, { useRef, useState } from "react";
import { Camera, CheckCircle, AlertCircle, Loader2, ImageIcon, CreditCard } from "lucide-react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { ocrService, getMerchantCategoryLabel, type OCRResult } from "@/shared/services/OCRService";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";

export interface OCRConfirmedData {
  amount: number;
  note: string;
  date?: number;
  paymentMethod?: string;
  merchantCategory?: string;
}

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: OCRConfirmedData) => void;
}

type ScanState =
  | { phase: "pick" }
  | { phase: "scanning"; imageUrl: string }
  | {
      phase: "result";
      imageUrl: string;
      result: OCRResult;
      editedAmount: string;
      editedNote: string;
      editedDate: number;
    }
  | { phase: "error"; message: string };

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  GoPay: "#00AED6",
  OVO: "#4C3494",
  Dana: "#108EE9",
  ShopeePay: "#EE4D2D",
  LinkAja: "#E82529",
  Jenius: "#2CADCF",
  QRIS: "#FF4B00",
  Tunai: "#2E7D32",
};

function PaymentBadge({ method }: { method: string }) {
  const color = PAYMENT_METHOD_COLORS[method] ?? "var(--accent-primary)";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      <CreditCard size={9} />
      {method}
    </span>
  );
}

export function OCRScanner({ isOpen, onClose, onConfirm }: OCRScannerProps) {
  const [scanState, setScanState] = useState<ScanState>({ phase: "pick" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setScanState({ phase: "pick" });
    onClose();
  };

  const processFile = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setScanState({ phase: "scanning", imageUrl });
    try {
      const result = await ocrService.recognize(file);
      if (!result.rawText) {
        setScanState({
          phase: "error",
          message: "Tidak bisa membaca struk. Coba foto dengan pencahayaan lebih baik.",
        });
        return;
      }
      const amount = result.total ?? 0;
      const noteParts: string[] = [];
      if (result.merchant) noteParts.push(result.merchant);
      if (result.paymentMethod) noteParts.push(`via ${result.paymentMethod}`);
      const note = noteParts.length > 0 ? noteParts.join(" ") : "Hasil scan struk";
      const date = result.date ?? Date.now();
      setScanState({
        phase: "result",
        imageUrl,
        result,
        editedAmount: amount > 0 ? String(amount) : "",
        editedNote: note,
        editedDate: date,
      });
    } catch {
      setScanState({
        phase: "error",
        message: "Terjadi kesalahan saat memproses gambar. Silakan coba lagi.",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  };

  const handleConfirm = () => {
    if (scanState.phase !== "result") return;
    const raw = scanState.editedAmount.replace(/\./g, "").replace(/,/g, ".");
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount <= 0) return;
    onConfirm({
      amount,
      note: scanState.editedNote,
      date: scanState.editedDate,
      ...(scanState.result.paymentMethod !== null ? { paymentMethod: scanState.result.paymentMethod } : {}),
      ...(scanState.result.merchantCategory !== null ? { merchantCategory: scanState.result.merchantCategory } : {}),
    });
    handleClose();
  };

  const isLowConfidence = scanState.phase === "result" && scanState.result.confidence < 60;

  const title =
    scanState.phase === "scanning"
      ? "Memproses Struk…"
      : scanState.phase === "result"
        ? "Hasil Scan"
        : "Scan Struk";

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={title} fullHeight>
      <div className="p-4 space-y-4 pb-8">
        {scanState.phase === "pick" && (
          <>
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-accent-primary/10 flex items-center justify-center">
                <Camera size={36} className="text-accent-primary" />
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-base font-semibold text-text-primary">Foto Struk Belanja</p>
                <p className="text-sm text-text-muted max-w-xs">
                  Ambil foto struk untuk mengisi otomatis jumlah, toko, tanggal, dan metode pembayaran
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Tunai", "Transfer Bank", "GoPay", "OVO", "Dana", "QRIS"].map((m) => (
                  <PaymentBadge key={m} method={m} />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 bg-accent-primary text-white rounded-2xl p-4 active:scale-[0.98] transition-transform shadow-fab"
              >
                <Camera size={20} />
                <span className="font-semibold">Ambil Foto Sekarang</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 bg-bg-card text-text-primary rounded-2xl p-4 active:scale-[0.98] transition-transform shadow-card"
              >
                <ImageIcon size={20} className="text-text-muted" />
                <span className="font-semibold">Pilih dari Galeri</span>
              </button>
            </div>

            <p className="text-xs text-text-muted text-center">
              Struk diproses di perangkat ini. Tidak ada data yang dikirim ke server.
            </p>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="sr-only" />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
          </>
        )}

        {scanState.phase === "scanning" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            {scanState.imageUrl && (
              <img src={scanState.imageUrl} alt="Struk yang sedang diproses" className="w-full max-h-48 object-contain rounded-xl bg-bg-card" />
            )}
            <div className="flex items-center gap-3 text-accent-primary">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-sm font-medium">Membaca teks dari struk…</p>
            </div>
            <p className="text-xs text-text-muted text-center">Mendeteksi nominal, toko, tanggal, dan metode pembayaran</p>
          </div>
        )}

        {scanState.phase === "result" && (
          <>
            <img src={scanState.imageUrl} alt="Struk" className="w-full max-h-36 object-contain rounded-xl bg-bg-card" />

            {isLowConfidence && (
              <div className="flex items-center gap-2 bg-warning/10 rounded-xl p-3">
                <AlertCircle size={16} className="text-warning flex-shrink-0" />
                <p className="text-xs text-warning font-medium">
                  Kualitas pembacaan rendah ({Math.round(scanState.result.confidence)}%). Periksa kembali data di bawah.
                </p>
              </div>
            )}

            {(scanState.result.paymentMethod !== null || scanState.result.merchantCategory !== null) && (
              <div className="flex flex-wrap items-center gap-2 bg-bg-card rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mr-1">Terdeteksi</p>
                {scanState.result.paymentMethod !== null && (
                  <PaymentBadge method={scanState.result.paymentMethod} />
                )}
                {scanState.result.merchantCategory !== null && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-primary/15 text-accent-primary">
                    {getMerchantCategoryLabel(scanState.result.merchantCategory) ?? scanState.result.merchantCategory}
                  </span>
                )}
                {scanState.result.time !== null && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-surface text-text-muted">
                    {scanState.result.time}
                  </span>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
                  Jumlah Total
                  {scanState.result.total === null && (
                    <span className="px-1.5 py-0.5 bg-warning/20 text-warning rounded text-[10px]">Periksa lagi</span>
                  )}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={scanState.editedAmount}
                  onChange={(e) => setScanState((s) => s.phase === "result" ? { ...s, editedAmount: e.target.value } : s)}
                  placeholder="0"
                  className={cn(
                    "w-full bg-bg-card rounded-xl px-4 py-3 text-lg font-bold text-text-primary placeholder:text-text-muted outline-none focus:ring-2 transition-all",
                    scanState.result.total === null
                      ? "focus:ring-warning/40 ring-1 ring-warning/30"
                      : "focus:ring-accent-primary/40",
                  )}
                />
                {scanState.result.total !== null && (
                  <p className="text-xs text-text-muted">Terdeteksi: {formatCurrency(scanState.result.total, "IDR")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Catatan / Nama Toko
                </label>
                <input
                  type="text"
                  value={scanState.editedNote}
                  onChange={(e) => setScanState((s) => s.phase === "result" ? { ...s, editedNote: e.target.value } : s)}
                  className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
                  placeholder="Nama toko atau catatan…"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setScanState({ phase: "pick" })}
                className="flex-1 py-3.5 bg-bg-card text-text-primary rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Scan Ulang
              </button>
              <button
                onClick={handleConfirm}
                disabled={!scanState.editedAmount || parseFloat(scanState.editedAmount) <= 0}
                className="flex-1 py-3.5 bg-accent-primary text-white rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 shadow-fab"
              >
                <CheckCircle size={16} />
                Gunakan Nilai Ini
              </button>
            </div>
          </>
        )}

        {scanState.phase === "error" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertCircle size={28} className="text-danger" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-text-primary">Scan Gagal</p>
              <p className="text-sm text-text-muted max-w-xs">{scanState.message}</p>
            </div>
            <button
              onClick={() => setScanState({ phase: "pick" })}
              className="px-6 py-3 bg-accent-primary text-white rounded-2xl text-sm font-semibold active:scale-95 transition-transform shadow-fab"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
