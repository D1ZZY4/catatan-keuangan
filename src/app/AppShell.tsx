import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Calculator } from "lucide-react";
import { useAuth } from "./AuthContext";
import { BottomNav } from "@/shared/components/BottomNav";
import { FAB, type FABAction } from "@/shared/components/FAB";
import { ToastContainer } from "@/shared/components/Toast";
import { SkeletonCard } from "@/shared/components/SkeletonCard";
import type { Transaction, TransactionType } from "@/shared/types";

const LockScreen = lazy(() =>
  import("@/features/auth/LockScreen").then((m) => ({ default: m.LockScreen })),
);
const TransactionForm = lazy(() =>
  import("@/features/transactions/TransactionForm").then((m) => ({
    default: m.TransactionForm,
  })),
);
const CalculatorSheet = lazy(() =>
  import("@/features/calculator/Calculator").then((m) => ({ default: m.CalculatorSheet })),
);

export interface AppOutletContext {
  openTransactionForm: (type?: TransactionType, editTx?: Transaction) => void;
  openCalculator: () => void;
}

const PAGES_WITHOUT_FAB = ["/onboarding"];

function LoadingFallback() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function AppShell() {
  const { state } = useAuth();
  const location = useLocation();

  const [txSheet, setTxSheet] = useState<{
    open: boolean;
    type: TransactionType;
    editTx?: Transaction;
  }>({ open: false, type: "expense" });

  const [calcOpen, setCalcOpen] = useState(false);

  const openTransactionForm = useCallback(
    (type: TransactionType = "expense", editTx?: Transaction) => {
      setTxSheet({ open: true, type, ...(editTx !== undefined ? { editTx } : {}) });
    },
    [],
  );

  const openCalculator = useCallback(() => setCalcOpen(true), []);

  useEffect(() => {
    // Notify services on app open (reminders/budgets)
  }, []);

  if (state.status === "initializing") {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary flex items-center justify-center shadow-fab">
            <span className="text-white font-bold text-lg">CK</span>
          </div>
          <p className="text-sm text-text-muted animate-pulse">Memuat…</p>
        </div>
      </div>
    );
  }

  if (state.status === "onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  const hideFAB = PAGES_WITHOUT_FAB.some((p) => location.pathname.startsWith(p));
  const outletCtx: AppOutletContext = { openTransactionForm, openCalculator };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-bg-page">
      {state.status === "locked" && (
        <Suspense fallback={null}>
          <LockScreen />
        </Suspense>
      )}

      <div className={state.status === "locked" ? "pointer-events-none select-none" : ""}>
        <Suspense fallback={<LoadingFallback />}>
          <Outlet context={outletCtx} />
        </Suspense>
        <div className="h-[72px]" aria-hidden />
      </div>

      <BottomNav />

      {!hideFAB && (
        <FAB
          onAction={(action: FABAction) => {
            if (action === "income") openTransactionForm("income");
            else if (action === "transfer") openTransactionForm("transfer_internal");
            else if (action === "scan") openTransactionForm("expense");
            else openTransactionForm("expense");
          }}
        />
      )}

      <button
        onClick={openCalculator}
        className="fixed top-3 right-4 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-bg-card shadow-card active:scale-90 transition-transform"
        aria-label="Kalkulator"
      >
        <Calculator size={18} className="text-text-muted" />
      </button>

      <Suspense fallback={null}>
        {txSheet.open && (
          <TransactionForm
            isOpen={txSheet.open}
            onClose={() => setTxSheet((s) => ({ ...s, open: false }))}
            defaultType={txSheet.type}
            {...(txSheet.editTx !== undefined ? { editTransaction: txSheet.editTx } : {})}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <CalculatorSheet isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
      </Suspense>

      <ToastContainer />
    </div>
  );
}
