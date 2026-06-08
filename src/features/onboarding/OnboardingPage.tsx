import React, { useRef, useState } from "react";
import { ChevronRight, Fingerprint, Lock } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";
import { cn } from "@/shared/utils/misc";

// ---- SVG Illustrations -------------------------------------------------------

function Slide1Illustration() {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      <ellipse cx="110" cy="185" rx="80" ry="12" fill="var(--bg-card)" opacity="0.8" />
      <rect x="55" y="80" width="110" height="90" rx="16" fill="var(--accent-secondary)" opacity="0.5" />
      <rect x="40" y="70" width="140" height="95" rx="16" fill="var(--accent-primary)" opacity="0.3" />
      <rect x="30" y="55" width="160" height="100" rx="18" fill="var(--bg-surface)" />
      <rect x="30" y="55" width="160" height="32" rx="18" fill="var(--accent-primary)" opacity="0.8" />
      <circle cx="50" cy="71" r="8" fill="white" opacity="0.5" />
      <circle cx="170" cy="71" r="6" fill="white" opacity="0.4" />
      <rect x="45" y="100" width="60" height="8" rx="4" fill="var(--bg-card)" />
      <rect x="45" y="115" width="90" height="6" rx="3" fill="var(--bg-card)" opacity="0.7" />
      <rect x="45" y="128" width="70" height="6" rx="3" fill="var(--bg-card)" opacity="0.5" />
      <text x="110" y="148" textAnchor="middle" fontSize="22" fill="var(--accent-primary)" opacity="0.8">Rp</text>
      <circle cx="165" cy="30" r="20" fill="var(--accent-primary)" opacity="0.15" />
      <circle cx="165" cy="30" r="12" fill="var(--accent-primary)" opacity="0.3" />
      <path d="M159 30 L163 34 L172 25" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Slide2Illustration() {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      <rect x="10" y="80" width="80" height="55" rx="12" fill="#E65100" opacity="0.15" transform="rotate(-8 10 80)" />
      <rect x="14" y="78" width="78" height="53" rx="11" fill="#E65100" opacity="0.25" transform="rotate(-8 14 78)" />
      <rect x="70" y="65" width="80" height="55" rx="12" fill="#1976D2" opacity="0.15" transform="rotate(5 70 65)" />
      <rect x="74" y="63" width="78" height="53" rx="11" fill="#1976D2" opacity="0.3" transform="rotate(5 74 63)" />
      <rect x="60" y="60" width="100" height="65" rx="14" fill="var(--bg-surface)" />
      <rect x="60" y="60" width="100" height="22" rx="14" fill="var(--accent-primary)" />
      <circle cx="78" cy="71" r="7" fill="white" opacity="0.5" />
      <rect x="92" y="67" width="36" height="4" rx="2" fill="white" opacity="0.6" />
      <rect x="72" y="90" width="50" height="6" rx="3" fill="var(--bg-card)" />
      <rect x="72" y="102" width="35" height="5" rx="2.5" fill="var(--bg-card)" opacity="0.6" />
      <rect x="72" y="113" width="42" height="5" rx="2.5" fill="var(--bg-card)" opacity="0.4" />
      <circle cx="150" cy="145" r="22" fill="#2E7D32" opacity="0.15" />
      <circle cx="150" cy="145" r="14" fill="#2E7D32" opacity="0.3" />
      <path d="M142 145 L149 152 L160 138" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Slide3Illustration() {
  const icons = [
    { x: 30, y: 40, color: "#2E7D32", label: "+" },
    { x: 100, y: 40, color: "#C62828", label: "-" },
    { x: 170, y: 40, color: "#1976D2", label: "⇄" },
    { x: 30, y: 120, color: "#8E24AA", label: "Rp" },
    { x: 100, y: 120, color: "#E65100", label: "%" },
    { x: 170, y: 120, color: "#00897B", label: "Bk" },
  ];
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      {icons.map((ic) => (
        <g key={`${ic.x}-${ic.y}`}>
          <circle cx={ic.x + 20} cy={ic.y + 20} r="22" fill={ic.color} opacity="0.15" />
          <circle cx={ic.x + 20} cy={ic.y + 20} r="16" fill={ic.color} opacity="0.25" />
          <text x={ic.x + 20} y={ic.y + 26} textAnchor="middle" fontSize="16" fill={ic.color} fontWeight="bold">
            {ic.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Slide4Illustration() {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      <circle cx="110" cy="90" r="65" fill="var(--accent-secondary)" opacity="0.2" />
      <circle cx="110" cy="90" r="48" fill="var(--accent-secondary)" opacity="0.3" />
      <rect x="82" y="72" width="56" height="46" rx="8" fill="var(--bg-surface)" />
      <rect x="82" y="72" width="56" height="20" rx="8" fill="var(--accent-primary)" opacity="0.6" />
      <rect x="82" y="80" width="56" height="12" fill="var(--accent-primary)" opacity="0.6" />
      <rect x="96" y="100" width="28" height="5" rx="2.5" fill="var(--bg-card)" />
      <rect x="100" y="110" width="20" height="5" rx="2.5" fill="var(--bg-card)" opacity="0.7" />
      <circle cx="110" cy="67" r="10" fill="var(--accent-primary)" />
      <rect x="107" y="63" width="6" height="8" rx="3" fill="white" />
      <rect x="105" y="67" width="10" height="6" rx="2" fill="white" />
      <path d="M50 140 Q110 115 170 140" stroke="var(--accent-primary)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.5" />
      <circle cx="50" cy="140" r="5" fill="var(--text-muted)" opacity="0.3" />
      <circle cx="170" cy="140" r="5" fill="var(--text-muted)" opacity="0.3" />
    </svg>
  );
}

// ---- Slides data -------------------------------------------------------------

interface SlideData {
  illustration: React.ReactNode;
  headline: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    illustration: <Slide1Illustration />,
    headline: "Semua keuangan keluarga,\ndalam satu tempat",
    subtitle: "Pantau dompet, tabungan, dan investasi keluarga dengan mudah.",
  },
  {
    illustration: <Slide2Illustration />,
    headline: "Banyak dompet,\nsatu pandangan",
    subtitle: "Kelola kas tunai, rekening bank, dan e-wallet sekaligus.",
  },
  {
    illustration: <Slide3Illustration />,
    headline: "Semua jenis transaksi\ntercatat rapi",
    subtitle: "Pemasukan, pengeluaran, transfer, piutang, investasi — semuanya ada.",
  },
  {
    illustration: <Slide4Illustration />,
    headline: "Data kamu,\ntidak kemana-mana",
    subtitle:
      "Semua data tersimpan di HP kamu sendiri, tidak dikirim ke server manapun.",
  },
];

// ---- Setup slide (slide 5) ---------------------------------------------------

interface SetupSlideProps {
  onComplete: (name: string, pin?: string) => Promise<void>;
  onShowBiometric: () => void;
  showingBiometric: boolean;
}

function SetupSlide({ onComplete, onShowBiometric, showingBiometric }: SetupSlideProps) {
  const { registerWebAuthn } = useAuth();
  const [name, setName] = useState("");
  const [usePIN, setUsePIN] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricDone, setBiometricDone] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  const supportsWebAuthn =
    typeof window !== "undefined" && "PublicKeyCredential" in window;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }
    if (usePIN) {
      if (pin.length < 4) {
        setError("PIN minimal 4 digit");
        return;
      }
      if (pin !== confirmPin) {
        setError("PIN tidak cocok");
        return;
      }
    }
    setLoading(true);
    setError("");
    // If PIN + WebAuthn, block redirect BEFORE completing onboarding
    if (usePIN && supportsWebAuthn) {
      onShowBiometric();
    }
    await onComplete(name.trim(), usePIN ? pin : undefined);
    setLoading(false);
  };

  const handleBiometric = async () => {
    setBiometricLoading(true);
    setBiometricError("");
    const ok = await registerWebAuthn();
    setBiometricLoading(false);
    if (ok) {
      setBiometricDone(true);
    } else {
      setBiometricError("Gagal mengaktifkan. Coba lagi atau lewati.");
    }
  };

  if (showingBiometric) {
    return (
      <div className="flex flex-col items-center gap-5 px-6 pb-6 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-accent-primary/15 flex items-center justify-center">
          <Fingerprint size={40} className="text-accent-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Aktifkan Sidik Jari / Wajah?
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Buka aplikasi lebih cepat dan aman menggunakan biometrik HP kamu — sidik jari atau pengenalan wajah.
          </p>
        </div>

        {biometricError && (
          <p className="text-sm text-danger text-center">{biometricError}</p>
        )}

        {biometricDone ? (
          <div className="w-full py-4 bg-success/15 rounded-2xl flex items-center justify-center gap-2">
            <Lock size={18} className="text-success" />
            <span className="text-sm font-semibold text-success">Biometrik aktif!</span>
          </div>
        ) : (
          <button
            onClick={() => void handleBiometric()}
            disabled={biometricLoading}
            className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab"
          >
            {biometricLoading ? "Memproses…" : "Aktifkan Sidik Jari / Wajah"}
          </button>
        )}

        <button
          onClick={() => { window.location.assign("/"); }}
          className="text-sm text-text-muted active:opacity-60 transition-opacity py-2"
        >
          {biometricDone ? "Lanjut ke aplikasi" : "Lewati, gunakan PIN saja"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-6 pb-6">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="var(--accent-secondary)" opacity="0.3" />
        <circle cx="60" cy="45" r="20" fill="var(--accent-primary)" opacity="0.6" />
        <ellipse cx="60" cy="90" rx="28" ry="16" fill="var(--accent-primary)" opacity="0.4" />
        <circle cx="60" cy="45" r="14" fill="var(--accent-primary)" />
        <circle cx="55" cy="42" r="3" fill="white" opacity="0.8" />
      </svg>

      <div className="w-full space-y-1">
        <label className="text-xs font-semibold text-text-muted">Siapa nama kamu?</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama kamu"
          className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-base text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
          autoFocus
          maxLength={40}
        />
      </div>

      <div className="w-full bg-bg-card rounded-2xl p-4 space-y-3">
        <button
          onClick={() => setUsePIN((v) => !v)}
          className="flex items-center gap-3 w-full text-left"
        >
          <div
            className={cn(
              "w-11 h-6 rounded-full transition-colors flex-shrink-0 relative",
              usePIN ? "bg-accent-primary" : "bg-text-muted/30",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                usePIN ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Aktifkan PIN</p>
            <p className="text-xs text-text-muted">Kunci aplikasi dengan kode rahasia</p>
          </div>
        </button>

        {usePIN && (
          <div className="space-y-2 pt-1 animate-fade-in">
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Buat PIN (4–8 digit)"
              className="w-full bg-bg-page rounded-xl px-4 py-3 text-base text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            />
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Ulangi PIN"
              className="w-full bg-bg-page rounded-xl px-4 py-3 text-base text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            />
          </div>
        )}
      </div>

      {usePIN && supportsWebAuthn && (
        <div className="w-full bg-accent-primary/10 rounded-2xl px-4 py-3 flex items-center gap-3 border border-accent-primary/20">
          <Fingerprint size={20} className="text-accent-primary flex-shrink-0" />
          <p className="text-xs text-text-primary leading-snug">
            Setelah PIN dibuat, kamu bisa aktifkan <strong>sidik jari / wajah</strong> di langkah berikutnya.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-danger w-full">{error}</p>}

      <button
        onClick={() => void handleSubmit()}
        disabled={loading || !name.trim()}
        className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab mt-2"
      >
        {loading ? "Mempersiapkan…" : "Mulai Sekarang"}
      </button>
    </div>
  );
}

// ---- Main OnboardingPage ----------------------------------------------------

export function OnboardingPage() {
  const { state, completeOnboarding } = useAuth();
  const [current, setCurrent] = useState(0);
  const [showBiometric, setShowBiometric] = useState(false);
  const startX = useRef(0);

  if (state.status === "unlocked" && !showBiometric) {
    return <Navigate to="/" replace />;
  }

  const isLast = current === SLIDES.length;
  const slideData = SLIDES[current];

  const goNext = () => {
    if (current < SLIDES.length) setCurrent((c) => c + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0]?.clientX ?? 0;
    const diff = startX.current - endX;
    if (diff > 50 && current < SLIDES.length) setCurrent((c) => c + 1);
    if (diff < -50 && current > 0) setCurrent((c) => c - 1);
  };

  return (
    <div
      className="min-h-[100dvh] bg-bg-page flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4">
        {!isLast && slideData !== undefined ? (
          <div className="flex flex-col items-center gap-6 text-center animate-fade-in w-full max-w-sm">
            <div className="flex items-center justify-center h-[200px]">
              {slideData.illustration}
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-text-primary whitespace-pre-line leading-snug">
                {slideData.headline}
              </h1>
              <p className="text-sm text-text-muted leading-relaxed">{slideData.subtitle}</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm animate-fade-in">
            <h1 className="text-2xl font-bold text-text-primary text-center mb-6">
              Hampir siap!
            </h1>
            <SetupSlide
              onComplete={completeOnboarding}
              onShowBiometric={() => setShowBiometric(true)}
              showingBiometric={showBiometric}
            />
          </div>
        )}
      </div>

      <div className="px-6 pb-10 safe-bottom space-y-4 max-w-sm mx-auto w-full">
        <div className="flex justify-center gap-2">
          {Array.from({ length: SLIDES.length + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-6 h-2 bg-accent-primary"
                  : "w-2 h-2 bg-bg-card",
              )}
            />
          ))}
        </div>

        {!isLast && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrent(SLIDES.length)}
              className="text-sm text-text-muted py-2 active:opacity-60 transition-opacity"
            >
              Lewati
            </button>
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 bg-accent-primary text-white px-5 py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-transform shadow-fab"
            >
              Lanjut <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
