import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { dbSchema } from './schema';
import { WalletModel } from './models/Wallet';
import { TransactionModel } from './models/Transaction';
import { CategoryModel } from './models/Category';
import { BudgetModel } from './models/Budget';
import { ReminderModel } from './models/Reminder';
import { RecurringTransactionModel } from './models/RecurringTransaction';
import { TransactionTemplateModel } from './models/TransactionTemplate';

const adapter = new SQLiteAdapter({
  schema: dbSchema,
  migrations: undefined,
  jsi: true,
  onSetUpError: (error) => {
    console.error('[WatermelonDB] SQLite setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    WalletModel,
    TransactionModel,
    CategoryModel,
    BudgetModel,
    ReminderModel,
    RecurringTransactionModel,
    TransactionTemplateModel,
  ],
});

export const wallets = database.get<WalletModel>('wallets');
export const transactions = database.get<TransactionModel>('transactions');
export const categories = database.get<CategoryModel>('categories');
export const budgets = database.get<BudgetModel>('budgets');
export const reminders = database.get<ReminderModel>('reminders');
export const recurringTransactions = database.get<RecurringTransactionModel>('recurring_transactions');
export const templates = database.get<TransactionTemplateModel>('transaction_templates');
