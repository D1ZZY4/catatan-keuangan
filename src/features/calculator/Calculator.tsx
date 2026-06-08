import React, { useCallback, useState } from "react";
import { Delete } from "lucide-react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";

interface HistoryEntry {
  expression: string;
  result: string;
}

const PAD = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", "0", ".", "="],
] as const;

function safeEval(expr: string): number | null {
  try {
    const cleaned = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/[^0-9+\-*/.()%]/g, "");
    if (!cleaned) return null;
    const result = Function(`"use strict"; return (${cleaned})`)() as unknown;
    if (typeof result !== "number" || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
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

  const handleKey = useCallback(
    (key: string) => {
      if (key === "C") {
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

      if (key === "=") {
        const fullExpr = expression + display;
        const result = safeEval(fullExpr);
        if (result !== null) {
          const resultStr = String(parseFloat(result.toFixed(10)));
          setHistory((h) =>
            [{ expression: fullExpr, result: resultStr }, ...h].slice(0, 5),
          );
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

      // digit
      if (justEvaluated) {
        setDisplay(key);
        setExpression("");
        setJustEvaluated(false);
        return;
      }
      setDisplay((d) => (d === "0" ? key : d + key));
    },
    [display, expression, justEvaluated],
  );

  const result = safeEval(expression + display);

  const handleUseValue = () => {
    void navigator.clipboard.writeText(display).catch(() => null);
    showToast(`${display} disalin ke clipboard`, "success");
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Kalkulator">
      <div className="h-[320px] flex flex-col">
        <div className="px-4 py-3 flex-shrink-0 border-b border-bg-card space-y-1 min-h-[80px]">
          {history.length > 0 && (
            <div className="space-y-0.5 mb-2">
              {history.slice(0, 3).map((h, i) => (
                <p key={i} className="text-xs text-text-muted text-right truncate">
                  {h.expression} = {h.result}
                </p>
              ))}
            </div>
          )}
          <p className="text-xs text-text-muted text-right min-h-[16px]">
            {expression}
          </p>
          <p className="text-3xl font-semibold text-text-primary text-right tabular-nums">
            {display}
          </p>
          {result !== null && expression && (
            <p className="text-xs text-accent-primary text-right">= {result}</p>
          )}
        </div>

        <div className="flex-1 grid grid-cols-4 divide-x divide-y divide-bg-card">
          {PAD.flatMap((row, ri) =>
            row.map((key, ci) => {
              const isOp = ["+", "-", "×", "÷", "="].includes(key);
              const isFn = ["C", "±", "%"].includes(key);
              const isWide = key === "0" && ci === 0;
              return (
                <button
                  key={`${ri}-${ci}`}
                  onClick={() => handleKey(key)}
                  className={cn(
                    "flex items-center justify-center text-base font-medium active:bg-bg-card transition-colors",
                    isOp && "text-accent-primary font-semibold",
                    isFn && "text-text-muted",
                    key === "=" && "bg-accent-primary text-white active:bg-accent-primary/80",
                    isWide && "col-span-2",
                  )}
                  aria-label={key}
                >
                  {key === "0" && isWide ? "0" : key}
                </button>
              );
            }),
          )}
        </div>

        <div className="px-4 py-3 border-t border-bg-card flex-shrink-0">
          <button
            onClick={handleUseValue}
            className="w-full py-2.5 bg-bg-card rounded-xl text-sm font-medium text-accent-primary active:scale-[0.98] transition-transform"
          >
            Gunakan nilai ini
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
