import React from "react";
import { CalendarClock, CheckCircle2, SkipForward } from "lucide-react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import type { RecurringTransactionRow } from "@/shared/hooks/useRecurringTransactions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: RecurringTransactionRow[];
  onConfirmAll: () => Promise<void>;
  onSkipItem: (id: string) => Promise<void>;
  onDismissAll: () => Promise<void>;
}

const FREQ_LABEL: Record<string, string> = {
  harian: "Harian",
  mingguan: "Mingguan",
  bulanan: "Bulanan",
};

export function RecurringDueSheet({ isOpen, onClose, items, onConfirmAll, onSkipItem, onDismissAll }: Props) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Transaksi Berulang Jatuh Tempo">
      <div className="p-4 pb-8 space-y-4">
        <div className="flex items-start gap-3 bg-accent-primary/10 rounded-xl p-3">
          <CalendarClock size={18} className="text-accent-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-primary">
            Ada <strong>{items.length} transaksi berulang</strong> yang jatuh tempo. Buat sekarang?
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-bg-card rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-muted">
                  {FREQ_LABEL[item.frequency] ?? item.frequency} ·{" "}
                  {new Intl.NumberFormat("id-ID").format(item.amount)} {item.currency}
                </p>
              </div>
              <button
                onClick={() => void onSkipItem(item.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-bg-surface text-xs text-text-muted active:scale-95 transition-transform"
              >
                <SkipForward size={12} />
                Lewati
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => void onDismissAll()}
            className="flex-1 py-3 bg-bg-card text-text-muted rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            Lewati Semua
          </button>
          <button
            onClick={() => void onConfirmAll()}
            className="flex-1 py-3 bg-accent-primary text-white rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform shadow-fab flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Buat Semua
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
