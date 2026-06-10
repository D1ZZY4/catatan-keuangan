import { useCallback, useEffect, useState } from 'react';
import { database, reminders } from '../db/database';
import type { ReminderModel } from '../db/models/Reminder';
import type { Reminder } from '../types';

function modelToReminder(m: ReminderModel): Reminder {
  return {
    id: m.id,
    name: m.name,
    amount: m.amount || undefined,
    currency: m.currency,
    dueDay: m.dueDay,
    period: m.period as Reminder['period'],
    category: m.category,
    notifyDaysBefore: m.notifyDaysBefore,
    isActive: m.isActive,
    createdAt: m.createdAt,
  };
}

export function useReminders() {
  const [data, setData] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await reminders.query().fetch();
      setData(result.map(modelToReminder));
    } catch (e) {
      console.error('[useReminders] load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createReminder = useCallback(
    async (r: Omit<Reminder, 'id' | 'createdAt'>) => {
      await database.write(async () => {
        await reminders.create((record: ReminderModel) => {
          record.name = r.name;
          record.amount = r.amount ?? 0;
          record.currency = r.currency;
          record.dueDay = r.dueDay;
          record.period = r.period;
          record.category = r.category;
          record.notifyDaysBefore = r.notifyDaysBefore;
          record.isActive = r.isActive;
          record.createdAt = Date.now();
        });
      });
      await load();
    },
    [load],
  );

  const updateReminder = useCallback(
    async (id: string, r: Partial<Omit<Reminder, 'id' | 'createdAt'>>) => {
      await database.write(async () => {
        const record = await reminders.find(id);
        await record.update((rec: ReminderModel) => {
          if (r.name !== undefined) rec.name = r.name;
          if (r.amount !== undefined) rec.amount = r.amount ?? 0;
          if (r.currency !== undefined) rec.currency = r.currency;
          if (r.dueDay !== undefined) rec.dueDay = r.dueDay;
          if (r.period !== undefined) rec.period = r.period;
          if (r.category !== undefined) rec.category = r.category;
          if (r.notifyDaysBefore !== undefined) rec.notifyDaysBefore = r.notifyDaysBefore;
          if (r.isActive !== undefined) rec.isActive = r.isActive;
        });
      });
      await load();
    },
    [load],
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      await database.write(async () => {
        const record = await reminders.find(id);
        await record.destroyPermanently();
      });
      await load();
    },
    [load],
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      await updateReminder(id, { isActive });
    },
    [updateReminder],
  );

  return { data, loading, reload: load, createReminder, updateReminder, deleteReminder, toggleActive };
}
