import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useAppData } from "./AppDataContext";
import { useCalculator } from "./CalculatorContext";
import { BottomNav } from "@/shared/components/BottomNav";
import { FAB, type FABAction } from "@/shared/components/FAB";
import { ToastContainer } from "@/shared/components/Toast";
import { SkeletonCard } from "@/shared/components/SkeletonCard";
import { notificationService } from "@/shared/services/NotificationService";
import type { Transaction, TransactionType } from "@/shared/types";
import type { OCRConfirmedData } from "@/features/ocr/OCRScanner";

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
const OCRScanner = lazy(() =>
  import("@/features/ocr/OCRScanner").then((m) => ({ default: m.OCRScanner })),
);

export interface AppOutletContext {
  openTransactionForm: (type?: TransactionType, editTx?: Transaction) => void;
  openCalculator: () => void;
  openOCR: () => void;
}

const PAGES_WITHOUT_FAB = ["/onboarding", "/settings"];

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
  const { budgets, transactions, categories, reminders } = useAppData();
  const location = useLocation();
  const notifyRanRef = useRef(false);
  const { isOpen: calcOpen, openCalculator, closeCalculator } = useCalculator();

  const [txSheet, setTxSheet] = useState<{
    open: boolean;
    type: TransactionType;
    editTx?: Transaction;
    prefill?: { amount?: number; note?: string; date?: number };
  }>({ open: false, type: "expense" });

  const [ocrOpen, setOcrOpen] = useState(false);

  const openTransactionForm = useCallback(
    (type: TransactionType = "expense", editTx?: Transaction) => {
      setTxSheet({
        open: true,
        type,
        ...(editTx !== undefined ? { editTx } : {}),
      });
    },
    [],
  );

  const openOCR = useCallback(() => setOcrOpen(true), []);

  const handleOCRConfirm = useCallback((data: OCRConfirmedData) => {
    setOcrOpen(false);
    setTxSheet({
      open: true,
      type: "expense",
      prefill: {
        amount: data.amount,
        note: data.note,
        ...(data.date !== undefined ? { date: data.date } : {}),
      },
    });
  }, []);

  useEffect(() => {
    if (state.status !== "unlocked") return;
    if (notifyRanRef.current) return;
    notifyRanRef.current = true;

    void notificationService
      .requestPermission()
      .then(() => {
        void notificationService.checkBudgets(budgets, transactions, categories);
        void notificationService.checkReminders(reminders);
      });
  }, [state.status, budgets, transactions, categories, reminders]);

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

  const hideFAB =
    PAGES_WITHOUT_FAB.some((p) => location.pathname.startsWith(p)) ||
    txSheet.open ||
    ocrOpen ||
    calcOpen;
  const outletCtx: AppOutletContext = { openTransactionForm, openCalculator, openOCR };

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
        <div className="h-[100px]" aria-hidden />
      </div>

      <BottomNav />

      {!hideFAB && (
        <FAB
          onAction={(action: FABAction) => {
            if (action === "income") openTransactionForm("income");
            else if (action === "transfer") openTransactionForm("transfer_internal");
            else if (action === "scan") setOcrOpen(true);
            else openTransactionForm("expense");
          }}
        />
      )}

      <Suspense fallback={null}>
        {txSheet.open && (
          <TransactionForm
            isOpen={txSheet.open}
            onClose={() => setTxSheet((s) => ({ ...s, open: false }))}
            defaultType={txSheet.type}
            {...(txSheet.editTx !== undefined ? { editTransaction: txSheet.editTx } : {})}
            {...(txSheet.prefill !== undefined ? { prefill: txSheet.prefill } : {})}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <CalculatorSheet isOpen={calcOpen} onClose={closeCalculator} />
      </Suspense>

      <Suspense fallback={null}>
        <OCRScanner
          isOpen={ocrOpen}
          onClose={() => setOcrOpen(false)}
          onConfirm={handleOCRConfirm}
        />
      </Suspense>

      <ToastContainer />
    </div>
  );
}
