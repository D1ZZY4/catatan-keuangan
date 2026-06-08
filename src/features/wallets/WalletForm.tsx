import React, { useState } from "react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { IconPicker } from "@/shared/components/IconPicker";
import { ColorPicker } from "@/shared/components/ColorPicker";
import { CurrencySelector } from "./CurrencySelector";
import { useAppData } from "@/app/AppDataContext";
import { useToast } from "@/shared/hooks/useToast";
import { evaluateAmount } from "@/shared/utils/math";
import { getCurrencyInfo } from "@/shared/data/currencies";
import { cn } from "@/shared/utils/misc";
import type { Wallet } from "@/shared/types";

interface WalletFormProps {
  isOpen: boolean;
  onClose: () => void;
  editWallet?: Wallet;
}

type FormTab = "basic" | "icon" | "color";

export function WalletForm({ isOpen, onClose, editWallet }: WalletFormProps) {
  const { addWallet, updateWallet } = useAppData();
  const { showToast } = useToast();

  const [tab, setTab] = useState<FormTab>("basic");
  const [name, setName] = useState(editWallet?.name ?? "");
  const [icon, setIcon] = useState(editWallet?.icon ?? "Wallet");
  const [color, setColor] = useState(editWallet?.color ?? "#8CC0EB");
  const [currency, setCurrency] = useState(editWallet?.currency ?? "IDR");
  const [initialBalance, setInitialBalance] = useState(
    editWallet ? String(editWallet.initialBalance) : "0",
  );
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currencyInfo = getCurrencyInfo(currency);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Nama dompet tidak boleh kosong", "error");
      return;
    }
    setLoading(true);
    try {
      const balance = evaluateAmount(initialBalance) ?? 0;
      if (editWallet) {
        await updateWallet({ ...editWallet, name: name.trim(), icon, color, currency, initialBalance: balance });
        showToast("Dompet berhasil diperbarui", "success");
      } else {
        await addWallet({ name: name.trim(), icon, color, currency, initialBalance: balance, isArchived: false });
        showToast("Dompet berhasil ditambahkan", "success");
      }
      onClose();
    } catch {
      showToast("Gagal menyimpan dompet", "error");
    } finally {
      setLoading(false);
    }
  };

  const TABS: { id: FormTab; label: string }[] = [
    { id: "basic", label: "Dasar" },
    { id: "icon", label: "Ikon" },
    { id: "color", label: "Warna" },
  ];

  return (
    <>
      <BottomSheet
        isOpen={isOpen && !currencyOpen}
        onClose={onClose}
        title={editWallet ? "Edit Dompet" : "Tambah Dompet"}
        fullHeight
      >
        <div className="flex border-b border-bg-card">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "text-accent-primary border-b-2 border-accent-primary"
                  : "text-text-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {tab === "basic" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Nama Dompet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth. Dompet Tunai"
                  className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
                  autoFocus
                  maxLength={40}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Mata Uang</label>
                <button
                  onClick={() => setCurrencyOpen(true)}
                  className="w-full bg-bg-card rounded-xl px-4 py-3 flex items-center gap-3 text-left"
                >
                  <span className="text-xl">{currencyInfo.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{currency}</p>
                    <p className="text-xs text-text-muted">{currencyInfo.name}</p>
                  </div>
                  <span className="text-text-muted text-xs">Ubah</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Saldo Awal</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
                />
              </div>
            </>
          )}

          {tab === "icon" && (
            <IconPicker value={icon} onChange={setIcon} color={color} />
          )}

          {tab === "color" && (
            <ColorPicker value={color} onChange={setColor} />
          )}
        </div>

        <div className="px-4 pb-6 pt-2">
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab"
          >
            {loading ? "Menyimpan…" : editWallet ? "Simpan Perubahan" : "Tambah Dompet"}
          </button>
        </div>
      </BottomSheet>

      <CurrencySelector
        isOpen={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
        value={currency}
        onChange={setCurrency}
      />
    </>
  );
}
