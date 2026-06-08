import React, { useMemo, useState } from "react";
import { Archive, ChevronDown, ChevronRight, Copy, GripVertical, Pencil, Plus, RefreshCw, Trash2 as Trash, Undo2, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { WalletCard } from "@/shared/components/WalletCard";
import { SkeletonCard } from "@/shared/components/SkeletonCard";
import { EmptyState, WalletEmptyIllustration } from "@/shared/components/EmptyState";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { AppBar } from "@/shared/components/AppBar";
import { WalletForm } from "./WalletForm";
import { useToast } from "@/shared/hooks/useToast";
import { usePrices } from "@/shared/hooks/usePrices";
import { useDragReorder } from "./useDragReorder";
import { formatCurrency, formatRelative } from "@/shared/utils/format";
import { countTransactionsByWallet } from "@/shared/db/repo";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { cn } from "@/shared/utils/misc";
import type { Wallet } from "@/shared/types";

interface ActionSheetProps {
  wallet: Wallet | null;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function WalletActionSheet({ wallet, onClose, onEdit, onArchive, onDuplicate, onDelete }: ActionSheetProps) {
  if (!wallet) return null;

  const actions: { label: string; Icon: React.ElementType; onClick: () => void; danger?: true }[] = [
    { label: "Edit Dompet", Icon: Pencil, onClick: onEdit },
    { label: wallet.isArchived ? "Batalkan Arsip" : "Arsipkan", Icon: wallet.isArchived ? Undo2 : Archive, onClick: onArchive },
    { label: "Duplikat Dompet", Icon: Copy, onClick: onDuplicate },
    { label: "Hapus Dompet", Icon: Trash, onClick: onDelete, danger: true },
  ];

  return (
    <BottomSheet isOpen={wallet !== null} onClose={onClose} title={wallet.name}>
      <div className="pb-6">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => { a.onClick(); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-4 text-sm font-medium active:bg-bg-card transition-colors",
              a.danger ? "text-danger" : "text-text-primary",
            )}
          >
            <a.Icon size={16} className="flex-shrink-0" />
            {a.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

export function WalletPage() {
  const navigate = useNavigate();
  const { wallets, transactions, loading, addWallet, updateWallet, removeWallet } = useAppData();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editWallet, setEditWallet] = useState<Wallet | undefined>();
  const [actionWallet, setActionWallet] = useState<Wallet | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  const activeWallets = useMemo(
    () =>
      wallets
        .filter((w) => !w.isArchived)
        .sort((a, b) => (a.sortOrder ?? a.createdAt) - (b.sortOrder ?? b.createdAt)),
    [wallets],
  );
  const archivedWallets = wallets.filter((w) => w.isArchived);

  const netWorth = activeWallets.reduce(
    (sum, w) => sum + computeWalletBalance(w, transactions),
    0,
  );

  const handleReorderSave = async (newOrder: Wallet[]) => {
    await Promise.all(
      newOrder.map((w, i) => updateWallet({ ...w, sortOrder: i })),
    );
  };

  const { reordered, drag, handlePointerDown, handlePointerMove, handlePointerUp } =
    useDragReorder(activeWallets, (newOrder) => { void handleReorderSave(newOrder); });

  const sparklines = useMemo(() => {
    const result: Record<string, number[]> = {};
    const now = new Date();
    const DAYS = 7;
    for (const w of activeWallets) {
      const points: number[] = [];
      for (let d = DAYS - 1; d >= 0; d--) {
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
        dayEnd.setHours(23, 59, 59, 999);
        const cutoff = dayEnd.getTime();
        let balance = w.initialBalance;
        for (const tx of transactions) {
          if (tx.date > cutoff) continue;
          if (tx.walletId === w.id) {
            if (["income", "debt_received", "savings_withdraw", "invest_sell"].includes(tx.type)) {
              balance += tx.amount;
            } else if (["expense", "transfer_external", "debt_given", "savings_deposit", "invest_buy", "debt_repay"].includes(tx.type)) {
              balance -= tx.amount;
            } else if (tx.type === "transfer_internal") {
              balance -= tx.amount;
            }
          } else if (tx.toWalletId === w.id && tx.type === "transfer_internal") {
            balance += tx.amount;
          }
        }
        points.push(balance);
      }
      result[w.id] = points;
    }
    return result;
  }, [activeWallets, transactions]);

  const nonBaseCurrencies = useMemo(
    () => [...new Set(activeWallets.map((w) => w.currency).filter((c) => c !== "IDR"))],
    [activeWallets],
  );

  const { prices, loading: pricesLoading, stale, lastUpdated, refresh } = usePrices(
    nonBaseCurrencies,
    "IDR",
  );

  const getConvertedLabel = (wallet: Wallet): string | undefined => {
    if (wallet.currency === "IDR") return undefined;
    const rate = prices[wallet.currency];
    if (rate === null || rate === undefined) return undefined;
    const balance = computeWalletBalance(wallet, transactions);
    const converted = balance * rate;
    return `≈ ${formatCurrency(converted, "IDR")}`;
  };

  const handleEdit = () => {
    setEditWallet(actionWallet ?? undefined);
    setFormOpen(true);
  };

  const handleArchive = async () => {
    if (!actionWallet) return;
    await updateWallet({ ...actionWallet, isArchived: !actionWallet.isArchived });
    showToast(actionWallet.isArchived ? "Arsip dibatalkan" : "Dompet diarsipkan", "success");
  };

  const handleDuplicate = async () => {
    if (!actionWallet) return;
    await addWallet({
      name: `Salinan dari ${actionWallet.name}`,
      icon: actionWallet.icon,
      color: actionWallet.color,
      currency: actionWallet.currency,
      initialBalance: 0,
      isArchived: false,
    });
    showToast("Dompet berhasil diduplikat", "success");
  };

  const handleDelete = async () => {
    if (!actionWallet) return;
    const count = await countTransactionsByWallet(actionWallet.id);
    if (count > 0) {
      showToast(`Dompet ini punya ${count} transaksi. Arsipkan saja agar data tetap aman.`, "warning");
      return;
    }
    await removeWallet(actionWallet.id);
    showToast("Dompet berhasil dihapus", "success");
  };

  return (
    <>
      <AppBar
        title="Dompet"
        actions={
          <div className="flex items-center gap-2">
            {activeWallets.length > 1 && (
              <button
                onClick={() => setReorderMode((v) => !v)}
                className={cn(
                  "px-3 h-8 rounded-full text-xs font-semibold transition-colors",
                  reorderMode
                    ? "bg-accent-primary text-white"
                    : "bg-bg-card text-text-muted",
                )}
              >
                {reorderMode ? "Selesai" : "Atur Urutan"}
              </button>
            )}
            {nonBaseCurrencies.length > 0 && !reorderMode && (
              <button
                onClick={() => void refresh()}
                className={cn(
                  "w-9 h-9 rounded-full bg-bg-card flex items-center justify-center shadow-card active:scale-90 transition-transform",
                  pricesLoading && "opacity-50 pointer-events-none",
                )}
                aria-label="Perbarui harga"
              >
                <RefreshCw
                  size={16}
                  className={cn("text-text-muted", pricesLoading && "animate-spin")}
                />
              </button>
            )}
            {!reorderMode && (
              <button
                onClick={() => { setEditWallet(undefined); setFormOpen(true); }}
                className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center shadow-fab active:scale-90 transition-transform"
                aria-label="Tambah dompet"
              >
                <Plus size={18} className="text-white" />
              </button>
            )}
          </div>
        }
      />

      <div className="px-4 py-3 bg-bg-page">
        <p className="text-xs text-text-muted font-semibold tracking-widest uppercase">Saldo Bersih</p>
        <p className="text-2xl font-bold font-display text-text-primary tabular-nums tracking-tight">
          {formatCurrency(netWorth, "IDR")}
        </p>
        {nonBaseCurrencies.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            {stale ? (
              <div className="flex items-center gap-1 text-[10px] text-warning">
                <WifiOff size={10} />
                <span>Mode Offline. Harga tidak diperbarui.</span>
              </div>
            ) : lastUpdated !== null ? (
              <p className="text-[10px] text-text-muted">
                Harga diperbarui {formatRelative(lastUpdated)}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : activeWallets.length === 0 ? (
          <EmptyState
            illustration={<WalletEmptyIllustration />}
            title="Belum ada dompet"
            description="Tambahkan dompet pertamamu untuk mulai mencatat keuangan"
            action={{
              label: "+ Tambah Dompet",
              onClick: () => { setEditWallet(undefined); setFormOpen(true); },
            }}
          />
        ) : reorderMode ? (
          <div data-reorder-list className="space-y-2">
            {reordered.map((w, i) => {
              const isDragging = drag?.dragIndex === i;
              const isOver = drag !== null && drag.overIndex === i && drag.dragIndex !== i;
              return (
                <div
                  key={w.id}
                  className={cn(
                    "flex items-center gap-3 bg-bg-card rounded-2xl px-3 py-3 shadow-card transition-opacity",
                    isDragging && "opacity-50",
                    isOver && "ring-2 ring-accent-primary/40",
                  )}
                >
                  <div
                    className="p-2 cursor-grab active:cursor-grabbing touch-none"
                    onPointerDown={handlePointerDown(i)}
                    onPointerMove={handlePointerMove(i)}
                    onPointerUp={handlePointerUp(i)}
                    aria-label="Seret untuk mengubah urutan"
                  >
                    <GripVertical size={18} className="text-text-muted" />
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${w.color}22` }}
                  >
                    <DynamicIcon name={w.icon} size={18} style={{ color: w.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{w.name}</p>
                    <p className="text-xs text-text-muted tabular-nums">
                      {formatCurrency(computeWalletBalance(w, transactions), w.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {activeWallets.map((w) => {
              const label = getConvertedLabel(w);
              return (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  balance={computeWalletBalance(w, transactions)}
                  onClick={() => navigate(`/wallets/${w.id}`)}
                  onLongPress={() => setActionWallet(w)}
                  {...(label !== undefined ? { convertedLabel: label } : {})}
                  {...(sparklines[w.id] !== undefined ? { sparkline: sparklines[w.id] } : {})}
                />
              );
            })}
          </div>
        )}

        {archivedWallets.length > 0 && !reorderMode && (
          <div className="pt-2">
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="text-sm text-text-muted py-2 flex items-center gap-1.5"
            >
              {showArchived
                ? <ChevronDown size={14} className="flex-shrink-0" />
                : <ChevronRight size={14} className="flex-shrink-0" />}
              Dompet Diarsipkan ({archivedWallets.length})
            </button>
            {showArchived && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {archivedWallets.map((w) => (
                  <WalletCard
                    key={w.id}
                    wallet={w}
                    balance={computeWalletBalance(w, transactions)}
                    onLongPress={() => setActionWallet(w)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <WalletForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditWallet(undefined); }}
        {...(editWallet !== undefined ? { editWallet } : {})}
      />

      <WalletActionSheet
        wallet={actionWallet}
        onClose={() => setActionWallet(null)}
        onEdit={handleEdit}
        onArchive={() => void handleArchive()}
        onDuplicate={() => void handleDuplicate()}
        onDelete={() => void handleDelete()}
      />
    </>
  );
}
