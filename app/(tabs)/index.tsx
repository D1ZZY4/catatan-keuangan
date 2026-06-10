import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppCard } from '../../src/shared/components/AppCard';
import { FAB } from '../../src/shared/components/FAB';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { TransactionTypeChip } from '../../src/shared/components/TransactionTypeChip';
import { OfflinePill } from '../../src/shared/components/OfflinePill';
import { ProgressBar } from '../../src/shared/components/ProgressBar';
import { GuidedHomeTour } from '../../src/shared/components/GuidedHomeTour';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { useTransactions } from '../../src/shared/hooks/useTransactions';
import { useWallets } from '../../src/shared/hooks/useWallets';
import { useCurrencyRates } from '../../src/shared/hooks/useCurrencyRates';
import { useBudgets } from '../../src/shared/hooks/useBudgets';
import { useReminders } from '../../src/shared/hooks/useReminders';
import { useCategories } from '../../src/shared/hooks/useCategories';
import { AppLabels } from '../../src/shared/config/labels';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from '../../src/shared/utils/formatters';
import { computeWalletBalance } from '../../src/shared/utils/finance';
import { computeHealthScore } from '../../src/shared/utils/healthScore';
import type { TransactionType } from '../../src/shared/types';
import type { Budget } from '../../src/shared/types';

export default function HomeScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { data: walletList, loading: _walletsLoading, reload: reloadWallets } = useWallets();
  const { data: txList, loading: txLoading, reload: reloadTx } = useTransactions('thisMonth');
  const { data: allTx } = useTransactions('all');
  const { isOffline, offlineDate, refresh: refreshRates } = useCurrencyRates();
  const { data: budgetList } = useBudgets();
  const { data: reminderList } = useReminders();
  const { data: categoryList } = useCategories();

  const [refreshing, setRefreshing] = useState(false);
  const [showHealthDetail, setShowHealthDetail] = useState(false);
  const [tourVisible, setTourVisible] = useState(!settings.tourCompleted);

  async function onRefresh(): Promise<void> {
    setRefreshing(true);
    await Promise.all([reloadWallets(), reloadTx(), refreshRates()]);
    setRefreshing(false);
  }

  const totalBalance = useMemo(() => {
    return walletList
      .filter((w) => !w.isArchived && w.includeInTotal)
      .reduce((sum, w) => {
        const balance = computeWalletBalance(w, allTx);
        return sum + balance;
      }, 0);
  }, [walletList, allTx]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const monthlyIncome = useMemo(
    () =>
      txList
        .filter((tx) =>
          ['income', 'debt_received', 'invest_sell', 'savings_withdraw'].includes(tx.type),
        )
        .reduce((s, tx) => s + tx.amount, 0),
    [txList],
  );

  const monthlyExpense = useMemo(
    () =>
      txList
        .filter((tx) =>
          ['expense', 'transfer_external', 'debt_given', 'invest_buy'].includes(tx.type),
        )
        .reduce((s, tx) => s + tx.amount, 0),
    [txList],
  );

  const recentTx = useMemo(() => txList.slice(0, 6), [txList]);

  const healthScore = useMemo(
    () => computeHealthScore(txList, budgetList, categoryList),
    [txList, budgetList, categoryList],
  );

  const activeReminders = useMemo(
    () => reminderList.filter((r) => r.isActive),
    [reminderList],
  );

  function handleFabSelect(type: TransactionType): void {
    router.push({
      pathname: '/(modals)/transaction-form',
      params: { type },
    });
  }

  function getGreeting(): string {
    const h = now.getHours();
    if (h < 5) return 'Selamat malam';
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
  }

  const healthColor =
    healthScore.total >= 80
      ? colors.success
      : healthScore.total >= 60
      ? colors.accentPrimary
      : healthScore.total >= 40
      ? colors.warning
      : colors.danger;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 100,
          paddingHorizontal: 16,
          gap: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.accentPrimary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <AppText variant="labelSmall" color={colors.textMuted}>
              {getGreeting()}, {settings.userName || 'Pengguna'} 👋
            </AppText>
            <AppText variant="headingLarge" color={colors.textPrimary}>
              {AppLabels.app.name}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => void updateSettings({ hideBalance: !settings.hideBalance })}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: colors.bgCard,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border,
              }}
              accessibilityLabel="Sembunyikan saldo"
            >
              <AppIcon
                name={settings.hideBalance ? 'eye-off' : 'eye'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/calculator')}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: colors.bgCard,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border,
              }}
              accessibilityLabel="Buka kalkulator"
            >
              <AppIcon name="calculator" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {isOffline && <OfflinePill visible={isOffline} offlineDate={offlineDate} />}

        {/* Net Worth Hero */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <AppCard style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
            <AppText variant="labelSmall" color={colors.textMuted}>
              Total Kekayaan Bersih
            </AppText>
            {settings.hideBalance ? (
              <AppText variant="displayLarge" color={colors.textPrimary}>
                ••••••
              </AppText>
            ) : (
              <AppText
                variant="displayLarge"
                color={colors.textPrimary}
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{ fontFamily: 'InstrumentSerif-Regular' }}
              >
                {formatCurrency(totalBalance, settings.baseCurrency)}
              </AppText>
            )}

            <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <AppText variant="labelSmall" color={colors.textMuted}>
                  Pemasukan
                </AppText>
                <AppText
                  variant="bodyMedium"
                  color={colors.success}
                  style={{ fontFamily: 'DMSans-SemiBold' }}
                >
                  +{formatCurrencyCompact(monthlyIncome, settings.baseCurrency)}
                </AppText>
              </View>
              <View
                style={{ width: 1, backgroundColor: colors.border, alignSelf: 'stretch' }}
              />
              <View style={{ alignItems: 'center', gap: 2 }}>
                <AppText variant="labelSmall" color={colors.textMuted}>
                  Pengeluaran
                </AppText>
                <AppText
                  variant="bodyMedium"
                  color={colors.danger}
                  style={{ fontFamily: 'DMSans-SemiBold' }}
                >
                  -{formatCurrencyCompact(monthlyExpense, settings.baseCurrency)}
                </AppText>
              </View>
            </View>
          </AppCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {([
              ['income', 'Pemasukan', 'trending-up', colors.success],
              ['expense', 'Pengeluaran', 'trending-down', colors.danger],
              ['transfer_internal', 'Transfer', 'repeat', colors.accentPrimary],
            ] as [TransactionType, string, string, string][]).map(([type, label, icon, color]) => (
              <TouchableOpacity
                key={type}
                onPress={() =>
                  router.push({ pathname: '/(modals)/transaction-form', params: { type } })
                }
                style={{
                  flex: 1,
                  backgroundColor: color + '22',
                  borderRadius: 14, padding: 14,
                  alignItems: 'center', gap: 6,
                  borderWidth: 1, borderColor: color + '33',
                }}
                accessibilityLabel={`Catat ${label}`}
              >
                <View
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: color + '33',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <AppIcon name={icon} size={18} color={color} />
                </View>
                <AppText variant="labelSmall" color={color} style={{ fontFamily: 'DMSans-Medium', textAlign: 'center' }}>
                  {label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Health Score */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <TouchableOpacity
            onPress={() => setShowHealthDetail((v) => !v)}
            activeOpacity={0.9}
          >
            <AppCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: healthColor + '22',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <AppText
                      variant="headingSmall"
                      color={healthColor}
                      style={{ fontFamily: 'DMSans-SemiBold' }}
                    >
                      {healthScore.total}
                    </AppText>
                  </View>
                  <View style={{ gap: 2 }}>
                    <AppText variant="bodyMedium" color={colors.textPrimary} style={{ fontFamily: 'DMSans-Medium' }}>
                      Skor Kesehatan Keuangan
                    </AppText>
                    <AppText variant="labelSmall" color={healthColor}>
                      {healthScore.label}
                    </AppText>
                  </View>
                </View>
                <AppIcon
                  name={showHealthDetail ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </View>

              {showHealthDetail && (
                <View style={{ gap: 10, marginTop: 12 }}>
                  {Object.entries(healthScore.components).map(([key, comp]) => (
                    <View key={key} style={{ gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <AppText variant="bodySmall" color={colors.textPrimary}>
                          {comp.label}
                        </AppText>
                        <AppText variant="bodySmall" color={colors.textMuted}>
                          {comp.detail}
                        </AppText>
                      </View>
                      <ProgressBar value={comp.score} max={30} height="sm" />
                    </View>
                  ))}
                </View>
              )}
            </AppCard>
          </TouchableOpacity>
        </Animated.View>

        {/* Wallet Cards */}
        {walletList.filter((w) => !w.isArchived && w.showInDashboard).length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <AppText variant="headingMedium" color={colors.textPrimary}>
                Dompet
              </AppText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/wallets')}>
                <AppText variant="labelSmall" color={colors.accentPrimary}>
                  Lihat semua
                </AppText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {walletList
                .filter((w) => !w.isArchived && w.showInDashboard)
                .slice(0, 5)
                .map((wallet) => {
                  const balance = computeWalletBalance(wallet, allTx);
                  return (
                    <TouchableOpacity
                      key={wallet.id}
                      onPress={() => router.push('/(tabs)/wallets')}
                      style={{
                        width: 140,
                        backgroundColor: colors.bgCard,
                        borderRadius: 14, padding: 14, gap: 8,
                        borderWidth: 1, borderColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 36, height: 36, borderRadius: 18,
                          backgroundColor: wallet.color + '22',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <AppIcon name={wallet.icon} size={18} color={wallet.color} />
                      </View>
                      <AppText variant="labelSmall" color={colors.textMuted} numberOfLines={1}>
                        {wallet.name}
                      </AppText>
                      <AppText
                        variant="bodyMedium"
                        color={colors.textPrimary}
                        style={{ fontFamily: 'DMSans-SemiBold' }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {settings.hideBalance ? '••••' : formatCurrencyCompact(balance, wallet.currency)}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              <TouchableOpacity
                onPress={() => router.push('/(modals)/wallet-form')}
                style={{
                  width: 140,
                  backgroundColor: colors.bgCard,
                  borderRadius: 14, padding: 14, gap: 8,
                  borderWidth: 1.5, borderColor: colors.border,
                  borderStyle: 'dashed',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <AppIcon name="plus" size={22} color={colors.textMuted} />
                <AppText variant="labelSmall" color={colors.textMuted}>
                  Tambah Dompet
                </AppText>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        )}

        {/* Budget Row */}
        {budgetList.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(350)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <AppText variant="headingMedium" color={colors.textPrimary}>
                Anggaran Bulan Ini
              </AppText>
              <TouchableOpacity onPress={() => router.push('/(modals)/budget-form')}>
                <AppText variant="labelSmall" color={colors.accentPrimary}>
                  Kelola
                </AppText>
              </TouchableOpacity>
            </View>
            <AppCard style={{ gap: 12 }}>
              {budgetList.slice(0, 3).map((budget: Budget) => {
                const cat = categoryList.find((c) => c.id === budget.categoryId);
                const spent = txList
                  .filter(
                    (tx) =>
                      tx.categoryId === budget.categoryId &&
                      ['expense', 'transfer_external'].includes(tx.type),
                  )
                  .reduce((s, tx) => s + tx.amount, 0);
                const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                return (
                  <View key={budget.id} style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {cat && (
                          <AppIcon name={cat.icon} size={14} color={cat.color} />
                        )}
                        <AppText variant="bodySmall" color={colors.textPrimary}>
                          {cat?.name ?? 'Kategori'}
                        </AppText>
                      </View>
                      <AppText variant="labelSmall" color={colors.textMuted}>
                        {formatCurrencyCompact(spent, settings.baseCurrency)} / {formatCurrencyCompact(budget.amount, settings.baseCurrency)}
                      </AppText>
                    </View>
                    <ProgressBar value={spent} max={budget.amount} height="sm" />
                  </View>
                );
              })}
            </AppCard>
          </Animated.View>
        )}

        {/* Reminders Row */}
        {activeReminders.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(380)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <AppText variant="headingMedium" color={colors.textPrimary}>
                Pengingat Tagihan
              </AppText>
              <TouchableOpacity onPress={() => router.push('/(modals)/reminder-form')}>
                <AppText variant="labelSmall" color={colors.accentPrimary}>
                  Kelola
                </AppText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {activeReminders.slice(0, 5).map((reminder) => {
                const dayLabel =
                  reminder.period === 'monthly'
                    ? `Tgl ${reminder.dueDay}`
                    : ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', "Jum", 'Sab'][reminder.dueDay] ?? `Hari ${reminder.dueDay}`;
                return (
                  <View
                    key={reminder.id}
                    style={{
                      backgroundColor: colors.bgCard,
                      borderRadius: 14, padding: 14, gap: 6,
                      borderWidth: 1, borderColor: colors.border,
                      minWidth: 130,
                    }}
                  >
                    <AppIcon name="bell" size={16} color={colors.warning} />
                    <AppText variant="bodySmall" color={colors.textPrimary} numberOfLines={1} style={{ fontFamily: 'DMSans-Medium' }}>
                      {reminder.name}
                    </AppText>
                    <AppText variant="labelSmall" color={colors.textMuted}>
                      {dayLabel}
                    </AppText>
                    {reminder.amount != null && reminder.amount > 0 && (
                      <AppText variant="labelSmall" color={colors.accentPrimary}>
                        {formatCurrencyCompact(reminder.amount, reminder.currency)}
                      </AppText>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* Recent Transactions */}
        <Animated.View entering={FadeInDown.duration(400).delay(420)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <AppText variant="headingMedium" color={colors.textPrimary}>
              Transaksi Terbaru
            </AppText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <AppText variant="labelSmall" color={colors.accentPrimary}>
                Lihat semua
              </AppText>
            </TouchableOpacity>
          </View>

          {txLoading ? (
            <AppText variant="bodyMedium" color={colors.textMuted} center>
              Memuat...
            </AppText>
          ) : recentTx.length === 0 ? (
            <EmptyState
              icon="receipt"
              title={AppLabels.emptyState.transactions.title}
              body={AppLabels.emptyState.transactions.body}
            />
          ) : (
            <AppCard style={{ gap: 0 }}>
              {recentTx.map((tx, i) => (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(modals)/transaction-detail',
                      params: {
                        id: tx.id,
                        type: tx.type,
                        amount: tx.amount.toString(),
                        currency: tx.currency,
                        note: tx.note ?? '',
                        date: tx.date.toString(),
                        walletId: tx.walletId,
                        categoryId: tx.categoryId,
                      },
                    })
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 4,
                    borderBottomWidth: i < recentTx.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    gap: 12,
                  }}
                >
                  <TransactionTypeChip type={tx.type} size="sm" showLabel={false} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyMedium" color={colors.textPrimary} numberOfLines={1}>
                      {tx.note ?? '—'}
                    </AppText>
                    <AppText variant="labelSmall" color={colors.textMuted}>
                      {formatDate(tx.date)}
                    </AppText>
                  </View>
                  <AppText
                    variant="bodyMedium"
                    color={
                      ['income', 'debt_received', 'savings_withdraw', 'invest_sell'].includes(tx.type)
                        ? colors.success
                        : ['expense', 'transfer_external', 'debt_given', 'invest_buy'].includes(tx.type)
                        ? colors.danger
                        : colors.textMuted
                    }
                    style={{ fontFamily: 'DMSans-SemiBold' }}
                  >
                    {['income', 'debt_received', 'savings_withdraw', 'invest_sell'].includes(tx.type) ? '+' : '-'}
                    {formatCurrencyCompact(tx.amount, tx.currency)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </AppCard>
          )}
        </Animated.View>
      </ScrollView>

      <FAB onSelect={handleFabSelect} />

      {tourVisible && (
        <GuidedHomeTour
          onComplete={() => {
            setTourVisible(false);
            void updateSettings({ tourCompleted: true });
          }}
        />
      )}
    </View>
  );
}
