import { useCallback, useEffect, useState } from 'react';
import { database, budgets } from '../db/database';
import type { BudgetModel } from '../db/models/Budget';
import type { Budget } from '../types';

function modelToBudget(m: BudgetModel): Budget {
  return {
    id: m.id,
    categoryId: m.categoryId,
    amount: m.amount,
    currency: m.currency,
    period: m.period as Budget['period'],
    month: m.month || undefined,
    year: m.year || undefined,
    notifyAt: m.notifyAt,
    createdAt: m.createdAt,
  };
}

export function useBudgets() {
  const [data, setData] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await budgets.query().fetch();
      setData(result.map(modelToBudget));
    } catch (e) {
      console.error('[useBudgets] load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createBudget = useCallback(
    async (b: Omit<Budget, 'id' | 'createdAt'>) => {
      await database.write(async () => {
        await budgets.create((record: BudgetModel) => {
          record.categoryId = b.categoryId;
          record.amount = b.amount;
          record.currency = b.currency;
          record.period = b.period;
          record.month = b.month ?? new Date().getMonth() + 1;
          record.year = b.year ?? new Date().getFullYear();
          record.notifyAt = b.notifyAt;
          record.createdAt = Date.now();
        });
      });
      await load();
    },
    [load],
  );

  const updateBudget = useCallback(
    async (id: string, b: Partial<Omit<Budget, 'id' | 'createdAt'>>) => {
      await database.write(async () => {
        const record = await budgets.find(id);
        await record.update((r: BudgetModel) => {
          if (b.categoryId !== undefined) r.categoryId = b.categoryId;
          if (b.amount !== undefined) r.amount = b.amount;
          if (b.currency !== undefined) r.currency = b.currency;
          if (b.period !== undefined) r.period = b.period;
          if (b.month !== undefined) r.month = b.month;
          if (b.year !== undefined) r.year = b.year;
          if (b.notifyAt !== undefined) r.notifyAt = b.notifyAt;
        });
      });
      await load();
    },
    [load],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      await database.write(async () => {
        const record = await budgets.find(id);
        await record.destroyPermanently();
      });
      await load();
    },
    [load],
  );

  return { data, loading, reload: load, createBudget, updateBudget, deleteBudget };
}
