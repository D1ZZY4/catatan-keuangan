import { db, getSetting, setSetting } from "./db";
import { putCategory, putWallet } from "./repo";
import { newId } from "../utils/misc";
import type { Category, Wallet } from "../types";

const DEFAULT_CATEGORIES_SEEDED_KEY = "defaultCategoriesSeeded";

const DEFAULT_EXPENSE: Array<Omit<Category, "id" | "createdAt" | "isDefault" | "type">> = [
  { name: "Makan & Minum", icon: "Utensils", color: "#E65100" },
  { name: "Transport", icon: "Car", color: "#1976D2" },
  { name: "Tagihan & Utilitas", icon: "Zap", color: "#FBC02D" },
  { name: "Belanja", icon: "ShoppingBag", color: "#8E24AA" },
  { name: "Kesehatan", icon: "Heart", color: "#D81B60" },
  { name: "Pendidikan", icon: "BookOpen", color: "#00897B" },
  { name: "Hiburan", icon: "Gamepad2", color: "#F4511E" },
  { name: "Rumah", icon: "Home", color: "#5D4037" },
  { name: "Pakaian", icon: "Shirt", color: "#3949AB" },
  { name: "Investasi", icon: "TrendingUp", color: "#2E7D32" },
  { name: "Lain-lain", icon: "MoreHorizontal", color: "#6B6555" },
];

const DEFAULT_INCOME: Array<Omit<Category, "id" | "createdAt" | "isDefault" | "type">> = [
  { name: "Gaji", icon: "Briefcase", color: "#2E7D32" },
  { name: "Freelance", icon: "Laptop", color: "#00897B" },
  { name: "Bisnis", icon: "Store", color: "#6D4C41" },
  { name: "Hadiah", icon: "Gift", color: "#D81B60" },
  { name: "Investasi Cair", icon: "DollarSign", color: "#1976D2" },
  { name: "Lain-lain", icon: "Plus", color: "#6B6555" },
];

export async function seedDefaultCategories(key: CryptoKey): Promise<void> {
  const seeded = await getSetting<boolean>(DEFAULT_CATEGORIES_SEEDED_KEY);
  if (seeded) return;

  const now = Date.now();
  for (const c of DEFAULT_EXPENSE) {
    await putCategory(key, {
      id: newId(),
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: "expense",
      isDefault: true,
      createdAt: now,
    });
  }
  for (const c of DEFAULT_INCOME) {
    await putCategory(key, {
      id: newId(),
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: "income",
      isDefault: true,
      createdAt: now,
    });
  }
  await setSetting(DEFAULT_CATEGORIES_SEEDED_KEY, true);
}

/**
 * Mock data seeder for development. Adds a sample wallet so the empty UI has
 * something to render. Only runs when `?seed=1` is in the URL.
 */
export async function maybeSeedMockData(key: CryptoKey): Promise<void> {
  if (!import.meta.env.DEV) return;
  if (!new URLSearchParams(location.search).get("seed")) return;
  const count = await db.wallets.count();
  if (count > 0) return;

  const wallet: Wallet = {
    id: newId(),
    name: "Dompet Tunai",
    icon: "Wallet",
    color: "#8CC0EB",
    currency: "IDR",
    initialBalance: 250_000,
    isArchived: false,
    createdAt: Date.now(),
  };
  await putWallet(key, wallet);
}
