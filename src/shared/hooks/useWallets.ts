import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { wallets, database } from '../db/database';
import type { WalletModel } from '../db/models/Wallet';
import type { Wallet } from '../types';

function modelToWallet(m: WalletModel): Wallet {
  return {
    id: m.id,
    name: m.name,
    icon: m.icon,
    color: m.color,
    currency: m.currency,
    initialBalance: m.initialBalance,
    isArchived: m.isArchived,
    sortOrder: m.sortOrder,
    type: m.walletType as Wallet['type'],
    showInDashboard: m.showInDashboard,
    includeInTotal: m.includeInTotal,
    createdAt: m.createdAt,
  };
}

export function useWallets(includeArchived = false) {
  const [data, setData] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const query = includeArchived
      ? wallets.query(Q.sortBy('sort_order', Q.asc))
      : wallets.query(Q.where('is_archived', false), Q.sortBy('sort_order', Q.asc));
    const result = await query.fetch();
    setData(result.map(modelToWallet));
    setLoading(false);
  }, [includeArchived]);

  useEffect(() => {
    void load();
  }, [load]);

  const createWallet = useCallback(
    async (w: Omit<Wallet, 'id' | 'createdAt'>) => {
      await database.write(async () => {
        await wallets.create((record: WalletModel) => {
          record.name = w.name;
          record.icon = w.icon;
          record.color = w.color;
          record.currency = w.currency;
          record.initialBalance = w.initialBalance;
          record.isArchived = w.isArchived;
          record.sortOrder = w.sortOrder ?? data.length;
          record.walletType = w.type ?? 'other';
          record.showInDashboard = w.showInDashboard ?? true;
          record.includeInTotal = w.includeInTotal ?? true;
          record.createdAt = Date.now();
        });
      });
      await load();
    },
    [data.length, load],
  );

  const archiveWallet = useCallback(
    async (id: string) => {
      await database.write(async () => {
        const record = await wallets.find(id);
        await record.update((r: WalletModel) => {
          r.isArchived = true;
        });
      });
      await load();
    },
    [load],
  );

  const deleteWallet = useCallback(
    async (id: string) => {
      await database.write(async () => {
        const record = await wallets.find(id);
        await record.destroyPermanently();
      });
      await load();
    },
    [load],
  );

  return { data, loading, reload: load, createWallet, archiveWallet, deleteWallet };
}
