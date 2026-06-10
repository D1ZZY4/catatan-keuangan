import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { transactions, database } from '../db/database';
import type { TransactionModel } from '../db/models/Transaction';
import type { Transaction } from '../types';
import type { PeriodKey } from '../config/periods';
import { AppConfig } from '../config/periods';

function modelToTransaction(m: TransactionModel): Transaction {
  return {
    id: m.id,
    type: m.txType as Transaction['type'],
    amount: m.amount,
    currency: m.currency,
    walletId: m.walletId,
    toWalletId: m.toWalletId || undefined,
    categoryId: m.categoryId,
    date: m.date,
    note: m.note || undefined,
    attachmentBase64: m.attachmentBase64 || undefined,
    linkedPersonName: m.linkedPersonName || undefined,
    linkedPersonPhone: m.linkedPersonPhone || undefined,
    isSplitOf: m.isSplitOf || undefined,
    tags: m.tags ? (JSON.parse(m.tags) as string[]) : undefined,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export function useTransactions(periodKey: PeriodKey = 'thisMonth') {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const period = AppConfig.periods.find((p) => p.key === periodKey);
    const range = period?.getRange();

    let query = transactions.query().extend(
      Q.sortBy('date', Q.desc),
    );

    if (range !== null && range !== undefined) {
      query = query.extend(
        Q.where('date', Q.gte(range.from.getTime())),
        Q.where('date', Q.lte(range.to.getTime())),
      );
    }

    const result = await query.fetch();
    setData(result.map(modelToTransaction));
    setLoading(false);
  }, [periodKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const addTransaction = useCallback(
    async (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      await database.write(async () => {
        await transactions.create((record: TransactionModel) => {
          record.txType = tx.type;
          record.amount = tx.amount;
          record.currency = tx.currency;
          record.walletId = tx.walletId;
          record.toWalletId = tx.toWalletId ?? '';
          record.categoryId = tx.categoryId;
          record.date = tx.date;
          record.note = tx.note ?? '';
          record.linkedPersonName = tx.linkedPersonName ?? '';
          record.linkedPersonPhone = tx.linkedPersonPhone ?? '';
          record.tags = tx.tags ? JSON.stringify(tx.tags) : '';
          record.createdAt = Date.now();
          record.updatedAt = Date.now();
        });
      });
      await load();
    },
    [load],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await database.write(async () => {
        const record = await transactions.find(id);
        await record.destroyPermanently();
      });
      await load();
    },
    [load],
  );

  return { data, loading, reload: load, addTransaction, deleteTransaction };
}
