import React, { useEffect, useState } from "react";
import {
  Archive,
  Bell,
  BookOpen,
  Calendar,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Fingerprint,
  Layers,
  Lock,
  Moon,
  Shield,
  ShieldCheck,
  Sun,
  Tag,
  Trash2,
  Type,
  User,
} from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useAuth } from "@/app/AuthContext";
import { useToast } from "@/shared/hooks/useToast";
import { setSetting } from "@/shared/db/db";
import { cn } from "@/shared/utils/misc";
import { SettingRow, SectionHeader, Toggle } from "./SettingsComponents";
import { PINSheet } from "./PINSheet";
import { DeleteAllSheet } from "./DeleteAllSheet";
import { useDisplaySettings, type TextSizeKey } from "@/shared/hooks/useDisplaySettings";
import type { DateFormatKey } from "@/shared/utils/format";
import { PINNED_CURRENCIES } from "@/shared/data/currencies";

export function SettingsPage() {
  const { state, registerWebAuthn, unregisterWebAuthn, lock, refreshSettings } = useAuth();
  const { showToast } = useToast();
  const { dateFormat, textSize, baseCurrency, updateDateFormat, updateTextSize, updateBaseCurrency } =
    useDisplaySettings();

  const [pinSheet, setPinSheet] = useState<"setup" | "change" | "remove" | null>(null);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [darkScheduleEnabled, setDarkScheduleEnabled] = useState(() =>
    localStorage.getItem("dark_schedule_enabled") === "true",
  );
  const [darkStart, setDarkStart] = useState(() =>
    parseInt(localStorage.getItem("dark_schedule_start") ?? "20", 10),
  );
  const [darkEnd, setDarkEnd] = useState(() =>
    parseInt(localStorage.getItem("dark_schedule_end") ?? "6", 10),
  );
  const [autoLockOpen, setAutoLockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    "Notification" in window && Notification.permission === "granted",
  );
  const [dateFormatOpen, setDateFormatOpen] = useState(false);
  const [textSizeOpen, setTextSizeOpen] = useState(false);
  const [baseCurrencyOpen, setBaseCurrencyOpen] = useState(false);

  const isUnlocked = state.status === "unlocked";
  const userName = isUnlocked ? state.userName : "";
  const hasPin = isUnlocked ? state.hasPin : false;
  const hasWebAuthn = isUnlocked ? state.hasWebAuthn : false;
  const autoLockSeconds = isUnlocked ? state.autoLockSeconds : 0;
  const [newName, setNewName] = useState(userName);

  const supportsWebAuthn =
    typeof window !== "undefined" && "PublicKeyCredential" in window;

  useEffect(() => {
    if (!darkScheduleEnabled) return;
    const checkSchedule = () => {
      const hour = new Date().getHours();
      const isDark = darkStart <= darkEnd
        ? hour >= darkStart && hour < darkEnd
        : hour >= darkStart || hour < darkEnd;
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    };
    checkSchedule();
    const id = setInterval(checkSchedule, 60_000);
    return () => clearInterval(id);
  }, [darkScheduleEnabled, darkStart, darkEnd]);

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
      else showToast("Gagal. Pastikan perangkat mendukung sidik jari atau wajah.", "error");
    }
  };

  const handleSaveName = async (name: string) => {
    await setSetting("userName", name);
    await refreshSettings();
    showToast("Nama berhasil diperbarui", "success");
  };

  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) {
      showToast("Notifikasi tidak didukung di browser ini", "error");
      return;
    }
    if (Notification.permission === "granted") {
      setNotificationsEnabled(false);
      await setSetting("notificationsEnabled", false);
      showToast("Notifikasi dinonaktifkan", "success");
    } else {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        setNotificationsEnabled(true);
        await setSetting("notificationsEnabled", true);
        showToast("Notifikasi diaktifkan", "success");
      } else {
        showToast("Izin notifikasi ditolak. Aktifkan di pengaturan browser.", "error");
      }
    }
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
            onClick={() => { setNewName(userName); setEditNameOpen(true); }}
          />
        </div>

        <SectionHeader title="Keamanan" />
        {!hasPin && (
          <div className="mx-4 mb-3 bg-warning/10 border border-warning/30 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Shield size={18} className="text-warning flex-shrink-0" />
            <p className="text-xs text-text-primary leading-relaxed">
              <strong>Data belum dilindungi.</strong> Buat PIN untuk mengamankan data keuangan Anda.
            </p>
          </div>
        )}
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          {!hasPin ? (
            <SettingRow
              icon={<Lock size={18} className="text-warning" />}
              label="Buat PIN"
              description="Lindungi data dengan kode rahasia 4-8 digit"
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
              icon={<Fingerprint size={18} className={hasWebAuthn ? "text-success" : "text-text-muted"} />}
              label="Sidik Jari / Wajah"
              description={
                !hasPin ? "Buat PIN terlebih dahulu"
                  : hasWebAuthn ? "Aktif. Buka aplikasi tanpa ketik PIN."
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
            icon={darkMode ? <Moon size={18} className="text-accent-secondary" /> : <Sun size={18} className="text-warning" />}
            label="Mode Gelap"
            description={darkMode ? "Aktif. Ketuk untuk beralih ke mode terang." : "Nonaktif. Ketuk untuk beralih ke mode gelap."}
            right={<Toggle value={darkMode} />}
            onClick={toggleTheme}
          />
          <SettingRow
            icon={<Clock size={18} className={darkScheduleEnabled ? "text-accent-secondary" : "text-text-muted"} />}
            label="Jadwal Mode Gelap"
            description={darkScheduleEnabled ? `Aktif ${darkStart}:00 – ${darkEnd}:00` : "Otomatis sesuai jam"}
            right={<Toggle value={darkScheduleEnabled} />}
            onClick={() => {
              const next = !darkScheduleEnabled;
              setDarkScheduleEnabled(next);
              localStorage.setItem("dark_schedule_enabled", String(next));
            }}
          />
          {darkScheduleEnabled && (
            <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface">
              <span className="text-xs text-text-muted w-14">Mulai</span>
              <input
                type="number"
                min={0}
                max={23}
                value={darkStart}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0));
                  setDarkStart(v);
                  localStorage.setItem("dark_schedule_start", String(v));
                }}
                className="w-16 bg-bg-card rounded-lg px-2 py-1.5 text-sm text-text-primary text-center outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
              <span className="text-xs text-text-muted">:00 sampai</span>
              <input
                type="number"
                min={0}
                max={23}
                value={darkEnd}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0));
                  setDarkEnd(v);
                  localStorage.setItem("dark_schedule_end", String(v));
                }}
                className="w-16 bg-bg-card rounded-lg px-2 py-1.5 text-sm text-text-primary text-center outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
              <span className="text-xs text-text-muted">:00</span>
            </div>
          )}
          <SettingRow
            icon={<CircleDollarSign size={18} className="text-success" />}
            label="Mata Uang Dasar"
            description="Mata uang default untuk dompet baru"
            right={
              <span className="flex items-center gap-1 text-xs text-text-muted">
                {baseCurrency}
                <ChevronRight size={14} />
              </span>
            }
            onClick={() => setBaseCurrencyOpen(true)}
          />
          <SettingRow
            icon={<Calendar size={18} className="text-accent-secondary" />}
            label="Format Tanggal"
            description="Tampilan tanggal di seluruh aplikasi"
            right={
              <span className="flex items-center gap-1 text-xs text-text-muted">
                {dateFormat === "id" ? "dd/MMM/yyyy" : dateFormat === "us" ? "MMM dd, yyyy" : "yyyy-MM-dd"}
                <ChevronRight size={14} />
              </span>
            }
            onClick={() => setDateFormatOpen(true)}
          />
          <SettingRow
            icon={<Type size={18} className="text-accent-primary" />}
            label="Ukuran Teks"
            description="Ukuran huruf di seluruh aplikasi"
            right={
              <span className="flex items-center gap-1 text-xs text-text-muted">
                {textSize === "sm" ? "Kecil" : textSize === "lg" ? "Besar" : "Normal"}
                <ChevronRight size={14} />
              </span>
            }
            onClick={() => setTextSizeOpen(true)}
          />
        </div>

        <SectionHeader title="Notifikasi" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow
            icon={<Bell size={18} className={notificationsEnabled ? "text-accent-primary" : "text-text-muted"} />}
            label="Notifikasi Pengingat"
            description={notificationsEnabled ? "Aktif. Anda akan mendapat pengingat tagihan." : "Nonaktif. Ketuk untuk mengaktifkan."}
            right={<Toggle value={notificationsEnabled} />}
            onClick={() => void handleToggleNotifications()}
          />
        </div>

        <SectionHeader title="Data" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow icon={<Tag size={18} className="text-accent-primary" />} label="Kategori" description="Kelola kategori transaksi" href="/settings/categories" />
          <SettingRow icon={<Bell size={18} className="text-warning" />} label="Pengingat Tagihan" description="Atur notifikasi jatuh tempo" href="/settings/reminders" />
          <SettingRow icon={<CalendarClock size={18} className="text-accent-warm" />} label="Transaksi Berulang" description="Cicilan, gaji, tagihan rutin otomatis" href="/settings/recurring" />
          <SettingRow icon={<Layers size={18} className="text-accent-secondary" />} label="Anggaran" description="Kelola anggaran per kategori" href="/budgets" />
        </div>

        <SectionHeader title="Cadangan dan Pemulihan" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow icon={<Archive size={18} className="text-success" />} label="Ekspor dan Impor Data" description="Simpan atau pulihkan semua data ke file" href="/settings/backup" />
        </div>

        <SectionHeader title="Zona Berbahaya" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          {hasPin && (
            <SettingRow icon={<Lock size={18} className="text-text-muted" />} label="Kunci Aplikasi" description="Kunci sekarang dan tampilkan layar PIN" onClick={lock} right={<span className="text-xs text-text-muted flex-shrink-0">Kunci</span>} />
          )}
          <SettingRow icon={<Trash2 size={18} className="text-danger" />} label="Hapus Semua Data" description="Menghapus seluruh data secara permanen" onClick={() => setDeleteOpen(true)} danger right={<span className="text-xs text-danger/70 flex-shrink-0">Hapus</span>} />
        </div>

        <SectionHeader title="Tentang Aplikasi" />
        <div className="mx-4 rounded-2xl overflow-hidden shadow-card bg-bg-surface divide-y divide-bg-page">
          <SettingRow icon={<BookOpen size={18} className="text-accent-primary" />} label="Lisensi" description="MIT License. Ketuk untuk lihat teks lengkap." onClick={() => setLicenseOpen(true)} />
        </div>

        <div className="px-4 pt-8 pb-4 text-center text-xs text-text-muted space-y-1">
          <p className="font-bold text-text-primary">Catatan Keuangan</p>
          <p>Versi {import.meta.env.VITE_APP_VERSION} ({import.meta.env.VITE_BUILD_DATE})</p>
          <p className="text-text-primary font-medium">Developer: Aby Abdillah</p>
          <p>Data sepenuhnya tersimpan di perangkat Anda. Tidak ada server.</p>
        </div>
      </div>

      <BottomSheet isOpen={editNameOpen} onClose={() => setEditNameOpen(false)} title="Edit Nama">
        <div className="p-4 space-y-3 pb-8">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama Anda"
            className="w-full bg-bg-card rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            autoFocus
            maxLength={40}
          />
          <button
            onClick={() => { void handleSaveName(newName); setEditNameOpen(false); }}
            disabled={!newName.trim()}
            className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold text-sm disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={autoLockOpen} onClose={() => setAutoLockOpen(false)} title="Kunci Otomatis">
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
              {autoLockSeconds === Number(secs) && <Check size={16} className="text-accent-primary" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      {pinSheet !== null && (
        <PINSheet isOpen mode={pinSheet} onClose={() => setPinSheet(null)} />
      )}

      <DeleteAllSheet isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} />

      <BottomSheet isOpen={licenseOpen} onClose={() => setLicenseOpen(false)} title="MIT License">
        <div className="px-5 pb-8 pt-2 overflow-y-auto max-h-[60vh]">
          <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap font-mono bg-bg-card rounded-2xl p-4">
{`MIT License

Copyright (c) 2024 Aby Abdillah

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`}
          </p>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={baseCurrencyOpen} onClose={() => setBaseCurrencyOpen(false)} title="Mata Uang Dasar">
        <div className="pb-6">
          {PINNED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { void updateBaseCurrency(c.code); setBaseCurrencyOpen(false); showToast("Mata uang dasar diperbarui", "success"); }}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors",
                baseCurrency === c.code ? "text-accent-primary bg-accent-primary/5" : "text-text-primary active:bg-bg-card",
              )}
            >
              <span className="text-lg flex-shrink-0">{c.flag}</span>
              <span className="flex-1 text-left">{c.code} — {c.name}</span>
              {baseCurrency === c.code && <Check size={16} className="text-accent-primary" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet isOpen={dateFormatOpen} onClose={() => setDateFormatOpen(false)} title="Format Tanggal">
        <div className="pb-6">
          {(
            [
              { key: "id" as DateFormatKey, label: "Indonesia", example: "12 Jan 2025" },
              { key: "us" as DateFormatKey, label: "Amerika Serikat", example: "Jan 12, 2025" },
              { key: "iso" as DateFormatKey, label: "ISO 8601", example: "2025-01-12" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => { void updateDateFormat(opt.key); setDateFormatOpen(false); showToast("Format tanggal diperbarui", "success"); }}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors",
                dateFormat === opt.key ? "text-accent-primary bg-accent-primary/5" : "text-text-primary active:bg-bg-card",
              )}
            >
              <span className="flex-1 text-left">
                {opt.label}
                <span className="block text-xs text-text-muted font-normal">{opt.example}</span>
              </span>
              {dateFormat === opt.key && <Check size={16} className="text-accent-primary" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet isOpen={textSizeOpen} onClose={() => setTextSizeOpen(false)} title="Ukuran Teks">
        <div className="pb-6">
          {(
            [
              { key: "sm" as TextSizeKey, label: "Kecil", sub: "14px — untuk layar kecil" },
              { key: "md" as TextSizeKey, label: "Normal", sub: "16px — standar" },
              { key: "lg" as TextSizeKey, label: "Besar", sub: "18px — lebih mudah dibaca" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => { void updateTextSize(opt.key); setTextSizeOpen(false); showToast("Ukuran teks diperbarui", "success"); }}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors",
                textSize === opt.key ? "text-accent-primary bg-accent-primary/5" : "text-text-primary active:bg-bg-card",
              )}
            >
              <span className="flex-1 text-left">
                {opt.label}
                <span className="block text-xs text-text-muted font-normal">{opt.sub}</span>
              </span>
              {textSize === opt.key && <Check size={16} className="text-accent-primary" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
