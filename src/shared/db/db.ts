import Dexie, { type Table } from "dexie";

/**
 * Encrypted record envelope.
 *
 * Index fields (id, walletId, date, type, etc.) are stored in plaintext on the
 * outer envelope so Dexie can index/query them. The full record (including
 * amount, note, attachments, person names) lives inside the encrypted `blob`.
 */
export interface EncryptedEnvelope {
  id: string;
  iv: string; // base64
  blob: string; // base64 AES-GCM ciphertext
  createdAt: number;
}

export interface WalletEnvelope extends EncryptedEnvelope {
  currency: string;
  isArchived: 0 | 1; // Dexie can't index booleans portably
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
  value: string; // JSON
  fetchedAt: number;
}

export interface SettingRow {
  key: string;
  value: unknown;
}

export interface AuthRow {
  key: string; // 'salt' | 'pinHash' | 'webauthnCredentialId' | 'hasPin'
  value: string;
}

export interface NotificationSentRow {
  id?: number;
  key: string;
  sentAt: number;
}

class CatatKeuDB extends Dexie {
  wallets!: Table<WalletEnvelope, string>;
  transactions!: Table<TransactionEnvelope, string>;
  categories!: Table<CategoryEnvelope, string>;
  budgets!: Table<BudgetEnvelope, string>;
  reminders!: Table<ReminderEnvelope, string>;
  price_cache!: Table<PriceCacheRow, string>;
  settings!: Table<SettingRow, string>;
  auth!: Table<AuthRow, string>;
  notifications_sent!: Table<NotificationSentRow, number>;

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
