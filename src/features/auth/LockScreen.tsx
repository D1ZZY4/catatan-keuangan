import React, { useCallback, useEffect, useRef, useState } from "react";
import { Delete, Fingerprint } from "lucide-react";
import { useAuth } from "@/app/AuthContext";
import { cn } from "@/shared/utils/misc";

const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"] as const;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

export function LockScreen() {
  const { state, unlock, unlockWithBiometric } = useAuth();
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasWebAuthn = state.status === "locked" && state.hasWebAuthn;

  useEffect(() => {
    if (hasWebAuthn && attempts === 0) {
      void tryBiometric();
    }
  }, [hasWebAuthn]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          setAttempts(0);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  const tryBiometric = async () => {
    const ok = await unlockWithBiometric();
    if (!ok) setError("Biometrik gagal. Masukkan PIN.");
  };

  const handleKey = useCallback(
    async (key: string) => {
      if (cooldown > 0) return;

      if (key === "⌫") {
        setPin((p) => p.slice(0, -1));
        setError("");
        return;
      }

      const newPin = pin + key;
      setPin(newPin);

      if (newPin.length >= 4) {
        const ok = await unlock(newPin);
        if (ok) {
          setPin("");
          setError("");
        } else {
          shake();
          setPin("");
          const next = attempts + 1;
          setAttempts(next);
          if (next >= MAX_ATTEMPTS) {
            setError(`Terlalu banyak percobaan. Tunggu ${COOLDOWN_SECONDS} detik.`);
            startCooldown();
          } else {
            setError(`PIN salah. ${MAX_ATTEMPTS - next} percobaan tersisa.`);
          }
        }
      }
    },
    [pin, attempts, cooldown, unlock],
  );

  if (state.status !== "locked") return null;

  return (
    <div className="fixed inset-0 z-[200] bg-bg-page flex flex-col items-center justify-between py-12 safe-top safe-bottom">
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="w-14 h-14 rounded-2xl bg-accent-primary flex items-center justify-center shadow-fab">
          <span className="text-white font-bold text-xl">CK</span>
        </div>
        <p className="text-base font-semibold text-text-primary">Catatan Keuangan</p>
        <p className="text-sm text-text-muted">Masukkan PIN untuk melanjutkan</p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-xs px-6">
        <div
          className={cn(
            "flex gap-4 transition-transform",
            shaking && "animate-[shake_0.4s_ease-in-out]",
          )}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full border-2 transition-all",
                i < pin.length
                  ? "bg-accent-primary border-accent-primary scale-110"
                  : "border-text-muted",
              )}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-danger text-center">{error}</p>
        )}

        {cooldown > 0 && (
          <p className="text-base font-semibold text-accent-primary">
            {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
            {String(cooldown % 60).padStart(2, "0")}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 w-full">
          {PAD.map((key, i) => {
            if (key === "") return <div key={i} />;
            return (
              <button
                key={i}
                onClick={() => void handleKey(key)}
                disabled={cooldown > 0}
                className={cn(
                  "w-full h-14 rounded-2xl bg-bg-card flex items-center justify-center text-xl font-medium",
                  "active:scale-90 active:bg-bg-surface transition-all disabled:opacity-40",
                  "shadow-card",
                )}
                aria-label={key === "⌫" ? "Hapus" : key}
              >
                {key === "⌫" ? <Delete size={20} className="text-text-muted" /> : key}
              </button>
            );
          })}
        </div>

        {hasWebAuthn && cooldown === 0 && (
          <button
            onClick={() => void tryBiometric()}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-accent-primary text-sm font-medium active:opacity-60 transition-opacity"
          >
            <Fingerprint size={20} />
            Gunakan biometrik
          </button>
        )}
      </div>
    </div>
  );
}
