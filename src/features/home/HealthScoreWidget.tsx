import React, { useMemo, useState } from "react";
import { Activity, ChevronDown, ChevronUp, PenLine } from "lucide-react";
import { useAppData } from "@/app/AppDataContext";
import { computeHealthScore } from "@/shared/utils/healthScore";
import { cn } from "@/shared/utils/misc";

const SCORE_COLOR: Record<string, string> = {
  "Sangat Baik": "text-success",
  Baik: "text-accent-primary",
  Cukup: "text-warning",
  "Perlu Perhatian": "text-danger",
};

const SCORE_BG: Record<string, string> = {
  "Sangat Baik": "bg-success/10",
  Baik: "bg-accent-primary/10",
  Cukup: "bg-warning/10",
  "Perlu Perhatian": "bg-danger/10",
};

const SCORE_BAR: Record<string, string> = {
  "Sangat Baik": "bg-success",
  Baik: "bg-accent-primary",
  Cukup: "bg-warning",
  "Perlu Perhatian": "bg-danger",
};

export function HealthScoreWidget() {
  const { transactions, budgets, categories } = useAppData();
  const [expanded, setExpanded] = useState(false);

  const health = useMemo(
    () => computeHealthScore(transactions, budgets, categories),
    [transactions, budgets, categories],
  );

  // No transactions yet — show a gentle prompt, NOT a misleading score
  if (!health.hasData) {
    return (
      <section className="px-4">
        <div className="flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3.5 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
            <Activity size={18} className="text-accent-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-muted">Skor Kesehatan Keuangan</p>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              Catat transaksi pertama Anda untuk mulai memantau skor kesehatan keuangan.
            </p>
          </div>
          <PenLine size={15} className="text-text-muted flex-shrink-0" />
        </div>
      </section>
    );
  }

  const color = SCORE_COLOR[health.label] ?? "text-text-muted";
  const bg = SCORE_BG[health.label] ?? "bg-bg-card";
  const bar = SCORE_BAR[health.label] ?? "bg-accent-primary";

  const breakdown = [
    { label: "Tabungan", value: health.savingsScore, max: 30 },
    { label: "Anggaran", value: health.budgetScore, max: 30 },
    { label: "Frekuensi Catat", value: health.frequencyScore, max: 20 },
    { label: "Keragaman Kategori", value: health.diversityScore, max: 20 },
  ];

  return (
    <section className="px-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 shadow-card transition-all active:scale-[0.98]",
          bg,
        )}
        aria-expanded={expanded}
        aria-label={`Skor Kesehatan Keuangan: ${health.score} dari 100 — ${health.label}`}
      >
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
          <Activity size={18} className={color} />
        </div>
        <div className="flex-1 text-left space-y-1">
          <p className="text-xs font-semibold text-text-muted">Skor Kesehatan</p>
          <div className="flex items-center gap-2">
            <p className={cn("text-xl font-bold font-display", color)}>{health.score}</p>
            <span className="text-[10px] text-text-muted">/100</span>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", bg, color)}>
              {health.label}
            </span>
          </div>
          <div className="h-1.5 bg-bg-page rounded-full overflow-hidden w-full">
            <div
              className={cn("h-full rounded-full transition-all duration-500", bar)}
              style={{ width: `${health.score}%` }}
            />
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-text-muted flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 bg-bg-card rounded-2xl px-4 py-3 shadow-card space-y-2.5 text-xs">
          {breakdown.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-text-muted">
                <span>{item.label}</span>
                <span className="font-mono font-semibold text-text-primary">
                  {item.value}/{item.max}
                </span>
              </div>
              <div className="h-1.5 bg-bg-page rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", bar)}
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-text-muted pt-1 leading-relaxed">
            Skor dihitung dari tingkat tabungan, kepatuhan anggaran, frekuensi pencatatan, dan
            keragaman kategori dalam 30 hari terakhir.
            {budgets.length === 0 && (
              <span className="block mt-1 text-warning">
                Buat anggaran untuk mendapatkan skor lebih akurat.
              </span>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
