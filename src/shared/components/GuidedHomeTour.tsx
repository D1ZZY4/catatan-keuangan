import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSetting, setSetting } from "@/shared/db/db";

interface TourStep {
  selector: string;
  /** Alternative selector used on tablet (>= 768 px). null = skip step on tablet. */
  tabletSelector?: string | null;
  /** Route to navigate to before showing this step. */
  navigateTo: string;
  title: string;
  text: string;
  tabletTitle?: string;
  tabletText?: string;
}

const ALL_STEPS: TourStep[] = [
  {
    selector: "[data-tour='greeting']",
    navigateTo: "/",
    title: "Dasbor Keuangan Anda",
    text: "Selamat datang! Di sini Anda bisa melihat ringkasan saldo bersih dan arus kas bulan ini.",
  },
  {
    selector: "[data-tour='wallets']",
    navigateTo: "/",
    title: "Dompet Anda",
    text: "Tiga dompet sudah siap. Ketuk kartu dompet untuk melihat detail dan riwayat transaksinya.",
  },
  {
    selector: "[data-tour='fab']",
    tabletSelector: "[data-tour='wallets']",
    navigateTo: "/",
    title: "Catat Transaksi",
    text: "Ketuk tombol ini untuk mencatat pengeluaran, pemasukan, atau transfer baru.",
    tabletTitle: "Catat Transaksi Baru",
    tabletText: "Gunakan tombol aksi di setiap halaman untuk mencatat transaksi baru kapan saja.",
  },
  {
    selector: "[data-tour='navbar']",
    tabletSelector: "[data-tour='sidenav']",
    navigateTo: "/",
    title: "Navigasi Utama",
    text: "Akses semua fitur dari sini: Transaksi, Statistik, Dompet, dan Pengaturan.",
    tabletTitle: "Navigasi Utama",
    tabletText: "Panel kiri ini memberi akses ke semua fitur: Transaksi, Statistik, Dompet, dan Pengaturan.",
  },
  {
    selector: "[data-tour='budget']",
    navigateTo: "/",
    title: "Pantau Anggaran",
    text: "Kelola anggaran bulanan di sini. Anda akan mendapat notifikasi saat mendekati batas yang ditetapkan.",
  },
  {
    selector: "[data-tour='calculator']",
    navigateTo: "/",
    title: "Kalkulator Bawaan",
    text: "Kalkulator pintar ini bisa langsung mengisi nominal di form transaksi. Tidak perlu buka aplikasi lain!",
  },
];

function isTablet(): boolean {
  return window.innerWidth >= 768;
}

/** Filter out steps that are explicitly skipped on tablet (tabletSelector === null) */
function buildEffectiveSteps(tablet: boolean): TourStep[] {
  if (!tablet) return ALL_STEPS;
  return ALL_STEPS.filter((s) => s.tabletSelector !== null);
}

/** Return the CSS selector to use for the current viewport */
function resolveSelector(step: TourStep, tablet: boolean): string {
  if (tablet && step.tabletSelector != null) return step.tabletSelector;
  return step.selector;
}

/** Return the title/text appropriate for the current viewport */
function resolveContent(step: TourStep, tablet: boolean): { title: string; text: string } {
  if (tablet && step.tabletTitle != null) {
    return { title: step.tabletTitle, text: step.tabletText ?? step.text };
  }
  return { title: step.title, text: step.text };
}

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function ConfettiBurst() {
  const pieces = useRef(
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#8CC0EB", "#F4A35A", "#4CAF50", "#D81B60", "#FBC02D"][i % 5] ?? "#8CC0EB",
      delay: Math.random() * 0.8,
      duration: 1.4 + Math.random() * 1,
      size: 5 + Math.random() * 7,
    })),
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[200]" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function computeBubbleStyle(spot: SpotRect | null): React.CSSProperties {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const BUBBLE_EST_HEIGHT = 180;
  const MARGIN = 14;

  if (!spot) {
    return { top: `${vh * 0.35}px`, left: "1rem", right: "1rem" };
  }

  const spotBottom = spot.top + spot.height;
  const spaceBelow = vh - spotBottom;
  const spaceAbove = spot.top;

  if (spaceBelow >= BUBBLE_EST_HEIGHT + MARGIN) {
    return { top: `${spotBottom + MARGIN}px`, left: "1rem", right: "1rem" };
  } else if (spaceAbove >= BUBBLE_EST_HEIGHT + MARGIN) {
    return { bottom: `${vh - spot.top + MARGIN}px`, left: "1rem", right: "1rem" };
  } else {
    return {
      top: `${Math.min(spotBottom + MARGIN, vh - BUBBLE_EST_HEIGHT - 8)}px`,
      left: "1rem",
      right: "1rem",
    };
  }
}

export function GuidedHomeTour() {
  const navigate = useNavigate();
  const location = useLocation();

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [tablet, setTablet] = useState(isTablet);
  const [steps, setSteps] = useState<TourStep[]>(() => buildEffectiveSteps(isTablet()));

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<() => void>(() => undefined);
  const navigatingRef = useRef(false);

  // Update tablet state on resize
  useEffect(() => {
    const handleResize = () => {
      const t = isTablet();
      setTablet(t);
      setSteps(buildEffectiveSteps(t));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if tour needs to run
  useEffect(() => {
    void getSetting<boolean>("tour_completed").then((done) => {
      if (!done) {
        setTimeout(() => setReady(true), 500);
      }
    });
  }, []);

  const measureSpot = useCallback(
    (s: number, currentSteps: TourStep[], currentTablet: boolean) => {
      const stepData = currentSteps[s];
      if (!stepData) return;

      const selector = resolveSelector(stepData, currentTablet);
      const el = document.querySelector(selector);
      if (!el) {
        setSpot(null);
        return;
      }

      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) {
        setSpot(null);
        return;
      }

      const isFixed = getComputedStyle(el).position === "fixed";
      if (!isFixed && (r.top > window.innerHeight || r.bottom < 0)) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const r2 = el.getBoundingClientRect();
          const PAD = 8;
          setSpot({
            top: r2.top - PAD,
            left: r2.left - PAD,
            width: r2.width + PAD * 2,
            height: r2.height + PAD * 2,
          });
        }, 350);
        return;
      }

      const PAD = 8;
      setSpot({
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      });
    },
    [],
  );

  const finish = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setReady(false);
    setConfetti(true);
    await setSetting("tour_completed", true);
    setTimeout(() => setConfetti(false), 2200);
  }, []);

  const advance = useCallback(() => {
    setStep((s) => {
      const next = s + 1;
      if (next >= steps.length) {
        void finish();
        return s;
      }
      return next;
    });
  }, [finish, steps.length]);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  // When step changes: navigate to the correct route if needed, then measure
  useEffect(() => {
    if (!ready) return;

    const stepData = steps[step];
    if (!stepData) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const targetRoute = stepData.navigateTo;
    const currentPath = location.pathname;

    if (targetRoute && currentPath !== targetRoute && !navigatingRef.current) {
      // Navigate to the required page, then wait for DOM to settle
      navigatingRef.current = true;
      navigate(targetRoute, { replace: false });
      const navTimer = setTimeout(() => {
        navigatingRef.current = false;
        measureSpot(step, steps, tablet);
        timerRef.current = setTimeout(() => advanceRef.current(), 4500);
      }, 400);
      return () => {
        clearTimeout(navTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    // Already on the right page — measure immediately
    measureSpot(step, steps, tablet);
    timerRef.current = setTimeout(() => advanceRef.current(), 4500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, step, steps, tablet]);

  // Re-measure on resize
  useEffect(() => {
    if (!ready) return;
    const handleResize = () => measureSpot(step, steps, tablet);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ready, step, steps, tablet, measureSpot]);

  // Re-measure when route settles after navigation
  useEffect(() => {
    if (!ready || navigatingRef.current) return;
    const stepData = steps[step];
    if (!stepData) return;
    if (stepData.navigateTo && location.pathname !== stepData.navigateTo) return;
    // Small delay to let layout settle after route change
    const t = setTimeout(() => measureSpot(step, steps, tablet), 200);
    return () => clearTimeout(t);
  }, [location.pathname, ready, step, steps, tablet, measureSpot]);

  if (!ready && !confetti) return null;

  const current = steps[step];
  const bubbleStyle = computeBubbleStyle(spot);
  const content = current ? resolveContent(current, tablet) : null;

  return (
    <>
      {confetti && <ConfettiBurst />}

      {ready && current !== undefined && content !== null && (
        <>
          {/*
           * Full-screen click interceptor at z-[150].
           * Blocks clicks from reaching page links/buttons beneath the tour.
           * Clicking anywhere advances the tour.
           */}
          <div
            className="fixed inset-0 z-[150]"
            style={{ pointerEvents: "all" }}
            onClick={advance}
            aria-hidden
          />

          {/* Spotlight visual */}
          {spot !== null && (
            <div
              className="fixed rounded-2xl ring-2 ring-accent-primary ring-offset-2 ring-offset-transparent z-[151]"
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.58)",
                pointerEvents: "none",
                transition:
                  "top 0.32s cubic-bezier(0.34,1.56,0.64,1), left 0.32s cubic-bezier(0.34,1.56,0.64,1), width 0.32s ease, height 0.32s ease",
              }}
              aria-hidden
            >
              <div className="absolute inset-0 rounded-2xl animate-pulse bg-accent-primary/10" />
            </div>
          )}

          {/* Dark vignette when no spotlight */}
          {spot === null && (
            <div
              className="fixed inset-0 bg-black/58 z-[151]"
              style={{ pointerEvents: "none" }}
              aria-hidden
            />
          )}

          {/* Bubble card */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Tur panduan: langkah ${step + 1} dari ${steps.length}`}
            className="fixed bg-bg-card rounded-2xl p-4 shadow-float z-[152]"
            style={{ ...bubbleStyle, pointerEvents: "all" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step ? "w-5 bg-accent-primary" : "w-1.5 bg-bg-surface"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-text-muted mt-1">
                  Langkah {step + 1} dari {steps.length}
                </p>
              </div>
              <button
                onClick={() => void finish()}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-bg-surface text-text-muted flex-shrink-0 active:scale-90 transition-transform"
                aria-label="Lewati tur panduan"
              >
                <X size={13} />
              </button>
            </div>

            <h3 className="text-sm font-bold text-text-primary mb-1">{content.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{content.text}</p>

            <div className="mt-3 flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => {
                    if (timerRef.current) clearTimeout(timerRef.current);
                    setStep((s) => Math.max(0, s - 1));
                  }}
                  className="flex-1 py-2.5 bg-bg-surface text-text-muted rounded-xl text-xs font-semibold active:scale-[0.98] transition-transform"
                >
                  Kembali
                </button>
              )}
              <button
                onClick={advance}
                className="flex-1 py-2.5 bg-accent-primary text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-transform"
              >
                {step < steps.length - 1 ? "Lanjut" : "Selesai!"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
