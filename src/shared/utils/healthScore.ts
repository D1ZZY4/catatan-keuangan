import type { Budget, Category, Transaction } from '../types';

export interface HealthScoreBreakdown {
  total: number;
  label: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perhatian';
  components: {
    savingsRate: { score: number; label: string; detail: string };
    budgetAdherence: { score: number; label: string; detail: string };
    trackingFrequency: { score: number; label: string; detail: string };
    categoryDiversity: { score: number; label: string; detail: string };
  };
}

export function computeHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  _categories: Category[],
): HealthScoreBreakdown {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthTx = transactions.filter((tx) => tx.date >= monthStart);

  // 1. Savings rate (0-30)
  const income = monthTx
    .filter((tx) =>
      ['income', 'debt_received', 'invest_sell', 'savings_withdraw'].includes(tx.type),
    )
    .reduce((s, tx) => s + tx.amount, 0);
  const expense = monthTx
    .filter((tx) =>
      ['expense', 'transfer_external', 'invest_buy', 'debt_given'].includes(tx.type),
    )
    .reduce((s, tx) => s + tx.amount, 0);

  const savingsRate = income > 0 ? Math.max(0, (income - expense) / income) : 0;
  const savingsScore = Math.round(Math.min(30, savingsRate * 120));
  const savingsLabel =
    savingsScore >= 25 ? 'Sangat Baik' : savingsScore >= 15 ? 'Baik' : savingsScore >= 5 ? 'Cukup' : 'Rendah';

  // 2. Budget adherence (0-30)
  let budgetScore = 30;
  if (budgets.length > 0) {
    const violations = budgets.filter((budget) => {
      const spent = monthTx
        .filter((tx) => tx.categoryId === budget.categoryId && tx.type === 'expense')
        .reduce((s, tx) => s + tx.amount, 0);
      return spent > budget.amount;
    }).length;
    budgetScore = Math.round(30 * (1 - violations / budgets.length));
  }
  const budgetLabel =
    budgetScore >= 25 ? 'Dalam Batas' : budgetScore >= 15 ? 'Sedikit Lewat' : 'Melewati Anggaran';

  // 3. Tracking frequency (0-20)
  const uniqueDays = new Set(
    monthTx.map((tx) => new Date(tx.date).toDateString()),
  ).size;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const trackingRate = Math.min(1, uniqueDays / (daysInMonth * 0.7));
  const trackingScore = Math.round(trackingRate * 20);
  const trackingLabel =
    trackingScore >= 16 ? 'Rajin Mencatat' : trackingScore >= 10 ? 'Cukup Aktif' : 'Perlu Lebih Sering';

  // 4. Category diversity (0-20)
  const uniqueCategories = new Set(monthTx.map((tx) => tx.categoryId)).size;
  const diversityScore = Math.round(Math.min(20, uniqueCategories * 4));
  const diversityLabel =
    diversityScore >= 16 ? 'Beragam' : diversityScore >= 8 ? 'Cukup Beragam' : 'Kurang Beragam';

  const total = savingsScore + budgetScore + trackingScore + diversityScore;
  const label =
    total >= 80
      ? 'Sangat Baik'
      : total >= 60
      ? 'Baik'
      : total >= 40
      ? 'Cukup'
      : 'Perlu Perhatian';

  return {
    total,
    label,
    components: {
      savingsRate: {
        score: savingsScore,
        label: savingsLabel,
        detail: `${Math.round(savingsRate * 100)}% dari pendapatan ditabung`,
      },
      budgetAdherence: {
        score: budgetScore,
        label: budgetLabel,
        detail:
          budgets.length > 0
            ? `${budgets.length - Math.round((30 - budgetScore) / 30 * budgets.length)} dari ${budgets.length} anggaran terpenuhi`
            : 'Belum ada anggaran',
      },
      trackingFrequency: {
        score: trackingScore,
        label: trackingLabel,
        detail: `Mencatat ${uniqueDays} hari bulan ini`,
      },
      categoryDiversity: {
        score: diversityScore,
        label: diversityLabel,
        detail: `${uniqueCategories} kategori digunakan`,
      },
    },
  };
}
