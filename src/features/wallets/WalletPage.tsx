import React, { useMemo, useState } from "react";
import { Archive, Copy, Pencil, Plus, RefreshCw, Trash2 as Trash, Undo2, WifiOff } from "lucide-react";
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
import { formatCurrency, formatRelative } from "@/shared/utils/format";
import { countTransactionsByWallet } from "@/shared/db/repo";
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

  const activeWallets = wallets.filter((w) => !w.isArchived);
  const archivedWallets = wallets.filter((w) => w.isArchived);
  const netWorth = wallets
    .filter((w) => !w.isArchived)
    .reduce((sum, w) => sum + computeWalletBalance(w, transactions), 0);

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
            {nonBaseCurrencies.length > 0 && (
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
            <button
              onClick={() => { setEditWallet(undefined); setFormOpen(true); }}
              className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center shadow-fab active:scale-90 transition-transform"
              aria-label="Tambah dompet"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-3 bg-gradient-to-b from-bg-card to-bg-page border-b border-bg-card">
        <p className="text-xs text-text-muted">Total kekayaan bersih</p>
        <p className="text-2xl font-bold text-text-primary tabular-nums">
          {formatCurrency(netWorth, "IDR")}
        </p>
        {nonBaseCurrencies.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            {stale ? (
              <div className="flex items-center gap-1 text-[10px] text-warning">
                <WifiOff size={10} />
                <span>Mode Offline — harga tidak diperbarui</span>
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
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
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
                />
              );
            })}
          </div>
        )}

        {archivedWallets.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="text-sm text-text-muted py-2 flex items-center gap-1"
            >
              {showArchived ? "▼" : "▶"} Dompet Diarsipkan ({archivedWallets.length})
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
