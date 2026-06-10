import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, type DimensionValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { GuidedHomeTour, type TourStep } from '@/shared/components/GuidedHomeTour';
import { WalletCard } from '@/shared/components/WalletCard';
import { useRouter } from 'expo-router';
import { useHomeData } from '@/features/home/useHomeData';
import { useBudgets } from '@/features/budgets/useBudgets';
import { useReminders } from '@/features/reminders/useReminders';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { formatCurrency } from '@/shared/utils/formatters';
import { SecureStorage } from '@/shared/utils/secureStorage';
import {
  TrendingUp, TrendingDown, Plus, ScanLine, ArrowLeftRight,
  Activity, ChevronDown, ChevronUp, Wallet, ChevronRight, ArrowUpDown,
  Bell, Layers, Eye, EyeOff,
} from 'lucide-react-native';

const TOUR_STEPS: TourStep[] = [
  { bubble: { title: 'Selamat Datang! 🎉', body: 'Ini adalah Beranda — pusat informasi keuangan harian kamu.', position: 'bottom' }, autoAdvanceMs: 6000 },
  { bubble: { title: 'Aksi Cepat', body: 'Gunakan tombol di bawah untuk catat transaksi, transfer, atau scan struk.', position: 'bottom' }, pulse: true, autoAdvanceMs: 6000 },
  { bubble: { title: 'Skor Kesehatan Keuangan', body: 'Pantau kesehatan keuangan secara real-time dari rasio tabungan, dana darurat, dan arus kas.', position: 'center' }, autoAdvanceMs: 6000 },
  { bubble: { title: 'Dompet & Transaksi', body: 'Geser kartu dompet di bawah. Transaksi terbaru juga ditampilkan di sini.', position: 'center' }, autoAdvanceMs: 5000 },
];

const MORNING_GREETS = ['Selamat pagi', 'Pagi yang cerah', 'Hai, selamat pagi', 'Semangat pagi'];
const AFTERNOON_GREETS = ['Selamat siang', 'Hai, selamat siang', 'Siang yang produktif', 'Halo'];
const EVENING_GREETS = ['Selamat sore', 'Sore yang menyenangkan', 'Hai, selamat sore', 'Sore hari'];
const NIGHT_GREETS = ['Selamat malam', 'Malam yang tenang', 'Hai, selamat malam', 'Istirahat yang baik'];
const MORNING_SUBS = ['Yuk mulai hari dengan mencatat keuangan.', 'Semoga harimu produktif!', 'Pagi ini, pantau saldo dompetmu.', 'Hari baru, semangat baru!'];
const AFTERNOON_SUBS = ['Sudah catat pengeluaran pagi ini?', 'Jangan lupa catat transaksi siang ini.', 'Pantau keuanganmu setiap hari.', 'Satu catatan kecil, manfaat besar.'];
const EVENING_SUBS = ['Waktunya rekap pengeluaran hari ini.', 'Cek anggaran sebelum belanja sore.', 'Berapa yang sudah dikeluarkan hari ini?', 'Sebentar lagi malam, rekap harimu.'];
const NIGHT_SUBS = ['Sudah catat semua transaksi hari ini?', 'Rekap keuangan harian sebelum istirahat.', 'Pastikan semua pengeluaran sudah tercatat.', 'Tutup hari dengan catatan yang lengkap.'];

function pickRandom<T>(arr: T[], seed: number): T { return arr[Math.abs(seed) % arr.length] as T; }

function getSmartGreeting(now: Date): { prefix: string; sub: string } {
  const hour = now.getHours(); const day = now.getDay(); const date = now.getDate();
  const seed = Math.floor(Date.now() / (1000 * 60 * 20));
  let prefixPool: string[], subPool: string[];
  if (hour >= 4 && hour < 11) { prefixPool = MORNING_GREETS; subPool = MORNING_SUBS; }
  else if (hour >= 11 && hour < 15) { prefixPool = AFTERNOON_GREETS; subPool = AFTERNOON_SUBS; }
  else if (hour >= 15 && hour < 19) { prefixPool = EVENING_GREETS; subPool = EVENING_SUBS; }
  else { prefixPool = NIGHT_GREETS; subPool = NIGHT_SUBS; }
  const prefix = pickRandom(prefixPool, seed);
  let contextSubs: string[] = [];
  if (date === 1) contextSubs = ['Selamat datang di bulan baru! Waktunya merencanakan anggaran.', 'Awal bulan, saatnya atur keuangan dengan bijak.'];
  else if (date >= 25) contextSubs = ['Hampir akhir bulan, pantau sisa anggaranmu.', 'Beberapa hari lagi akhir bulan, cek pengeluaranmu.'];
  else if (day === 1) contextSubs = ['Semangat memulai pekan baru!', 'Awal pekan yang tepat untuk mencatat keuangan.'];
  else if (day === 0 || day === 6) contextSubs = ['Selamat menikmati akhir pekan!', 'Hari yang tepat untuk evaluasi keuangan mingguan.'];
  const sub = pickRandom([...contextSubs, ...subPool], seed + date);
  return { prefix, sub };
}

function calcHealthScore(totalBalance: number, monthlyIncome: number, monthlyExpense: number) {
  let total = 0;
  const factors: Array<{ label: string; score: number; hint: string }> = [];
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
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets, totalBalance, monthIncome, monthExpense, recentTransactions, loading, reload } = useHomeData();
  const { budgets } = useBudgets();
  const { reminders } = useReminders();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [healthExpanded, setHealthExpanded] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    SecureStorage.getItemAsync('tour_done').then(v => { if (!v) setShowTour(true); }).catch(() => undefined);
  }, []);

  const handleTourDone = useCallback(async () => {
    setShowTour(false);
    await SecureStorage.setItemAsync('tour_done', 'true');
  }, []);

  const now = useMemo(() => new Date(), []);
  const { prefix, sub } = useMemo(() => getSmartGreeting(now), [now]);
  const health = useMemo(() => calcHealthScore(totalBalance, monthIncome, monthExpense), [totalBalance, monthIncome, monthExpense]);
  const handleRefresh = useCallback(async () => { setRefreshing(true); await reload(); setRefreshing(false); }, [reload]);
  const handleAddWallet = useCallback(() => { router.push('/(modals)/form-dompet'); }, [router]);
  const activeWallets = wallets.filter(w => w.showInDashboard !== false);

  const heroColor = health.score >= 80 ? colors.success : health.score >= 60 ? colors.accentPrimary : health.score >= 40 ? colors.warning : colors.danger;
  const heroBg = `${heroColor}15`;

  const quickActions = [
    { icon: <TrendingDown size={19} color={colors.danger} />, label: 'Pengeluaran', onPress: () => router.push('/(modals)/form-transaksi?type=expense'), bg: `${colors.danger}18` },
    { icon: <TrendingUp size={19} color={colors.success} />, label: 'Pemasukan', onPress: () => router.push('/(modals)/form-transaksi?type=income'), bg: `${colors.success}18` },
    { icon: <ArrowLeftRight size={19} color={colors.accentPrimary} />, label: 'Transfer', onPress: () => router.push({ pathname: '/(modals)/form-transaksi', params: { type: 'transfer_internal' } }), bg: `${colors.accentPrimary}18` },
    { icon: <ScanLine size={19} color={colors.accentWarm} />, label: 'Scan Struk', onPress: () => router.push('/(modals)/scanner'), bg: `${colors.accentWarm}18` },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
        <View style={{ padding: 16, gap: 12 }}>
          <SkeletonCard height={32} width="60%" />
          <SkeletonCard height={20} width="40%" />
          <SkeletonCard height={120} />
          <SkeletonCard height={80} />
        </View>
      </View>
    );
  }

  return (
    <>
      {showTour && (
        <GuidedHomeTour steps={TOUR_STEPS} onComplete={() => void handleTourDone()} onSkip={() => void handleTourDone()} />
      )}
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgPage }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor={colors.accentPrimary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── NetWorth Hero ── */}
        <View style={[styles.hero, { backgroundColor: colors.bgCard, paddingTop: insets.top + 20 }]}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1, paddingRight: 12, gap: 2 }}>
              <Text style={[styles.greetingName, { color: colors.textPrimary, fontFamily: 'DMSans-Bold' }]}>
                {prefix} 👋
              </Text>
              <Text style={[styles.greetingSub, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>{sub}</Text>
            </View>
            <Pressable
              onPress={() => setBalanceVisible(v => !v)}
              style={[styles.visibilityBtn, { backgroundColor: `${colors.bgSurface}CC`, borderColor: 'rgba(0,0,0,0.06)' }]}
              accessibilityLabel={balanceVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
            >
              {balanceVisible
                ? <EyeOff size={16} color={colors.textMuted} strokeWidth={1.8} />
                : <Eye size={16} color={colors.textMuted} strokeWidth={1.8} />
              }
            </Pressable>
          </View>

          <Text style={[styles.netWorthLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>SALDO BERSIH</Text>
          <Text style={[styles.netWorth, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
            {balanceVisible ? formatCurrency(totalBalance, 'IDR') : 'Rp ••••••'}
          </Text>

          <View style={styles.miniRow}>
            <View style={[styles.miniCard, { backgroundColor: `${colors.bgSurface}99`, borderColor: `${colors.success}25`, borderWidth: 1 }]}>
              <View style={styles.miniTop}>
                <TrendingUp size={11} color={colors.success} />
                <Text style={[styles.miniLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>MASUK</Text>
              </View>
              <Text style={[styles.miniAmt, { color: colors.success, fontFamily: 'InstrumentSerif-Regular' }]}>
                {balanceVisible ? formatCurrency(monthIncome, 'IDR') : '••••'}
              </Text>
            </View>
            <View style={[styles.miniCard, { backgroundColor: `${colors.bgSurface}99`, borderColor: `${colors.danger}25`, borderWidth: 1 }]}>
              <View style={styles.miniTop}>
                <TrendingDown size={11} color={colors.danger} />
                <Text style={[styles.miniLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>KELUAR</Text>
              </View>
              <Text style={[styles.miniAmt, { color: colors.danger, fontFamily: 'InstrumentSerif-Regular' }]}>
                {balanceVisible ? formatCurrency(monthExpense, 'IDR') : '••••'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* ── Quick Actions Grid ── */}
          <View style={styles.qaGrid}>
            {quickActions.map(qa => (
              <Pressable
                key={qa.label}
                onPress={qa.onPress}
                style={({ pressed }) => [
                  styles.qaCard,
                  { backgroundColor: colors.bgCard },
                  shadows.sm,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <View style={[styles.qaIconWrap, { backgroundColor: qa.bg }]}>{qa.icon}</View>
                <Text style={[styles.qaLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
                  {qa.label.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Health Score Widget ── */}
          <Pressable
            onPress={() => setHealthExpanded(v => !v)}
            style={[styles.healthCard, { backgroundColor: heroBg }, shadows.sm]}
          >
            <View style={[styles.healthIconWrap, { backgroundColor: heroBg }]}>
              <Activity size={18} color={heroColor} />
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={[styles.healthTitle, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>Skor Kesehatan</Text>
              <View style={styles.healthScoreRow}>
                <Text style={[styles.healthScore, { color: heroColor, fontFamily: 'InstrumentSerif-Regular' }]}>{health.score}</Text>
                <Text style={[styles.healthOf, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>/100</Text>
                <View style={[styles.healthBadge, { backgroundColor: `${heroColor}20` }]}>
                  <Text style={[styles.healthBadgeText, { color: heroColor, fontFamily: 'DMSans-SemiBold' }]}>{health.label}</Text>
                </View>
              </View>
              <View style={[styles.healthTrack, { backgroundColor: `${colors.bgPage}80` }]}>
                <View style={[styles.healthFill, { width: `${health.score}%` as DimensionValue, backgroundColor: heroColor }]} />
              </View>
            </View>
            {healthExpanded ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
          </Pressable>

          {healthExpanded && (
            <View style={[styles.healthExpand, { backgroundColor: colors.bgCard }, shadows.sm]}>
              {health.factors.map(f => (
                <View key={f.label} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[styles.factorLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>{f.label}</Text>
                    <Text style={[styles.factorHint, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>{f.hint}</Text>
                  </View>
                  <View style={[styles.healthTrack, { backgroundColor: `${colors.bgPage}80` }]}>
                    <View style={[styles.healthFill, {
                      width: `${f.score * 100}%` as DimensionValue,
                      backgroundColor: f.score >= 0.7 ? colors.success : f.score >= 0.4 ? colors.warning : colors.danger,
                    }]} />
                  </View>
                </View>
              ))}
              <Text style={[styles.healthNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Skor dihitung dari rasio tabungan, dana darurat, dan arus kas bulan ini.
              </Text>
            </View>
          )}

          {/* ── Wallets Horizontal Scroll ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Wallet size={14} color={colors.textMuted} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Dompet Saya</Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/dompet')} style={styles.seeAllRow}>
                <Text style={[styles.seeAll, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Lihat semua</Text>
                <ChevronRight size={13} color={colors.textMuted} />
              </Pressable>
            </View>

            {activeWallets.length === 0 ? (
              <Pressable
                onPress={handleAddWallet}
                style={[styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.bgSurface }]}
              >
                <View style={[styles.emptyIcon, { backgroundColor: colors.bgSurface }]}>
                  <Plus size={18} color={colors.textMuted} />
                </View>
                <View>
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Tambah Dompet Pertama</Text>
                  <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Tunai, rekening, dompet digital</Text>
                </View>
              </Pressable>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
                {activeWallets.slice(0, 6).map(wallet => (
                  <View key={wallet.id} style={{ width: 160 }}>
                    <WalletCard wallet={wallet} onPress={() => router.push(`/dompet/${wallet.id}`)} />
                  </View>
                ))}
                <Pressable
                  onPress={handleAddWallet}
                  style={[styles.addCard, { backgroundColor: colors.bgCard, borderColor: colors.bgSurface }]}
                >
                  <Plus size={16} color={colors.textMuted} />
                  <Text style={[styles.addLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>Tambah</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>

          {/* ── Budget Row ── */}
          {budgets.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Layers size={14} color={colors.textMuted} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Anggaran Bulan Ini</Text>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/pengaturan')} style={styles.seeAllRow}>
                  <Text style={[styles.seeAll, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Kelola</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                {budgets.map(b => {
                  const isOver = b.progress >= 1;
                  const isNear = b.progress > 0.8;
                  const cardBg = isOver ? `${colors.danger}12` : isNear ? `${colors.warning}12` : colors.bgCard;
                  const borderColor = isOver ? `${colors.danger}30` : isNear ? `${colors.warning}30` : 'transparent';
                  return (
                    <View key={b.id} style={[styles.budgetCard, { backgroundColor: cardBg, borderColor }]}>
                      <View style={styles.budgetHeader}>
                        <View style={[styles.budgetIcon, { backgroundColor: `${b.categoryColor}22` }]}>
                          <Text style={{ fontSize: 13 }}>💰</Text>
                        </View>
                        <Text style={[styles.budgetName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]} numberOfLines={1}>
                          {b.categoryName}
                        </Text>
                      </View>
                      <ProgressBar progress={b.progress} height={6} color={isOver ? colors.danger : isNear ? colors.warning : colors.accentPrimary} />
                      <View style={styles.budgetFooter}>
                        <Text style={[styles.budgetAmt, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>{formatCurrency(b.spent, b.currency)}</Text>
                        <Text style={[styles.budgetAmt, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>{formatCurrency(b.amount, b.currency)}</Text>
                      </View>
                    </View>
                  );
                })}
                <Pressable
                  onPress={() => router.push('/(tabs)/pengaturan')}
                  style={[styles.budgetAdd, { backgroundColor: colors.bgCard, borderColor: colors.bgSurface }]}
                >
                  <Plus size={14} color={colors.textMuted} />
                  <Text style={[styles.addLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>Baru</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}

          {/* ── Reminders Row ── */}
          {reminders.filter(r => r.isActive).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Bell size={14} color={colors.warning} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Pengingat Tagihan</Text>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/pengaturan')} style={styles.seeAllRow}>
                  <Text style={[styles.seeAll, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Lihat semua</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                {reminders.filter(r => r.isActive).slice(0, 5).map(r => {
                  const today = new Date();
                  let dueDate: Date;
                  if (r.period === 'bulanan') {
                    dueDate = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
                    if (dueDate.getTime() < Date.now()) dueDate = new Date(today.getFullYear(), today.getMonth() + 1, r.dueDay);
                  } else {
                    const diff = (r.dueDay - today.getDay() + 7) % 7;
                    dueDate = new Date(today);
                    dueDate.setDate(today.getDate() + diff);
                  }
                  const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);
                  const isUrgent = daysLeft <= 3;
                  return (
                    <View key={r.id} style={[styles.reminderCard, {
                      backgroundColor: isUrgent ? `${colors.warning}14` : colors.bgCard,
                      borderColor: isUrgent ? `${colors.warning}35` : 'transparent',
                    }]}>
                      <View style={[styles.reminderBadge, {
                        backgroundColor: isUrgent ? `${colors.warning}25` : `${colors.bgSurface}CC`,
                      }]}>
                        <Text style={[styles.reminderBadgeText, { color: isUrgent ? colors.warning : colors.textMuted, fontFamily: 'DMSans-Bold' }]}>
                          {daysLeft === 0 ? 'Hari ini!' : daysLeft === 1 ? 'Besok' : `${daysLeft}h lagi`}
                        </Text>
                      </View>
                      <Text style={[styles.reminderName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]} numberOfLines={1}>
                        {r.name}
                      </Text>
                      {r.amount !== undefined && (
                        <Text style={[styles.reminderAmt, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
                          {formatCurrency(r.amount, r.currency)}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── Recent Transactions ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Transaksi Terbaru</Text>
              <Pressable onPress={() => router.push('/(tabs)/transaksi')} style={styles.seeAllRow}>
                <Text style={[styles.seeAll, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Lihat semua</Text>
                <ChevronRight size={13} color={colors.textMuted} />
              </Pressable>
            </View>

            {recentTransactions.length === 0 ? (
              <Pressable
                onPress={() => router.push('/(modals)/form-transaksi')}
                style={[styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.bgSurface }]}
              >
                <View style={[styles.emptyIcon, { backgroundColor: colors.bgSurface }]}>
                  <ArrowUpDown size={18} color={colors.textMuted} />
                </View>
                <View>
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>Catat Transaksi Pertama</Text>
                  <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Tap untuk mulai mencatat pengeluaran</Text>
                </View>
              </Pressable>
            ) : (
              <View style={[styles.txContainer, { backgroundColor: colors.bgCard }, shadows.sm]}>
                {recentTransactions.slice(0, 6).map((tx, idx) => {
                  const isIncome = ['income', 'debt_received', 'invest_sell'].includes(tx.type);
                  const isTransfer = tx.type.includes('transfer');
                  const amtColor = isIncome ? colors.success : isTransfer ? colors.accentPrimary : colors.danger;
                  const amtPrefix = isIncome ? '+' : isTransfer ? '' : '-';
                  return (
                    <Pressable
                      key={tx.id}
                      onPress={() => router.push(`/transaksi/${tx.id}`)}
                      style={({ pressed }) => [
                        styles.txItem,
                        idx < Math.min(recentTransactions.length, 6) - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.bgPage },
                        pressed && { backgroundColor: `${colors.bgSurface}60` },
                      ]}
                    >
                      <View style={[styles.txIcon, { backgroundColor: `${amtColor}18` }]}>
                        {isIncome
                          ? <TrendingUp size={16} color={amtColor} />
                          : isTransfer
                            ? <ArrowLeftRight size={16} color={amtColor} />
                            : <TrendingDown size={16} color={amtColor} />
                        }
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.txName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]} numberOfLines={1}>
                          {tx.categoryName}
                        </Text>
                        {tx.note ? (
                          <Text style={[styles.txNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>{tx.note}</Text>
                        ) : null}
                      </View>
                      <Text style={[styles.txAmt, { color: amtColor, fontFamily: 'JetBrainsMono-Regular' }]}>
                        {amtPrefix}{tx.amountFormatted}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: 16, paddingBottom: 24 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greetingName: { fontSize: 15, lineHeight: 22 },
  greetingSub: { fontSize: 11, lineHeight: 16 },
  visibilityBtn: { width: 32, height: 32, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  netWorthLabel: { fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  netWorth: { fontSize: 38, lineHeight: 46, marginBottom: 16 },
  miniRow: { flexDirection: 'row', gap: 12 },
  miniCard: { flex: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  miniTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniLabel: { fontSize: 9, letterSpacing: 0.5 },
  miniAmt: { fontSize: 15, lineHeight: 20 },
  body: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  qaGrid: { flexDirection: 'row', gap: 8 },
  qaCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 20, gap: 8 },
  qaIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 8, letterSpacing: 0.4, textAlign: 'center' },
  healthCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20 },
  healthIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  healthTitle: { fontSize: 12 },
  healthScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  healthScore: { fontSize: 22, lineHeight: 28 },
  healthOf: { fontSize: 12 },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  healthBadgeText: { fontSize: 10 },
  healthTrack: { height: 6, borderRadius: 99, overflow: 'hidden' },
  healthFill: { height: '100%', borderRadius: 99 },
  healthExpand: { borderRadius: 20, padding: 16, gap: 12 },
  factorLabel: { fontSize: 12 },
  factorHint: { fontSize: 10 },
  healthNote: { fontSize: 11, lineHeight: 16, paddingTop: 4 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 14 },
  seeAllRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontSize: 12 },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 2, borderStyle: 'dashed' },
  emptyIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 14 },
  emptySub: { fontSize: 11, marginTop: 2 },
  addCard: { width: 90, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addLabel: { fontSize: 10 },
  txContainer: { borderRadius: 20, overflow: 'hidden' },
  txItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  txIcon: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  txName: { fontSize: 14 },
  txNote: { fontSize: 11, marginTop: 1 },
  txAmt: { fontSize: 14 },
  budgetCard: { width: 175, borderRadius: 20, padding: 14, borderWidth: 1, gap: 8 },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  budgetIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  budgetName: { fontSize: 12, flex: 1 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetAmt: { fontSize: 10 },
  budgetAdd: { width: 110, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  reminderCard: { width: 160, borderRadius: 20, padding: 14, borderWidth: 1, gap: 6 },
  reminderBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, marginBottom: 2 },
  reminderBadgeText: { fontSize: 10 },
  reminderName: { fontSize: 12 },
  reminderAmt: { fontSize: 14 },
});
