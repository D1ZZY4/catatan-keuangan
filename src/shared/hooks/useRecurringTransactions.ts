import { useCallback, useEffect, useRef, useState } from "react";
import { db, type RecurringTransactionRow } from "@/shared/db/db";

export type { RecurringTransactionRow };

function advanceNextDueDate(row: RecurringTransactionRow): number {
  const d = new Date(row.nextDueDate);
  if (row.frequency === "harian") {
    d.setDate(d.getDate() + 1);
  } else if (row.frequency === "mingguan") {
    d.setDate(d.getDate() + 7);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.getTime();
}

export function useRecurringTransactions(isUnlocked: boolean) {
  const checkedRef = useRef(false);
  const [dueItems, setDueItems] = useState<RecurringTransactionRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!isUnlocked || checkedRef.current) return;
    checkedRef.current = true;

    const check = async () => {
      try {
        const now = Date.now();
        const all = await db.recurring_transactions
          .filter((r) => r.isActive === 1 && r.nextDueDate <= now)
          .toArray();
        if (all.length > 0) {
          setDueItems(all);
          setSheetOpen(true);
        }
      } catch {
        // silently ignore
      }
    };

    void check();
  }, [isUnlocked]);

  const confirmAll = useCallback(
    async (
      addTransaction: (data: {
        type: string;
        amount: number;
        currency: string;
        walletId: string;
        categoryId: string;
        date: number;
        note: string;
      }) => Promise<void>,
    ) => {
      for (const item of dueItems) {
        await addTransaction({
          type: item.type,
          amount: item.amount,
          currency: item.currency,
          walletId: item.walletId,
          categoryId: item.categoryId,
          date: Date.now(),
          note: item.note || item.name,
        });
        const nextDueDate = advanceNextDueDate(item);
        await db.recurring_transactions.update(item.id, { nextDueDate });
      }
      setSheetOpen(false);
      setDueItems([]);
    },
    [dueItems],
  );

  const dismissAll = useCallback(async () => {
    // Advance due dates without creating transactions
    for (const item of dueItems) {
      const nextDueDate = advanceNextDueDate(item);
      await db.recurring_transactions.update(item.id, { nextDueDate });
    }
    setSheetOpen(false);
    setDueItems([]);
  }, [dueItems]);

  const skipItem = useCallback(
    async (id: string) => {
      const item = dueItems.find((r) => r.id === id);
      if (item) {
        const nextDueDate = advanceNextDueDate(item);
        await db.recurring_transactions.update(id, { nextDueDate });
      }
      const remaining = dueItems.filter((r) => r.id !== id);
      setDueItems(remaining);
      if (remaining.length === 0) setSheetOpen(false);
    },
    [dueItems],
  );

  return { dueItems, sheetOpen, setSheetOpen, confirmAll, dismissAll, skipItem };
}

// CRUD helpers
export async function createRecurring(row: Omit<RecurringTransactionRow, "id" | "createdAt">): Promise<void> {
  const { newId } = await import("@/shared/utils/misc");
  await db.recurring_transactions.add({
    ...row,
    id: newId(),
    createdAt: Date.now(),
  });
}

export async function listRecurring(): Promise<RecurringTransactionRow[]> {
  return db.recurring_transactions.toArray();
}

export async function toggleRecurring(id: string, isActive: 0 | 1): Promise<void> {
  await db.recurring_transactions.update(id, { isActive });
}

export async function deleteRecurring(id: string): Promise<void> {
  await db.recurring_transactions.delete(id);
}
