import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  VictoryPie,
  VictoryBar,
  VictoryArea,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory-native';
import { AppText } from '../../src/shared/components/AppText';
import { AppCard } from '../../src/shared/components/AppCard';
import { AppBar } from '../../src/shared/components/AppBar';
import { ChipGroup } from '../../src/shared/components/ChipGroup';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { AppConfig } from '../../src/shared/config/periods';
import type { PeriodKey } from '../../src/shared/config/periods';
import { useTransactions } from '../../src/shared/hooks/useTransactions';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatMonthKey,
} from '../../src/shared/utils/formatters';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 64;

type StatsTab = 'overview' | 'debt' | 'tags';

function isIncomeType(type: string): boolean {
  return ['income', 'debt_received', 'savings_withdraw', 'invest_sell'].includes(type);
}
function isExpenseType(type: string): boolean {
  return ['expense', 'transfer_external', 'debt_given', 'savings_deposit', 'invest_buy'].includes(type);
}

interface StatCardProps {
  label: string;
  value: string;
  valueColor: string;
}

function StatCard({ label, value, valueColor }: StatCardProps): React.ReactElement {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.bgCard }]}>
      <AppText variant="labelSmall" color={colors.textMuted} style={styles.statLabel}>
        {label}
      </AppText>
      <AppText variant="headingSmall" color={valueColor} style={styles.statValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

export default function StatsScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('thisMonth');
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');

  const { transactions } = useTransactions('all');

  const periodRange = useMemo(() => {
    const def = AppConfig.periods.find((p) => p.key === activePeriod);
    return def?.getRange?.() ?? null;
  }, [activePeriod]);

  const filtered = useMemo(() => {
    if (!periodRange) return transactions;
    return transactions.filter(
      (tx) => tx.date >= periodRange.from.getTime() && tx.date <= periodRange.to.getTime(),
    );
  }, [transactions, periodRange]);

  const totalIncome = useMemo(
    () => filtered.filter((tx) => isIncomeType(tx.type)).reduce((s, tx) => s + tx.amount, 0),
    [filtered],
  );
  const totalExpense = useMemo(
    () => filtered.filter((tx) => isExpenseType(tx.type)).reduce((s, tx) => s + tx.amount, 0),
    [filtered],
  );
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    for (const tx of filtered.filter((t) => isExpenseType(t.type))) {
      const key = tx.categoryId ?? 'Lain-lain';
      const ex = map.get(key);
      if (ex !== undefined) ex.value += tx.amount;
      else map.set(key, { name: key, value: tx.amount });
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filtered]);

  const last6MonthsData = useMemo(() => {
    const months: Array<{ month: string; income: number; expense: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const inc = transactions
        .filter((tx) => tx.date >= start && tx.date <= end && isIncomeType(tx.type))
        .reduce((s, tx) => s + tx.amount, 0);
      const exp = transactions
        .filter((tx) => tx.date >= start && tx.date <= end && isExpenseType(tx.type))
        .reduce((s, tx) => s + tx.amount, 0);
      months.push({ month: formatMonthKey(d), income: inc, expense: exp });
    }
    return months;
  }, [transactions]);

  const openDebts = useMemo(
    () => transactions.filter((tx) => tx.type === 'debt_given' || tx.type === 'debt_received'),
    [transactions],
  );

  const pieColors = [
    colors.accentPrimary,
    colors.accentWarm,
    colors.success,
    colors.danger,
    colors.warning,
    '#AB47BC',
    '#00ACC1',
    '#6D4C41',
  ];

  const periodItems = AppConfig.periods
    .filter((p) => p.key !== 'custom')
    .map((p) => ({ key: p.key, label: p.label }));

  const axesStyle = {
    axis: { stroke: colors.border },
    tickLabels: { fill: colors.textMuted, fontSize: 9, fontFamily: 'DMSans-Regular' },
    grid: { stroke: `${colors.border}40`, strokeDasharray: '4,4' },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <AppBar
        title={AppLabels.tabs.stats}
        hideCalculator
        transparent
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
          {(['overview', 'debt', 'tags'] as StatsTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn,
                { borderBottomColor: activeTab === tab ? colors.accentPrimary : 'transparent' },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
            >
              <AppText
                variant="labelMedium"
                color={activeTab === tab ? colors.accentPrimary : colors.textMuted}
                style={{ fontFamily: activeTab === tab ? 'DMSans-SemiBold' : 'DMSans-Regular' }}
              >
                {tab === 'overview' ? 'Ringkasan' : tab === 'debt' ? 'Hutang & Piutang' : 'Per Tag'}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <>
            <ChipGroup
              items={periodItems}
              selected={[activePeriod]}
              onToggle={(key) => setActivePeriod(key as PeriodKey)}
              multiSelect={false}
              style={styles.periodChips}
            />

            {transactions.length === 0 ? (
              <EmptyState
                icon="bar-chart"
                title={AppLabels.emptyState.stats.title}
                body={AppLabels.emptyState.stats.body}
                style={styles.empty}
              />
            ) : (
              <>
                <View style={styles.statGrid}>
                  <StatCard label="Pemasukan" value={formatCurrencyCompact(totalIncome)} valueColor={colors.success} />
                  <StatCard label="Pengeluaran" value={formatCurrencyCompact(totalExpense)} valueColor={colors.danger} />
                  <StatCard label="Selisih" value={formatCurrencyCompact(netBalance)} valueColor={netBalance >= 0 ? colors.success : colors.danger} />
                  <StatCard
                    label="Tingkat Tabungan"
                    value={`${savingsRate}%`}
                    valueColor={savingsRate >= 20 ? colors.success : savingsRate >= 0 ? colors.warning : colors.danger}
                  />
                </View>

                {expenseByCategory.length > 0 && (
                  <AppCard style={styles.chartCard}>
                    <AppText variant="headingSmall" color={colors.textPrimary} style={styles.chartTitle}>
                      Pengeluaran per Kategori
                    </AppText>
                    <View style={{ alignItems: 'center' }}>
                      <VictoryPie
                        width={CHART_W}
                        height={200}
                        data={expenseByCategory.map((d, i) => ({
                          x: d.name.slice(0, 8),
                          y: d.value,
                        }))}
                        colorScale={pieColors}
                        innerRadius={55}
                        padAngle={2}
                        style={{ labels: { fontSize: 7, fill: colors.textMuted } }}
                        animate={false}
                      />
                    </View>
                    <View style={styles.legend}>
                      {expenseByCategory.slice(0, 6).map((d, i) => (
                        <View key={d.name} style={styles.legendItem}>
                          <View style={[styles.dot, { backgroundColor: pieColors[i % pieColors.length] }]} />
                          <AppText variant="labelSmall" color={colors.textMuted} style={{ flex: 1 }} numberOfLines={1}>
                            {d.name}
                          </AppText>
                          <AppText variant="labelSmall" color={colors.textPrimary} style={styles.monoText}>
                            {formatCurrencyCompact(d.value)}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </AppCard>
                )}

                <AppCard style={styles.chartCard}>
                  <AppText variant="headingSmall" color={colors.textPrimary} style={styles.chartTitle}>
                    Pemasukan vs Pengeluaran (6 Bulan)
                  </AppText>
                  <VictoryChart
                    width={CHART_W}
                    height={200}
                    domainPadding={{ x: 20 }}
                    padding={{ top: 10, bottom: 40, left: 52, right: 10 }}
                  >
                    <VictoryAxis style={axesStyle} />
                    <VictoryAxis
                      dependentAxis
                      style={axesStyle}
                      tickFormat={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`}
                    />
                    <VictoryBar
                      data={last6MonthsData}
                      x="month"
                      y="income"
                      style={{ data: { fill: colors.success, opacity: 0.9 } }}
                      cornerRadius={{ top: 4 }}
                      animate={false}
                    />
                    <VictoryBar
                      data={last6MonthsData}
                      x="month"
                      y="expense"
                      style={{ data: { fill: colors.danger, opacity: 0.9 } }}
                      cornerRadius={{ top: 4 }}
                      animate={false}
                    />
                  </VictoryChart>
                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: colors.success }]} />
                      <AppText variant="labelSmall" color={colors.textMuted}>Pemasukan</AppText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                      <AppText variant="labelSmall" color={colors.textMuted}>Pengeluaran</AppText>
                    </View>
                  </View>
                </AppCard>

                <AppCard style={styles.chartCard}>
                  <AppText variant="headingSmall" color={colors.textPrimary} style={styles.chartTitle}>
                    Tren Total Kas
                  </AppText>
                  <VictoryChart
                    width={CHART_W}
                    height={160}
                    padding={{ top: 10, bottom: 40, left: 55, right: 10 }}
                    containerComponent={<VictoryVoronoiContainer />}
                  >
                    <VictoryAxis style={axesStyle} />
                    <VictoryAxis
                      dependentAxis
                      style={axesStyle}
                      tickFormat={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`}
                    />
                    <VictoryArea
                      data={last6MonthsData.map((d) => ({ x: d.month, y: d.income - d.expense }))}
                      style={{ data: { fill: `${colors.success}33`, stroke: colors.success, strokeWidth: 2 } }}
                      animate={false}
                    />
                  </VictoryChart>
                </AppCard>
              </>
            )}
          </>
        )}

        {activeTab === 'debt' && (
          <View style={styles.debtList}>
            {openDebts.length === 0 ? (
              <EmptyState
                icon="users"
                title={AppLabels.emptyState.debts.title}
                body={AppLabels.emptyState.debts.body}
                style={styles.empty}
              />
            ) : (
              openDebts.map((tx) => (
                <AppCard key={tx.id} style={styles.debtCard}>
                  <View style={styles.debtRow}>
                    <AppText variant="bodyMedium" color={colors.textPrimary}>
                      {tx.linkedPersonName ?? '—'}
                    </AppText>
                    <AppText
                      variant="bodyMedium"
                      color={tx.type === 'debt_given' ? colors.danger : colors.success}
                      style={styles.monoText}
                    >
                      {tx.type === 'debt_given' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                    </AppText>
                  </View>
                  <AppText variant="labelSmall" color={colors.textMuted}>
                    {tx.type === 'debt_given' ? 'Piutang' : 'Hutang'}
                  </AppText>
                </AppCard>
              ))
            )}
          </View>
        )}

        {activeTab === 'tags' && (
          <EmptyState
            icon="tag"
            title="Belum ada statistik per tag"
            body="Tambahkan tag ke transaksimu untuk melihat statistiknya di sini."
            style={styles.empty}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  periodChips: {
    marginHorizontal: -16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 14,
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  chartCard: {
    padding: 14,
  },
  chartTitle: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: '45%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  monoText: {
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  empty: {
    marginTop: 40,
  },
  debtList: {
    gap: 10,
    paddingTop: 8,
  },
  debtCard: {
    gap: 4,
  },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
