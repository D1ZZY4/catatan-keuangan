import React, { useCallback, useEffect, useRef, useState } from "react";
import { Calculator, Delete, X } from "lucide-react";
import { useToast } from "@/shared/hooks/useToast";
import { create, all } from "mathjs";
import { cn } from "@/shared/utils/misc";

const math = create(all ?? {}, { number: "number" });

interface HistoryEntry {
  expression: string;
  result: string;
}

type CalcKey =
  | "AC" | "±" | "%" | "÷"
  | "7"  | "8" | "9" | "×"
  | "4"  | "5" | "6" | "-"
  | "1"  | "2" | "3" | "+"
  | "⌫"  | "0" | "." | "=";

const ROWS: CalcKey[][] = [
  ["AC", "±", "%", "÷"],
  ["7",  "8", "9", "×"],
  ["4",  "5", "6", "-"],
  ["1",  "2", "3", "+"],
  ["⌫",  "0", ".", "="],
];

function safeEval(expr: string): number | null {
  try {
    const cleaned = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/[^0-9+\-*/.()%]/g, "");
    if (!cleaned) return null;
    const result: unknown = math.evaluate(cleaned);
    if (typeof result !== "number" || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

function fmtNum(val: string): string {
  if (val.endsWith(".")) return val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  const [intPart, decPart] = val.split(".");
  const formatted = Number(intPart ?? "0").toLocaleString("id-ID");
  return decPart !== undefined ? `${formatted},${decPart}` : formatted;
}

interface CalculatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorSheet({ isOpen, onClose }: CalculatorSheetProps) {
  const { showToast } = useToast();
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleKey = useCallback(
    (key: CalcKey) => {
      if (key === "AC") {
        setDisplay("0");
        setExpression("");
        setJustEvaluated(false);
        return;
      }
      if (key === "±") {
        setDisplay((d) => (d.startsWith("-") ? d.slice(1) : `-${d}`));
        return;
      }
      if (key === "%") {
        const n = parseFloat(display);
        if (!isNaN(n)) setDisplay(String(n / 100));
        return;
      }
      if (key === "⌫") {
        setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
        return;
      }
      if (key === "=") {
        const fullExpr = expression + display;
        const result = safeEval(fullExpr);
        if (result !== null) {
          const resultStr = String(parseFloat(result.toFixed(10)));
          setHistory((h) => [{ expression: fullExpr, result: resultStr }, ...h].slice(0, 5));
          setDisplay(resultStr);
          setExpression("");
          setJustEvaluated(true);
        }
        return;
      }
      const isOperator = ["+", "-", "×", "÷"].includes(key);
      if (isOperator) {
        setExpression(expression + display + key);
        setDisplay("0");
        setJustEvaluated(false);
        return;
      }
      if (key === ".") {
        if (display.includes(".")) return;
        setDisplay((d) => d + ".");
        return;
      }
      if (justEvaluated) {
        setDisplay(key);
        setExpression("");
        setJustEvaluated(false);
        return;
      }
      setDisplay((d) => (d === "0" ? key : d.length < 15 ? d + key : d));
    },
    [display, expression, justEvaluated],
  );

  const previewResult = safeEval(expression + display);

  const handleUseValue = () => {
    void navigator.clipboard.writeText(display).catch(() => null);
    showToast(`${display} disalin ke clipboard`, "success");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-bg-page rounded-t-[28px] shadow-2xl transition-transform duration-300 ease-out select-none",
          visible ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-bg-card" />
        </div>

        <div className="flex items-center justify-between px-5 py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/15 flex items-center justify-center">
              <Calculator size={18} className="text-accent-primary" />
            </div>
            <span className="text-[15px] font-semibold text-text-primary tracking-tight">
              Kalkulator
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-card hover:bg-bg-card/80 active:scale-90 transition-all"
            aria-label="Tutup"
          >
            <X size={15} className="text-text-muted" />
          </button>
        </div>

        <div className="mx-4 mt-2 mb-4 bg-bg-card rounded-2xl px-5 pt-3 pb-4 min-h-[112px] flex flex-col justify-end overflow-hidden">
          {history.length > 0 && (
            <div className="mb-2 space-y-0.5">
              {history.slice(0, 2).map((h, i) => (
                <p
                  key={i}
                  className="text-[11px] text-text-muted/50 text-right truncate font-display tabular-nums"
                >
                  {h.expression} = {h.result}
                </p>
              ))}
            </div>
          )}
          <p className="text-sm text-text-muted text-right min-h-[20px] font-display tabular-nums tracking-wide">
            {expression || "\u00A0"}
          </p>
          <p className="text-[38px] font-bold text-text-primary text-right font-display tabular-nums leading-tight mt-0.5 truncate">
            {fmtNum(display)}
          </p>
          {previewResult !== null && expression && (
            <p className="text-sm text-accent-primary text-right mt-1 font-display tabular-nums">
              = {fmtNum(String(parseFloat(previewResult.toFixed(10))))}
            </p>
          )}
        </div>

        <div className="px-4 space-y-2">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-2">
              {row.map((key) => {
                const isEquals = key === "=";
                const isOp    = ["+", "-", "×", "÷"].includes(key);
                const isFn    = ["AC", "±", "%"].includes(key);
                const isBack  = key === "⌫";
                const isNum   = !isEquals && !isOp && !isFn && !isBack;

                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={cn(
                      "flex-1 h-[60px] flex items-center justify-center rounded-2xl font-semibold select-none transition-all duration-75 active:scale-[0.93]",
                      isEquals && "bg-accent-primary text-white text-2xl shadow-lg shadow-accent-primary/25 active:bg-accent-primary/90",
                      isOp     && "bg-accent-primary/12 text-accent-primary text-2xl dark:bg-accent-primary/20 active:bg-accent-primary/20",
                      isFn     && "bg-bg-card text-text-muted text-lg active:bg-bg-card/70",
                      isBack   && "bg-bg-card text-warning text-lg active:bg-bg-card/70",
                      isNum    && "bg-bg-surface text-text-primary text-xl border border-black/[0.06] shadow-sm dark:border-white/5 active:bg-bg-card",
                    )}
                    aria-label={key}
                  >
                    {key === "⌫" ? <Delete size={20} /> : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="px-4 pt-3 pb-6">
          <button
            onClick={handleUseValue}
            className="w-full py-3.5 rounded-2xl border border-accent-primary/25 bg-accent-primary/8 text-sm font-semibold text-accent-primary active:scale-[0.98] active:bg-accent-primary/15 transition-all"
          >
            Gunakan nilai ini
          </button>
        </div>
      </div>
    </>
  );
}
