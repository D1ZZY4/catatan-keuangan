import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { useTransactions } from '../../src/shared/hooks/useTransactions';
import { useWallets } from '../../src/shared/hooks/useWallets';
import { useCurrencyRates } from '../../src/shared/hooks/useCurrencyRates';
import { AppLabels } from '../../src/shared/config/labels';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from '../../src/shared/utils/formatters';
import { computeWalletBalance } from '../../src/shared/utils/finance';

export default function HomeScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { data: walletList, loading: walletsLoading, reload: reloadWallets } = useWallets();
  const { data: txList, loading: txLoading, reload: reloadTx } = useTransactions('thisMonth');
  const { isOffline, offlineDate, refresh: refreshRates } = useCurrencyRates();

  const [refreshing, setRefreshing] = React.useState(false);

  async function onRefresh(): Promise<void> {
    setRefreshing(true);
    await Promise.all([reloadWallets(), reloadTx(), refreshRates()]);
    setRefreshing(false);
  }

  const totalBalance = useMemo(() => {
    return walletList
      .filter((w) => !w.isArchived && w.includeInTotal)
      .reduce((sum, w) => {
        const balance = computeWalletBalance(w, txList);
        return sum + balance;
      }, 0);
  }, [walletList, txList]);

  const recentTx = useMemo(() => txList.slice(0, 10), [txList]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <AppText variant="labelSmall" color={colors.textMuted}>
              Halo, {settings.userName || 'Pengguna'} 👋
            </AppText>
            <AppText variant="headingLarge" color={colors.textPrimary}>
              {AppLabels.app.tagline}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/backup')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.bgCard,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <AppIcon name="settings" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {isOffline && (
          <OfflinePill visible={isOffline} offlineDate={offlineDate} />
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <AppCard
            style={{
              alignItems: 'center',
              paddingVertical: 24,
              gap: 6,
            }}
          >
            <AppText variant="labelSmall" color={colors.textMuted}>
              Total Saldo
            </AppText>
            {settings.hideBalance ? (
              <AppText variant="displayMedium" color={colors.textPrimary}>
                ••••••
              </AppText>
            ) : (
              <AppText
                variant="displayLarge"
                color={colors.textPrimary}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {formatCurrency(totalBalance, settings.baseCurrency)}
              </AppText>
            )}
            <AppText variant="labelSmall" color={colors.textMuted}>
              Bulan ini
            </AppText>
          </AppCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(modals)/transaction-form',
                  params: { type: 'income' },
                })
              }
              style={{
                flex: 1,
                backgroundColor: colors.success + '22',
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: colors.success + '33',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.success + '33',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="plus" size={20} color={colors.success} />
              </View>
              <AppText variant="bodyMedium" color={colors.success} style={{ fontFamily: 'DMSans-Medium' }}>
                {AppLabels.transactionType.income}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(modals)/transaction-form',
                  params: { type: 'expense' },
                })
              }
              style={{
                flex: 1,
                backgroundColor: colors.danger + '22',
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: colors.danger + '33',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.danger + '33',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="minus" size={20} color={colors.danger} />
              </View>
              <AppText variant="bodyMedium" color={colors.danger} style={{ fontFamily: 'DMSans-Medium' }}>
                {AppLabels.transactionType.expense}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(modals)/transaction-form',
                  params: { type: 'transfer_internal' },
                })
              }
              style={{
                flex: 1,
                backgroundColor: colors.accentPrimary + '22',
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: colors.accentPrimary + '33',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accentPrimary + '33',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="repeat" size={20} color={colors.accentPrimary} />
              </View>
              <AppText variant="bodyMedium" color={colors.accentPrimary} style={{ fontFamily: 'DMSans-Medium' }}>
                Transfer
              </AppText>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {walletList
                .filter((w) => !w.isArchived && w.showInDashboard)
                .slice(0, 5)
                .map((wallet) => {
                  const balance = computeWalletBalance(wallet, txList);
                  return (
                    <TouchableOpacity
                      key={wallet.id}
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/wallets',
                          params: { highlight: wallet.id },
                        })
                      }
                      style={{
                        width: 140,
                        backgroundColor: colors.bgCard,
                        borderRadius: 14,
                        padding: 14,
                        gap: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: wallet.color + '22',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AppIcon name={wallet.icon} size={18} color={wallet.color} />
                      </View>
                      <AppText variant="labelSmall" color={colors.textMuted} numberOfLines={1}>
                        {wallet.name}
                      </AppText>
                      <AppText variant="bodyMedium" color={colors.textPrimary} style={{ fontFamily: 'DMSans-SemiBold' }} numberOfLines={1} adjustsFontSizeToFit>
                        {formatCurrencyCompact(balance, wallet.currency)}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
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
            <AppText variant="bodyMedium" color={colors.textMuted} center>Memuat...</AppText>
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
                      {tx.note ?? tx.categoryId ?? '—'}
                    </AppText>
                    <AppText variant="labelSmall" color={colors.textMuted}>
                      {formatDate(tx.date)}
                    </AppText>
                  </View>
                  <AppText
                    variant="bodyMedium"
                    color={
                      tx.type === 'income' ? colors.success
                      : tx.type === 'expense' ? colors.danger
                      : colors.textMuted
                    }
                    style={{ fontFamily: 'DMSans-SemiBold' }}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatCurrencyCompact(tx.amount, tx.currency)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </AppCard>
          )}
        </Animated.View>
      </ScrollView>

      <FAB
        onSelect={(type) =>
          router.push({
            pathname: '/(modals)/transaction-form',
            params: { type },
          })
        }
      />
    </View>
  );
}
