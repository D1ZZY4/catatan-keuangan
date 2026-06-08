/**
 * Domain types shared across features.
 * Decrypted record shapes — what lives inside the encrypted blob.
 */

export type TransactionType =
  | "income"
  | "expense"
  | "transfer_internal"
  | "transfer_external"
  | "debt_given"
  | "debt_received"
  | "debt_repay"
  | "savings_deposit"
  | "savings_withdraw"
  | "invest_buy"
  | "invest_sell";

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  initialBalance: number;
  isArchived: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  date: number;
  note?: string;
  attachmentBase64?: string;
  linkedPersonName?: string;
  linkedPersonPhone?: string;
  isSplitOf?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "both";
  isDefault: boolean;
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  period: "monthly" | "weekly";
  month?: number;
  year?: number;
  notifyAt: number;
  createdAt: number;
}

export interface Reminder {
  id: string;
  name: string;
  amount?: number;
  currency: string;
  dueDay: number;
  period: "monthly" | "weekly";
  category: string;
  notifyDaysBefore: number;
  isActive: boolean;
  createdAt: number;
}

export interface AppSettings {
  userName: string;
  baseCurrency: string;
  autoLockSeconds: number; // 0 = disabled
  onboardingCompleted: boolean;
}
