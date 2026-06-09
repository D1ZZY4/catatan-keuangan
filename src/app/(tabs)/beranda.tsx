import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { Card } from '@/shared/components/Card';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useRouter } from 'expo-router';
import { useHomeData } from '@/features/home/useHomeData';
import { formatCompact, formatCurrency } from '@/shared/utils/formatters';
import {
  TrendingUp, TrendingDown, Wallet, Plus, ScanLine,
  ArrowLeftRight, Heart, PiggyBank, Eye, EyeOff,
} from 'lucide-react-native';

const MORNING_GREETS = ['Selamat pagi', 'Pagi yang cerah', 'Hai, selamat pagi', 'Semangat pagi'];
const AFTERNOON_GREETS = ['Selamat siang', 'Hai, selamat siang', 'Siang yang produktif', 'Halo'];
const EVENING_GREETS = ['Selamat sore', 'Sore yang menyenangkan', 'Hai, selamat sore', 'Sore hari'];
const NIGHT_GREETS = ['Selamat malam', 'Malam yang tenang', 'Hai, selamat malam', 'Istirahat yang baik'];

const MORNING_SUBS = ['Yuk mulai hari dengan mencatat keuangan.', 'Semoga harimu produktif!', 'Pagi ini, pantau saldo dompetmu.', 'Hari baru, semangat baru!'];
const AFTERNOON_SUBS = ['Sudah catat pengeluaran pagi ini?', 'Jangan lupa catat transaksi siang ini.', 'Pantau keuanganmu setiap hari.', 'Satu catatan kecil, manfaat besar.'];
const EVENING_SUBS = ['Waktunya rekap pengeluaran hari ini.', 'Cek anggaran sebelum belanja sore.', 'Berapa yang sudah dikeluarkan hari ini?', 'Sebentar lagi malam, rekap harimu.'];
const NIGHT_SUBS = ['Sudah catat semua transaksi hari ini?', 'Rekap keuangan harian sebelum istirahat.', 'Pastikan semua pengeluaran sudah tercatat.', 'Tutup hari dengan catatan yang lengkap.'];

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}

function getSmartGreeting(now: Date): { prefix: string; sub: string } {
  const hour = now.getHours();
  const day = now.getDay();
  const date = now.getDate();
  const seed = Math.floor(Date.now() / (1000 * 60 * 20));

  let prefixPool: string[];
  let subPool: string[];

  if (hour >= 4 && hour < 11) {
    prefixPool = MORNING_GREETS; subPool = MORNING_SUBS;
  } else if (hour >= 11 && hour < 15) {
    prefixPool = AFTERNOON_GREETS; subPool = AFTERNOON_SUBS;
  } else if (hour >= 15 && hour < 19) {
    prefixPool = EVENING_GREETS; subPool = EVENING_SUBS;
  } else {
    prefixPool = NIGHT_GREETS; subPool = NIGHT_SUBS;
  }

  const prefix = pickRandom(prefixPool, seed);

  let contextSubs: string[] = [];
  if (date === 1) {
    contextSubs = ['Selamat datang di bulan baru! Waktunya merencanakan anggaran.', 'Awal bulan, saatnya atur keuangan dengan bijak.'];
  } else if (date >= 25) {
    contextSubs = ['Hampir akhir bulan, pantau sisa anggaranmu.', 'Beberapa hari lagi akhir bulan, cek pengeluaranmu.'];
  } else if (day === 1) {
    contextSubs = ['Semangat memulai pekan baru!', 'Awal pekan yang tepat untuk mencatat keuangan.'];
  } else if (day === 0 || day === 6) {
    contextSubs = ['Selamat menikmati akhir pekan!', 'Hari yang tepat untuk evaluasi keuangan mingguan.'];
  }

  const combined = [...contextSubs, ...subPool];
  const sub = pickRandom(combined, seed + date);
  return { prefix, sub };
}

interface HealthFactor {
  label: string;
  score: number;
  hint: string;
}

function calcHealthScore(
  totalBalance: number,
  monthlyIncome: number,
  monthlyExpense: number
): { score: number; factors: HealthFactor[]; label: string; color: string } {
  const factors: HealthFactor[] = [];
  let total = 0;

  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpense) / monthlyIncome : 0;
  const savingsScore = Math.min(40, Math.max(0, savingsRate * 200));
  factors.push({ label: 'Rasio Tabungan', score: savingsScore / 40, hint: `${(savingsRate * 100).toFixed(0)}% — target ≥ 20%` });
  total += savingsScore;

  const monthsBuffer = monthlyExpense > 0 ? totalBalance / monthlyExpense : 0;
  const bufferScore = Math.min(30, monthsBuffer * 10);
  factors.push({ label: 'Dana Darurat', score: bufferScore / 30, hint: `${monthsBuffer.toFixed(1)}x pengeluaran — target ≥ 3x` });
  total += bufferScore;

  const cfScore = monthlyIncome >= monthlyExpense ? 30 : Math.max(0, 30 * (monthlyIncome / Math.max(monthlyExpense, 1)));
  factors.push({ label: 'Arus Kas', score: cfScore / 30, hint: monthlyIncome >= monthlyExpense ? 'Positif' : 'Negatif — pengeluaran melebihi pemasukan' });
  total += cfScore;

  const score = Math.round(total);
  const label = score >= 80 ? 'Sangat Baik' : score >= 60 ? 'Baik' : score >= 40 ? 'Cukup' : 'Perlu Perhatian';
  const color = score >= 80 ? '#4CAF50' : score >= 60 ? '#8BC34A' : score >= 40 ? '#FF9800' : '#F44336';
  return { score, factors, label, color };
}

export default function BerandaScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets, totalBalance, monthIncome, monthExpense, recentTransactions, loading, reload } = useHomeData();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const now = useMemo(() => new Date(), []);
  const { prefix, sub } = useMemo(() => getSmartGreeting(now), [now]);

  const health = useMemo(
    () => calcHealthScore(totalBalance, monthIncome, monthExpense),
    [totalBalance, monthIncome, monthExpense]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const quickActions = [
    { icon: <Plus size={20} color="#fff" />, label: 'Catat', onPress: () => router.push('/(modals)/form-transaksi'), color: colors.accentPrimary },
    { icon: <ArrowLeftRight size={20} color="#fff" />, label: 'Transfer', onPress: () => router.push({ pathname: '/(modals)/form-transaksi', params: { type: 'transfer_internal' } }), color: colors.accentSecondary },
    { icon: <ScanLine size={20} color="#fff" />, label: 'Scan', onPress: () => router.push('/(modals)/scanner'), color: colors.success },
    { icon: <PiggyBank size={20} color="#fff" />, label: 'Dompet', onPress: () => router.push('/(modals)/form-dompet'), color: colors.accentWarm },
  ];

  const handleAddWallet = useCallback(() => {
    router.push('/(modals)/form-dompet');
  }, [router]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={styles.padding}>
          <SkeletonCard height={32} width="60%" />
          <SkeletonCard height={20} width="40%" style={styles.gap4} />
          <SkeletonCard height={120} style={styles.gap12} />
          <SkeletonCard height={80} style={styles.gap12} />
          <SkeletonCard height={80} style={styles.gap12} />
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor={colors.accentPrimary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Smart Greeting Header */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text style={[styles.greetingPrefix, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              {prefix} 👋
            </Text>
            <Text style={[styles.greetingSub, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              {sub}
            </Text>
          </View>
          <Pressable
            onPress={() => setBalanceVisible(v => !v)}
            style={[styles.eyeBtn, { backgroundColor: colors.bgSurface }]}
            accessibilityLabel={balanceVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
          >
            {balanceVisible
              ? <Eye size={16} color={colors.textMuted} />
              : <EyeOff size={16} color={colors.textMuted} />
            }
          </Pressable>
        </View>

        <Text style={[styles.netWorthLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          SALDO BERSIH
        </Text>
        <Text style={[styles.netWorth, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
          {balanceVisible ? formatCompact(totalBalance) : 'Rp ••••••'}
        </Text>

        {/* Income / Expense mini row */}
        <View style={styles.miniSummaryRow}>
          <View style={[styles.miniCard, { backgroundColor: `${colors.success}18`, borderColor: `${colors.success}30`, borderWidth: 1 }]}>
            <TrendingUp size={11} color={colors.success} />
            <Text style={[styles.miniLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Masuk</Text>
            <Text style={[styles.miniAmt, { color: colors.success, fontFamily: 'InstrumentSerif-Regular' }]}>
              {balanceVisible ? formatCompact(monthIncome) : '••••'}
            </Text>
          </View>
          <View style={[styles.miniCard, { backgroundColor: `${colors.danger}18`, borderColor: `${colors.danger}30`, borderWidth: 1 }]}>
            <TrendingDown size={11} color={colors.danger} />
            <Text style={[styles.miniLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Keluar</Text>
            <Text style={[styles.miniAmt, { color: colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
              {balanceVisible ? formatCompact(monthExpense) : '••••'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map(qa => (
          <Pressable
            key={qa.label}
            onPress={qa.onPress}
            style={({ pressed }) => [styles.qaBtn, { backgroundColor: qa.color, opacity: pressed ? 0.85 : 1 }]}
            accessibilityLabel={qa.label}
          >
            {qa.icon}
            <Text style={[styles.qaLabel, { fontFamily: 'DMSans-Regular' }]}>{qa.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Financial Health Score */}
      {(monthIncome > 0 || totalBalance > 0) && (
        <View style={[styles.healthCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.healthHeader}>
            <View style={styles.healthTitle}>
              <Heart size={18} color={health.color} fill={health.color} />
              <Text style={[styles.healthTitleText, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Skor Kesehatan Keuangan
              </Text>
            </View>
            <View style={[styles.healthScore, { backgroundColor: `${health.color}22` }]}>
              <Text style={[styles.healthScoreText, { color: health.color, fontFamily: 'JetBrainsMono-Regular' }]}>
                {health.score}
              </Text>
              <Text style={[styles.healthLabel, { color: health.color, fontFamily: 'DMSans-Medium' }]}>
                {health.label}
              </Text>
            </View>
          </View>
          <ProgressBar progress={health.score / 100} showPercent={false} height={8} color={health.color} />
          {health.factors.map(f => (
            <View key={f.label} style={styles.factorRow}>
              <Text style={[styles.factorLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {f.label}
              </Text>
              <View style={styles.factorRight}>
                <ProgressBar
                  progress={f.score}
                  showPercent={false}
                  height={4}
                  color={f.score >= 0.7 ? colors.success : f.score >= 0.4 ? colors.warning : colors.danger}
                />
                <Text style={[styles.factorHint, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {f.hint}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Wallets */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
          Dompet Saya
        </Text>
        <Pressable
          onPress={handleAddWallet}
          style={[styles.addWalletBtn, { backgroundColor: colors.accentPrimary }]}
          accessibilityLabel="Tambah dompet baru"
        >
          <Plus size={14} color="#fff" />
        </Pressable>
      </View>

      {wallets.length === 0 ? (
        <EmptyState
          title="Belum ada dompet"
          subtitle="Buat dompet pertama untuk mulai mencatat keuangan."
          ctaLabel="Buat Dompet Dulu"
          onCta={handleAddWallet}
          icon={<Wallet size={48} color={colors.textMuted} />}
        />
      ) : (
        <View style={styles.walletList}>
          {wallets.map(wallet => (
            <Card
              key={wallet.id}
              style={[styles.walletCard, { borderLeftColor: wallet.color, borderLeftWidth: 4 }]}
              onPress={() => router.push(`/dompet/${wallet.id}`)}
            >
              <View style={styles.walletRow}>
                <View style={[styles.walletIcon, { backgroundColor: `${wallet.color}22` }]}>
                  <Wallet size={20} color={wallet.color} />
                </View>
                <View style={styles.walletInfo}>
                  <Text style={[styles.walletName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                    {wallet.name}
                  </Text>
                  <Text style={[styles.walletType, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                    {wallet.currency}
                  </Text>
                </View>
                <Text style={[styles.walletBalance, { color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}>
                  {balanceVisible ? formatCurrency(wallet.balance, wallet.currency) : '••••'}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Transaksi Terakhir
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/transaksi')}>
              <Text style={[styles.seeAll, { color: colors.accentPrimary, fontFamily: 'DMSans-Regular' }]}>
                Lihat semua
              </Text>
            </Pressable>
          </View>
          <View style={styles.walletList}>
            {recentTransactions.slice(0, 5).map(tx => (
              <Card
                key={tx.id}
                style={styles.txCard}
                onPress={() => router.push(`/transaksi/${tx.id}`)}
              >
                <View style={styles.txRow}>
                  <View style={[styles.txCatDot, { backgroundColor: `${tx.categoryColor}22` }]}>
                    <View style={[styles.txCatDotInner, { backgroundColor: tx.categoryColor }]} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]} numberOfLines={1}>
                      {tx.categoryName}
                    </Text>
                    {tx.note ? (
                      <Text style={[styles.txNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                        {tx.note}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.txAmt, {
                    color: ['income', 'debt_received'].includes(tx.type) ? colors.success : colors.danger,
                    fontFamily: 'JetBrainsMono-Regular',
                  }]}>
                    {['income', 'debt_received'].includes(tx.type) ? '+' : '-'}{tx.amountFormatted}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  padding: { padding: 16 },
  gap4: { marginTop: 4 },
  gap12: { marginTop: 12 },
  header: { gap: 8, paddingBottom: 4 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetingText: { flex: 1, gap: 2, paddingRight: 12 },
  greetingPrefix: { fontSize: 16, lineHeight: 24 },
  greetingSub: { fontSize: 12, lineHeight: 18 },
  eyeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  netWorthLabel: { fontSize: 10, lineHeight: 16, letterSpacing: 1 },
  netWorth: { fontSize: 42, lineHeight: 50 },
  miniSummaryRow: { flexDirection: 'row', gap: 10 },
  miniCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12 },
  miniLabel: { fontSize: 10, lineHeight: 14 },
  miniAmt: { fontSize: 14, lineHeight: 20, marginLeft: 'auto' },
  quickActions: { flexDirection: 'row', gap: 10 },
  qaBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 14 },
  qaLabel: { fontSize: 12, lineHeight: 16, color: '#fff' },
  healthCard: { padding: 16, borderRadius: 16, gap: 12 },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  healthTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  healthTitleText: { fontSize: 15, lineHeight: 22 },
  healthScore: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 2 },
  healthScoreText: { fontSize: 24, lineHeight: 30 },
  healthLabel: { fontSize: 11, lineHeight: 14 },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  factorLabel: { width: 100, fontSize: 12, lineHeight: 18 },
  factorRight: { flex: 1, gap: 2 },
  factorHint: { fontSize: 10, lineHeight: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 18, lineHeight: 26 },
  seeAll: { fontSize: 13, lineHeight: 18 },
  addWalletBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  walletList: { gap: 10 },
  walletCard: { padding: 14 },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  walletInfo: { flex: 1 },
  walletName: { fontSize: 15, lineHeight: 22 },
  walletType: { fontSize: 12, lineHeight: 16 },
  walletBalance: { fontSize: 15, lineHeight: 22 },
  txCard: { padding: 12 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  txCatDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txCatDotInner: { width: 10, height: 10, borderRadius: 5 },
  txInfo: { flex: 1 },
  txName: { fontSize: 14, lineHeight: 20 },
  txNote: { fontSize: 12, lineHeight: 16 },
  txAmt: { fontSize: 14, lineHeight: 20 },
});
