export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer_internal'
  | 'transfer_external'
  | 'debt_given'
  | 'debt_received'
  | 'debt_repay'
  | 'savings_deposit'
  | 'savings_withdraw'
  | 'invest_buy'
  | 'invest_sell';

export type WalletType =
  | 'cash'
  | 'bank'
  | 'e-wallet'
  | 'investment'
  | 'savings'
  | 'credit'
  | 'crypto'
  | 'other';

export type BudgetPeriod = 'bulanan' | 'mingguan';

export type ReminderPeriod = 'bulanan' | 'mingguan';

export type CategoryType = 'expense' | 'income' | 'both';

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
  initialBalance: number;
  isArchived: boolean;
  showInDashboard: boolean;
  includeInTotal: boolean;
  type: WalletType;
  sortOrder: number;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  amount: number;
  currency: string;
  note?: string;
  personName?: string;
  personPhone?: string;
  date: number;
  createdAt: number;
}

export interface TransactionInput {
  type: TransactionType;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  amount: number;
  currency: string;
  note?: string;
  personName?: string;
  personPhone?: string;
  date: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  period: BudgetPeriod;
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
  period: ReminderPeriod;
  category: string;
  notifyDaysBefore: number;
  isActive: boolean;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: number;
}

export interface TransactionTemplate {
  id: string;
  type: TransactionType;
  categoryId: string;
  label: string;
  templateData: string;
  createdAt: number;
}

export interface RecurringTransaction {
  id: string;
  templateData: TransactionInput;
  frequency: 'harian' | 'mingguan' | 'bulanan';
  nextDueDate: number;
  isActive: boolean;
}

export interface UsagePattern {
  key: string;
  value: string;
}

export interface PriceCache {
  key: string;
  value: string;
  fetchedAt: number;
}

export interface AppSettings {
  key: string;
  value: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface TourStep {
  id: string;
  bubble: {
    title: string;
    body: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  };
  pulse?: boolean;
  autoAdvanceMs?: number;
}

export interface TransactionTypeOption {
  type: TransactionType;
  label: string;
  icon: string;
  color: string;
}

export type FontScale = 1 | 1.15 | 1.3;
