import type { Transaction, Budget, Category } from "@/shared/types";

export interface HealthScoreBreakdown {
  hasData: boolean;
  score: number;
  savingsScore: number;
  budgetScore: number;
  frequencyScore: number;
  diversityScore: number;
  savingsRate: number;
  label: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian";
}

const INCOME_TYPES = ["income", "debt_received", "savings_withdraw", "invest_sell"];
const EXPENSE_TYPES = ["expense", "transfer_external", "debt_given", "savings_deposit", "invest_buy"];

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

  // Not enough data to produce a meaningful score
  if (recent.length === 0) return EMPTY;

  const income = recent
    .filter((tx) => INCOME_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);
  const expense = recent
    .filter((tx) => EXPENSE_TYPES.includes(tx.type))
    .reduce((s, tx) => s + tx.amount, 0);

  const savingsRate = income > 0 ? Math.max(0, (income - expense) / income) : 0;
  const savingsScore = clamp(Math.round((savingsRate / 0.2) * 30), 0, 30);

  // budgetScore: 0 when no budgets set (not a free 30 — encourage users to set budgets)
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

  // When no budgets, scale up other components so max is still ~100
  // savingsScore + frequencyScore + diversityScore = 70 max → scale to 100
  const rawScore = budgets.length === 0
    ? Math.round((savingsScore + frequencyScore + diversityScore) / 70 * 100)
    : savingsScore + budgetScore + frequencyScore + diversityScore;

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
    label,
  };
}
