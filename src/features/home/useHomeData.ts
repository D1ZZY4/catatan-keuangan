import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import { Q } from '@nozbe/watermelondb';
import type { WalletModel, TransactionModel, CategoryModel } from '@/shared/db';
import type { Transaction, TransactionType } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/formatters';
import { startOfMonth, endOfMonth } from '@/shared/utils/helpers';
import { isExpenseType, isIncomeType } from '@/shared/constants/transactionTypes';

export interface HomeWallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  type: string;
  balance: number;
  balanceFormatted: string;
  showInDashboard: boolean;
}

export interface HomeTransaction extends Transaction {
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  walletName: string;
  amountFormatted: string;
}

export interface HomeData {
  wallets: HomeWallet[];
  totalBalance: number;
  totalBalanceFormatted: string;
  monthIncome: number;
  monthExpense: number;
  monthIncomeFormatted: string;
  monthExpenseFormatted: string;
  netBalance: number;
  netBalanceFormatted: string;
  recentTransactions: HomeTransaction[];
}

export function useHomeData() {
  const [data, setData] = useState<HomeData>({
    wallets: [], totalBalance: 0, totalBalanceFormatted: 'Rp 0',
    monthIncome: 0, monthExpense: 0, monthIncomeFormatted: 'Rp 0',
    monthExpenseFormatted: 'Rp 0', netBalance: 0, netBalanceFormatted: 'Rp 0',
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const now = Date.now();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [wallets, allTx, categories] = await Promise.all([
        database.get<WalletModel>('wallets').query(Q.where('is_archived', false)).fetch(),
        database.get<TransactionModel>('transactions').query(
          Q.where('date', Q.gte(monthStart)),
          Q.where('date', Q.lte(monthEnd)),
        ).fetch(),
        database.get<CategoryModel>('categories').query().fetch(),
      ]);

      const recentTx = await database.get<TransactionModel>('transactions').query(
        Q.sortBy('date', Q.desc),
        Q.take(10),
      ).fetch();

      const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
      const walletMap = Object.fromEntries(wallets.map(w => [w.id, w]));

      const mappedWallets: HomeWallet[] = wallets.map(w => ({
        id: w.id, name: w.name, icon: w.icon, color: w.color,
        currency: w.currency, type: w.type, balance: w.balance,
        balanceFormatted: formatCurrency(w.balance, w.currency),
        showInDashboard: w.showInDashboard,
      }));

      const totalBalance = wallets.reduce((s, w) => w.includeInTotal ? s + w.balance : s, 0);

      let monthIncome = 0;
      let monthExpense = 0;
      for (const tx of allTx) {
        if (isIncomeType(tx.type as TransactionType)) monthIncome += tx.amount;
        else if (isExpenseType(tx.type as TransactionType)) monthExpense += tx.amount;
      }

      const recent: HomeTransaction[] = recentTx.map(tx => {
        const cat = catMap[tx.categoryId];
        const wallet = walletMap[tx.walletId];
        return {
          id: tx.id, type: tx.type as TransactionType, walletId: tx.walletId,
          ...(tx.toWalletId ? { toWalletId: tx.toWalletId } : {}),
          categoryId: tx.categoryId, amount: tx.amount, currency: tx.currency,
          ...(tx.note ? { note: tx.note } : {}),
          ...(tx.personName ? { personName: tx.personName } : {}),
          date: tx.date, createdAt: tx.createdAt.getTime(),
          categoryName: cat?.name ?? '-', categoryColor: cat?.color ?? '#999',
          categoryIcon: cat?.icon ?? 'circle',
          walletName: wallet?.name ?? '-',
          amountFormatted: formatCurrency(tx.amount, tx.currency),
        };
      });

      setData({
        wallets: mappedWallets, totalBalance,
        totalBalanceFormatted: formatCurrency(totalBalance, 'IDR'),
        monthIncome, monthExpense,
        monthIncomeFormatted: formatCurrency(monthIncome, 'IDR'),
        monthExpenseFormatted: formatCurrency(monthExpense, 'IDR'),
        netBalance: monthIncome - monthExpense,
        netBalanceFormatted: formatCurrency(monthIncome - monthExpense, 'IDR'),
        recentTransactions: recent,
      });
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  return { ...data, loading, reload: load };
}
