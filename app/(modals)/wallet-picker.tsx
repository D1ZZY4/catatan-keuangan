import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useWallets } from '../../src/shared/hooks/useWallets';
import { AppLabels } from '../../src/shared/config/labels';
import { formatCurrencyCompact } from '../../src/shared/utils/formatters';
import type { Wallet } from '../../src/shared/types';

export default function WalletPickerModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: walletList } = useWallets();

  function handleSelect(_wallet: Wallet): void {
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <AppIcon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          Pilih Dompet
        </AppText>
      </View>

      <FlatList
        data={walletList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="wallet"
            title={AppLabels.emptyState.wallets.title}
            body={AppLabels.emptyState.wallets.body}
          />
        }
        renderItem={({ item: wallet }) => (
          <TouchableOpacity
            onPress={() => handleSelect(wallet)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              gap: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: wallet.color + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name={wallet.icon} size={22} color={wallet.color} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                variant="bodyMedium"
                color={colors.textPrimary}
                style={{ fontFamily: 'DMSans-Medium' }}
              >
                {wallet.name}
              </AppText>
              <AppText variant="labelSmall" color={colors.textMuted}>
                {formatCurrencyCompact(wallet.initialBalance, wallet.currency)}
              </AppText>
            </View>
            <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
