import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl, Pressable, Modal, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatCurrency, formatRelativeDate } from '@/shared/utils/formatters';
import { database } from '@/shared/db';
import type { Wallet, Transaction, TransactionType } from '@/shared/types';
import { isIncomeType } from '@/shared/constants/transactionTypes';
import { TrendingUp, TrendingDown, MoreVertical, Edit2, Archive, Trash2 } from 'lucide-react-native';
import { useToast } from '@/shared/components/Toast';

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!id) return;
    try {
      if (isRefresh) setRefreshing(true);
      const walletRecord = await database.get<import('@/shared/db').WalletModel>('wallets').find(id);
      setWallet({
        id: walletRecord.id,
        name: walletRecord.name,
        icon: walletRecord.icon,
        color: walletRecord.color,
        currency: walletRecord.currency,
        balance: walletRecord.balance,
        initialBalance: walletRecord.initialBalance,
        isArchived: walletRecord.isArchived,
        showInDashboard: walletRecord.showInDashboard,
        includeInTotal: walletRecord.includeInTotal,
        type: walletRecord.type as Wallet['type'],
        sortOrder: walletRecord.sortOrder,
        createdAt: walletRecord.createdAt.getTime(),
      });

      const txRecords = await database.get<import('@/shared/db').TransactionModel>('transactions').query().fetch();
      const filtered = txRecords
        .filter(tx => tx.walletId === id || tx.toWalletId === id)
        .sort((a, b) => b.date - a.date);

      setTransactions(filtered.map(tx => ({
        id: tx.id,
        type: tx.type as TransactionType,
        walletId: tx.walletId,
        ...(tx.toWalletId ? { toWalletId: tx.toWalletId } : {}),
        categoryId: tx.categoryId,
        amount: tx.amount,
        currency: tx.currency,
        ...(tx.note ? { note: tx.note } : {}),
        date: tx.date,
        createdAt: tx.createdAt.getTime(),
      })));
    } catch {
      setWallet(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function handleArchive() {
    if (!wallet) return;
    setMenuOpen(false);
    try {
      await database.write(async () => {
        const record = await database.get<import('@/shared/db').WalletModel>('wallets').find(wallet.id);
        await record.update(w => { (w as unknown as { isArchived: boolean }).isArchived = !wallet.isArchived; });
      });
      showToast(wallet.isArchived ? 'Arsip dibatalkan' : 'Dompet diarsipkan', 'success');
      void load();
    } catch {
      showToast('Gagal mengubah status arsip', 'error');
    }
  }

  async function handleDelete() {
    if (!wallet) return;
    setMenuOpen(false);
    if (transactions.length > 0) {
      showToast(`Dompet ini punya ${transactions.length} transaksi. Arsipkan saja agar data tetap aman.`, 'warning');
      return;
    }
    Alert.alert(
      'Hapus Dompet?',
      'Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const record = await database.get('wallets').find(wallet.id);
                await (record as { destroyPermanently: () => Promise<void> }).destroyPermanently();
              });
              showToast('Dompet dihapus', 'success');
              router.back();
            } catch {
              showToast('Gagal menghapus dompet', 'error');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Detail Dompet" showBack />
        <View style={styles.padding}>
          <SkeletonCard height={100} />
          <SkeletonCard height={64} style={styles.gap} />
          <SkeletonCard height={64} style={styles.gap} />
        </View>
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
        <AppBar title="Detail Dompet" showBack />
        <EmptyState title="Dompet tidak ditemukan" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar
        title={wallet.name}
        showBack
        rightAction={
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={styles.menuBtn}
            accessibilityLabel="Menu dompet"
          >
            <MoreVertical size={20} color={colors.textMuted} />
          </Pressable>
        }
      />

      <View style={[styles.balanceCard, { backgroundColor: wallet.color, ...shadows.md }]}>
        <View style={styles.balanceHeader}>
          <View>
            <Text style={[styles.balanceCurrency, { color: 'rgba(255,255,255,0.75)', fontFamily: 'DMSans-Regular' }]}>
              {wallet.currency} · {wallet.type}
            </Text>
            <Text style={[styles.txCount, { color: 'rgba(255,255,255,0.65)', fontFamily: 'DMSans-Regular' }]}>
              {transactions.length} transaksi
            </Text>
          </View>
          {wallet.isArchived && (
            <View style={styles.archivedBadge}>
              <Text style={[styles.archivedText, { fontFamily: 'DMSans-Medium' }]}>Diarsipkan</Text>
            </View>
          )}
        </View>
        <Text style={[styles.balanceAmount, { color: '#fff', fontFamily: 'InstrumentSerif-Regular' }]}>
          {formatCurrency(wallet.balance, wallet.currency)}
        </Text>
        <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.75)', fontFamily: 'DMSans-Regular' }]}>
          Saldo saat ini
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isIncome = isIncomeType(item.type);
          const amountColor = isIncome ? colors.success : colors.danger;
          return (
            <Pressable
              onPress={() => router.push(`/transaksi/${item.id}`)}
              style={({ pressed }) => [
                styles.txRow,
                { backgroundColor: colors.bgCard, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.txIcon, { backgroundColor: `${amountColor}18` }]}>
                {isIncome
                  ? <TrendingUp size={18} color={amountColor} />
                  : <TrendingDown size={18} color={amountColor} />
                }
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txDate, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {formatRelativeDate(item.date)}
                </Text>
                {item.note ? (
                  <Text style={[styles.txNote, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]} numberOfLines={1}>
                    {item.note}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.txAmount, { color: amountColor, fontFamily: 'JetBrainsMono-Regular' }]}>
                {isIncome ? '+' : '-'}{formatCurrency(item.amount, item.currency)}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState title="Belum ada transaksi" subtitle="Transaksi untuk dompet ini akan muncul di sini." />}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: insets.bottom + 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accentPrimary} />}
        showsVerticalScrollIndicator={false}
        windowSize={8}
        maxToRenderPerBatch={15}
        initialNumToRender={20}
      />

      {/* Kebab Menu BottomSheet */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.bgSurface, paddingBottom: insets.bottom + 8 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Opsi Dompet
            </Text>
            <Pressable
              onPress={() => { setMenuOpen(false); router.push(`/(modals)/form-dompet?id=${wallet.id}`); }}
              style={({ pressed }) => [styles.sheetRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Edit2 size={18} color={colors.textMuted} />
              <Text style={[styles.sheetRowLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
                Edit Dompet
              </Text>
            </Pressable>
            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => void handleArchive()}
              style={({ pressed }) => [styles.sheetRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Archive size={18} color={colors.textMuted} />
              <Text style={[styles.sheetRowLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
                {wallet.isArchived ? 'Batalkan Arsip' : 'Arsipkan Dompet'}
              </Text>
            </Pressable>
            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => void handleDelete()}
              style={({ pressed }) => [styles.sheetRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Trash2 size={18} color={colors.danger} />
              <Text style={[styles.sheetRowLabel, { color: colors.danger, fontFamily: 'DMSans-Regular' }]}>
                Hapus Dompet
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: 16 },
  gap: { marginTop: 10 },
  menuBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  balanceCard: { margin: 16, padding: 20, borderRadius: 16, gap: 4 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  balanceCurrency: { fontSize: 13, lineHeight: 18 },
  txCount: { fontSize: 11, lineHeight: 16 },
  archivedBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  archivedText: { fontSize: 11, color: '#fff' },
  balanceAmount: { fontSize: 36, lineHeight: 44 },
  balanceLabel: { fontSize: 12, lineHeight: 18 },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDate: { fontSize: 11, lineHeight: 16 },
  txNote: { fontSize: 14, lineHeight: 20 },
  txAmount: { fontSize: 14, lineHeight: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  sheetRowLabel: { fontSize: 15, lineHeight: 22 },
  sheetDivider: { height: StyleSheet.hairlineWidth },
});
