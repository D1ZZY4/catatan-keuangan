import Dexie, { type EntityTable } from "dexie";

export interface EncryptedEnvelope {
  id: string;
  iv: string;
  blob: string;
  createdAt: number;
}

export interface WalletEnvelope extends EncryptedEnvelope {
  currency: string;
  isArchived: 0 | 1;
}

export interface TransactionEnvelope extends EncryptedEnvelope {
  type: string;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  date: number;
  updatedAt: number;
}

export interface CategoryEnvelope extends EncryptedEnvelope {
  type: "income" | "expense" | "both";
  isDefault: 0 | 1;
}

export interface BudgetEnvelope extends EncryptedEnvelope {
  categoryId: string;
  period: "monthly" | "weekly";
}

export interface ReminderEnvelope extends EncryptedEnvelope {
  period: "monthly" | "weekly";
  isActive: 0 | 1;
  dueDay: number;
}

export interface PriceCacheRow {
  key: string;
  value: string;
  fetchedAt: number;
}

export interface SettingRow {
  key: string;
  value: unknown;
}

export interface AuthRow {
  key: string;
  value: string;
}

export interface NotificationSentRow {
  id: number;
  key: string;
  sentAt: number;
}

class CatatKeuDB extends Dexie {
  wallets!: EntityTable<WalletEnvelope, "id">;
  transactions!: EntityTable<TransactionEnvelope, "id">;
  categories!: EntityTable<CategoryEnvelope, "id">;
  budgets!: EntityTable<BudgetEnvelope, "id">;
  reminders!: EntityTable<ReminderEnvelope, "id">;
  price_cache!: EntityTable<PriceCacheRow, "key">;
  settings!: EntityTable<SettingRow, "key">;
  auth!: EntityTable<AuthRow, "key">;
  notifications_sent!: EntityTable<NotificationSentRow, "id">;

  constructor() {
    super("CatatKeuDB");
    this.version(1).stores({
      wallets: "id, currency, isArchived, createdAt",
      transactions:
        "id, type, walletId, toWalletId, categoryId, date, createdAt, updatedAt",
      categories: "id, type, isDefault",
      budgets: "id, categoryId, period",
      reminders: "id, period, isActive, dueDay",
      price_cache: "key, fetchedAt",
      settings: "key",
      auth: "key",
      notifications_sent: "++id, key, sentAt",
    });
  }
}

export const db = new CatatKeuDB();

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const row = await db.settings.get(key);
  return row?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}
