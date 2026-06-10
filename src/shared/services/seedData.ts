import { database, wallets, categories } from '../db/database';
import type { WalletModel } from '../db/models/Wallet';
import type { CategoryModel } from '../db/models/Category';

const DEFAULT_WALLETS = [
  {
    name: 'Tunai',
    icon: 'coins',
    color: '#2E7D32',
    currency: 'IDR',
    initialBalance: 0,
    walletType: 'cash',
    sortOrder: 0,
  },
  {
    name: 'Rekening Bank',
    icon: 'bank',
    color: '#8CC0EB',
    currency: 'IDR',
    initialBalance: 0,
    walletType: 'bank',
    sortOrder: 1,
  },
  {
    name: 'Dompet Digital',
    icon: 'wallet',
    color: '#E65100',
    currency: 'IDR',
    initialBalance: 0,
    walletType: 'e-wallet',
    sortOrder: 2,
  },
];

const DEFAULT_CATEGORIES = [
  { name: 'Makanan & Minuman', icon: 'utensils', color: '#E65100', type: 'expense' },
  { name: 'Transportasi', icon: 'car', color: '#1565C0', type: 'expense' },
  { name: 'Belanja', icon: 'shopping-bag', color: '#6A1B9A', type: 'expense' },
  { name: 'Tagihan & Utilitas', icon: 'zap', color: '#F57F17', type: 'expense' },
  { name: 'Kesehatan', icon: 'heart', color: '#C62828', type: 'expense' },
  { name: 'Hiburan', icon: 'music', color: '#00838F', type: 'expense' },
  { name: 'Pendidikan', icon: 'book-open', color: '#2E7D32', type: 'expense' },
  { name: 'Perawatan Rumah', icon: 'home', color: '#4E342E', type: 'expense' },
  { name: 'Pakaian', icon: 'shirt', color: '#AD1457', type: 'expense' },
  { name: 'Kecantikan', icon: 'sparkles', color: '#E91E63', type: 'expense' },
  { name: 'Hadiah & Donasi', icon: 'gift', color: '#9C27B0', type: 'expense' },
  { name: 'Lainnya', icon: 'more-horizontal', color: '#6B6555', type: 'expense' },
  { name: 'Gaji', icon: 'briefcase', color: '#2E7D32', type: 'income' },
  { name: 'Freelance', icon: 'star', color: '#F57F17', type: 'income' },
  { name: 'Bisnis', icon: 'trending-up', color: '#1565C0', type: 'income' },
  { name: 'Investasi', icon: 'bar-chart', color: '#00838F', type: 'income' },
  { name: 'Hadiah Uang', icon: 'gift', color: '#AD1457', type: 'income' },
  { name: 'Bonus', icon: 'sparkles', color: '#F57F17', type: 'income' },
  { name: 'Pengembalian Dana', icon: 'rotate-ccw', color: '#6A1B9A', type: 'income' },
  { name: 'Lainnya', icon: 'more-horizontal', color: '#6B6555', type: 'income' },
];

export async function seedDefaultData(): Promise<void> {
  const existingWallets = await wallets.query().fetch();
  if (existingWallets.length > 0) return;

  await database.write(async () => {
    for (const w of DEFAULT_WALLETS) {
      await wallets.create((record: WalletModel) => {
        record.name = w.name;
        record.icon = w.icon;
        record.color = w.color;
        record.currency = w.currency;
        record.initialBalance = w.initialBalance;
        record.isArchived = false;
        record.sortOrder = w.sortOrder;
        record.walletType = w.walletType;
        record.showInDashboard = true;
        record.includeInTotal = true;
        record.createdAt = Date.now();
      });
    }

    for (const c of DEFAULT_CATEGORIES) {
      await categories.create((record: CategoryModel) => {
        record.name = c.name;
        record.icon = c.icon;
        record.color = c.color;
        record.categoryType = c.type;
        record.isDefault = true;
        record.createdAt = Date.now();
      });
    }
  });
}
