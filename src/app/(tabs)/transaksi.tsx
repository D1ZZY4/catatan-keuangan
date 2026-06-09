import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { SearchBar } from '@/shared/components/SearchBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { formatCurrency, formatRelativeDate } from '@/shared/utils/formatters';
import {
  TrendingUp, TrendingDown, ArrowLeftRight, Send, UserPlus, UserMinus,
  CheckCircle, PiggyBank, Wallet, BarChart2, DollarSign, ArrowUpDown,
} from 'lucide-react-native';
import { useTransactionList, type EnrichedTransaction } from '@/features/transactions/useTransactionList';
import type { TransactionType } from '@/shared/types';
import { isIncomeType, isExpenseType, getTypeOption } from '@/shared/constants/transactionTypes';
import { useRouter } from 'expo-router';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';
type TypeFilter = 'all' | 'income' | 'expense' | 'transfer';

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'today', label: 'Hari ini' },
  { value: 'week',  label: '7 Hari' },
  { value: 'month', label: 'Bulan ini' },
  { value: 'all',   label: 'Semua' },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all',      label: 'Semua' },
  { value: 'income',   label: 'Pemasukan' },
  { value: 'expense',  label: 'Pengeluaran' },
  { value: 'transfer', label: 'Transfer' },
];

function getTypeIcon(type: TransactionType, color: string) {
  const p = { size: 18, color, strokeWidth: 1.8 as const };
  switch (type) {
    case 'income':            return <TrendingUp {...p} />;
    case 'expense':           return <TrendingDown {...p} />;
    case 'transfer_internal': return <ArrowLeftRight {...p} />;
    case 'transfer_external': return <Send {...p} />;
    case 'debt_given':        return <UserPlus {...p} />;
    case 'debt_received':     return <UserMinus {...p} />;
    case 'debt_repay':        return <CheckCircle {...p} />;
    case 'savings_deposit':   return <PiggyBank {...p} />;
    case 'savings_withdraw':  return <Wallet {...p} />;
    case 'invest_buy':        return <BarChart2 {...p} />;
    case 'invest_sell':       return <DollarSign {...p} />;
    default:                  return <TrendingDown {...p} />;
  }
}

interface TxRowProps { tx: EnrichedTransaction; showDivider: boolean }

function TxRow({ tx, showDivider }: TxRowProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const isIncome = isIncomeType(tx.type);
  const isExpense = isExpenseType(tx.type);
  const amtColor = isIncome ? colors.success : isExpense ? colors.danger : colors.accentPrimary;
  const prefix = isIncome ? '+' : isExpense ? '-' : '';
  const typeLabel = getTypeOption(tx.type)?.label ?? tx.type;
  const primaryLabel = tx.note ?? tx.categoryName ?? typeLabel;
  const secondaryLabel = tx.note && tx.categoryName ? tx.categoryName : null;

  return (
    <>
      <Pressable
        onPress={() => router.push(`/transaksi/${tx.id}`)}
        style={({ pressed }) => [
          styles.txRow,
          pressed && { backgroundColor: `${colors.bgSurface}60` },
        ]}
        accessibilityLabel={`${primaryLabel} ${formatCurrency(tx.amount, tx.currency)}`}
      >
        <View style={[styles.txIcon, { backgroundColor: `${amtColor}18` }]}>
          {getTypeIcon(tx.type, amtColor)}
        </View>
        <View style={styles.txInfo}>
          <Text style={[styles.txLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]} numberOfLines={1}>
            {primaryLabel}
          </Text>
          {secondaryLabel ? (
            <Text style={[styles.txNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
              {secondaryLabel}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.txAmt, { color: amtColor, fontFamily: 'JetBrainsMono-Regular' }]}>
          {prefix}{formatCurrency(tx.amount, tx.currency)}
        </Text>
      </Pressable>
      {showDivider && <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />}
    </>
  );
}

export default function TransaksiScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const { sections, loading, refreshing, refresh } = useTransactionList({ period, typeFilter, search });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top + 12 }]}>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <SkeletonCard height={44} />
          <SkeletonCard height={36} />
          <SkeletonCard height={36} />
          {[1, 2, 3].map(i => <SkeletonCard key={i} height={90} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      {/* ── Fixed Sticky Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.bgPage }]}>
        <View style={{ paddingHorizontal: 16 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Cari transaksi..." />
        </View>

        {/* Unified filter pill row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {PERIOD_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              onPress={() => setPeriod(opt.value)}
              style={[
                styles.pill,
                period === opt.value
                  ? { backgroundColor: colors.accentPrimary }
                  : { backgroundColor: colors.bgCard },
              ]}
            >
              <Text style={[
                styles.pillLabel,
                { fontFamily: 'DMSans-SemiBold' },
                period === opt.value ? { color: colors.white } : { color: colors.textMuted },
              ]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}

          <View style={[styles.pillSep, { backgroundColor: colors.bgSurface }]} />

          {TYPE_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              onPress={() => setTypeFilter(opt.value)}
              style={[
                styles.pill,
                typeFilter === opt.value
                  ? { backgroundColor: colors.bgCard, borderWidth: 1.5, borderColor: colors.accentPrimary }
                  : { backgroundColor: colors.bgCard },
              ]}
            >
              <Text style={[
                styles.pillLabel,
                { fontFamily: 'DMSans-Medium' },
                typeFilter === opt.value ? { color: colors.accentPrimary } : { color: colors.textMuted },
              ]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Scrollable Section List ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accentPrimary} />}
        showsVerticalScrollIndicator={false}
      >
        {sections.length === 0 ? (
          <EmptyState
            title={search ? 'Tidak ditemukan' : 'Belum ada transaksi'}
            subtitle={search ? 'Coba kata kunci lain.' : 'Tap tombol + di bawah untuk mencatat transaksi baru.'}
            icon={<ArrowUpDown size={44} color={colors.textMuted} />}
            ctaLabel={!search ? '+ Catat Transaksi' : undefined}
            onCta={!search ? () => router.push('/(modals)/form-transaksi') : undefined}
          />
        ) : (
          sections.map(section => (
            <View key={section.date} style={{ gap: 6 }}>
              {/* Date section header */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionDate, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
                  {formatRelativeDate(section.date)}
                </Text>
                <Text style={[styles.sectionTotal, {
                  color: section.total >= 0 ? colors.success : colors.danger,
                  fontFamily: 'JetBrainsMono-Regular',
                }]}>
                  {section.total >= 0 ? '+' : ''}{formatCurrency(section.total)}
                </Text>
              </View>

              {/* Grouped transaction card */}
              <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }, shadows.sm]}>
                {section.data.map((tx, idx) => (
                  <TxRow
                    key={tx.id}
                    tx={tx}
                    showDivider={idx < section.data.length - 1}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 8, gap: 8 },
  pillRow: { paddingHorizontal: 16, gap: 6, paddingBottom: 4 },
  pill: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 99 },
  pillLabel: { fontSize: 12 },
  pillSep: { width: 1.5, height: '60%', alignSelf: 'center', borderRadius: 1 },
  content: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionDate: { fontSize: 12 },
  sectionTotal: { fontSize: 12 },
  sectionCard: { borderRadius: 20, overflow: 'hidden' },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 14, lineHeight: 20 },
  txNote: { fontSize: 11, lineHeight: 16, marginTop: 1 },
  txAmt: { fontSize: 14, lineHeight: 20 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
});
