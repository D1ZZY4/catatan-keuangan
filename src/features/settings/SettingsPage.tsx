import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  Bell,
  Check,
  ChevronRight,
  Download,
  Fingerprint,
  Lock,
  Moon,
  Shield,
  ShieldCheck,
  Smartphone,
  Sun,
  Tag,
  User,
} from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { CurrencySelector } from "@/features/wallets/CurrencySelector";
import { useAuth } from "@/app/AuthContext";
import { useToast } from "@/shared/hooks/useToast";
import { setSetting } from "@/shared/db/db";
import { cn } from "@/shared/utils/misc";

function SettingRow({
  icon,
  label,
  description,
  right,
  onClick,
  href,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const content = (
    <div className="flex items-center gap-3 w-full px-4 py-3.5 active:bg-bg-card transition-colors">
      <div className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", danger ? "text-danger" : "text-text-primary")}>
          {label}
        </p>
        {description !== undefined && (
          <p className="text-xs text-text-muted truncate mt-0.5">{description}</p>
        )}
      </div>
      {right !== undefined ? (
        right
      ) : (
        <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
      )}
    </div>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }
  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
  }
  return <div>{content}</div>;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-4 pt-5 pb-2">
      {title}
    </p>
  );
}

function Toggle({ value }: { value: boolean }) {
  return (
    <div
      className={cn(
        "w-10 h-6 rounded-full transition-colors relative flex-shrink-0",
        value ? "bg-accent-primary" : "bg-bg-card",
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
          value ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </div>
  );
}

function PINSheet({
  isOpen,
  onClose,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "setup" | "change" | "remove";
}) {
  const { setupPin, changePin, removePin } = useAuth();
  const { showToast } = useToast();
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (mode === "remove") {
      setLoading(true);
      await removePin();
      showToast("PIN berhasil dihapus", "success");
      setLoading(false);
      onClose();
      return;
    }
    if (newPin.length < 4) {
      showToast("PIN minimal 4 digit", "error");
      return;
    }
    if (newPin !== confirmPin) {
      showToast("PIN tidak cocok", "error");
      return;
    }
    setLoading(true);
    try {
      if (mode === "setup") {
        await setupPin(newPin);
        showToast("PIN berhasil diatur", "success");
      } else {
        const ok = await changePin(oldPin, newPin);
        if (!ok) {
          showToast("PIN lama salah", "error");
          setLoading(false);
          return;
        }
        showToast("PIN berhasil diubah", "success");
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "setup" ? "Buat PIN" : mode === "change" ? "Ganti PIN" : "Hapus PIN";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4 space-y-3 pb-8">
        {mode === "change" && (
          <input
            type="password"
            inputMode="numeric"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="PIN lama"
            className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
          />
        )}
        {mode !== "remove" && (
          <>
            <input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder={mode === "setup" ? "Buat PIN baru (4–8 digit)" : "PIN baru (4–8 digit)"}
              className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            />
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Ulangi PIN baru"
              className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            />
          </>
        )}
        {mode === "remove" && (
          <p className="text-sm text-text-muted bg-bg-card rounded-2xl px-4 py-3 leading-relaxed">
            Menghapus PIN akan menonaktifkan kunci otomatis. Data tetap tersimpan dan aman.
          </p>
        )}
        <button
          onClick={() => void handleSave()}
          disabled={loading}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab",
            mode === "remove" ? "bg-danger text-white" : "bg-accent-primary text-white",
          )}
        >
          {loading
            ? "Memproses…"
            : mode === "remove"
              ? "Hapus PIN"
              : mode === "setup"
                ? "Buat PIN"
                : "Ganti PIN"}
        </button>
      </div>
    </BottomSheet>
  );
}

type InstallPromptEvent = Event & { prompt?: () => Promise<void> };

function InstallSheet({
  isOpen,
  onClose,
  installPrompt,
}: {
  isOpen: boolean;
  onClose: () => void;
  installPrompt: (() => void) | null;
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Pasang di HP">
      <div className="p-4 pb-10 space-y-4">
        <div className="bg-accent-primary/10 rounded-2xl p-4 border border-accent-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone size={20} className="text-accent-primary flex-shrink-0" />
            <p className="text-sm font-bold text-text-primary">Apa itu PWA?</p>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Catatan Keuangan adalah aplikasi PWA — bisa dipakai offline, punya ikon di layar utama, dan tidak perlu instal dari Play Store. Pengalamannya sama seperti aplikasi biasa!
          </p>
        </div>

        {installPrompt !== null && (
          <button
            onClick={() => {
              installPrompt();
              onClose();
            }}
            className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform shadow-fab flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Pasang Aplikasi Sekarang
          </button>
        )}

        <div className="space-y-3">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">
            Cara pasang secara manual:
          </p>
          {[
            {
              step: "1",
              label: "Android (Chrome)",
              desc: 'Buka menu titik tiga (pojok kanan atas) → ketuk "Tambahkan ke layar utama" → Tambahkan',
            },
            {
              step: "2",
              label: "iPhone / iPad (Safari)",
              desc: 'Ketuk ikon Bagikan (kotak dengan panah ke atas) → geser ke bawah → "Tambahkan ke Layar Utama"',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 bg-bg-card rounded-2xl p-3.5">
              <div className="w-7 h-7 rounded-xl bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-accent-primary">{item.step}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary mb-0.5">{item.label}</p>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}

export function SettingsPage() {
  const { state, registerWebAuthn, unregisterWebAuthn, lock, refreshSettings } = useAuth();
  const { showToast } = useToast();

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [pinSheet, setPinSheet] = useState<"setup" | "change" | "remove" | null>(null);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [autoLockOpen, setAutoLockOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<(() => void) | null>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const pe = e as InstallPromptEvent;
      if (pe.prompt) {
        const fn = pe.prompt.bind(pe);
        setInstallPrompt(() => fn);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const isUnlocked = state.status === "unlocked";
  const userName = isUnlocked ? state.userName : "";
  const hasPin = isUnlocked ? state.hasPin : false;
  const hasWebAuthn = isUnlocked ? state.hasWebAuthn : false;
  const autoLockSeconds = isUnlocked ? state.autoLockSeconds : 0;

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleWebAuthn = async () => {
    if (hasWebAuthn) {
      await unregisterWebAuthn();
      showToast("Biometrik dinonaktifkan", "success");
    } else {
      const ok = await registerWebAuthn();
      if (ok) showToast("Biometrik berhasil diaktifkan", "success");
      else showToast("Gagal — pastikan HP kamu mendukung sidik jari/wajah", "error");
    }
  };

  const handleSaveName = async (name: string) => {
    await setSetting("userName", name);
    await refreshSettings();
    showToast("Nama berhasil diperbarui", "success");
  };

  const autoLockLabels: Record<number, string> = {
    0: "Tidak pernah",
    30: "30 detik",
    60: "1 menit",
    300: "5 menit",
    900: "15 menit",
    3600: "1 jam",
  };

  const handleAutoLock = async (seconds: number) => {
    await setSetting("autoLockSeconds", seconds);
    await refreshSettings();
    setAutoLockOpen(false);
    showToast("Pengaturan kunci disimpan", "success");
  };

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [newName, setNewName] = useState(userName);

  const supportsWebAuthn =
    typeof window !== "undefined" && "PublicKeyCredential" in window;

  return (
    <>
      <AppBar title="Pengaturan" />

      <div className="pb-10">
        <SectionHeader title="Profil" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow
            icon={<User size={18} className="text-accent-primary" />}
            label={userName || "Atur nama"}
            description="Ketuk untuk mengubah nama"
            onClick={() => {
              setNewName(userName);
              setEditNameOpen(true);
            }}
          />
        </div>

        <SectionHeader title="Keamanan" />

        {!hasPin && (
          <div className="mx-4 mb-3 bg-warning/10 border border-warning/30 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Shield size={18} className="text-warning flex-shrink-0" />
            <p className="text-xs text-text-primary leading-relaxed">
              <strong>Data belum dilindungi.</strong> Buat PIN untuk mengamankan data keuanganmu.
            </p>
          </div>
        )}

        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          {!hasPin ? (
            <SettingRow
              icon={<Lock size={18} className="text-warning" />}
              label="Buat PIN"
              description="Lindungi data dengan kode rahasia 4–8 digit"
              onClick={() => setPinSheet("setup")}
              right={
                <span className="text-[10px] font-bold text-warning bg-warning/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Belum aktif
                </span>
              }
            />
          ) : (
            <SettingRow
              icon={<ShieldCheck size={18} className="text-success" />}
              label="PIN Aktif"
              description="Ketuk untuk mengganti kode PIN"
              onClick={() => setPinSheet("change")}
              right={
                <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Aktif
                </span>
              }
            />
          )}

          {supportsWebAuthn && (
            <SettingRow
              icon={
                <Fingerprint
                  size={18}
                  className={hasWebAuthn ? "text-success" : "text-text-muted"}
                />
              }
              label="Sidik Jari / Wajah"
              description={
                !hasPin
                  ? "Buat PIN terlebih dahulu"
                  : hasWebAuthn
                    ? "Aktif — buka aplikasi tanpa ketik PIN"
                    : "Aktifkan agar bisa buka pakai biometrik"
              }
              right={<Toggle value={hasWebAuthn} />}
              {...(hasPin ? { onClick: () => void handleWebAuthn() } : {})}
            />
          )}

          {hasPin && (
            <SettingRow
              icon={<Lock size={18} className="text-text-muted" />}
              label="Kunci Otomatis"
              description={autoLockLabels[autoLockSeconds] ?? "Kustom"}
              onClick={() => setAutoLockOpen(true)}
            />
          )}

          {hasPin && (
            <SettingRow
              icon={<Shield size={18} className="text-danger" />}
              label="Hapus PIN"
              description="Nonaktifkan kunci keamanan"
              onClick={() => setPinSheet("remove")}
              danger
              right={<span className="text-xs text-danger/70 flex-shrink-0">Hapus</span>}
            />
          )}
        </div>

        <SectionHeader title="Tampilan" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow
            icon={
              darkMode ? (
                <Moon size={18} className="text-accent-secondary" />
              ) : (
                <Sun size={18} className="text-warning" />
              )
            }
            label={darkMode ? "Mode Gelap" : "Mode Terang"}
            description="Ubah tema tampilan aplikasi"
            right={<Toggle value={darkMode} />}
            onClick={toggleTheme}
          />
        </div>

        <SectionHeader title="Data & Pengingat" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow
            icon={<Tag size={18} className="text-accent-primary" />}
            label="Kategori"
            description="Kelola kategori transaksi"
            href="/settings/categories"
          />
          <SettingRow
            icon={<Bell size={18} className="text-warning" />}
            label="Pengingat Tagihan"
            description="Atur notifikasi jatuh tempo"
            href="/settings/reminders"
          />
          <SettingRow
            icon={<Archive size={18} className="text-success" />}
            label="Backup & Restore"
            description="Ekspor atau impor semua data"
            href="/settings/backup"
          />
        </div>

        <SectionHeader title="Aplikasi" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow
            icon={<Smartphone size={18} className="text-accent-primary" />}
            label="Pasang di HP"
            description="Install ke layar utama tanpa Play Store"
            onClick={() => setInstallOpen(true)}
          />
          {hasPin && (
            <SettingRow
              icon={<Lock size={18} className="text-text-muted" />}
              label="Kunci Aplikasi"
              description="Kunci sekarang dan tampilkan layar PIN"
              onClick={lock}
              right={<span className="text-xs text-text-muted flex-shrink-0">Kunci</span>}
            />
          )}
        </div>

        <div className="px-4 pt-8 pb-2 text-center text-xs text-text-muted space-y-1">
          <p className="font-bold text-text-primary">Catatan Keuangan</p>
          <p>Versi 1.0.0 · Offline-first · Data tersimpan di perangkat</p>
        </div>
      </div>

      <BottomSheet isOpen={editNameOpen} onClose={() => setEditNameOpen(false)} title="Edit Nama">
        <div className="p-4 space-y-3 pb-8">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama kamu"
            className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            autoFocus
            maxLength={40}
          />
          <button
            onClick={() => {
              void handleSaveName(newName);
              setEditNameOpen(false);
            }}
            disabled={!newName.trim()}
            className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold text-sm disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={autoLockOpen}
        onClose={() => setAutoLockOpen(false)}
        title="Kunci Otomatis"
      >
        <div className="pb-6">
          {Object.entries(autoLockLabels).map(([secs, label]) => (
            <button
              key={secs}
              onClick={() => void handleAutoLock(Number(secs))}
              className={cn(
                "w-full flex items-center px-5 py-3.5 text-sm font-medium transition-colors",
                autoLockSeconds === Number(secs)
                  ? "text-accent-primary bg-accent-primary/5"
                  : "text-text-primary active:bg-bg-card",
              )}
            >
              <span className="flex-1">{label}</span>
              {autoLockSeconds === Number(secs) && (
                <Check size={16} className="text-accent-primary" />
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {pinSheet !== null && (
        <PINSheet isOpen mode={pinSheet} onClose={() => setPinSheet(null)} />
      )}

      <InstallSheet
        isOpen={installOpen}
        onClose={() => setInstallOpen(false)}
        installPrompt={installPrompt}
      />

      <CurrencySelector
        isOpen={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
        value="IDR"
        onChange={() => setCurrencyOpen(false)}
      />
    </>
  );
}
