import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert,
} from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatDateShort } from '@/shared/utils/formatters';
import { EmptyState } from '@/shared/components/EmptyState';
import { useRouter } from 'expo-router';
import type { DebtEntry } from '@/features/stats/useStatData';
import { UserPlus, UserMinus, CheckCircle, ArrowRight } from 'lucide-react-native';

interface DebtTrackerProps {
  entries: DebtEntry[];
}

function groupByPerson(entries: DebtEntry[]) {
  const map = new Map<string, {
    name: string;
    givenTotal: number;
    receivedTotal: number;
    entries: DebtEntry[];
    isSettled: boolean;
  }>();

  for (const e of entries) {
    const existing = map.get(e.personName);
    if (existing) {
      if (e.type === 'debt_given') existing.givenTotal += e.amount;
      else existing.receivedTotal += e.amount;
      existing.entries.push(e);
      if (e.isSettled) existing.isSettled = true;
    } else {
      map.set(e.personName, {
        name: e.personName,
        givenTotal: e.type === 'debt_given' ? e.amount : 0,
        receivedTotal: e.type === 'debt_received' ? e.amount : 0,
        entries: [e],
        isSettled: e.isSettled,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.isSettled !== b.isSettled) return a.isSettled ? 1 : -1;
    return (b.givenTotal + b.receivedTotal) - (a.givenTotal + a.receivedTotal);
  });
}

export function DebtTracker({ entries }: DebtTrackerProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const groups = groupByPerson(entries);
  const open = groups.filter(g => !g.isSettled);
  const settled = groups.filter(g => g.isSettled);

  if (groups.length === 0) {
    return (
      <EmptyState
        title="Tidak ada hutang/piutang"
        subtitle="Catat transaksi jenis Piutang atau Hutang untuk melacaknya di sini."
        ctaLabel="Catat Sekarang"
        onCta={() => router.push('/(modals)/form-transaksi')}
        icon={<UserPlus size={48} color={colors.textMuted} />}
      />
    );
  }

  const totalPiutang = open.reduce((s, g) => s + g.givenTotal, 0);
  const totalHutang = open.reduce((s, g) => s + g.receivedTotal, 0);

  return (
    <View style={styles.container}>
      {/* Summary */}
      {(totalPiutang > 0 || totalHutang > 0) && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: `${colors.warning}18` }]}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Orang berhutang padamu
            </Text>
            <Text style={[styles.summaryAmt, { color: colors.warning, fontFamily: 'InstrumentSerif-Regular' }]}>
              {formatCurrency(totalPiutang)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: `${colors.danger}18` }]}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Kamu berhutang
            </Text>
            <Text style={[styles.summaryAmt, { color: colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
              {formatCurrency(totalHutang)}
            </Text>
          </View>
        </View>
      )}

      {/* Open debts */}
      {open.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            Belum Lunas
          </Text>
          {open.map(group => (
            <View key={group.name} style={[styles.personCard, { backgroundColor: colors.bgCard }]}>
              <View style={styles.personHeader}>
                <View style={[styles.avatar, { backgroundColor: `${colors.warning}22` }]}>
                  {group.givenTotal > 0
                    ? <UserPlus size={18} color={colors.warning} />
                    : <UserMinus size={18} color={colors.danger} />
                  }
                </View>
                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                    {group.name}
                  </Text>
                  <Text style={[styles.personSub, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    {group.entries.length} transaksi
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push({
                    pathname: '/(modals)/form-transaksi',
                    params: { presetType: 'debt_repay', presetPerson: group.name },
                  })}
                  style={[styles.lunasiBtn, { backgroundColor: colors.accentPrimary }]}
                  accessibilityLabel={`Tandai ${group.name} lunas`}
                >
                  <Text style={[styles.lunasiText, { color: colors.white, fontFamily: 'DMSans-Medium' }]}>
                    Tandai Lunas
                  </Text>
                  <ArrowRight size={14} color={colors.white} />
                </Pressable>
              </View>

              {group.givenTotal > 0 && (
                <View style={styles.amtRow}>
                  <Text style={[styles.amtLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    Piutang (berhutang padamu)
                  </Text>
                  <Text style={[styles.amtValue, { color: colors.warning, fontFamily: 'JetBrainsMono-Regular' }]}>
                    +{formatCurrency(group.givenTotal)}
                  </Text>
                </View>
              )}
              {group.receivedTotal > 0 && (
                <View style={styles.amtRow}>
                  <Text style={[styles.amtLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    Hutang (kamu berhutang)
                  </Text>
                  <Text style={[styles.amtValue, { color: colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
                    -{formatCurrency(group.receivedTotal)}
                  </Text>
                </View>
              )}

              {/* Latest entry note */}
              {group.entries[0]?.note && (
                <Text style={[styles.entryNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                  ℹ {group.entries[0].note}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Settled */}
      {settled.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
            Sudah Lunas ({settled.length})
          </Text>
          {settled.map(group => (
            <View key={group.name} style={[styles.personCard, styles.settledCard, { backgroundColor: colors.bgCard }]}>
              <View style={styles.personHeader}>
                <CheckCircle size={18} color={colors.success} />
                <Text style={[styles.personName, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
                  {group.name}
                </Text>
                <Text style={[styles.settledAmt, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
                  {formatCurrency(group.givenTotal + group.receivedTotal)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 16,
  },
  summaryAmt: {
    fontSize: 18,
    lineHeight: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  personCard: {
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  settledCard: {
    opacity: 0.7,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  personName: {
    fontSize: 15,
    lineHeight: 20,
  },
  personSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  lunasiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  lunasiText: {
    fontSize: 12,
    lineHeight: 16,
  },
  amtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  amtLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  amtValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  entryNote: {
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  settledAmt: {
    marginLeft: 'auto',
    fontSize: 13,
    lineHeight: 18,
  },
});
