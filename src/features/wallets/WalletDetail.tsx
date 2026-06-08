import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Archive, Edit2, MoreVertical, Trash2 } from "lucide-react";
import { useAppData, computeWalletBalance } from "@/app/AppDataContext";
import { AppBar } from "@/shared/components/AppBar";
import { TransactionListItem } from "@/shared/components/TransactionListItem";
import { EmptyState, TransactionEmptyIllustration } from "@/shared/components/EmptyState";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { WalletForm } from "./WalletForm";
import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/format";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { countTransactionsByWallet } from "@/shared/db/repo";
import { cn } from "@/shared/utils/misc";

export function WalletDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wallets, transactions, categories, updateWallet, removeWallet } = useAppData();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const wallet = wallets.find((w) => w.id === id);

  if (!wallet) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-text-muted">Dompet tidak ditemukan</p>
      </div>
    );
  }

  const walletTxs = transactions.filter(
    (tx) => tx.walletId === wallet.id || tx.toWalletId === wallet.id,
  );
  const balance = computeWalletBalance(wallet, transactions);

  const grouped: Record<string, typeof walletTxs> = {};
  for (const tx of walletTxs) {
    const dateKey = new Date(tx.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const existing = grouped[dateKey];
    if (existing !== undefined) {
      existing.push(tx);
    } else {
      grouped[dateKey] = [tx];
    }
  }

  const handleArchive = async () => {
    await updateWallet({ ...wallet, isArchived: !wallet.isArchived });
    showToast(wallet.isArchived ? "Arsip dibatalkan" : "Dompet diarsipkan", "success");
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    const count = await countTransactionsByWallet(wallet.id);
    if (count > 0) {
      showToast(
        `Dompet ini punya ${count} transaksi. Arsipkan saja agar data tetap aman.`,
        "warning",
      );
      setMenuOpen(false);
      return;
    }
    await removeWallet(wallet.id);
    showToast("Dompet berhasil dihapus", "success");
    navigate("/wallets", { replace: true });
  };

  return (
    <>
      <AppBar
        title={wallet.name}
        showBack
        actions={
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-bg-card transition-colors"
            aria-label="Menu"
          >
            <MoreVertical size={20} className="text-text-muted" />
          </button>
        }
      />

      <div className="px-4 py-5 bg-gradient-to-b from-bg-card to-bg-page border-b border-bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${wallet.color}22` }}
          >
            <DynamicIcon name={wallet.icon} size={20} style={{ color: wallet.color }} />
          </div>
          <div>
            <p className="text-xs text-text-muted">{wallet.currency}</p>
            <p className="text-xs text-text-muted">{walletTxs.length} transaksi</p>
          </div>
          {wallet.isArchived && (
            <span className="ml-auto text-xs bg-bg-card text-text-muted px-2 py-1 rounded-sm">
              Diarsipkan
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-text-primary tabular-nums">
          {formatCurrency(balance, wallet.currency)}
        </p>
        <p className="text-xs text-text-muted mt-1">Saldo saat ini</p>
      </div>

      <div>
        {walletTxs.length === 0 ? (
          <EmptyState
            illustration={<TransactionEmptyIllustration />}
            title="Belum ada transaksi"
            description="Transaksi ke dompet ini akan muncul di sini"
          />
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-bg-page sticky top-14 z-10 border-b border-bg-card">
                <p className="text-xs font-semibold text-text-muted">{date}</p>
              </div>
              <div className="divide-y divide-bg-card">
                {txs.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  return <TransactionListItem key={tx.id} transaction={tx} {...(cat !== undefined ? { category: cat } : {})} />;
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Opsi Dompet">
        <div className="pb-6">
          <button
            onClick={() => { setMenuOpen(false); setEditOpen(true); }}
            className="flex items-center gap-3 w-full px-5 py-4 text-sm text-text-primary active:bg-bg-card"
          >
            <Edit2 size={18} className="text-text-muted" />
            Edit Dompet
          </button>
          <button
            onClick={() => void handleArchive()}
            className="flex items-center gap-3 w-full px-5 py-4 text-sm text-text-primary active:bg-bg-card"
          >
            <Archive size={18} className="text-text-muted" />
            {wallet.isArchived ? "Batalkan Arsip" : "Arsipkan Dompet"}
          </button>
          <button
            onClick={() => void handleDelete()}
            className="flex items-center gap-3 w-full px-5 py-4 text-sm text-danger active:bg-bg-card"
          >
            <Trash2 size={18} />
            Hapus Dompet
          </button>
        </div>
      </BottomSheet>

      <WalletForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editWallet={wallet}
      />
    </>
  );
}
