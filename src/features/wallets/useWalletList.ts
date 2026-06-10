import { useState, useEffect, useCallback } from 'react';
import { database } from '@/shared/db';
import type { WalletModel } from '@/shared/db';
import type { Wallet } from '@/shared/types';

function mapWallet(w: WalletModel): Wallet {
  return {
    id: w.id,
    name: w.name,
    icon: w.icon,
    color: w.color,
    currency: w.currency,
    balance: w.balance,
    initialBalance: w.initialBalance,
    isArchived: w.isArchived,
    showInDashboard: w.showInDashboard,
    includeInTotal: w.includeInTotal,
    type: w.type as Wallet['type'],
    sortOrder: w.sortOrder,
    createdAt: w.createdAt.getTime(),
  };
}

export function useWalletList() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const subscription = database
      .get<WalletModel>('wallets')
      .query()
      .observe()
      .subscribe({
        next: (records) => {
          const mapped = [...records]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(mapWallet);
          setWallets(mapped);
          setLoading(false);
          setRefreshing(false);
        },
        error: () => {
          setLoading(false);
          setRefreshing(false);
        },
      });

    return () => subscription.unsubscribe();
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  return { wallets, loading, refreshing, refresh };
}
