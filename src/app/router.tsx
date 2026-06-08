import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./AppShell";

const OnboardingPage = lazy(() =>
  import("@/features/onboarding/OnboardingPage").then((m) => ({
    default: m.OnboardingPage,
  })),
);
const HomePage = lazy(() =>
  import("@/features/home/HomePage").then((m) => ({ default: m.HomePage })),
);
const TransactionPage = lazy(() =>
  import("@/features/transactions/TransactionPage").then((m) => ({
    default: m.TransactionPage,
  })),
);
const StatsPage = lazy(() =>
  import("@/features/stats/StatsPage").then((m) => ({ default: m.StatsPage })),
);
const WalletPage = lazy(() =>
  import("@/features/wallets/WalletPage").then((m) => ({ default: m.WalletPage })),
);
const WalletDetail = lazy(() =>
  import("@/features/wallets/WalletDetail").then((m) => ({ default: m.WalletDetail })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const CategoryPage = lazy(() =>
  import("@/features/categories/CategoryPage").then((m) => ({ default: m.CategoryPage })),
);
const ReminderPage = lazy(() =>
  import("@/features/reminders/ReminderPage").then((m) => ({ default: m.ReminderPage })),
);
const BackupPage = lazy(() =>
  import("@/features/backup/BackupPage").then((m) => ({ default: m.BackupPage })),
);
const BudgetPage = lazy(() =>
  import("@/features/budgets/BudgetPage").then((m) => ({ default: m.BudgetPage })),
);

function PageFallback() {
  return (
    <div className="flex h-48 items-center justify-center">
      <span className="text-sm text-text-muted animate-pulse">Memuat…</span>
    </div>
  );
}

function W({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter(
  [
    {
      path: "/onboarding",
      element: (
        <W>
          <OnboardingPage />
        </W>
      ),
    },
    {
      path: "/",
      element: <AppShell />,
      children: [
        {
          index: true,
          element: (
            <W>
              <HomePage />
            </W>
          ),
        },
        {
          path: "transactions",
          element: (
            <W>
              <TransactionPage />
            </W>
          ),
        },
        {
          path: "stats",
          element: (
            <W>
              <StatsPage />
            </W>
          ),
        },
        {
          path: "wallets",
          element: (
            <W>
              <WalletPage />
            </W>
          ),
        },
        {
          path: "wallets/:id",
          element: (
            <W>
              <WalletDetail />
            </W>
          ),
        },
        {
          path: "budgets",
          element: (
            <W>
              <BudgetPage />
            </W>
          ),
        },
        {
          path: "settings",
          element: (
            <W>
              <SettingsPage />
            </W>
          ),
        },
        {
          path: "settings/categories",
          element: (
            <W>
              <CategoryPage />
            </W>
          ),
        },
        {
          path: "settings/reminders",
          element: (
            <W>
              <ReminderPage />
            </W>
          ),
        },
        {
          path: "settings/backup",
          element: (
            <W>
              <BackupPage />
            </W>
          ),
        },
      ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    } as Record<string, boolean>,
  },
);
