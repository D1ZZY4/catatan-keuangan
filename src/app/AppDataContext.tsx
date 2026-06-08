import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { Budget, Category, Reminder, Transaction, Wallet } from "@/shared/types";
import {
  deleteCategory,
  deleteBudget,
  deleteReminder,
  deleteTransaction,
  deleteWallet,
  listBudgets,
  listCategories,
  listReminders,
  listTransactions,
  listWallets,
  putBudget,
  putCategory,
  putReminder,
  putTransaction,
  putWallet,
} from "@/shared/db/repo";
import { newId } from "@/shared/utils/misc";
import { useAuth } from "./AuthContext";

// ---- Types ----------------------------------------------------------------

interface AppData {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  reminders: Reminder[];
  loading: boolean;
}

interface AppDataContextValue extends AppData {
  addWallet: (data: Omit<Wallet, "id" | "createdAt">) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  removeWallet: (id: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addCategory: (data: Omit<Category, "id" | "createdAt" | "isDefault">) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addBudget: (data: Omit<Budget, "id" | "createdAt">) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  addReminder: (data: Omit<Reminder, "id" | "createdAt">) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  getWalletBalance: (walletId: string) => number;
  reload: () => Promise<void>;
}

// ---- Reducer ---------------------------------------------------------------

type DataAction =
  | { type: "LOADED"; data: Omit<AppData, "loading"> }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_WALLETS"; wallets: Wallet[] }
  | { type: "SET_TRANSACTIONS"; transactions: Transaction[] }
  | { type: "SET_CATEGORIES"; categories: Category[] }
  | { type: "SET_BUDGETS"; budgets: Budget[] }
  | { type: "SET_REMINDERS"; reminders: Reminder[] };

function dataReducer(state: AppData, action: DataAction): AppData {
  switch (action.type) {
    case "LOADED":
      return { ...action.data, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_WALLETS":
      return { ...state, wallets: action.wallets };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.transactions };
    case "SET_CATEGORIES":
      return { ...state, categories: action.categories };
    case "SET_BUDGETS":
      return { ...state, budgets: action.budgets };
    case "SET_REMINDERS":
      return { ...state, reminders: action.reminders };
  }
}

const initialState: AppData = {
  wallets: [],
  transactions: [],
  categories: [],
  budgets: [],
  reminders: [],
  loading: true,
};

// ---- Balance helper --------------------------------------------------------

export function computeWalletBalance(wallet: Wallet, transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.walletId === wallet.id) {
      switch (tx.type) {
        case "income":
        case "debt_received":
        case "savings_withdraw":
        case "invest_sell":
          return acc + tx.amount;
        case "expense":
        case "transfer_external":
        case "debt_given":
        case "savings_deposit":
        case "invest_buy":
        case "debt_repay":
          return acc - tx.amount;
        case "transfer_internal":
          return acc - tx.amount;
        default:
          return acc;
      }
    }
    if (tx.toWalletId === wallet.id && tx.type === "transfer_internal") {
      return acc + tx.amount;
    }
    return acc;
  }, wallet.initialBalance);
}

// ---- Context ---------------------------------------------------------------

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const [data, dispatch] = useReducer(dataReducer, initialState);

  const cryptoKey =
    authState.status === "unlocked" ? authState.cryptoKey : null;

  const load = useCallback(
    async (key: CryptoKey) => {
      dispatch({ type: "SET_LOADING", loading: true });
      try {
        const [wallets, transactions, categories, budgets, reminders] =
          await Promise.all([
            listWallets(key),
            listTransactions(key),
            listCategories(key),
            listBudgets(key),
            listReminders(key),
          ]);
        dispatch({ type: "LOADED", data: { wallets, transactions, categories, budgets, reminders } });
      } catch {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [],
  );

  useEffect(() => {
    if (cryptoKey) void load(cryptoKey);
    else dispatch({ type: "LOADED", data: { wallets: [], transactions: [], categories: [], budgets: [], reminders: [] } });
  }, [cryptoKey, load]);

  const reload = useCallback(async () => {
    if (cryptoKey) await load(cryptoKey);
  }, [cryptoKey, load]);

  // ---- Wallets

  const addWallet = useCallback(
    async (data: Omit<Wallet, "id" | "createdAt">) => {
      if (!cryptoKey) return;
      const wallet: Wallet = { ...data, id: newId(), createdAt: Date.now() };
      await putWallet(cryptoKey, wallet);
      const wallets = await listWallets(cryptoKey);
      dispatch({ type: "SET_WALLETS", wallets });
    },
    [cryptoKey],
  );

  const updateWallet = useCallback(
    async (wallet: Wallet) => {
      if (!cryptoKey) return;
      await putWallet(cryptoKey, wallet);
      const wallets = await listWallets(cryptoKey);
      dispatch({ type: "SET_WALLETS", wallets });
    },
    [cryptoKey],
  );

  const removeWallet = useCallback(
    async (id: string) => {
      await deleteWallet(id);
      const wallets = cryptoKey ? await listWallets(cryptoKey) : [];
      dispatch({ type: "SET_WALLETS", wallets });
    },
    [cryptoKey],
  );

  // ---- Transactions

  const addTransaction = useCallback(
    async (txData: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
      if (!cryptoKey) return;
      const now = Date.now();
      const tx: Transaction = { ...txData, id: newId(), createdAt: now, updatedAt: now };
      await putTransaction(cryptoKey, tx);
      const transactions = await listTransactions(cryptoKey);
      dispatch({ type: "SET_TRANSACTIONS", transactions });
    },
    [cryptoKey],
  );

  const updateTransaction = useCallback(
    async (tx: Transaction) => {
      if (!cryptoKey) return;
      const updated: Transaction = { ...tx, updatedAt: Date.now() };
      await putTransaction(cryptoKey, updated);
      const transactions = await listTransactions(cryptoKey);
      dispatch({ type: "SET_TRANSACTIONS", transactions });
    },
    [cryptoKey],
  );

  const removeTransaction = useCallback(
    async (id: string) => {
      await deleteTransaction(id);
      const transactions = cryptoKey ? await listTransactions(cryptoKey) : [];
      dispatch({ type: "SET_TRANSACTIONS", transactions });
    },
    [cryptoKey],
  );

  // ---- Categories

  const addCategory = useCallback(
    async (catData: Omit<Category, "id" | "createdAt" | "isDefault">) => {
      if (!cryptoKey) return;
      const cat: Category = { ...catData, id: newId(), createdAt: Date.now(), isDefault: false };
      await putCategory(cryptoKey, cat);
      const categories = await listCategories(cryptoKey);
      dispatch({ type: "SET_CATEGORIES", categories });
    },
    [cryptoKey],
  );

  const updateCategory = useCallback(
    async (cat: Category) => {
      if (!cryptoKey) return;
      await putCategory(cryptoKey, cat);
      const categories = await listCategories(cryptoKey);
      dispatch({ type: "SET_CATEGORIES", categories });
    },
    [cryptoKey],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      await deleteCategory(id);
      const categories = cryptoKey ? await listCategories(cryptoKey) : [];
      dispatch({ type: "SET_CATEGORIES", categories });
    },
    [cryptoKey],
  );

  // ---- Budgets

  const addBudget = useCallback(
    async (budgetData: Omit<Budget, "id" | "createdAt">) => {
      if (!cryptoKey) return;
      const budget: Budget = { ...budgetData, id: newId(), createdAt: Date.now() };
      await putBudget(cryptoKey, budget);
      const budgets = await listBudgets(cryptoKey);
      dispatch({ type: "SET_BUDGETS", budgets });
    },
    [cryptoKey],
  );

  const updateBudget = useCallback(
    async (budget: Budget) => {
      if (!cryptoKey) return;
      await putBudget(cryptoKey, budget);
      const budgets = await listBudgets(cryptoKey);
      dispatch({ type: "SET_BUDGETS", budgets });
    },
    [cryptoKey],
  );

  const removeBudget = useCallback(
    async (id: string) => {
      await deleteBudget(id);
      const budgets = cryptoKey ? await listBudgets(cryptoKey) : [];
      dispatch({ type: "SET_BUDGETS", budgets });
    },
    [cryptoKey],
  );

  // ---- Reminders

  const addReminder = useCallback(
    async (reminderData: Omit<Reminder, "id" | "createdAt">) => {
      if (!cryptoKey) return;
      const reminder: Reminder = { ...reminderData, id: newId(), createdAt: Date.now() };
      await putReminder(cryptoKey, reminder);
      const reminders = await listReminders(cryptoKey);
      dispatch({ type: "SET_REMINDERS", reminders });
    },
    [cryptoKey],
  );

  const updateReminder = useCallback(
    async (reminder: Reminder) => {
      if (!cryptoKey) return;
      await putReminder(cryptoKey, reminder);
      const reminders = await listReminders(cryptoKey);
      dispatch({ type: "SET_REMINDERS", reminders });
    },
    [cryptoKey],
  );

  const removeReminder = useCallback(
    async (id: string) => {
      await deleteReminder(id);
      const reminders = cryptoKey ? await listReminders(cryptoKey) : [];
      dispatch({ type: "SET_REMINDERS", reminders });
    },
    [cryptoKey],
  );

  // ---- Derived helpers

  const getWalletBalance = useCallback(
    (walletId: string): number => {
      const wallet = data.wallets.find((w) => w.id === walletId);
      if (!wallet) return 0;
      return computeWalletBalance(wallet, data.transactions);
    },
    [data.wallets, data.transactions],
  );

  return (
    <AppDataContext.Provider
      value={{
        ...data,
        addWallet,
        updateWallet,
        removeWallet,
        addTransaction,
        updateTransaction,
        removeTransaction,
        addCategory,
        updateCategory,
        removeCategory,
        addBudget,
        updateBudget,
        removeBudget,
        addReminder,
        updateReminder,
        removeReminder,
        getWalletBalance,
        reload,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
