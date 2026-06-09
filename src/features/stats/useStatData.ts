import { useState, useEffect } from 'react';
import { database } from '@/shared/db';
import type { TransactionType } from '@/shared/types';
import { startOfMonth, safeDiv } from '@/shared/utils/helpers';
import { isIncomeType, isExpenseType } from '@/shared/constants/transactionTypes';

type PeriodFilter = 'week' | 'month' | '3month' | '6month' | 'year';

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percent: number;
}

export interface MonthlyPoint {
  label: string;
  income: number;
  expense: number;
}

export interface DebtEntry {
  id: string;
  personName: string;
  type: 'debt_given' | 'debt_received';
  amount: number;
  note: string | null;
  date: number;
  isSettled: boolean;
}

export interface RawTx {
  id: string;
  type: string;
  amount: number;
  categoryId: string;
  date: number;
  personName: string | null;
  note: string | null;
}

export interface RawCat {
  id: string;
  name: string;
  color: string;
}

interface StatData {
  totalIncome: number;
  totalExpense: number;
  categoryExpenses: CategoryExpense[];
  monthlyTrend: MonthlyPoint[];
  debtEntries: DebtEntry[];
  allTransactions: RawTx[];
  allCategories: RawCat[];
  loading: boolean;
}

function getStartTs(period: PeriodFilter): number {
  const now = Date.now();
  switch (period) {
    case 'week':   return now - 7 * 86_400_000;
    case 'month':  return startOfMonth(now);
    case '3month': return now - 90 * 86_400_000;
    case '6month': return now - 180 * 86_400_000;
    case 'year':   return new Date(new Date().getFullYear(), 0, 1).getTime();
  }
}

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function buildMonthlyTrend(allTx: RawTx[]): MonthlyPoint[] {
  const now = new Date();
  const points: MonthlyPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startTs = d.getTime();
    const endTs = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    let income = 0;
    let expense = 0;
    for (const tx of allTx) {
      if (tx.date >= startTs && tx.date < endTs) {
        if (isIncomeType(tx.type as TransactionType)) income += tx.amount;
        else if (isExpenseType(tx.type as TransactionType)) expense += tx.amount;
      }
    }
    points.push({ label: SHORT_MONTHS[d.getMonth()] ?? '', income, expense });
  }
  return points;
}

export function useStatData(period: PeriodFilter): StatData {
  const [data, setData] = useState<StatData>({
    totalIncome: 0,
    totalExpense: 0,
    categoryExpenses: [],
    monthlyTrend: [],
    debtEntries: [],
    allTransactions: [],
    allCategories: [],
    loading: true,
  });

  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  async function load() {
    try {
      const startTs = getStartTs(period);
      const [txRecords, catRecords] = await Promise.all([
        database.get<import('@/shared/db').TransactionModel>('transactions').query().fetch(),
        database.get<import('@/shared/db').CategoryModel>('categories').query().fetch(),
      ]);

      const catById: Record<string, { name: string; color: string }> = Object.fromEntries(
        catRecords.map(c => [c.id, { name: c.name, color: c.color }])
      );

      const allTxRaw: RawTx[] = txRecords.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        categoryId: tx.categoryId,
        date: tx.date,
        personName: tx.personName ?? null,
        note: tx.note ?? null,
      }));

      const filtered = allTxRaw.filter(tx => tx.date >= startTs);

      const totalIncome = filtered
        .filter(tx => isIncomeType(tx.type as TransactionType))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalExpense = filtered
        .filter(tx => isExpenseType(tx.type as TransactionType))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const catMap = new Map<string, number>();
      for (const tx of filtered) {
        if (isExpenseType(tx.type as TransactionType)) {
          catMap.set(tx.categoryId, (catMap.get(tx.categoryId) ?? 0) + tx.amount);
        }
      }

      const categoryExpenses: CategoryExpense[] = Array.from(catMap.entries())
        .map(([catId, amount]) => ({
          categoryId: catId,
          categoryName: catById[catId]?.name ?? 'Lainnya',
          color: catById[catId]?.color ?? '#888888',
          amount,
          percent: safeDiv(amount, totalExpense),
        }))
        .sort((a, b) => b.amount - a.amount);

      const monthlyTrend = buildMonthlyTrend(allTxRaw);

      // Debt tracker: mark settled if there's any debt_repay for that person
      const repaidSet = new Set(
        allTxRaw
          .filter(tx => tx.type === 'debt_repay' && tx.personName)
          .map(tx => tx.personName!)
      );

      const debtEntries: DebtEntry[] = allTxRaw
        .filter(tx => tx.type === 'debt_given' || tx.type === 'debt_received')
        .map(tx => ({
          id: tx.id,
          personName: tx.personName ?? 'Tidak dikenal',
          type: tx.type as 'debt_given' | 'debt_received',
          amount: tx.amount,
          note: tx.note,
          date: tx.date,
          isSettled: repaidSet.has(tx.personName ?? ''),
        }))
        .sort((a, b) => b.date - a.date);

      setData({
        totalIncome,
        totalExpense,
        categoryExpenses,
        monthlyTrend,
        debtEntries,
        allTransactions: allTxRaw,
        allCategories: catRecords.map(c => ({ id: c.id, name: c.name, color: c.color })),
        loading: false,
      });
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  }

  return data;
}
