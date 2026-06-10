import { database } from '@/shared/db';
import { DEFAULT_WALLETS } from '@/shared/constants/defaultWallets';
import { ALL_DEFAULT_CATEGORIES } from '@/shared/constants/defaultCategories';
import type { CategoryModel, WalletModel } from '@/shared/db';

export async function ensureSeeded(): Promise<void> {
  try {
    const existingWallets = await database.get('wallets').query().fetchCount();
    if (existingWallets > 0) return;

    await database.write(async () => {
      for (const cat of ALL_DEFAULT_CATEGORIES) {
        await database.get<CategoryModel>('categories').create(rec => {
          rec.name = cat.name;
          rec.icon = cat.icon;
          rec.color = cat.color;
          rec.type = cat.type;
          rec.isDefault = cat.isDefault;
        });
      }
      for (const wallet of DEFAULT_WALLETS) {
        await database.get<WalletModel>('wallets').create(rec => {
          rec.name = wallet.name;
          rec.icon = wallet.icon;
          rec.color = wallet.color;
          rec.currency = wallet.currency;
          rec.balance = 0;
          rec.initialBalance = 0;
          rec.type = wallet.type;
          rec.isArchived = false;
          rec.showInDashboard = true;
          rec.includeInTotal = true;
          rec.sortOrder = wallet.sortOrder;
          // @ts-expect-error set by WatermelonDB
          rec._raw.created_at = Date.now();
        });
      }
    });
  } catch {
    // silent — will retry on next mount
  }
}
