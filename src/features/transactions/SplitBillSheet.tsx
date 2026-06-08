import React, { useState, useMemo, useCallback } from "react";
import { Minus, Plus, Users } from "lucide-react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";

interface SplitBillSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDebt?: (amount: number, name: string) => void;
}

interface Person {
  name: string;
  amountStr: string;
  amount: number;
}

export function SplitBillSheet({ isOpen, onClose, onCreateDebt }: SplitBillSheetProps) {
  const [totalRaw, setTotalRaw] = useState("");
  const [total, setTotal] = useState(0);
  const [equalSplit, setEqualSplit] = useState(true);
  const [people, setPeople] = useState<Person[]>([
    { name: "Orang 1", amountStr: "", amount: 0 },
    { name: "Orang 2", amountStr: "", amount: 0 },
  ]);

  const perPerson = useMemo(() => {
    if (people.length === 0 || total <= 0) return 0;
    return Math.ceil(total / people.length);
  }, [total, people.length]);

  const customTotal = useMemo(() => people.reduce((s, p) => s + p.amount, 0), [people]);
  const remainder = equalSplit ? 0 : total - customTotal;

  const addPerson = useCallback(() => {
    setPeople((prev) =>
      prev.length < 10
        ? [...prev, { name: `Orang ${prev.length + 1}`, amountStr: "", amount: 0 }]
        : prev,
    );
  }, []);

  const removePerson = useCallback((idx: number) => {
    setPeople((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== idx) : prev));
  }, []);

  const updateName = useCallback((idx: number, name: string) => {
    setPeople((prev) => prev.map((p, i) => (i === idx ? { ...p, name } : p)));
  }, []);

  const updateAmount = useCallback((idx: number, amountStr: string) => {
    const amount = parseInt(amountStr.replace(/\D/g, ""), 10) || 0;
    setPeople((prev) => prev.map((p, i) => (i === idx ? { ...p, amountStr, amount } : p)));
  }, []);

  const handleClose = useCallback(() => {
    setTotalRaw("");
    setTotal(0);
    setEqualSplit(true);
    setPeople([
      { name: "Orang 1", amountStr: "", amount: 0 },
      { name: "Orang 2", amountStr: "", amount: 0 },
    ]);
    onClose();
  }, [onClose]);

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Hitung Bagi Tagihan">
      <div className="px-4 pb-8 space-y-5">
        <div className="flex items-center gap-2 p-3 bg-accent-primary/10 rounded-xl">
          <Users size={16} className="text-accent-primary flex-shrink-0" />
          <p className="text-xs text-text-muted leading-relaxed">
            Bagi tagihan secara merata atau kustom per orang.
            Hasil bisa langsung dicatat sebagai piutang.
          </p>
        </div>

        {/* Total */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Total Tagihan</label>
          <CurrencyInput
            value={totalRaw}
            onChange={(raw, evaluated) => {
              setTotalRaw(raw);
              if (evaluated !== null) setTotal(evaluated);
            }}
            currency="IDR"
          />
        </div>

        {/* Mode bagi */}
        <div className="flex gap-2">
          {(["Rata", "Kustom"] as const).map((label) => (
            <button
              key={label}
              onClick={() => setEqualSplit(label === "Rata")}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-xl transition-all",
                (label === "Rata") === equalSplit
                  ? "bg-accent-primary text-white"
                  : "bg-bg-surface text-text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Daftar peserta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Peserta ({people.length} orang)
            </span>
            <button
              onClick={addPerson}
              disabled={people.length >= 10}
              className="text-xs font-semibold text-accent-primary disabled:opacity-40 flex items-center gap-0.5"
              aria-label="Tambah peserta"
            >
              <Plus size={13} /> Tambah
            </button>
          </div>

          {people.map((person, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-bg-card rounded-xl px-3 py-2.5">
              <input
                type="text"
                value={person.name}
                onChange={(e) => updateName(idx, e.target.value)}
                className="flex-1 bg-transparent text-sm text-text-primary outline-none min-w-0"
                placeholder={`Orang ${idx + 1}`}
                aria-label={`Nama orang ${idx + 1}`}
              />
              {!equalSplit ? (
                <input
                  type="number"
                  value={person.amountStr}
                  onChange={(e) => updateAmount(idx, e.target.value)}
                  placeholder="0"
                  className="w-28 bg-bg-surface rounded-lg px-2 py-1 text-sm text-right font-mono text-text-primary outline-none focus:ring-1 focus:ring-accent-primary/40"
                  aria-label={`Jumlah ${person.name}`}
                />
              ) : (
                total > 0 && (
                  <span className="text-xs font-mono font-semibold text-success flex-shrink-0">
                    {formatCurrency(perPerson, "IDR")}
                  </span>
                )
              )}
              <button
                onClick={() => removePerson(idx)}
                disabled={people.length <= 2}
                className="w-6 h-6 flex items-center justify-center text-text-muted disabled:opacity-30 flex-shrink-0"
                aria-label={`Hapus ${person.name}`}
              >
                <Minus size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Ringkasan */}
        {total > 0 && (
          <div className="bg-bg-surface rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total tagihan</span>
              <span className="font-semibold text-text-primary">{formatCurrency(total, "IDR")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">
                {equalSplit ? `Dibagi ${people.length} orang` : "Sisa"}
              </span>
              <span className={cn("font-semibold", remainder < 0 ? "text-danger" : "text-success")}>
                {equalSplit
                  ? `${formatCurrency(perPerson, "IDR")} / orang`
                  : formatCurrency(remainder, "IDR")}
              </span>
            </div>
            {!equalSplit && remainder < 0 && (
              <p className="text-xs text-danger">Jumlah per orang melebihi total tagihan</p>
            )}
          </div>
        )}

        {/* Catat piutang */}
        {onCreateDebt !== undefined && total > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-text-muted text-center">
              Catat sebagai piutang:
            </p>
            {people.map((person, idx) => {
              const amt = equalSplit ? perPerson : person.amount;
              return (
                <button
                  key={idx}
                  onClick={() => onCreateDebt(amt, person.name)}
                  disabled={amt <= 0}
                  className="w-full flex items-center justify-between px-4 py-3 bg-bg-card rounded-xl text-sm active:scale-[0.98] transition-transform disabled:opacity-40"
                  aria-label={`Catat piutang ${person.name}`}
                >
                  <span className="font-medium text-text-primary">{person.name}</span>
                  <span className="font-mono text-warning font-semibold">
                    {formatCurrency(amt, "IDR")}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleClose}
          className="w-full py-3.5 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-fab"
        >
          Selesai
        </button>
      </div>
    </BottomSheet>
  );
}
