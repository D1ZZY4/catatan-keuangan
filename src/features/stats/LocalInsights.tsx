import React, { useMemo } from "react";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { useAppData } from "@/app/AppDataContext";
import { formatCurrency } from "@/shared/utils/format";
import { cn } from "@/shared/utils/misc";
import { EXPENSE_TYPES, INCOME_TYPES } from "@/shared/constants/transactionTypes";

interface Insight {
  id: string;
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
  text: string;
}

export function LocalInsights() {
  const { transactions, categories } = useAppData();

  const insights = useMemo((): Insight[] => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = now.getTime();

    const monthTx = transactions.filter((tx) => tx.date >= startOfMonth && tx.date <= endOfMonth);

    const monthIncome = monthTx.filter((tx) => INCOME_TYPES.includes(tx.type)).reduce((s, tx) => s + tx.amount, 0);
    const monthExpense = monthTx.filter((tx) => EXPENSE_TYPES.includes(tx.type)).reduce((s, tx) => s + tx.amount, 0);

    const result: Insight[] = [];

    const catSpend: Record<string, number> = {};
    for (const tx of monthTx) {
      if (EXPENSE_TYPES.includes(tx.type)) {
        catSpend[tx.categoryId] = (catSpend[tx.categoryId] ?? 0) + tx.amount;
      }
    }

    const topCatId = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
    if (topCatId !== undefined) {
      const cat = categories.find((c) => c.id === topCatId[0]);
      if (cat !== undefined) {
        result.push({
          id: "top-cat",
          icon: TrendingDown,
          iconClass: "text-danger",
          bgClass: "bg-danger/10",
          text: `Pengeluaran terbesar bulan ini: ${cat.name} (${formatCurrency(topCatId[1], "IDR")})`,
        });
      }
    }

    if (monthIncome > 0) {
      const savingsRate = ((monthIncome - monthExpense) / monthIncome) * 100;
      result.push({
        id: "savings-rate",
        icon: savingsRate >= 20 ? TrendingUp : TrendingDown,
        iconClass: savingsRate >= 20 ? "text-success" : "text-warning",
        bgClass: savingsRate >= 20 ? "bg-success/10" : "bg-warning/10",
        text: `Rasio tabungan bulan ini: ${savingsRate.toFixed(1)}%${
          savingsRate >= 20 ? " — di atas target 20%, bagus!" : " — target minimal 20%"
        }`,
      });
    }

    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime();
    const prevTx = transactions.filter((tx) => tx.date >= threeMonthsAgo && tx.date < startOfMonth);

    if (prevTx.length > 0 && topCatId !== undefined) {
      const prevCatSpend = prevTx
        .filter((tx) => EXPENSE_TYPES.includes(tx.type) && tx.categoryId === topCatId[0])
        .reduce((s, tx) => s + tx.amount, 0);
      const avgPrevMonthly = prevCatSpend / 3;
      const thisMonthCat = topCatId[1] ?? 0;
      if (avgPrevMonthly > 0 && thisMonthCat > 0) {
        const diffPct = ((thisMonthCat - avgPrevMonthly) / avgPrevMonthly) * 100;
        const cat = categories.find((c) => c.id === topCatId[0]);
        if (cat !== undefined && Math.abs(diffPct) > 5) {
          result.push({
            id: "cat-trend",
            icon: diffPct > 0 ? TrendingDown : TrendingUp,
            iconClass: diffPct > 0 ? "text-danger" : "text-success",
            bgClass: diffPct > 0 ? "bg-danger/10" : "bg-success/10",
            text: `${cat.name} bulan ini ${Math.abs(diffPct).toFixed(0)}% ${
              diffPct > 0 ? "lebih tinggi" : "lebih rendah"
            } dari rata-rata 3 bulan lalu`,
          });
        }
      }
    }

    return result.slice(0, 3);
  }, [transactions, categories]);

  if (insights.length === 0) return null;

  return (
    <div className="px-4 space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Lightbulb size={13} className="text-accent-warm" />
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Analitik Lokal</p>
      </div>
      {insights.map((ins) => (
        <div
          key={ins.id}
          className={cn("flex items-start gap-3 rounded-xl px-3.5 py-3 text-xs text-text-primary", ins.bgClass)}
        >
          <div className={cn("mt-0.5 flex-shrink-0", ins.iconClass)}>
            <ins.icon size={14} strokeWidth={2.5} />
          </div>
          <p className="leading-relaxed">{ins.text}</p>
        </div>
      ))}
    </div>
  );
}
