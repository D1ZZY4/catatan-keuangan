import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { TransactionModel, CategoryModel, WalletModel } from '@/shared/db';
import type { Transaction, TransactionType } from '@/shared/types';
import { startOfDay, startOfMonth, groupBy } from '@/shared/utils/helpers';
import { isIncomeType, isExpenseType, isTransferType } from '@/shared/constants/transactionTypes';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';
type TypeFilter = 'all' | 'income' | 'expense' | 'transfer';

export interface EnrichedTransaction extends Transaction {
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  walletName: string;
}

export interface TransactionSection {
  date: number;
  data: EnrichedTransaction[];
  total: number;
  title: string;
}

interface Params {
  period: PeriodFilter;
  typeFilter: TypeFilter;
  search: string;
}

export function useTransactionList({ period, typeFilter, search }: Params) {
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const now = Date.now();

      let startTs = 0;
      if (period === 'today') {
        startTs = startOfDay(now);
      } else if (period === 'week') {
        startTs = now - 7 * 86_400_000;
      } else if (period === 'month') {
        startTs = startOfMonth(now);
      }

      const [records, categories, wallets] = await Promise.all([
        database.get<TransactionModel>('transactions').query().fetch(),
        database.get<CategoryModel>('categories').query().fetch(),
        database.get<WalletModel>('wallets').query().fetch(),
      ]);

      const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
      const walletMap = Object.fromEntries(wallets.map(w => [w.id, w]));

      let filtered = period !== 'all' ? records.filter(tx => tx.date >= startTs) : records;

      let mapped: EnrichedTransaction[] = filtered.map(tx => {
        const cat = catMap[tx.categoryId];
        const wallet = walletMap[tx.walletId];
        return {
          id: tx.id,
          type: tx.type as TransactionType,
          walletId: tx.walletId,
          ...(tx.toWalletId ? { toWalletId: tx.toWalletId } : {}),
          categoryId: tx.categoryId,
          amount: tx.amount,
          currency: tx.currency,
          ...(tx.note ? { note: tx.note } : {}),
          ...(tx.personName ? { personName: tx.personName } : {}),
          ...(tx.personPhone ? { personPhone: tx.personPhone } : {}),
          date: tx.date,
          createdAt: tx.createdAt.getTime(),
          categoryName: cat?.name ?? '',
          categoryColor: cat?.color ?? '#999',
          categoryIcon: cat?.icon ?? 'circle',
          walletName: wallet?.name ?? '',
        };
      });

      if (typeFilter !== 'all') {
        mapped = mapped.filter(tx => {
          if (typeFilter === 'income') return isIncomeType(tx.type);
          if (typeFilter === 'expense') return isExpenseType(tx.type);
          if (typeFilter === 'transfer') return isTransferType(tx.type);
          return true;
        });
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        mapped = mapped.filter(tx =>
          tx.note?.toLowerCase().includes(q) ||
          tx.personName?.toLowerCase().includes(q) ||
          tx.categoryName.toLowerCase().includes(q) ||
          tx.amount.toString().includes(q),
        );
      }

      mapped.sort((a, b) => b.date - a.date);

      const grouped = groupBy(mapped, tx => startOfDay(tx.date));
      const sectionList: TransactionSection[] = Object.entries(grouped)
        .map(([dateStr, items]) => {
          const date = parseInt(dateStr, 10);
          const total = items.reduce((sum, tx) => {
            if (isIncomeType(tx.type)) return sum + tx.amount;
            if (isExpenseType(tx.type)) return sum - tx.amount;
            return sum;
          }, 0);
          return { date, data: items, total, title: dateStr };
        })
        .sort((a, b) => b.date - a.date);

      setSections(sectionList);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, typeFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => void load(true), [load]);

  return { sections, loading, refreshing, refresh };
}
