import {
  db,
  type WalletEnvelope,
  type TransactionEnvelope,
  type CategoryEnvelope,
  type BudgetEnvelope,
  type ReminderEnvelope,
} from "./db";
import { decryptJSON, encryptJSON } from "../crypto/crypto";
import type { Budget, Category, Reminder, Transaction, Wallet } from "../types";

// ---------- Wallets ----------

export async function putWallet(key: CryptoKey, wallet: Wallet): Promise<void> {
  const payload = await encryptJSON(key, wallet);
  const envelope: WalletEnvelope = {
    id: wallet.id,
    currency: wallet.currency,
    isArchived: wallet.isArchived ? 1 : 0,
    createdAt: wallet.createdAt,
    iv: payload.iv,
    blob: payload.blob,
  };
  await db.wallets.put(envelope);
}

export async function listWallets(key: CryptoKey): Promise<Wallet[]> {
  const rows = await db.wallets.orderBy("createdAt").toArray();
  return Promise.all(
    rows.map((row) => decryptJSON<Wallet>(key, { iv: row.iv, blob: row.blob })),
  );
}

export async function deleteWallet(id: string): Promise<void> {
  await db.wallets.delete(id);
}

// ---------- Transactions ----------

export async function putTransaction(key: CryptoKey, tx: Transaction): Promise<void> {
  const payload = await encryptJSON(key, tx);
  const envelope: TransactionEnvelope = {
    id: tx.id,
    type: tx.type,
    walletId: tx.walletId,
    categoryId: tx.categoryId,
    date: tx.date,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    iv: payload.iv,
    blob: payload.blob,
    ...(tx.toWalletId !== undefined ? { toWalletId: tx.toWalletId } : {}),
  };
  await db.transactions.put(envelope);
}

export async function listTransactions(key: CryptoKey): Promise<Transaction[]> {
  const rows = await db.transactions.orderBy("date").reverse().toArray();
  return Promise.all(
    rows.map((row) => decryptJSON<Transaction>(key, { iv: row.iv, blob: row.blob })),
  );
}

export async function listTransactionsByWallet(
  key: CryptoKey,
  walletId: string,
): Promise<Transaction[]> {
  const rows = await db.transactions
    .where("walletId")
    .equals(walletId)
    .reverse()
    .sortBy("date");
  return Promise.all(
    rows.map((row) => decryptJSON<Transaction>(key, { iv: row.iv, blob: row.blob })),
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
}

export async function countTransactionsByWallet(walletId: string): Promise<number> {
  return db.transactions.where("walletId").equals(walletId).count();
}

export async function countTransactionsByCategory(categoryId: string): Promise<number> {
  return db.transactions.where("categoryId").equals(categoryId).count();
}

// ---------- Categories ----------

export async function putCategory(key: CryptoKey, category: Category): Promise<void> {
  const payload = await encryptJSON(key, category);
  const envelope: CategoryEnvelope = {
    id: category.id,
    type: category.type,
    isDefault: category.isDefault ? 1 : 0,
    createdAt: category.createdAt,
    iv: payload.iv,
    blob: payload.blob,
  };
  await db.categories.put(envelope);
}

export async function listCategories(key: CryptoKey): Promise<Category[]> {
  const rows = await db.categories.toArray();
  return Promise.all(
    rows.map((row) => decryptJSON<Category>(key, { iv: row.iv, blob: row.blob })),
  );
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id);
}

// ---------- Budgets ----------

export async function putBudget(key: CryptoKey, budget: Budget): Promise<void> {
  const payload = await encryptJSON(key, budget);
  const envelope: BudgetEnvelope = {
    id: budget.id,
    categoryId: budget.categoryId,
    period: budget.period,
    createdAt: budget.createdAt,
    iv: payload.iv,
    blob: payload.blob,
  };
  await db.budgets.put(envelope);
}

export async function listBudgets(key: CryptoKey): Promise<Budget[]> {
  const rows = await db.budgets.toArray();
  return Promise.all(
    rows.map((row) => decryptJSON<Budget>(key, { iv: row.iv, blob: row.blob })),
  );
}

export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.delete(id);
}

// ---------- Reminders ----------

export async function putReminder(key: CryptoKey, reminder: Reminder): Promise<void> {
  const payload = await encryptJSON(key, reminder);
  const envelope: ReminderEnvelope = {
    id: reminder.id,
    period: reminder.period,
    isActive: reminder.isActive ? 1 : 0,
    dueDay: reminder.dueDay,
    createdAt: reminder.createdAt,
    iv: payload.iv,
    blob: payload.blob,
  };
  await db.reminders.put(envelope);
}

export async function listReminders(key: CryptoKey): Promise<Reminder[]> {
  const rows = await db.reminders.toArray();
  return Promise.all(
    rows.map((row) => decryptJSON<Reminder>(key, { iv: row.iv, blob: row.blob })),
  );
}

export async function deleteReminder(id: string): Promise<void> {
  await db.reminders.delete(id);
}
