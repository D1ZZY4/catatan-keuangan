import { db, type WalletEnvelope, type TransactionEnvelope, type CategoryEnvelope } from "./db";
import { decryptJSON, encryptJSON } from "../crypto/crypto";
import type { Category, Transaction, Wallet } from "../types";

/**
 * Repository helpers that wrap Dexie tables with the encryption envelope.
 *
 * Index fields (currency, walletId, type, date, …) are duplicated on the outer
 * envelope so Dexie can query them; the source of truth still lives inside the
 * encrypted blob and is the value returned to callers.
 */

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
    ...(tx.toWalletId ? { toWalletId: tx.toWalletId } : {}),
    categoryId: tx.categoryId,
    date: tx.date,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    iv: payload.iv,
    blob: payload.blob,
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
  const rows = await db.transactions.where("walletId").equals(walletId).toArray();
  return Promise.all(
    rows.map((row) => decryptJSON<Transaction>(key, { iv: row.iv, blob: row.blob })),
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
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
