import type { Transaction, Budget, Category } from "@/shared/types";
import { INCOME_TYPES, EXPENSE_TYPES } from "@/shared/constants/transactionTypes";

export interface HealthScoreBreakdown {
  hasData: boolean;
  score: number;
  savingsScore: number;
  budgetScore: number;
  frequencyScore: number;
  diversityScore: number;
  savingsRate: number;
  hasIncomeData: boolean;
  label: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian";
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const EMPTY: HealthScoreBreakdown = {
  hasData: false,
  score: 0,
  savingsScore: 0,
  budgetScore: 0,
  frequencyScore: 0,
  diversityScore: 0,
  savingsRate: 0,
  hasIncomeData: false,
  label: "Perlu Perhatian",
};

export function computeHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  _categories: Category[],
): HealthScoreBreakdown {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 86400000;
  const recent = transactions.filter((tx) => tx.date >= thirtyDaysAgo);

  if (recent.length === 0) return EMPTY;

  const income = recent
    .filter((tx) => INCOME_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);
  const expense = recent
    .filter((tx) => EXPENSE_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const hasIncomeData = income > 0;

  // Savings: only count when income data exists; if no income yet, skip component
  const savingsRate = hasIncomeData ? Math.max(0, (income - expense) / income) : 0;
  const savingsScore = hasIncomeData
    ? clamp(Math.round((savingsRate / 0.2) * 30), 0, 30)
    : 0;

  // Budget score: 0 when no budgets (encourage user to set them)
  let budgetScore = 0;
  if (budgets.length > 0) {
    const startOfMonth = new Date(now).setDate(1);
    const compliant = budgets.filter((b) => {
      const spent = transactions
        .filter((tx) => tx.categoryId === b.categoryId && tx.date >= startOfMonth && EXPENSE_TYPES.includes(tx.type))
        .reduce((s, tx) => s + tx.amount, 0);
      return spent <= b.amount;
    });
    budgetScore = Math.round((compliant.length / budgets.length) * 30);
  }

  const daysWithTx = new Set(recent.map((tx) => new Date(tx.date).toDateString())).size;
  const avgPerWeek = daysWithTx / 4.3;
  const frequencyScore = clamp(Math.round((avgPerWeek / 5) * 20), 0, 20);

  const uniqueCats = new Set(recent.map((tx) => tx.categoryId)).size;
  const diversityScore = clamp(Math.round((uniqueCats / 5) * 20), 0, 20);

  // Scale score based on which components have data available
  // If no income data: max is 40 (frequency 20 + diversity 20) + budget 30 if set
  // If income data: max is 70 (savings 30 + freq 20 + div 20) + budget 30 if set
  const maxPossible =
    (hasIncomeData ? 30 : 0) +
    (budgets.length > 0 ? 30 : 0) +
    20 + 20;

  const actualScore = (hasIncomeData ? savingsScore : 0) + budgetScore + frequencyScore + diversityScore;

  const rawScore = maxPossible > 0 ? Math.round((actualScore / maxPossible) * 100) : 0;
  const score = clamp(rawScore, 0, 100);

  const label =
    score >= 80
      ? "Sangat Baik"
      : score >= 60
        ? "Baik"
        : score >= 40
          ? "Cukup"
          : "Perlu Perhatian";

  return {
    hasData: true,
    score,
    savingsScore,
    budgetScore,
    frequencyScore,
    diversityScore,
    savingsRate,
    hasIncomeData,
    label,
  };
}
