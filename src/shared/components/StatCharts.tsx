import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCompact } from '@/shared/utils/formatters';
import type { CategoryExpense, MonthlyPoint } from '@/features/stats/useStatData';

const SCREEN_W = Dimensions.get('window').width;
const CHART_H = 180;
const CHART_W = SCREEN_W - 48;

interface DonutChartProps {
  data: CategoryExpense[];
}

interface BarTrendProps {
  data: MonthlyPoint[];
}

// ─── Donut-style pie via stacked horizontal bars (works everywhere) ───────────
export function CategoryDonut({ data }: DonutChartProps) {
  const { colors } = useTheme();
  const top5 = data.slice(0, 6);
  const total = top5.reduce((s, d) => s + d.amount, 0);

  if (top5.length === 0) return null;

  return (
    <View style={styles.chartCard}>
      <Text style={[styles.chartTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        Komposisi Pengeluaran
      </Text>
      {/* Segmented bar */}
      <View style={styles.segRow}>
        {top5.map((item, i) => {
          const pct = total > 0 ? item.amount / total : 0;
          return (
            <View
              key={item.categoryId}
              style={[
                styles.seg,
                {
                  flex: pct,
                  backgroundColor: item.color || PALETTE[i % PALETTE.length],
                  borderTopLeftRadius: i === 0 ? 6 : 0,
                  borderBottomLeftRadius: i === 0 ? 6 : 0,
                  borderTopRightRadius: i === top5.length - 1 ? 6 : 0,
                  borderBottomRightRadius: i === top5.length - 1 ? 6 : 0,
                },
              ]}
            />
          );
        })}
      </View>
      {/* Legend */}
      <View style={styles.legend}>
        {top5.map((item, i) => (
          <View key={item.categoryId} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: item.color || PALETTE[i % PALETTE.length] },
              ]}
            />
            <Text
              style={[styles.legendName, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}
              numberOfLines={1}
            >
              {item.categoryName}
            </Text>
            <Text
              style={[styles.legendPct, { color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}
            >
              {total > 0 ? ((item.amount / total) * 100).toFixed(0) : '0'}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Monthly income vs expense bar chart ──────────────────────────────────────
export function MonthlyBarChart({ data }: BarTrendProps) {
  const { colors } = useTheme();

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
  const barW = Math.max(16, (CHART_W / data.length - 12) / 2);

  return (
    <View style={styles.chartCard}>
      <Text style={[styles.chartTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        Tren 6 Bulan
      </Text>

      {/* Legend */}
      <View style={styles.trendLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendName, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Pemasukan</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
          <Text style={[styles.legendName, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Pengeluaran</Text>
        </View>
      </View>

      {/* Bars */}
      <View style={[styles.barArea, { height: CHART_H }]}>
        {data.map((pt) => {
          const incH = (pt.income / maxVal) * CHART_H;
          const expH = (pt.expense / maxVal) * CHART_H;
          return (
            <View key={pt.label} style={styles.barGroup}>
              <View style={styles.barColumn}>
                {/* Income bar */}
                <View style={styles.barHolder}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: incH,
                        width: barW,
                        backgroundColor: colors.success,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      },
                    ]}
                  />
                </View>
                {/* Expense bar */}
                <View style={styles.barHolder}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: expH,
                        width: barW,
                        backgroundColor: colors.danger,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text
                style={[styles.barLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}
              >
                {pt.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Amount labels for latest month */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        if (!last) return null;
        return (
          <View style={styles.trendFooter}>
            <Text style={[styles.trendAmt, { color: colors.success, fontFamily: 'JetBrainsMono-Regular' }]}>
              +{formatCompact(last.income)}
            </Text>
            <Text style={[styles.trendMonth, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Bulan ini
            </Text>
            <Text style={[styles.trendAmt, { color: colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
              -{formatCompact(last.expense)}
            </Text>
          </View>
        );
      })()}
    </View>
  );
}

const PALETTE = [
  '#8CC0EB', '#F4A35A', '#2E7D32', '#C62828', '#9575CD',
  '#26A69A', '#EF6C00', '#1565C0', '#AD1457', '#558B2F',
];

const styles = StyleSheet.create({
  chartCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  chartTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Donut (segmented bar)
  segRow: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
  },
  seg: {
    height: '100%',
  },
  legend: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  legendPct: {
    fontSize: 11,
    lineHeight: 16,
  },
  // Monthly bar
  trendLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  barArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  barGroup: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  barColumn: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barHolder: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: CHART_H,
  },
  bar: {
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  trendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  trendMonth: {
    fontSize: 12,
    lineHeight: 16,
  },
  trendAmt: {
    fontSize: 13,
    lineHeight: 18,
  },
});
