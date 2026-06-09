import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCompact } from '@/shared/utils/formatters';
import { isExpenseType, isIncomeType } from '@/shared/constants/transactionTypes';
import type { TransactionType } from '@/shared/types';

interface Tx {
  type: string;
  amount: number;
  categoryId: string;
  date: number;
}

interface Cat {
  id: string;
  name: string;
}

interface Insight {
  id: string;
  type: 'up' | 'down';
  text: string;
}

interface LocalInsightsProps {
  transactions: Tx[];
  categories: Cat[];
}

export function LocalInsights({ transactions, categories }: LocalInsightsProps) {
  const { colors } = useTheme();

  const insights = useMemo((): Insight[] => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthTx = transactions.filter(tx => tx.date >= startOfMonth && tx.date <= now.getTime());

    const monthIncome = monthTx
      .filter(tx => isIncomeType(tx.type as TransactionType))
      .reduce((s, tx) => s + tx.amount, 0);
    const monthExpense = monthTx
      .filter(tx => isExpenseType(tx.type as TransactionType))
      .reduce((s, tx) => s + tx.amount, 0);

    const result: Insight[] = [];

    const catSpend: Record<string, number> = {};
    for (const tx of monthTx) {
      if (isExpenseType(tx.type as TransactionType)) {
        catSpend[tx.categoryId] = (catSpend[tx.categoryId] ?? 0) + tx.amount;
      }
    }

    const topEntry = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
    if (topEntry) {
      const cat = categories.find(c => c.id === topEntry[0]);
      if (cat) {
        result.push({
          id: 'top-cat',
          type: 'down',
          text: `Pengeluaran terbesar bulan ini: ${cat.name} (${formatCompact(topEntry[1])})`,
        });
      }
    }

    if (monthIncome > 0) {
      const savingsRate = ((monthIncome - monthExpense) / monthIncome) * 100;
      result.push({
        id: 'savings-rate',
        type: savingsRate >= 20 ? 'up' : 'down',
        text: `Rasio tabungan bulan ini: ${savingsRate.toFixed(1)}%${
          savingsRate >= 20 ? ' — di atas target 20%, bagus!' : ' — target minimal 20%'
        }`,
      });
    }

    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime();
    const prevTx = transactions.filter(tx => tx.date >= threeMonthsAgo && tx.date < startOfMonth);
    if (prevTx.length > 0 && topEntry) {
      const prevCatSpend = prevTx
        .filter(tx => isExpenseType(tx.type as TransactionType) && tx.categoryId === topEntry[0])
        .reduce((s, tx) => s + tx.amount, 0);
      const avgPrev = prevCatSpend / 3;
      const thisMon = topEntry[1] ?? 0;
      if (avgPrev > 0 && thisMon > 0) {
        const diffPct = ((thisMon - avgPrev) / avgPrev) * 100;
        const cat = categories.find(c => c.id === topEntry[0]);
        if (cat && Math.abs(diffPct) > 5) {
          result.push({
            id: 'cat-trend',
            type: diffPct > 0 ? 'down' : 'up',
            text: `${cat.name} bulan ini ${Math.abs(diffPct).toFixed(0)}% ${diffPct > 0 ? 'lebih tinggi' : 'lebih rendah'} dari rata-rata 3 bulan lalu`,
          });
        }
      }
    }

    return result.slice(0, 3);
  }, [transactions, categories]);

  if (insights.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lightbulb size={13} color={colors.accentWarm} />
        <Text style={[styles.headerText, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
          ANALITIK LOKAL
        </Text>
      </View>
      {insights.map(ins => (
        <View
          key={ins.id}
          style={[
            styles.insightRow,
            { backgroundColor: ins.type === 'up' ? `${colors.success}18` : `${colors.danger}18` },
          ]}
        >
          {ins.type === 'up'
            ? <TrendingUp size={14} color={colors.success} />
            : <TrendingDown size={14} color={colors.danger} />
          }
          <Text style={[styles.insightText, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
            {ins.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerText: { fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, padding: 12 },
  insightText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
