import React, { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";

interface NetWorthHeroProps {
  userName: string;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

const MORNING_GREETS = [
  "Selamat pagi",
  "Pagi yang cerah",
  "Hai, selamat pagi",
  "Semangat pagi",
];
const AFTERNOON_GREETS = [
  "Selamat siang",
  "Hai, selamat siang",
  "Siang yang produktif",
  "Halo",
];
const EVENING_GREETS = [
  "Selamat sore",
  "Sore yang menyenangkan",
  "Hai, selamat sore",
  "Sore hari",
];
const NIGHT_GREETS = [
  "Selamat malam",
  "Malam yang tenang",
  "Hai, selamat malam",
  "Istirahat yang baik",
];

const MORNING_SUBS = [
  "Yuk mulai hari dengan mencatat keuangan.",
  "Semoga harimu produktif dan menyenangkan!",
  "Pagi ini, pantau saldo dompetmu.",
  "Hari baru, semangat baru!",
  "Catat setiap rupiah, raih tujuan finansialmu.",
];
const AFTERNOON_SUBS = [
  "Sudah catat pengeluaran pagi ini?",
  "Jangan lupa catat transaksi siang ini.",
  "Pantau keuanganmu setiap hari.",
  "Satu catatan kecil, manfaat besar.",
  "Cek saldo sebelum belanja.",
];
const EVENING_SUBS = [
  "Waktunya rekap pengeluaran hari ini.",
  "Cek anggaran sebelum belanja sore.",
  "Pantau saldo dompetmu sore ini.",
  "Berapa yang sudah dikeluarkan hari ini?",
  "Sebentar lagi malam, rekap harimu.",
];
const NIGHT_SUBS = [
  "Sudah catat semua transaksi hari ini?",
  "Rekap keuangan harian sebelum istirahat.",
  "Pastikan semua pengeluaran sudah tercatat.",
  "Tutup hari dengan catatan yang lengkap.",
  "Istirahat tenang setelah keuangan tercatat.",
];

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length] as T;
}

function getSmartGreeting(
  name: string,
  now: Date,
): { prefix: string; sub: string } {
  const hour = now.getHours();
  const day = now.getDay();
  const date = now.getDate();
  const seed = Math.floor(Date.now() / (1000 * 60 * 20));

  const isFirstOfMonth = date === 1;
  const isLastDays = date >= 25;
  const isWeekend = day === 0 || day === 6;
  const isMonday = day === 1;

  let prefixPool: string[];
  let subPool: string[];

  if (hour >= 4 && hour < 11) {
    prefixPool = MORNING_GREETS;
    subPool = MORNING_SUBS;
  } else if (hour >= 11 && hour < 15) {
    prefixPool = AFTERNOON_GREETS;
    subPool = AFTERNOON_SUBS;
  } else if (hour >= 15 && hour < 19) {
    prefixPool = EVENING_GREETS;
    subPool = EVENING_SUBS;
  } else {
    prefixPool = NIGHT_GREETS;
    subPool = NIGHT_SUBS;
  }

  const prefix = pickRandom(prefixPool, seed);

  let contextSubs: string[] = [];
  if (isFirstOfMonth) {
    contextSubs = [
      "Selamat datang di bulan baru! Waktunya merencanakan anggaran.",
      "Awal bulan, saatnya atur keuangan dengan bijak.",
    ];
  } else if (isLastDays) {
    contextSubs = [
      "Hampir akhir bulan, pantau sisa anggaranmu.",
      "Beberapa hari lagi akhir bulan, cek pengeluaranmu.",
    ];
  } else if (isMonday) {
    contextSubs = [
      "Semangat memulai pekan baru!",
      "Awal pekan yang tepat untuk mencatat keuangan.",
    ];
  } else if (isWeekend) {
    contextSubs = [
      "Selamat menikmati akhir pekan!",
      "Hari yang tepat untuk evaluasi keuangan mingguan.",
    ];
  }

  const combined = [...contextSubs, ...subPool];
  const sub = pickRandom(combined, seed + date);

  return { prefix, sub };
}

export function NetWorthHero({
  userName,
  netWorth,
  monthlyIncome,
  monthlyExpense,
}: NetWorthHeroProps) {
  const [visible, setVisible] = useState(true);
  const now = useMemo(() => new Date(), []);
  const { prefix, sub } = useMemo(
    () => getSmartGreeting(userName, now),
    [userName, now],
  );

  return (
    <div data-tour="greeting" className="relative overflow-hidden">
      <div
        className="px-4 pt-5 pb-6"
        style={{
          background:
            "linear-gradient(170deg, var(--bg-card) 0%, var(--bg-page) 100%)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-[15px] font-bold text-text-primary leading-snug">
              {prefix},{" "}
              <span className="text-warning">{userName}</span>
            </p>
            <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
              {sub}
            </p>
          </div>
          <button
            onClick={() => setVisible((v) => !v)}
            className="flex-shrink-0 text-[10px] font-semibold text-text-muted bg-bg-surface/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-black/[0.06] active:opacity-60 transition-opacity"
            aria-label={visible ? "Sembunyikan saldo" : "Tampilkan saldo"}
          >
            {visible ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        <p className="text-[10px] text-text-muted font-semibold mb-1 tracking-widest uppercase">
          Saldo Bersih
        </p>
        <p className="text-[40px] font-bold font-display text-text-primary tabular-nums leading-none tracking-tight mb-5">
          {visible ? formatCurrency(netWorth, "IDR") : "Rp ••••••"}
        </p>

        <div className="flex gap-3">
          <div className="flex-1 bg-bg-surface/60 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-success/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={11} className="text-success" />
              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">
                Masuk
              </p>
            </div>
            <p className="text-[14px] font-bold font-display tabular-nums text-success leading-none">
              {visible ? formatCurrency(monthlyIncome, "IDR") : "••••"}
            </p>
          </div>
          <div className="flex-1 bg-bg-surface/60 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-danger/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={11} className="text-danger" />
              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">
                Keluar
              </p>
            </div>
            <p className="text-[14px] font-bold font-display tabular-nums text-danger leading-none">
              {visible ? formatCurrency(monthlyExpense, "IDR") : "••••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
