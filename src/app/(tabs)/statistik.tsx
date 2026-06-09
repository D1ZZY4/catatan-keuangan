import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { LocalInsights } from '@/shared/components/LocalInsights';
import { useStatData } from '@/features/stats/useStatData';
import { formatCurrency, formatCompact } from '@/shared/utils/formatters';
import { BarChart3 } from 'lucide-react-native';

type PeriodFilter = 'week' | 'month' | '3month' | '6month' | 'year';

const PERIOD_OPTIONS = [
  { value: 'week' as PeriodFilter,   label: 'Minggu' },
  { value: 'month' as PeriodFilter,  label: 'Bulan ini' },
  { value: '3month' as PeriodFilter, label: '3 Bulan' },
  { value: '6month' as PeriodFilter, label: '6 Bulan' },
  { value: 'year' as PeriodFilter,   label: 'Tahun ini' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function StatistikScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const { totalIncome, totalExpense, categoryExpenses, allTransactions, allCategories, loading } = useStatData(period);

  const netFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={styles.padding}>
          <SkeletonCard height={44} />
          <SkeletonCard height={100} style={styles.gap} />
          <SkeletonCard height={200} style={styles.gap} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 140 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        Statistik
      </Text>

      <ChipGroup options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.success}18` }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Pemasukan
          </Text>
          <Text style={[styles.summaryAmt, { color: colors.success, fontFamily: 'InstrumentSerif-Regular' }]}>
            {formatCompact(totalIncome)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.danger}18` }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Pengeluaran
          </Text>
          <Text style={[styles.summaryAmt, { color: colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
            {formatCompact(totalExpense)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: `${netFlow >= 0 ? colors.success : colors.danger}18` }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Selisih
          </Text>
          <Text style={[styles.summaryAmt, { color: netFlow >= 0 ? colors.success : colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
            {netFlow >= 0 ? '+' : '-'}{formatCompact(Math.abs(netFlow))}
          </Text>
        </View>
      </View>

      {/* Savings Rate */}
      {totalIncome > 0 && (
        <View style={[styles.savingsCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.savingsHeader}>
            <Text style={[styles.savingsTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Rasio Tabungan
            </Text>
            <Text style={[styles.savingsValue, { color: savingsRate >= 20 ? colors.success : savingsRate >= 10 ? colors.warning : colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
              {savingsRate.toFixed(1)}%
            </Text>
          </View>
          <ProgressBar
            progress={Math.max(0, Math.min(1, savingsRate / 100))}
            height={8}
            color={savingsRate >= 20 ? colors.success : savingsRate >= 10 ? colors.warning : colors.danger}
          />
          <Text style={[styles.savingsHint, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            {savingsRate >= 20 ? 'Hebat! Rasio tabungan yang baik.' : savingsRate >= 10 ? 'Cukup baik. Coba tingkatkan lagi.' : 'Perlu ditingkatkan. Target minimal 20%.'}
          </Text>
        </View>
      )}

      {/* Mini Bar Chart */}
      {categoryExpenses.length > 0 && (
        <View style={[styles.barChartCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.chartTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            Top Pengeluaran
          </Text>
          <View style={styles.barChart}>
            {categoryExpenses.slice(0, 5).map((item, i) => {
              const barW = Math.max(12, (item.percent * (SCREEN_WIDTH - 120)));
              return (
                <View key={item.categoryId} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                    {item.categoryName}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: barW,
                          backgroundColor: [colors.danger, colors.warning, colors.accentPrimary, colors.success, colors.accentWarm][i % 5],
                        },
                      ]}
                    />
                    <Text style={[styles.barAmt, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
                      {formatCompact(item.amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Local Insights */}
      <LocalInsights transactions={allTransactions} categories={allCategories} />

      {/* Category Breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        Detail per Kategori
      </Text>

      {categoryExpenses.length === 0 ? (
        <EmptyState
          title="Belum ada data statistik"
          subtitle="Mulai catat transaksi untuk melihat statistik."
          icon={<BarChart3 size={48} color={colors.textMuted} />}
        />
      ) : (
        <View style={styles.categoryList}>
          {categoryExpenses.map(item => (
            <View key={item.categoryId} style={[styles.catRow, { backgroundColor: colors.bgCard }]}>
              <View style={styles.catInfo}>
                <Text style={[styles.catName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                  {item.categoryName}
                </Text>
                <Text style={[styles.catAmt, { color: colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <View style={styles.catBarWrap}>
                <ProgressBar
                  progress={item.percent}
                  height={6}
                  color={colors.danger}
                />
                <Text style={[styles.catPct, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {(item.percent * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  padding: { padding: 16, gap: 12 },
  gap: { marginTop: 12 },
  title: { fontSize: 24, lineHeight: 32 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, gap: 4 },
  summaryLabel: { fontSize: 11, lineHeight: 16 },
  summaryAmt: { fontSize: 18, lineHeight: 24 },
  savingsCard: { padding: 16, borderRadius: 14, gap: 10 },
  savingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savingsTitle: { fontSize: 15, lineHeight: 22 },
  savingsValue: { fontSize: 18, lineHeight: 24 },
  savingsHint: { fontSize: 12, lineHeight: 16 },
  barChartCard: { padding: 16, borderRadius: 14, gap: 12 },
  chartTitle: { fontSize: 15, lineHeight: 22 },
  barChart: { gap: 10 },
  barRow: { gap: 4 },
  barLabel: { fontSize: 12, lineHeight: 16 },
  barTrack: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barFill: { height: 10, borderRadius: 5 },
  barAmt: { fontSize: 11, lineHeight: 16 },
  sectionTitle: { fontSize: 18, lineHeight: 26, marginTop: 8 },
  categoryList: { gap: 8 },
  catRow: { padding: 12, borderRadius: 12, gap: 8 },
  catInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 14, lineHeight: 20 },
  catAmt: { fontSize: 13, lineHeight: 20 },
  catBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catPct: { fontSize: 11, lineHeight: 16, width: 40, textAlign: 'right' },
});
