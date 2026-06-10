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
import { AppCard } from '../../src/shared/components/AppCard';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { AppButton } from '../../src/shared/components/AppButton';
import { SparklineChart } from '../../src/shared/components/SparklineChart';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useWallets } from '../../src/shared/hooks/useWallets';
import { useTransactions } from '../../src/shared/hooks/useTransactions';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { AppLabels } from '../../src/shared/config/labels';
import {
  formatCurrency,
  formatCurrencyCompact,
} from '../../src/shared/utils/formatters';
import { computeWalletBalance, computeSparkline } from '../../src/shared/utils/finance';

export default function WalletsScreen(): React.ReactElement {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { data: walletList, loading, reload } = useWallets();
  const { data: txList } = useTransactions('all');
  const [refreshing, setRefreshing] = React.useState(false);

  async function onRefresh(): Promise<void> {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  const totalBalance = useMemo(() => {
    return walletList
      .filter((w) => !w.isArchived && w.includeInTotal)
      .reduce((sum, w) => sum + computeWalletBalance(w, txList), 0);
  }, [walletList, txList]);

  const activeWallets = walletList.filter((w) => !w.isArchived);
  const archivedWallets = walletList.filter((w) => w.isArchived);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 80,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.accentPrimary}
          />
        }
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <AppText variant="headingLarge" color={colors.textPrimary}>
            {AppLabels.tabs.wallet}
          </AppText>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/wallet-form')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: colors.accentPrimary,
            }}
          >
            <AppIcon name="plus" size={16} color="#1A1814" />
            <AppText variant="labelSmall" color="#1A1814">
              Tambah
            </AppText>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.duration(400)}>
          <AppCard
            elevated
            style={{ alignItems: 'center', paddingVertical: 20, gap: 4 }}
          >
            <AppText variant="labelSmall" color={colors.textMuted}>
              Total Semua Dompet
            </AppText>
            {settings.hideBalance ? (
              <AppText variant="displayMedium" color={colors.textPrimary}>
                ••••••
              </AppText>
            ) : (
              <AppText variant="displayMedium" color={colors.textPrimary}>
                {formatCurrency(totalBalance, settings.baseCurrency)}
              </AppText>
            )}
          </AppCard>
        </Animated.View>

        {activeWallets.length === 0 ? (
          <EmptyState
            icon="wallet"
            title={AppLabels.emptyState.wallets.title}
            body={AppLabels.emptyState.wallets.body}
            action={
              <AppButton
                label="Buat Dompet Pertama"
                onPress={() => router.push('/(modals)/wallet-form')}
                icon="plus"
              />
            }
          />
        ) : (
          <View style={{ gap: 12 }}>
            {activeWallets.map((wallet, i) => {
              const balance = computeWalletBalance(wallet, txList);
              const sparkData = computeSparkline(wallet.id, txList, wallet.initialBalance, 7);
              return (
                <Animated.View
                  key={wallet.id}
                  entering={FadeInDown.duration(400).delay(i * 60)}
                >
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/(modals)/wallet-form',
                        params: { walletId: wallet.id },
                      })
                    }
                    style={{
                      backgroundColor: colors.bgCard,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      ...(shadows.sm as object),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: wallet.color + '22',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AppIcon name={wallet.icon} size={20} color={wallet.color} />
                        </View>
                        <View>
                          <AppText variant="bodyMedium" color={colors.textPrimary} style={{ fontFamily: 'DMSans-SemiBold' }}>
                            {wallet.name}
                          </AppText>
                          <AppText variant="labelSmall" color={colors.textMuted}>
                            {AppLabels.walletType[wallet.type as keyof typeof AppLabels.walletType] ?? wallet.type}
                          </AppText>
                        </View>
                      </View>
                      <SparklineChart
                        data={sparkData}
                        width={64}
                        height={28}
                        color={wallet.color}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      {settings.hideBalance ? (
                        <AppText variant="headingLarge" color={colors.textPrimary}>
                          ••••••
                        </AppText>
                      ) : (
                        <AppText variant="headingLarge" color={colors.textPrimary} adjustsFontSizeToFit numberOfLines={1} style={{ maxWidth: '70%' }}>
                          {formatCurrencyCompact(balance, wallet.currency)}
                        </AppText>
                      )}
                      <AppText variant="labelSmall" color={colors.textMuted}>
                        {wallet.currency}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        {archivedWallets.length > 0 && (
          <View style={{ gap: 8 }}>
            <AppText variant="labelSmall" color={colors.textMuted}>
              Terarsip ({archivedWallets.length})
            </AppText>
            {archivedWallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                onPress={() =>
                  router.push({
                    pathname: '/(modals)/wallet-form',
                    params: { walletId: wallet.id },
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: colors.bgCard,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: 0.5,
                }}
              >
                <AppIcon name={wallet.icon} size={20} color={wallet.color} />
                <AppText variant="bodyMedium" color={colors.textMuted} style={{ flex: 1 }}>
                  {wallet.name}
                </AppText>
                <AppText variant="labelSmall" color={colors.textMuted}>
                  Terarsip
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
