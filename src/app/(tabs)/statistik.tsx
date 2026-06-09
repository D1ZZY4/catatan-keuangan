import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { LocalInsights } from '@/shared/components/LocalInsights';
import { useStatData } from '@/features/stats/useStatData';
import { DebtTracker } from '@/shared/components/DebtTracker';
import { formatCurrency, formatCompact } from '@/shared/utils/formatters';
import { BarChart3 } from 'lucide-react-native';

type PeriodFilter = 'week' | 'month' | '3month' | '6month' | 'year';
type StatsTab = 'overview' | 'kategori' | 'hutang';

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'week',   label: 'Minggu ini' },
  { value: 'month',  label: 'Bulan ini' },
  { value: '3month', label: '3 Bulan' },
  { value: '6month', label: '6 Bulan' },
  { value: 'year',   label: 'Tahun ini' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function StatistikScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');
  const { totalIncome, totalExpense, categoryExpenses, debtEntries, allTransactions, allCategories, loading } = useStatData(period);

  const netFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={{ padding: 16, gap: 12 }}>
          <SkeletonCard height={44} />
          <SkeletonCard height={100} />
          <SkeletonCard height={200} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      {/* ── Fixed Header ── */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top + 12, backgroundColor: colors.bgPage }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Statistik</Text>

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { borderBottomColor: colors.bgCard }]}>
          {([
            { value: 'overview', label: 'Ringkasan' },
            { value: 'kategori', label: 'Per Kategori' },
            { value: 'hutang',   label: 'Hutang & Piutang' },
          ] as { value: StatsTab; label: string }[]).map(tab => (
            <Pressable
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              style={[styles.tabItem, activeTab === tab.value && { borderBottomColor: colors.accentPrimary, borderBottomWidth: 2 }]}
            >
              <Text style={[
                styles.tabLabel,
                { fontFamily: 'DMSans-SemiBold' },
                activeTab === tab.value ? { color: colors.accentPrimary } : { color: colors.textMuted },
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Period Pills */}
        {(activeTab === 'overview' || activeTab === 'kategori') && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
            {PERIOD_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => setPeriod(opt.value)}
                style={[
                  styles.periodPill,
                  period === opt.value
                    ? { backgroundColor: colors.accentPrimary }
                    : { backgroundColor: colors.bgCard },
                ]}
              >
                <Text style={[
                  styles.periodLabel,
                  { fontFamily: 'DMSans-Medium' },
                  period === opt.value ? { color: colors.white } : { color: colors.textMuted },
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: `${colors.success}15` }]}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Pemasukan</Text>
                <Text style={[styles.summaryAmt, { color: colors.success, fontFamily: 'InstrumentSerif-Regular' }]}>
                  {formatCompact(totalIncome)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: `${colors.danger}15` }]}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Pengeluaran</Text>
                <Text style={[styles.summaryAmt, { color: colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
                  {formatCompact(totalExpense)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: `${netFlow >= 0 ? colors.success : colors.danger}15` }]}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Selisih</Text>
                <Text style={[styles.summaryAmt, { color: netFlow >= 0 ? colors.success : colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
                  {netFlow >= 0 ? '+' : ''}{formatCompact(netFlow)}
                </Text>
              </View>
            </View>

            {/* Savings Rate */}
            {totalIncome > 0 && (
              <View style={[styles.card, { backgroundColor: colors.bgCard }, shadows.sm]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Rasio Tabungan</Text>
                  <Text style={[styles.savingsValue, {
                    color: savingsRate >= 20 ? colors.success : savingsRate >= 10 ? colors.warning : colors.danger,
                    fontFamily: 'JetBrainsMono-Regular',
                  }]}>
                    {savingsRate.toFixed(1)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={Math.max(0, Math.min(1, savingsRate / 100))}
                  height={8}
                  color={savingsRate >= 20 ? colors.success : savingsRate >= 10 ? colors.warning : colors.danger}
                />
                <Text style={[styles.cardHint, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {savingsRate >= 20 ? 'Hebat! Rasio tabungan yang baik.' : savingsRate >= 10 ? 'Cukup baik. Coba tingkatkan lagi.' : 'Perlu ditingkatkan. Target minimal 20%.'}
                </Text>
              </View>
            )}

            {/* Top Spending Bar Chart */}
            {categoryExpenses.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.bgCard }, shadows.sm]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold', marginBottom: 12 }]}>
                  Top Pengeluaran
                </Text>
                {categoryExpenses.slice(0, 5).map((item, i) => {
                  const barW = Math.max(12, item.percent * (SCREEN_WIDTH - 160));
                  const barColors = [colors.danger, colors.warning, colors.accentPrimary, colors.success, colors.accentWarm];
                  return (
                    <View key={item.categoryId} style={{ gap: 4, marginBottom: 8 }}>
                      <Text style={[styles.barLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                        {item.categoryName}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.barFill, { width: barW, backgroundColor: barColors[i % 5] }]} />
                        <Text style={[styles.barAmt, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
                          {formatCompact(item.amount)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Local Insights */}
            <LocalInsights transactions={allTransactions} categories={allCategories} />

            {allTransactions.length === 0 && (
              <EmptyState
                title="Belum ada data statistik"
                subtitle="Mulai catat transaksi untuk melihat statistik keuangan kamu."
                icon={<BarChart3 size={48} color={colors.textMuted} />}
              />
            )}
          </>
        )}

        {activeTab === 'hutang' && (
          <DebtTracker entries={debtEntries} />
        )}

        {activeTab === 'kategori' && (
          <>
            {categoryExpenses.length === 0 ? (
              <EmptyState
                title="Belum ada data"
                subtitle="Catat transaksi dengan kategori untuk melihat statistik per kategori."
                icon={<BarChart3 size={48} color={colors.textMuted} />}
              />
            ) : (
              <View style={{ gap: 8 }}>
                {categoryExpenses.map(item => (
                  <View key={item.categoryId} style={[styles.catRow, { backgroundColor: colors.bgCard }, shadows.sm]}>
                    <View style={styles.catHeader}>
                      <Text style={[styles.catName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                        {item.categoryName}
                      </Text>
                      <Text style={[styles.catAmt, { color: colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <ProgressBar progress={item.percent} height={6} color={colors.danger} />
                      </View>
                      <Text style={[styles.catPct, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                        {(item.percent * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedHeader: { paddingHorizontal: 16, gap: 0 },
  title: { fontSize: 24, lineHeight: 32, marginBottom: 12 },
  tabBar: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 0 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { fontSize: 14 },
  periodRow: { paddingVertical: 12, gap: 8, paddingRight: 4 },
  periodPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  periodLabel: { fontSize: 13 },
  content: { paddingHorizontal: 16, paddingTop: 4, gap: 14 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 16, gap: 4 },
  summaryLabel: { fontSize: 11 },
  summaryAmt: { fontSize: 18, lineHeight: 24 },
  card: { padding: 16, borderRadius: 20, gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15 },
  savingsValue: { fontSize: 18 },
  cardHint: { fontSize: 12 },
  barLabel: { fontSize: 12 },
  barFill: { height: 10, borderRadius: 5 },
  barAmt: { fontSize: 11 },
  catRow: { padding: 14, borderRadius: 16, gap: 8 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 14 },
  catAmt: { fontSize: 13 },
  catPct: { fontSize: 11, width: 40, textAlign: 'right' },
});
