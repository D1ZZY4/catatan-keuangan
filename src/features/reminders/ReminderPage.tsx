import React, { useState } from "react";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAppData } from "@/app/AppDataContext";
import { useToast } from "@/shared/hooks/useToast";
import { notificationService } from "@/shared/services/NotificationService";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import type { Reminder } from "@/shared/types";

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  editReminder?: Reminder;
}

function ReminderForm({ isOpen, onClose, editReminder }: ReminderFormProps) {
  const { addReminder, updateReminder } = useAppData();
  const { showToast } = useToast();

  const [name, setName] = useState(editReminder?.name ?? "");
  const [amount, setAmount] = useState(editReminder?.amount !== undefined ? String(editReminder.amount) : "");
  const [currency, setCurrency] = useState(editReminder?.currency ?? "IDR");
  const [period, setPeriod] = useState<"monthly" | "weekly">(editReminder?.period ?? "monthly");
  const [dueDay, setDueDay] = useState(editReminder?.dueDay ?? 1);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(editReminder?.notifyDaysBefore ?? 3);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { showToast("Nama pengingat kosong", "error"); return; }
    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        ...(amount ? { amount: parseFloat(amount.replace(/\D/g, "")) } : {}),
        currency,
        period,
        dueDay,
        notifyDaysBefore,
        isActive: true,
        category: "",
      };
      if (editReminder) {
        await updateReminder({ ...editReminder, ...data });
        showToast("Pengingat diperbarui", "success");
      } else {
        await addReminder(data);
        showToast("Pengingat ditambahkan", "success");
      }
      onClose();
    } catch {
      showToast("Gagal menyimpan pengingat", "error");
    } finally {
      setLoading(false);
    }
  };

  const dueDayLabel = period === "monthly"
    ? `Tanggal ${dueDay} setiap bulan`
    : `Hari ${["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][dueDay] ?? dueDay} setiap minggu`;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={editReminder ? "Edit Pengingat" : "Tambah Pengingat"} fullHeight>
      <div className="p-4 space-y-4 pb-8">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Nama Tagihan / Pengingat</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="cth. Tagihan Listrik" autoFocus
            className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
            maxLength={60} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Nominal (opsional)</label>
          <input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="cth. 500000"
            className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Periode</label>
          <div className="flex gap-2">
            {(["monthly", "weekly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all",
                  period === p ? "bg-accent-primary/10 border-accent-primary text-accent-primary" : "bg-bg-card border-bg-card text-text-muted")}>
                {p === "monthly" ? "Bulanan" : "Mingguan"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">
            {period === "monthly" ? "Tanggal jatuh tempo" : "Hari jatuh tempo"}
          </label>
          {period === "monthly" ? (
            <input type="number" min={1} max={31} value={dueDay}
              onChange={(e) => setDueDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
              className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/40" />
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {["Min","Sen","Sel","Rab","Kam","Jum","Sab"].map((d, i) => (
                <button key={d} onClick={() => setDueDay(i)}
                  className={cn("py-2 rounded-xl text-xs font-medium transition-all",
                    dueDay === i ? "bg-accent-primary text-white" : "bg-bg-card text-text-muted")}>
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Ingatkan berapa hari sebelumnya</label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 7].map((d) => (
              <button key={d} onClick={() => setNotifyDaysBefore(d)}
                className={cn("flex-1 py-2 rounded-xl text-xs font-medium transition-all",
                  notifyDaysBefore === d ? "bg-accent-primary text-white" : "bg-bg-card text-text-muted")}>
                {d}h
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-text-muted bg-bg-card rounded-xl px-3 py-2.5">
          📅 {dueDayLabel} · Notifikasi {notifyDaysBefore} hari sebelumnya
        </p>

        <button onClick={() => void handleSave()} disabled={loading || !name.trim()}
          className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab">
          {loading ? "Menyimpan…" : editReminder ? "Simpan" : "Tambah Pengingat"}
        </button>
      </div>
    </BottomSheet>
  );
}

export function ReminderPage() {
  const { reminders, updateReminder, removeReminder } = useAppData();
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editReminder, setEditReminder] = useState<Reminder | undefined>();

  const handleToggle = async (r: Reminder) => {
    await updateReminder({ ...r, isActive: !r.isActive });
  };

  const handleNotifPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) showToast("Notifikasi diaktifkan", "success");
    else showToast("Izin notifikasi ditolak", "warning");
  };

  return (
    <>
      <AppBar title="Pengingat Tagihan" showBack
        actions={
          <button onClick={() => { setEditReminder(undefined); setFormOpen(true); }}
            className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center shadow-fab active:scale-90 transition-transform"
            aria-label="Tambah pengingat">
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      {!notificationService.isGranted && (
        <div className="mx-4 mt-3 p-3 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-3">
          <Bell size={16} className="text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-text-primary">Aktifkan notifikasi</p>
            <p className="text-xs text-text-muted">Agar pengingat bisa tampil di HP kamu</p>
          </div>
          <button onClick={() => void handleNotifPermission()}
            className="text-xs text-accent-primary font-semibold flex-shrink-0">
            Aktifkan
          </button>
        </div>
      )}

      {reminders.length === 0 ? (
        <EmptyState title="Belum ada pengingat"
          description="Tambahkan tagihan rutin seperti listrik, air, atau cicilan agar tidak lupa"
          action={{ label: "+ Tambah Pengingat", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="divide-y divide-bg-card">
          {reminders.map((r) => {
            const today = new Date();
            let dueDate: Date;
            if (r.period === "monthly") {
              dueDate = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
              if (dueDate.getTime() < Date.now()) {
                dueDate = new Date(today.getFullYear(), today.getMonth() + 1, r.dueDay);
              }
            } else {
              const diff = (r.dueDay - today.getDay() + 7) % 7;
              dueDate = new Date(today);
              dueDate.setDate(today.getDate() + diff);
            }
            const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);

            return (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  r.isActive ? "bg-accent-primary/15" : "bg-bg-card")}>
                  <Bell size={18} className={r.isActive ? "text-accent-primary" : "text-text-muted"} />
                </div>
                <div className="flex-1 min-w-0"
                  onClick={() => { setEditReminder(r); setFormOpen(true); }}>
                  <p className={cn("text-sm font-medium truncate", !r.isActive && "text-text-muted")}>{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.amount !== undefined && (
                      <span className="text-xs font-semibold text-text-primary">
                        {formatCurrency(r.amount, r.currency)}
                      </span>
                    )}
                    <span className={cn("text-xs",
                      daysLeft <= 3 ? "text-warning font-semibold" : "text-text-muted")}>
                      {daysLeft === 0 ? "Hari ini" : daysLeft === 1 ? "Besok" : `${daysLeft} hari lagi`}
                    </span>
                  </div>
                </div>
                <button onClick={() => void handleToggle(r)}
                  className={cn("w-9 h-9 flex items-center justify-center rounded-full transition-colors flex-shrink-0",
                    r.isActive ? "text-accent-primary" : "text-text-muted")}>
                  {r.isActive ? <Bell size={18} /> : <BellOff size={18} />}
                </button>
                <button onClick={() => { void removeReminder(r.id); showToast("Pengingat dihapus", "success"); }}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-danger flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ReminderForm isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditReminder(undefined); }}
        {...(editReminder !== undefined ? { editReminder } : {})} />
    </>
  );
}
